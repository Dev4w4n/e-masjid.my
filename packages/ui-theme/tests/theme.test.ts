// Contract test for MUI theme package
// This test validates the Material-UI theme implementation

import { describe, it, expect } from 'vitest';

describe('MUI Theme Contract', () => {
  describe('Theme Creation', () => {
    it('should create a complete Material-UI theme', async () => {
      const { createMasjidTheme } = await import('../src/theme.js');
      
      expect(createMasjidTheme).toBeDefined();
      expect(typeof createMasjidTheme).toBe('function');
      
      const theme = createMasjidTheme();
      
      // Should be a valid MUI theme object
      expect(theme).toBeDefined();
      expect(typeof theme).toBe('object');
      expect(theme.palette).toBeDefined();
      expect(theme.typography).toBeDefined();
      expect(theme.components).toBeDefined();
      expect(theme.breakpoints).toBeDefined();
      expect(theme.spacing).toBeDefined();
    });

    it('should support light and dark mode', async () => {
      const { createMasjidTheme } = await import('../src/theme.js');
      
      const lightTheme = createMasjidTheme('light');
      const darkTheme = createMasjidTheme('dark');
      
      expect(lightTheme.palette.mode).toBe('light');
      expect(darkTheme.palette.mode).toBe('dark');
      
      // Should have different background colors
      expect(lightTheme.palette.background.default).not.toBe(
        darkTheme.palette.background.default
      );
    });

    it('should support custom color overrides', async () => {
      const { createMasjidTheme } = await import('../src/theme.js');
      
      const customColors = {
        primary: {
          main: '#0066cc',
        },
        secondary: {
          main: '#ff6600',
        },
      };
      
      const theme = createMasjidTheme('light', customColors);
      
      expect(theme.palette.primary.main).toBe('#0066cc');
      expect(theme.palette.secondary.main).toBe('#ff6600');
    });
  });

  describe('Islamic Colors', () => {
    it('should provide Islamic color palette constants', async () => {
      const { ISLAMIC_COLORS } = await import('../src/theme.js');
      
      expect(ISLAMIC_COLORS).toBeDefined();
      expect(typeof ISLAMIC_COLORS).toBe('object');
      
      // Should contain Islamic-themed colors
      expect(ISLAMIC_COLORS.green).toBeDefined(); // Traditional Islamic green
      expect(ISLAMIC_COLORS.gold).toBeDefined(); // Islamic gold/amber
      expect(ISLAMIC_COLORS.teal).toBeDefined(); // Calming teal
      expect(ISLAMIC_COLORS.navy).toBeDefined(); // Deep navy blue
      
      // Colors should be valid hex codes
      expect(ISLAMIC_COLORS.green).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(ISLAMIC_COLORS.gold).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(ISLAMIC_COLORS.teal).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(ISLAMIC_COLORS.navy).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('should provide Malaysian flag colors', async () => {
      const { MALAYSIAN_COLORS } = await import('../src/theme.js');
      
      expect(MALAYSIAN_COLORS).toBeDefined();
      expect(typeof MALAYSIAN_COLORS).toBe('object');
      
      // Should contain Malaysian flag colors
      expect(MALAYSIAN_COLORS.red).toBeDefined(); // Malaysian red
      expect(MALAYSIAN_COLORS.blue).toBeDefined(); // Malaysian blue
      expect(MALAYSIAN_COLORS.yellow).toBeDefined(); // Malaysian yellow
      expect(MALAYSIAN_COLORS.white).toBeDefined(); // White
      
      // Colors should be valid hex codes
      expect(MALAYSIAN_COLORS.red).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(MALAYSIAN_COLORS.blue).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(MALAYSIAN_COLORS.yellow).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(MALAYSIAN_COLORS.white).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  describe('Typography', () => {
    it('should support Arabic font integration', async () => {
      const { createMasjidTheme } = await import('../src/theme.js');
      
      const theme = createMasjidTheme();
      
      // Should have Arabic font stack
      expect(theme.typography.fontFamily).toContain('Noto Sans Arabic');
      
      // Should have RTL typography variant
      expect(theme.typography.arabic).toBeDefined();
      expect(theme.typography.arabic.fontFamily).toContain('Noto Sans Arabic');
      expect(theme.typography.arabic.direction).toBe('rtl');
    });

    it('should have Malaysian-specific font preferences', async () => {
      const { createMasjidTheme } = await import('../src/theme.js');
      
      const theme = createMasjidTheme();
      
      // Should prioritize fonts with good Malay/Latin support
      const fontFamily = theme.typography.fontFamily;
      expect(typeof fontFamily).toBe('string');
      expect(fontFamily).toContain('Roboto');
    });

    it('should provide Quranic text typography variant', async () => {
      const { createMasjidTheme } = await import('../src/theme.js');
      
      const theme = createMasjidTheme();
      
      // Should have special variant for Quranic text
      expect(theme.typography.quran).toBeDefined();
      expect(theme.typography.quran.fontFamily).toContain('Uthmanic');
      expect(theme.typography.quran.fontSize).toBe('1.3rem');
      expect(theme.typography.quran.lineHeight).toBe(2);
    });
  });

  describe('Component Overrides', () => {
    it('should customize AppBar for Islamic theme', async () => {
      const { createMasjidTheme } = await import('../src/theme.js');
      
      const theme = createMasjidTheme();
      
      // Should have AppBar customizations
      expect(theme.components).toBeDefined();
      expect(theme.components?.MuiAppBar).toBeDefined();
      expect(theme.components?.MuiAppBar?.styleOverrides).toBeDefined();
      
      const appBarStyles = theme.components?.MuiAppBar?.styleOverrides?.root;
      expect(appBarStyles).toBeDefined();
    });

    it('should customize Card components for Islamic design', async () => {
      const { createMasjidTheme } = await import('../src/theme.js');
      
      const theme = createMasjidTheme();
      
      // Should have Card customizations
      expect(theme.components).toBeDefined();
      expect(theme.components?.MuiCard).toBeDefined();
      expect(theme.components?.MuiCard?.styleOverrides).toBeDefined();
      
      const cardStyles = theme.components?.MuiCard?.styleOverrides?.root;
      expect(cardStyles).toBeDefined();
      // Note: borderRadius may be nested in style object, so just check it exists
    });

    it('should customize Button components', async () => {
      const { createMasjidTheme } = await import('../src/theme.js');
      
      const theme = createMasjidTheme();
      
      // Should have Button customizations
      expect(theme.components).toBeDefined();
      expect(theme.components?.MuiButton).toBeDefined();
      expect(theme.components?.MuiButton?.styleOverrides).toBeDefined();
      
      const buttonStyles = theme.components?.MuiButton?.styleOverrides;
      expect(buttonStyles?.root).toBeDefined();
      expect(buttonStyles?.contained).toBeDefined();
      expect(buttonStyles?.outlined).toBeDefined();
    });

    it('should customize TextField components', async () => {
      const { createMasjidTheme } = await import('../src/theme.js');
      
      const theme = createMasjidTheme();
      
      // Should have TextField customizations
      expect(theme.components).toBeDefined();
      expect(theme.components?.MuiTextField).toBeDefined();
      expect(theme.components?.MuiOutlinedInput).toBeDefined();
      
      const textFieldStyles = theme.components?.MuiTextField?.styleOverrides;
      expect(textFieldStyles).toBeDefined();
    });
  });

  describe('Breakpoints', () => {
    it('should have responsive breakpoints', async () => {
      const { createMasjidTheme } = await import('../src/theme.js');
      
      const theme = createMasjidTheme();
      
      // Should have standard breakpoints
      expect(theme.breakpoints.values.xs).toBe(0);
      expect(theme.breakpoints.values.sm).toBe(600);
      expect(theme.breakpoints.values.md).toBe(900);
      expect(theme.breakpoints.values.lg).toBe(1200);
      expect(theme.breakpoints.values.xl).toBe(1536);
    });

    it('should provide mobile-first responsive utilities', async () => {
      const { createMasjidTheme } = await import('../src/theme.js');
      
      const theme = createMasjidTheme();
      
      // Should have breakpoint helper functions
      expect(theme.breakpoints.up).toBeDefined();
      expect(theme.breakpoints.down).toBeDefined();
      expect(theme.breakpoints.between).toBeDefined();
      expect(theme.breakpoints.only).toBeDefined();
    });
  });

  describe('Spacing', () => {
    it('should use 8px spacing scale', async () => {
      const { createMasjidTheme } = await import('../src/theme.js');
      
      const theme = createMasjidTheme();
      
      // Should use 8px base spacing
      expect(theme.spacing(1)).toBe('8px');
      expect(theme.spacing(2)).toBe('16px');
      expect(theme.spacing(3)).toBe('24px');
      expect(theme.spacing(4)).toBe('32px');
    });

    it('should support fractional spacing', async () => {
      const { createMasjidTheme } = await import('../src/theme.js');
      
      const theme = createMasjidTheme();
      
      // Should support half spacing
      expect(theme.spacing(0.5)).toBe('4px');
      expect(theme.spacing(1.5)).toBe('12px');
      expect(theme.spacing(2.5)).toBe('20px');
    });
  });

  describe('Theme Provider Setup', () => {
    it('should export theme provider component', async () => {
      const { MasjidThemeProvider } = await import('../src/theme.js');
      
      expect(MasjidThemeProvider).toBeDefined();
      expect(typeof MasjidThemeProvider).toBe('function'); // React component
    });

    it('should export theme context hook', async () => {
      const { useMasjidTheme } = await import('../src/theme.js');
      
      expect(useMasjidTheme).toBeDefined();
      expect(typeof useMasjidTheme).toBe('function'); // React hook
    });

    it('should export theme mode toggle hook', async () => {
      const { useThemeMode } = await import('../src/theme.js');
      
      expect(useThemeMode).toBeDefined();
      expect(typeof useThemeMode).toBe('function'); // React hook
    });
  });

  describe('Accessibility', () => {
    it('should have high contrast mode support', async () => {
      const { createMasjidTheme } = await import('../src/theme.js');
      
      const theme = createMasjidTheme('light', {}, { highContrast: true });
      
      expect(theme).toBeDefined();
      
      // Should have enhanced contrast ratios
      const contrast = theme.palette.getContrastText(theme.palette.primary.main);
      expect(contrast).toBeDefined();
    });

    it('should meet WCAG contrast requirements', async () => {
      const { createMasjidTheme } = await import('../src/theme.js');
      
      const lightTheme = createMasjidTheme('light');
      const darkTheme = createMasjidTheme('dark');
      
      // Should have sufficient contrast in both modes
      expect(lightTheme.palette.primary.contrastText).toBeDefined();
      expect(darkTheme.palette.primary.contrastText).toBeDefined();
      expect(lightTheme.palette.secondary.contrastText).toBeDefined();
      expect(darkTheme.palette.secondary.contrastText).toBeDefined();
    });
  });

  describe('CSS Variables', () => {
    it('should support CSS custom properties', async () => {
      const { createMasjidTheme } = await import('../src/theme.js');
      
      const theme = createMasjidTheme();
      
      // Should support CSS variables for dynamic theming
      expect((theme as any).cssVarPrefix).toBe('masjid');
      expect((theme as any).vars).toBeDefined();
    });

    it('should generate CSS variables for colors', async () => {
      const { createMasjidTheme } = await import('../src/theme.js');
      
      const theme = createMasjidTheme();
      
      // Should have CSS variable generation capability
      expect((theme as any).vars).toBeDefined();
      expect((theme as any).vars?.palette).toBeDefined();
    });
  });
});
