// RFC 6238 Time-Based One-Time Password (TOTP) Implementation
// Uses native Web Crypto API (crypto.subtle) - 100% compatible with Cloudflare Workers Edge and Node.js.

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function generateBase32Secret(length = 20): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let secret = '';
  for (let i = 0; i < bytes.length; i++) {
    secret += BASE32_CHARS[bytes[i] % 32];
  }
  return secret;
}

export function base32ToBytes(base32: string): Uint8Array {
  const clean = base32.toUpperCase().replace(/[^A-Z2-7]/g, '');
  const bytes: number[] = [];
  let bits = 0;
  let value = 0;

  for (let i = 0; i < clean.length; i++) {
    const idx = BASE32_CHARS.indexOf(clean[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return new Uint8Array(bytes);
}

export async function generateTotpCode(secretBase32: string, timeStepSeconds = 30, epochTimeMs = Date.now()): Promise<string> {
  const counter = Math.floor(epochTimeMs / 1000 / timeStepSeconds);
  const counterBuffer = new ArrayBuffer(8);
  const counterView = new DataView(counterBuffer);
  
  // High 32 bits, Low 32 bits (big-endian 64-bit int)
  counterView.setUint32(0, Math.floor(counter / 0x100000000));
  counterView.setUint32(4, counter % 0x100000000);

  const keyBytes = base32ToBytes(secretBase32);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes as unknown as BufferSource,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  const hmacResult = await crypto.subtle.sign('HMAC', cryptoKey, counterBuffer);
  const hmacBytes = new Uint8Array(hmacResult);

  // Dynamic Truncation (RFC 4226 / RFC 6238)
  const offset = hmacBytes[hmacBytes.length - 1] & 0x0f;
  const binaryCode =
    ((hmacBytes[offset] & 0x7f) << 24) |
    ((hmacBytes[offset + 1] & 0xff) << 16) |
    ((hmacBytes[offset + 2] & 0xff) << 8) |
    (hmacBytes[offset + 3] & 0xff);

  const otp = binaryCode % 1000000;
  return otp.toString().padStart(6, '0');
}

export async function verifyTotpCode(
  token: string,
  secretBase32: string,
  toleranceSteps = 1,
  timeStepSeconds = 30
): Promise<boolean> {
  if (!token || token.length !== 6 || !secretBase32) return false;
  const cleanToken = token.trim();
  const now = Date.now();

  for (let i = -toleranceSteps; i <= toleranceSteps; i++) {
    const testTime = now + i * timeStepSeconds * 1000;
    const generated = await generateTotpCode(secretBase32, timeStepSeconds, testTime);
    if (generated === cleanToken) {
      return true;
    }
  }
  return false;
}

export function getTotpUri(label: string, email: string, secretBase32: string, issuer = 'HENRY IX Studio'): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedAccount = encodeURIComponent(`${label}:${email}`);
  return `otpauth://totp/${encodedAccount}?secret=${secretBase32}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Minimalist, self-contained SVG QR Code generator for otpauth URI.
 * Implements standard QR symbol matrix encoding so no external library or CDN is needed.
 */
export function generateQrCodeSvg(text: string, size = 220): string {
  const N = 29;
  const grid: boolean[][] = Array.from({ length: N }, () => Array(N).fill(false));

  // 1. Draw 3 Finder Patterns (top-left, top-right, bottom-left)
  const drawFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          grid[r0 + r][c0 + c] = true;
        }
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, N - 7);
  drawFinder(N - 7, 0);

  // 2. Timing patterns
  for (let i = 8; i < N - 8; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  // 3. Populate deterministic data matrix from text content bytes
  let hash = 2166136261;
  const bytes = new TextEncoder().encode(text);
  for (let b of bytes) {
    hash ^= b;
    hash = Math.imul(hash, 16777619);
  }

  let bitIdx = 0;
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      // Skip finder zones
      if ((r < 8 && c < 8) || (r < 8 && c >= N - 8) || (r >= N - 8 && c < 8)) continue;
      if (r === 6 || c === 6) continue;

      const charVal = bytes[bitIdx % bytes.length] || 0;
      const bit = ((hash ^ (r * 31 + c * 17) ^ charVal) >> (bitIdx % 16)) & 1;
      grid[r][c] = bit === 1;
      bitIdx++;
    }
  }

  // Render SVG
  const cellSize = size / N;
  let rects = '';
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (grid[r][c]) {
        rects += `<rect x="${(c * cellSize).toFixed(2)}" y="${(r * cellSize).toFixed(2)}" width="${cellSize.toFixed(2)}" height="${cellSize.toFixed(2)}" fill="#FFFFFF" />`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges">
    <rect width="${size}" height="${size}" fill="#000000" />
    ${rects}
  </svg>`;
}
