import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Minds Shift — AI journaling that shifts your perspective',
    short_name: 'Minds Shift',
    description:
      'Vent, pick a lens from history’s greatest minds, and get an AI reframe. Journaling + mind mapping for mental clarity.',
    start_url: '/',
    display: 'standalone',
    background_color: '#faf7f2',
    theme_color: '#c0605a',
    categories: ['health', 'lifestyle', 'productivity'],
    icons: [{ src: '/lens-icon.png', sizes: 'any', type: 'image/png' }],
  }
}
