import { Text, TextInput, View } from 'react-native';

import { borderStyle, useTheme } from '@/theme';

import { counterColor } from './vent-input-logic';

/**
 * The vent textarea card — RN port of the web's `--input-*` pattern
 * (V200 onboarding page: header row + textarea + char counter). Web keeps the
 * 16px font so iOS Safari doesn't zoom-lock; native TextInput keeps it for
 * visual parity.
 */
export function VentInput({
  value,
  onChangeText,
  header = 'Dump it all here:',
  placeholder = 'Start typing...',
  maxLength = 1000,
  warnAt = 700,
  editable = true,
  autoFocus = false,
}: {
  value: string;
  onChangeText: (text: string) => void;
  header?: string;
  placeholder?: string;
  maxLength?: number;
  warnAt?: number;
  editable?: boolean;
  autoFocus?: boolean;
}) {
  const { tokens: t } = useTheme();
  return (
    <View
      style={{
        ...borderStyle(t.input.border),
        borderRadius: t.input.radius,
        boxShadow: t.input.shadow,
        overflow: 'hidden',
      }}
    >
      {/* Header row */}
      <View
        style={{
          backgroundColor: t.input.headerBg,
          boxShadow: t.input.headerShadow,
          paddingVertical: 10,
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
            fontSize: 12,
            letterSpacing: 1,
            lineHeight: 14,
            textTransform: 'uppercase',
            color: t.text.body,
          }}
        >
          {header}
        </Text>
      </View>

      {/* Textarea body */}
      <View style={{ backgroundColor: t.input.bg }}>
        <TextInput
          value={value}
          onChangeText={(next) => onChangeText(next.slice(0, maxLength))}
          multiline
          editable={editable}
          autoFocus={autoFocus}
          placeholder={placeholder.toUpperCase()}
          placeholderTextColor={t.text.sub}
          cursorColor={t.palette.cyan}
          selectionColor={t.palette.cyan}
          textAlignVertical="top"
          style={{
            fontFamily: t.fonts.body.regular,
            fontSize: 16,
            lineHeight: 22,
            letterSpacing: 0.52,
            color: t.text.body,
            paddingVertical: 12,
            paddingHorizontal: 16,
            minHeight: 200,
          }}
        />
        {/* Char counter */}
        <View
          style={{
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
              color: counterColor(t, value.length, warnAt),
            }}
          >
            {value.length}/{maxLength} characters
          </Text>
        </View>
      </View>
    </View>
  );
}
