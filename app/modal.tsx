import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, space } from '@/src/theme';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aviso importante</Text>
      <Text style={styles.body}>
        ElectroCalc es una herramienta orientativa para dimensionamiento
        preliminar. Las instalaciones eléctricas deben ser diseñadas y
        ejecutadas por electricistas matriculados, cumpliendo AEA 90364, IRAM
        e IEC 60898.
      </Text>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: space.lg,
    gap: space.md,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 28,
    color: colors.ink,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkMuted,
  },
});
