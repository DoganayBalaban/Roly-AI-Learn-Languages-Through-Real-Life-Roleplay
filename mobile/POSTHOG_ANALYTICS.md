# PostHog Analytics Integration

## Overview

PostHog analytics has been integrated into the RolyAI React Native app with privacy-first configuration, session replay, and comprehensive event tracking.

## Architecture

### Files Created

1. **`src/constants/events.ts`** - Centralized event constants with documentation
2. **`src/utils/analytics.ts`** - Typed analytics helpers and utilities

### Files Modified

1. **`App.tsx`** - PostHog initialization with session replay configuration
2. **`src/screens/LoginScreen.tsx`** - Signup tracking
3. **`src/screens/OnboardingScreen.tsx`** - Onboarding completion tracking
4. **`src/screens/ScenarioListScreen.tsx`** - Scenario selection tracking
5. **`src/screens/ChatScreen.tsx`** - Conversation lifecycle tracking with masking
6. **`src/screens/PaywallScreen.tsx`** - Monetization funnel tracking

## Configuration

### PostHog Setup

PostHog is configured in `App.tsx` with:

- **Session Replay**: Enabled with `enableSessionReplay: true`
- **Input Masking**: All text inputs are masked via `maskAllTextInputs: true`
- **Sampling Rate**: Configure in PostHog dashboard (target: 10-15%)
- **Privacy**: No PII captured in events

### Privacy Protection

1. **Input Fields**: Automatically masked by PostHog configuration
2. **Chat Content**: Never captured in event properties (only metadata)
3. **User Data**: Only anonymized user IDs, no emails or names
4. **Event Properties**: Only safe, non-PII data (e.g., scenario_id, duration, message_count)

## Event Tracking

### Core Events Implemented

| Event | Screen | Purpose |
|-------|--------|---------|
| `app_opened` | App.tsx | Track DAU and app launch frequency |
| `signup_completed` | LoginScreen | Measure signup funnel conversion |
| `onboarding_completed` | OnboardingScreen | Track onboarding completion rate |
| `scenario_selected` | ScenarioListScreen | Understand scenario popularity |
| `conversation_started` | ChatScreen | Track conversation initiation |
| `conversation_completed` | ChatScreen | Measure completion rates |
| `conversation_abandoned` | ChatScreen | Identify drop-off points |
| `paywall_viewed` | PaywallScreen | Track paywall impressions |
| `upgrade_clicked` | PaywallScreen | Measure upgrade intent |
| `purchase_completed` | PaywallScreen | Track revenue and conversion |

## Usage Examples

### In a React Component

```typescript
import { useAnalytics } from '../utils/analytics';
import { ANALYTICS_EVENTS } from '../constants/events';

function MyComponent() {
  const { track } = useAnalytics();

  const handleAction = () => {
    track(ANALYTICS_EVENTS.MY_EVENT, {
      property1: 'value1',
      property2: 123,
    });
  };

  return <Button onPress={handleAction} />;
}
```

### Outside React Components

```typescript
import { trackEvent } from '../utils/analytics';
import { ANALYTICS_EVENTS } from '../constants/events';

// In a service or utility
trackEvent(ANALYTICS_EVENTS.MY_EVENT, {
  property1: 'value1',
});
```

### User Identification

```typescript
import { useAnalytics } from '../utils/analytics';

function MyComponent() {
  const { identify, setUserProperties } = useAnalytics();

  useEffect(() => {
    // Identify user (with anonymized ID only, never email/name)
    identify(user.id, {
      is_premium: user.isPremium,
      target_language: user.preferences.targetLanguage,
    });
  }, [user]);
}
```

## Chat Screen Masking

The ChatScreen includes explicit privacy comments explaining:

1. **Input Masking**: TextInput components are automatically masked by PostHog
2. **Event Privacy**: Message content is never captured in event properties
3. **Session Replay**: Only UX flows are recorded, not chat content

See `src/screens/ChatScreen.tsx` for detailed privacy comments.

## PostHog Dashboard Configuration

### Session Replay Sampling Rate

To set the 10-15% sampling rate:

1. Go to PostHog Dashboard → Settings → Session Replay
2. Set sampling rate to 12% (or your preferred value between 10-15%)
3. This controls what percentage of sessions are recorded

### Event Funnels

Create funnels in PostHog dashboard:

1. **Signup Funnel**: `app_opened` → `signup_completed` → `onboarding_completed`
2. **Engagement Funnel**: `scenario_selected` → `conversation_started` → `conversation_completed`
3. **Monetization Funnel**: `paywall_viewed` → `upgrade_clicked` → `purchase_completed`

## Performance Considerations

- **Event Batching**: Configured with `flushAt: 20` and `flushInterval: 30`
- **Minimal Overhead**: PostHog SDK is optimized for React Native
- **Sampling**: Session replay sampling reduces performance impact

## Privacy Compliance

✅ No PII captured in events  
✅ All input fields masked  
✅ Chat content never captured  
✅ Only anonymized user IDs  
✅ Safe metadata only (scenario IDs, durations, counts)

## Environment Variables

Ensure you have set:

```env
EXPO_PUBLIC_POSTHOG_API_KEY=your_posthog_api_key
```

## Next Steps

1. Configure sampling rate in PostHog dashboard (10-15%)
2. Set up funnels and dashboards in PostHog
3. Monitor event tracking in PostHog dashboard
4. Adjust event properties as needed for product insights

