# Whitestones Wealth Hub - Quick Reference & Next Steps

## ✅ COMPLETED (9/16 Tasks)

### Backend (Database + Edge Functions)
- ✅ Database schema: wallets, transfers, notifications, admin_notes
- ✅ approve-deposit function with first-deposit 10% bonus
- ✅ approve-kyc function with configurable KYC bonus
- ✅ wallet-transfer function (Main → Investment only)
- ✅ complete-investment function (return principal + profit)
- ✅ admin-adjust-funds function (manual wallet control with audit trail)

### Frontend (React Components)
- ✅ useKYCStatus hook (status tracking + real-time subscriptions)
- ✅ KYCGuard component (gating actions with alerts)
- ✅ KYCStatusBadge component (visual status indicator)
- ✅ Deposit page with KYC enforcement + balance tracking
- ✅ Withdraw page with KYC + balance enforcement + clear disabled messages
- ✅ WalletsOverview component (Main/Investment/Profit balances + transfer form)
- ✅ NotificationsCenter component (user notification history + real-time)
- ✅ AdminNotifications page (send to all/specific users with categories)

### Admin Integration
- ✅ Updated admin KYC page to call approve-kyc edge function (triggers KYC bonus)
- ✅ Updated admin Deposits page to call approve-deposit edge function (triggers first-deposit bonus)

### Business Logic Enforced
- ✅ KYC required for deposit/withdraw/invest
- ✅ Balance showing when insufficient
- ✅ Main wallet receives deposits + bonuses
- ✅ Investment wallet for purchase only
- ✅ Transfers only Main → Investment
- ✅ First-deposit bonus (10% configurable)
- ✅ KYC approval bonus (configurable)
- ✅ Transactions logged
- ✅ Admin audit trail (admin_notes)

---

## 🔄 IN PROGRESS & TODO (7/16 Tasks)

### Task 6: Automated Investment Lifecycle
**Status:** Backend created, frontend needs hook + page update

**What's done:**
- `complete-investment` edge function exists
- Returns principal + profit to Main wallet
- Logs transactions
- Sends notification

**What needs doing:**
- Investment processor cron/scheduler (need Supabase Cron extension or external scheduler)
- Frontend hook to check investment status
- Show countdown timer on Investments page
- Auto-call `complete-investment` when timer expires

**Files to create/update:**
- `src/hooks/useInvestmentTimer.tsx` — countdown logic
- `src/pages/dashboard/Investments.tsx` — add KYC guard + timer display
- Setup Supabase Cron job or external scheduler

---

### Task 10: Admin Dashboard UI
**Status:** Not started

**Requirements:**
- Dark theme (Tailwind dark mode)
- Collapsible left sidebar
- Menu items: Analytics, Users, Deposits, Withdrawals, KYC, Investments, Referrals, Notifications, Settings
- Analytics cards: Total users, Pending deposits, Pending withdrawals, Pending KYC, etc.
- Charts: Deposit trends (last 10 days), Investment status pie chart

**Files to create:**
- `src/components/admin/AdminLayout.tsx` — main layout with sidebar
- `src/components/admin/AdminSidebar.tsx` — collapsible menu
- `src/pages/admin/Analytics.tsx` — dashboard with cards + charts
- Update routing in main App

---

### Task 11: Admin Manual Funds Control & User Account View
**Status:** Backend created, frontend needs build

**What's done:**
- `admin-adjust-funds` edge function exists
- Admin notes logged
- Transaction history created
- User notifications sent

**What needs doing:**
- Admin Users page with search
- User detail page (click to view individual user)
- Show both wallet balances
- Fund adjustment form (Main/Investment selector)
- Display admin notes history
- Show transaction history

**Files to create:**
- `src/pages/admin/Users.tsx` — user search + list
- `src/pages/admin/Users/[id].tsx` — user detail page with fund control

---

### Task 12: QR Code Upload & Deposit Page Display
**Status:** Not started

**What's done:**
- Bitcoin address already in deposit page
- Settings key `bitcoin_qr_url` already in DB

**What needs doing:**
- Admin Settings page: upload QR image input
- Store image path in settings
- Deposit page: fetch and display QR from settings

**Files to create/update:**
- `src/pages/admin/Settings.tsx` — add image upload section
- `src/pages/dashboard/Deposit.tsx` — fetch QR URL from settings, display dynamically

---

### Task 13: Tidio Chat Visibility Rules
**Status:** Not started

**Requirements:**
- Show ONLY on: Homepage, Dashboard
- Hide on: Login, Signup, Privacy, Terms, Admin, etc.

**Implementation:**
- Create `src/components/Tidio.tsx` with route-based visibility
- Add to DashboardLayout and landing page
- Conditional render based on `useLocation().pathname`

---

### Task 14: Mobile Responsiveness Fixes
**Status:** Not started

**Requirements:**
- No horizontal overflow
- All controls visible without zoom
- Touch targets large enough (min 44px)
- No desktop mode required

**Approach:**
- Audit existing mobile.tsx
- Check all new components for Tailwind responsive classes
- Test on actual mobile viewport (375px, 768px widths)
- Fix any horizontal scroll issues

---

### Task 15: Multi-Language Support (i18n)
**Status:** Not started

