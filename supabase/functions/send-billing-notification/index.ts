import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BillingNotificationRequest {
  email: string;
  fullName: string;
  notificationType: "subscription" | "payment_failed" | "payment_success" | "plan_upgrade" | "plan_expiry";
  amount?: number;
  planName?: string;
  expiryDate?: string;
  invoiceId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      email, 
      fullName, 
      notificationType,
      amount,
      planName,
      expiryDate,
      invoiceId
    }: BillingNotificationRequest = await req.json();

    console.log("Sending billing notification email to:", email);

    const subjects = {
      subscription: "Subscription Confirmation - Whitestones Markets",
      payment_failed: "Payment Failed - Action Required",
      payment_success: "Payment Successful - Whitestones Markets",
      plan_upgrade: "Plan Upgraded Successfully",
      plan_expiry: "Plan Expiry Reminder - Whitestones Markets"
    };

    const emailResponse = await resend.emails.send({
      from: "Whitestones Markets <onboarding@resend.dev>",
      to: [email],
      subject: subjects[notificationType],
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Billing Notification</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Billing Notification</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #667eea; margin-top: 0;">Hello ${fullName}!</h2>
              
              ${notificationType === 'subscription' ? `
                <p>Thank you for subscribing to <strong>${planName}</strong>!</p>
                <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0; color: #155724;">
                    <strong>✓ Subscription Active:</strong> Your subscription is now active and ready to use.
                  </p>
                </div>
              ` : ''}
              
              ${notificationType === 'payment_failed' ? `
                <p>We were unable to process your payment for <strong>${planName}</strong>.</p>
                <div style="background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0; color: #721c24;">
                    <strong>⚠️ Action Required:</strong> Please update your payment information to continue using our services.
                  </p>
                </div>
              ` : ''}
              
              ${notificationType === 'payment_success' ? `
                <p>Your payment has been processed successfully!</p>
                <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0; color: #155724;">
                    <strong>✓ Payment Confirmed:</strong> Thank you for your payment.
                  </p>
                </div>
              ` : ''}
              
              ${notificationType === 'plan_upgrade' ? `
                <p>Congratulations! Your plan has been successfully upgraded to <strong>${planName}</strong>.</p>
                <div style="background: #d1ecf1; border-left: 4px solid #0c5460; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0; color: #0c5460;">
                    <strong>🎉 Upgrade Complete:</strong> Enjoy your new features and benefits!
                  </p>
                </div>
              ` : ''}
              
              ${notificationType === 'plan_expiry' ? `
                <p>Your <strong>${planName}</strong> plan will expire on ${expiryDate}.</p>
                <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0; color: #856404;">
                    <strong>⏰ Expiry Reminder:</strong> Renew your plan to continue enjoying uninterrupted service.
                  </p>
                </div>
              ` : ''}
              
              ${amount ? `
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <table style="width: 100%; border-collapse: collapse;">
                    ${planName ? `
                      <tr>
                        <td style="padding: 10px 0; color: #666;">Plan:</td>
                        <td style="padding: 10px 0; text-align: right; font-weight: bold;">${planName}</td>
                      </tr>
                    ` : ''}
                    <tr>
                      <td style="padding: 10px 0; color: #666;">Amount:</td>
                      <td style="padding: 10px 0; text-align: right; font-weight: bold; font-size: 20px; color: #667eea;">$${amount.toLocaleString()}</td>
                    </tr>
                    ${invoiceId ? `
                      <tr>
                        <td style="padding: 10px 0; color: #666;">Invoice ID:</td>
                        <td style="padding: 10px 0; text-align: right; font-family: monospace; font-size: 12px;">${invoiceId}</td>
                      </tr>
                    ` : ''}
                  </table>
                </div>
              ` : ''}
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="#" 
                   style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  ${notificationType === 'payment_failed' ? 'Update Payment Method' : 'View Billing Details'}
                </a>
              </div>
              
              <p style="color: #999; font-size: 12px; margin-top: 30px;">
                If you have any questions about your billing, please contact our support team.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>&copy; ${new Date().getFullYear()} Whitestones Markets. All rights reserved.</p>
              <p>
                <a href="#" style="color: #667eea; text-decoration: none; margin: 0 10px;">Privacy Policy</a> |
                <a href="#" style="color: #667eea; text-decoration: none; margin: 0 10px;">Terms of Service</a> |
                <a href="#" style="color: #667eea; text-decoration: none; margin: 0 10px;">Contact Support</a>
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Billing notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-billing-notification function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
