import { formatAmount } from '../../utils/format';

export interface ValidationResult {
  valid: boolean;
  message: string;
}

export function validateSetup(
  bidder1: string,
  bidder2: string,
  players: string[],
  secretKey: string
): ValidationResult {
  // Check bidder names
  if (!bidder1.trim()) {
    return { valid: false, message: 'Bidder 1 name is required' };
  }
  if (!bidder2.trim()) {
    return { valid: false, message: 'Bidder 2 name is required' };
  }
  if (bidder1.trim() === bidder2.trim()) {
    return { valid: false, message: 'Bidder names must be different' };
  }

  // Check exactly 10 players
  if (players.length !== 10) {
    return { valid: false, message: 'Must have exactly 10 players' };
  }

  // Check all player names are filled
  const emptyPlayers = players.filter((p) => !p.trim());
  if (emptyPlayers.length > 0) {
    return { valid: false, message: 'All player names must be filled' };
  }

  // Check for duplicate player names
  const uniqueNames = new Set(players.map((p) => p.trim().toLowerCase()));
  if (uniqueNames.size !== players.length) {
    return { valid: false, message: 'Player names must be unique' };
  }

  // Check secret key
  if (!secretKey.trim()) {
    return { valid: false, message: 'Secret key is required' };
  }

  return { valid: true, message: '' };
}

export function validateBid(
  bidAmount: bigint,
  currentHighestBid: bigint,
  remainingBudget: bigint
): ValidationResult {
  if (bidAmount <= 0n) {
    return { valid: false, message: 'Bid amount must be greater than 0' };
  }

  if (bidAmount <= currentHighestBid) {
    return {
      valid: false,
      message: `Bid must be higher than current highest bid (${formatAmount(currentHighestBid)})`,
    };
  }

  if (bidAmount > remainingBudget) {
    return {
      valid: false,
      message: `Bid exceeds remaining budget (${formatAmount(remainingBudget)} available)`,
    };
  }

  return { valid: true, message: '' };
}
