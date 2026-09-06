import { NextResponse } from "next/server";
import { getAuthenticatedAccount } from "@/lib/payments/auth";
import { getPayment, type PesaJetTransaction } from "@/lib/payments/pesajet";
import { settlePayment } from "@/lib/payments/settlement";
import { findPaymentRecord } from "@/lib/payments/store";

export async function GET(_request: Request, { params }: { params: Promise<{ reference: string }> }) {
  try {
    const account = await getAuthenticatedAccount();
    if (!account) return NextResponse.json({ error: "You must be signed in." }, { status: 401 });

    const { reference } = await params;
    const payment = await findPaymentRecord(reference);
    if (!payment || payment.user_id !== account.userId) {
      return NextResponse.json({ error: "Payment not found." }, { status: 404 });
    }

    if (
      payment.provider_transaction_id &&
      !["completed", "failed", "expired", "cancelled"].includes(payment.status)
    ) {
      // If dev sandbox simulation
      if (payment.provider_transaction_id.startsWith("sim_tx_")) {
        const simulatedTx: PesaJetTransaction = {
          transactionId: payment.provider_transaction_id,
          reference: payment.reference,
          status: "COMPLETED",
          amount: payment.amount_ugx,
          currency: "UGX",
          provider: payment.payment_method,
          phoneNumber: payment.phone_number,
        };
        const settled = await settlePayment(simulatedTx, reference);
        return NextResponse.json({
          reference,
          status: settled?.status || "completed",
          failureReason: null,
        });
      }

      // Live PesaJet check
      try {
        const transaction = await getPayment(payment.provider_transaction_id);
        const settled = await settlePayment(transaction, reference);
        return NextResponse.json({
          reference,
          status: settled?.status || transaction.status.toLowerCase(),
          failureReason: transaction.failureReason || null,
        });
      } catch (pollError) {
        return NextResponse.json({
          reference,
          status: payment.status,
          failureReason: pollError instanceof Error ? pollError.message : null,
        });
      }
    }

    return NextResponse.json({
      reference,
      status: payment.status,
      failureReason: payment.failure_reason,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to check payment status." },
      { status: 400 }
    );
  }
}
