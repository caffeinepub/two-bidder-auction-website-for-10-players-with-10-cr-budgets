import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface BidderState {
    remainingAmount: bigint;
    name: string;
    isPlaying: boolean;
}
export interface RoundBidResult {
    bid: AuctionBid;
    state: AuctionState;
}
export interface AuctionState {
    roundStartTime: bigint;
    highestBidder?: string;
    currentAuctionedPlayer?: string;
    highestBid: bigint;
    players: Array<PlayerState>;
    bidders: Array<BidderState>;
    inProgress: boolean;
    winners: Array<PlayerState>;
}
export interface AuctionBid {
    limitExceedingAmount?: bigint;
    playerName: string;
    amount: bigint;
    bidderName: string;
}
export interface AudienceLimit {
    status: string;
    maxCapacity: bigint;
    currentCount: bigint;
    message: string;
}
export interface PlayerState {
    boughtBy?: string;
    name: string;
    price?: bigint;
}
export interface backendInterface {
    bidPlayer(bid: AuctionBid, providedKey: string): Promise<RoundBidResult>;
    checkAudienceCapacity(): Promise<AudienceLimit>;
    getAuctionState(): Promise<AuctionState>;
    joinAudience(): Promise<boolean>;
    leaveAudience(): Promise<boolean>;
    sellPlayer(_playerName: string): Promise<AuctionState>;
    startAuction(_playerName: string): Promise<AuctionState>;
    startNewAuctionWithSecretKey(bidder1Name: string, bidder2Name: string, playerNames: Array<string>, newSecretKey: string): Promise<AuctionState>;
}
