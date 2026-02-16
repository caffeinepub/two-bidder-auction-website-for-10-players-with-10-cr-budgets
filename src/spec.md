# Specification

## Summary
**Goal:** Enforce a server-side limit of 13 concurrent audience participants for the Audience screen and reflect join status and audience count in the UI.

**Planned changes:**
- Add backend (Motoko) audience presence tracking with join/leave methods and a query to fetch current audience count (and/or list), enforcing a hard limit of 13 unique principals and idempotent re-joins.
- Ensure audience presence state resets when a new auction starts so prior audience members do not occupy slots.
- Update the Audience screen to call join on mount and leave on unmount (best-effort), show an English error message when the audience limit is reached, and stop normal Audience behavior when not joined.
- Display and periodically refresh an “Audience: X/13” counter in the Audience screen (and/or header) using the backend query, reusing existing polling cadence.

**User-visible outcome:** Viewers can open the Audience screen and join as one of up to 13 concurrent audience members, see the live audience count (X/13), and receive a clear error message if the audience is full.
