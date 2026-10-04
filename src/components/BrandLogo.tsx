import React from 'react';
import {
  Image,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type Props = {
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function BrandLogo({ size = 72, style }: Props) {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Image
        source={require('../../assets/images/logo-calculadora-electrica.png')}
        style={{ width: size, height: size, borderRadius: size * 0.22 }}
        resizeMode="contain"
        accessibilityLabel="ElectroCalc"
      />
    </View>
  );
}
