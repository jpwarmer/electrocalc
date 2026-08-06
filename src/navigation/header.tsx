import React from 'react';
import { HamburgerMenuButton } from '@/src/components/HamburgerMenu';
import { colors, fonts } from '@/src/theme';

/** Header compartido: hamburguesa + título corto. */
export function calculatorHeaderOptions(title: string) {
  return {
    title,
    headerShown: true as const,
    headerStyle: { backgroundColor: colors.bg },
    headerTintColor: colors.ink,
    headerTitleStyle: {
      fontFamily: fonts.display,
      fontSize: 18,
    },
    headerShadowVisible: false,
    headerLeft: () => <HamburgerMenuButton />,
  };
}
