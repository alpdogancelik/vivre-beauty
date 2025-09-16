// Centralized WebGL capability detection used across background effects
// Non-destructive helper: creates a temporary context and releases it immediately

export function getWebGLSupport() {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return { ok: false, reason: 'no-dom' };
  }
  const result = {
    ok: false,
    webglVersion: 0,
    isSoftware: false,
    renderer: '',
    vendor: '',
    reason: ''
  };

  try {
    const opts = {
      alpha: true,
      antialias: true,
      depth: true,
      stencil: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
      desynchronized: true,
    };
    const canvas = document.createElement('canvas');

    // Try WebGL2 first
    let gl = canvas.getContext('webgl2', opts);
    if (gl) {
      result.webglVersion = 2;
    } else {
      gl = canvas.getContext('webgl', opts) || canvas.getContext('experimental-webgl', opts);
      if (gl) result.webglVersion = 1;
    }

    if (!gl) {
      result.reason = 'no-context';
      return result;
    }

    // Inspect renderer/vendor when possible
    try {
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) {
        const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
        const vendor = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL);
        result.renderer = String(renderer || '');
        result.vendor = String(vendor || '');
        const low = result.renderer.toLowerCase();
        // Known software rasterizers and CPU fallbacks
        const softwareHints = ['swiftshader', 'llvmpipe', 'softpipe', 'software', 'microsoft basic render driver', 'gdi generic'];
        result.isSoftware = softwareHints.some(h => low.includes(h));
      }
    } catch { /* noop */ }

    // Lose the temporary context ASAP
    try { gl.getExtension('WEBGL_lose_context')?.loseContext?.(); } catch { /* noop */ }

    result.ok = !!gl;
    return result;
  } catch {
    result.reason = 'error';
    return result;
  }
}

export function shouldUseWebGL({ respectReducedMotion = true, allowSoftware = false, force = false } = {}) {
  if (force) return { ok: true, reason: 'forced' };
  const prefersReduced = respectReducedMotion &&
    typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return { ok: false, reason: 'reduced-motion' };

  const sup = getWebGLSupport();
  if (!sup.ok) return { ok: false, reason: sup.reason || 'unsupported', details: sup };
  if (sup.isSoftware && !allowSoftware) return { ok: false, reason: 'software-renderer', details: sup };
  return { ok: true, reason: 'ok', details: sup };
}
