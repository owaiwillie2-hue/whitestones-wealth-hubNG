# Resend Email Integration

This document explains how to use the Resend API integration for sending various types of emails from your Whitestones Markets application.

## Overview

The email system uses **Supabase Edge Functions** integrated with the **Resend API** to send transactional and notification emails. All email functions are serverless and automatically scale.

## Prerequisites

1. **Resend API Key**: Already configured in Supabase secrets as `RESEND_API_KEY`
2. **Verified Domain**: Configure your sending domain in Resend dashboard (currently using `onboarding@resend.dev`)

## Available Email Functions

### 1. Verification Email (`send-verification-email`)

Sends welcome and email verification emails to new users.

**Endpoint**: `/functions/v1/send-verification-email`

**Request Body**:
```typescript
{
  email: string;
  fullName: string;
  verificationCode: string;
}
```

**Example Usage**:
```typescript
import { supabase } from '@/integrations/supabase/client';

const { data, error } = await supabase.functions.invoke('send-verification-email', {
  body: {
    email: 'user@example.com',
    fullName: 'John Doe',
    verificationCode: '123456'
  }
});
```

---

### 2. Password Reset Email (`send-password-reset`)

Sends password reset links to users.

**Endpoint**: `/functions/v1/send-password-reset`

**Request Body**:
```typescript
{
  email: string;
  resetLink: string;
  fullName?: string;
}
```

**Example Usage**:
```typescript
const { data, error } = await supabase.functions.invoke('send-password-reset', {
  body: {
    email: 'user@example.com',
    resetLink: 'https://yourapp.com/reset-password?token=abc123',
    fullName: 'John Doe'
  }
});
```

---

### 3. Transaction Confirmation (`send-transaction-confirmation`)

Sends confirmation emails for deposits, withdrawals, investments, and profit payouts.

**Endpoint**: `/functions/v1/send-transaction-confirmation`

**Request Body**:
```typescript
{
  email: string;
  fullName: string;
  transactionType: "deposit" | "withdrawal" | "investment" | "profit";
  amount: number;
  status: "pending" | "approved" | "rejected";
  transactionId: string;
  date: string;
}
```

**Example Usage**:
```typescript
const { data, error } = await supabase.functions.invoke('send-transaction-confirmation', {
  body: {
    email: 'user@example.com',
    fullName: 'John Doe',
    transactionType: 'deposit',
    amount: 5000,
    status: 'approved',
    transactionId: 'TXN-12345',
    date: new Date().toLocaleDateString()
  }
});
```

---

### 4. Billing Notifications (`send-billing-notification`)

Sends billing and subscription-related notifications.

**Endpoint**: `/functions/v1/send-billing-notification`

**Request Body**:
```typescript
{
  email: string;
  fullName: string;
  notificationType: "subscription" | "payment_failed" | "payment_success" | "plan_upgrade" | "plan_expiry";
  amount?: number;
  planName?: string;
  expiryDate?: string;
  invoiceId?: string;
}
```

**Example Usage**:
```typescript
const { data, error } = await supabase.functions.invoke('send-billing-notification', {
  body: {
    email: 'user@example.com',
    fullName: 'John Doe',
    notificationType: 'subscription',
    amount: 99.99,
    planName: 'Premium Plan',
    invoiceId: 'INV-12345'
  }
});
```

---

## Email Template Customization

All email templates are HTML-based with inline CSS for maximum compatibility. They feature:

- **Responsive design** that works on all devices
- **Brand colors** matching Whitestones Markets theme
- **Professional layout** with gradients and modern styling
- **Clear call-to-action buttons**
- **Transaction details** in formatted tables
- **Status indicators** with color coding

### Customizing Email Templates

To customize the email templates:

1. Navigate to the respective edge function in `supabase/functions/`
2. Modify the HTML template in the `html` parameter of `resend.emails.send()`
3. Test the changes using the Supabase Functions testing tools

---

## Folder Structure

```
supabase/functions/
├── send-verification-email/
│   └── index.ts
├── send-password-reset/
│   └── index.ts
├── send-transaction-confirmation/
│   └── index.ts
└── send-billing-notification/
    └── index.ts
```

---

## Error Handling

All email functions include comprehensive error handling:

```typescript
try {
  const emailResponse = await resend.emails.send({...});
  console.log("Email sent successfully:", emailResponse);
  return new Response(JSON.stringify(emailResponse), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
} catch (error: any) {
  console.error("Error sending email:", error);
  return new Response(JSON.stringify({ error: error.message }), {
    status: 500,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}
```

---

## CORS Configuration

All functions include proper CORS headers for browser access:

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
```

---

## Best Practices

1. **Always validate input** before sending emails
2. **Use meaningful subject lines** that clearly indicate the email purpose
3. **Include unsubscribe links** for marketing emails (not required for transactional)
4. **Log email sends** for debugging and audit purposes
5. **Handle errors gracefully** and provide user feedback
6. **Test emails** before deploying to production
7. **Monitor email delivery** using Resend dashboard
8. **Keep sensitive data secure** - never log passwords or tokens

---

## Monitoring & Debugging

### View Email Logs
- **Supabase Dashboard**: Check Edge Function logs at `https://supabase.com/dashboard/project/[PROJECT_ID]/logs`
- **Resend Dashboard**: View delivery status at `https://resend.com/emails`

### Common Issues

1. **Email not received**: Check spam folder and Resend delivery logs
2. **CORS errors**: Ensure corsHeaders are included in all responses
3. **Authentication errors**: Verify RESEND_API_KEY is correctly set
4. **Rate limiting**: Resend has rate limits; implement queuing for bulk sends

---

## Production Checklist

Before going to production:

- [ ] Verify custom domain in Resend dashboard
- [ ] Update `from` email addresses from `onboarding@resend.dev` to your domain
- [ ] Test all email types with real email addresses
- [ ] Set up email monitoring and alerts
- [ ] Configure proper error logging
- [ ] Review and comply with email regulations (CAN-SPAM, GDPR)
- [ ] Add email preferences/unsubscribe functionality
- [ ] Implement rate limiting for email sends
- [ ] Set up email templates version control

---

## Support

For issues with:
- **Resend API**: Check [Resend Documentation](https://resend.com/docs)
- **Supabase Edge Functions**: Check [Supabase Docs](https://supabase.com/docs/guides/functions)
- **Email delivery**: Contact Resend support at support@resend.com

---

## License & Credits

Email templates designed for Whitestones Markets.
Powered by [Resend](https://resend.com) and [Supabase](https://supabase.com).
