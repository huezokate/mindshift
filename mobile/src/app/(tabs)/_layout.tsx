import { Tabs } from 'expo-router';
import { ColorValue, Text } from 'react-native';

// Placeholder glyphs until step 4 wires Material Symbols tab icons.
function TabGlyph({ char, color }: { char: string; color: ColorValue }) {
  return <Text style={{ color, fontSize: 18 }}>{char}</Text>;
}

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
        options={{ title: 'Home', tabBarIcon: ({ color }) => <TabGlyph char="⌂" color={color} /> }}
      />
      <Tabs.Screen
        name="journal"
        options={{ title: 'Journal', tabBarIcon: ({ color }) => <TabGlyph char="✎" color={color} /> }}
      />
      <Tabs.Screen
        name="mindmap"
        options={{ title: 'Mindmap', tabBarIcon: ({ color }) => <TabGlyph char="◉" color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color }) => <TabGlyph char="☺" color={color} /> }}
      />
    </Tabs>
  );
}
