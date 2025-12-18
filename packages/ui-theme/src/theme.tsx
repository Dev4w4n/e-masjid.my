import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  createTheme,
  Theme,
  ThemeProvider,
  ThemeOptions,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Extend Material-UI Typography interface to include custom variants
declare module "@mui/material/styles" {
  interface ThemeOptions {
    cssVarPrefix?: string;
  }

  interface TypographyVariants {
    arabic: React.CSSProperties;
    quran: React.CSSProperties;
  }

  // Allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    arabic?: React.CSSProperties;
    quran?: React.CSSProperties;
  }
}

// Update the Typography's variant prop options
declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    arabic: true;
    quran: true;
  }
}

/**
 * Open E Masjid color palette
 * Based on Legacy Landing Page Design System
 */
export const EMASJID_COLORS = {
  // Primary blue scale
  blue: {
    100: "#E6F0FD",
    200: "#CCE2FC",
    300: "#99C5FA",
    400: "#66A9F7",
    500: "#338CF5", // Primary blue
    600: "#0070F4", // Button blue
    700: "#0064DA",
    800: "#0059C2",
    900: "#004391",
  },
  // Teal/Cyan accent scale
  teal: {
    100: "#E6FFFA",
    200: "#B2F5EA",
    300: "#81E6D9",
    400: "#4FD1C5", // Secondary teal
    500: "#3ABAB4",
    600: "#319795",
    700: "#2C7A7B",
    800: "#285E61",
    900: "#234E52",
  },
  // Gray scale
  gray: {
    100: "#FBFBFB",
    200: "#EAEAEA",
    300: "#DFDFDF",
    400: "#999999",
    500: "#7F7F7F",
    600: "#666666",
    700: "#4C4C4C",
    800: "#333333",
    900: "#191919",
  },
  // Zinc scale (for subtle UI elements)
  zinc: {
    50: "#fafafa",
    100: "#f4f4f5",
    200: "#e4e4e7",
    300: "#d4d4d8",
    400: "#a1a1aa",
    500: "#71717a",
    600: "#52525b",
    700: "#3f3f46",
    800: "#27272a",
    900: "#18181b",
    950: "#09090b",
  },
  // Legacy simple accessors for backward compatibility
  buttonBlue: "#0070F4",
  textPrimary: "#191919",
  textSecondary: "#666666",
  textTertiary: "#999999",
  background: "#FFFFFF",
  backgroundGray: "#FBFBFB",
  border: "#EAEAEA",
  borderDark: "#DFDFDF",
} as const;

/**
 * Malaysian flag-inspired colors
 */
export const MALAYSIAN_COLORS = {
  // Malaysian red
  red: "#CC0001",
  // Malaysian blue
  blue: "#010066",
  // Malaysian yellow
  yellow: "#FFCC00",
  // White
  white: "#FFFFFF",
} as const;

/**
 * Theme mode type
 */
export type ThemeMode = "light" | "dark";

/**
 * Custom color overrides
 */
interface CustomColors {
  primary?: {
    main?: string;
    light?: string;
    dark?: string;
  };
  secondary?: {
    main?: string;
    light?: string;
    dark?: string;
  };
}

/**
 * Theme options
 */
interface MasjidThemeOptions {
  highContrast?: boolean;
}

/**
 * Create the Masjid-themed Material-UI theme
 */
