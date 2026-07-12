import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChatComposer } from '@/components/chat/chat-composer';
import { ChatThread, SoftCloseDivider } from '@/components/chat/chat-thread';
import { FigurePortrait } from '@/components/journal/figure-portrait';
import { LockGate } from '@/components/journal/lock-gate';
import { Button } from '@/components/ui/button';
import { figureById } from '@/lib/figures';
import { tapLight } from '@/lib/haptics';
import {
  beginSend,
  historyLoaded,
  initialChatState,
  isResting,
  replyReceived,
  restingPrompt,
  sendFailed,
  type ChatMessage,
} from '@/lib/chat-logic';
import type { JournalEntryFull } from '@/lib/journal-map';
import { useApi } from '@/lib/use-api';
import { useJournalStore } from '@/state/journal-store';
import { useTheme } from '@/theme';

/**
 * Chat with the Lens — RN port of V200 ChatScreen (T-020-02). Signed-in only
 * (web parity: chat has no anonymous mode). The arc (quote escalation,
 * ⟪END⟫ soft close, hard cap 20) is entirely server-side; this screen renders
 * `done` (resting strip, composer stays) and `locked` (composer removed).
 */
export default function LensChatScreen() {
  const { id, figureId } = useLocalSearchParams<{ id: string; figureId: string }>();
  const router = useRouter();
  const { tokens: t } = useTheme();
  const { api, isSignedIn } = useApi();
  const store = useJournalStore();

  const fig = figureId ? figureById(figureId) : undefined;

  // Entry (vent + this figure's seed reframe) — cache-first, paged fallback.
  const cached = store.getEntry(id);
  const [fetched, setFetched] = useState<JournalEntryFull | null>(null);
  const [missing, setMissing] = useState(false);
  const entry = cached ?? fetched ?? null;
  const seedReply = entry?.responses.find((r) => r.figureId === figureId)?.responseText ?? null;

  useEffect(() => {
    if (!isSignedIn || cached || fetched || missing || !id) return;
    let alive = true;
    store
      .fetchEntry(id)
      .then((e) => alive && (e ? setFetched(e) : setMissing(true)))
      .catch(() => alive && setMissing(true));
    return () => {
      alive = false;
    };
  }, [isSignedIn, cached, fetched, missing, id, store]);

  const [chat, setChat] = useState(initialChatState);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  // Load the persisted follow-up thread (vent + seed are never in messages).
  useEffect(() => {
    if (!isSignedIn || !id || !figureId) return;
    let cancelled = false;
    api<{ messages: ChatMessage[]; locked: boolean }>(
      `/api/chat-with-lens/history?sessionId=${id}&figureId=${figureId}`,
    )
      .then((d) => {
        if (!cancelled) setChat((s) => historyLoaded(s, d.messages ?? [], Boolean(d.locked)));
      })
      .catch(() => {
        if (!cancelled) setChat((s) => historyLoaded(s, [], false));
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, id, figureId]);

  // Keep pinned to the latest message / typing indicator.
  useEffect(() => {
    const timer = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(timer);
  }, [chat.messages.length, chat.pending]);

  async function send() {
    if (!entry || !seedReply) return;
    const begun = beginSend(chat, draft);
    if (!begun) return;
    const { state, userMsg } = begun;
    const history = chat.messages;
    setChat(state);
    setDraft('');
    tapLight();
    try {
      const d = await api<{ reply: string; done: boolean; capped: boolean }>(
        '/api/chat-with-lens',
        {
          method: 'POST',
          body: {
            sessionId: id,
            figureId,
            ventText: entry.ventText,
            seedReply,
            userMessage: userMsg.content,
            history,
          },
        },
      );
      setChat((s) => replyReceived(s, d));
    } catch {
      setChat((s) => sendFailed(s, userMsg, 'The lens could not respond.'));
      setDraft(userMsg.content);
    }
  }

  if (!fig) return null;

  // Signed-in gate (web parity — the anon branch is dead code in product).
  if (!isSignedIn) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.palette.bg }} edges={['bottom']}>
        <Stack.Screen options={{ title: 'Chat' }} />
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}
        >
          <Text
            style={{
              fontFamily: t.fonts.body.regular,
              fontSize: 14,
              lineHeight: 20,
              textAlign: 'center',
              maxWidth: 320,
              color: t.text.body,
            }}
          >
            Chatting with a lens is part of your journal — sign in to continue the conversation.
          </Text>
          <Button variant="primary" onPress={() => router.push('/(auth)/sign-in')}>
            Sign in
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (!entry || !seedReply) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.palette.bg }} edges={['bottom']}>
        <Stack.Screen options={{ title: fig.name }} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          {missing || (entry && !seedReply) ? (
            <Text style={{ fontFamily: t.fonts.body.regular, fontSize: 14, color: t.text.sub }}>
              This conversation could not be found.
            </Text>
          ) : (
            <ActivityIndicator color={t.palette.cyan} />
          )}
        </View>
      </SafeAreaView>
    );
  }

  const resting = isResting(chat);
  const placeholder = resting ? 'Still here if you need more…' : `Say something to ${fig.name}…`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.palette.bg }} edges={['bottom']}>
      {/* Custom in-screen header: portrait + name/era (web header bar). */}
      <Stack.Screen options={{ title: '', headerShown: true }} />
      <LockGate>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View
          style={{
            backgroundColor: t.card.bg,
            borderBottomWidth: 1,
            borderBottomColor: t.input.divider,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingVertical: 12,
            paddingHorizontal: 16,
          }}
        >
          <FigurePortrait figureId={fig.id} name={fig.name} size={34} ring={t.fig.avatar.border} />
          <View style={{ minWidth: 0, flex: 1 }}>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: t.fonts.display.bold ?? t.fonts.display.regular,
                fontWeight: '700',
                fontSize: 16,
                letterSpacing: 1,
                textTransform: 'uppercase',
                color: t.palette.violet,
              }}
            >
              {fig.name}
            </Text>
            <Text
              style={{
                fontFamily: t.fonts.body.regular,
                fontSize: 10,
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                color: t.text.sub,
              }}
            >
              {fig.era}
            </Text>
          </View>
        </View>

        <ScrollView ref={scrollRef} style={{ flex: 1 }}>
          <ChatThread
            figureId={fig.id}
            figureName={fig.name}
            ventText={entry.ventText}
            seedReply={seedReply}
            messages={chat.messages}
            pending={chat.pending}
            error={chat.error}
          />
        </ScrollView>

        <View
          style={{
            backgroundColor: t.card.bg,
            borderTopWidth: 1,
            borderTopColor: t.input.divider,
          }}
        >
          {resting && !chat.locked ? <SoftCloseDivider subline={restingPrompt(chat)} /> : null}
          <ChatComposer
            draft={draft}
            onChangeDraft={setDraft}
            onSend={() => void send()}
            pending={chat.pending}
            locked={chat.locked}
            placeholder={placeholder}
            onReturn={() => router.back()}
          />
        </View>
      </KeyboardAvoidingView>
      </LockGate>
    </SafeAreaView>
  );
}
