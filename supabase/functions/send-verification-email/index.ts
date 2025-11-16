import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  email: string;
  fullName: string;
  verificationCode: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, verificationCode }: VerificationEmailRequest = await req.json();

    console.log("Sending verification email to:", email);

    const emailResponse = await resend.emails.send({
      from: "Whitestones Markets <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to Whitestones Markets - Verify Your Email",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Whitestones Markets</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #667eea; margin-top: 0;">Hello ${fullName}!</h2>
              
              <p>Thank you for joining Whitestones Markets. To complete your registration and start your investment journey, please verify your email address.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border-left: 4px solid #667eea;">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Your Verification Code:</p>
                <p style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; margin: 0;">${verificationCode}</p>
              </div>
              
              <p style="color: #666; font-size: 14px;">This code will expire in 24 hours for security reasons.</p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                <h3 style="color: #667eea; font-size: 18px;">What's Next?</h3>
                <ul style="color: #666;">
                  <li>Complete your KYC verification</li>
                  <li>Make your first deposit</li>
                  <li>Choose from our investment plans</li>
                  <li>Start earning returns</li>
                </ul>
              </div>
              
              <p style="color: #999; font-size: 12px; margin-top: 30px;">
                If you didn't create an account with Whitestones Markets, please ignore this email or contact our support team.
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

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-verification-email function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
