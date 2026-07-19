/**
 * Landing Page Component - Main landing page for TV Display
 * Feature: 007-tv-landing-tiers
 * User Story: US1 - Mosque Manager Discovers Free Tier
 * Integrates: HeroSection, TierCardGrid, ZoneModal, FAQs
 */

import React, { useEffect, useState } from 'react';
import { Box, Container, Divider, useTheme, useMediaQuery } from '@mui/material';
import { TierPackage } from '@masjid-suite/shared-types';
import HeroSection from './HeroSection';
import TierCardGrid from './TierCardGrid';
import ZoneModal from './ZoneModal';
import { patchZoneSessionState, readZoneSessionState } from '@/lib/zone-session-state';

interface LandingPageProps {
  language?: 'ms' | 'en';
}

/**
 * LandingPage combines hero, tier packages, zone modal, and other sections
 */
export const LandingPage: React.FC<LandingPageProps> = ({ language = 'ms' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedTier, setSelectedTier] = useState<TierPackage | null>(null);
  const [zoneModalOpen, setZoneModalOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add('landing-scroll');

    const existingState = readZoneSessionState();
    if (!existingState || existingState.locale !== language) {
      patchZoneSessionState({
        locale: language,
        comparison_context: existingState?.comparison_context ?? 'tiers',
      });
    }

    return () => {
      document.body.classList.remove('landing-scroll');
    };
  }, [language]);

  const handleHeroCtaClick = () => {
    patchZoneSessionState({
      locale: language,
      comparison_context: 'hero',
    });
    // Open zone modal to select mosque
    setZoneModalOpen(true);
  };

  const handleZoneModalClose = () => {
    setZoneModalOpen(false);
  };

  const handleTierZoneCtaClick = () => {
    patchZoneSessionState({
      locale: language,
      comparison_context: 'tiers',
    });
    // Open zone modal from tier card
    setZoneModalOpen(true);
  };

  const handleTierSelect = (tier: TierPackage) => {
    setSelectedTier(tier);

    if (tier.id === 'asas') {
      patchZoneSessionState({
        locale: language,
        comparison_context: 'tier-asas',
      });
      setZoneModalOpen(true);
    }
  };

  const handleUpgradeClick = (tierId: string) => {
    setSelectedTier((currentTier) => currentTier || ({ id: tierId } as TierPackage));
  };

  const handleLearnMoreClick = (tierId: string) => {
    setSelectedTier((currentTier) => currentTier || ({ id: tierId } as TierPackage));
  };

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.default,
      }}
    >
      {/* Hero Section */}
      <HeroSection language={language} onCtaClick={handleHeroCtaClick} />

      {/* Divider */}
      <Divider sx={{ margin: theme.spacing(2, 0) }} />

      {/* Tier Packages Section */}
      <Box id="tiers-section">
        <TierCardGrid
          language={language}
          onTierSelect={handleTierSelect}
          onUpgradeClick={handleUpgradeClick}
          onLearnMoreClick={handleLearnMoreClick}
          onZoneCtaClick={handleTierZoneCtaClick}
        />
      </Box>

      {/* Divider */}
      <Divider sx={{ margin: theme.spacing(2, 0) }} />

      {/* Benefits Section */}
      <Box
        sx={{
          padding: theme.spacing(isMobile ? 3 : 6, 0),
          backgroundColor: theme.palette.primary.light,
          color: theme.palette.primary.contrastText,
        }}
      >
        <Container maxWidth="lg">
          {/* Benefits content would go here - placeholder for future expansion */}
        </Container>
      </Box>

      {/* FAQ Section - Placeholder */}
      <Box
        sx={{
          padding: theme.spacing(isMobile ? 3 : 6, 0),
        }}
      >
        <Container maxWidth="lg">
          {/* FAQ content would go here - Task T040+ */}
        </Container>
      </Box>

      {/* Footer Divider */}
      <Divider sx={{ margin: theme.spacing(2, 0) }} />

      {/* Contact Section */}
      <Box
        sx={{
          padding: theme.spacing(isMobile ? 3 : 4, 0),
          backgroundColor: theme.palette.grey[900],
          color: theme.palette.grey[50],
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          {language === 'ms'
            ? 'Ada soalan? Hubungi kami untuk bantuan.'
            : 'Have questions? Contact us for support.'}
        </Container>
      </Box>

      {/* Zone Modal */}
      <ZoneModal
        open={zoneModalOpen}
        onClose={handleZoneModalClose}
        language={language}
        onZoneSelected={({ zone_code, display_id }) => {
          patchZoneSessionState({
            locale: language,
            zone_code,
            last_display_id: display_id,
          });
        }}
      />
    </Box>
  );
};

export default LandingPage;