export function createMasjidTheme(
  mode: ThemeMode = "light",
  customColors?: CustomColors,
  options?: MasjidThemeOptions
): Theme {
  const isHighContrast = options?.highContrast || false;

  const baseTheme = createTheme({
    cssVarPrefix: "masjid",
    palette: {
      mode,
      primary: {
        main: customColors?.primary?.main || EMASJID_COLORS.blue[500],
        light: customColors?.primary?.light || EMASJID_COLORS.blue[300],
        dark: customColors?.primary?.dark || EMASJID_COLORS.blue[600],
        contrastText: "#FFFFFF",
      },
      secondary: {
        main: customColors?.secondary?.main || EMASJID_COLORS.teal[400],
        light: customColors?.secondary?.light || EMASJID_COLORS.teal[300],
        dark: customColors?.secondary?.dark || EMASJID_COLORS.teal[600],
        contrastText: "#FFFFFF",
      },
      background: {
        default: mode === "light" ? EMASJID_COLORS.backgroundGray : "#121212",
        paper: mode === "light" ? EMASJID_COLORS.background : "#1E1E1E",
      },
      text: {
        primary:
          mode === "light"
            ? isHighContrast
              ? "#000000"
              : EMASJID_COLORS.textPrimary
            : isHighContrast
              ? "#FFFFFF"
              : "#E0E0E0",
        secondary:
          mode === "light"
            ? isHighContrast
              ? "#333333"
              : EMASJID_COLORS.textSecondary
            : isHighContrast
              ? "#CCCCCC"
              : "#B0BEC5",
      },
      error: {
        main: "#D32F2F",
        light: "#EF5350",
        dark: "#C62828",
      },
      warning: {
        main: "#ED6C02",
        light: "#FF9800",
        dark: "#E65100",
      },
      info: {
        main: EMASJID_COLORS.blue[500],
        light: EMASJID_COLORS.blue[300],
        dark: EMASJID_COLORS.blue[600],
      },
      success: {
        main: EMASJID_COLORS.teal[400],
        light: EMASJID_COLORS.teal[300],
        dark: EMASJID_COLORS.teal[600],
      },
    },
    typography: {
      fontFamily: [
        '"Inter"',
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        '"Roboto"',
        '"Helvetica Neue"',
        "Arial",
        '"Noto Sans Arabic"',
        "sans-serif",
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(","),
      h1: {
        fontWeight: 800,
        fontSize: "3.25rem", // 52px
        lineHeight: 1.125,
        letterSpacing: "-0.02em",
      },
      h2: {
        fontWeight: 800,
        fontSize: "2.625rem", // 42px
        lineHeight: 1.25,
        letterSpacing: "-0.02em",
      },
      h3: {
        fontWeight: 700,
        fontSize: "2rem", // 32px
        lineHeight: 1.25,
      },
      h4: {
        fontWeight: 700,
        fontSize: "1.5rem", // 24px
        lineHeight: 1.375,
        letterSpacing: "-0.01em",
      },
      h5: {
        fontWeight: 600,
        fontSize: "1.25rem",
        lineHeight: 1.5,
      },
      h6: {
        fontWeight: 600,
        fontSize: "1.125rem",
        lineHeight: 1.5,
      },
      body1: {
        fontSize: "1rem",
        lineHeight: 1.5,
      },
      body2: {
        fontSize: "0.875rem",
        lineHeight: 1.5,
      },
      // Custom typography variants
      arabic: {
        fontFamily: [
          '"Noto Sans Arabic"',
          '"Traditional Arabic"',
          '"Times New Roman"',
          "serif",
        ].join(","),
        direction: "rtl",
        fontSize: "1.1rem",
        lineHeight: 1.8,
      },
      quran: {
        fontFamily: [
          '"Uthmanic Hafs"',
          '"KFGQPC Uthmanic Script HAFS"',
          '"Noto Sans Arabic"',
          "serif",
        ].join(","),
        direction: "rtl",
        fontSize: "1.3rem",
        lineHeight: 2,
        fontWeight: 400,
      },
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
      },
    },
    spacing: 8, // 8px base spacing (0.5rem)
    shape: {
      borderRadius: 4, // 0.25rem
    },
  });

  // Component overrides
  const theme = createTheme(baseTheme, {
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: "thin",
            backgroundColor: mode === "light" ? "#ffffff" : "#121212",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: mode === "light" ? "#f1f1f1" : "#2b2b2b",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#cbd5e1",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "#94a3b8",
            },
          },
          "html, body, #root": {
            backgroundColor: mode === "light" ? "#ffffff" : "#121212",
            minHeight: "100vh",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: `linear-gradient(to right, ${EMASJID_COLORS.blue}, ${EMASJID_COLORS.teal})`,
            boxShadow:
              "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
            "&.MuiAppBar-colorPrimary": {
              background: `linear-gradient(to right, ${EMASJID_COLORS.blue}, ${EMASJID_COLORS.teal})`,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16, // 1rem - Legacy rounded style
            border: `1px solid ${EMASJID_COLORS.border}`,
            boxShadow:
              mode === "light"
                ? "0 10px 15px -3px rgba(0,0,0,0.04), 0 4px 6px -2px rgba(0,0,0,0.02)"
                : "0 2px 12px rgba(0,0,0,0.24)",
            transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              borderColor: EMASJID_COLORS.buttonBlue,
              transform: "translateY(-4px)",
              boxShadow:
                mode === "light"
                  ? "0 20px 25px -5px rgba(0,0,0,0.12), 0 10px 10px -5px rgba(0,0,0,0.02)"
                  : "0 4px 20px rgba(0,0,0,0.32)",
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 9999, // Full rounded (pill shape) - Legacy style
            textTransform: "none",
            fontWeight: 600,
            padding: "12px 32px", // 0.75rem 2rem
            minHeight: "44px",
            transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
            letterSpacing: "0.01em",
          },
          contained: {
            backgroundColor: EMASJID_COLORS.buttonBlue,
            boxShadow:
              "0 10px 15px -3px rgba(0,112,244,0.04), 0 4px 6px -2px rgba(0,112,244,0.02)",
            "&:hover": {
              backgroundColor: EMASJID_COLORS.blue[700],
              transform: "translateY(-1px)",
              boxShadow: "0 4px 12px rgba(0,112,244,0.3)",
            },
            "&:active": {
              transform: "translateY(0)",
            },
            "&.MuiButton-containedPrimary": {
              backgroundColor: EMASJID_COLORS.buttonBlue,
              "&:hover": {
                backgroundColor: EMASJID_COLORS.blue[700],
              },
            },
          },
          outlined: {
            borderWidth: "2px",
            borderColor: EMASJID_COLORS.buttonBlue,
            color: EMASJID_COLORS.buttonBlue,
            "&:hover": {
              borderWidth: "2px",
              borderColor: EMASJID_COLORS.buttonBlue,
              backgroundColor: EMASJID_COLORS.blue[100],
              transform: "translateY(-1px)",
            },
          },
          sizeLarge: {
            padding: "14px 40px",
            fontSize: "1rem",
          },
          sizeSmall: {
            padding: "8px 20px",
            fontSize: "0.875rem",
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 8, // 0.5rem - Legacy rounded input style
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: EMASJID_COLORS.borderDark,
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: EMASJID_COLORS.buttonBlue,
                borderWidth: "1px",
                boxShadow: "0 0 0 3px rgba(0, 112, 244, 0.1)",
              },
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: EMASJID_COLORS.buttonBlue,
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8, // 0.5rem
            backgroundColor: EMASJID_COLORS.background,
            transition: "all 150ms ease-in-out",
          },
          notchedOutline: {
            borderColor: EMASJID_COLORS.border,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            fontWeight: 500,
          },
          colorPrimary: {
            backgroundColor: EMASJID_COLORS.blue,
            color: "#FFFFFF",
          },
          colorSecondary: {
            backgroundColor: EMASJID_COLORS.teal,
            color: "#FFFFFF",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 4,
          },
          elevation1: {
            boxShadow:
              "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
          },
          elevation2: {
            boxShadow:
              "0 4px 6px -1px rgba(0,0,0,0.04), 0 2px 4px -1px rgba(0,0,0,0.03)",
          },
          elevation3: {
            boxShadow:
              "0 10px 15px -3px rgba(0,0,0,0.04), 0 4px 6px -2px rgba(0,0,0,0.02)",
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            color: EMASJID_COLORS.textPrimary,
            fontWeight: 700,
            fontSize: "1.5rem",
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: EMASJID_COLORS.buttonBlue,
            height: 2,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 500,
            "&.Mui-selected": {
              color: EMASJID_COLORS.buttonBlue,
            },
          },
        },
      },
    },
  });

  // Add CSS variables support
  const themeWithVars = createTheme(theme, {
    vars: {
      palette: theme.palette,
    },
    colorSchemes: {
      light: {
        palette: theme.palette,
      },
      dark: {
        palette: createTheme({ palette: { mode: "dark" } }).palette,
      },
    },
  });

  return themeWithVars;
}

