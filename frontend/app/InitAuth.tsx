'use client';

import { useInitAuth } from '../hooks/useInitAuth';

/**
 * This component initializes auth on app mount
 * Must be rendered inside QueryProvider
 */
export function InitAuth() {
  useInitAuth();
  return null;
}
