// Extend Material-UI Typography interface to include custom variants
import "@mui/material/styles";

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
