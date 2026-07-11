import * as Haptics from 'expo-haptics';

/**
 * The app's three confirmation moments (design D9): chat send, save landed,
 * share completed. Deliberately tiny — anything more reads as gimmick.
 * Best-effort: haptics failing (simulator, Android without vibrator) must
 * never surface.
 */
export function tapLight(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function notifySuccess(): void {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}
