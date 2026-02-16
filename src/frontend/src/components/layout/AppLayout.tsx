import { ReactNode } from 'react';
import { Gavel } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
  currentScreen: 'setup' | 'auction' | 'results';
  onNavigate: (screen: 'setup' | 'auction' | 'results') => void;
}

export function AppLayout({ children, currentScreen, onNavigate }: AppLayoutProps) {
  const currentYear = new Date().getFullYear();
  const appIdentifier = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.hostname : 'auction-app'
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <Gavel className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Player Auction</h1>
                <p className="text-sm text-muted-foreground">2 Bidders • 10 Players • 10 CR Budget</p>
              </div>
            </div>
            <nav className="flex gap-2">
              <button
                onClick={() => onNavigate('setup')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentScreen === 'setup'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                Setup
              </button>
              <button
                onClick={() => onNavigate('auction')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentScreen === 'auction'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                Auction
              </button>
              <button
                onClick={() => onNavigate('results')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentScreen === 'results'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                Results
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-border bg-card mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              © {currentYear} Player Auction • Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

