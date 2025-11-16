import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

interface CompleteInvestmentRequest {
  investment_id: string;
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { investment_id }: CompleteInvestmentRequest = await req.json();

    if (!investment_id) {
      return new Response(
        JSON.stringify({ error: "Missing investment_id" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get investment details
    const { data: investment, error: investmentError } = await supabase
      .from("investments")
      .select("*")
      .eq("id", investment_id)
      .single();

    if (investmentError || !investment) {
      return new Response(
        JSON.stringify({ error: "Investment not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    if (investment.status !== "active") {
      return new Response(
        JSON.stringify({ error: "Investment is not active" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const user_id = investment.user_id;
    const principal = parseFloat(investment.amount);
    const profit = parseFloat(investment.expected_profit);
    const totalReturn = principal + profit;

    // Get current investment balance (should be the principal)
    const { data: balances } = await supabase
      .from("account_balances")
      .select("investment_balance, main_balance")
      .eq("user_id", user_id)
      .single();

    if (!balances) {
      return new Response(
        JSON.stringify({ error: "User balances not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const currentInvestmentBalance = parseFloat(balances.investment_balance || "0");
    const currentMainBalance = parseFloat(balances.main_balance || "0");

    // Deduct from investment wallet, add to main wallet
    const newInvestmentBalance = Math.max(0, currentInvestmentBalance - principal);
    const newMainBalance = currentMainBalance + totalReturn;

    // Update balances
    await supabase
      .from("account_balances")
      .update({
        investment_balance: newInvestmentBalance,
        main_balance: newMainBalance,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user_id);

    // Mark investment as completed
    await supabase
      .from("investments")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", investment_id);

    // Log profit transaction
    await supabase.from("transactions").insert({
      user_id,
      type: "profit",
      amount: profit,
      balance_after: newMainBalance,
      description: `Investment profit (${((profit / principal) * 100).toFixed(1)}%)`,
      reference_id: investment_id,
    });

    // Log return of principal transaction
    await supabase.from("transactions").insert({
      user_id,
      type: "profit",
      amount: principal,
      balance_after: newMainBalance,
      description: `Investment principal returned`,
      reference_id: investment_id,
    });

    // Send notification
    await supabase.from("notifications").insert({
      user_id,
      title: "Investment Completed!",
      message: `Your investment has matured. Principal ($${principal.toFixed(2)}) + Profit ($${profit.toFixed(2)}) = $${totalReturn.toFixed(2)} has been returned to your Main wallet.`,
      category: "investment_updates",
    });

    return new Response(
      JSON.stringify({
        success: true,
        investment_id,
        principal,
        profit,
        total_returned: totalReturn,
        new_main_balance: newMainBalance,
        message: "Investment completed successfully",
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
