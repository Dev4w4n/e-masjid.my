import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import HeroSection from '../HeroSection';

const renderHero = (props: React.ComponentProps<typeof HeroSection> = {}) => {
  return render(
    <MemoryRouter>
      <ThemeProvider theme={createTheme()}>
        <HeroSection {...props} />
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe('HeroSection', () => {
  it('renders Malay hero copy by default', () => {
    renderHero();

    expect(screen.getByText('Sahaja TV Masjid Percuma')).toBeInTheDocument();
    expect(
      screen.getByText('Paparkan waktu solat JAKIM di TV anda dalam 2 minit')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mulai Percuma' })).toBeInTheDocument();
  });

  it('renders English copy when language is en', () => {
    renderHero({ language: 'en' });

    expect(screen.getByText('Free Mosque TV Display')).toBeInTheDocument();
    expect(
      screen.getByText('Display JAKIM prayer times on your TV in 2 minutes')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start Free' })).toBeInTheDocument();
  });

  it('calls onCtaClick when CTA is clicked', async () => {
    const user = userEvent.setup();
    const onCtaClick = vi.fn();

    renderHero({ onCtaClick });
    await user.click(screen.getByRole('button', { name: 'Mulai Percuma' }));

    expect(onCtaClick).toHaveBeenCalledTimes(1);
  });
});
