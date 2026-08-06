import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getTypicalLoads } from '@/src/engines/thermomagnetic';
import type { CircuitType, LoadType } from '@/src/engines/types';
import { colors, fonts, radii, space } from '@/src/theme';

export type TypicalLoadSelection = {
  powerW: number;
  powerFactor: number;
  loadType: LoadType;
  circuitType: CircuitType;
  label: string;
};

type Props = {
  onSelect: (load: TypicalLoadSelection) => void;
};

export function TypicalLoads({ onSelect }: Props) {
  const loads = getTypicalLoads();

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Cargas típicas</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {loads.map((load) => (
          <Pressable
            key={load.id}
            onPress={() =>
              onSelect({
                powerW: load.powerW,
                powerFactor: load.powerFactor,
                loadType: load.loadType as LoadType,
                circuitType: load.circuitType as CircuitType,
                label: load.label,
              })
            }
            style={styles.card}
          >
            <Text style={styles.cardTitle} numberOfLines={2}>
              {load.label}
            </Text>
            <Text style={styles.cardMeta}>
              {load.powerW} W · FP {load.powerFactor.toFixed(2)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: space.sm,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.ink,
    letterSpacing: 0.5,
  },
  row: {
    gap: 10,
    paddingRight: space.md,
  },
  card: {
    width: 156,
    minHeight: 78,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.copper,
  },
  cardTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    lineHeight: 17,
    color: colors.ink,
    marginBottom: 6,
  },
  cardMeta: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 16,
    color: colors.inkMuted,
  },
});
