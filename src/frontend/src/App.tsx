import { useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { SetupScreen } from './components/auction/SetupScreen';
import { AuctionScreen } from './components/auction/AuctionScreen';
import { ResultsScreen } from './components/auction/ResultsScreen';
import { AudienceScreen } from './components/auction/AudienceScreen';

type Screen = 'setup' | 'auction' | 'results' | 'audience';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('setup');
  const [secretKey, setSecretKey] = useState<string>('');

  const handleStartAuction = (key: string) => {
    setSecretKey(key);
    setCurrentScreen('auction');
  };

  const handleReset = () => {
    setSecretKey('');
    setCurrentScreen('setup');
  };

  return (
    <AppLayout currentScreen={currentScreen} onNavigate={setCurrentScreen}>
      {currentScreen === 'setup' && (
        <SetupScreen onStart={handleStartAuction} />
      )}
      {currentScreen === 'auction' && (
        <AuctionScreen 
          onViewResults={() => setCurrentScreen('results')} 
          secretKey={secretKey}
        />
      )}
      {currentScreen === 'results' && (
        <ResultsScreen onReset={handleReset} />
      )}
      {currentScreen === 'audience' && <AudienceScreen />}
    </AppLayout>
  );
}

export default App;
