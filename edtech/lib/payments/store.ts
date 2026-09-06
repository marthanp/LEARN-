import "server-only";

import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import fs from "node:fs";
import path from "node:path";

export interface StoredPayment {
  id: string;
  user_id: string;
  provider: "pesajet";
  reference: string;
  provider_transaction_id: string | null;
  plan: "plus" | "pro";
  amount_ugx: number;
  phone_number: string;
  payment_method: "mtn" | "airtel";
  status: "pending" | "processing" | "completed" | "failed" | "expired" | "cancelled";
  failure_reason: string | null;
  provider_payload: unknown;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
}

// In-memory fallback map for active dev server sessions
const globalPayments = globalThis as unknown as { __learnPaymentsCache?: Map<string, StoredPayment> };
if (!globalPayments.__learnPaymentsCache) {
  globalPayments.__learnPaymentsCache = new Map<string, StoredPayment>();
}
const memoryCache = globalPayments.__learnPaymentsCache;

function getFallbackFile(): string {
  return path.join(process.cwd(), ".next", "payments-cache.json");
}

function persistFallback(record: StoredPayment) {
  memoryCache.set(record.reference, record);
  if (record.provider_transaction_id) {
    memoryCache.set(record.provider_transaction_id, record);
  }
  try {
    const filePath = getFallbackFile();
    const data = Object.fromEntries(memoryCache.entries());
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // Memory cache remains active if file write fails
  }
}

function loadFallbackRecord(key: string): StoredPayment | null {
  if (memoryCache.has(key)) return memoryCache.get(key) || null;
  try {
    const filePath = getFallbackFile();
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8")) as Record<string, StoredPayment>;
      Object.entries(data).forEach(([k, v]) => memoryCache.set(k, v));
      return memoryCache.get(key) || null;
    }
  } catch {
    // ignore read error
  }
  return null;
}

export async function insertPaymentRecord(record: StoredPayment): Promise<StoredPayment> {
  if (isSupabaseAdminConfigured()) {
    try {
      const db = createAdminClient();
      if (db) {
        const { error } = await db.from("subscription_payments").insert({
          id: record.id,
          user_id: record.user_id,
          provider: record.provider,
          reference: record.reference,
          provider_transaction_id: record.provider_transaction_id,
          plan: record.plan,
          amount_ugx: record.amount_ugx,
          phone_number: record.phone_number,
          payment_method: record.payment_method,
          status: record.status,
          failure_reason: record.failure_reason,
          provider_payload: record.provider_payload as never,
        });
        if (!error) return record;
      }
    } catch {
      // Fallback to local persistent cache if database insert fails
    }
  }

  persistFallback(record);
  return record;
}

export async function findPaymentRecord(referenceOrId: string): Promise<StoredPayment | null> {
  if (isSupabaseAdminConfigured()) {
    try {
      const db = createAdminClient();
      if (db) {
        const { data, error } = await db
          .from("subscription_payments")
          .select("*")
          .or(`reference.eq.${referenceOrId},provider_transaction_id.eq.${referenceOrId}`)
          .maybeSingle();
        if (!error && data) return data as StoredPayment;
      }
    } catch {
      // Fallback
    }
  }

  return loadFallbackRecord(referenceOrId);
}

export async function updatePaymentRecord(
  reference: string,
  updates: Partial<StoredPayment>
): Promise<StoredPayment | null> {
  const existing = await findPaymentRecord(reference);
  const merged: StoredPayment = {
    ...(existing || {
      id: crypto.randomUUID(),
      user_id: "",
      provider: "pesajet",
      reference,
      provider_transaction_id: null,
      plan: "plus",
      amount_ugx: 37000,
      phone_number: "",
      payment_method: "mtn",
      status: "pending",
      failure_reason: null,
      provider_payload: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }),
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseAdminConfigured()) {
    try {
      const db = createAdminClient();
      if (db) {
        await db
          .from("subscription_payments")
          .update({
            provider_transaction_id: merged.provider_transaction_id,
            status: merged.status,
            failure_reason: merged.failure_reason,
            provider_payload: merged.provider_payload as never,
            ...(merged.completed_at ? { completed_at: merged.completed_at } : {}),
          })
          .eq("reference", reference);
      }
    } catch {
      // Fallback
    }
  }

  persistFallback(merged);
  return merged;
}
