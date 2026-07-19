/**
 * Tier Comparison Table Component
 * Feature: 007-tv-landing-tiers
 * User Story: US2 - Mosque Admin Compares Tier Features
 * 
 * Displays tier features in a comparison table format
 */

import React, { useMemo } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  useMediaQuery,
  Paper,
  Chip,
  Stack,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import StarIcon from '@mui/icons-material/Star';
import {
  compareTiers,
  ComparisonMatrixRow,
  ComparisonValue,
  TierComparisonKey,
} from '../../lib/tier-comparison';

interface TierComparisonTableProps {
  language?: 'ms' | 'en';
  tierIds?: string[];
  highlightedTierId?: string;
  onTierSelect?: (tierId: string) => void;
}

/**
 * Icon component for comparison values
 */
const ComparisonIcon: React.FC<{ icon?: 'checkmark' | 'cross' | 'star' | 'none' | undefined }> = ({ icon }) => {
  const iconProps = { sx: { fontSize: '1.2rem' } };

  switch (icon) {
    case 'checkmark':
      return <CheckCircleIcon color="success" {...iconProps} />;
    case 'cross':
      return <CancelIcon color="error" {...iconProps} />;
    case 'star':
      return <StarIcon sx={{ color: '#FFB800', ...iconProps.sx }} />;
    default:
      return null;
  }
};

/**
 * Render comparison value cell
 */
const ComparisonValueCell: React.FC<{
  value: ComparisonValue;
  language: 'ms' | 'en';
  isHighlighted?: boolean;
}> = ({ value, language, isHighlighted }) => {
  const label = language === 'ms' ? value.label_ms : value.label_en;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <ComparisonIcon icon={value.icon} />
      <Typography
        variant="body2"
        sx={{
          fontWeight: isHighlighted ? 600 : 400,
          color: isHighlighted ? 'primary.main' : 'inherit',
        }}
      >
        {label}
      </Typography>
    </Box>
  );
};

/**
 * Tier Comparison Table Component
 * Displays all tiers side-by-side for feature comparison
 */