/**
 * Theme context
 */
interface ThemeContextType {
  mode: ThemeMode;
  toggleMode: () => void;
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Theme provider props
 */
interface MasjidThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
  customColors?: CustomColors;
  options?: MasjidThemeOptions;
}

/**
 * Masjid theme provider component
 */
export function MasjidThemeProvider({
  children,
  defaultMode = "light",
  customColors,
  options,
}: MasjidThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(defaultMode);

  // Load theme preference from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem("masjid-theme-mode") as ThemeMode;
    if (savedMode && (savedMode === "light" || savedMode === "dark")) {
      setMode(savedMode);
    }
  }, []);

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem("masjid-theme-mode", mode);
  }, [mode]);

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const theme = createMasjidTheme(mode, customColors, options);

  const value: ThemeContextType = {
    mode,
    toggleMode,
    theme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

/**
 * Hook to use the Masjid theme context
 */
export function useMasjidTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useMasjidTheme must be used within a MasjidThemeProvider");
  }
  return context;
}

/**
 * Hook to use theme mode
 */
export function useThemeMode() {
  const { mode, toggleMode } = useMasjidTheme();
  return { mode, toggleMode };
}

// Re-export Material-UI theme types for convenience
export type { Theme, ThemeOptions } from "@mui/material/styles";
