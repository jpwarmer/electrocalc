import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
} from '@expo-google-fonts/ibm-plex-sans';
import {
  Oswald_600SemiBold,
  Oswald_700Bold,
} from '@expo-google-fonts/oswald';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { calculatorHeaderOptions } from '@/src/navigation/header';
import { colors } from '@/src/theme';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
    Oswald_600SemiBold,
    Oswald_700Bold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.bg },
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.ink,
        }}
      >
        <Stack.Screen
          name="index"
          options={calculatorHeaderOptions('Termomagnéticas')}
        />
        <Stack.Screen
          name="calculators/cable-section"
          options={calculatorHeaderOptions('Sección de cable')}
        />
        <Stack.Screen
          name="calculators/voltage-drop"
          options={calculatorHeaderOptions('Caída de tensión')}
        />
        <Stack.Screen
          name="calculators/power"
          options={calculatorHeaderOptions('Potencia')}
        />
        <Stack.Screen
          name="calculators/thermal-power"
          options={calculatorHeaderOptions('Frigorías / HP')}
        />
        <Stack.Screen
          name="calculators/quick-ref"
          options={calculatorHeaderOptions('Cable–ITM')}
        />
        <Stack.Screen
          name="help"
          options={calculatorHeaderOptions('Ayuda')}
        />
        <Stack.Screen
          name="modal"
          options={{ presentation: 'modal', title: 'Aviso' }}
        />
      </Stack>
    </>
  );
}
