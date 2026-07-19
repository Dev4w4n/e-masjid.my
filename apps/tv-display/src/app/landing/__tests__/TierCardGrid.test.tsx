import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { TierPackage } from '@masjid-suite/shared-types';
import { tierPackageService } from '@masjid-suite/supabase-client/services/tier-service';
import TierCardGrid from '../TierCardGrid';

vi.mock('@masjid-suite/supabase-client/services/tier-service', () => ({
  tierPackageService: {
    fetchTiersForLanding: vi.fn(),
  },
}));

const mockTiers: TierPackage[] = [
  {
    id: 'asas',
    name_ms: 'Asas',
    name_en: 'Asas (Free)',
    description_ms: 'Percuma, tanpa pendaftaran',
    description_en: 'Free, no sign-up required',
    price_ms: 'Percuma',
    price_en: 'Free',
    max_screens: 1,
    requires_login: false,
    customization_type: 'none',
    support_level: 'basic',
    features: [
      {
        id: 'prayer-times',
        name_ms: 'Waktu Solat JAKIM',
        name_en: 'JAKIM Prayer Times',
        supported_tiers: ['asas', 'maju', 'gemilang', 'istimewa'],
      },
    ],
    display_order: 1,
    is_featured: true,
  },
  {
    id: 'maju',
    name_ms: 'Maju',
    name_en: 'Maju',
    description_ms: 'Pakej Maju',
    description_en: 'Maju package',
    price_ms: 'RM50',
    price_en: 'RM50',
    max_screens: 5,
    requires_login: true,
    customization_type: 'managed',
    support_level: 'standard',
    features: [],
    display_order: 2,
    is_featured: false,
  },
  {
    id: 'gemilang',
    name_ms: 'Gemilang',
    name_en: 'Gemilang',
    description_ms: 'Pakej Gemilang',
    description_en: 'Gemilang package',
    price_ms: 'RM150',
    price_en: 'RM150',
    max_screens: null,
    requires_login: true,
    customization_type: 'self-service',
    support_level: 'priority',
    features: [],
    display_order: 3,
    is_featured: true,
  },
  {
    id: 'istimewa',
    name_ms: 'Istimewa',
    name_en: 'Istimewa',
    description_ms: 'Pakej Istimewa',
    description_en: 'Istimewa package',
    price_ms: 'Custom',
    price_en: 'Custom',
    max_screens: null,
    requires_login: true,
    customization_type: 'enterprise',
    support_level: 'enterprise',
    features: [],
    display_order: 4,
    is_featured: false,
  },
];

const renderGrid = (props: React.ComponentProps<typeof TierCardGrid> = {}) => {
  return render(
    <MemoryRouter>
      <ThemeProvider theme={createTheme()}>
        <TierCardGrid {...props} />
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe('TierCardGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(tierPackageService.fetchTiersForLanding).mockResolvedValue(mockTiers);
  });

  it('renders four tier cards after loading', async () => {
    renderGrid({ language: 'en' });

    await waitFor(() => {
      expect(screen.getAllByText('Asas (Free)').length).toBeGreaterThan(0);
    });

    expect(screen.getAllByText('Maju').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Gemilang').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Istimewa').length).toBeGreaterThan(0);
  });

  it('renders the comparison toggle action', async () => {
    renderGrid({ language: 'en' });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Compare All Features/i })
      ).toBeInTheDocument();
    });
  });

  it('calls onZoneCtaClick from Asas zone CTA', async () => {
    const user = userEvent.setup();
    const onZoneCtaClick = vi.fn();

    renderGrid({ language: 'en', onZoneCtaClick });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Find Your Zone' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Find Your Zone' }));

    expect(onZoneCtaClick).toHaveBeenCalledTimes(1);
  });
});
