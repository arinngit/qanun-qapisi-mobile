/**
 * Navigation transition utilities for fade animations
 * Expo Router uses @react-navigation/native-stack which supports 'fade' animation
 * Note: 'fade' animation works on iOS. On Android, it may fall back to default slide animation.
 */

export const fadeTransitionConfig = {
  animation: "fade" as const,
};
