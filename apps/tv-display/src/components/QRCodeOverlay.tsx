/**
 * QRCodeOverlay Component
 * 
 * Displays a QR code overlay on content in the TV display app.
 * Position can be configured to any of the 4 corners.
 * QR code links to either a custom URL or defaults to the public content detail page.
 */

'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { DisplayContent } from '@masjid-suite/shared-types';

interface QRCodeOverlayProps {
  content: DisplayContent;
  className?: string;
}

export function QRCodeOverlay({ content, className = '' }: QRCodeOverlayProps) {
  // Don't render if QR code is not enabled
  if (!content.qr_code_enabled) {
    return null;
  }

  // Generate the QR code URL
  // If custom URL is provided, use it; otherwise, default to public content detail page (/iklan/)
  const qrUrl = content.qr_code_url || `${process.env.NEXT_PUBLIC_APP_URL || 'https://e-masjid.my'}/iklan/${content.id}`;
  
  // Get position from content settings (default to bottom-right)
  const position = content.qr_code_position || 'bottom-right';

  // Determine CSS classes based on position
  const positionClasses: Record<string, string> = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const positionClass = positionClasses[position] || positionClasses['bottom-right'];

  return (
    <div
      className={`absolute ${positionClass} ${className}`}
      data-testid="qr-code-overlay"
      data-position={position}
    >
      <div className="bg-white p-4 rounded-lg shadow-2xl backdrop-blur-sm">
        {/* QR Code */}
        <QRCodeSVG
          value={qrUrl}
          size={180}
          level="H" // High error correction
          includeMargin={false}
          data-testid="qr-code-svg"
        />
        
        {/* Optional: Small label below QR code */}
        <div className="text-center mt-2 text-sm text-gray-700 font-medium">
          Scan untuk maklumat lanjut
        </div>
      </div>
    </div>
  );
}

export default QRCodeOverlay;
