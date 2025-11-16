import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TransactionConfirmationRequest {
  email: string;
  fullName: string;
  transactionType: "deposit" | "withdrawal" | "investment" | "profit";
  amount: number;
  status: "pending" | "approved" | "rejected";
  transactionId: string;
  date: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      email, 
      fullName, 
      transactionType, 
      amount, 
      status, 
      transactionId, 
      date 
    }: TransactionConfirmationRequest = await req.json();

    console.log("Sending transaction confirmation email to:", email);

    const statusColors = {
      pending: "#ffc107",
      approved: "#28a745",
      rejected: "#dc3545"
    };

    const statusLabels = {
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected"
    };

    const typeLabels = {
      deposit: "Deposit",
      withdrawal: "Withdrawal",
      investment: "Investment",
      profit: "Profit Payout"
    };

    const emailResponse = await resend.emails.send({
      from: "Whitestones Markets <onboarding@resend.dev>",
      to: [email],
      subject: `${typeLabels[transactionType]} ${statusLabels[status]} - Whitestones Markets`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Transaction Confirmation</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Transaction Confirmation</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #667eea; margin-top: 0;">Hello ${fullName}!</h2>
              
              <p>Your ${transactionType} transaction has been ${status === 'pending' ? 'received and is being processed' : status}.</p>
              
              <div style="background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusColors[status]};">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; color: #666; font-size: 14px;">Transaction Type:</td>
                    <td style="padding: 10px 0; text-align: right; font-weight: bold;">${typeLabels[transactionType]}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #666; font-size: 14px;">Amount:</td>
                    <td style="padding: 10px 0; text-align: right; font-weight: bold; font-size: 20px; color: #667eea;">$${amount.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #666; font-size: 14px;">Status:</td>
                    <td style="padding: 10px 0; text-align: right;">
                      <span style="padding: 5px 15px; background: ${statusColors[status]}; color: white; border-radius: 20px; font-size: 12px; font-weight: bold;">
                        ${statusLabels[status]}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #666; font-size: 14px;">Transaction ID:</td>
                    <td style="padding: 10px 0; text-align: right; font-family: monospace; font-size: 12px;">${transactionId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #666; font-size: 14px;">Date:</td>
                    <td style="padding: 10px 0; text-align: right;">${date}</td>
                  </tr>
                </table>
              </div>
              
              ${status === 'pending' ? `
                <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0; color: #856404; font-size: 14px;">
                    <strong>⏳ Processing:</strong> Your transaction is being reviewed and will be processed within 24-72 hours.
                  </p>
                </div>
              ` : ''}
              
              ${status === 'approved' ? `
                <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0; color: #155724; font-size: 14px;">
                    <strong>✓ Completed:</strong> Your transaction has been successfully processed.
                  </p>
                </div>
              ` : ''}
              
              ${status === 'rejected' ? `
                <div style="background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0; color: #721c24; font-size: 14px;">
                    <strong>✗ Rejected:</strong> Please contact our support team for more information.
                  </p>
                </div>
              ` : ''}
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="#" 
                   style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  View Transaction Details
                </a>
              </div>
              
              <p style="color: #999; font-size: 12px; margin-top: 30px;">
                If you have any questions about this transaction, please contact our support team.
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

    console.log("Transaction confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-transaction-confirmation function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
