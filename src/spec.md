# Specification

## Summary
**Goal:** Fix bid placement failures caused by backend validation relying on hardcoded bidder names, and improve the resulting invalid-bidder error message.

**Planned changes:**
- Update backend bid validation to accept the two configured bidder names stored in `auctionState.bidders` (and confirm exactly two bidders are configured), instead of comparing against literal strings like "Bidder 1" / "Bidder 2".
- Add/adjust backend error handling so an unknown bidder name is rejected with a clear English message indicating the bidder is not part of the current auction.
- Ensure the frontend displays the backend’s invalid-bidder error message in readable English within the existing bidding error UI, without breaking the auction screen flow.

**User-visible outcome:** After creating an auction with custom bidder names, selecting either configured bidder and placing a valid bid works without the “only two bidders/players” error; if an invalid bidder is selected/sent, the UI shows a clear, grammatically correct message explaining the bidder isn’t part of the auction.
