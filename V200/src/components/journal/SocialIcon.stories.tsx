import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import SocialIcon from '@/components/journal/SocialIcon'
import type { SharePlatform } from '@/lib/journal-types'

// Brand share-badge glyphs (T-023-02). Each SharePlatform maps to an inline brand
// path (instagram/tiktok/facebook) or the sms chat-bubble fallback (link/native/
// download). Rendered in the theme accent on a per-theme badge bg, so the toolbar
// exercises all three skins. Size bumped to 32 so the glyph is legible in isolation.
const meta: Meta<typeof SocialIcon> = {
  title: 'Journal/SocialIcon',
  component: SocialIcon,
  args: { platform: 'instagram', size: 32 },
  argTypes: {
    platform: {
      control: { type: 'select' },
      options: ['instagram', 'tiktok', 'facebook', 'link', 'native', 'download'],
    },
    size: { control: { type: 'number' } },
  },
}
export default meta

type Story = StoryObj<typeof SocialIcon>

export const Instagram: Story = { args: { platform: 'instagram' } }
export const TikTok: Story = { args: { platform: 'tiktok' } }
export const Facebook: Story = { args: { platform: 'facebook' } }

// Glyph sweep — every SharePlatform side by side (link/native/download share the
// sms fallback bubble). Confirms none render as an empty/solid square.
const ALL: SharePlatform[] = ['instagram', 'tiktok', 'facebook', 'link', 'native', 'download']

export const AllPlatforms: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', padding: 24 }}>
      {ALL.map((platform) => (
        <div key={platform} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <SocialIcon platform={platform} size={32} />
          <span style={{ fontFamily: 'var(--font-body, monospace)', fontSize: 11, letterSpacing: '0.5px', color: 'var(--text-sub, currentColor)', textTransform: 'uppercase' }}>
            {platform}
          </span>
        </div>
      ))}
    </div>
  ),
}
