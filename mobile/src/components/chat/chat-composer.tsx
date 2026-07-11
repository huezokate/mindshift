import { Pressable, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { borderStyle, useTheme } from '@/theme';

const MAX_MSG_CHARS = 800; // matches the vent input cap (web parity)

/**
 * Chat composer footer — RN port of the web ChatScreen composer. `locked`
 * (hard cap only) swaps the input for the closing card; a soft close keeps
 * the composer (the resting strip renders above via SoftCloseDivider).
 */
export function ChatComposer({
  draft,
  onChangeDraft,
  onSend,
  pending,
  locked,
  placeholder,
  onReturn,
}: {
  draft: string;
  onChangeDraft: (text: string) => void;
  onSend: () => void;
  pending: boolean;
  locked: boolean;
  placeholder: string;
  onReturn: () => void;
}) {
  const { tokens: t } = useTheme();
  const canSend = !pending && draft.trim().length > 0;

  if (locked) {
    return (
      <View style={{ alignItems: 'center', gap: 10, padding: 16 }}>
        <Text
          style={{
            fontFamily: t.fonts.body.regular,
            fontSize: 12,
            letterSpacing: 0.4,
            textAlign: 'center',
            color: t.text.sub,
          }}
        >
          This conversation has found its close. The shift is yours to carry.
        </Text>
        <Pressable
          onPress={onReturn}
          accessibilityRole="button"
          style={{
            backgroundColor: t.btnSecondary.bg,
            borderWidth: 1,
            borderColor: t.input.divider,
            borderRadius: t.btn.radius,
            paddingVertical: 8,
            paddingHorizontal: 18,
          }}
        >
          <Text
            style={{
              fontFamily: t.fonts.body.regular,
              fontSize: 13,
              letterSpacing: 0.3,
              color: t.btnSecondary.color,
            }}
          >
            Return to journal
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
      }}
    >
      <TextInput
        value={draft}
        onChangeText={onChangeDraft}
        multiline
        maxLength={MAX_MSG_CHARS}
        editable={!pending}
        placeholder={placeholder}
        placeholderTextColor={t.text.sub}
        cursorColor={t.palette.cyan}
        textAlignVertical="top"
        style={{
          flex: 1,
          minHeight: 76,
          maxHeight: 160,
          backgroundColor: t.input.bg,
          color: t.text.body,
          borderWidth: 1,
          borderColor: t.input.divider,
          borderRadius: t.input.radius,
          paddingVertical: 10,
          paddingHorizontal: 14,
          fontFamily: t.fonts.body.regular,
          fontSize: 14,
          lineHeight: 20,
        }}
      />
      <Pressable
        onPress={onSend}
        disabled={!canSend}
        accessibilityRole="button"
        accessibilityLabel="Send message"
        style={{
          width: 46,
          height: 46,
          backgroundColor: t.btn.bg,
          ...borderStyle(t.btn.border),
          borderRadius: t.btn.radius,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: canSend ? 1 : 0.5,
        }}
      >
        <Icon name="arrow_upward" size={22} color={t.btn.color} />
      </Pressable>
    </View>
  );
}
