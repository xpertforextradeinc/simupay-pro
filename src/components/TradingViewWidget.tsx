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

    // Clean up any existing content
    containerRef.current.innerHTML = '';

    // Create the widget wrapper
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container__widget w-full h-full min-h-[500px]';

    // Create the script tag
    const script = document.createElement('script');
    script.src = scriptSrc;
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify(config);

    // Append to container
    containerRef.current.appendChild(widgetContainer);
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [scriptSrc, JSON.stringify(config), containerId]);

  return (
    <div 
      className="tradingview-widget-container absolute inset-0 w-full h-full flex flex-col" 
      ref={containerRef}
    />
  );
}
