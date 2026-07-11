import { Platform } from 'react-native';

import type { ThemeFonts, ThemeMode } from './types';

/**
 * CSS font stacks can't be parsed into RN families, so this is the one
 * hand-maintained bridge: loaded expo-font names (see app/_layout.tsx) or
 * platform builtins via Platform.select. `regular: undefined` = system font.
 */

const courier: ThemeFonts['mono'] = {
  regular: Platform.select({ ios: 'Courier New', default: 'monospace' }),
};

const georgia: ThemeFonts['display'] = {
  regular: Platform.select({ ios: 'Georgia', default: 'serif' }),
};

const alumni: ThemeFonts['display'] = {
  regular: 'AlumniSansSC-SemiBold',
  bold: 'AlumniSansSC-Bold',
};

const nunito: ThemeFonts['body'] = {
  regular: 'NunitoSans-Regular',
  bold: 'NunitoSans-Bold',
};

const fredoka: ThemeFonts['btn'] = {
  regular: 'Fredoka-Medium',
  bold: 'Fredoka-SemiBold',
};

const inter: ThemeFonts['body'] = {
  regular: 'Inter-Regular',
  bold: 'Inter-SemiBold',
};

export const fontsByMode: Record<ThemeMode, ThemeFonts> = {
  // --font-display/btn: Alumni Sans SC · --font-body/mono: Courier New
  cyberpunk: { display: alumni, body: courier, btn: alumni, mono: courier },
  // everything Nunito except --font-btn: Fredoka
  kawaii: { display: nunito, body: nunito, btn: fredoka, mono: nunito },
  // --font-display: Georgia · body/btn/mono: Inter (static instances, T-030-03)
  notepad: { display: georgia, body: inter, btn: inter, mono: inter },
};
