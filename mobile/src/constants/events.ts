/**
 * Analytics Event Constants
 *
 * Centralized event names for PostHog tracking.
 * Each event includes documentation explaining:
 * - Why it exists
 * - What product decision it supports
 * - What data is captured (privacy-conscious)
 */

export const ANALYTICS_EVENTS = {
  /**
   * App Lifecycle Events
   */

  /**
   * app_opened
   *
   * Purpose: Track daily active users (DAU) and app launch frequency.
   * Product Decision: Understand user engagement patterns and retention.
   * Data: Timestamp, app version, platform (no PII)
   */
  APP_OPENED: "app_opened",

  /**
   * User Acquisition Events
   */

  /**
   * signup_completed
   *
   * Purpose: Measure signup funnel conversion rate.
   * Product Decision: Optimize onboarding flow and identify drop-off points.
   * Data: Signup method (email/google), timestamp (no email, no name)
   */
  SIGNUP_COMPLETED: "signup_completed",

  /**
   * onboarding_completed
   *
   * Purpose: Track completion rate of language preference setup.
   * Product Decision: Identify if users drop off during onboarding and optimize flow.
   * Data: Native language, target language, completion time (no PII)
   */
  ONBOARDING_COMPLETED: "onboarding_completed",

  /**
   * Engagement Events
   */

  /**
   * scenario_selected
   *
   * Purpose: Understand which scenarios are most popular and engagement patterns.
   * Product Decision: Prioritize scenario development and optimize scenario discovery.
   * Data: Scenario ID, difficulty level, is_premium (no scenario content, no user messages)
   */
  SCENARIO_SELECTED: "scenario_selected",

  /**
   * conversation_started
   *
   * Purpose: Track conversation initiation rate and user engagement.
   * Product Decision: Measure feature adoption and identify barriers to starting conversations.
   * Data: Scenario ID, session ID (no message content, no user input)
   */
  CONVERSATION_STARTED: "conversation_started",

  /**
   * conversation_completed
   *
   * Purpose: Measure conversation completion rate and session quality.
   * Product Decision: Understand if users finish conversations and optimize for completion.
   * Data: Session ID, duration, message count, XP earned (no message content)
   */
  CONVERSATION_COMPLETED: "conversation_completed",

  /**
   * conversation_abandoned
   *
   * Purpose: Identify when users leave conversations early and why.
   * Product Decision: Optimize conversation flow to reduce abandonment.
   * Data: Session ID, duration, message count, last action (no message content)
   */
  CONVERSATION_ABANDONED: "conversation_abandoned",

  /**
   * Monetization Events
   */

  /**
   * paywall_viewed
   *
   * Purpose: Track paywall impressions and conversion funnel.
   * Product Decision: Optimize paywall placement and messaging for conversion.
   * Data: Source (where paywall was triggered), timestamp (no user info)
   */
  PAYWALL_VIEWED: "paywall_viewed",

  /**
   * upgrade_clicked
   *
   * Purpose: Measure paywall engagement and click-through rate.
   * Product Decision: A/B test paywall designs and optimize CTA placement.
   * Data: Package selected, source (no payment info)
   */
  UPGRADE_CLICKED: "upgrade_clicked",

  /**
   * purchase_completed
   *
   * Purpose: Track revenue and conversion rate from paywall to purchase.
   * Product Decision: Measure monetization effectiveness and optimize pricing.
   * Data: Package type, price, platform (no payment details, no card info)
   */
  PURCHASE_COMPLETED: "purchase_completed",
} as const;

/**
 * Type-safe event names
 */
export type AnalyticsEvent =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];
