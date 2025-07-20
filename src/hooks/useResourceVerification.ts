'use client';
import { useState, useEffect } from 'react';

export default function useResourceVerification() {
  const [resourcesLoaded, setResourcesLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let loadedCount = 0;
    let totalResources = 0;
    const timeoutThreshold = 8000; // 8 second timeout

    // Track image loading
    const images = Array.from(document.querySelectorAll('img'));
    totalResources += images.length;

    const imageLoaded = () => {
      loadedCount++;
      updateProgress();
    };

    images.forEach(img => {
      if (img.complete) {
        loadedCount++;
      } else {
        img.addEventListener('load', imageLoaded);
        img.addEventListener('error', () => {
          console.warn(`Failed to load image: ${img.src}`);
          imageLoaded(); // Count it anyway to prevent stuck loader
        });
      }
    });

    // Track font loading
    if (document.fonts) {
      totalResources += 1;
      document.fonts.ready.then(() => {
        loadedCount++;
        updateProgress();
      }).catch(() => {
        loadedCount++;
        updateProgress();
      });
    }

    // If no resources to load, mark as complete
    if (totalResources === 0) {
      setResourcesLoaded(true);
      setProgress(100);
      return;
    }

    // Fallback timeout
    const timeout = setTimeout(() => {
      console.warn(`Loader timeout reached, forcing completion`);
      setResourcesLoaded(true);
      setProgress(100);
    }, timeoutThreshold);

    function updateProgress() {
      const newProgress = Math.min(100, Math.round((loadedCount / totalResources) * 100));
      setProgress(newProgress);
      
      if (newProgress === 100) {
        clearTimeout(timeout);
        setTimeout(() => setResourcesLoaded(true), 300);
      }
    }

    return () => {
      clearTimeout(timeout);
      images.forEach(img => {
        img.removeEventListener('load', imageLoaded);
        img.removeEventListener('error', imageLoaded);
      });
    };
  }, []);

  return { resourcesLoaded, progress };
}