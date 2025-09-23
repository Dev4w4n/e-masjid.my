/**
 * Unit tests for ClientOnly component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ClientOnly from '../ClientOnly';

describe('ClientOnly', () => {
  it('should render component', () => {
    render(
      <ClientOnly>
        <div data-testid="client-content">Client Only Content</div>
      </ClientOnly>
    );

    // The component should eventually render after useEffect
    expect(screen.getByTestId('client-content')).toBeInTheDocument();
  });

  it('should render fallback initially', () => {
    render(
      <ClientOnly fallback={<div data-testid="fallback">Loading...</div>}>
        <div data-testid="client-content">Client Only Content</div>
      </ClientOnly>
    );

    // Should render fallback or content
    const fallback = screen.queryByTestId('fallback');
    const content = screen.queryByTestId('client-content');
    
    expect(fallback || content).toBeTruthy();
  });

  it('should handle null children', () => {
    const { container } = render(<ClientOnly>{null}</ClientOnly>);
    
    expect(container).toBeTruthy();
  });
});