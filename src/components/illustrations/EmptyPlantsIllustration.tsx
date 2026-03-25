import React from 'react';
import { Svg, Circle, Rect, Path, Ellipse, G } from 'react-native-svg';
import { Colors2026 } from '../../theme/designSystemV2';

interface EmptyPlantsIllustrationProps {
  size?: number;
  color?: string;
}

const EmptyPlantsIllustration: React.FC<EmptyPlantsIllustrationProps> = ({
  size = 120,
  color = Colors2026.primary,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      {/* Water droplet */}
      <Path
        d="M60 12 C60 12, 52 28, 52 34 C52 38.42 55.58 42 60 42 C64.42 42 68 38.42 68 34 C68 28 60 12 60 12Z"
        fill="#5B8DEF"
        opacity={0.7}
      />

      {/* Pot body */}
      <Rect x="38" y="72" width="44" height="32" rx="4" fill="#8D6E63" />
      {/* Pot rim */}
      <Ellipse cx="60" cy="72" rx="26" ry="6" fill="#8D6E63" />
      {/* Pot bottom */}
      <Ellipse cx="60" cy="104" rx="22" ry="4" fill="#7B5B50" />

      {/* Left stem */}
      <Path
        d="M50 72 C50 60, 40 52, 38 40"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right stem */}
      <Path
        d="M70 72 C70 58, 78 50, 80 38"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Left leaf */}
      <G transform="rotate(-45, 36, 42)">
        <Ellipse cx="36" cy="42" rx="8" ry="4" fill="#2D9D4F" />
      </G>

      {/* Right leaf */}
      <G transform="rotate(45, 82, 40)">
        <Ellipse cx="82" cy="40" rx="8" ry="4" fill="#2D9D4F" />
      </G>

      {/* Top center leaf */}
      <G transform="rotate(-20, 58, 52)">
        <Ellipse cx="58" cy="52" rx="7" ry="3.5" fill="#2D9D4F" />
      </G>
    </Svg>
  );
};

export default EmptyPlantsIllustration;
