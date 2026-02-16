import { useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { SetupScreen } from './components/auction/SetupScreen';
import { AuctionScreen } from './components/auction/AuctionScreen';
import { ResultsScreen } from './components/auction/ResultsScreen';

type Screen = 'setup' | 'auction' | 'results';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('setup');

  return (
    <AppLayout currentScreen={currentScreen} onNavigate={setCurrentScreen}>
      {currentScreen === 'setup' && (
        <SetupScreen onStart={() => setCurrentScreen('auction')} />
      )}
      {currentScreen === 'auction' && (
        <AuctionScreen onViewResults={() => setCurrentScreen('results')} />
      )}
      {currentScreen === 'results' && (
        <ResultsScreen onReset={() => setCurrentScreen('setup')} />
      )}
    </AppLayout>
  );
}

export default App;

