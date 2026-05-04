'use client';

import React from 'react';

/**
 * Skip Link Component for Accessibility
 * 
 * Allows keyboard users to skip navigation and jump to main content.
 * This is a WCAG 2.1 Level A requirement.
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
    >
      Skip to main content
    </a>
  );
}
