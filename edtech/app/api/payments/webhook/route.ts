import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { settlePayment } from "@/lib/payments/settlement";
import type { PesaJetTransaction } from "@/lib/payments/pesajet";

function validSignature(rawBody: string, signature: string | null) {
  const secret = process.env.PESAJET_WEBHOOK_SECRET?.trim();
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const received = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  return received.length === expectedBuffer.length && timingSafeEqual(received, expectedBuffer);
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!validSignature(rawBody, request.headers.get("x-webhook-signature"))) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  try {
    const payload = JSON.parse(rawBody) as PesaJetTransaction & { event?: string; timestamp?: string };
    if (!payload.transactionId || !payload.reference || !payload.status || payload.currency !== "UGX") {
      return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
    }
    await settlePayment(payload, payload.reference);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[PesaJet webhook]", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
