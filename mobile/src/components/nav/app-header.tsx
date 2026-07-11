import { useClerk, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { borderStyle, useTheme } from '@/theme';

import { Button } from '../ui/button';
import type { ButtonVariant } from '../ui/button-logic';
import { Icon } from '../ui/icon';

/**
 * App-wide top nav — RN port of V200/src/components/nav/AppHeader.tsx (Figma
 * 624:8265). Bar: [brand lens badge] · MINDS SHIFT · [Menu → dropdown].
 * Dropdown rows are the design-system Button, one structural variant per
 * section — THE semantic accent-swap surface (Kate 2026-07-09):
 *   • Profile / Log out → primary
 *   • Journal           → secondary
 *   • Mind Map          → secondary2
 * The web header self-fetches counts; here they're props only — screens wire
 * data (T-030-04).
 */

export type HeaderDest =
  | 'home'
  | 'profile'
  | 'journal'
  | 'new-vent'
  | 'mindmap'
  | 'mindmap-new'
  | 'sign-in';

type ViewProps = {
  signedIn: boolean;
  username?: string;
  entryCount?: number;
  lensCount?: number;
  mindmapHorizon?: string;
  mindmapProgress?: string;
  onNavigate?: (dest: HeaderDest) => void;
  onSignOut?: () => void;
};

export function AppHeaderView({
  signedIn,
  username,
  entryCount = 0,
  lensCount = 0,
  mindmapHorizon,
  mindmapProgress,
  onNavigate,
  onSignOut,
}: ViewProps) {
  const { mode, tokens: t } = useTheme();
  const [open, setOpen] = useState(false);
  const go = (dest: HeaderDest) => {
    setOpen(false);
    onNavigate?.(dest);
  };

  // Brand accent: kawaii's --green reads as washed teal, so kawaii brands with
  // the real purple (--fig-name-unsel); cyberpunk/notepad keep the green slot.
  const brandAccent = mode === 'kawaii' ? t.fig.nameUnsel : t.palette.green;

  const row = (
    variant: ButtonVariant,
    dest: HeaderDest | (() => void),
    icon: string | undefined,
    label: string,
    meta?: string,
  ) => (
    <Button
      variant={variant}
      fullWidth
      icon={icon}
      iconSize={20}
      subtext={meta}
      onPress={typeof dest === 'function' ? dest : () => go(dest)}
    >
      {label}
    </Button>
  );

  return (
    <View style={{ zIndex: 50 }}>
      {/* Bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 8,
        }}
      >
        {/* Brand lens badge */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Minds Shift home"
          onPress={() => go(signedIn ? 'journal' : 'new-vent')}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: t.palette.bg,
            borderWidth: 2,
            borderColor: brandAccent,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon
            name="camera"
            size={26}
            color={mode === 'cyberpunk' ? t.palette.pink : brandAccent}
          />
        </Pressable>

        <Text
          numberOfLines={1}
          style={{
            fontFamily: t.fonts.body.bold ?? t.fonts.body.regular,
            fontWeight: '700',
            fontSize: 28,
            letterSpacing: 4.2,
            lineHeight: 30,
            color: brandAccent,
            textTransform: 'uppercase',
          }}
        >
          Minds Shift
        </Text>

        {/* Menu trigger — primary button treatment (--btn-* family). */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Account menu"
          accessibilityState={{ expanded: open }}
          onPress={() => setOpen((o) => !o)}
          style={{
            height: 48,
            paddingHorizontal: 18,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            backgroundColor: t.btn.bg,
            ...borderStyle(t.btn.border),
            borderRadius: t.btn.radius,
            boxShadow: t.btn.shadow,
            filter: t.btn.filter,
          }}
        >
          <Icon name={open ? 'close' : 'menu'} size={22} color={t.btn.color} />
          <Text
            style={{
              fontFamily: t.fonts.btn.bold ?? t.fonts.btn.regular,
              fontWeight: '600',
              fontSize: 14,
              letterSpacing: 3,
              textTransform: 'uppercase',
              color: t.btn.color,
            }}
          >
            Menu
          </Text>
        </Pressable>
      </View>

      {/* Dropdown — transparent layout shell; rows carry their own fill. */}
      {open ? (
        <View
          accessibilityRole="menu"
          style={{
            position: 'absolute',
            top: 60,
            right: 8,
            width: 229,
            gap: 2,
            zIndex: 51,
          }}
        >
          {/* Profile — primary */}
          {row('primary', 'profile', undefined, 'Profile', username)}

          {/* Journal group — secondary (positive/blue slot) */}
          {row('secondary', 'journal', undefined, 'Journal')}
          {signedIn
            ? row('secondary', 'journal', 'article', `${entryCount} entries`, `${lensCount} lenses`)
            : row('secondary', 'journal', 'login', 'Sign in to save')}
          {row('secondary', 'new-vent', 'add', 'New')}

          {/* Mind Map group — secondary2 (negative/red slot) */}
          {row('secondary2', 'mindmap', undefined, 'Mind Map')}
          {row('secondary2', 'mindmap', 'tab_group', mindmapHorizon ?? '—', mindmapProgress)}
          {row('secondary2', 'mindmap-new', 'add', 'New')}

          {/* Log out / Sign in — primary */}
          {signedIn
            ? row(
                'primary',
                () => {
                  setOpen(false);
                  onSignOut?.();
                },
                undefined,
                'Log out',
              )
            : row('primary', 'sign-in', undefined, 'Sign in')}
        </View>
      ) : null}
    </View>
  );
}

const ROUTES: Record<HeaderDest, string> = {
  home: '/(tabs)/home',
  profile: '/(tabs)/profile',
  journal: '/(tabs)/journal',
  'new-vent': '/onboarding',
  mindmap: '/(tabs)/mindmap',
  'mindmap-new': '/mindmap/new',
  'sign-in': '/(auth)/sign-in',
};

/** Clerk-wired header. Anon users funnel to sign-in for account-bound
    destinations (journal/profile/mindmap), like the web. */
export function AppHeader(props: Omit<ViewProps, 'signedIn' | 'username' | 'onNavigate' | 'onSignOut'>) {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const username = user?.username
    ? `@${user.username}`
    : (user?.primaryEmailAddress?.emailAddress ?? undefined);
  const accountBound: HeaderDest[] = ['profile', 'journal', 'mindmap', 'mindmap-new'];
  return (
    <AppHeaderView
      {...props}
      signedIn={Boolean(isSignedIn)}
      username={username}
      onNavigate={(dest) => {
        const target = !isSignedIn && accountBound.includes(dest) ? ROUTES['sign-in'] : ROUTES[dest];
        router.push(target as never);
      }}
      onSignOut={() => void signOut()}
    />
  );
}
