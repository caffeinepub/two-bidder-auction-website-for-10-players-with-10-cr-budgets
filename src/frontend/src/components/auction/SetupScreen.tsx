import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Users, Trophy, AlertCircle, Key } from 'lucide-react';
import { useInitializeAuction } from '../../hooks/useAuctionQueries';
import { validateSetup } from './guards';

interface SetupScreenProps {
  onStart: (secretKey: string) => void;
}

export function SetupScreen({ onStart }: SetupScreenProps) {
  const [bidder1, setBidder1] = useState('Bidder 1');
  const [bidder2, setBidder2] = useState('Bidder 2');
  const [players, setPlayers] = useState<string[]>(
    Array.from({ length: 10 }, (_, i) => `Player ${i + 1}`)
  );
  const [secretKey, setSecretKey] = useState('');

  const initializeMutation = useInitializeAuction();

  const handlePlayerChange = (index: number, value: string) => {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateSetup(bidder1, bidder2, players, secretKey);
    if (!validation.valid) {
      return;
    }

    try {
      await initializeMutation.mutateAsync({
        bidder1Name: bidder1,
        bidder2Name: bidder2,
        playerNames: players,
        secretKey: secretKey,
      });
      onStart(secretKey);
    } catch (error) {
      // Error handled by React Query and displayed in UI
    }
  };

  const validation = validateSetup(bidder1, bidder2, players, secretKey);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Setup New Auction</h2>
        <p className="text-muted-foreground">Configure bidders, players, and security settings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bidders Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Bidders (₹1000 each)
            </CardTitle>
            <CardDescription>Enter the names of the two bidders</CardDescription>
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bidder2">Bidder 2</Label>
                <Input
                  id="bidder2"
                  value={bidder2}
                  onChange={(e) => setBidder2(e.target.value)}
                  placeholder="Enter bidder 2 name"
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
              Players (10 required)
            </CardTitle>
            <CardDescription>Enter the names of all players to be auctioned</CardDescription>
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

        {/* Secret Key Section */}
        <Card className="border-warning/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-warning" />
              Secret Key
            </CardTitle>
            <CardDescription>
              Set a secret key to protect bid placement. Share this only with authorized bidders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="secretKey">Secret Key</Label>
              <Input
                id="secretKey"
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Enter a secret key"
                className="font-medium"
              />
              <p className="text-xs text-muted-foreground">
                This key will be required to place bids during the auction.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Validation Messages */}
        {!validation.valid && (bidder1 || bidder2 || players.some((p) => p) || secretKey) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{validation.message}</AlertDescription>
          </Alert>
        )}

        {initializeMutation.isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {initializeMutation.error instanceof Error
                ? initializeMutation.error.message
                : 'Failed to initialize auction. Please try again.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <Button
            type="submit"
            size="lg"
            disabled={!validation.valid || initializeMutation.isPending}
            className="min-w-[200px]"
          >
            {initializeMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initializing...
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
