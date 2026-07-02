import React, { useEffect, useRef } from 'react';

interface TradingViewWidgetProps {
  scriptSrc: string;
  config: object;
  containerId: string;
}

export function TradingViewWidget({ scriptSrc, config, containerId }: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const configStr = JSON.stringify(config);

  useEffect(() => {
    if (!containerRef.current || !widgetRef.current) return;

    // Clear any previous script or loaded iframe inside the container
    const existingScripts = containerRef.current.querySelectorAll('script');
    existingScripts.forEach(s => s.remove());

    // Re-create the widget div contents to be clean
    widgetRef.current.innerHTML = '';

    // Create the script tag
    const script = document.createElement('script');
    // Append a unique timestamp to force the browser to execute the script on each mount
    script.src = `${scriptSrc}?t=${Date.now()}`;
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = configStr;

    containerRef.current.appendChild(script);

    return () => {
      // Cleanup the script and empty the widget
      script.remove();
      if (widgetRef.current) {
        widgetRef.current.innerHTML = '';
      }
    };
  }, [scriptSrc, containerId, configStr]);

  return (
    <div 
      className="tradingview-widget-container absolute inset-0 w-full h-full flex flex-col" 
      ref={containerRef}
    >
      <div 
        className="tradingview-widget-container__widget flex-1 w-full h-full min-h-[500px]" 
        ref={widgetRef}
      />
    </div>
  );
}
