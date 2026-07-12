import { useRouter } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FigurePortrait } from '@/components/journal/figure-portrait';
import { ShareSheet } from '@/components/share/share-sheet';
import { Icon } from '@/components/ui/icon';
import { useSavePop } from '@/components/ui/motion';
import { withAlpha } from '@/lib/color';
import { FIGURES, figureById, type Figure } from '@/lib/figures';
import { notifySuccess } from '@/lib/haptics';
import { useApi } from '@/lib/use-api';
import { useTypewriter } from '@/lib/use-typewriter';
import { useVentFlow } from '@/state/vent-flow';
import { borderStyle, useTheme, type Theme } from '@/theme';

const MAX_CHARS = 800;
const DEMO_FIGURE = FIGURES[0];
const DEMO_VENT =
  "I keep second-guessing my career choice. Everyone around me seems so sure about what they're doing, but I'm constantly wondering if I chose the right path.";
const DEMO_RESPONSE =
  'The unexamined life is not worth living — and you, my friend, are doing the examining. Every doubt you feel is a sign of an active mind. Most who seem certain have simply stopped asking questions. Your hesitation is not weakness; it is wisdom in its earliest form.';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

/** Blinking typewriter caret (the web's glow-pulse span). */
function Caret({ color }: { color: string }) {
  const opacity = useSharedValue(1);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!reduced) {
      opacity.value = withRepeat(withTiming(0, { duration: 400 }), -1, true);
    }
  }, [opacity, reduced]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      style={[{ width: 2, height: 14, marginLeft: 2, backgroundColor: color }, style]}
    />
  );
}

/**
 * Labelled accent pill — the response page's action-row idiom (web pillStyle):
 * faint accent-tinted fill + asymmetric accent border. Kawaii maps onto the
 * canonical secondary families instead (mint → secondary, pink → secondary2),
 * exactly like the web's kawaii branch.
 */
