import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

interface TransferRequest {
  user_id: string;
  from_wallet: "main" | "investment";
  to_wallet: "main" | "investment";
  amount: number;
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { user_id, from_wallet, to_wallet, amount }: TransferRequest =
      await req.json();

    if (!user_id || !from_wallet || !to_wallet || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid transfer parameters" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Business rule: only Main -> Investment allowed
    if (from_wallet !== "main" || to_wallet !== "investment") {
      return new Response(
        JSON.stringify({
          error: "Only transfers from Main to Investment wallet are allowed",
        }),
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

    if (currentMainBalance < amount) {
      return new Response(
        JSON.stringify({ error: "Insufficient balance in main wallet" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const newMainBalance = currentMainBalance - amount;
    const newInvestmentBalance =
      parseFloat(balances.investment_balance || "0") + amount;

    // Update balances
    const { error: updateError } = await supabase
      .from("account_balances")
      .update({
        main_balance: newMainBalance,
        investment_balance: newInvestmentBalance,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user_id);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: `Failed to update balances: ${updateError}` }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Log transfer
    const { data: transfer, error: transferError } = await supabase
      .from("wallet_transfers")
      .insert({
        user_id,
        from_wallet,
        to_wallet,
        amount,
        status: "approved",
        processed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (transferError) {
      return new Response(
        JSON.stringify({ error: `Failed to log transfer: ${transferError}` }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Log transaction
    await supabase.from("transactions").insert({
      user_id,
      type: "transfer",
      amount,
      balance_after: newMainBalance,
      description: `Transfer from ${from_wallet} to ${to_wallet} wallet`,
      reference_id: transfer.id,
    });

    return new Response(
      JSON.stringify({
        success: true,
        transfer_id: transfer.id,
        from_wallet,
        to_wallet,
        amount,
        new_main_balance: newMainBalance,
        new_investment_balance: newInvestmentBalance,
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
