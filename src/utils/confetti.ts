/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Efek Confetti Ringan saat Tugas Diselesaikan
 */

let confettiPromise: Promise<((opts?: Record<string, unknown>) => void) | null> | null = null;

export async function fireConfetti(): Promise<void> {
  // Respect prefers-reduced-motion
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  if (!confettiPromise) {
    confettiPromise = new Promise((resolve) => {
      if ((window as unknown as { confetti?: (opts?: Record<string, unknown>) => void }).confetti) {
        resolve((window as unknown as { confetti: (opts?: Record<string, unknown>) => void }).confetti);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.4/dist/confetti.browser.min.js';
      script.async = true;
      script.onload = () => {
        resolve((window as unknown as { confetti: (opts?: Record<string, unknown>) => void }).confetti);
      };
      script.onerror = () => {
        resolve(null);
      };
      document.head.appendChild(script);
    });
  }

  try {
    const confetti = await confettiPromise;
    if (confetti) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#059669', '#0D9488', '#06B6D4', '#10B981', '#34D399'],
      });
    }
  } catch {}
}
