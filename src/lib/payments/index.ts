import { PaymentProvider } from "./PaymentProvider";
import { CashfreeProvider } from "./CashfreeProvider";
import { PaypalProvider } from "./PaypalProvider";

export * from "./PaymentProvider";

const providers: Record<"cashfree" | "paypal", PaymentProvider> = {
  cashfree: new CashfreeProvider(),
  paypal: new PaypalProvider(),
};

export function getPaymentProvider(name: "cashfree" | "paypal"): PaymentProvider {
  const provider = providers[name];
  if (!provider) throw new Error(`Unknown payment provider: ${name}`);
  return provider;
}
