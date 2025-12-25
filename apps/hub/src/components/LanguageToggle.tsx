import React from "react";
import { Button, ButtonGroup, Box } from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";

interface LanguageToggleProps {
  language: "bm" | "en";
  onChange: (language: "bm" | "en") => void;
}

/**
 * Bilingual language toggle component
 * Task: T038 - User Story 1
 *
 * Features:
 * - Switch between Bahasa Malaysia (BM) and English (EN)
 * - Persists selection to sessionStorage
 * - Material-UI button group with language icon
 * - Highlighted active language
 */
export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  language,
  onChange,
}) => {
  const handleLanguageChange = (newLanguage: "bm" | "en") => {
    onChange(newLanguage);
    sessionStorage.setItem("preferredLanguage", newLanguage);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <LanguageIcon fontSize="small" color="action" />
      <ButtonGroup size="small" aria-label="language toggle">
        <Button
          variant={language === "bm" ? "contained" : "outlined"}
          onClick={() => handleLanguageChange("bm")}
          sx={{ minWidth: 50 }}
        >
          BM
        </Button>
        <Button
          variant={language === "en" ? "contained" : "outlined"}
          onClick={() => handleLanguageChange("en")}
          sx={{ minWidth: 50 }}
        >
          EN
        </Button>
      </ButtonGroup>
    </Box>
  );
};

/**
 * Hook to manage language state with sessionStorage persistence
 */
export const useLanguagePreference = (): [
  "bm" | "en",
  (lang: "bm" | "en") => void,
] => {
  const [language, setLanguage] = React.useState<"bm" | "en">(() => {
    // Initialize from sessionStorage or default to 'bm'
    const stored = sessionStorage.getItem("preferredLanguage");
    return stored === "en" || stored === "bm" ? stored : "bm";
  });

  return [language, setLanguage];
};
