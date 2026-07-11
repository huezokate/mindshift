import { Tabs } from 'expo-router';

import { Icon } from '@/components/ui/icon';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#0a0a12' },
        headerTintColor: '#e8f6f8',
        tabBarStyle: { backgroundColor: '#0a0a12', borderTopColor: '#1d4b56' },
        tabBarActiveTintColor: '#5ad4e6',
        tabBarInactiveTintColor: '#5b6570',
        sceneStyle: { backgroundColor: '#0a0a12' },
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
