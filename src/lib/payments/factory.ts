import type { IPaymentProvider } from "./interface";
import { paystackProvider } from "./paystack/provider";

export function getPaymentProvider(): IPaymentProvider {
  return paystackProvider;
}
