/**
 * Hero Section Component for TV Landing Page
 * Feature: 007-tv-landing-tiers
 * User Story: US1 - Mosque Manager Discovers Free Tier
 */

import React from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface HeroSectionProps {
  language?: 'ms' | 'en';
  onCtaClick?: () => void;
}

/**
 * HeroSection displays the landing page hero with headline, subheadline, and CTA
 * Responsive design: full-width hero image on mobile, 50% desktop
 */
export const HeroSection: React.FC<HeroSectionProps> = ({
  language = 'ms',
  onCtaClick,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  // i18n content (passed from landing page via props in real implementation)
  const content = {
    ms: {
      headline: 'Sahaja TV Masjid Percuma',
      subheadline: 'Paparkan waktu solat JAKIM di TV anda dalam 2 minit',
      cta_text: 'Mulai Percuma',
      hero_image_url: '/images/hero-landing.svg',
    },
    en: {
      headline: 'Free Mosque TV Display',
      subheadline: 'Display JAKIM prayer times on your TV in 2 minutes',
      cta_text: 'Start Free',
      hero_image_url: '/images/hero-landing.svg',
    },
  };

  const currentContent = content[language];

  const handleCtaClick = () => {
    if (onCtaClick) {
      onCtaClick();
    } else {
      navigate('/#tiers-section');
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: isMobile ? '400px' : '600px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: theme.palette.primary.main,
      }}
    >
      {/* Background Image */}
      <Box
        component="img"
        src={currentContent.hero_image_url}
        alt="Hero background"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          zIndex: 0,
          // Lazy loading
          loading: 'lazy',
        }}
      />

      {/* Overlay for text readability */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 1,
        }}
      />

      {/* Content */}
      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing(3),
        }}
      >
        {/* Headline */}
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontSize: isMobile ? '2rem' : '3.5rem',
            fontWeight: 700,
            lineHeight: 1.2,
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
            animation: 'fadeInDown 0.8s ease-out',
            '@keyframes fadeInDown': {
              '0%': {
                opacity: 0,
                transform: 'translateY(-20px)',
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)',
              },
            },
          }}
        >
          {currentContent.headline}
        </Typography>

        {/* Subheadline */}
        <Typography
          variant="h5"
          component="h2"
          sx={{
            fontSize: isMobile ? '1rem' : '1.25rem',
            fontWeight: 400,
            lineHeight: 1.5,
            maxWidth: '600px',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
            animation: 'fadeInUp 0.8s ease-out 0.2s both',
            '@keyframes fadeInUp': {
              '0%': {
                opacity: 0,
                transform: 'translateY(20px)',
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)',
              },
            },
          }}
        >
          {currentContent.subheadline}
        </Typography>

        {/* CTA Button */}
        <Button
          variant="contained"
          color="success"
          size={isMobile ? 'medium' : 'large'}
          onClick={handleCtaClick}
          sx={{
            marginTop: theme.spacing(2),
            paddingX: isMobile ? theme.spacing(4) : theme.spacing(6),
            paddingY: isMobile ? theme.spacing(1.5) : theme.spacing(2),
            fontSize: isMobile ? '1rem' : '1.1rem',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.3s ease',
            animation: 'fadeInUp 0.8s ease-out 0.4s both',
            '@keyframes fadeInUp': {
              '0%': {
                opacity: 0,
                transform: 'translateY(20px)',
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)',
              },
            },
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.4)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          }}
        >
          {currentContent.cta_text}
        </Button>
      </Container>
    </Box>
  );
};

export default HeroSection;
