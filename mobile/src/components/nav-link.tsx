import { Link, LinkProps } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

/** Uniform nav affordance for the Phase-0 placeholder screens. */
export function NavLink({ href, label }: { href: LinkProps['href']; label: string }) {
  return (
    <Link href={href} style={styles.link}>
      <Text style={styles.text}>{label} →</Text>
    </Link>
  );
}

const styles = StyleSheet.create({
  link: {
    borderWidth: 1,
    borderColor: '#1d4b56',
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#101822',
  },
  text: { color: '#5ad4e6', fontSize: 16 },
});
