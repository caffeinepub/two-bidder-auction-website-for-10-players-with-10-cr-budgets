import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Gavel, TrendingUp, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import {
  useAuctionState,
  useStartAuction,
  usePlaceBid,
  useSellPlayer,
} from '../../hooks/useAuctionQueries';
import { formatAmount } from '../../utils/format';
import { validateBid } from './guards';

interface AuctionScreenProps {
  onViewResults: () => void;
}

export function AuctionScreen({ onViewResults }: AuctionScreenProps) {
  const { data: auctionState, isLoading, error } = useAuctionState();
  const startAuctionMutation = useStartAuction();
  const placeBidMutation = usePlaceBid();
  const sellPlayerMutation = useSellPlayer();

  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [bidAmount, setBidAmount] = useState('');
  const [selectedBidder, setSelectedBidder] = useState<string>('');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error instanceof Error ? error.message : 'Failed to load auction state'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!auctionState) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No auction configured. Please go to Setup to start a new auction.
        </AlertDescription>
      </Alert>
    );
  }

  const unsoldPlayers = auctionState.players.filter((p) => !p.boughtBy);
  const currentPlayer = auctionState.currentAuctionedPlayer;
  const highestBid = auctionState.highestBid;
  const highestBidder = auctionState.highestBidder;

  const handleStartAuction = async (playerName: string) => {
    try {
      await startAuctionMutation.mutateAsync(playerName);
      setSelectedPlayer('');
    } catch (error) {
      // Error handled by React Query and displayed in UI
    }
  };

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPlayer || !selectedBidder || !bidAmount) return;

    const bidAmountNum = parseFloat(bidAmount);
    const bidAmountBigInt = BigInt(Math.round(bidAmountNum * 1_000_000_000_000));

    const bidder = auctionState.bidders.find((b) => b.name === selectedBidder);
    if (!bidder) return;

    const validation = validateBid(bidAmountBigInt, highestBid, bidder.remainingAmount);
    if (!validation.valid) {
      return;
    }

    try {
      await placeBidMutation.mutateAsync({
        playerName: currentPlayer,
        bidderName: selectedBidder,
        amount: bidAmountBigInt,
      });
      setBidAmount('');
    } catch (error) {
      // Error handled by React Query and displayed in UI
    }
  };

  const handleSellPlayer = async () => {
    if (!currentPlayer) return;

    try {
      await sellPlayerMutation.mutateAsync(currentPlayer);
    } catch (error) {
      // Error handled by React Query and displayed in UI
    }
  };

  const bidAmountNum = bidAmount ? parseFloat(bidAmount) : 0;
  const bidAmountBigInt = BigInt(Math.round(bidAmountNum * 1_000_000_000_000));
  const selectedBidderData = auctionState.bidders.find((b) => b.name === selectedBidder);
  const bidValidation = selectedBidderData
    ? validateBid(bidAmountBigInt, highestBid, selectedBidderData.remainingAmount)
    : { valid: false, message: 'Select a bidder' };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Bidders Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {auctionState.bidders.map((bidder) => (
          <Card key={bidder.name} className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{bidder.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Remaining Budget</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatAmount(bidder.remainingAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Spent</span>
                  <span className="font-medium">
                    {formatAmount(10_000_000_000_000n - bidder.remainingAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Players Owned</span>
                  <span className="font-medium">
                    {auctionState.players.filter((p) => p.boughtBy === bidder.name).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Current Auction */}
      <Card className="border-2 border-primary shadow-glow-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5 text-primary" />
            Current Auction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentPlayer ? (
            <>
              <div className="bg-muted/50 rounded-lg p-6 text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="h-5 w-5 text-accent animate-pulse-glow" />
                  <Badge variant="outline" className="text-lg px-4 py-1">
                    Live Auction
                  </Badge>
                </div>
                <h3 className="text-3xl font-bold text-foreground">{currentPlayer}</h3>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Current Highest Bid</p>
                  <p className="text-4xl font-bold text-accent">
                    {highestBid > 0 ? formatAmount(highestBid) : 'No bids yet'}
                  </p>
                  {highestBidder && (
                    <p className="text-sm text-muted-foreground">by {highestBidder}</p>
                  )}
                </div>
              </div>

              {/* Place Bid Form */}
              <form onSubmit={handlePlaceBid} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bidder">Select Bidder</Label>
                    <select
                      id="bidder"
                      value={selectedBidder}
                      onChange={(e) => setSelectedBidder(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="">Choose bidder...</option>
                      {auctionState.bidders.map((bidder) => (
                        <option key={bidder.name} value={bidder.name}>
                          {bidder.name} ({formatAmount(bidder.remainingAmount)} remaining)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bidAmount">Bid Amount (CR)</Label>
                    <Input
                      id="bidAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder="Enter bid amount"
                    />
                  </div>
                </div>

                {!bidValidation.valid && bidAmount && selectedBidder && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{bidValidation.message}</AlertDescription>
                  </Alert>
                )}

                {placeBidMutation.isError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {placeBidMutation.error instanceof Error
                        ? placeBidMutation.error.message
                        : 'Failed to place bid. Please try again.'}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={
                      !bidValidation.valid || placeBidMutation.isPending || !bidAmount || !selectedBidder
                    }
                    className="flex-1"
                  >
                    {placeBidMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Placing Bid...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Place Bid
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    onClick={handleSellPlayer}
                    disabled={highestBid === 0n || sellPlayerMutation.isPending}
                    className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                  >
                    {sellPlayerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Finalizing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Finalize Sale
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {sellPlayerMutation.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {sellPlayerMutation.error instanceof Error
                      ? sellPlayerMutation.error.message
                      : 'Failed to finalize sale. Please try again.'}
                  </AlertDescription>
                </Alert>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No player currently being auctioned</p>
              <p className="text-sm text-muted-foreground">
                Select a player from the list below to start
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Players List */}
      <Card>
        <CardHeader>
          <CardTitle>Players</CardTitle>
          <CardDescription>
            {unsoldPlayers.length} unsold • {auctionState.players.length - unsoldPlayers.length} sold
          </CardDescription>
        </CardHeader>
        <CardContent>
          {startAuctionMutation.isError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {startAuctionMutation.error instanceof Error
                  ? startAuctionMutation.error.message
                  : 'Failed to start auction. Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Bought By</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auctionState.players.map((player) => (
                <TableRow key={player.name}>
                  <TableCell className="font-medium">{player.name}</TableCell>
                  <TableCell>
                    {player.boughtBy ? (
                      <Badge className="bg-success text-success-foreground">Sold</Badge>
                    ) : player.name === currentPlayer ? (
                      <Badge variant="outline" className="border-accent text-accent">
                        Live
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Unsold</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {player.price ? formatAmount(player.price) : '-'}
                  </TableCell>
                  <TableCell>{player.boughtBy || '-'}</TableCell>
                  <TableCell className="text-right">
                    {!player.boughtBy && player.name !== currentPlayer && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartAuction(player.name)}
                        disabled={!!currentPlayer || startAuctionMutation.isPending}
                      >
                        {startAuctionMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Start Auction'
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Results Button */}
      {unsoldPlayers.length === 0 && (
        <div className="flex justify-center">
          <Button size="lg" onClick={onViewResults} className="min-w-[200px]">
            View Final Results
          </Button>
        </div>
      )}
    </div>
  );
}
