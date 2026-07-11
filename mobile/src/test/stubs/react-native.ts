/**
 * Vitest runs on node — this stub stands in for 'react-native' so pure-logic
 * modules that touch Platform (e.g. theme/fonts.ts) stay unit-testable.
 * Tests see the iOS branch of Platform.select.
 */
export const Platform = {
  OS: 'ios' as const,
  select<T>(spec: { ios?: T; android?: T; default?: T }): T | undefined {
    return 'ios' in spec ? spec.ios : spec.default;
  },
};
