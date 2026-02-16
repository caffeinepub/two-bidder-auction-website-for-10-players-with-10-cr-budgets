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
import { Loader2, Gavel, TrendingUp, AlertCircle, CheckCircle2, Clock, Key } from 'lucide-react';
import {
  useAuctionState,
  useStartAuction,
  usePlaceBid,
  useSellPlayer,
} from '../../hooks/useAuctionQueries';
import { formatAmount, INITIAL_BUDGET_RUPEES } from '../../utils/format';
import { validateBid } from './guards';

interface AuctionScreenProps {
  onViewResults: () => void;
  secretKey?: string;
}

export function AuctionScreen({ onViewResults, secretKey: initialSecretKey }: AuctionScreenProps) {
  const { data: auctionState, isLoading, error } = useAuctionState();
  const startAuctionMutation = useStartAuction();
  const placeBidMutation = usePlaceBid();
  const sellPlayerMutation = useSellPlayer();

  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [bidAmount, setBidAmount] = useState('');
  const [selectedBidder, setSelectedBidder] = useState<string>('');
  const [secretKey, setSecretKey] = useState(initialSecretKey || '');

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
    if (!currentPlayer || !selectedBidder || !bidAmount || !secretKey) return;

    const bidAmountNum = parseFloat(bidAmount);
    const bidAmountBigInt = BigInt(Math.round(bidAmountNum));

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
        secretKey: secretKey,
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
  const bidAmountBigInt = BigInt(Math.round(bidAmountNum));
  const selectedBidderData = auctionState.bidders.find((b) => b.name === selectedBidder);
  const bidValidation = selectedBidderData
    ? validateBid(bidAmountBigInt, highestBid, selectedBidderData.remainingAmount)
    : { valid: false, message: 'Select a bidder' };

  const canPlaceBid = bidValidation.valid && secretKey.trim() !== '';

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
                    {formatAmount(INITIAL_BUDGET_RUPEES - bidder.remainingAmount)}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <Label htmlFor="bidAmount">Bid Amount (₹)</Label>
                    <Input
                      id="bidAmount"
                      type="number"
                      step="1"
                      min="0"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder="Enter bid amount"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secretKeyInput" className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-warning" />
                      Secret Key
                    </Label>
                    <Input
                      id="secretKeyInput"
                      type="password"
                      value={secretKey}
                      onChange={(e) => setSecretKey(e.target.value)}
                      placeholder="Enter secret key"
                      className="font-medium"
                    />
                  </div>
                </div>

                {!secretKey.trim() && (
                  <Alert>
                    <Key className="h-4 w-4" />
                    <AlertDescription>
                      Secret key is required to place bids. Enter the key provided by the auctioneer.
                    </AlertDescription>
                  </Alert>
                )}

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
                      !canPlaceBid || placeBidMutation.isPending
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
                    variant="outline"
                    onClick={handleSellPlayer}
                    disabled={highestBid === 0n || sellPlayerMutation.isPending}
                    className="flex-1"
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
              <p className="text-muted-foreground mb-4">No active auction. Select a player to start.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Players */}
      <Card>
        <CardHeader>
          <CardTitle>Available Players</CardTitle>
          <CardDescription>
            {unsoldPlayers.length} player{unsoldPlayers.length !== 1 ? 's' : ''} remaining
          </CardDescription>
        </CardHeader>
        <CardContent>
          {unsoldPlayers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unsoldPlayers.map((player) => (
                    <TableRow key={player.name}>
                      <TableCell className="font-medium">{player.name}</TableCell>
                      <TableCell>
                        {currentPlayer === player.name ? (
                          <Badge variant="default" className="bg-accent">
                            <Clock className="mr-1 h-3 w-3" />
                            On Auction
                          </Badge>
                        ) : (
                          <Badge variant="outline">Available</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStartAuction(player.name)}
                          disabled={
                            !!currentPlayer ||
                            startAuctionMutation.isPending
                          }
                        >
                          {startAuctionMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Start Auction'
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-3" />
              <p className="text-lg font-medium mb-2">All Players Sold!</p>
              <p className="text-muted-foreground mb-4">The auction is complete.</p>
              <Button onClick={onViewResults}>View Final Results</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {startAuctionMutation.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {startAuctionMutation.error instanceof Error
              ? startAuctionMutation.error.message
              : 'Failed to start auction. Please try again.'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