function AccentPill({
  accent,
  onPress,
  disabled,
  icon,
  children,
  t,
  mode,
}: {
  accent: 'cyan' | 'green' | 'pink';
  onPress?: () => void;
  disabled?: boolean;
  icon: string;
  children: ReactNode;
  t: Theme;
  mode: string;
}) {
  const kawaii = mode === 'kawaii';
  const fam = accent === 'green' ? t.btnSecondary : t.btnSecondary2;
  const c = t.palette[accent];
  const chrome = kawaii
    ? {
        backgroundColor: fam.bg,
        ...borderStyle(fam.border),
        borderRadius: fam.radius,
        boxShadow: fam.shadow,
      }
    : {
        backgroundColor: withAlpha(c, 0.12),
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 2,
        borderBottomWidth: 2,
        borderColor: c,
        borderStyle: 'solid' as const,
        borderRadius: t.btnSecondary.radius,
      };
  const color = kawaii ? fam.color : c;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      accessibilityRole="button"
      style={{
        flex: 1,
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        opacity: disabled ? 0.6 : 1,
        ...chrome,
      }}
    >
      <Icon name={icon} size={18} color={color} />
      <Text
        style={{
          fontFamily: t.fonts.btn.bold ?? t.fonts.btn.regular,
          fontWeight: '600',
          fontSize: 13,
          letterSpacing: kawaii ? 0.2 : 1,
          textTransform: 'uppercase',
          color,
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}

export default function ResponseScreen() {
  const router = useRouter();
  const { tokens: t, mode } = useTheme();
  const { api, isSignedIn } = useApi();
  const flow = useVentFlow();
  const savePop = useSavePop();

  // Demo fallbacks (web parity) so direct entry still renders something.
  const figure: Figure = (flow.figureId ? figureById(flow.figureId) : null) ?? DEMO_FIGURE;
  const vent = flow.vent ?? DEMO_VENT;
  const response = flow.response ?? DEMO_RESPONSE;
  // Auto-save only a real generated response, never the demo placeholder.
  const loadedReal = Boolean(flow.response);

  const { displayed, done } = useTypewriter(response);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [responseId, setResponseId] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  // Upsert the vent session + this lens. Appends to the existing session so
  // every lens applied to the same vent lands in one journal entry.
  async function persist(): Promise<string | null> {
    try {
      const data = await api<{ sessionId: string; responseId: string }>('/api/save-response', {
        method: 'POST',
        body: {
          ...(flow.sessionId ? { sessionId: flow.sessionId } : {}),
          ventText: vent,
          figureId: figure.id,
          responseText: response,
          theme: mode,
        },
      });
      flow.setSessionId(data.sessionId);
      setResponseId(data.responseId);
      return data.sessionId;
    } catch {
      return null;
    }
  }

  // Signed-in users journal automatically: once the response finishes typing,
  // silently save. No button, no navigation — the entry just appears.
  useEffect(() => {
    if (!isSignedIn || !done || !loadedReal || saveState !== 'idle') return;
    let alive = true;
    // Optimistic in-flight status before the async persist (also the re-entry
    // guard via saveState !== 'idle' above) — same shape as the web page.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaveState('saving');
    persist().then((id) => {
      if (!alive) return;
      setSaveState(id ? 'saved' : 'error');
      if (id) {
        savePop.trigger();
        notifySuccess();
      }
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, done, loadedReal]);

  // Explicit Save — anon only. Anon can't journal without an account, so
  // route to sign-in; the flow context keeps the response alive for after.
  function handleSave() {
    router.push({ pathname: '/(auth)/sign-in', params: { reason: 'save', redirect: '/response' } });
  }

  function retrySave() {
    setSaveState('saving');
    persist().then((id) => setSaveState(id ? 'saved' : 'error'));
  }

  // Quote-card share sheet (T-030-05) — the same rich card as the journal,
  // generated from content, so it works before the entry is saved too.
  function handleShare() {
    setShareOpen(true);
  }

  const inputChrome = {
    ...borderStyle(t.input.border),
    borderRadius: t.input.radius,
    boxShadow: t.input.shadow ?? t.card.shadow,
    filter: t.card.filter,
    overflow: 'hidden' as const,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.palette.bg }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 32, gap: 16 }}>
        {/* 1 — User quote */}
        <Animated.View entering={FadeInDown.duration(300)} style={inputChrome}>
          <View
            style={{
              backgroundColor: t.input.headerBg,
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderBottomWidth: 1,
              borderBottomColor: t.input.divider,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: t.fonts.body.bold ?? t.fonts.body.regular,
                fontWeight: '700',
                fontSize: 11,
                letterSpacing: 0.8,
                lineHeight: 14,
                textTransform: 'uppercase',
                color: t.text.body,
              }}
            >
              Dump it all here:
            </Text>
          </View>
          <View style={{ backgroundColor: t.input.bg, paddingVertical: 12, paddingHorizontal: 16 }}>
            <Text
              style={{
                fontFamily: t.fonts.body.regular,
                fontSize: 14,
                letterSpacing: 0.5,
                lineHeight: 20,
                color: t.text.body,
              }}
            >
              {vent}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: t.input.bg,
              borderTopWidth: 1,
              borderTopColor: t.input.divider,
              paddingVertical: 4,
              paddingHorizontal: 12,
              alignItems: 'flex-end',
            }}
          >
            <Text
              style={{
                fontFamily: t.fonts.body.regular,
                fontSize: 10,
                letterSpacing: 1,
                lineHeight: 12,
                textTransform: 'uppercase',
                color: t.text.sub,
              }}
            >
              {vent.length}/{MAX_CHARS} characters
            </Text>
          </View>
        </Animated.View>

        {/* 2 — Lens response card */}
        <Animated.View entering={FadeInDown.duration(300).delay(120)} style={inputChrome}>
          <View
            style={{
              backgroundColor: t.fig.bg,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingTop: 8,
              paddingBottom: 6,
              paddingHorizontal: 16,
              borderBottomWidth: 1,
              borderBottomColor: t.input.divider,
            }}
          >
            <FigurePortrait
              figureId={figure.id}
              name={figure.name}
              size={28}
              ring={t.fig.avatar.border}
              shadow={t.fig.avatar.shadow}
            />
            <Text
              style={{
                fontFamily: t.fonts.body.bold ?? t.fonts.body.regular,
                fontWeight: '700',
                fontSize: 12,
                letterSpacing: 0.8,
                lineHeight: 14,
                textTransform: 'uppercase',
                color: t.text.body,
              }}
            >
              {figure.name}
            </Text>
          </View>
          <View style={{ backgroundColor: t.input.bg, padding: 16, gap: 16 }}>
            <Text
              style={{
                fontFamily: t.fonts.body.regular,
                fontSize: 14,
                lineHeight: 20,
                letterSpacing: 0.5,
                fontStyle: 'italic',
                textAlign: 'center',
                color: t.palette.violet,
              }}
            >
              “{figure.quote}”
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <Text
                style={{
                  fontFamily: t.fonts.body.regular,
                  fontSize: 14,
                  letterSpacing: 0.5,
                  lineHeight: 22,
                  color: t.text.body,
                }}
              >
                {displayed}
              </Text>
              {!done && <Caret color={t.palette.cyan} />}
            </View>
          </View>
        </Animated.View>

        {/* 3 — Action pills: SAVE (cyan) · NEW LENS (green) · SHARE (pink) */}
        {done && (
          <Animated.View
            entering={FadeInDown.duration(250)}
            style={{ flexDirection: 'row', gap: 8 }}
          >
            {isSignedIn ? (
              <Animated.View style={[savePop.style, { flex: 1, flexDirection: 'row' }]}>
                <AccentPill
                  accent="cyan"
                  t={t}
                  mode={mode}
                  icon={saveState === 'saved' ? 'bookmark_added' : 'bookmark'}
                  disabled={saveState === 'saving'}
                  onPress={saveState === 'error' ? retrySave : undefined}
                >
                  {saveState === 'saved' ? 'Saved' : saveState === 'error' ? 'Retry' : 'Saving…'}
                </AccentPill>
              </Animated.View>
            ) : (
              <AccentPill accent="cyan" t={t} mode={mode} icon="bookmark" onPress={handleSave}>
                Save
              </AccentPill>
            )}
            <AccentPill
              accent="green"
              t={t}
              mode={mode}
              icon="autorenew"
              onPress={() => router.push('/lens')}
            >
              New Lens
            </AccentPill>
            <AccentPill accent="pink" t={t} mode={mode} icon="ios_share" onPress={handleShare}>
              Share
            </AccentPill>
          </Animated.View>
        )}

        {saveState === 'error' && (
          <Text
            style={{
              fontFamily: t.fonts.body.regular,
              fontSize: 12,
              textAlign: 'center',
              color: t.palette.pink,
            }}
          >
            Could not save. Please try again.
          </Text>
        )}
      </ScrollView>

      <ShareSheet
        open={shareOpen}
        responseId={responseId}
        figureId={figure.id}
        responseText={response}
        ventText={vent}
        onClose={() => setShareOpen(false)}
      />
    </SafeAreaView>
  );
}
