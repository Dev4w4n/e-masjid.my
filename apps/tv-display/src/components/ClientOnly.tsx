'use client';

<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
=======
import { useEffect, useState } from 'react';
>>>>>>> 37fcc95 (feat: Implement TV Display Database Schema and Seed Data)

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * ClientOnly component prevents hydration mismatches by only rendering 
 * children on the client side after hydration is complete.
 * 
 * Use this wrapper for components that:
 * - Use dynamic data like Date.now(), Math.random()
 * - Access browser-only APIs like localStorage, window
 * - Have content that differs between server and client
 */
export default function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}