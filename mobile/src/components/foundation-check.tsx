import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Icon } from '@/components/ui/icon';

// The "career" life-area path from V200/src/components/mindmap/AreaIcon.tsx —
// proves react-native-svg renders the Figma-exported 24×24 paths.
const CAREER_PATH =
  'M4 21C3.45 21 2.97917 20.8042 2.5875 20.4125C2.19583 20.0208 2 19.55 2 19V8C2 7.45 2.19583 6.97917 2.5875 6.5875C2.97917 6.19583 3.45 6 4 6H8V4C8 3.45 8.19583 2.97917 8.5875 2.5875C8.97917 2.19583 9.45 2 10 2H14C14.55 2 15.0208 2.19583 15.4125 2.5875C15.8042 2.97917 16 3.45 16 4V6H20C20.55 6 21.0208 6.19583 21.4125 6.5875C21.8042 6.97917 22 7.45 22 8V19C22 19.55 21.8042 20.0208 21.4125 20.4125C21.0208 20.8042 20.55 21 20 21H4ZM4 19H20V8H4V19ZM10 6H14V4H10V6Z';

/**
 * T-030-01 acceptance evidence, rendered on the Home placeholder:
 * theme fonts, a Material Symbols glyph, and an AreaIcon SVG path.
 */
export function FoundationCheck() {
  return (
    <View style={styles.box}>
      <Text style={styles.heading}>Foundation check</Text>
      <Text style={{ fontFamily: 'AlumniSansSC-Bold', fontSize: 22, color: '#e8f6f8' }}>
        Alumni Sans SC — CYBERPUNK DISPLAY
      </Text>
      <Text style={{ fontFamily: 'NunitoSans-Regular', fontSize: 16, color: '#e8f6f8' }}>
        Nunito Sans — kawaii body text
      </Text>
      <Text style={{ fontFamily: 'Fredoka-Medium', fontSize: 16, color: '#e8f6f8' }}>
        Fredoka — kawaii buttons
      </Text>
      <Text style={{ fontFamily: 'Courier New', fontSize: 15, color: '#e8f6f8' }}>
        Courier New — cyberpunk mono
      </Text>
      <View style={styles.row}>
        <Icon name="psychology" size={28} color="#5ad4e6" />
        <Icon name="favorite" size={28} color="#ff5c8a" />
        <Icon name="auto_awesome" size={28} color="#b48cff" />
        <Svg width={28} height={28} viewBox="0 0 24 24">
          <Path d={CAREER_PATH} fill="#7dff9b" />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderColor: '#1d4b56',
    borderRadius: 4,
    padding: 16,
    gap: 8,
    backgroundColor: '#101822',
  },
  heading: { fontSize: 12, color: '#5b6570', textTransform: 'uppercase', letterSpacing: 1 },
  row: { flexDirection: 'row', gap: 16, marginTop: 4, alignItems: 'center' },
});
