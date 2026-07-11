import { Tabs } from 'expo-router';

import { Icon } from '@/components/ui/icon';
import { useTheme } from '@/theme';

export default function TabsLayout() {
  const { tokens: t } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: t.palette.bg, borderTopColor: t.input.divider },
        tabBarActiveTintColor: t.palette.cyan,
        tabBarInactiveTintColor: t.text.sub,
        sceneStyle: { backgroundColor: t.palette.bg },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: 'Home', tabBarIcon: ({ color }) => <Icon name="home" size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="journal"
        options={{ title: 'Journal', tabBarIcon: ({ color }) => <Icon name="book_2" size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="mindmap"
        options={{ title: 'Mindmap', tabBarIcon: ({ color }) => <Icon name="graph_3" size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color }) => <Icon name="person" size={24} color={color} /> }}
      />
    </Tabs>
  );
}
