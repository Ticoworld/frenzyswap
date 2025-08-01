// src/components/common/AnalyticsProvider.tsx
'use client';

import { useAnalytics } from '@/hooks/useAnalytics';
import { useEffect, useState } from 'react';

export function AnalyticsProvider() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Always call the hook, but handle errors internally
  const analytics = useAnalytics();

  return null;
}
