import React, { useEffect } from 'react';

const TimeBasedBackground = () => {
  const calculateBackgroundColor = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const month = now.getMonth();
    
    // Calculate time progress (0 to 1 throughout the day)
    const dayProgress = (hours * 60 + minutes) / (24 * 60);
    
    // Calculate seasonal adjustment (0 to 1 throughout the year)
    const yearProgress = (month * 30 + now.getDate()) / 365;
    
    // Base colors for different times of day
    const timeColors = {
      night: { r: 36, g: 36, b: 68 },     // Deep blue-night
      dawn: { r: 120, g: 80, b: 160 },    // Purple dawn
      morning: { r: 70, g: 130, b: 180 }, // Steel blue morning
      afternoon: { r: 60, g: 100, b: 140 }, // Cool blue afternoon
      dusk: { r: 80, g: 60, b: 120 },     // Purple dusk
      lateNight: { r: 20, g: 20, b: 40 }  // Very dark blue
    };
    
    // Determine time segment
    let startColor, endColor, blendFactor;
    
    if (hours >= 0 && hours < 4) {
      // Late night to night
      startColor = timeColors.lateNight;
      endColor = timeColors.night;
      blendFactor = hours / 4;
    } else if (hours >= 4 && hours < 7) {
      // Night to dawn
      startColor = timeColors.night;
      endColor = timeColors.dawn;
      blendFactor = (hours - 4) / 3;
    } else if (hours >= 7 && hours < 10) {
      // Dawn to morning
      startColor = timeColors.dawn;
      endColor = timeColors.morning;
      blendFactor = (hours - 7) / 3;
    } else if (hours >= 10 && hours < 15) {
      // Morning to afternoon
      startColor = timeColors.morning;
      endColor = timeColors.afternoon;
      blendFactor = (hours - 10) / 5;
    } else if (hours >= 15 && hours < 19) {
      // Afternoon to dusk
      startColor = timeColors.afternoon;
      endColor = timeColors.dusk;
      blendFactor = (hours - 15) / 4;
    } else {
      // Dusk to late night
      startColor = timeColors.dusk;
      endColor = timeColors.lateNight;
      blendFactor = (hours - 19) / 5;
    }
    
    // Blend colors
    const r = Math.round(startColor.r + (endColor.r - startColor.r) * blendFactor);
    const g = Math.round(startColor.g + (endColor.g - startColor.g) * blendFactor);
    const b = Math.round(startColor.b + (endColor.b - startColor.b) * blendFactor);
    
    // Seasonal adjustments - subtle hue shifts
    const seasonalHueShift = Math.sin(yearProgress * Math.PI * 2) * 10; // ±10 degrees
    
    // Convert to HSL for seasonal adjustment
    const hsl = rgbToHsl(r, g, b);
    hsl.h = (hsl.h + seasonalHueShift + 360) % 360;
    
    // Convert back to RGB
    const finalRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    
    return `rgb(${finalRgb.r}, ${finalRgb.g}, ${finalRgb.b})`;
  };

  // Helper function: RGB to HSL conversion
  const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  };

  // Helper function: HSL to RGB conversion
  const hslToRgb = (h, s, l) => {
    h /= 360;
    s /= 100;
    l /= 100;
    
    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  };

  useEffect(() => {
    const updateBackground = () => {
      const newColor = calculateBackgroundColor();
      
      // Apply smooth transitions and update background color
      document.documentElement.style.transition = 'background-color 3s ease-in-out';
      document.body.style.transition = 'background-color 3s ease-in-out';
      document.documentElement.style.backgroundColor = newColor;
      document.body.style.backgroundColor = newColor;
    };

    // Initial update
    updateBackground();
    
    // Set up interval to update every minute
    const interval = setInterval(updateBackground, 60000);

    // Cleanup function
    return () => {
      clearInterval(interval);
      // Reset background when component unmounts
      document.documentElement.style.backgroundColor = '';
      document.body.style.backgroundColor = '';
    };
  }, []);

  // This component doesn't render anything visible
  return null;
};

export default TimeBasedBackground;