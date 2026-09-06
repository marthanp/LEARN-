import { NextResponse } from "next/server";
import { getPaidPlan } from "@/lib/plans";
import { createPayment, validateProviderPhone, type PesaJetProvider } from "@/lib/payments/pesajet";
import { getAuthenticatedAccount } from "@/lib/payments/auth";
import { insertPaymentRecord, updatePaymentRecord } from "@/lib/payments/store";

const providers: PesaJetProvider[] = ["mtn", "airtel"];

export async function POST(request: Request) {
  try {
    const account = await getAuthenticatedAccount();
    if (!account) return NextResponse.json({ error: "You must be signed in to pay." }, { status: 401 });

    const body = (await request.json()) as { plan?: string; provider?: string; phoneNumber?: string };
    const plan = getPaidPlan(String(body.plan || ""));
    const provider = body.provider as PesaJetProvider;
    if (!plan) return NextResponse.json({ error: "Choose a valid paid subscription plan." }, { status: 400 });
    if (!providers.includes(provider)) return NextResponse.json({ error: "Choose MTN Mobile Money or Airtel Money." }, { status: 400 });
    if (typeof body.phoneNumber !== "string") return NextResponse.json({ error: "Enter your Uganda mobile money number." }, { status: 400 });

    const phoneNumber = validateProviderPhone(provider, body.phoneNumber);
    const reference = `LEARN-${plan.id.toUpperCase()}-${crypto.randomUUID()}`;

    // Store payment record in resilient store (Supabase if configured, or local persistent cache)
    await insertPaymentRecord({
      id: crypto.randomUUID(),
      user_id: account.userId,
      provider: "pesajet",
      reference,
      provider_transaction_id: null,
      plan: plan.id as "plus" | "pro",
      amount_ugx: plan.amountUgx,
      phone_number: phoneNumber,
      payment_method: provider,
      status: "pending",
      failure_reason: null,
      provider_payload: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    try {
      const transaction = await createPayment({
        amount: plan.amountUgx,
        phoneNumber,
        provider,
        reference,
        description: `LEARN+ ${plan.name} monthly subscription`,
        metadata: { userId: account.userId, plan: plan.id },
      });

      await updatePaymentRecord(reference, {
        provider_transaction_id: transaction.transactionId,
        status: transaction.status.toLowerCase() as "pending" | "processing" | "completed" | "failed" | "expired" | "cancelled",
        provider_payload: transaction,
      });

      return NextResponse.json({
        reference,
        transactionId: transaction.transactionId,
        status: transaction.status,
      });
    } catch (paymentError) {
      // In development sandbox, if PesaJet endpoint is unreachable or in test mode, allow simulated sandbox completion
      const isDev = process.env.NODE_ENV !== "production";
      const errMsg = paymentError instanceof Error ? paymentError.message : "Payment provider request failed";

      if (isDev && (errMsg.includes("PesaJet request failed") || errMsg.includes("fetch failed") || phoneNumber.endsWith("000000"))) {
        const mockTxId = `sim_tx_${Date.now()}`;
        await updatePaymentRecord(reference, {
          provider_transaction_id: mockTxId,
          status: "pending",
          provider_payload: { simulated: true, note: "Development sandbox simulation" },
        });

        return NextResponse.json({
          reference,
          transactionId: mockTxId,
          status: "PENDING",
        });
      }

      await updatePaymentRecord(reference, {
        status: "failed",
        failure_reason: errMsg,
      });

      throw new Error(errMsg);
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to start payment." },
      { status: 400 }
    );
  }
}
