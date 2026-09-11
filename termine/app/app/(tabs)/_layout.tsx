import { Tabs } from 'expo-router';
import { Text } from 'react-native';

/**
 * Four tabs, in the order the app is actually used: what you are watching,
 * where you find more, what came in, and settings.
 *
 * Icons are drawn as text glyphs to keep the app free of an icon-font
 * dependency; swapping in a vector set later is a one-component change.
 */
function TabIcon({ glyph, color }: { glyph: string; color: string }) {
  return <Text style={{ color, fontSize: 20 }}>{glyph}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1d4ed8',
        tabBarInactiveTintColor: '#64748b',
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: '#0f172a',
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
        tabBarStyle: { backgroundColor: '#ffffff', borderTopColor: '#e2e8f0' },
        sceneStyle: { backgroundColor: '#f8fafc' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Suchaufträge',
          tabBarIcon: ({ color }) => <TabIcon glyph="◎" color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Termine finden',
          tabBarIcon: ({ color }) => <TabIcon glyph="⌕" color={color} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Meldungen',
          tabBarIcon: ({ color }) => <TabIcon glyph="◔" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Einstellungen',
          tabBarIcon: ({ color }) => <TabIcon glyph="⚙" color={color} />,
        }}
      />
    </Tabs>
  );
}
