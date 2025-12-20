interface PremiumBadgeProps {
  sponsorshipAmount: number;
}

export default function PremiumBadge({ sponsorshipAmount }: PremiumBadgeProps) {
  if (sponsorshipAmount <= 0) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-1 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-bold text-xs px-3 py-1 rounded shadow-sm">
      <span>⭐</span>
      <span>Premium</span>
    </div>
  );
}
