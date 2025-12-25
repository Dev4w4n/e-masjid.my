import React, { Suspense, lazy, useMemo, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Grid,
  Card,
  CardContent,
  useTheme,
  alpha,
  Skeleton,
} from "@mui/material";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import SecurityIcon from "@mui/icons-material/Security";
import SpeedIcon from "@mui/icons-material/Speed";
import { useNavigate } from "react-router-dom";
import { LanguageToggle } from "./LanguageToggle";
import { useTranslation } from "@masjid-suite/i18n";

// Lazy load heavy component (T044 - Performance optimization)
const TierComparisonTable = lazy(() =>
  import("@masjid-suite/ui-components").then((module) => ({
    default: module.TierComparisonTable,
  }))
);

interface LandingPageProps {
  language: "bm" | "en";
  onLanguageToggle: (language: "bm" | "en") => void;
}

/**
 * Public landing page for unauthenticated users
 *
 * Features:
 * - Hero section with value proposition
 * - Key benefits showcase
 * - Tier comparison table
 * - Call-to-action buttons
 * - Bilingual support (Bahasa Malaysia / English)
 */
export const LandingPage: React.FC<LandingPageProps> = ({
  language,
  onLanguageToggle,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Memoize benefits to avoid re-computing on every render (T044 - Performance)
  const benefits = useMemo(
    () => [
      {
        icon: RocketLaunchIcon,
        title: t("landing.benefit_easy_title"),
        description: t("landing.benefit_easy_desc"),
        color: theme.palette.primary.main,
      },
      {
        icon: SecurityIcon,
        title: t("landing.benefit_secure_title"),
        description: t("landing.benefit_secure_desc"),
        color: theme.palette.success.main,
      },
      {
        icon: SpeedIcon,
        title: t("landing.benefit_fast_title"),
        description: t("landing.benefit_fast_desc"),
        color: theme.palette.info.main,
      },
    ],
    [t, theme.palette]
  );

  // Memoize callbacks to prevent unnecessary re-renders (T044 - Performance)
  const handleSelectTier = useCallback(
    (tier: string) => {
      // Navigate to registration with tier pre-selected
      navigate(`/auth/register?tier=${tier}`);
    },
    [navigate]
  );

  const scrollToPricing = useCallback(() => {
    const pricingSection = document.getElementById("pricing");
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <Box sx={{ minHeight: "100vh" }}>
      {/* Hero Section */}
      <Box
        sx={{
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background Decorations */}
        <Box
          sx={{
            position: "absolute",
            top: "-10%",
            right: "-5%",
            width: "40%",
            height: "60%",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
            filter: "blur(60px)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "-10%",
            left: "-5%",
            width: "40%",
            height: "60%",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
            filter: "blur(60px)",
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Stack spacing={4}>
                <Typography
                  variant="h2"
                  component="h1"
                  fontWeight="bold"
                  sx={{
                    fontSize: { xs: "2.5rem", md: "3.5rem" },
                    lineHeight: 1.2,
                    color: theme.palette.text.primary,
                  }}
                >
                  {t("landing.hero_title")}
                </Typography>
                <Typography
                  variant="h5"
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: "1.1rem", md: "1.3rem" },
                    lineHeight: 1.6,
                  }}
                >
                  {t("landing.hero_subtitle")}
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => handleSelectTier("rakyat")}
                    sx={{
                      py: 1.5,
                      px: 4,
                      fontSize: "1.1rem",
                      textTransform: "none",
                      boxShadow: theme.shadows[8],
                    }}
                  >
                    {t("landing.hero_cta_primary")}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={scrollToPricing}
                    sx={{
                      py: 1.5,
                      px: 4,
                      fontSize: "1.1rem",
                      textTransform: "none",
                    }}
                  >
                    {t("landing.hero_cta_secondary")}
                  </Button>
                </Stack>
                <LanguageToggle
                  language={language}
                  onChange={onLanguageToggle}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              {/* Placeholder for hero image/illustration */}
              <Box
                sx={{
                  width: "100%",
                  height: 400,
                  borderRadius: 4,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.secondary.main, 0.2)} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: theme.shadows[16],
                }}
              >
                <Typography variant="h4" color="text.secondary">
                  Hero Image
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Stack spacing={8}>
          <Box textAlign="center">
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              {t("landing.benefits_title")}
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Stack spacing={2} alignItems="center" textAlign="center">
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: "50%",
                          background: alpha(benefit.color, 0.1),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <benefit.icon
                          sx={{ fontSize: 40, color: benefit.color }}
                        />
                      </Box>
                      <Typography variant="h5" fontWeight="bold">
                        {benefit.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {benefit.description}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Container>

      {/* Pricing Section */}
      <Box
        id="pricing"
        sx={{
          py: 12,
          background: alpha(theme.palette.background.default, 0.5),
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={6}>
            <Box textAlign="center">
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                {t("landing.pricing_title")}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {t("landing.pricing_subtitle")}
              </Typography>
            </Box>
            <Suspense
              fallback={
                <Box sx={{ width: "100%" }}>
                  <Skeleton
                    variant="rectangular"
                    height={400}
                    sx={{ borderRadius: 2, mb: 2 }}
                  />
                  <Stack direction="row" spacing={2} justifyContent="center">
                    <Skeleton
                      variant="rectangular"
                      width={120}
                      height={40}
                      sx={{ borderRadius: 1 }}
                    />
                    <Skeleton
                      variant="rectangular"
                      width={120}
                      height={40}
                      sx={{ borderRadius: 1 }}
                    />
                    <Skeleton
                      variant="rectangular"
                      width={120}
                      height={40}
                      sx={{ borderRadius: 1 }}
                    />
                  </Stack>
                </Box>
              }
            >
              <TierComparisonTable
                language={language}
                onSelectTier={handleSelectTier}
              />
            </Suspense>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          py: 4,
          textAlign: "center",
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary">
            {t("landing.footer_copyright")}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};
