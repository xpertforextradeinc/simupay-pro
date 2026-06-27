import { useEffect, useRef } from 'react';
import { ActiveTab } from '../types';

export function useShortcuts(onTabSelect: (tab: ActiveTab) => void) {
  const onTabSelectRef = useRef(onTabSelect);

  useEffect(() => {
    onTabSelectRef.current = onTabSelect;
  }, [onTabSelect]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts if the user is typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      // Ignore if a modifier key is pressed (to not override native browser shortcuts)
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'd':
          e.preventDefault();
          onTabSelectRef.current('dashboard');
          break;
        case 't':
          e.preventDefault();
          onTabSelectRef.current('transactions');
          break;
        case 'w':
          e.preventDefault();
          onTabSelectRef.current('wallet');
          break;
        case 'f':
          e.preventDefault();
          onTabSelectRef.current('flash-transfer');
          break;
        case 'r':
          e.preventDefault();
          onTabSelectRef.current('receipt-generator');
          break;
        case 'a':
          e.preventDefault();
          onTabSelectRef.current('analytics');
          break;
        case 's':
          e.preventDefault();
          onTabSelectRef.current('settings');
          break;
        case 'n':
          e.preventDefault();
          onTabSelectRef.current('notifications');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
