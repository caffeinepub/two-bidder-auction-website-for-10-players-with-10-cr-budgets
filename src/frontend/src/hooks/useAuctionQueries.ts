import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { AuctionState, AuctionBid } from '../backend';
import { normalizeBackendError } from '../utils/backendErrors';

const AUCTION_STATE_KEY = ['auctionState'];

export function useAuctionState(options?: Partial<UseQueryOptions<AuctionState>>) {
  const { actor, isFetching } = useActor();

  return useQuery<AuctionState>({
    queryKey: AUCTION_STATE_KEY,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getAuctionState();
    },
    enabled: !!actor && !isFetching,
    ...options,
  });
}

export function useInitializeAuction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bidder1Name,
      bidder2Name,
      playerNames,
      secretKey,
    }: {
      bidder1Name: string;
      bidder2Name: string;
      playerNames: string[];
      secretKey: string;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      try {
        return await actor.startNewAuctionWithSecretKey(bidder1Name, bidder2Name, playerNames, secretKey);
      } catch (error) {
        throw new Error(normalizeBackendError(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUCTION_STATE_KEY });
    },
  });
}

export function useStartAuction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (playerName: string) => {
      if (!actor) throw new Error('Actor not initialized');
      try {
        return await actor.startAuction(playerName);
      } catch (error) {
        throw new Error(normalizeBackendError(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUCTION_STATE_KEY });
    },
  });
}

export function usePlaceBid() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      playerName,
      bidderName,
      amount,
      secretKey,
    }: {
      playerName: string;
      bidderName: string;
      amount: bigint;
      secretKey: string;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      const bid: AuctionBid = {
        playerName,
        bidderName,
        amount,
      };
      try {
        return await actor.bidPlayer(bid, secretKey);
      } catch (error) {
        throw new Error(normalizeBackendError(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUCTION_STATE_KEY });
    },
  });
}

export function useSellPlayer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (playerName: string) => {
      if (!actor) throw new Error('Actor not initialized');
      try {
        return await actor.sellPlayer(playerName);
      } catch (error) {
        throw new Error(normalizeBackendError(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUCTION_STATE_KEY });
    },
  });
}
