export type InitializePaymentParams = {
  amount: number;
  email: string;
  reference: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
};

export type PaymentInitResult = {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
};

export type PaymentVerifyResult = {
  status: "success" | "failed" | "pending";
  reference: string;
  amount: number;
  currency: string;
};

export type WebhookResult =
  | { valid: true; event: string; reference: string; status: "success" | "failed"; amount: number }
  | { valid: false };

export interface IPaymentProvider {
  initializePayment(params: InitializePaymentParams): Promise<PaymentInitResult>;
  verifyPayment(reference: string): Promise<PaymentVerifyResult>;
  handleWebhook(rawBody: string, signature: string | null): Promise<WebhookResult>;
}
