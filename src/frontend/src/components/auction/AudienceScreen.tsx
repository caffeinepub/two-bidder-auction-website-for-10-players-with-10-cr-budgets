import { Loader2, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuctionState } from '../../hooks/useAuctionQueries';
import { formatAmount, getHighestBidderDisplay } from '../../utils/format';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

export function AudienceScreen() {
  const { data: auctionState, isLoading, isError, error } = useAuctionState({
    refetchInterval: 2000, // Poll every 2 seconds for live updates
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading auction data...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Auction</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : 'Failed to load auction state. Please try again.'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!auctionState || !auctionState.inProgress) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Active Auction</AlertTitle>
        <AlertDescription>
          The auction has not started yet. Please wait for the auction host to begin.
        </AlertDescription>
      </Alert>
    );
  }

  const soldPlayers = auctionState.players.filter((p) => p.boughtBy);
  const unsoldPlayers = auctionState.players.filter((p) => !p.boughtBy);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Live Auction View</h2>
          <p className="text-muted-foreground mt-1">Watch the auction unfold in real-time</p>
        </div>
        <Badge variant="default" className="animate-pulse">
          LIVE
        </Badge>
      </div>

      {/* Current Auction Round */}
      <Card className="border-primary shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Current Auction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {auctionState.currentAuctionedPlayer ? (
            <>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Player on Auction</p>
                <p className="text-2xl font-bold text-foreground">
                  {auctionState.currentAuctionedPlayer}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Highest Bid</p>
                  <p className="text-xl font-semibold text-primary">
                    {auctionState.highestBid > 0n
                      ? formatAmount(auctionState.highestBid)
                      : 'No bids yet'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Highest Bidder</p>
                  <p className="text-xl font-semibold text-foreground">
                    {getHighestBidderDisplay(auctionState.highestBidder)}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No player is currently being auctioned. Waiting for the next round to start.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Bidders Budget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bidders Budget
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {auctionState.bidders.map((bidder) => (
              <div
                key={bidder.name}
                className="p-4 border border-border rounded-lg bg-muted/50"
              >
                <p className="font-semibold text-foreground mb-2">{bidder.name}</p>
                <p className="text-2xl font-bold text-primary">
                  {formatAmount(bidder.remainingAmount)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Remaining Budget</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Players Table */}
      <Card>
        <CardHeader>
          <CardTitle>Players Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sold Price</TableHead>
                <TableHead>Bought By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {soldPlayers.map((player) => (
                <TableRow key={player.name}>
                  <TableCell className="font-medium">{player.name}</TableCell>
                  <TableCell>
                    <Badge variant="default">Sold</Badge>
                  </TableCell>
                  <TableCell className="text-primary font-semibold">
                    {player.price ? formatAmount(player.price) : '-'}
                  </TableCell>
                  <TableCell>{player.boughtBy || '-'}</TableCell>
                </TableRow>
              ))}
              {auctionState.currentAuctionedPlayer && (
                <TableRow className="bg-primary/10">
                  <TableCell className="font-medium">
                    {auctionState.currentAuctionedPlayer}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default" className="animate-pulse">
                      Live
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">-</TableCell>
                  <TableCell className="text-muted-foreground">-</TableCell>
                </TableRow>
              )}
              {unsoldPlayers
                .filter((p) => p.name !== auctionState.currentAuctionedPlayer)
                .map((player) => (
                  <TableRow key={player.name}>
                    <TableCell className="font-medium">{player.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Unsold</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">-</TableCell>
                    <TableCell className="text-muted-foreground">-</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
