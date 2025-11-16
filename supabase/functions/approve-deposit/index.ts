import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

interface ApproveDepositRequest {
  deposit_id: string;
  approved_by: string;
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { deposit_id, approved_by }: ApproveDepositRequest = await req.json();

    if (!deposit_id || !approved_by) {
      return new Response(
        JSON.stringify({ error: "Missing deposit_id or approved_by" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get deposit details
    const { data: deposit, error: depositError } = await supabase
      .from("deposits")
      .select("*")
      .eq("id", deposit_id)
      .single();

    if (depositError || !deposit) {
      return new Response(
        JSON.stringify({ error: "Deposit not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    if (deposit.status !== "pending") {
      return new Response(
        JSON.stringify({ error: "Deposit is not pending" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const user_id = deposit.user_id;
    const deposit_amount = parseFloat(deposit.amount);

    // Check if this is the user's first ever deposit
    const { data: transactionCount } = await supabase
      .from("transactions")
      .select("id", { count: "exact" })
      .eq("user_id", user_id)
      .eq("type", "deposit");

    const isFirstDeposit = !transactionCount || transactionCount.length === 0;

    // Calculate bonus (10% of first deposit)
    const bonusPercent = isFirstDeposit
      ? parseFloat(
          (
            await supabase
              .from("website_settings")
              .select("value")
              .eq("key", "first_deposit_bonus_percent")
              .single()
          ).data?.value || "10"
        )
      : 0;

    const bonus = isFirstDeposit ? (deposit_amount * bonusPercent) / 100 : 0;
    const totalCredit = deposit_amount + bonus;

    // Update account balance
    const { error: balanceError } = await supabase
      .from("account_balances")
      .update({
        main_balance: deposit_amount + (bonus || 0),
        total_deposited: deposit_amount,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user_id)
      .select();

    if (balanceError) {
      return new Response(
        JSON.stringify({ error: `Failed to update balance: ${balanceError}` }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Mark deposit as approved
    const { error: updateError } = await supabase
      .from("deposits")
      .update({
        status: "approved",
        approved_by,
        approved_at: new Date().toISOString(),
      })
      .eq("id", deposit_id);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: `Failed to approve deposit: ${updateError}` }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Log deposit transaction
    await supabase.from("transactions").insert({
      user_id,
      type: "deposit",
      amount: deposit_amount,
      balance_after: totalCredit,
      description: `Deposit approved`,
      reference_id: deposit_id,
    });

    // Log bonus transaction if applicable
    if (bonus > 0) {
      await supabase.from("transactions").insert({
        user_id,
        type: "bonus",
        amount: bonus,
        balance_after: totalCredit,
        description: `First deposit bonus (${bonusPercent}%)`,
        reference_id: deposit_id,
      });

      // Create notification for bonus
      await supabase.from("notifications").insert({
        user_id,
        title: "Deposit Approved + Bonus!",
        message: `Your deposit of $${deposit_amount} has been approved. You received a ${bonusPercent}% bonus of $${bonus.toFixed(2)}!`,
        category: "payment_updates",
      });
    } else {
      // Create notification without bonus
      await supabase.from("notifications").insert({
        user_id,
        title: "Deposit Approved",
        message: `Your deposit of $${deposit_amount} has been approved.`,
        category: "payment_updates",
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        deposit_id,
        amount_credited: totalCredit,
        bonus: bonus,
        message: isFirstDeposit ? "First deposit approved with bonus!" : "Deposit approved",
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
