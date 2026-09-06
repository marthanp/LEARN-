import "server-only";

import { findPaymentRecord, updatePaymentRecord, type StoredPayment } from "@/lib/payments/store";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { updateClerkSubscription } from "@/lib/payments/auth";
import type { PesaJetStatus, PesaJetTransaction } from "@/lib/payments/pesajet";

const terminalStatuses = new Set(["COMPLETED", "FAILED", "EXPIRED", "CANCELLED"]);

export async function settlePayment(transaction: PesaJetTransaction, reference?: string) {
  const searchKey = reference || transaction.reference || transaction.transactionId;
  const payment = await findPaymentRecord(searchKey);
  if (!payment) return null;

  const status = transaction.status.toLowerCase() as
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "expired"
    | "cancelled";

  const updates: Partial<StoredPayment> = {
    provider_transaction_id: transaction.transactionId,
    status,
    failure_reason: transaction.failureReason || null,
    provider_payload: transaction,
    ...(status === "completed" ? { completed_at: new Date().toISOString() } : {}),
  };

  const updatedRecord = await updatePaymentRecord(payment.reference, updates);

  if (transaction.status === "COMPLETED" && payment.status !== "completed") {
    // 1. Update Supabase profile if Supabase is configured
    if (isSupabaseAdminConfigured()) {
      try {
        const db = createAdminClient();
        if (db) {
          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + 1);
          await db
            .from("profiles")
            .update({
              subscription_tier: payment.plan,
              subscription_status: "active",
              subscription_expires_at: expiresAt.toISOString(),
            })
            .eq("id", payment.user_id);
        }
      } catch {
        // Continue to Clerk update
      }
    }

    // 2. Always update Clerk user metadata
    await updateClerkSubscription(payment.user_id, payment.plan as "plus" | "pro");
  }

  return updatedRecord;
}

export function isTerminalStatus(status: PesaJetStatus) {
  return terminalStatuses.has(status);
}
