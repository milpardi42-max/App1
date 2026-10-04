import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { DeviceProvider } from '@/lib/DeviceContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { I18nManager, View } from 'react-native';
import {
  Vazirmatn_400Regular,
  Vazirmatn_500Medium,
  Vazirmatn_700Bold,
} from '@expo-google-fonts/vazirmatn';

// This app is for Persian (Farsi) users — its UI is always RTL regardless of
// the phone's system language. This also makes the bottom tab bar layout correct.
I18nManager.forceRTL(true);
I18nManager.allowRTL(true);

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    Vazirmatn: Vazirmatn_400Regular,
    'Vazirmatn-Medium': Vazirmatn_500Medium,
    'Vazirmatn-Bold': Vazirmatn_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ErrorBoundary>
      <DeviceProvider>
        {/* `direction: 'rtl'` on this top-level wrapper makes the whole subtree
            layout right-to-left immediately — even before the native
            I18nManager flag takes effect (which may need one app restart). */}
        <View style={{ flex: 1, direction: 'rtl' }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="dark" />
        </View>
      </DeviceProvider>
    </ErrorBoundary>
  );
}
