import { Tabs } from 'expo-router';

import { MsIcon } from '@/components/ms-icon';

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
        options={{ title: 'Home', tabBarIcon: ({ color }) => <MsIcon name="home" size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="journal"
        options={{ title: 'Journal', tabBarIcon: ({ color }) => <MsIcon name="book_2" size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="mindmap"
        options={{ title: 'Mindmap', tabBarIcon: ({ color }) => <MsIcon name="graph_3" size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color }) => <MsIcon name="person" size={24} color={color} /> }}
      />
    </Tabs>
  );
}
