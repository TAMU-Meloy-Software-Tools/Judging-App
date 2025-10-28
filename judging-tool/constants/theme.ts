/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const maroon = '#500000';
const maroonLight = '#7A0019';
const maroonLighter = '#9D0022';
const tanBackground = '#F9F6F1';
const tanSurface = '#FFFFFF';
const tanMuted = '#E8DCCD';
const textPrimary = '#2F1B1A';
const textSecondary = '#6B504A';

export const Colors = {
  light: {
    text: textPrimary,
    background: tanBackground,
    tint: maroon,
    icon: textSecondary,
    tabIconDefault: textSecondary,
    tabIconSelected: maroon,
    surface: tanSurface,
    surfaceMuted: tanMuted,
    accent: maroonLight,
  },
  dark: {
    text: '#F8F5F0',
    background: '#1F0D0D',
    tint: maroonLighter,
    icon: '#E2D3C5',
    tabIconDefault: '#BFA69A',
    tabIconSelected: maroonLighter,
    surface: '#2B1514',
    surfaceMuted: '#3B1D1C',
    accent: maroonLight,
  },
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
