import { Platform } from 'react-native';

import type { ThemeFonts, ThemeMode } from './types';

/**
 * CSS font stacks can't be parsed into RN families, so this is the one
 * hand-maintained bridge: loaded expo-font names (see app/_layout.tsx) or
 * platform builtins via Platform.select. `regular: undefined` = system font.
 *
 * Known gap (design.md "out of scope"): notepad's web body/btn/mono font is
 * Inter, which has no asset in mobile/assets/fonts — it falls back to the
 * platform system sans until T-030-03 owns typography primitives.
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

const system: ThemeFonts['body'] = {};

export const fontsByMode: Record<ThemeMode, ThemeFonts> = {
  // --font-display/btn: Alumni Sans SC · --font-body/mono: Courier New
  cyberpunk: { display: alumni, body: courier, btn: alumni, mono: courier },
  // everything Nunito except --font-btn: Fredoka
  kawaii: { display: nunito, body: nunito, btn: fredoka, mono: nunito },
  // --font-display: Georgia · body/btn/mono: Inter (missing → system, see above)
  notepad: { display: georgia, body: system, btn: system, mono: system },
};
