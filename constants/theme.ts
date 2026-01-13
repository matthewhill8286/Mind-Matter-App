/**
 * MindMate theme tokens (warm, earthy, soft UI)
 * Matches the design board: cream background, brown primary, sage accents.
 */

import { Platform } from "react-native";

// Brand / primary from designs (warm brown)
const brandBrown = "#9C7A57";
const brandBrownDark = "#B8946E";

// Warm neutrals
const cream = "#F6F4F2";
const cream2 = "#F2ECE6";
const ink = "#1B1A18";

// Accents seen across modules (sage / orange / lavender)
const sage = "#6E8B6F";
const sageDark = "#87A889";
const amber = "#E7A55C";
const lavender = "#7B79C9";

// UI neutrals
const borderLight = "rgba(0,0,0,0.08)";
const borderDark = "rgba(255,255,255,0.12)";
const iconLight = "rgba(0,0,0,0.55)";
const iconDark = "rgba(255,255,255,0.65)";

export const Colors = {
  light: {
    // core
    text: ink,
    background: cream,
    surface: "#FFFFFF", // cards/sheets on cream bg
    card: "#FFFFFF",
    mutedText: "rgba(0,0,0,0.60)",
    subtleText: "rgba(0,0,0,0.45)",

    // brand
    tint: brandBrown,
    primary: brandBrown,
    onPrimary: "#FFFFFF",

    // accents
    accent: sage,
    onAccent: "#FFFFFF",
    success: sage,
    warning: amber,
    info: lavender,

    // UI
    border: borderLight,
    divider: "rgba(0,0,0,0.06)",
    icon: iconLight,

    // inputs
    inputBg: cream2,
    inputText: ink,
    placeholder: "rgba(0,0,0,0.35)",

    // tabs
    tabBarBg: "#FFFFFF",
    tabIconDefault: "rgba(0,0,0,0.45)",
    tabIconSelected: brandBrown,

    // overlays
    shadow: "rgba(0,0,0,0.12)",
    overlay: "rgba(0,0,0,0.35)",
  },

  dark: {
    // core
    text: "#F4F2EE",
    background: "#151311", // warm charcoal
    surface: "#1E1A17",
    card: "#1E1A17",
    mutedText: "rgba(255,255,255,0.70)",
    subtleText: "rgba(255,255,255,0.55)",

    // brand
    tint: brandBrownDark,
    primary: brandBrownDark,
    onPrimary: "#1B1A18",

    // accents
    accent: sageDark,
    onAccent: "#1B1A18",
    success: sageDark,
    warning: "#F0B36A",
    info: "#9A98E6",

    // UI
    border: borderDark,
    divider: "rgba(255,255,255,0.08)",
    icon: iconDark,

    // inputs
    inputBg: "rgba(255,255,255,0.08)",
    inputText: "#F4F2EE",
    placeholder: "rgba(255,255,255,0.40)",

    // tabs
    tabBarBg: "#1E1A17",
    tabIconDefault: "rgba(255,255,255,0.55)",
    tabIconSelected: brandBrownDark,

    // overlays
    shadow: "rgba(0,0,0,0.45)",
    overlay: "rgba(0,0,0,0.55)",
  },
} as const;

// Optional: component sizing tokens that match the design language
export const UI = {
  radius: {
    sm: 12,
    md: 16,
    lg: 18,
    xl: 22,
    pill: 999,
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
  },
  // good defaults for cards/buttons in your designs
  card: {
    padding: 14,
    borderWidth: 1,
  },
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
