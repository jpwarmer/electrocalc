import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#1E293B" />
    </linearGradient>
    <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0284C7" />
      <stop offset="100%" stop-color="#0369A1" />
    </linearGradient>
    <linearGradient id="boltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047" />
      <stop offset="100%" stop-color="#EAB308" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />
  <rect x="16" y="16" width="480" height="480" rx="96" fill="none" stroke="#334155" stroke-width="4" opacity="0.5" />
  <rect x="112" y="76" width="288" height="360" rx="32" fill="#1E293B" stroke="#38BDF8" stroke-width="4" />
  <rect x="140" y="108" width="232" height="88" rx="16" fill="url(#screenGrad)" />
  <path d="M 156 152 Q 174 128, 192 152 T 228 152" fill="none" stroke="#BAE6FD" stroke-width="4" stroke-linecap="round" opacity="0.8" />
  <text x="352" y="160" font-family="system-ui, sans-serif" font-weight="700" font-size="32" fill="#FFFFFF" text-anchor="end">230 V</text>
  <rect x="140" y="220" width="64" height="48" rx="12" fill="#334155" />
  <rect x="224" y="220" width="64" height="48" rx="12" fill="#334155" />
  <rect x="308" y="220" width="64" height="48" rx="12" fill="#475569" />
  <rect x="140" y="284" width="64" height="48" rx="12" fill="#334155" />
  <rect x="224" y="284" width="64" height="48" rx="12" fill="#334155" />
  <rect x="308" y="284" width="64" height="48" rx="12" fill="#475569" />
  <rect x="140" y="348" width="64" height="48" rx="12" fill="#334155" />
  <rect x="224" y="348" width="64" height="48" rx="12" fill="#0284C7" />
  <rect x="308" y="348" width="64" height="48" rx="12" fill="#EAB308" />
  <g fill="#94A3B8" font-family="system-ui, sans-serif" font-weight="600" font-size="20" text-anchor="middle">
    <text x="172" y="251">7</text>
    <text x="256" y="251">8</text>
    <text x="340" y="251" fill="#F8FAFC">Ω</text>
    <text x="172" y="315">4</text>
    <text x="256" y="315">5</text>
    <text x="340" y="315" fill="#F8FAFC">A</text>
    <text x="172" y="379">1</text>
    <text x="256" y="379" fill="#F8FAFC">=</text>
    <text x="340" y="379" fill="#0F172A" font-weight="800">W</text>
  </g>
  <path d="M 280 40 L 200 240 L 260 240 L 220 440 L 340 200 L 270 200 Z"
        fill="url(#boltGrad)"
        stroke="#FEF08A"
        stroke-width="2"
        stroke-linejoin="round" />
</svg>`;

type Props = {
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function BrandLogo({ size = 72, style }: Props) {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <SvgXml xml={LOGO_SVG} width={size} height={size} />
    </View>
  );
}
