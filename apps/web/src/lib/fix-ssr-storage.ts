if (typeof window === 'undefined') {
  // Turbopack or defective Node environment polyfills localStorage incorrectly.
  // This causes libraries checking 'if (localStorage)' to assume it's valid and call methods on it, causing crash.
  // We aggressively remove it to ensure clean SSR environment.

  const deleteGlobal = (name: string) => {
    try {
      // @ts-ignore
      if (typeof global !== 'undefined' && global[name]) {
        // @ts-ignore
        delete global[name];
      }
      // @ts-ignore
      if (typeof globalThis !== 'undefined' && globalThis[name]) {
        // @ts-ignore
        delete globalThis[name];
      }
    } catch {
      // ignore
    }
  };

  deleteGlobal('localStorage');
  deleteGlobal('sessionStorage');
}
