// TimelapseCaptcha.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import './TimelapseCaptcha.css';

const TimelapseCaptcha = ({ onVerify, onError, difficulty = 'medium' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(0);
  const [sessionToken, setSessionToken] = useState(null);
  
  const mainVideoRef = useRef(null);
  const pieceVideoRef = useRef(null);
  const puzzlePieceRef = useRef(null);
  const sliderTrackRef = useRef(null);
  const isDraggingRef = useRef(false);
  
  const correctPositionRef = useRef(null);
  const containerSizeRef = useRef({ width: 400, height: 300 });

  // Initialize captcha
  useEffect(() => {
    initializeCaptcha();
  }, [difficulty]);

  const initializeCaptcha = async () => {
    try {
      setIsLoading(true);
      
      // Generate challenge on server
      const challenge = await generateChallenge();
      correctPositionRef.current = challenge.correctPosition;
      setSessionToken(challenge.token);
      
      // Load videos
      await loadVideos();
      
      // Set initial position
      updatePiecePosition(0);
      
      setIsLoading(false);
    } catch (error) {
      onError?.('Failed to initialize CAPTCHA');
    }
  };

  const generateChallenge = async () => {
    // In real implementation, this would be an API call
    const mockChallenge = {
      correctPosition: Math.floor(Math.random() * 300),
      token: `captcha_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      videoSrc: '/captcha-timelapse.mp4' // Your timelapse video
    };
    
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockChallenge), 500);
    });
  };

  const loadVideos = () => {
    return new Promise((resolve) => {
      let videosLoaded = 0;
      
      const checkLoaded = () => {
        videosLoaded++;
        if (videosLoaded === 2) {
          synchronizeVideos();
          resolve();
        }
      };

      if (mainVideoRef.current) {
        mainVideoRef.current.addEventListener('loadeddata', checkLoaded);
        mainVideoRef.current.addEventListener('canplay', checkLoaded);
      }
      
      if (pieceVideoRef.current) {
        pieceVideoRef.current.addEventListener('loadeddata', checkLoaded);
        pieceVideoRef.current.addEventListener('canplay', checkLoaded);
      }
    });
  };

  const synchronizeVideos = () => {
    if (!mainVideoRef.current || !pieceVideoRef.current) return;

    // Sync playback
    mainVideoRef.current.addEventListener('timeupdate', () => {
      if (pieceVideoRef.current) {
        pieceVideoRef.current.currentTime = mainVideoRef.current.currentTime;
      }
    });

    // Set random start time for variation
    const randomStart = Math.random() * (mainVideoRef.current.duration || 10);
    mainVideoRef.current.currentTime = randomStart;
    
    // Start playback
    mainVideoRef.current.play().catch(console.error);
    pieceVideoRef.current.play().catch(console.error);
  };

  const updatePiecePosition = useCallback((percentage) => {
    if (!puzzlePieceRef.current || !mainVideoRef.current) return;

    const maxX = containerSizeRef.current.width - puzzlePieceRef.current.offsetWidth;
    const xPos = (percentage / 100) * maxX;
    
    // Update puzzle piece position
    puzzlePieceRef.current.style.left = `${xPos}px`;
    
    // Update video crop to show correct portion
    updateVideoCrop(xPos);
  }, []);

  const updateVideoCrop = (xPos) => {
    if (!pieceVideoRef.current || !correctPositionRef.current) return;

    const yPos = correctPositionRef.current.y;
    pieceVideoRef.current.style.transform = `translate(-${xPos}px, -${yPos}px)`;
  };

  // Mouse event handlers
  const handleSliderMouseDown = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDraggingRef.current || !sliderTrackRef.current) return;

    const trackRect = sliderTrackRef.current.getBoundingClientRect();
    let newX = e.clientX - trackRect.left;
    newX = Math.max(0, Math.min(newX, trackRect.width));
    
    const percentage = (newX / trackRect.width) * 100;
    setSliderPosition(percentage);
    updatePiecePosition(percentage);
  }, [updatePiecePosition]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  // Touch event handlers for mobile
  const handleSliderTouchStart = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleTouchMove = useCallback((e) => {
    if (!isDraggingRef.current || !sliderTrackRef.current) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const trackRect = sliderTrackRef.current.getBoundingClientRect();
    let newX = touch.clientX - trackRect.left;
    newX = Math.max(0, Math.min(newX, trackRect.width));
    
    const percentage = (newX / trackRect.width) * 100;
    setSliderPosition(percentage);
    updatePiecePosition(percentage);
  }, [updatePiecePosition]);

  const handleTouchEnd = useCallback(() => {
    isDraggingRef.current = false;
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  }, [handleTouchMove]);

  const handleVerify = async () => {
    try {
      const currentX = parseInt(puzzlePieceRef.current?.style.left || '0');
      const tolerance = getToleranceByDifficulty(difficulty);
      
      const result = await verifyCaptcha({
        position: currentX,
        token: sessionToken,
        tolerance
      });
      
      if (result.success) {
        setIsVerified(true);
        onVerify?.(true);
      } else {
        onVerify?.(false, 'Verification failed');
        // Reset for retry
        await initializeCaptcha();
        setSliderPosition(0);
      }
    } catch (error) {
      onError?.('Verification error');
    }
  };

  const getToleranceByDifficulty = (diff) => {
    const tolerances = {
      easy: 20,
      medium: 10,
      hard: 5
    };
    return tolerances[diff] || 10;
  };

  const verifyCaptcha = async (data) => {
    // Mock verification - replace with actual API call
    const correctX = correctPositionRef.current?.x || 0;
    const isCorrect = Math.abs(data.position - correctX) <= data.tolerance;
    
    return new Promise((resolve) => {
      setTimeout(() => resolve({ 
        success: isCorrect,
        score: isCorrect ? 100 : 0
      }), 500);
    });
  };

  if (isLoading) {
    return (
      <div className="captcha-loading">
        <div className="loading-spinner"></div>
        <p>Loading CAPTCHA...</p>
      </div>
    );
  }

  return (
    <div className="timelapse-captcha">
      <div className="captcha-header">
        <h3>Slide to complete the puzzle</h3>
        <p>Align the moving piece with the background</p>
      </div>
      
      <div 
        className="timelapse-container"
        style={{ width: containerSizeRef.current.width, height: containerSizeRef.current.height }}
      >
        <video
          ref={mainVideoRef}
          className="main-timelapse"
          loop
          muted
          playsInline
        >
          <source src="/captcha-timelapse.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        <div
          ref={puzzlePieceRef}
          className="puzzle-piece"
        >
          <video
            ref={pieceVideoRef}
            className="piece-timelapse"
            loop
            muted
            playsInline
          >
            <source src="/captcha-timelapse.mp4" type="video/mp4" />
          </video>
        </div>
      </div>

      <div className="slider-section">
        <div 
          ref={sliderTrackRef}
          className="slider-track"
          onMouseDown={handleSliderMouseDown}
          onTouchStart={handleSliderTouchStart}
        >
          <div 
            className="slider-handle"
            style={{ left: `${sliderPosition}%` }}
          />
        </div>
        
        <div className="slider-labels">
          <span>← Slide →</span>
        </div>
      </div>

      <div className="captcha-actions">
        <button 
          onClick={handleVerify}
          disabled={isVerified}
          className={`verify-btn ${isVerified ? 'verified' : ''}`}
        >
          {isVerified ? '✓ Verified' : 'Verify'}
        </button>
        
        <button 
          onClick={initializeCaptcha}
          className="refresh-btn"
        >
          ↻ Refresh
        </button>
      </div>

      {isVerified && (
        <div className="success-message">
          ✓ CAPTCHA verified successfully!
        </div>
      )}
    </div>
  );
};

export default TimelapseCaptcha;