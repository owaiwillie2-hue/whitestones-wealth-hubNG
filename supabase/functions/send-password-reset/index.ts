import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  resetLink: string;
  fullName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, resetLink, fullName }: PasswordResetRequest = await req.json();

    console.log("Sending password reset email to:", email);

    const emailResponse = await resend.emails.send({
      from: "Whitestones Markets <onboarding@resend.dev>",
      to: [email],
      subject: "Reset Your Whitestones Markets Password",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset Request</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #667eea; margin-top: 0;">Hello${fullName ? ' ' + fullName : ''}!</h2>
              
              <p>We received a request to reset the password for your Whitestones Markets account.</p>
              
              <p>Click the button below to reset your password:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" 
                   style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                  Reset Password
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
              <p style="background: white; padding: 15px; border-radius: 5px; word-break: break-all; font-size: 12px; color: #667eea;">
                ${resetLink}
              </p>
              
              <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #856404; font-size: 14px;">
                  <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour for your security.
                </p>
              </div>
              
              <p style="color: #999; font-size: 12px; margin-top: 30px;">
                If you didn't request a password reset, please ignore this email or contact our support team if you have concerns about your account security.
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

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
