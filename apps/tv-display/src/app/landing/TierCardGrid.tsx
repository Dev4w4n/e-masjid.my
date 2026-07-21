/**
 * Tier Card Grid Component - Displays all 4 tier packages
 * Feature: 007-tv-landing-tiers
 * User Story: US1 - Mosque Manager Discovers Free Tier
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Button,
  Collapse,
} from '@mui/material';
import { TierPackage } from '@masjid-suite/shared-types';
import { tierPackageService } from '@masjid-suite/supabase-client';
import TierCard from './TierCard';
import { TierComparisonTable } from './TierComparisonTable';

interface TierCardGridProps {
  language?: 'ms' | 'en' | undefined;
  onTierSelect?: ((tier: TierPackage) => void) | undefined;
  onUpgradeClick?: ((tierId: string) => void) | undefined;
  onLearnMoreClick?: ((tierId: string) => void) | undefined;
  onZoneCtaClick?: (() => void) | undefined;
}

/**
 * TierCardGrid displays all 4 tiers in a responsive grid
 * Asas tier is highlighted as "most popular"
 * Includes "Cari kawasan anda" CTA for zone discovery
 */
export const TierCardGrid: React.FC<TierCardGridProps> = ({
  language = 'ms',
  onTierSelect,
  onUpgradeClick,
  onLearnMoreClick,
  onZoneCtaClick,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tiers, setTiers] = useState<TierPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  // Fetch tiers on component mount
  useEffect(() => {
    const fetchTiers = async () => {
      try {
        setLoading(true);
        const data = await tierPackageService.fetchTiersForLanding();
        setTiers(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load tier packages'
        );
        console.error('TierCardGrid fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTiers();
  }, []);

  const handleUpgradeClick = (tierId: string) => {
    const selectedTier = tiers.find((t) => t.id === tierId);
    if (selectedTier) {
      if (onTierSelect) {
        onTierSelect(selectedTier);
      }
      if (onUpgradeClick) {
        onUpgradeClick(tierId);
      }
    }
  };

  const handleLearnMoreClick = (tierId: string) => {
    if (onLearnMoreClick) {
      onLearnMoreClick(tierId);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {language === 'ms'
          ? `Ralat memuatkan pakej tier: ${error}`
          : `Error loading tier packages: ${error}`}
      </Alert>
    );
  }

  if (tiers.length === 0) {
    return (
      <Alert severity="info">
        {language === 'ms'
          ? 'Tiada pakej tier tersedia'
          : 'No tier packages available'}
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        padding: theme.spacing(isMobile ? 3 : 6, 0),
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ marginBottom: theme.spacing(6), textAlign: 'center' }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 700,
              marginBottom: theme.spacing(2),
            }}
          >
            {language === 'ms' ? 'Pilih Pakej Anda' : 'Choose Your Package'}
          </Typography>
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            {language === 'ms'
              ? 'Bermula dengan Asas (percuma), atau naik taraf untuk ciri tambahan dan sokongan.'
              : 'Start with Asas (free), or upgrade for additional features and support.'}
          </Typography>
        </Box>

        {/* Tiers Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: { xs: 2, sm: 3 },
            alignItems: 'stretch',
          }}
        >
          {tiers.map((tier) => (
            <Box
              key={tier.id}
              sx={{
                display: 'flex',
              }}
            >
              <Box sx={{ width: '100%' }}>
                <TierCard
                  tier={tier}
                  language={language}
                  isHighlighted={tier.is_featured || false}
                  onUpgradeClick={handleUpgradeClick}
                  onLearnMoreClick={handleLearnMoreClick}
                  onZoneCtaClick={onZoneCtaClick}
                />
              </Box>
            </Box>
          ))}
        </Box>

        {/* Comparison Toggle Button */}
        <Box
          sx={{
            marginTop: theme.spacing(6),
            textAlign: 'center',
          }}
        >
          <Button
            variant="text"
            color="primary"
            onClick={() => setShowComparison(!showComparison)}
            sx={{
              textTransform: 'none',
              fontSize: '1rem',
              '&:hover': {
                fontWeight: 600,
              },
            }}
          >
            {showComparison
              ? language === 'ms'
                ? 'Sembunyikan Perbandingan ↑'
                : 'Hide Comparison ↑'
              : language === 'ms'
              ? 'Bandingkan Semua Ciri ↓'
              : 'Compare All Features ↓'}
          </Button>
        </Box>

        {/* Comparison Table */}
        <Collapse in={showComparison}>
          <Box sx={{ marginTop: theme.spacing(4) }}>
            <TierComparisonTable language={language} />
          </Box>
        </Collapse>
      </Container>
    </Box>
  );
};

export default TierCardGrid;
