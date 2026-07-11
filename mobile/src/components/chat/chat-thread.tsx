import { Text, View } from 'react-native';

import { FigurePortrait } from '@/components/journal/figure-portrait';
import { ChatBubble, TypingDots } from '@/components/ui/chat-bubble';
import type { ChatMessage } from '@/lib/chat-logic';
import { useTheme } from '@/theme';

/**
 * Chat thread body — presentational RN port of the web ChatScreen's message
 * area. The vent + seed reframe open the thread as real bubbles (never part
 * of `messages`); lens turns carry the figure portrait beside the thought
 * bubble, exactly like web. Structural tokens only (the accent slots collapse
 * in kawaii — same rule as the web screen).
 */
export function ChatThread({
  figureId,
  figureName,
  ventText,
  seedReply,
  messages,
  pending,
  error,
}: {
  figureId: string;
  figureName: string;
  ventText: string;
  seedReply: string;
  messages: ChatMessage[];
  pending: boolean;
  error: string | null;
}) {
  const { tokens: t } = useTheme();

  const lensRow = (content: string, key: string | number) => (
    <View key={key} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
      <View style={{ marginBottom: 16 }}>
        <FigurePortrait figureId={figureId} name={figureName} size={30} ring={t.fig.avatar.border} />
      </View>
      <View style={{ flex: 1 }}>
        <ChatBubble role="lens">{content}</ChatBubble>
      </View>
    </View>
  );

  return (
    <View style={{ gap: 12, padding: 16 }}>
      <ChatBubble role="user">{ventText}</ChatBubble>
      {lensRow(seedReply, 'seed')}
      {messages.map((m, i) =>
        m.role === 'user' ? (
          <ChatBubble key={m.id ?? i} role="user">
            {m.content}
          </ChatBubble>
        ) : (
          lensRow(m.content, m.id ?? i)
        ),
      )}
      {pending && (
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
          <FigurePortrait figureId={figureId} name={figureName} size={30} ring={t.fig.avatar.border} />
          <TypingDots />
        </View>
      )}
      {error && (
        <Text
          style={{
            fontFamily: t.fonts.body.regular,
            fontSize: 12,
            textAlign: 'center',
            color: t.btnSecondary.color,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

/** Soft-close wind-down strip pinned above the composer (web softCloseDivider). */
export function SoftCloseDivider({ subline }: { subline: string }) {
  const { tokens: t } = useTheme();
  const line = { flex: 1, height: 1, backgroundColor: t.input.divider };
  return (
    <View style={{ alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%' }}>
        <View style={line} />
        <Text
          numberOfLines={1}
          style={{
            fontFamily: t.fonts.body.regular,
            fontSize: 11,
            letterSpacing: 0.6,
            textTransform: 'uppercase',
            color: t.text.sub,
          }}
        >
          The shift is yours to carry
        </Text>
        <View style={line} />
      </View>
      <Text
        style={{
          fontFamily: t.fonts.body.regular,
          fontSize: 11,
          letterSpacing: 0.2,
          color: t.text.sub,
          opacity: 0.75,
        }}
      >
        {subline}
      </Text>
    </View>
  );
}
