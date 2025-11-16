# Whitestones Wealth Hub - Edge Functions API Reference

## Overview
All edge functions are deployed to Supabase and require authentication via JWT token in the Authorization header.

### Base URL
```
https://your-supabase-url.supabase.co/functions/v1/
```

### Authentication Header
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

---

## 1. Approve Deposit

**Endpoint:** `POST /approve-deposit`

**Purpose:** Admin approves a pending deposit and credits funds with automatic first-deposit bonus if applicable.

**Request Body:**
```json
{
  "deposit_id": "uuid",
  "approved_by": "admin_user_id_uuid"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "deposit_id": "uuid",
  "amount_credited": 110.00,
  "bonus": 10.00,
  "message": "First deposit approved with bonus!"
}
```

**Error Responses:**
- `400`: Missing deposit_id or approved_by
- `404`: Deposit not found
- `400`: Deposit is not pending status
- `500`: Database update failed

**Side Effects:**
- ✅ Updates kyc_documents status to 'approved'
- ✅ Credits main_balance (deposit + bonus)
- ✅ Logs deposit transaction
- ✅ Logs bonus transaction (if first deposit)
- ✅ Creates notification for user
- ✅ Updates total_deposited

**Example Usage:**
```typescript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/approve-deposit`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      deposit_id: 'abc-123-def',
      approved_by: 'admin-uuid-456'
    })
  }
);
```

---

## 2. Approve KYC

**Endpoint:** `POST /approve-kyc`

**Purpose:** Admin approves KYC verification and credits configurable KYC approval bonus if set.

**Request Body:**
```json
{
  "user_id": "uuid",
  "approved_by": "admin_user_id_uuid"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "user_id": "uuid",
  "kyc_status": "approved",
  "bonus_credited": 25.00,
  "message": "KYC approved successfully"
}
```

**Error Responses:**
- `400`: Missing user_id or approved_by
- `400`: KYC bonus already applied to this user
- `500`: Failed to update KYC or balance

**Side Effects:**
- ✅ Updates kyc_documents status to 'approved'
- ✅ Sets reviewed_at and reviewed_by timestamps
- ✅ Credits main_balance (if bonus > 0)
- ✅ Logs bonus transaction
- ✅ Creates notification for user
- ✅ Checks for duplicate bonus (prevents double-credit)

**Configuration:**
- Bonus amount set in `website_settings` table, key: `kyc_approval_bonus_amount`
- Default: $0 (can be changed by admin)

---

## 3. Wallet Transfer

**Endpoint:** `POST /wallet-transfer`

**Purpose:** Transfer funds from Main wallet to Investment wallet (only allowed direction).

**Request Body:**
```json
{
  "user_id": "uuid",
  "from_wallet": "main",
  "to_wallet": "investment",
  "amount": 500.00
}
```

**Success Response (200):**
```json
{
  "success": true,
  "transfer_id": "uuid",
  "from_wallet": "main",
  "to_wallet": "investment",
  "amount": 500.00,
  "new_main_balance": 1500.00,
  "new_investment_balance": 500.00
}
```

**Error Responses:**
- `400`: Invalid transfer parameters (negative amount, etc.)
- `403`: Only Main → Investment transfers allowed
- `404`: User balances not found
- `400`: Insufficient balance in main wallet
- `500`: Failed to update balances or log transfer

**Side Effects:**
- ✅ Updates account_balances (both wallets)
- ✅ Creates wallet_transfer record with status 'approved'
- ✅ Logs transfer transaction
- ✅ Prevents negative balances

**Business Rules:**
- ⛔ Investment → Main transfers blocked
- ⛔ Main → Profit transfers blocked
- ✅ Validates sufficient balance before proceeding

---

## 4. Complete Investment

**Endpoint:** `POST /complete-investment`

**Purpose:** Auto-return principal + profit to Main wallet when investment matures.

**Request Body:**
```json
{
  "investment_id": "uuid"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "investment_id": "uuid",
  "principal": 1000.00,
  "profit": 100.00,
  "total_returned": 1100.00,
  "new_main_balance": 2100.00,
  "message": "Investment completed successfully"
}
```

**Error Responses:**
- `400`: Missing investment_id
- `404`: Investment not found
- `400`: Investment is not active status
- `404`: User balances not found
- `500`: Failed to update investment or balances

**Side Effects:**
- ✅ Deducts principal from investment_balance
- ✅ Adds (principal + profit) to main_balance
- ✅ Updates investment status to 'completed'
- ✅ Sets completed_at timestamp
- ✅ Logs profit transaction
- ✅ Logs principal return transaction
- ✅ Creates notification for user

**Usage Note:**
- Called by cron job or scheduler when investment end_date is reached
- Example cron interval: Every minute or hour to check mature investments

---

## 5. Admin Adjust Funds

**Endpoint:** `POST /admin-adjust-funds`

**Purpose:** Admin manually add or remove funds from user wallet with full audit trail.

**Request Body:**
```json
{
  "user_id": "uuid",
  "admin_id": "admin_user_id_uuid",
  "wallet": "main",
  "amount": 50.00,
  "reason": "KYC Approval Bonus",
  "notes": "Optional admin internal notes"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "user_id": "uuid",
  "wallet": "main",
  "amount_adjusted": 50.00,
  "previous_balance": 1000.00,
  "new_balance": 1050.00,
  "reason": "KYC Approval Bonus"
}
```

**Error Responses:**
- `400`: Missing required fields
- `403`: Admin authorization required (non-admin user)
- `404`: User balances not found
- `400`: Adjustment would result in negative balance
- `500`: Failed to update balances or log

**Side Effects:**
- ✅ Updates specified wallet (main or investment)
- ✅ Logs transaction with reason
- ✅ Creates admin_notes record with full metadata
- ✅ Sends notification to user
- ✅ Prevents negative balances
- ✅ Verifies admin role

**Use Cases:**
- Bonuses (first deposit, KYC approval, referral)
- Compensation for errors
- Manual corrections
- Promotional credits

**Audit Trail:**
- `transactions` table: records the adjustment
- `admin_notes` table: stores reason and admin notes with timestamp

---

## Error Handling

### Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check request body format and required fields |
| 403 | Forbidden | Verify admin role or user authentication |
| 404 | Not Found | Verify IDs exist in database |
| 405 | Method Not Allowed | Use POST method only |
| 500 | Server Error | Check Supabase logs; may be DB constraint violation |

### Error Response Format
```json
{
  "error": "Error message describing what went wrong"
}
```

---

## Rate Limiting

Supabase Edge Functions default limits:
- **Requests per minute:** 1000 per project
- **Concurrent:** 50 per region
- **Timeout:** 60 seconds

If hit, response: `429 Too Many Requests`

---

## Testing with cURL

### Approve Deposit
```bash
curl -X POST https://your-project.supabase.co/functions/v1/approve-deposit \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deposit_id": "abc123",
    "approved_by": "admin-uuid"
  }'
