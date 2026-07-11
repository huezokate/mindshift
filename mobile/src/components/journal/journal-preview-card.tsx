import { Pressable, Text, View } from 'react-native';

import { borderStyle, useTheme, type Theme } from '@/theme';

import { Button } from '../ui/button';
import { Icon } from '../ui/icon';
import { formatDateLabel, type JournalEntryLite } from './journal-types';
import { LensAvatar } from './lens-avatar';
import { SocialIcon } from './social-icon';

/**
 * Journal feed preview card — RN port of V200/src/components/journal/
 * JournalPreviewCard.tsx (Figma 604:7285…7473). Date label, tappable vent
 * body (title header + clamped vent), green-accent footer carrying either the
 * lens avatar stack (with share badges) or the "+ Lens" secondary button.
 */
export function JournalPreviewCard({
  entry,
  onPress,
  onAddLens,
}: {
  entry: JournalEntryLite;
  /** Tap on the vent body → detail screen. */
  onPress?: (entryId: string) => void;
  /** Tap on the footer / "+ Lens" → lens picker. */
  onAddLens?: (entryId: string) => void;
}) {
  const { mode, tokens: t } = useTheme();
  const isCyberpunk = mode === 'cyberpunk';
  const isKawaii = mode === 'kawaii';
  const isNotepad = mode === 'notepad';
  const hasLens = entry.lenses.length > 0;

  // ── Vent body (tap → detail): card surface + input borders, title header,
  //    clamped vent. Wrapper owns notepad's filter and the -4px footer overlap.
  const ventBody = (
    <View
      style={{
        filter: isNotepad ? t.card.filter : undefined,
        marginBottom: -4,
        zIndex: 1,
      }}
    >
      <Pressable
        onPress={() => onPress?.(entry.id)}
        accessibilityRole="button"
        accessibilityLabel={`Open journal entry: ${entry.title}`}
        style={{
          backgroundColor: t.card.bg,
          ...borderStyle(t.input.border),
          borderRadius: t.input.radius,
          boxShadow: t.input.shadow,
          overflow: 'hidden',
        }}
      >
        {/* Header — Figma only fills it on kawaii; the divider is the input's
            own bottom border. */}
        <View
          style={{
            backgroundColor: isKawaii ? t.input.headerBg : 'transparent',
            boxShadow: isKawaii ? t.input.headerShadow : undefined,
            paddingTop: 8,
            paddingHorizontal: 16,
            paddingBottom: isKawaii ? 4 : 2,
            borderBottomWidth: t.input.border.bottom?.width ?? 0,
            borderBottomColor: t.input.border.bottom?.color,
            alignItems: 'center',
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              fontFamily: t.fonts.body.bold ?? t.fonts.body.regular,
              fontWeight: isNotepad ? '600' : '700',
              fontSize: 12,
              letterSpacing: isCyberpunk ? 1.32 : isKawaii ? 0.52 : 0.55,
              lineHeight: 14,
              color: isKawaii ? t.text.body : t.palette.cyan,
              textTransform: 'uppercase',
              textAlign: 'center',
            }}
          >
            {entry.title}
          </Text>
        </View>
        <View
          style={{
            paddingVertical: 4,
            paddingLeft: 16,
            paddingRight: isKawaii ? 8 : 16,
          }}
        >
          <Text
            numberOfLines={isNotepad ? 3 : 4}
            style={{
              fontFamily: t.fonts.body.regular,
              fontSize: 14,
              lineHeight: 20,
              letterSpacing: isNotepad ? 0.18 : 0.52,
              color: t.preview.body,
            }}
          >
            {entry.ventText}
          </Text>
        </View>
      </Pressable>
    </View>
  );

  // ── Footer chrome per theme (web footerBorder).
  const footerChrome = isCyberpunk
    ? {
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 4,
        borderBottomWidth: 4,
        borderColor: t.palette.green,
        borderRadius: t.card.radius,
        backgroundColor: t.card.bg,
        paddingVertical: 8,
        paddingHorizontal: 8,
      }
    : isKawaii
      ? {
          ...borderStyle(t.input.border),
          borderRadius: 32,
          backgroundColor: t.lens.headerBg,
          // Figma 604:7473 — pink inner stroke, not the teal input one.
          boxShadow: `inset 4px 0 0 0 ${t.palette.pink}`,
          paddingVertical: 8,
          paddingHorizontal: 16,
        }
      : {
          borderTopWidth: 1.5,
          borderLeftWidth: 4,
          borderRightWidth: 1.5,
          borderBottomWidth: 1.5,
          borderColor: t.palette.green,
          borderRadius: 8,
          backgroundColor: t.card.bg,
          filter: t.card.filter,
          paddingVertical: 8,
          paddingHorizontal: 16,
        };

  const footerLayout = {
    minHeight: 56,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    gap: 8,
    zIndex: 2,
  };

  const statusGlyph = (
    <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={entry.isPublic ? 'ios_share' : 'lock'} size={40} color={t.preview.glyph} />
    </View>
  );

  const footer = hasLens ? (
    <Pressable
      onPress={() => onAddLens?.(entry.id)}
      accessibilityRole="button"
      accessibilityLabel="Add another lens to this entry"
      style={{ ...footerChrome, ...footerLayout }}
    >
      {statusGlyph}
      <AvatarStack entry={entry} t={t} mode={mode} />
    </Pressable>
  ) : (
    <View style={{ ...footerChrome, ...footerLayout }}>
      {statusGlyph}
      <Button
        variant="secondary"
        icon="add"
        onPress={() => onAddLens?.(entry.id)}
        accessibilityLabel="Apply a lens to this entry"
      >
        Lens
      </Button>
    </View>
  );

  return (
    <View>
      {/* Date label — cyberpunk in the 12px subhead style, others 10px tooltip. */}
      <Text
        style={{
          fontFamily: t.fonts.body.regular,
          fontWeight: isCyberpunk ? '700' : '400',
          fontSize: isCyberpunk ? 12 : 10,
          lineHeight: isCyberpunk ? 14 : 12,
          letterSpacing: isCyberpunk ? 1.32 : t.btn.subtextTracking,
          color: t.palette.pink,
          textTransform: 'uppercase',
          paddingBottom: 4,
        }}
      >
        {formatDateLabel(entry.createdAt)}
      </Text>
      {ventBody}
      {footer}
    </View>
  );
}

/** Avatar stack with per-avatar share badges (Figma 604:7292): the 16px badge
    tucks into the avatar's bottom-right corner; groups nest by -4px. */
function AvatarStack({
  entry,
  t,
  mode,
}: {
  entry: JournalEntryLite;
  t: Theme;
  mode: Theme['mode'];
}) {
  // Ring per Figma: cyberpunk 1px violet / kawaii 2px pink / notepad 2px green.
  const ring =
    mode === 'cyberpunk'
      ? { width: 1, color: t.palette.violet }
      : { width: 2, color: mode === 'kawaii' ? t.palette.pink : t.palette.green };
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {entry.lenses.map((lens, i) => {
        const last = i === entry.lenses.length - 1;
        return (
          <View
            key={lens.figureId + i}
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              marginRight: last ? 0 : -4,
              zIndex: i + 1,
            }}
          >
            <View style={{ marginRight: lens.sharedTo ? -16 : 0, zIndex: 1 }}>
              <LensAvatar
                name={lens.figureName}
                size={48}
                ring={ring}
                shadow={mode === 'kawaii' ? t.fig.avatar.shadow : undefined}
              />
            </View>
            {lens.sharedTo ? (
              <View style={{ zIndex: 2 }}>
                <SocialIcon platform={lens.sharedTo} size={16} />
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
