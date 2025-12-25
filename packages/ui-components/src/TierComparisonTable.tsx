import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Stack,
  useTheme,
  alpha,
  Tooltip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  useTierFeatures,
  useFeatureDescriptions,
} from "@masjid-suite/tier-management";

interface TierComparisonTableProps {
  language: "bm" | "en";
  onSelectTier?: (tier: string) => void;
}

/**
 * Material-UI table component displaying tier feature comparison
 *
 * Features:
 * - Bilingual support (Bahasa Malaysia / English)
 * - Three tiers: Rakyat (Free), Pro (RM30/mo), Premium (RM300-500/mo)
 * - Feature matrix with checkmarks/crosses
 * - Pricing display with billing cycle options
 * - CTA buttons for tier selection
 * - Recommended tier badge
 * - Responsive design
 *
 * @param language - Language code ('bm' | 'en')
 * @param onSelectTier - Callback when user selects a tier
 */
export const TierComparisonTable: React.FC<TierComparisonTableProps> = ({
  language,
  onSelectTier,
}) => {
  const theme = useTheme();
  const { features, comparisons, isLoading, error } = useTierFeatures(language);
  const { descriptions } = useFeatureDescriptions(language);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <Typography>
          {language === "bm" ? "Memuatkan..." : "Loading..."}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <Typography color="error">
          {language === "bm"
            ? "Gagal memuatkan maklumat pakej"
            : "Failed to load tier information"}
        </Typography>
      </Box>
    );
  }

  // Define feature rows to display in comparison table
  const featureRows = [
    {
      key: "max_tv_displays",
      label: language === "bm" ? "Paparan TV" : "TV Displays",
    },
    {
      key: "max_content_items",
      label: language === "bm" ? "Kandungan Maksimum" : "Max Content Items",
    },
    {
      key: "content_approval_required",
      label: language === "bm" ? "Kelulusan Kandungan" : "Content Approval",
    },
    {
      key: "custom_branding",
      label: language === "bm" ? "Penjenamaan Tersuai" : "Custom Branding",
    },
    {
      key: "white_label",
      label: language === "bm" ? "White Label" : "White Label",
    },
    {
      key: "api_access",
      label: language === "bm" ? "Akses API" : "API Access",
    },
    {
      key: "webhook_notifications",
      label: language === "bm" ? "Notifikasi Webhook" : "Webhook Notifications",
    },
    {
      key: "dedicated_database",
      label:
        language === "bm" ? "Pangkalan Data Dedikasi" : "Dedicated Database",
    },
    {
      key: "priority_support",
      label: language === "bm" ? "Sokongan Keutamaan" : "Priority Support",
    },
    {
      key: "local_admin_support",
      label:
        language === "bm" ? "Sokongan Admin Tempatan" : "Local Admin Support",
    },
    {
      key: "onboarding_assistance",
      label: language === "bm" ? "Bantuan Onboarding" : "Onboarding Assistance",
    },
    {
      key: "advanced_analytics",
      label: language === "bm" ? "Analitik Lanjutan" : "Advanced Analytics",
    },
    {
      key: "export_capabilities",
      label: language === "bm" ? "Keupayaan Eksport" : "Export Capabilities",
    },
    {
      key: "retention_days",
      label:
        language === "bm" ? "Simpanan Data (Hari)" : "Data Retention (Days)",
    },
  ];

  const renderFeatureValue = (tierName: string, featureKey: string) => {
    const tierFeatures = features[tierName];
    if (!tierFeatures) return "-";

    const value = tierFeatures[featureKey as keyof typeof tierFeatures];

    // Boolean values
    if (typeof value === "boolean") {
      return value ? (
        <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
      ) : (
        <CancelIcon sx={{ color: theme.palette.error.main }} />
      );
    }

    // Numeric values
    if (typeof value === "number") {
      if (value === -1) {
        return language === "bm" ? "Tanpa Had" : "Unlimited";
      }
      return value;
    }

    // String values
    return value || "-";
  };

  const handleSelectTier = (tier: string) => {
    if (onSelectTier) {
      onSelectTier(tier);
    }
  };

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 2,
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                fontWeight: 600,
                minWidth: 200,
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
              }}
            >
              {language === "bm" ? "Ciri-ciri" : "Features"}
            </TableCell>
            {comparisons.map((tier) => (
              <TableCell
                key={tier.tier}
                align="center"
                sx={{
                  minWidth: 150,
                  backgroundColor: tier.recommended
                    ? alpha(theme.palette.success.main, 0.05)
                    : alpha(theme.palette.primary.main, 0.05),
                }}
              >
                <Stack spacing={1} alignItems="center">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {tier.name}
                    </Typography>
                    {tier.recommended && (
                      <Chip
                        label={language === "bm" ? "Disyorkan" : "Recommended"}
                        size="small"
                        color="success"
                      />
                    )}
                  </Box>
                  <Typography variant="h5" fontWeight="bold" color="primary">
                    {tier.priceMonthly === 0
                      ? language === "bm"
                        ? "Percuma"
                        : "Free"
                      : `RM${tier.priceMonthly}`}
                  </Typography>
                  {tier.priceMonthly > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      {language === "bm" ? "/bulan" : "/month"}
                    </Typography>
                  )}
                  {tier.priceYearly && (
                    <Typography variant="caption" color="text.secondary">
                      {language === "bm"
                        ? `atau RM${tier.priceYearly}/tahun`
                        : `or RM${tier.priceYearly}/year`}
                    </Typography>
                  )}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      textAlign: "center",
                      minHeight: 40,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {tier.description}
                  </Typography>
                </Stack>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {featureRows.map((feature) => (
            <TableRow
              key={feature.key}
              sx={{
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.02),
                },
              }}
            >
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body2">{feature.label}</Typography>
                  {descriptions[feature.key] && (
                    <Tooltip title={descriptions[feature.key]} arrow>
                      <InfoOutlinedIcon
                        fontSize="small"
                        sx={{ color: theme.palette.text.secondary }}
                      />
                    </Tooltip>
                  )}
                </Box>
              </TableCell>
              {comparisons.map((tier) => (
                <TableCell
                  key={tier.tier}
                  align="center"
                  sx={{
                    backgroundColor: tier.recommended
                      ? alpha(theme.palette.success.main, 0.02)
                      : "transparent",
                  }}
                >
                  {renderFeatureValue(tier.tier, feature.key)}
                </TableCell>
              ))}
            </TableRow>
          ))}
          <TableRow>
            <TableCell />
            {comparisons.map((tier) => (
              <TableCell key={tier.tier} align="center">
                <Button
                  variant={tier.recommended ? "contained" : "outlined"}
                  color={tier.recommended ? "success" : "primary"}
                  onClick={() => handleSelectTier(tier.tier)}
                  sx={{ mt: 2 }}
                >
                  {tier.tier === "rakyat"
                    ? language === "bm"
                      ? "Mula Percuma"
                      : "Start Free"
                    : language === "bm"
                      ? "Pilih Pakej"
                      : "Choose Plan"}
                </Button>
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};
