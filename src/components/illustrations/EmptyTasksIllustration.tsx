import React from 'react';
import { Svg, Circle, Rect, Path, G } from 'react-native-svg';
import { Colors2026 } from '../../theme/designSystemV2';

interface EmptyTasksIllustrationProps {
  size?: number;
  color?: string;
}

const EmptyTasksIllustration: React.FC<EmptyTasksIllustrationProps> = ({
  size = 120,
  color = Colors2026.primary,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      {/* Ground line */}
      <Path d="M10 95 L110 95" stroke="#A1887F" strokeWidth="2" strokeLinecap="round" />

      {/* Tree trunk */}
      <Rect x="55" y="55" width="10" height="40" rx="2" fill="#8D6E63" />

      {/* Tree canopy circles */}
      <Circle cx="60" cy="40" r="20" fill={color} />
      <Circle cx="45" cy="48" r="16" fill={color} />
      <Circle cx="75" cy="48" r="16" fill={color} />

      {/* Bench seat */}
      <Rect x="28" y="88" width="24" height="4" rx="1" fill="#A1887F" />
      {/* Bench backrest */}
      <Rect x="28" y="80" width="24" height="4" rx="1" fill="#A1887F" />
      {/* Bench legs */}
      <Rect x="30" y="88" width="2" height="7" fill="#8D6E63" />
      <Rect x="48" y="88" width="2" height="7" fill="#8D6E63" />

      {/* Bird 1 (V-shape) */}
      <Path d="M50 32 C52 28, 54 30, 56 28 C54 30, 56 32, 58 30" stroke="#E53935" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Bird 2 (V-shape) */}
      <Path d="M66 26 C68 22, 70 24, 72 22 C70 24, 72 26, 74 24" stroke="#E53935" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </Svg>
  );
};

export default EmptyTasksIllustration;
