import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Phase-0 stub used by every route until T-030-04 ports the real screens.
 * Keeps the shell uniform so screens can be replaced one-by-one without
 * touching navigation.
 */
export function PlaceholderScreen({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.badge}>placeholder · T-030-01 shell</Text>
        <View style={styles.children}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0a0a12' },
  content: { padding: 24, gap: 8 },
  title: { fontSize: 28, fontWeight: '700', color: '#e8f6f8' },
  badge: { fontSize: 12, color: '#5ad4e6' },
  children: { marginTop: 16, gap: 12 },
});
