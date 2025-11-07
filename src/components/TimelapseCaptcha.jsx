// TimelapseCaptcha.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import './TimelapseCaptcha.css';

const TimelapseCaptcha = ({ onVerify, onError, difficulty = 'medium' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(0);
  const [sessionToken, setSessionToken] = useState(null);
  
  const puzzleContainerRef = useRef(null);
  const puzzlePieceRef = useRef(null);
  const puzzleHoleRef = useRef(null);
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
      
      // Generate challenge
      const challenge = await generateChallenge();
      correctPositionRef.current = challenge.correctPosition;
      setSessionToken(challenge.token);
      
      // Set initial position
      updatePiecePosition(0);
      
      setIsLoading(false);
    } catch (error) {
      onError?.('Failed to initialize CAPTCHA');
    }
  };

  const generateChallenge = async () => {
    const pieceWidth = 80;
    const pieceHeight = 80;
    const containerWidth = 400;
    const containerHeight = 300;
    
    // Fixed Y position for both piece and hole (centered vertically)
    const fixedY = (containerHeight - pieceHeight) / 2;
    
    // Random X position for the puzzle hole (within bounds)
    const randomX = Math.floor(Math.random() * (containerWidth - pieceWidth - 40)) + 20;
    
    const mockChallenge = {
      correctPosition: { x: randomX, y: fixedY },
      token: `captcha_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      imageSrc: '/api/placeholder/400/300' // Replace with your image path
    };
    
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockChallenge), 500);
    });
  };

  const updatePiecePosition = useCallback((percentage) => {
    if (!puzzlePieceRef.current || !puzzleContainerRef.current) return;

    const containerWidth = puzzleContainerRef.current.offsetWidth;
    const pieceWidth = puzzlePieceRef.current.offsetWidth;
    const maxX = containerWidth - pieceWidth;
    const xPos = (percentage / 100) * maxX;
    
    // Update puzzle piece position (only horizontal movement)
    puzzlePieceRef.current.style.left = `${xPos}px`;
    
    // Update the background position of the puzzle piece to match the hole position
    updatePieceBackground(xPos);
  }, []);

  const updatePieceBackground = (xPos) => {
    if (!puzzlePieceRef.current || !correctPositionRef.current) return;

    const correctPos = correctPositionRef.current;
    // The puzzle piece shows the portion of the image that should fit in the hole
    puzzlePieceRef.current.style.backgroundPosition = `-${correctPos.x}px -${correctPos.y}px`;
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
    
    // Auto-verify if close to correct position
    autoVerifyIfClose();
  }, [handleMouseMove]);

  const autoVerifyIfClose = () => {
    if (!puzzlePieceRef.current || !correctPositionRef.current) return;

    const currentX = parseInt(puzzlePieceRef.current.style.left || '0');
    const correctX = correctPositionRef.current.x;
    const tolerance = getToleranceByDifficulty(difficulty);
    
    if (Math.abs(currentX - correctX) <= tolerance) {
      // Snap to correct position
      const percentage = (correctX / (containerSizeRef.current.width - 80)) * 100;
      setSliderPosition(percentage);
      updatePiecePosition(percentage);
      
      // Auto-verify
      setTimeout(() => {
        handleVerify(true);
      }, 300);
    }
  };

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
    
    autoVerifyIfClose();
  }, [handleTouchMove]);

  const handleVerify = async (autoVerified = false) => {
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
        
        // Visual feedback - snap piece into hole
        if (puzzlePieceRef.current && correctPositionRef.current) {
          puzzlePieceRef.current.style.left = `${correctPositionRef.current.x}px`;
          puzzlePieceRef.current.style.boxShadow = '0 0 0 3px #48bb78, 0 4px 12px rgba(72, 187, 120, 0.4)';
          puzzlePieceRef.current.classList.add('correct-position');
        }
      } else {
        if (!autoVerified) {
          onVerify?.(false, 'Verification failed');
        }
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
      easy: 25,
      medium: 15,
      hard: 8
    };
    return tolerances[diff] || 15;
  };

  const verifyCaptcha = async (data) => {
    // Mock verification
    const correctX = correctPositionRef.current?.x || 150;
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
        <h3>Slide the puzzle piece into the empty space</h3>
        <p>Match the pattern to complete the image</p>
      </div>
      
      <div 
        ref={puzzleContainerRef}
        className="puzzle-container"
        style={{ width: containerSizeRef.current.width, height: containerSizeRef.current.height }}
      >
        {/* Background Image with Puzzle Hole */}
        <div 
          className="puzzle-background"
          style={{ 
            backgroundImage: `url('/api/placeholder/400/300')`
          }}
        />
        
        {/* Puzzle Hole/Cutout */}
        {correctPositionRef.current && (
          <div
            ref={puzzleHoleRef}
            className="puzzle-hole"
            style={{
              left: `${correctPositionRef.current.x}px`,
              top: `${correctPositionRef.current.y}px`
            }}
          />
        )}
        
        {/* Puzzle Piece */}
        <div
          ref={puzzlePieceRef}
          className="puzzle-piece"
          style={{ 
            backgroundImage: `url('/api/placeholder/400/300')`,
            top: correctPositionRef.current ? `${correctPositionRef.current.y}px` : '50%'
          }}
        />
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
          <span>← Slide to fit the puzzle →</span>
        </div>
      </div>

      <div className="captcha-actions">
        <button 
          onClick={() => handleVerify(false)}
          disabled={isVerified}
          className={`verify-btn ${isVerified ? 'verified' : ''}`}
        >
          {isVerified ? '✓ Verified' : 'Verify Position'}
        </button>
        
        <button 
          onClick={initializeCaptcha}
          className="refresh-btn"
        >
          ↻ New Puzzle
        </button>
      </div>

      {isVerified && (
        <div className="success-message">
          ✓ Puzzle completed successfully!
        </div>
      )}
    </div>
  );
};

export default TimelapseCaptcha;