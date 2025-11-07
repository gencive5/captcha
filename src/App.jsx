import React, { useState } from 'react';
import TimelapseCaptcha from './components/TimelapseCaptcha';
import TimeBasedBackground from './components/TimeBasedBackground';
import './App.css';

function App() {
  const [captchaResult, setCaptchaResult] = useState(null);

  const handleCaptchaVerify = (success, message) => {
    setCaptchaResult(success ? 'success' : 'failed');
    console.log('CAPTCHA Result:', success, message);
  };

  const handleCaptchaError = (error) => {
    console.error('CAPTCHA Error:', error);
    setCaptchaResult('error');
  };

  return (
    <>
      <TimeBasedBackground />
      <div className="app">
        <header className="app-header">
          <h1>Timelapse CAPTCHA Demo</h1>
          <p>Slide the puzzle piece to complete the moving image</p>
        </header>

        <main className="app-main">
          <TimelapseCaptcha
            onVerify={handleCaptchaVerify}
            onError={handleCaptchaError}
            difficulty="medium"
          />

          {captchaResult === 'success' && (
            <div className="result success">
              ✅ CAPTCHA completed successfully!
            </div>
          )}

          {captchaResult === 'failed' && (
            <div className="result error">
              ❌ CAPTCHA verification failed. Please try again.
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default App;