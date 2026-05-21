import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { useAuth } from '@/lib/auth/context';
import { colors } from '@/theme/colors';

type TabIconProps = {
  label: string;
  focused: boolean;
};

function TabIcon({ label, focused }: TabIconProps) {
  return (
    <View className="items-center justify-center">
      <View
        className={`w-1.5 h-1.5 rounded-full mb-1 ${focused ? 'bg-primary' : 'bg-transparent'}`}
      />
      <Text
        className={`text-xs ${focused ? 'text-primary font-semibold' : 'text-muted-foreground font-medium'}`}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const { initializing, session } = useAuth();

  if (initializing) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 64,
          paddingTop: 8,
          paddingBottom: 8,
          borderTopColor: colors.border,
          backgroundColor: colors.background,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => <TabIcon label="Dashboard" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="inquiries"
        options={{
          title: 'Anfragen',
          tabBarIcon: ({ focused }) => <TabIcon label="Anfragen" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="quotes"
        options={{
          title: 'Angebote',
          tabBarIcon: ({ focused }) => <TabIcon label="Angebote" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Mehr',
          tabBarIcon: ({ focused }) => <TabIcon label="Mehr" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
