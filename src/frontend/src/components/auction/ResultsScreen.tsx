import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Loader2, Trophy, RotateCcw, AlertCircle } from 'lucide-react';
import { useAuctionState } from '../../hooks/useAuctionQueries';
import { formatAmount } from '../../utils/format';

interface ResultsScreenProps {
  onReset: () => void;
}

export function ResultsScreen({ onReset }: ResultsScreenProps) {
  const { data: auctionState, isLoading, error } = useAuctionState();

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
          {error instanceof Error ? error.message : 'Failed to load auction results'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!auctionState) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No auction data available. Please start a new auction.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
          <Trophy className="h-8 w-8 text-accent" />
          Auction Results
        </h2>
        <p className="text-muted-foreground">Final rosters and spending summary</p>
      </div>

      {/* Bidders Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {auctionState.bidders.map((bidder) => {
          const roster = auctionState.players.filter((p) => p.boughtBy === bidder.name);
          const totalSpent = 10_000_000_000_000n - bidder.remainingAmount;

          return (
            <Card key={bidder.name} className="border-2">
              <CardHeader className="bg-muted/30">
                <CardTitle className="flex items-center justify-between">
                  <span>{bidder.name}</span>
                  <Badge variant="outline" className="text-base">
                    {roster.length} Players
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Spent: <span className="font-bold text-foreground">{formatAmount(totalSpent)}</span> •
                  Remaining: <span className="font-bold text-primary">{formatAmount(bidder.remainingAmount)}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {roster.length > 0 ? (
                  <div className="space-y-2">
                    {roster.map((player) => (
                      <div
                        key={player.name}
                        className="flex items-center justify-between p-3 bg-muted/20 rounded-md"
                      >
                        <span className="font-medium">{player.name}</span>
                        <span className="text-sm font-bold text-accent">
                          {player.price ? formatAmount(player.price) : '-'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">No players acquired</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sales History */}
      <Card>
        <CardHeader>
          <CardTitle>Sales History</CardTitle>
          <CardDescription>Complete record of all player sales</CardDescription>
        </CardHeader>
        <CardContent>
          {auctionState.winners.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Sold To</TableHead>
                  <TableHead className="text-right">Final Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auctionState.winners.map((player, index) => (
                  <TableRow key={`${player.name}-${index}`}>
                    <TableCell className="font-medium">{player.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{player.boughtBy || 'Unknown'}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-accent">
                      {player.price ? formatAmount(player.price) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">No sales recorded yet</p>
          )}
        </CardContent>
      </Card>

      {/* Unsold Players */}
      {auctionState.players.some((p) => !p.boughtBy) && (
        <Card>
          <CardHeader>
            <CardTitle>Unsold Players</CardTitle>
            <CardDescription>Players not acquired during the auction</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {auctionState.players
                .filter((p) => !p.boughtBy)
                .map((player) => (
                  <Badge key={player.name} variant="secondary" className="text-sm">
                    {player.name}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reset Button */}
      <div className="flex justify-center pt-4">
        <Button size="lg" onClick={onReset} variant="outline" className="min-w-[200px]">
          <RotateCcw className="mr-2 h-4 w-4" />
          Start New Auction
        </Button>
      </div>
    </div>
  );
}

