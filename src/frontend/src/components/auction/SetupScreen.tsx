import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Users, Trophy, AlertCircle } from 'lucide-react';
import { useInitializeAuction } from '../../hooks/useAuctionQueries';
import { validateSetup } from './guards';

interface SetupScreenProps {
  onStart: () => void;
}

export function SetupScreen({ onStart }: SetupScreenProps) {
  const [bidder1, setBidder1] = useState('Bidder 1');
  const [bidder2, setBidder2] = useState('Bidder 2');
  const [players, setPlayers] = useState<string[]>(
    Array.from({ length: 10 }, (_, i) => `Player ${i + 1}`)
  );

  const initializeMutation = useInitializeAuction();

  const handlePlayerChange = (index: number, value: string) => {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateSetup(bidder1, bidder2, players);
    if (!validation.valid) {
      return;
    }

    try {
      await initializeMutation.mutateAsync({
        bidder1Name: bidder1,
        bidder2Name: bidder2,
        playerNames: players,
      });
      onStart();
    } catch (error) {
      // Error is handled by React Query
    }
  };

  const validation = validateSetup(bidder1, bidder2, players);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Setup Auction</h2>
        <p className="text-muted-foreground">
          Configure bidders and players to start the auction
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bidders Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Bidders
            </CardTitle>
            <CardDescription>Enter names for exactly 2 bidders (10 CR each)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bidder1">Bidder 1</Label>
                <Input
                  id="bidder1"
                  value={bidder1}
                  onChange={(e) => setBidder1(e.target.value)}
                  placeholder="Enter bidder 1 name"
                  className="font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bidder2">Bidder 2</Label>
                <Input
                  id="bidder2"
                  value={bidder2}
                  onChange={(e) => setBidder2(e.target.value)}
                  placeholder="Enter bidder 2 name"
                  className="font-medium"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Players Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-accent" />
              Players
            </CardTitle>
            <CardDescription>Enter names for exactly 10 players</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {players.map((player, index) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={`player-${index}`}>Player {index + 1}</Label>
                  <Input
                    id={`player-${index}`}
                    value={player}
                    onChange={(e) => handlePlayerChange(index, e.target.value)}
                    placeholder={`Enter player ${index + 1} name`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Validation Messages */}
        {!validation.valid && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{validation.message}</AlertDescription>
          </Alert>
        )}

        {/* Backend Error */}
        {initializeMutation.isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {initializeMutation.error instanceof Error
                ? initializeMutation.error.message
                : 'Failed to initialize auction'}
            </AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            size="lg"
            disabled={!validation.valid || initializeMutation.isPending}
            className="min-w-[200px]"
          >
            {initializeMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting...
              </>
            ) : (
              'Start Auction'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

