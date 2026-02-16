# Specification

## Summary
**Goal:** Update the auction app so bidder budgets and all bidding-related amounts are handled and displayed as rupees (₹), with a ₹1000 starting budget per bidder for new auctions.

**Planned changes:**
- Backend: change new-auction initialization so each bidder starts with `remainingAmount = 1000` (Nat) instead of the prior large CR-based value.
- Frontend: update currency formatting to display bigint amounts directly as rupees with a ₹ prefix (remove CR conversion/scaling).
- Frontend: update bid input parsing so entered values are interpreted as rupees and converted to bigint rupees (remove multiplication by the prior scaling factor).
- Frontend: update UI labels/help text and validation messages to reference ₹/rupees instead of CR.
- Frontend: adjust results/spent calculations to use a shared initial budget constant of `1000n` and format displayed amounts as ₹ across bidder, audience, and results views.

**User-visible outcome:** When starting a new auction, each bidder begins with ₹1000, and all budgets, bids, spent/remaining amounts, and results are entered and shown consistently in rupees (₹) throughout the app.
