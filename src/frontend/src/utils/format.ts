/**
 * Initial budget for each bidder in rupees
 */
export const INITIAL_BUDGET_RUPEES = 1000n;

/**
 * Format bigint amount to rupees display format
 * Backend stores amounts directly as rupees (1 rupee = 1)
 */
export function formatAmount(amount: bigint): string {
  const rupees = Number(amount);
  return `₹${rupees.toLocaleString()}`;
}

/**
 * Get status label for player
 */
export function getPlayerStatus(
  player: { boughtBy?: string; name: string },
  currentAuctionedPlayer?: string
): 'sold' | 'live' | 'unsold' {
  if (player.boughtBy) return 'sold';
  if (player.name === currentAuctionedPlayer) return 'live';
  return 'unsold';
}

/**
 * Get display text for highest bidder
 */
export function getHighestBidderDisplay(highestBidder?: string): string {
  return highestBidder || 'No bids yet';
}