**Requirements:**
- Full UI translation
- Dashboard + Admin pages
- Terms, Privacy policy
- Real-time language switching

**Approach:**
- Use existing LanguageContext
- Create translation JSON files
- Wrap text with translation hook
- Use react-i18next or similar

---

### Task 16: Testing & QA
**Status:** Not started

**Test coverage needed:**
- Unit: KYC hook, wallet calculations
- Integration: KYC → Deposit flow, Transfer logic, Bonus credit
- E2E: Smoke tests for critical paths
- Mobile: Viewport checks

---

## 🚀 Recommended Implementation Order

### Phase 1 (1-2 hours) — High Priority
1. **Task 10: Admin Dashboard** — Needed for admin operations
2. **Task 11: User Account Management** — Needed for fund adjustments
3. **Task 12: QR Code Upload** — User-facing requirement

### Phase 2 (2-3 hours) — Core Features
4. **Task 6: Investment Lifecycle** — Complete investment flow
5. **Task 13: Tidio Visibility** — Simple but required

### Phase 3 (1-2 hours) — Polish
6. **Task 14: Mobile Responsiveness** — Test on devices
7. **Task 15: i18n** — Multi-language support

### Phase 4 (1-2 hours) — Quality
8. **Task 16: Testing** — Unit + E2E tests

---

## Deployment Checklist

Before going live:
- [ ] Apply DB migration: `supabase db push`
- [ ] Deploy Edge Functions: `supabase functions deploy`
- [ ] Set Supabase environment variables in .env.local
- [ ] Run all tests: `npm run test`
- [ ] Manual testing on mobile devices
- [ ] Admin approval for all features
- [ ] User documentation/help text ready
- [ ] Monitor error logs post-launch

---

## Key Architecture Decisions

### Database Approach
- Separation of concerns: account_balances, wallet_transfers, notifications kept independent
- RLS policies enforce user/admin access
- Immutable audit trail in admin_notes

### Edge Functions vs. Stored Procedures
- Edge Functions: User-facing bonus logic, transfer logic (can send notifications)
- Stored Procedures: Potential for investment completion (cron trigger)

### Real-Time Updates
- Supabase subscriptions for notifications
- useKYCStatus hook for status changes
- Investment timer in frontend (not real-time sync needed)

### Admin Control
- Centralized settings table for configurable bonuses
- Manual fund adjustments with full audit trail
- Admin notes for compliance

---

## Common Issues & Solutions

### Issue: ImportMeta.env undefined in Edge Functions
**Solution:** Use `Deno.env.get()` in edge functions, not vite env vars

### Issue: RLS policies blocking admin operations
**Solution:** Admin role is verified in edge functions with `public.has_role()`, keep policies correct

### Issue: First-deposit bonus applied multiple times
**Solution:** Check transaction history for existing bonus before applying in edge function

### Issue: Transfer Main → Investment succeeds but balance not updating in UI
**Solution:** Manually call balance refresh after transfer, or use real-time subscriptions

---

## Testing Examples

### Test KYC Enforcement
```typescript
// Should redirect to KYC page if not approved
const { isApproved } = useKYCStatus();
expect(isApproved).toBe(false);
// Deposit button should be disabled
expect(depositButton).toBeDisabled();
```

### Test First-Deposit Bonus
```typescript
// Admin approves first deposit of $100
// Should credit $110 (10% bonus)
// Transaction history should show 2 entries: deposit ($100) + bonus ($10)
const transactions = await supabase
  .from('transactions')
  .select('*')
  .eq('user_id', userId);
expect(transactions.length).toBe(2);
expect(transactions[0].amount).toBe(100);
expect(transactions[1].amount).toBe(10);
```

### Test Transfer Main → Investment
```typescript
// User has $1000 in main, $0 in investment
// Transfer $500 to investment
// Main should be $500, Investment should be $500
// wallet_transfers should have 1 record with status 'approved'
```

---

## Performance Considerations

1. **Balance Queries:** Cache in context to avoid repeated DB hits
2. **Notification Subscriptions:** Unsubscribe on component unmount
3. **Images:** Optimize QR code size; use Supabase signed URLs with expiry
4. **Admin Lists:** Implement pagination for users/deposits/withdrawals
5. **Transactions:** Index created_at for sorting

---

## Security Notes

✅ **Already Implemented:**
- RLS on all tables
- Admin role verification in edge functions
- Audit trail for all admin actions
- KYC checks before sensitive actions

⚠️ **To Verify:**
- Rate limiting on edge functions (Supabase default: 1000/min)
- CORS headers correct for API calls
- Sensitive data not logged in error messages
- Session tokens included in auth headers

---

## Notes for Future Scalability

1. **Caching:** Redis for frequently accessed settings
2. **Load:** Horizontal scaling of edge functions (Supabase handles)
3. **Analytics:** Consider data warehouse for reporting
4. **Notifications:** Queue system (Bull/RabbitMQ) for high volume
5. **Multi-currency:** Extend settings for forex rates
6. **Compliance:** AML/KYC third-party integrations (e.g., Onfido)

---

Last Updated: November 16, 2025
Completion: 56% (9/16 tasks)
Estimated Remaining: 4-6 hours
