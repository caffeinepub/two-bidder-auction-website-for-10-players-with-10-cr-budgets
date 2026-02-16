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
export interface PlayerState {
    boughtBy?: string;
    name: string;
    price?: bigint;
}
export interface backendInterface {
    bidPlayer(bid: AuctionBid): Promise<RoundBidResult>;
    getAuctionState(): Promise<AuctionState>;
    sellPlayer(_playerName: string): Promise<AuctionState>;
    startAuction(_playerName: string): Promise<AuctionState>;
    startNewAuction(bidder1Name: string, bidder2Name: string, playerNames: Array<string>): Promise<AuctionState>;
}
