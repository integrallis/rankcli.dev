# WASM Code Protection

This document describes the architecture and implementation of RankCLI's code protection system using WebAssembly (WASM) and AES-256-GCM encryption.

## Overview

RankCLI's SEO audit checks (200+ rules) are proprietary. To prevent users from extracting and copying the check logic from the npm package, we embed encrypted JavaScript inside a WASM binary. The code is decrypted at runtime using a license key and executed in a sandboxed Node.js VM.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    WASM Code Protection Flow                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  BUILD TIME (CI/CD)                                                      │
│  ─────────────────                                                       │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────────┐  │
│  │ TypeScript   │ → │ Bundle to    │ → │ Encrypt with AES-256-GCM │  │
│  │ SEO Checks   │    │ IIFE (585KB) │    │ Embed in Rust/WASM       │  │
│  └──────────────┘    └──────────────┘    └──────────────────────────┘  │
│                                                                          │
│  RUNTIME (User's Machine)                                                │
│  ────────────────────────                                                │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────────┐  │
│  │ License Key  │ → │ WASM Binary  │ → │ Decrypted JS in VM       │  │
│  │ (dev/paid)   │    │ Decrypts     │    │ Sandbox Execution        │  │
│  └──────────────┘    └──────────────┘    └──────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Security Model

### What's Protected

| Asset | Protection Level | Notes |
|-------|-----------------|-------|
| SEO check logic | High | Encrypted in WASM, decrypted only in memory |
| Check algorithms | High | Never written to disk |
| Tier validation | Medium | Enforced by decryption failure |
| Audit results | None | Returned to user |

### Attack Vectors Mitigated

1. **node_modules inspection**: Users only see the WASM binary, not JS source
2. **Memory dumping**: Requires debugger attachment and precise timing
3. **License bypass**: Invalid key → decryption fails → no code access
4. **Code extraction**: VM sandbox prevents `eval()` or `Function()` export

### Known Limitations

- Determined attackers with debugger access could theoretically extract decrypted code from memory
- This is "protection" not "DRM" - the goal is to prevent casual copying, not stop nation-state actors

## Architecture

### Build Pipeline

```
packages/agent-runtime/                  packages/cli/
├── src/                                ├── native/
│   ├── audit/checks/*.ts              │   ├── Cargo.toml
│   └── wasm-adapter.ts    ────────→   │   ├── build.rs (encrypts JS)
│                          bundle       │   └── src/
└── dist/wasm/                         │       ├── lib.rs (WASM exports)
    └── wasm-adapter.global.js         │       └── decrypt.rs
                                       └── wasm/
                                           └── rankcli_audit_engine_bg.wasm
```

### Key Files

| File | Purpose |
|------|---------|
| `packages/agent-runtime/src/wasm-adapter.ts` | Sync audit wrapper for VM execution |
| `packages/agent-runtime/tsup.wasm.config.ts` | Bundles checks as self-contained IIFE |
| `packages/cli/native/build.rs` | Encrypts JS at Rust compile time |
| `packages/cli/native/src/lib.rs` | WASM exports (init, decrypt, validate) |
| `packages/cli/native/src/decrypt.rs` | AES-256-GCM decryption |
| `packages/cli/src/wasm-engine.ts` | Node.js wrapper, VM sandbox execution |

## Encryption Details

### Algorithm: AES-256-GCM

- **Cipher**: AES-256 in Galois/Counter Mode
- **Key size**: 256 bits (32 bytes)
- **Nonce**: 96 bits (12 bytes), randomly generated per build
- **Auth tag**: 128 bits (included in ciphertext)

### Key Derivation

Keys are derived from license strings using FNV-1a hashing:

```rust
fn derive_key(license_key: &str) -> [u8; 32] {
    let input = format!("{}rankcli-v1-2024", license_key);
    let mut result = [0u8; 32];

    for i in 0..4 {
        let mut hash: u64 = 0xcbf29ce484222325; // FNV offset basis
        for byte in input.as_bytes() {
            hash ^= *byte as u64;
            hash = hash.wrapping_mul(0x100000001b3); // FNV prime
        }
        hash ^= i as u64;
        hash = hash.wrapping_mul(0x100000001b3);
        result[i * 8..(i + 1) * 8].copy_from_slice(&hash.to_le_bytes());
    }
    result
}
```

### Build-Time Encryption

During `cargo build`, the build.rs script:
1. Reads the bundled JS (IIFE format)
2. Generates a random 12-byte nonce
3. Derives key from `RANKCLI_BUILD_KEY` env var (or "dev" for development)
4. Encrypts using AES-256-GCM
5. Embeds encrypted bytes + nonce in generated Rust code

### Runtime Decryption

When the user calls `initEngine(licenseKey)`:
1. Key is derived from the license key using same FNV-1a algorithm
2. WASM decrypts using embedded nonce
3. If decryption succeeds, JS code is stored in memory
4. If decryption fails (wrong key), error is returned

## Tier-Based Limits

The system enforces different check limits based on the license tier:

| Tier | Checks Limit | How Determined |
|------|-------------|----------------|
| Free (no key) | 50 | Decryption fails, fallback used |
| Registered | 100 | Dev key or free registered account |
| Solo ($9/mo) | 150 | Paid license validation |
| Pro ($29/mo) | 200 | Paid license validation |
| Agency ($99/mo) | 280+ | Full access to all checks |

### Check Categories

```typescript
// Core checks (all tiers): 12 checks
- On-page SEO
- Structured data
- Mobile optimization
- Social meta tags
- SERP preview
- DOM structure
- Tech detection
- Keywords
- DOM size
- Image dimensions
- URL safety
- Soft 404 detection

// Extended checks (registered+): +9 checks
- Anchor text analysis
- Local SEO
- Modern images (WebP/AVIF)
- Resource hints
- Tracker bloat
- Client-side rendering
- Responsive images
- Color contrast
- Page resources

// Premium checks (paid only): +15 checks
- Featured snippet optimization
- Internal link graph
- E-E-A-T signals
- Content science
- Conversion elements
- Keyword placement
- NavBoost signals
- Entity SEO
- Freshness signals
- AI content structure
- Citation quality
- Answer conciseness
- Brand mention optimization
- AI citation worthiness
- Review ecosystem
```

## Usage

### Installation

```bash
npm install rankcli
```

### Basic Usage

```typescript
import { initEngine, runAudit } from 'rankcli/engine';

// Initialize with license key
await initEngine(process.env.RANKCLI_LICENSE_KEY);

// Fetch HTML (not included in engine)
const response = await fetch('https://example.com');
const html = await response.text();

// Run audit
const result = await runAudit('https://example.com', html);

console.log(`Score: ${result.score}`);
console.log(`Issues: ${result.issues.length}`);
console.log(`Checks run: ${result.checksRun}`);
```

### API Reference

```typescript
// Initialize engine with license key
initEngine(licenseKey?: string): Promise<void>

// Run audit on HTML content
runAudit(url: string, html: string): Promise<AuditResult>

// Get current tier
getTier(): Promise<'free' | 'registered' | 'solo' | 'pro' | 'agency'>

// Get checks limit for current tier
getChecksLimit(): Promise<number>

// Validate license without initializing
validateLicense(licenseKey: string): Promise<Tier>

// Check if engine is ready
isReady(): Promise<boolean>

// Get version info
getVersion(): Promise<string>
```

### AuditResult Type

```typescript
interface AuditResult {
  success: boolean;
  score: number;           // 0-100
  issues: AuditIssue[];
  checksRun: number;
  tier: string;
}

interface AuditIssue {
  code: string;
  severity: 'error' | 'warning' | 'notice';
  category: string;
  title: string;
  description?: string;
  impact?: string;
  howToFix?: string;
  affectedUrls?: string[];
}
```

## Building

### Prerequisites

- Rust 1.70+ with `wasm32-unknown-unknown` target
- wasm-pack (`cargo install wasm-pack`)
- Node.js 18+
- pnpm

### Development Build

```bash
# Build agent-runtime WASM bundle
cd packages/agent-runtime
pnpm build:wasm

# Build WASM with dev key (for local testing)
cd packages/cli
pnpm build:wasm:dev

# Test
npx tsx -e "
import { initEngine, runAudit } from './src/wasm-engine.ts';
await initEngine('dev');
const result = await runAudit('https://example.com', '<html>...</html>');
console.log(result);
"
```

### Production Build

```bash
# Set production encryption key
export RANKCLI_BUILD_KEY=$(openssl rand -base64 32)

# Build everything
cd packages/cli
pnpm build

# Package contents
npm pack --dry-run
```

### CI/CD Build (GitHub Actions)

```yaml
jobs:
  build-wasm:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Rust
        uses: dtolnay/rust-action@stable
        with:
          targets: wasm32-unknown-unknown

      - name: Install wasm-pack
        run: cargo install wasm-pack

      - name: Build agent-runtime
        run: cd packages/agent-runtime && pnpm build:wasm

      - name: Build WASM
        env:
          RANKCLI_BUILD_KEY: ${{ secrets.RANKCLI_BUILD_KEY }}
        run: cd packages/cli && pnpm build:wasm
```

## Package Contents

When published to npm, the `rankcli` package contains:

```
rankcli/
├── dist/
│   ├── index.js           # CLI entry point
│   ├── index.mjs
│   ├── wasm-engine.js     # WASM wrapper
│   └── wasm-engine.mjs
├── wasm/
│   ├── rankcli_audit_engine_bg.wasm  # 851KB, encrypted JS inside
│   ├── rankcli_audit_engine.js       # WASM bindings
│   └── rankcli_audit_engine.d.ts     # TypeScript types
└── package.json
```

Total package size: ~1.3 MB

## Deployment Scenarios

### Scenario 1: npm Package (WASM Protected)

Users install `rankcli` from npm. They get the WASM binary with encrypted checks. Valid license key required for full functionality.

```
User → npm install rankcli → WASM binary → License validation → Audit
```

### Scenario 2: SaaS Platform (Direct TypeScript)

The SaaS platform (rankcli.dev) runs audits via Supabase Edge Functions. These use the original TypeScript code directly since it runs on our servers.

```
SaaS User → Edge Function → TypeScript checks → Results → Dashboard
```

### Scenario 3: GitHub Action (WASM Protected)

The GitHub Action uses the npm package, so it's WASM protected. Users need a valid license key in their repository secrets.

```
GitHub → Action → npm package → WASM → License check → Audit results → PR comment
```

## Future Enhancements

### Production License Validation (TODO)

Current: License key derives decryption key via FNV-1a hash.
Future: JWT tokens with Ed25519 signatures for online validation.

```typescript
// Future implementation
interface LicenseToken {
  sub: string;      // User ID
  tier: Tier;       // Subscription tier
  exp: number;      // Expiration timestamp
  iat: number;      // Issued at
  features: string[]; // Enabled features
}
```

### Multi-Platform Builds (TODO)

Current: Single WASM build (platform-independent).
Future: Native builds for better performance on specific platforms.

```yaml
# Future CI matrix
strategy:
  matrix:
    include:
      - os: ubuntu-latest
        target: x86_64-unknown-linux-gnu
      - os: macos-latest
        target: x86_64-apple-darwin
      - os: windows-latest
        target: x86_64-pc-windows-msvc
```

## Troubleshooting

### "Invalid license key"

The license key doesn't derive the correct decryption key. For development, use `"dev"` as the license key.

### "WASM engine not found"

Run `pnpm build:wasm` in the cli package to build the WASM binary.

### "RankCLI.runAudit not found"

The decrypted code structure changed. Rebuild the agent-runtime WASM bundle:
```bash
cd packages/agent-runtime && pnpm build:wasm
cd packages/cli && pnpm build:wasm:dev
```

### "Execution context not ready"

`initEngine()` must be called before `runAudit()`.
