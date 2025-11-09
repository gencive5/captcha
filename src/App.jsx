import React, { useState } from 'react';
import TimelapseCaptcha from './components/TimelapseCaptcha';
import TimeBasedBackground from './components/TimeBasedBackground';
import OnlineShop from './components/OnlineShop'; // New component
import './App.css';

function App() {
  const [captchaResult, setCaptchaResult] = useState(null);
  const [showShop, setShowShop] = useState(false);

  const handleCaptchaVerify = (success, message) => {
    setCaptchaResult(success ? 'success' : 'failed');
    console.log('CAPTCHA Result:', success, message);
    
    if (success) {
      // Show success message briefly, then transition to shop
      setTimeout(() => {
        setShowShop(true);
      }, 1500);
    }
  };

  const handleCaptchaError = (error) => {
    console.error('CAPTCHA Error:', error);
    setCaptchaResult('error');
  };

  const handleReturnToCaptcha = () => {
    setShowShop(false);
    setCaptchaResult(null);
  };

  return (
    <>
      <TimeBasedBackground />
      <div className="app">
        {!showShop ? (
          <>
            <main className="app-main">
              <TimelapseCaptcha
                onVerify={handleCaptchaVerify}
                onError={handleCaptchaError}
                difficulty="medium"
              />

              {captchaResult === 'success' && (
                <div className="result success">
                  ✅ CAPTCHA completed successfully! Redirecting to shop...
                </div>
              )}

              {captchaResult === 'failed' && (
                <div className="result error">
                  ❌ CAPTCHA verification failed. Please try again.
                </div>
              )}
            </main>
          </>
        ) : (
          <OnlineShop onReturnToCaptcha={handleReturnToCaptcha} />
        )}
      </div>
    </>
  );
}

export default App;