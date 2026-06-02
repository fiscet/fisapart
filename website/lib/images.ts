// Centralized remote image patterns for next/image
import type { RemotePattern } from 'next/dist/shared/lib/image-config';

// Le immagini della demo sono servite localmente da /public, quindi non sono
// necessari pattern remoti. Unsplash resta consentito per eventuali placeholder.
export const remoteImagePatterns: RemotePattern[] = [
  { protocol: 'https', hostname: 'images.unsplash.com' },
];
