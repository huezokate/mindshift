import { Text, View } from 'react-native';

import { relativeTimeAgo } from '@/lib/relative-time';
import { useTheme, type Theme } from '@/theme';

import { LensAvatar } from './lens-avatar';
import type { LensResponseLite, ShareRecord } from './journal-types';
import type { SharePlatform } from './social-svgs';

const PLATFORM_LABEL: Record<SharePlatform, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  link: 'Link',
  native: 'Share sheet',
  download: 'Downloaded',
};

/**
 * Lens response card — RN port of V200/src/components/journal/
 * LensResponseCard.tsx. Header = avatar + figure name; body = signature quote
 * (cyberpunk/kawaii) + response; foot = the "SHARED …" log. Fully
 * theme-branched like the web (three distinct chrome recipes).
 */
export function LensCard({ response }: { response: LensResponseLite }) {
  const { mode, tokens: t } = useTheme();
  if (mode === 'cyberpunk') return <Cyberpunk response={response} t={t} />;
  if (mode === 'kawaii') return <Kawaii response={response} t={t} />;
  return <Notepad response={response} t={t} />;
}

function ShareLog({ shares, t }: { shares: ShareRecord[] | undefined; t: Theme }) {
  if (!shares?.length) return null;
  return (
    <View
      style={{
        gap: 4,
        paddingTop: 12,
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(127,127,127,0.18)',
      }}
    >
      <Text
        style={{
          fontFamily: t.fonts.body.regular,
          fontSize: 10,
          letterSpacing: 1.2,
          color: t.text.meta,
          textTransform: 'uppercase',
        }}
      >
        Shared
      </Text>
      {shares.map((s) => (
        <Text
          key={s.id}
          style={{
            fontFamily: t.fonts.body.regular,
            fontSize: 11,
            letterSpacing: 0.4,
            color: t.text.sub,
          }}
        >
          <Text style={{ color: t.palette.cyan, fontWeight: '700' }}>
            {PLATFORM_LABEL[s.platform]}
          </Text>
          <Text style={{ color: t.text.meta }}> · {relativeTimeAgo(s.sharedAt)}</Text>
        </Text>
      ))}
    </View>
  );
}

function FigureName({ name, t, mode }: { name: string; t: Theme; mode: Theme['mode'] }) {
  return (
    <Text
      numberOfLines={1}
      style={{
        flex: 1,
        fontFamily: t.fonts.body.bold ?? t.fonts.body.regular,
        fontWeight: mode === 'notepad' ? '600' : '700',
        fontSize: 12,
        letterSpacing: mode === 'cyberpunk' ? 1.32 : 0.55,
        lineHeight: 14,
        color: mode === 'kawaii' ? t.text.body : t.palette.green,
        textTransform: 'uppercase',
      }}
    >
      {name}
    </Text>
  );
}

function Cyberpunk({ response, t }: { response: LensResponseLite; t: Theme }) {
  const violet = t.palette.violet;
  return (
    <View
      style={{
        backgroundColor: t.card.bg,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 4,
        borderBottomWidth: 4,
        borderColor: violet,
        borderRadius: t.card.radius,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: violet,
        }}
      >
        <LensAvatar name={response.figureName} size={24} ring={{ width: 1, color: t.palette.pink }} />
        <FigureName name={response.figureName} t={t} mode="cyberpunk" />
      </View>
      <View style={{ padding: 16, gap: 10 }}>
        {response.quote ? (
          <Text
            style={{
              fontFamily: t.fonts.body.regular,
              fontSize: 14,
              lineHeight: 20,
              letterSpacing: 0.52,
              color: t.palette.pink,
              textAlign: 'center',
            }}
          >
            “{response.quote}”
          </Text>
        ) : null}
        <Text
          style={{
            fontFamily: t.fonts.body.regular,
            fontSize: 14,
            lineHeight: 20,
            letterSpacing: 0.52,
            color: t.palette.cyan,
          }}
        >
          {response.responseText}
        </Text>
        <ShareLog shares={response.shares} t={t} />
      </View>
    </View>
  );
}

