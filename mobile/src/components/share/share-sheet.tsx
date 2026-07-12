import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { useRef, useState } from 'react';
import { Linking, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { SocialIcon } from '@/components/journal/social-icon';
import type { SharePlatform } from '@/components/journal/social-svgs';
import { Icon } from '@/components/ui/icon';
import { Sheet } from '@/components/ui/sheet';
import { notifySuccess } from '@/lib/haptics';
import { figureById } from '@/lib/figures';
import { useApi } from '@/lib/use-api';
import { borderStyle, useTheme } from '@/theme';

import { CARD_H, CARD_W, QuoteCard } from './quote-card';

/**
 * Native quote-card share sheet — replaces T-030-04's minimal text share and
 * ports the web ShareSheet's feature matrix (V200 ShareSheet.tsx): live
 * card preview (the preview IS what gets captured), include-vent toggle,
 * Share / Instagram / TikTok / Facebook / Copy link / Download, share log.
 */
export function ShareSheet({
  open,
  responseId,
  figureId,
  responseText,
  ventText,
  onClose,
  onShared,
}: {
  open: boolean;
  /** Persisted response id — only needed to LOG the share (web parity). */
  responseId?: string | null;
  figureId: string;
  responseText: string;
  ventText: string;
  onClose: () => void;
  onShared?: (platform: SharePlatform) => void;
}) {
  const { tokens: t } = useTheme();
  const { api } = useApi();
  const { width: screenW } = useWindowDimensions();
  const shotRef = useRef<View>(null);
  const [includeVent, setIncludeVent] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const fig = figureById(figureId);
  // Fit the fixed-size card into the sheet width (sheet padding 20 ×2).
  const previewScale = Math.min(1, (screenW - 80) / CARD_W);

  async function logShare(platform: SharePlatform) {
    onShared?.(platform);
    if (!responseId) return; // pre-save shares have nothing to log to
    api(`/api/journal-v2/responses/${responseId}/share`, {
      method: 'POST',
      body: { platform },
    }).catch(() => {}); // non-blocking, web parity
  }

  /** Run a share action with the busy/status/error envelope. The action
      receives the captured 1080×1350 PNG uri (web pixel size), or null if
      the capture failed (status already set). */
  async function runAction(fn: (uri: string | null) => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setStatus(null);
    let uri: string | null = null;
    try {
      uri = await captureRef(shotRef, {
        format: 'png',
        quality: 1,
        width: 1080,
        height: 1350,
      });
    } catch {
      setStatus('Could not build the card. Please try again.');
    }
    try {
      await fn(uri);
    } catch {
      setStatus('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function saveToPhotos(uri: string | null): Promise<boolean> {
    if (!uri) return false;
    const perm = await MediaLibrary.requestPermissionsAsync(true);
    if (!perm.granted) {
      setStatus('Allow Photos access to save the card, then try again.');
      return false;
    }
    await MediaLibrary.saveToLibraryAsync(uri);
    return true;
  }

  const shareNative = () =>
    runAction(async (uri) => {
      if (!uri) return;
      if (!(await Sharing.isAvailableAsync())) {
        setStatus('Sharing is not available on this device. Use Download instead.');
        return;
      }
      await Sharing.shareAsync(uri, { mimeType: 'image/png' });
      await logShare('native');
      notifySuccess();
      setStatus('Shared.');
    });

  const shareInstagram = () =>
    runAction(async (uri) => {
      if (!(await saveToPhotos(uri))) return;
      await logShare('instagram');
      setStatus('Card saved to Photos. Add it to a Story or post.');
      Linking.openURL('instagram://library').catch(() => {});
    });

  const shareTikTok = () =>
    runAction(async (uri) => {
      if (!(await saveToPhotos(uri))) return;
      await logShare('tiktok');
      setStatus('Card saved to Photos. Create a TikTok post with it.');
      Linking.openURL('snssdk1233://').catch(() => {});
    });

  const shareFacebook = () =>
    runAction(async (uri) => {
      await saveToPhotos(uri);
      await logShare('facebook');
      setStatus('Card saved. Attach it to your Facebook post.');
      Linking.openURL(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://minds-shift.com')}`,
      ).catch(() => {});
    });

  // No public per-entry route yet — stay honest (web parity).
  const copyLink = () =>
    setStatus(
      'A public link to share individual entries isn’t ready yet. Use Share or Download to send the quote card.',
    );

  const download = () =>
    runAction(async (uri) => {
      if (!(await saveToPhotos(uri))) return;
      await logShare('download');
      notifySuccess();
      setStatus('Saved to Photos.');
    });

  if (!fig) return null;

  return (
    <Sheet open={open} onClose={onClose} position="bottom" chrome="fcard">
      <View style={{ gap: 16 }}>
        {/* Header */}
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Text
            style={{
              fontFamily: t.fonts.display.bold ?? t.fonts.display.regular,
              fontWeight: '700',
              fontSize: 18,
              letterSpacing: 1.44,
              textTransform: 'uppercase',
              color: t.palette.cyan,
            }}
          >
            Make a quote card
          </Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} hitSlop={8}>
            <Icon name="close" size={24} color={t.text.sub} />
          </Pressable>
        </View>

        {/* Live preview — this exact view is what gets captured. */}
        <View style={{ alignItems: 'center' }}>
          <View
            style={{
              width: CARD_W * previewScale,
              height: CARD_H * previewScale,
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: CARD_W,
                height: CARD_H,
                transform: [{ scale: previewScale }],
                transformOrigin: 'top left',
              }}
            >
              <View ref={shotRef} collapsable={false}>
                <QuoteCard
                  figureId={fig.id}
                  figureName={fig.name}
                  era={fig.era}
                  responseText={responseText}
                  ventText={ventText}
                  includeVent={includeVent}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Include-vent toggle */}
        <Pressable
          onPress={() => setIncludeVent((v) => !v)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: includeVent }}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
        >
          <Icon
            name={includeVent ? 'check_box' : 'check_box_outline_blank'}
            size={20}
            color={includeVent ? t.palette.cyan : t.text.sub}
          />
          <Text
            style={{
              fontFamily: t.fonts.body.regular,
              fontSize: 12,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              color: t.text.sub,
            }}
          >
            Include what I wrote
          </Text>
        </Pressable>

        {/* Platform actions — brand SVGs + Material glyph utilities (web row). */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <IconAction label="Share" onPress={shareNative} disabled={busy} icon="ios_share" />
          <IconAction label="Instagram" onPress={shareInstagram} disabled={busy} social="instagram" />
          <IconAction label="TikTok" onPress={shareTikTok} disabled={busy} social="tiktok" />
          <IconAction label="Facebook" onPress={shareFacebook} disabled={busy} social="facebook" />
          <IconAction label="Copy link" onPress={copyLink} disabled={busy} icon="link" />
          <IconAction label="Download" onPress={download} disabled={busy} icon="download" />
        </View>

        {status ? (
          <View
            style={{
              padding: 8,
              borderLeftWidth: 2,
              borderLeftColor: t.palette.cyan,
            }}
          >
            <Text
              style={{
                fontFamily: t.fonts.body.regular,
                fontSize: 13,
                lineHeight: 18,
                color: t.text.sub,
              }}
            >
              {status}
            </Text>
          </View>
        ) : null}
      </View>
    </Sheet>
  );
}

/** 45px icon action + caption (web IconAction). Brand SVGs can't live inside
    the DS Button (its children render in a Text), so this carries the
    btnSecondary chrome directly. */
function IconAction({
  label,
  onPress,
  disabled,
  icon,
  social,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: string;
  social?: SharePlatform;
}) {
  const { tokens: t } = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: 4, width: 56 }}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={{
          width: 45,
          height: 45,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: t.btnSecondary.bg,
          ...borderStyle(t.btnSecondary.border),
          borderRadius: t.btnSecondary.radius,
          boxShadow: t.btnSecondary.shadow,
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {social ? (
          <SocialIcon platform={social} size={22} />
        ) : (
          <Icon name={icon ?? 'ios_share'} size={20} color={t.btnSecondary.color} />
        )}
      </Pressable>
      <Text
        numberOfLines={1}
        style={{
          fontFamily: t.fonts.body.regular,
          fontSize: 10,
          letterSpacing: 0.4,
          textTransform: 'uppercase',
          textAlign: 'center',
          color: t.text.sub,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
