'use client';

import React, { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';

export interface TurnstileWidgetHandle {
  reset: () => void;
}

interface TurnstileWidgetProps {
  action: string;
  onVerify: (token: string) => void;
  onError?: (error?: string) => void;
  onExpire?: () => void;
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        params: {
          sitekey: string;
          action?: string;
          theme?: 'dark' | 'light' | 'auto';
          size?: 'normal' | 'compact' | 'flexible';
          callback?: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoaded?: () => void;
  }
}

export const TurnstileWidget = forwardRef<TurnstileWidgetHandle, TurnstileWidgetProps>(
  ({ action, onVerify, onError, onExpire, className = '' }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    const siteKey =
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '0x4AAAAAAEsCNM915DbDDkam';

    const renderWidget = useCallback(() => {
      if (!containerRef.current || !window.turnstile || widgetIdRef.current) return;

      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action,
          theme: 'dark',
          size: 'flexible',
          callback: (token: string) => {
            onVerify(token);
          },
          'error-callback': () => {
            if (onError) onError('Turnstile challenge failed.');
          },
          'expired-callback': () => {
            if (onExpire) onExpire();
          },
        });
        widgetIdRef.current = id;
      } catch (err) {
        console.warn('[Turnstile] Render error:', err);
      }
    }, [action, onVerify, onError, onExpire, siteKey]);

    const reset = useCallback(() => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current);
        } catch (e) {
          console.warn('[Turnstile] Reset error:', e);
        }
      }
    }, []);

    useImperativeHandle(ref, () => ({
      reset,
    }));

    useEffect(() => {
      // Check if script is already injected
      const scriptId = 'cf-turnstile-script';
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;

      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          renderWidget();
        };
        document.head.appendChild(script);
      } else if (window.turnstile) {
        renderWidget();
      } else {
        const checkInterval = setInterval(() => {
          if (window.turnstile) {
            clearInterval(checkInterval);
            renderWidget();
          }
        }, 100);
        return () => clearInterval(checkInterval);
      }

      return () => {
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
            widgetIdRef.current = null;
          } catch (e) {}
        }
      };
    }, [renderWidget]);

    return (
      <div className={`turnstile-container my-3 ${className}`}>
        <div ref={containerRef} className="cf-turnstile min-h-[65px] flex items-center justify-center" />
      </div>
    );
  }
);

TurnstileWidget.displayName = 'TurnstileWidget';
