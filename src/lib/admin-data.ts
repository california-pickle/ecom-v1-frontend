export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export const mockEmailTemplates: EmailTemplate[] = [
  {
    id: "EMAIL-001",
    name: "Order Confirmation",
    subject: "Your California Pickle order is confirmed! 🥒",
    body: `Hi {{customer_name}},

Thanks for your order! We're prepping your California Pickle juice and will have it out to you soon.

Order ID: {{order_id}}
Product: {{product}}
Total: {{amount}}

Stay hydrated and stay pickled.

— The California Pickle Team`,
  },
  {
    id: "EMAIL-002",
    name: "Shipping Update",
    subject: "Your order is on its way! 🚚",
    body: `Hi {{customer_name}},

Great news — your California Pickle order has shipped!

Order ID: {{order_id}}
Tracking: {{tracking_number}}
Estimated Delivery: {{delivery_date}}

Questions? Reply to this email anytime.

— The California Pickle Team`,
  },
];
