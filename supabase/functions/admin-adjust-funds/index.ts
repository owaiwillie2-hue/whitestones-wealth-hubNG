import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

interface AdminAdjustFundsRequest {
  user_id: string;
  admin_id: string;
  wallet: "main" | "investment";
  amount: number; // positive = add, negative = remove
  reason: string;
  notes?: string;
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const {
      user_id,
      admin_id,
      wallet,
      amount,
      reason,
      notes,
    }: AdminAdjustFundsRequest = await req.json();

    if (!user_id || !admin_id || !wallet || amount === undefined || !reason) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verify admin role (frontend should check, backend verifies)
    const { data: adminRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", admin_id)
      .eq("role", "admin")
      .single();

    if (!adminRole) {
      return new Response(
        JSON.stringify({ error: "Admin authorization required" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get current balances
    const { data: balances } = await supabase
      .from("account_balances")
      .select("main_balance, investment_balance")
      .eq("user_id", user_id)
      .single();

    if (!balances) {
      return new Response(
        JSON.stringify({ error: "User balances not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const currentMainBalance = parseFloat(balances.main_balance || "0");
    const currentInvestmentBalance = parseFloat(balances.investment_balance || "0");

    // Calculate new balances
    let newMainBalance = currentMainBalance;
    let newInvestmentBalance = currentInvestmentBalance;

    if (wallet === "main") {
      newMainBalance = Math.max(0, currentMainBalance + amount);
    } else if (wallet === "investment") {
      newInvestmentBalance = Math.max(0, currentInvestmentBalance + amount);
    }

    // Prevent negative balances
    if (newMainBalance < 0 || newInvestmentBalance < 0) {
      return new Response(
        JSON.stringify({ error: "Adjustment would result in negative balance" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Update balances
    await supabase
      .from("account_balances")
      .update({
        main_balance: newMainBalance,
        investment_balance: newInvestmentBalance,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user_id);

    // Log transaction
    const balanceAfter = wallet === "main" ? newMainBalance : newInvestmentBalance;
    await supabase.from("transactions").insert({
      user_id,
      type: "bonus",
      amount: Math.abs(amount),
      balance_after: balanceAfter,
      description: `Admin adjustment: ${reason} (${amount > 0 ? "+" : ""}${amount})`,
    });

    // Create admin note
    await supabase.from("admin_notes").insert({
      admin_id,
      user_id,
      note: `Adjusted ${wallet} wallet by $${Math.abs(amount).toFixed(2)}. Reason: ${reason}`,
      metadata: {
        amount,
        wallet,
        reason,
        admin_notes: notes,
        timestamp: new Date().toISOString(),
      },
    });

    // Send notification to user
    await supabase.from("notifications").insert({
      user_id,
      title: "Account Adjustment",
      message: `Your ${wallet} wallet has been adjusted by $${Math.abs(amount).toFixed(2)}. Reason: ${reason}`,
      category: "general",
    });

    return new Response(
      JSON.stringify({
        success: true,
        user_id,
        wallet,
        amount_adjusted: amount,
        previous_balance: wallet === "main" ? currentMainBalance : currentInvestmentBalance,
        new_balance: balanceAfter,
        reason,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
