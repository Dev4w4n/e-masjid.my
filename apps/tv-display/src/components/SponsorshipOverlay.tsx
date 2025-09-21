/**
 * SponsorshipOverlay Component
 * 
 * Displays sponsorship information with tier-based styling and amount visibility controls.
 * Shows sponsor name, donation amount (if configured), and tier-specific visual styling.
 */

'use client';

import React from 'react';
import { DisplayContent } from '@masjid-suite/shared-types';

// Extended content type with sponsor info from API response
interface DisplayContentWithSponsor extends DisplayContent {
  sponsor_name?: string;
}

interface SponsorshipOverlayProps {
  content: DisplayContentWithSponsor;
  showAmount?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}

type SponsorshipTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

interface TierConfig {
  name: string;
  colors: {
    bg: string;
    border: string;
    text: string;
    accent: string;
  };
  icon: string;
  minAmount: number;
}

const TIER_CONFIGS: Record<SponsorshipTier, TierConfig> = {
  bronze: {
    name: 'Bronze Sponsor',
    colors: {
      bg: 'bg-gradient-to-r from-amber-800 to-amber-700',
      border: 'border-amber-600',
      text: 'text-amber-100',
      accent: 'text-amber-300'
    },
    icon: '🥉',
    minAmount: 0
  },
  silver: {
    name: 'Silver Sponsor',
    colors: {
      bg: 'bg-gradient-to-r from-gray-500 to-gray-400',
      border: 'border-gray-400',
      text: 'text-gray-100',
      accent: 'text-gray-200'
    },
    icon: '🥈',
    minAmount: 100
  },
  gold: {
    name: 'Gold Sponsor',
    colors: {
      bg: 'bg-gradient-to-r from-yellow-500 to-yellow-400',
      border: 'border-yellow-400',
      text: 'text-yellow-900',
      accent: 'text-yellow-800'
    },
    icon: '🥇',
    minAmount: 500
  },
  platinum: {
    name: 'Platinum Sponsor',
    colors: {
      bg: 'bg-gradient-to-r from-indigo-600 to-indigo-500',
      border: 'border-indigo-400',
      text: 'text-indigo-100',
      accent: 'text-indigo-200'
    },
    icon: '💎',
    minAmount: 1000
  },
  diamond: {
    name: 'Diamond Sponsor',
    colors: {
      bg: 'bg-gradient-to-r from-purple-600 to-pink-600',
      border: 'border-purple-400',
      text: 'text-purple-100',
      accent: 'text-purple-200'
    },
    icon: '💎',
    minAmount: 5000
  }
};

export function SponsorshipOverlay({ 
  content, 
  showAmount = true, 
  position = 'bottom-right',
  className = '' 
}: SponsorshipOverlayProps) {
  // Don't show overlay if there's no sponsorship
  if (!content.sponsorship_amount || content.sponsorship_amount <= 0) {
    return null;
  }

  // Don't show overlay if sponsor name is missing (sponsor info may not be available)
  if (!content.sponsor_name?.trim()) {
    return null;
  }

  // Determine sponsorship tier based on amount
  const getSponsorshipTier = (amount: number): SponsorshipTier => {
    if (amount >= TIER_CONFIGS.diamond.minAmount) return 'diamond';
    if (amount >= TIER_CONFIGS.platinum.minAmount) return 'platinum';
    if (amount >= TIER_CONFIGS.gold.minAmount) return 'gold';
    if (amount >= TIER_CONFIGS.silver.minAmount) return 'silver';
    return 'bronze';
  };

  const tier = getSponsorshipTier(content.sponsorship_amount);
  const tierConfig = TIER_CONFIGS[tier];

  // Position classes
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  // Format currency amount
  const formatAmount = (amount: number): string => {
    if (amount >= 1000) {
      return `RM${(amount / 1000).toFixed(1)}k`;
    }
    return `RM${amount}`;
  };

  return (
    <div 
      className={`
        absolute ${positionClasses[position]} 
        ${tierConfig.colors.bg} 
        ${tierConfig.colors.border} 
        ${tierConfig.colors.text}
        border-2 rounded-lg p-3 shadow-lg backdrop-blur-sm
        max-w-xs z-10 transition-all duration-300
        ${className}
      `}
    >
      {/* Tier indicator */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{tierConfig.icon}</span>
        <span className={`text-xs font-medium ${tierConfig.colors.accent}`}>
          {tierConfig.name}
        </span>
      </div>

      {/* Sponsor name */}
      <div className="font-semibold text-sm leading-tight mb-1">
        Sponsored by {content.sponsor_name}
      </div>

      {/* Amount (if enabled and available) */}
      {showAmount && (
        <div className={`text-xs ${tierConfig.colors.accent} font-medium`}>
          {formatAmount(content.sponsorship_amount)}
        </div>
      )}

      {/* Thank you message for higher tiers */}
      {tier !== 'bronze' && (
        <div className="text-xs opacity-90 mt-1">
          جزاك الله خيرا
        </div>
      )}
    </div>
  );
}

// Alternative compact version for smaller displays
export function CompactSponsorshipOverlay({ 
  content, 
  showAmount = false,
  className = '' 
}: Omit<SponsorshipOverlayProps, 'position'>) {
  // Don't show overlay if there's no sponsorship
  if (!content.sponsorship_amount || content.sponsorship_amount <= 0) {
    return null;
  }

  // Don't show overlay if sponsor name is missing (sponsor info may not be available)
  if (!content.sponsor_name?.trim()) {
    return null;
  }

  const tier = content.sponsorship_amount >= TIER_CONFIGS.gold.minAmount ? 'gold' : 
               content.sponsorship_amount >= TIER_CONFIGS.silver.minAmount ? 'silver' : 'bronze';
  const tierConfig = TIER_CONFIGS[tier];

  return (
    <div 
      className={`
        ${tierConfig.colors.bg} 
        ${tierConfig.colors.text}
        px-3 py-1 rounded-full text-xs font-medium
        shadow-md backdrop-blur-sm flex items-center gap-2
        ${className}
      `}
    >
      <span>{tierConfig.icon}</span>
      <span>Sponsored by {content.sponsor_name}</span>
      {showAmount && (
        <span className={tierConfig.colors.accent}>
          • RM{content.sponsorship_amount}
        </span>
      )}
    </div>
  );
}

// Animated entrance variant
export function AnimatedSponsorshipOverlay(props: SponsorshipOverlayProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    // Delay showing the overlay to avoid interfering with content transitions
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, [props.content.id]);

  React.useEffect(() => {
    // Reset animation when content changes
    setIsVisible(false);
  }, [props.content.id]);

  return (
    <div
      className={`
        transition-all duration-500 transform
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      <SponsorshipOverlay {...props} />
    </div>
  );
}

export default SponsorshipOverlay;