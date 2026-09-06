import "server-only";

const PESAJET_BASE_URL = (process.env.PESAJET_BASE_URL || "https://payments.pesajet.com/api/v1").replace(/\/$/, "");

export type PesaJetProvider = "mtn" | "airtel";
export type PesaJetStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "EXPIRED" | "CANCELLED";

export interface PesaJetTransaction {
  transactionId: string;
  providerReference?: string;
  amount: number;
  currency: string;
  status: PesaJetStatus;
  provider: PesaJetProvider;
  phoneNumber: string;
  reference: string;
  failureReason?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

function getApiKey() {
  const apiKey = process.env.PESAJET_API_KEY?.trim();
  if (!apiKey) throw new Error("PESAJET_API_KEY is not configured.");
  return apiKey;
}

async function request<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(`${PESAJET_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": getApiKey(),
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
  const text = await response.text();
  let data: T | { message?: string; error?: string };
  try {
    data = JSON.parse(text) as T;
  } catch {
    data = { message: text };
  }
  if (!response.ok) {
    const failure = data as { message?: string; error?: string };
    throw new Error(failure.message || failure.error || `PesaJet request failed (${response.status}).`);
  }
  return data as T;
}

export function normalizeUgandaPhone(phone: string) {
  const compact = phone.replace(/[\s-]/g, "");
  const normalized = compact.startsWith("0") ? `+256${compact.slice(1)}` : compact.startsWith("256") ? `+${compact}` : compact;
  if (!/^\+2567\d{8}$/.test(normalized)) throw new Error("Enter a valid Uganda mobile number, for example 0771234567.");
  return normalized;
}

export function validateProviderPhone(provider: PesaJetProvider, phone: string) {
  const normalized = normalizeUgandaPhone(phone);
  void provider;
  return normalized;
}

export function createPayment(params: {
  amount: number;
  phoneNumber: string;
  provider: PesaJetProvider;
  reference: string;
  description: string;
  metadata: Record<string, unknown>;
}) {
  return request<PesaJetTransaction>("/payments", {
    method: "POST",
    headers: { "Idempotency-Key": params.reference },
    body: JSON.stringify({
      type: "COLLECTION",
      amount: params.amount,
      currency: "UGX",
      phoneNumber: params.phoneNumber,
      provider: params.provider,
      reference: params.reference,
      description: params.description,
      metadata: params.metadata,
    }),
  });
}

export function getPayment(transactionId: string) {
  return request<PesaJetTransaction>(`/payments/${encodeURIComponent(transactionId)}`);
}
