import React, { useState, useEffect } from 'react';

const TypewriterText = ({
  text = "Explore Setups",
  typingSpeed = 120,
  deletingSpeed = 60,
  pauseDuration = 2000,
  className = "",
  style = {}
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer;

    if (!isDeleting && displayText.length < text.length) {
      // Typing phase: letters appear one by one left to right
      timer = setTimeout(() => {
        setDisplayText(text.slice(0, displayText.length + 1));
      }, typingSpeed);
    } else if (!isDeleting && displayText.length === text.length) {
      // Pause briefly when fully typed
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, pauseDuration);
    } else if (isDeleting && displayText.length > 0) {
      // Deleting phase: erase step by step
      timer = setTimeout(() => {
        setDisplayText(text.slice(0, displayText.length - 1));
      }, deletingSpeed);
    } else if (isDeleting && displayText.length === 0) {
      // Pause briefly before restarting typing cycle
      timer = setTimeout(() => {
        setIsDeleting(false);
      }, 500);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, text, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <span className={`inline-flex items-center ${className}`} style={style}>
      <span>{displayText}</span>
      <span className="inline-block w-[3px] h-[0.85em] ml-1 bg-current animate-blink align-baseline rounded-full" />
    </span>
  );
};

export default TypewriterText;
