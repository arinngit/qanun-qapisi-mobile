export const BRAND_PRIMARY = '#7313e8';
export const BRAND_PRIMARY_LIGHT = '#7313e820';
export const BRAND_PRIMARY_MUTED = '#7313e810';

export const GRAY = {
  50: '#F9FAFB',
  100: '#F3F4F6',
  200: '#E5E7EB',
  300: '#D1D5DB',
  400: '#9CA3AF',
  500: '#6B7280',
  600: '#4B5563',
  700: '#374151',
  800: '#1F2937',
  900: '#111827',
} as const;

export const BACKGROUND_PAGE = GRAY[50];
export const BACKGROUND_CARD = '#FFFFFF';
export const TEXT_PRIMARY = GRAY[900];
export const TEXT_SECONDARY = GRAY[500];
export const TEXT_TERTIARY = GRAY[400];
export const BORDER_DEFAULT = GRAY[200];
export const BORDER_LIGHT = GRAY[100];

export const SUCCESS = '#10B981';
export const WARNING_BG = '#FFFBEB';
export const WARNING_BORDER = '#FCD34D';
export const WARNING_TEXT = '#92400E';

const tintColorLight = BRAND_PRIMARY;
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};