export const TierComparisonTable: React.FC<TierComparisonTableProps> = ({
  language = 'ms',
  tierIds = ['asas', 'maju', 'gemilang', 'istimewa'],
  highlightedTierId,
  onTierSelect,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const comparisonMatrix = useMemo(() => compareTiers(tierIds), [tierIds]);

  // Tier names for display
  const tierNames: Record<string, { ms: string; en: string; color: string }> = {
    asas: { ms: 'Asas (Percuma)', en: 'Asas (Free)', color: '#4CAF50' },
    maju: { ms: 'Maju', en: 'Maju', color: '#2196F3' },
    gemilang: { ms: 'Gemilang', en: 'Gemilang', color: '#FF9800' },
    istimewa: { ms: 'Istimewa', en: 'Istimewa', color: '#9C27B0' },
  };

  const getDisplayLabel = (key: string) => {
    const tierName = tierNames[key as keyof typeof tierNames];
    return tierName
      ? language === 'ms'
        ? tierName.ms
        : tierName.en
      : key;
  };

  const getTierColor = (key: string): string => {
    const tierName = tierNames[key as keyof typeof tierNames];
    return tierName?.color || '#999999';
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Mobile: Vertical Stacked View */}
      {isMobile ? (
        <Stack spacing={2}>
          {comparisonMatrix.map((row) => (
            <Paper key={row.dimension.key} sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                {language === 'ms'
                  ? row.dimension.label_ms
                  : row.dimension.label_en}
              </Typography>
              <Stack spacing={1}>
                {tierIds.map((tierId) => (
                  <Box
                    key={tierId}
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      backgroundColor:
                        highlightedTierId === tierId
                          ? `${getTierColor(tierId)}15`
                          : 'transparent',
                      border:
                        highlightedTierId === tierId
                          ? `2px solid ${getTierColor(tierId)}`
                          : '1px solid #e0e0e0',
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {getDisplayLabel(tierId)}
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <ComparisonValueCell
                        value={row.values[tierId]!}
                        language={language}
                        isHighlighted={highlightedTierId === tierId}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Paper>
          ))}
        </Stack>
      ) : (
        /* Desktop/Tablet: Table View */
        <TableContainer
          component={Paper}
          sx={{
            overflowX: isTablet ? 'auto' : 'visible',
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Table
            sx={{
              minWidth: isTablet ? 600 : 'auto',
              '& thead': {
                backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    width: isTablet ? 150 : 200,
                    minWidth: 150,
                  }}
                >
                  {language === 'ms' ? 'Ciri' : 'Feature'}
                </TableCell>
                {tierIds.map((tierId) => (
                  <TableCell
                    key={tierId}
                    align="center"
                    onClick={() => onTierSelect?.(tierId)}
                    sx={{
                      fontWeight: 700,
                      minWidth: 120,
                      backgroundColor:
                        highlightedTierId === tierId
                          ? `${getTierColor(tierId)}20`
                          : 'inherit',
                      color:
                        highlightedTierId === tierId
                          ? getTierColor(tierId)
                          : 'inherit',
                      cursor: onTierSelect ? 'pointer' : 'default',
                      '&:hover': onTierSelect
                        ? {
                            backgroundColor: `${getTierColor(tierId)}30`,
                          }
                        : {},
                      transition: 'all 0.2s',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.5,
                        py: 1,
                      }}
                    >
                      <Typography variant="body2">
                        {getDisplayLabel(tierId)}
                      </Typography>
                      {tierId === 'gemilang' && (
                        <Chip
                          icon={<StarIcon />}
                          label={language === 'ms' ? 'Pilihan Terbaik' : 'Best Value'}
                          size="small"
                          sx={{
                            backgroundColor: '#FFB800',
                            color: 'white',
                            height: 24,
                          }}
                        />
                      )}
                      {tierId === 'istimewa' && (
                        <Chip
                          icon={<StarIcon />}
                          label={language === 'ms' ? 'Perusahaan' : 'Enterprise'}
                          size="small"
                          sx={{
                            backgroundColor: '#9C27B0',
                            color: 'white',
                            height: 24,
                          }}
                        />
                      )}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {comparisonMatrix.map((row, index) => (
                <TableRow
                  key={row.dimension.key}
                  sx={{
                    backgroundColor:
                      index % 2 === 0
                        ? theme.palette.mode === 'dark'
                          ? '#121212'
                          : '#fafafa'
                        : 'inherit',
                    '&:hover': {
                      backgroundColor:
                        theme.palette.mode === 'dark' ? '#1e1e1e' : '#f0f0f0',
                    },
                  }}
                >
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      width: isTablet ? 150 : 200,
                      minWidth: 150,
                    }}
                  >
                    <Typography variant="body2">
                      {language === 'ms'
                        ? row.dimension.label_ms
                        : row.dimension.label_en}
                    </Typography>
                  </TableCell>
                  {tierIds.map((tierId) => (
                    <TableCell
                      key={`${row.dimension.key}-${tierId}`}
                      align="center"
                      sx={{
                        minWidth: 120,
                        backgroundColor:
                          highlightedTierId === tierId
                            ? `${getTierColor(tierId)}10`
                            : 'inherit',
                      }}
                    >
                      <ComparisonValueCell
                        value={row.values[tierId]!}
                        language={language}
                        isHighlighted={highlightedTierId === tierId}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Legend */}
      <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleIcon color="success" sx={{ fontSize: '1rem' }} />
          <Typography variant="caption">
            {language === 'ms' ? 'Tersedia' : 'Available'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CancelIcon color="error" sx={{ fontSize: '1rem' }} />
          <Typography variant="caption">
            {language === 'ms' ? 'Tidak Tersedia' : 'Not Available'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StarIcon sx={{ color: '#FFB800', fontSize: '1rem' }} />
          <Typography variant="caption">
            {language === 'ms' ? 'Keunggulan' : 'Superior Feature'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default TierComparisonTable;
