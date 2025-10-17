import { useState, useEffect } from 'react';

export function useDecryptAnimation(text: string, duration: number = 2500) {
  const [displayText, setDisplayText] = useState('');
  const [isAnimating, setIsAnimating] = useState(true);

  const cryptoChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*+=?';

  useEffect(() => {
    if (!text || !isAnimating) return;

    const generateCryptoText = (originalText: string) => {
      return originalText.split('').map(char => {
        if (char === ' ' || char === '\n' || char === '\r' || /[.,!?;:]/.test(char)) {
          return char;
        }
        return cryptoChars[Math.floor(Math.random() * cryptoChars.length)];
      }).join('');
    };

    setDisplayText(generateCryptoText(text));

    const totalSteps = 30;
    const stepDuration = duration / totalSteps;
    let currentStep = 0;

    const animationInterval = setInterval(() => {
      currentStep++;
      
      const revealedCount = Math.floor((currentStep / totalSteps) * text.length);
      
      let newText = '';
      
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === ' ' || char === '\n' || char === '\r' || /[.,!?;:]/.test(char)) {
          newText += char;
        } else if (i < revealedCount) {
          newText += char;
        } else if (i === revealedCount && currentStep < totalSteps) {
          newText += Math.random() > 0.5 ? char : cryptoChars[Math.floor(Math.random() * cryptoChars.length)];
        } else {
          newText += cryptoChars[Math.floor(Math.random() * cryptoChars.length)];
        }
      }
      
      setDisplayText(newText);
      
      if (currentStep >= totalSteps) {
        clearInterval(animationInterval);
        setDisplayText(text);
        setIsAnimating(false);
      }
    }, stepDuration);

    return () => {
      clearInterval(animationInterval);
    };
  }, [text, duration, isAnimating]);

  return displayText;
}

