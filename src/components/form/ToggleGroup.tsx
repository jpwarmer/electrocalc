import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, space } from '@/src/theme';

type Option<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  label: string;
  value: T;
  options: [Option<T>, Option<T>] | Option<T>[];
  onChange: (value: T) => void;
};

export function ToggleGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: Props<T>) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <Pressable
              key={String(opt.value)}
              onPress={() => onChange(opt.value)}
              style={[styles.btn, active && styles.btnActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.btnText, active && styles.btnTextActive]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ink,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  btnActive: {
    backgroundColor: colors.copper,
    borderColor: colors.copper,
  },
  btnText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.ink,
    textAlign: 'center',
  },
  btnTextActive: {
    color: '#FFFFFF',
    fontFamily: fonts.bodySemi,
  },
});
