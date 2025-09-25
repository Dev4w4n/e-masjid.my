import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { createTheme, Theme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Extend Material-UI Typography interface to include custom variants
declare module "@mui/material/styles" {
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
 * Islamic-inspired color palette
 */
export const ISLAMIC_COLORS = {
  // Traditional Islamic green
  green: "#146B3A",
  // Islamic gold/amber
  gold: "#F5B800",
  // Calming teal
  teal: "#0D7377",
  // Deep navy blue
  navy: "#1B263B",
  // Warm earth tones
  earth: "#A0522D",
  // Pearl white
  pearl: "#F8F9FA",
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
  options?: MasjidThemeOptions,
): Theme {
  const isHighContrast = options?.highContrast || false;

  const baseTheme = createTheme({
    palette: {
      mode,
      primary: {
        main: customColors?.primary?.main || ISLAMIC_COLORS.green,
        light: customColors?.primary?.light || "#4A9960",
        dark: customColors?.primary?.dark || "#0E4B29",
        contrastText: "#FFFFFF",
      },
      secondary: {
        main: customColors?.secondary?.main || ISLAMIC_COLORS.gold,
        light: customColors?.secondary?.light || "#F7C633",
        dark: customColors?.secondary?.dark || "#B8860B",
        contrastText: "#000000",
      },
      background: {
        default: mode === "light" ? "#FAFAFA" : "#121212",
        paper: mode === "light" ? "#FFFFFF" : "#1E1E1E",
      },
      text: {
        primary:
          mode === "light"
            ? isHighContrast
              ? "#000000"
              : "#1B263B"
            : isHighContrast
              ? "#FFFFFF"
              : "#E0E0E0",
        secondary:
          mode === "light"
            ? isHighContrast
              ? "#333333"
              : "#0D7377"
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
        main: ISLAMIC_COLORS.teal,
        light: "#26A69A",
        dark: "#00695C",
      },
      success: {
        main: ISLAMIC_COLORS.green,
        light: "#4A9960",
        dark: "#0E4B29",
      },
    },
    typography: {
      fontFamily: [
        '"Roboto"',
        '"Noto Sans Arabic"',
        '"Helvetica Neue"',
        "Arial",
        "sans-serif",
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
        '"Noto Color Emoji"',
      ].join(","),
      h1: {
        fontWeight: 600,
        fontSize: "2.5rem",
        lineHeight: 1.2,
      },
      h2: {
        fontWeight: 600,
        fontSize: "2rem",
        lineHeight: 1.3,
      },
      h3: {
        fontWeight: 600,
        fontSize: "1.75rem",
        lineHeight: 1.4,
      },
      h4: {
        fontWeight: 500,
        fontSize: "1.5rem",
        lineHeight: 1.4,
      },
      h5: {
        fontWeight: 500,
        fontSize: "1.25rem",
        lineHeight: 1.5,
      },
      h6: {
        fontWeight: 500,
        fontSize: "1.1rem",
        lineHeight: 1.5,
      },
      body1: {
        fontSize: "1rem",
        lineHeight: 1.6,
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
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1536,
      },
    },
    spacing: 8, // 8px base spacing
    shape: {
      borderRadius: 8, // Subtle rounded corners
    },
  });

  // Component overrides
  const theme = createTheme(baseTheme, {
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: "thin",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: mode === "light" ? "#f1f1f1" : "#2b2b2b",
            },
            "&::-webkit-scrollbar-thumb": {
              background: ISLAMIC_COLORS.green,
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: baseTheme.palette.primary.dark,
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: ISLAMIC_COLORS.green,
            boxShadow: "0 2px 8px rgba(20, 107, 58, 0.15)",
            "&.MuiAppBar-colorPrimary": {
              backgroundColor: ISLAMIC_COLORS.green,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow:
              mode === "light"
                ? "0 2px 12px rgba(0,0,0,0.08)"
                : "0 2px 12px rgba(0,0,0,0.24)",
            transition:
              "box-shadow 0.3s ease-in-out, transform 0.2s ease-in-out",
            "&:hover": {
              boxShadow:
                mode === "light"
                  ? "0 4px 20px rgba(0,0,0,0.12)"
                  : "0 4px 20px rgba(0,0,0,0.32)",
              transform: "translateY(-2px)",
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: "none",
            fontWeight: 500,
            padding: "8px 24px",
            minHeight: "40px",
          },
          contained: {
            boxShadow: "0 2px 8px rgba(20, 107, 58, 0.3)",
            "&:hover": {
              boxShadow: "0 4px 16px rgba(20, 107, 58, 0.4)",
              transform: "translateY(-1px)",
            },
            "&:active": {
              transform: "translateY(0)",
            },
          },
          outlined: {
            borderWidth: "2px",
            "&:hover": {
              borderWidth: "2px",
              backgroundColor: `${ISLAMIC_COLORS.green}08`,
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 8,
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: ISLAMIC_COLORS.green,
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: ISLAMIC_COLORS.green,
                borderWidth: "2px",
              },
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 16,
          },
          colorPrimary: {
            backgroundColor: ISLAMIC_COLORS.green,
            color: "#FFFFFF",
          },
          colorSecondary: {
            backgroundColor: ISLAMIC_COLORS.gold,
            color: "#000000",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
          elevation1: {
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          },
          elevation2: {
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          },
          elevation3: {
            boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            color: ISLAMIC_COLORS.green,
            fontWeight: 600,
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: ISLAMIC_COLORS.gold,
            height: 3,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 500,
            "&.Mui-selected": {
              color: ISLAMIC_COLORS.green,
            },
          },
        },
      },
    },
  });

  return theme;
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
export type { Theme } from "@mui/material/styles";
