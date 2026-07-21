/**
 * Tier Card Component - Displays individual tier package
 * Feature: 007-tv-landing-tiers
 * User Story: US1 - Mosque Manager Discovers Free Tier
 */

import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  useTheme,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { TierPackage, TierFeature } from '@masjid-suite/shared-types';

interface TierCardProps {
  tier: TierPackage;
  language?: 'ms' | 'en' | undefined;
  onUpgradeClick?: ((tierId: string) => void) | undefined;
  onLearnMoreClick?: ((tierId: string) => void) | undefined;
  onZoneCtaClick?: (() => void) | undefined;
  isHighlighted?: boolean | undefined;
}

/**
 * TierCard displays a single tier package with features and CTA
 * Includes "Cari kawasan anda" button for Asas tier zone discovery
 */
export const TierCard: React.FC<TierCardProps> = ({
  tier,
  language = 'ms',
  onUpgradeClick,
  onLearnMoreClick,
  onZoneCtaClick,
  isHighlighted = false,
}) => {
  const theme = useTheme();

  const handleUpgradeClick = () => {
    if (onUpgradeClick) {
      onUpgradeClick(tier.id);
    }
  };

  const handleLearnMoreClick = () => {
    if (onLearnMoreClick) {
      onLearnMoreClick(tier.id);
    }
  };

  const handleZoneCtaClick = () => {
    if (onZoneCtaClick) {
      onZoneCtaClick();
    }
  };

  // Get tier-specific colors
  const tierColors: Record<string, { light: string; main: string; dark: string }> = {
    asas: {
      light: '#e8f5e9',
      main: '#4caf50',
      dark: '#2e7d32',
    },
    maju: {
      light: '#fff3e0',
      main: '#ff9800',
      dark: '#e65100',
    },
    gemilang: {
      light: '#e3f2fd',
      main: '#2196f3',
      dark: '#1565c0',
    },
    istimewa: {
      light: '#f3e5f5',
      main: '#9c27b0',
      dark: '#6a1b9a',
    },
  };

  const tierColor = tierColors[tier.id] || {
    light: '#e3f2fd',
    main: '#2196f3',
    dark: '#1565c0',
  };
  const price = language === 'ms' ? tier.price_ms : tier.price_en;
  const name = language === 'ms' ? tier.name_ms : tier.name_en;
  const description =
    language === 'ms' ? tier.description_ms : tier.description_en;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderTop: `4px solid ${tierColor.main}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHighlighted ? 'scale(1.05)' : 'scale(1)',
        boxShadow: isHighlighted
          ? `0 12px 24px rgba(0, 0, 0, 0.15), 0 0 0 1px ${tierColor.main}`
          : '0 2px 8px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        '&:hover': {
          boxShadow: `0 8px 16px rgba(0, 0, 0, 0.15), 0 0 0 1px ${tierColor.main}`,
          transform: 'translateY(-4px)',
        },
      }}
    >
      {/* Featured Badge */}
      {isHighlighted && (
        <Box
          sx={{
            position: 'absolute',
            top: -12,
            right: 12,
            zIndex: 10,
          }}
        >
          <Chip
            label={language === 'ms' ? 'Pilihan Popular' : 'Most Popular'}
            color="warning"
            size="small"
            sx={{
              fontWeight: 600,
              height: '24px',
            }}
          />
        </Box>
      )}

      {/* Header Background */}
      <Box
        sx={{
          backgroundColor: tierColor.light,
          padding: theme.spacing(3),
          borderBottom: `1px solid ${tierColor.light}`,
        }}
      >
        {/* Tier Name */}
        <Typography
          variant="h5"
          component="h3"
          sx={{
            fontWeight: 700,
            color: tierColor.dark,
            marginBottom: theme.spacing(1),
          }}
        >
          {name}
        </Typography>

        {/* Price */}
        <Typography
          variant="h4"
          component="div"
          sx={{
            fontWeight: 700,
            color: tierColor.main,
            marginBottom: theme.spacing(1),
          }}
        >
          {price}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            lineHeight: 1.4,
          }}
        >
          {description}
        </Typography>
      </Box>

      {/* Content */}
      <CardContent sx={{ flexGrow: 1, padding: theme.spacing(2) }}>
        {/* Features List */}
        <List sx={{ padding: 0 }}>
          {tier.features.map((feature: TierFeature, index: number) => (
            <ListItem
              key={index}
              sx={{
                padding: `${theme.spacing(1)} 0`,
                display: 'flex',
                alignItems: 'flex-start',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: '36px',
                  color: tierColor.main,
                }}
              >
                <CheckCircleIcon sx={{ fontSize: '1.25rem' }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  language === 'ms' ? feature.name_ms : feature.name_en
                }
                slotProps={{
                  primary: {
                    component: 'div',
                    sx: {
                      fontWeight: 500,
                      color: theme.palette.text.primary,
                      variant: 'body2',
                    },
                  },
                }}
                secondary={
                  feature.description_ms || feature.description_en ? (
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        display: 'block',
                        marginTop: theme.spacing(0.5),
                      }}
                    >
                      {language === 'ms'
                        ? feature.description_ms
                        : feature.description_en}
                    </Typography>
                  ) : undefined
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>

      {/* Actions */}
      <CardActions
        sx={{
          padding: theme.spacing(2),
          gap: theme.spacing(1),
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme.palette.background.default,
        }}
      >
        {/* Zone Discovery CTA (Asas tier only) */}
        {tier.id === 'asas' && onZoneCtaClick && (
          <Button
            fullWidth
            variant="contained"
            sx={{
              backgroundColor: theme.palette.info.main,
              color: 'white',
              '&:hover': {
                backgroundColor: theme.palette.info.dark,
              },
            }}
            onClick={handleZoneCtaClick}
          >
            {language === 'ms' ? 'Cari Kawasan Anda' : 'Find Your Zone'}
          </Button>
        )}

        {/* Primary CTA */}
        {tier.id !== 'asas' ? (
          <Button
            fullWidth
            variant="contained"
            sx={{
              backgroundColor: tierColor.main,
              color: 'white',
              '&:hover': {
                backgroundColor: tierColor.dark,
              },
            }}
            onClick={handleUpgradeClick}
          >
            {language === 'ms' ? 'Naik Taraf' : 'Upgrade'}
          </Button>
        ) : (
          <Button
            fullWidth
            variant="contained"
            color="success"
            onClick={handleUpgradeClick}
          >
            {language === 'ms' ? 'Mulai Percuma' : 'Start Free'}
          </Button>
        )}

        {/* Secondary CTA */}
        <Button
          fullWidth
          variant="outlined"
          sx={{
            color: tierColor.main,
            borderColor: tierColor.main,
            '&:hover': {
              backgroundColor: tierColor.light,
              borderColor: tierColor.dark,
            },
          }}
          onClick={handleLearnMoreClick}
        >
          {language === 'ms' ? 'Ketahui Lanjut' : 'Learn More'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default TierCard;
