import React from 'react';
import { Svg, Circle, Rect, Path, Ellipse, G } from 'react-native-svg';
import { Colors2026 } from '../../theme/designSystemV2';

interface EmptyHarvestIllustrationProps {
  size?: number;
  color?: string;
}

const EmptyHarvestIllustration: React.FC<EmptyHarvestIllustrationProps> = ({
  size = 120,
  color = Colors2026.primary,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      {/* Basket body (rounded trapezoid) */}
      <Path
        d="M25 55 L35 100 C35 104, 38 107, 42 107 L78 107 C82 107, 85 104, 85 100 L95 55Z"
        fill="#8D6E63"
      />

      {/* Basket rim */}
      <Path
        d="M22 52 L98 52 L95 58 L25 58Z"
        fill="#A1887F"
      />

      {/* Weave lines */}
      <Path d="M30 65 L90 65" stroke="#7B5B50" strokeWidth="1.5" />
      <Path d="M32 75 L88 75" stroke="#7B5B50" strokeWidth="1.5" />
      <Path d="M34 85 L86 85" stroke="#7B5B50" strokeWidth="1.5" />
      <Path d="M36 95 L84 95" stroke="#7B5B50" strokeWidth="1.5" />
      {/* Vertical weave */}
      <Path d="M45 55 L42 100" stroke="#7B5B50" strokeWidth="1" />
      <Path d="M60 55 L60 100" stroke="#7B5B50" strokeWidth="1" />
      <Path d="M75 55 L78 100" stroke="#7B5B50" strokeWidth="1" />

      {/* Red apple */}
      <Circle cx="48" cy="48" r="12" fill="#E53935" />
      <Path d="M48 36 C48 36, 50 32, 53 33" stroke="#5D4037" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Green elongated oval (zucchini) */}
      <G transform="rotate(-20, 70, 42)">
        <Ellipse cx="70" cy="42" rx="6" ry="12" fill="#2D9D4F" />
        <Path d="M70 30 C70 30, 72 26, 74 27" stroke="#1B7A37" strokeWidth="1" strokeLinecap="round" fill="none" />
      </G>

      {/* Orange small circle (mandarin) */}
      <Circle cx="82" cy="50" r="8" fill="#FF7043" />
      <Path d="M82 42 L82 40" stroke="#5D4037" strokeWidth="1" strokeLinecap="round" />
    </Svg>
  );
};

export default EmptyHarvestIllustration;
