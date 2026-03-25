import { AccessibilityInfo } from 'react-native';
import { useEffect, useState } from 'react';
import { FadeIn, FadeInUp } from 'react-native-reanimated';

export function useReduceMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => sub.remove();
  }, []);
  return reduceMotion;
}

export function safeFadeIn(reduceMotion: boolean, delay = 0) {
  return reduceMotion ? undefined : FadeIn.delay(delay).duration(300);
}

export function safeFadeInUp(reduceMotion: boolean, delay = 0) {
  return reduceMotion ? undefined : FadeInUp.delay(delay).duration(300);
}