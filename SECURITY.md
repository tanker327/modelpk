# Security Policy

## Overview

ModelPK is a security-focused, browser-based application for comparing AI model outputs. We take security seriously and have designed the application with privacy and data protection as core principles.

## Reporting Security Vulnerabilities

If you discover a security vulnerability in ModelPK, please report it responsibly:

1. **DO NOT** open a public GitHub issue for security vulnerabilities
2. Report via [GitHub Security Advisories](https://github.com/tanker327/modelpk/security/advisories/new)
3. Or email the maintainers at the email listed in the repository

We will acknowledge receipt within 48 hours and provide a detailed response within 7 days.

## Security Architecture

### Client-Side Only Design

ModelPK runs entirely in your browser with **no backend server**:

- ✅ No data sent to third-party servers
- ✅ No logging or analytics of prompts/responses
- ✅ Direct API calls from browser to LLM providers
- ✅ All code is open source for transparency

### API Key Encryption

API keys are encrypted before storage using the Web Crypto API:

- **Algorithm**: AES-GCM (256-bit)
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Master Salt**: Randomly generated per browser installation
- **Per-Key Salt**: Each API key gets a unique salt and IV
- **Storage**: Encrypted keys stored in IndexedDB

**Important Limitations:**
- This provides obfuscation, not protection against determined attackers with device access
- Browser storage is inherently accessible to malware and malicious extensions
- No password protection (keys auto-decrypt when needed)
- For high-security use cases, use a backend proxy instead

### Data Storage

- **IndexedDB**: Encrypted API keys and provider configurations
- **localStorage**: UI preferences and comparison data (no sensitive data)
- **Memory Only**: Decrypted API keys (never persisted unencrypted)

### No Server-Side Storage

Because there is no backend:
- No user accounts or authentication
- No server-side logs
- No centralized data collection
- No session tracking

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| Latest (main branch) | :white_check_mark: |
| Older versions | :x: |

We recommend always using the latest version from the `main` branch.

## Security Best Practices for Users

### Using ModelPK Safely

1. **Use HTTPS Only**
   - Encryption requires a secure context (HTTPS or localhost)
   - GitHub Pages and Cloudflare Pages provide HTTPS by default

2. **Verify Network Traffic**
   - Open browser DevTools → Network tab
   - Verify API calls only go to official provider endpoints
   - No unexpected third-party requests

3. **Protect Exports**
   - Exported configs contain API keys in **plain text**
   - Keep export files secure
   - Delete export files after importing
   - Never commit exports to version control

4. **Device Security**
   - Don't use shared/public computers for sensitive API keys
   - Use browser profiles to isolate API keys
   - Clear browser data if sharing device

5. **API Key Hygiene**
   - Use provider-specific keys (not master keys)
   - Set spending limits on provider dashboards
   - Rotate keys periodically
   - Revoke keys if device is compromised

### What ModelPK Does NOT Protect Against

- Malware on your device
- Malicious browser extensions
- Physical access to your device
- Browser vulnerabilities
- Network-level attacks (use HTTPS)

## Security Features

### Implemented

- [x] AES-GCM encryption for API keys
- [x] No backend/server-side storage
- [x] Direct API calls to providers
- [x] Production logging (warn/error only)
- [x] No sensitive data in logs
- [x] Open source code
- [x] Clean git history (no committed secrets)
- [x] Dependency vulnerability scanning
- [x] Content Security Policy headers (when deployed)

### Planned

- [ ] Optional password-based encryption
- [ ] Browser extension for additional security
- [ ] Self-hosted backend proxy option
- [ ] Export file encryption

## Known Security Limitations

1. **CORS Restrictions**
   - Some providers (Anthropic) block browser requests
   - Use OpenRouter as a proxy for Claude models

2. **Browser Storage Limits**
   - IndexedDB can be cleared by browser/user
   - No cloud backup of encrypted keys
   - Regular exports recommended

3. **No Authentication**
   - Anyone with device access can use the app
   - No password protection for the app itself
   - Browser-level security only

## Threat Model

### In Scope

- Protecting API keys from casual device access
- Preventing accidental key exposure
- Ensuring no third-party data leakage
- Transparent security architecture

### Out of Scope

- Protection against malware
- Protection against physical device access
- Protection against browser vulnerabilities
- Protection against network-level attacks (use HTTPS)

## Compliance

### GDPR Compliance

- No personal data collected
- No cookies (except Google Analytics, if enabled)
- No user tracking
- All data stays on user's device

### Data Processing

- **Controller**: The user (all data stays on their device)
- **Processor**: None (no backend)
- **Third Parties**: Only LLM providers you explicitly configure

## Security Changelog

### v0.0.1 (Initial Release)
- Implemented AES-GCM encryption for API keys
- Added centralized logging with production safety
- Removed all console.log statements
- Added security documentation
- Zero npm audit vulnerabilities

## Contact

For security concerns, please use:
- GitHub Security Advisories (preferred)
- Repository issue tracker (for non-sensitive security suggestions)
- Email maintainers (for private disclosure)

## Acknowledgments

We thank the security research community for responsible disclosure and the open-source projects we build upon:
- Web Crypto API
- IndexedDB
- React and Vite ecosystem
