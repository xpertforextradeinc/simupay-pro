import React, { useEffect, useRef } from 'react';

interface TradingViewWidgetProps {
  scriptSrc: string;
  config: object;
  containerId: string;
}

export function TradingViewWidget({ scriptSrc, config, containerId }: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check if script already exists to prevent duplicates on re-render
    const existingScript = document.getElementById(`tv-script-${containerId}`);
    if (existingScript) return;

    const script = document.createElement('script');
    script.id = `tv-script-${containerId}`;
    script.src = scriptSrc;
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify(config);

    containerRef.current.appendChild(script);

    return () => {
      // Cleanup script if component unmounts
      if (containerRef.current && script.parentNode) {
        containerRef.current.removeChild(script);
      }
    };
  }, [scriptSrc, config, containerId]);

  return (
    <div className="tradingview-widget-container" ref={containerRef} style={{ height: '100%', width: '100%' }}>
      <div className="tradingview-widget-container__widget" style={{ height: '100%', width: '100%' }}></div>
    </div>
  );
}
