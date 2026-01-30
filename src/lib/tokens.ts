// PURPOSE: Design tokens and constants for the dashboard
// These follow the visual constraints defined in PROJECT_CONTEXT.md
// DO NOT: Use arbitrary colors - stick to the defined palette

// =============================================================================
// Color Tokens
// =============================================================================

export const colors = {
  // Status Colors (only 3 status colors as per spec)
  status: {
    compliant: '#22C55E',    // Green - on-site, normal
    warning: '#F59E0B',      // Amber - borderline, attention needed
    breach: '#EF4444',       // Red - critical, immediate action
    unknown: '#9CA3AF',      // Gray - location missing
  },

  // Neutral Palette (UI surfaces)
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0A0A0A',
  },

  // Background
  background: {
    primary: '#FFFFFF',
    secondary: '#FAFAFA',
    tertiary: '#F5F5F5',
    inverse: '#171717',
  },

  // Text
  text: {
    primary: '#171717',
    secondary: '#525252',
    tertiary: '#737373',
    inverse: '#FFFFFF',
    muted: '#A3A3A3',
  },

  // Chart Colors (muted as per spec)
  chart: {
    punchIn: '#3B82F6',      // Blue - muted
    punchOut: '#8B5CF6',     // Purple - muted
    fill: 'rgba(59, 130, 246, 0.1)',
  },

  // Borders
  border: {
    light: '#E5E5E5',
    default: '#D4D4D4',
    dark: '#A3A3A3',
  },
} as const;

// =============================================================================
// Typography Tokens
// =============================================================================

export const typography = {
  // As per spec: Large numeric (40-48px), headings (18-22px), body (13-15px)
  
  fontFamily: {
    sans: 'var(--font-geist-sans), system-ui, -apple-system, sans-serif',
    mono: 'var(--font-geist-mono), Menlo, Monaco, monospace',
  },

  fontSize: {
    // Dominant metric - largest display
    metric: '48px',
    metricMd: '40px',
    metricSm: '32px',

    // Section headings
    h1: '24px',
    h2: '20px',
    h3: '18px',

    // Body text
    body: '15px',
    bodySmall: '14px',
    caption: '13px',

    // Table text
    table: '14px',
    tableSmall: '13px',
  },

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  lineHeight: {
    tight: '1.2',
    normal: '1.5',
    relaxed: '1.75',
  },
} as const;

// =============================================================================
// Spacing Tokens
// =============================================================================

export const spacing = {
  // Base unit: 4px
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',

  // Semantic spacing
  section: '32px',
  card: '24px',
  cardCompact: '16px',
  kpi: '40px', // Generous spacing around KPIs
} as const;

// =============================================================================
// Layout Tokens
// =============================================================================

export const layout = {
  // 12-column grid as per spec
  grid: {
    columns: 12,
    gutter: '24px',
    margin: '24px',
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Container max widths
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1440px',
  },

  // Sidebar
  sidebar: {
    width: '280px',
    collapsedWidth: '64px',
  },

  // Card
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
} as const;

// =============================================================================
// Animation Tokens
// =============================================================================

export const animation = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// =============================================================================
// Shadow Tokens
// =============================================================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const;

// =============================================================================
// Z-Index Tokens
// =============================================================================

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
} as const;

// =============================================================================
// Status Mapping Utilities
// =============================================================================

export const statusConfig = {
  compliant: {
    color: colors.status.compliant,
    bgColor: 'rgba(34, 197, 94, 0.1)',
    label: 'On-site',
    icon: 'check-circle',
  },
  warning: {
    color: colors.status.warning,
    bgColor: 'rgba(245, 158, 11, 0.1)',
    label: 'Borderline',
    icon: 'alert-triangle',
  },
  breach: {
    color: colors.status.breach,
    bgColor: 'rgba(239, 68, 68, 0.1)',
    label: 'Off-site',
    icon: 'x-circle',
  },
  unknown: {
    color: colors.status.unknown,
    bgColor: 'rgba(156, 163, 175, 0.1)',
    label: 'Location missing',
    icon: 'help-circle',
  },
} as const;

export const exceptionTypeConfig = {
  OpenSession: {
    label: 'Open Session',
    description: 'Punch In with no Punch Out',
  },
  PunchOutWithoutIn: {
    label: 'Punch Out Without In',
    description: 'Punch Out without preceding Punch In',
  },
  LocationBreach: {
    label: 'Location Breach',
    description: 'Distance exceeds threshold',
  },
  LocationMissing: {
    label: 'Location Missing',
    description: 'No GPS data at punch time',
  },
} as const;

export const severityConfig = {
  warning: {
    color: colors.status.warning,
    bgColor: 'rgba(245, 158, 11, 0.1)',
    label: 'Warning',
  },
  critical: {
    color: colors.status.breach,
    bgColor: 'rgba(239, 68, 68, 0.1)',
    label: 'Critical',
  },
} as const;
