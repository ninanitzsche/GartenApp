import React from 'react';
import { Svg, Circle, Rect, Path, G } from 'react-native-svg';
import { Colors2026 } from '../../theme/designSystemV2';

interface EmptyPhotosIllustrationProps {
  size?: number;
  color?: string;
}

const EmptyPhotosIllustration: React.FC<EmptyPhotosIllustrationProps> = ({
  size = 120,
  color = Colors2026.primary,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      {/* Camera body */}
      <Rect x="20" y="40" width="80" height="55" rx="8" fill="#999999" />
      {/* Camera viewfinder hump */}
      <Rect x="42" y="32" width="36" height="12" rx="4" fill="#999999" />
      {/* Viewfinder window */}
      <Rect x="52" y="34" width="16" height="8" rx="2" fill="#BDBDBD" />

      {/* Camera lens (outer ring) */}
      <Circle cx="60" cy="68" r="18" fill="#1A1A1A" />
      {/* Lens inner ring */}
      <Circle cx="60" cy="68" r="13" fill="#333333" />
      {/* Lens highlight */}
      <Circle cx="56" cy="64" r="4" fill="#555555" opacity={0.6} />

      {/* Shutter button */}
      <Circle cx="82" cy="48" r="4" fill="#BDBDBD" />

      {/* Flower 1 - pink, top-left */}
      <G transform="translate(18, 20)">
        <Circle cx="0" cy="0" r="3" fill="#E91E63" />
        <Circle cx="5" cy="-3" r="3" fill="#E91E63" />
        <Circle cx="7" cy="3" r="3" fill="#E91E63" />
        <Circle cx="2" cy="6" r="3" fill="#E91E63" />
        <Circle cx="-4" cy="4" r="3" fill="#E91E63" />
        <Circle cx="-3" cy="-2" r="3" fill="#E91E63" />
        <Circle cx="2" cy="1" r="2" fill="#FFC107" />
      </G>

      {/* Flower 2 - yellow, top-right */}
      <G transform="translate(98, 22)">
        <Circle cx="0" cy="0" r="3" fill="#FFC107" />
        <Circle cx="4" cy="-3" r="3" fill="#FFC107" />
        <Circle cx="6" cy="2" r="3" fill="#FFC107" />
        <Circle cx="3" cy="5" r="3" fill="#FFC107" />
        <Circle cx="-2" cy="4" r="3" fill="#FFC107" />
        <Circle cx="0" cy="0" r="2" fill="#E91E63" />
      </G>

      {/* Flower 3 - purple, bottom-left */}
      <G transform="translate(22, 102)">
        <Circle cx="0" cy="0" r="3" fill="#9C27B0" />
        <Circle cx="5" cy="-2" r="3" fill="#9C27B0" />
        <Circle cx="5" cy="4" r="3" fill="#9C27B0" />
        <Circle cx="0" cy="5" r="3" fill="#9C27B0" />
        <Circle cx="-4" cy="3" r="3" fill="#9C27B0" />
        <Circle cx="0" cy="0" r="2" fill="#FFC107" />
      </G>

      {/* Flower 4 - pink, on top of camera */}
      <G transform="translate(74, 30)">
        <Circle cx="0" cy="0" r="2.5" fill="#E91E63" />
        <Circle cx="4" cy="-2" r="2.5" fill="#E91E63" />
        <Circle cx="4" cy="3" r="2.5" fill="#E91E63" />
        <Circle cx="-2" cy="3" r="2.5" fill="#E91E63" />
        <Circle cx="-2" cy="-2" r="2.5" fill="#E91E63" />
        <Circle cx="1" cy="0" r="1.5" fill="#FFC107" />
        {/* Stem */}
        <Path d="M0 3 C0 6, -2 8, -3 10" stroke={color} strokeWidth="1" strokeLinecap="round" fill="none" />
      </G>

      {/* Flower 5 - small yellow, bottom-right */}
      <G transform="translate(100, 100)">
        <Circle cx="0" cy="0" r="2.5" fill="#FFC107" />
        <Circle cx="4" cy="-2" r="2.5" fill="#FFC107" />
        <Circle cx="3" cy="3" r="2.5" fill="#FFC107" />
        <Circle cx="-2" cy="3" r="2.5" fill="#FFC107" />
        <Circle cx="-3" cy="-1" r="2.5" fill="#FFC107" />
        <Circle cx="0" cy="0" r="1.5" fill="#E91E63" />
      </G>
    </Svg>
  );
};

export default EmptyPhotosIllustration;
