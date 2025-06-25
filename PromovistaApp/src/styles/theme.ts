// Promovista Theme (Placeholder "Magic" Brand)

export const COLORS = {
  primary: '#007AFF', // Un albastru vibrant, des folosit ca primar
  primaryDark: '#0056b3', // O nuanță mai închisă pentru accente sau stări active
  primaryLight: '#66aeff', // O nuanță mai deschisă pentru fundaluri subtile

  secondary: '#FF8C00', // Un portocaliu pentru Call-to-Actions secundare sau accente (ex: buton cameră)

  success: '#28a745', // Verde pentru succes
  danger: '#dc3545',  // Roșu pentru erori sau acțiuni destructive
  warning: '#ffc107', // Galben pentru avertismente
  info: '#17a2b8',    // Albastru-verzui pentru informații

  background: '#f8f9fa', // Un gri foarte deschis pentru fundalul general al ecranelor
  surface: '#ffffff',    // Alb pentru carduri, input-uri, suprafețe

  text: '#212529',         // Negru/Gri închis pentru textul principal
  textSecondary: '#6c757d', // Gri pentru text secundar, placeholder
  textLight: '#ffffff',     // Text alb pentru butoane închise la culoare sau fundaluri întunecate

  border: '#dee2e6',       // Gri deschis pentru borduri
  disabled: '#ced4da',     // Gri pentru elemente dezactivate

  // Culori specifice "Magic" - Placeholder
  magicPurple: '#6f42c1', // Un mov specific brandului (exemplu)
  magicGold: '#ffbf00',   // Un auriu specific brandului (exemplu)
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16, // Default
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  display: 32,
};

export const FONT_WEIGHTS = {
  light: '300' as '300',
  regular: '400' as '400',
  medium: '500' as '500',
  semibold: '600' as '600',
  bold: '700' as '700',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16, // Default
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8, // Default
  lg: 12,
  xl: 20,
  round: 999,
};

export const SHADOWS = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
};

// TODO: Definirea fonturilor specifice (dacă există)
// export const FONTS = {
//   primaryRegular: 'MagicFont-Regular',
//   primaryBold: 'MagicFont-Bold',
// };

const theme = {
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  // FONTS,
};

export default theme;