function Kawaii({ response, t }: { response: LensResponseLite; t: Theme }) {
  const insetCyan = `inset 4px 0 0 0 ${t.palette.cyan}`;
  return (
    <View>
      <View
        style={{
          backgroundColor: t.lens.headerBg,
          boxShadow: insetCyan,
          borderTopWidth: t.input.border.top?.width ?? 0,
          borderTopColor: t.input.border.top?.color,
          borderLeftWidth: t.input.border.left?.width ?? 0,
          borderLeftColor: t.input.border.left?.color,
          borderRightWidth: t.input.border.right?.width ?? 0,
          borderRightColor: t.input.border.right?.color,
          borderBottomWidth: 1,
          borderBottomColor: t.input.divider,
          borderTopLeftRadius: t.input.radius,
          borderTopRightRadius: t.input.radius,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingVertical: 6,
          paddingHorizontal: 16,
        }}
      >
        <LensAvatar
          name={response.figureName}
          size={24}
          ring={t.fig.avatar.border}
          shadow={t.fig.avatar.shadow}
        />
        <FigureName name={response.figureName} t={t} mode="kawaii" />
      </View>
      <View
        style={{
          backgroundColor: t.card.bg,
          boxShadow: insetCyan,
          borderLeftWidth: t.input.border.left?.width ?? 0,
          borderLeftColor: t.input.border.left?.color,
          borderRightWidth: t.input.border.right?.width ?? 0,
          borderRightColor: t.input.border.right?.color,
          borderBottomWidth: t.input.border.bottom?.width ?? 0,
          borderBottomColor: t.input.border.bottom?.color,
          borderBottomLeftRadius: t.input.radius,
          borderBottomRightRadius: t.input.radius,
          padding: 16,
        }}
      >
        {response.quote ? (
          <Text
            style={{
              fontFamily: t.fonts.body.regular,
              fontSize: 13,
              lineHeight: 18,
              letterSpacing: 0.4,
              color: t.lens.quoteColor,
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            “{response.quote}”
          </Text>
        ) : null}
        <Text
          style={{
            fontFamily: t.fonts.body.regular,
            fontSize: 14,
            lineHeight: 20,
            letterSpacing: 0.52,
            color: t.text.body,
          }}
        >
          {response.responseText}
        </Text>
        <ShareLog shares={response.shares} t={t} />
      </View>
    </View>
  );
}

function Notepad({ response, t }: { response: LensResponseLite; t: Theme }) {
  const green = t.palette.green;
  return (
    <View style={{ filter: t.card.filter }}>
      <View
        style={{
          backgroundColor: t.card.bg,
          borderTopWidth: 1.5,
          borderLeftWidth: 4,
          borderRightWidth: 1.5,
          borderColor: green,
          borderTopLeftRadius: t.card.radius,
          borderTopRightRadius: t.card.radius,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingVertical: 6,
          paddingRight: 16,
          paddingLeft: 22,
        }}
      >
        <LensAvatar name={response.figureName} size={24} ring={{ width: 1, color: t.palette.pink }} />
        <FigureName name={response.figureName} t={t} mode="notepad" />
      </View>
      <View
        style={{
          backgroundColor: t.card.bg,
          borderLeftWidth: 4,
          borderRightWidth: 1.5,
          borderBottomWidth: 1.5,
          borderColor: green,
          borderBottomLeftRadius: t.card.radius,
          borderBottomRightRadius: t.card.radius,
          padding: 16,
        }}
      >
        <Text
          style={{
            fontFamily: t.fonts.body.regular,
            fontSize: 14,
            lineHeight: 20,
            letterSpacing: 0.18,
            color: t.text.body,
          }}
        >
          {response.responseText}
        </Text>
        <ShareLog shares={response.shares} t={t} />
      </View>
    </View>
  );
}
