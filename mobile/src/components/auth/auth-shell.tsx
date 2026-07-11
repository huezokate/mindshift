import type { PropsWithChildren } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthBanner, type AuthReason } from '@/components/journal/auth-banner';
import { Card } from '@/components/ui/card';
import { useTheme } from '@/theme';

/**
 * Themed chrome for the auth screens — replaces the Phase-0 hardcoded-hex
 * auth-form.tsx. The web renders Clerk's <SignIn/>/<SignUp/> preceded by
 * AuthBanner(?reason=); native owns the form UI (Clerk Expo is headless), so
 * the shell is Card + DS typography, with the same contextual banner on top.
 */
export function AuthShell({
  title,
  reason,
  children,
}: PropsWithChildren<{ title: string; reason?: AuthReason }>) {
  const { tokens: t } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.palette.bg }} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24, gap: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          {reason ? <AuthBanner reason={reason} /> : null}
          <Card style={{ padding: 20, gap: 12 }}>
            <Text
              style={{
                fontFamily: t.fonts.display.bold ?? t.fonts.display.regular,
                fontWeight: '700',
                fontSize: 28,
                letterSpacing: -0.4,
                color: t.text.h1,
                marginBottom: 8,
              }}
            >
              {title}
            </Text>
            {children}
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** Themed text input on the --input-* family. */
export function AuthInput(props: TextInputProps) {
  const { tokens: t } = useTheme();
  return (
    <TextInput
      placeholderTextColor={t.text.sub}
      autoCapitalize="none"
      cursorColor={t.palette.cyan}
      style={{
        backgroundColor: t.input.bg,
        color: t.text.body,
        borderWidth: 1,
        borderColor: t.input.divider,
        borderRadius: t.input.radius,
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontFamily: t.fonts.body.regular,
        fontSize: 16,
      }}
      {...props}
    />
  );
}

export function AuthError({ message }: { message: string | null }) {
  const { tokens: t } = useTheme();
  if (!message) return null;
  return (
    <Text style={{ fontFamily: t.fonts.body.regular, fontSize: 14, color: t.palette.pink }}>
      {message}
    </Text>
  );
}

/** Normalize router params (incl. the web's `lenses_limit`/`vents_limit`
    spellings) onto AuthBanner's reason keys. Unknown → undefined (default copy). */
export function parseAuthReason(raw: string | string[] | undefined): AuthReason | undefined {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === 'lenses_limit' || v === 'lens_limit') return 'lens_limit';
  if (v === 'vents_limit' || v === 'vent_limit') return 'vent_limit';
  if (v === 'save' || v === 'journal') return v;
  return undefined;
}
