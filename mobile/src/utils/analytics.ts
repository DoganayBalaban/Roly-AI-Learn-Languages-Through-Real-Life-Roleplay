/**
 * Analytics Utility
 *
 * Typed helpers for PostHog event tracking.
 * Ensures consistent event structure and privacy compliance.
 */

import Constants from "expo-constants";
import { usePostHog } from "posthog-react-native";
import { Platform } from "react-native";
import { AnalyticsEvent } from "../constants/events";

/**
 * Event Properties Interface
 * Ensures we only track safe, non-PII data
 * Matches PostHog's JsonType (no undefined allowed)
 */
export interface EventProperties {
  [key: string]: string | number | boolean | null;
}

/**
 * Initialize PostHog with privacy-first configuration
 *
 * This should be called once in App.tsx before rendering
 */
export const initializePostHog = (apiKey: string, host: string) => {
  // PostHog initialization is handled by PostHogProvider in App.tsx
  // This function exists for future programmatic configuration if needed
  return {
    apiKey,
    host,
  };
};

/**
 * Hook to access PostHog instance
 * Use this in components to track events
 */
export const useAnalytics = () => {
  const posthog = usePostHog();

  /**
   * Track a custom event with typed properties
   *
   * @param event - Event name from ANALYTICS_EVENTS
   * @param properties - Event properties (no PII allowed)
   */
  const track = (event: AnalyticsEvent, properties?: EventProperties) => {
    if (!posthog) {
      console.warn("PostHog not initialized");
      return;
    }

    // Add common properties to all events
    const enrichedProperties = {
      ...properties,
      platform: Platform.OS,
      app_version: Constants.expoConfig?.version || "unknown",
      timestamp: new Date().toISOString(),
    };

    posthog.capture(event, enrichedProperties);
  };

  /**
   * Identify a user (with anonymized ID only)
   *
   * @param userId - User ID from backend (not email or name)
   * @param properties - User properties (no PII)
   */
  const identify = (userId: string, properties?: EventProperties) => {
    if (!posthog) {
      console.warn("PostHog not initialized");
      return;
    }

    // Only identify with user ID, never with email or name
    posthog.identify(userId, {
      ...properties,
      platform: Platform.OS,
    });
  };

  /**
   * Reset user identification (on logout)
   */
  const reset = () => {
    if (!posthog) {
      return;
    }
    posthog.reset();
  };

  /**
   * Set user properties (safe, non-PII data only)
   *
   * @param properties - User properties (e.g., is_premium, target_language)
   */
  const setUserProperties = (properties: EventProperties) => {
    if (!posthog) {
      return;
    }
    // PostHog React Native uses identify() with properties for user properties
    posthog.identify(undefined, properties);
  };

  return {
    track,
    identify,
    reset,
    setUserProperties,
  };
};

/**
 * Standalone tracking function for use outside React components
 * Use this in services, utils, or class components
 */
let posthogInstance: any = null;

export const setPostHogInstance = (instance: any) => {
  posthogInstance = instance;
};

export const trackEvent = (
  event: AnalyticsEvent,
  properties?: EventProperties
) => {
  if (!posthogInstance) {
    console.warn("PostHog instance not set");
    return;
  }

  const enrichedProperties = {
    ...properties,
    platform: Platform.OS,
    app_version: Constants.expoConfig?.version || "unknown",
    timestamp: new Date().toISOString(),
  };

  posthogInstance.capture(event, enrichedProperties);
};
