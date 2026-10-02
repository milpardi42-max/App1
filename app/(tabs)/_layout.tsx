import { Tabs } from 'expo-router';
import { StyleSheet, Platform, View } from 'react-native';
import {
  LayoutDashboard,
  Activity,
  Command,
  AppWindow,
  ShieldCheck,
  Smartphone,
} from 'lucide-react-native';
import { Colors, Typography } from '@/lib/theme';

function TabBarIcon({ icon: Icon, color, focused }: { icon: typeof LayoutDashboard; color: string; focused: boolean }) {
  return (
    <View style={styles.tabIconContainer}>
      <Icon size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
      {focused && <View style={[styles.tabIndicator, { backgroundColor: color }]} />}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.accent[400],
        tabBarInactiveTintColor: Colors.neutral[400],
        tabBarLabelStyle: styles.tabLabel,
        tabBarShowLabel: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'داشبورد',
          tabBarIcon: ({ color, focused }) => <TabBarIcon icon={LayoutDashboard} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'فعالیت‌ها',
          tabBarIcon: ({ color, focused }) => <TabBarIcon icon={Activity} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="apps"
        options={{
          title: 'برنامه‌ها',
          tabBarIcon: ({ color, focused }) => <TabBarIcon icon={AppWindow} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="controls"
        options={{
          title: 'کنترل از راه دور',
          tabBarIcon: ({ color, focused }) => <TabBarIcon icon={Command} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="security"
        options={{
          title: 'امنیت',
          tabBarIcon: ({ color, focused }) => <TabBarIcon icon={ShieldCheck} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="share"
        options={{
          title: 'دریافت اپ',
          tabBarIcon: ({ color, focused }) => <TabBarIcon icon={Smartphone} color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.neutral[900],
    borderTopColor: Colors.neutral[800],
    borderTopWidth: 1,
    height: Platform.OS === 'web' ? 64 : 80,
    paddingBottom: Platform.OS === 'web' ? 8 : 12,
    paddingTop: 8,
  },
  tabLabel: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 28,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
