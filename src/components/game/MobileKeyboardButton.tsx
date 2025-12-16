import React, { useRef, useEffect } from 'react';

interface MobileKeyboardButtonProps {
  onInput: (char: string) => void;
  autoFocus?: boolean;
}

export const MobileKeyboardButton: React.FC<MobileKeyboardButtonProps> = ({
  onInput,
  autoFocus = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus to keep keyboard open on mobile
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      const focusInput = () => {
        inputRef.current?.focus();
      };
      focusInput();
      const interval = setInterval(focusInput, 1000);
      return () => clearInterval(interval);
    }
  }, [autoFocus]);

  const handleClick = () => {
    inputRef.current?.focus();
    inputRef.current?.click();
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length > 0) {
      const char = value.slice(-1).toUpperCase();
      onInput(char);
      e.target.value = '';
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="fixed bottom-8 right-8 z-[100] flex h-[70px] w-[70px] items-center justify-center rounded-full border-2 border-primary bg-primary/30 text-2xl text-primary backdrop-blur-sm box-glow transition-all hover:bg-primary/50 md:hidden"
        aria-label="Open keyboard"
      >
        ⌨️
      </button>
      <input
        ref={inputRef}
        type="text"
        onChange={handleInput}
        className="fixed -top-[9999px] left-0 opacity-0"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />
    </>
  );
};
