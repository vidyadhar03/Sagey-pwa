/**
 * Simple analytics utility for tracking user interactions
 */

interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
}

export function trackEvent(eventName: string, properties: Record<string, any> = {}) {
  // In a real implementation, this would send to your analytics provider
  // For now, we'll just log to console in development
  
  const event: AnalyticsEvent = {
    event: eventName,
    properties: {
      ...properties,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
    }
  };
  
  // Development logging
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Analytics Event:', event);
  }
  
  // In production, you would send this to your analytics service
  // Example: analytics.track(event.event, event.properties);
}

// Specific tracking functions for psycho-analysis
export function trackPsyHypeView(variant: "witty" | "poetic", confidence?: string) {
  trackEvent('psy_hype_view', {
    variant,
    confidence,
    feature: 'psycho-analysis'
  });
}

export function trackPsyHypeShare(variant: "witty" | "poetic", confidence?: string) {
  trackEvent('psy_hype_share', {
    variant,
    confidence,
    feature: 'psycho-analysis'
  });
}

export function trackVariantSwitch(fromVariant: "witty" | "poetic", toVariant: "witty" | "poetic") {
  trackEvent('psy_hype_variant_switch', {
    from_variant: fromVariant,
    to_variant: toVariant,
    feature: 'psycho-analysis'
  });
} 