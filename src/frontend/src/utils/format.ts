/**
 * Format bigint amount to CR (crores) display format
 * Backend stores amounts as: 1 CR = 1_000_000_000_000
 */
export function formatAmount(amount: bigint): string {
  const cr = Number(amount) / 1_000_000_000_000;
  return `${cr.toFixed(2)} CR`;
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