```

### Wallet Transfer
```bash
curl -X POST https://your-project.supabase.co/functions/v1/wallet-transfer \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-uuid",
    "from_wallet": "main",
    "to_wallet": "investment",
    "amount": 500
  }'
```

### Admin Adjust Funds
```bash
curl -X POST https://your-project.supabase.co/functions/v1/admin-adjust-funds \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-uuid",
    "admin_id": "admin-uuid",
    "wallet": "main",
    "amount": 100,
    "reason": "Manual correction"
  }'
```

---

## Webhook Integration (Optional)

Consider implementing webhooks for:
- Investment completion (auto-trigger `complete-investment`)
- Deposit notifications
- KYC status changes

Supabase Realtime provides this via subscriptions.

---

## Idempotency & Safety

**Idempotent Operations:**
- Wallet transfers: Multiple calls with same ID won't double-deduct
- KYC approval: Bonus only applied once (checked in function)

**Non-Idempotent:**
- Deposit approval: Calling twice will create duplicate transactions
- Admin fund adjustments: Each call adjusts funds again

**Safety Measures:**
- Check transaction history before applying bonuses
- Use atomic updates (single DB call when possible)
- Verify status before state changes
- Log all operations for audit trail

---

## Monitoring & Logging

All functions log errors via Supabase logs. Check:
```
Supabase Dashboard → Edge Functions → Logs
```

Key metrics to monitor:
- Failed approvals (400 errors)
- Unauthorized attempts (403 errors)
- Timeouts (>30 seconds)
- Error rate (% of failed requests)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Nov 16, 2025 | Initial deployment (5 functions) |

---

## Support & Debugging

If a function fails:

1. **Check request format:** Verify all required fields are present
2. **Verify auth:** Ensure Bearer token is valid and admin role set
3. **Check balances:** User may have insufficient funds
4. **DB constraints:** Bonus may have already been applied
5. **Logs:** Check Supabase Edge Functions logs for detailed error

---

Last Updated: November 16, 2025
