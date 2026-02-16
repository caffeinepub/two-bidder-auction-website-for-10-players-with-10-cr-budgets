# Specification

## Summary
**Goal:** Add a read-only Audience (spectator) view so viewers can watch the auction state live without taking actions.

**Planned changes:**
- Add a new Audience screen reachable from app navigation (e.g., an “Audience” tab).
- Display current auction state: current player (or “no round active”), highest bid/highest bidder (or “No bids yet”), bidder names with remaining budgets, and a sold/unsold players list including sold price and bought-by details.
- Implement automatic live updates on the Audience screen by polling the existing auction state query using React Query refetch intervals, including clean loading and error states.

**User-visible outcome:** Viewers can open the Audience screen to watch the auction progress in real time (via polling), seeing current bids, budgets, and sold/unsold player status, without any controls to start auctions, bid, or finalize sales.
