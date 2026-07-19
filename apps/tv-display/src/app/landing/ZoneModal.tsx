'use client';

/**
 * Zone Selection Modal Component
 * Feature: 007-tv-landing-tiers
 * Task: T027 - Zone selection with Material-UI Modal + Autocomplete
 *
 * Purpose:
 * - Users find their mosque by JAKIM zone (68 official zones)
 * - Uses zone codes (JHR01, KDH01, PSG01) from official JAKIM list
 * - Loads zones from fetchAllZones() with region grouping
 * - Routes to /display/[id] on selection
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  Autocomplete,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Stack,
  IconButton,
  Skeleton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { fetchAllZones, selectZone } from '@masjid-suite/supabase-client/lib/zone-client';

/**
 * Zone interface matching supabase-client zone-service response
 */
interface Zone {
  zone_code: string;
  zone_name_ms: string;
  zone_name_en: string;
  state_ms: string;
  state_en: string;
  region?: string;
  masjid_count?: number;
  is_active?: boolean;
}

interface ZoneModalProps {
  open: boolean;
  onClose: () => void;
  language?: 'ms' | 'en';
  onZoneSelected?: (payload: { zone_code: string; display_id: string }) => void;
}

/**
 * ZoneModal Component
 *
 * Features:
 * - Material-UI Modal with centered positioning
 * - Autocomplete input for 68 official JAKIM zones
 * - Zone codes display (JHR01, KDH01, etc.) with Malay/English names
 * - Search/filter by zone name or code
 * - "Pilih" (Select) button with loading state
 * - Error handling for zone fetch failures
 * - Keyboard navigation (Tab, Enter)
 * - Responsive on mobile (full width on xs, 400px max on md+)
 */
export const ZoneModal: React.FC<ZoneModalProps> = ({
  open,
  onClose,
  language = 'ms',
  onZoneSelected,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State management
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingZones, setLoadingZones] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');

  /**
   * Fetch zones from API on modal open
   */
  useEffect(() => {
    if (!open) return;

    const fetchZones = async () => {
      try {
        setLoadingZones(true);
        setError(null);

        const zoneList = await fetchAllZones();
        setZones(zoneList);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error('[ZoneModal] Error fetching zones:', errorMsg);
        setError(
          language === 'ms'
            ? 'Kawasan tidak tersedia. Sila cuba sebentar lagi.'
            : 'Zones are currently unavailable. Please try again shortly.'
        );
      } finally {
        setLoadingZones(false);
      }
    };

    fetchZones();
  }, [open, language]);

  /**
   * Handle zone selection and routing
   */
  const handleSelectZone = async () => {
    if (!selectedZone) return;

    try {
      setLoading(true);
      setError(null);

      const displayId = await selectZone(selectedZone.zone_code);

      if (!displayId) {
        throw new Error('No display ID found for selected zone');
      }

      onZoneSelected?.({
        zone_code: selectedZone.zone_code,
        display_id: displayId,
      });

      // Route to display page
      navigate(`/display/${displayId}`);
      onClose();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('[ZoneModal] Error selecting zone:', errorMsg);
      if (errorMsg.includes('No mosques found')) {
        setError(
          language === 'ms'
            ? 'Kawasan ini belum ada data masjid.'
            : 'This zone does not have any mosque data yet.'
        );
        return;
      }
      setError(
        language === 'ms'
          ? 'Ralat semasa memilih kawasan. Sila cuba semula.'
          : 'Error selecting zone. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get display label for zone option
   * Shows zone code, name, and state
   */
  const getZoneLabel = (zone: Zone | string): string => {
    if (typeof zone === 'string') return zone;
    const name =
      language === 'ms' ? zone.zone_name_ms : zone.zone_name_en;
    const state = language === 'ms' ? zone.state_ms : zone.state_en;
    return `${zone.zone_code} - ${name} (${state})`;
  };

  /**
   * Get secondary text for zone option (display in dropdown)
   */
  const getZoneSecondaryText = (zone: Zone): string => {
    const state = language === 'ms' ? zone.state_ms : zone.state_en;
    const count = zone.masjid_count || 1;
    return `${state} • ${count} ${language === 'ms' ? 'masjid' : 'mosque'}${count !== 1 ? 's' : ''}`;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="zone-modal-title"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          width: isMobile ? '90%' : '100%',
          maxWidth: 420,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 3,
          position: 'relative',
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography
            id="zone-modal-title"
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: { xs: '1rem', md: '1.25rem' },
            }}
          >
            {language === 'ms' ? 'Cari Kawasan Anda' : 'Find Your Zone'}
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>

        {/* Loading state: Skeleton loader */}
        {loadingZones ? (
          <Stack spacing={2}>
            <Skeleton variant="rectangular" height={56} />
            <Skeleton variant="text" />
            <Skeleton variant="text" width="80%" />
          </Stack>
        ) : error ? (
          /* Error state */
          <Stack spacing={2}>
            <Alert severity="error">{error}</Alert>
            <Button
              variant="outlined"
              onClick={onClose}
              fullWidth
              disabled={loading}
            >
              {language === 'ms' ? 'Tutup' : 'Close'}
            </Button>
          </Stack>
        ) : (
          /* Zone selection content */
          <Stack spacing={2}>
            {/* Autocomplete Input */}
            <Autocomplete
              options={zones}
              getOptionLabel={getZoneLabel}
              value={selectedZone}
              onChange={(event, newValue) => setSelectedZone(newValue)}
              inputValue={inputValue}
              onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
              }}
              disabled={loading}
              noOptionsText={
                language === 'ms'
                  ? 'Tiada kawasan ditemui'
                  : 'No zones found'
              }
              loadingText={
                language === 'ms' ? 'Memuatkan...' : 'Loading...'
              }
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Stack direction="column" spacing={0.5}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {getZoneLabel(option)}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary' }}
                    >
                      {getZoneSecondaryText(option)}
                    </Typography>
                  </Stack>
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={
                    language === 'ms'
                      ? 'Cari kawasan (contoh: JHR01, Johor)'
                      : 'Search zone (e.g., JHR01, Johor)'
                  }
                  size="small"
                />
              )}
              slotProps={{
                popper: {
                  modifiers: [
                    {
                      name: 'flip',
                      enabled: false,
                    },
                  ],
                },
              }}
            />

            {/* Info text */}
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', mt: 1 }}
            >
              {language === 'ms'
                ? `${zones.length} kawasan tersedia`
                : `${zones.length} zones available`}
            </Typography>

            {/* Select Button */}
            <Button
              variant="contained"
              onClick={handleSelectZone}
              disabled={!selectedZone || loading}
              fullWidth
              sx={{ mt: 2, py: 1.25 }}
              startIcon={
                loading ? (
                  <CircularProgress size={20} />
                ) : undefined
              }
            >
              {loading
                ? language === 'ms'
                  ? 'Memproses...'
                  : 'Processing...'
                : language === 'ms'
                  ? 'Pilih'
                  : 'Select'}
            </Button>
          </Stack>
        )}

        {/* Contact support link */}
        {error && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 2,
              textAlign: 'center',
              color: 'text.secondary',
            }}
          >
            {language === 'ms'
              ? 'Hubungi sokongan jika anda memerlukan bantuan'
              : 'Contact support if you need help'}
          </Typography>
        )}
      </Box>
    </Modal>
  );
};

export default ZoneModal;
