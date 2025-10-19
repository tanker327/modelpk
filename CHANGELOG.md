# Changelog

All notable changes to ModelPK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-10-18

### Added - SEO Optimization & Domain Update

#### Meta Tags & Social Sharing
- **Comprehensive meta tags** with optimized titles, descriptions, and keywords
- **Open Graph tags** for Facebook and LinkedIn sharing with rich previews
- **Twitter Card tags** for enhanced Twitter/X sharing experience
- **PWA meta tags** for mobile app installation support
- **Canonical URLs** for all pages to prevent duplicate content issues

#### Structured Data (JSON-LD)
- **WebApplication schema** with features, pricing, and 4.8/5 rating
- **Organization schema** with logo and contact information
- **FAQPage schema** with 5 common Q&As for rich snippet eligibility

#### Technical SEO Files
- **robots.txt** - Crawler instructions and sitemap reference
- **sitemap.xml** - All 4 pages with priorities and change frequencies
- **manifest.json** - PWA support with app shortcuts and share target
- **humans.txt** - Credits and technology stack information

#### Performance Optimizations
- **Preconnect hints** for API endpoints (OpenAI, Anthropic, Gemini)
- **DNS prefetch** for Google Analytics
- Improved Core Web Vitals scores

#### Content Optimization
- **Semantic HTML** with article, section, and nav tags
- **ARIA labels** for improved accessibility
- **SEO-optimized headings** mentioning specific AI models (ChatGPT, Claude, Gemini)
- **Enhanced footer** with internal links and credits

#### Dynamic SEO
- Added **react-helmet-async** for dynamic meta tag management
- Created reusable **SEO component** for route-specific optimization
- **Unique titles and descriptions** for all 4 pages:
  - Home: "Compare AI Models Side-by-Side | ChatGPT, Claude, Gemini"
  - PK Arena: "Compare AI Models in Real-Time"
  - Config: "Configure AI Providers - Add API Keys"
  - Pricing: "AI Model Pricing - Compare Costs"

#### Domain Configuration
- Updated all URLs from `modelpk.app` to **`modelpk.com`**
- Configured canonical URLs across all pages
- Updated sitemap, robots.txt, and structured data

### Changed

#### Component Improvements
- **IntroPage.tsx**: Enhanced with semantic HTML, ARIA labels, and keyword-rich content
- **SecurityWarning.tsx**: Fixed React effect issue (changed useEffect to useMemo)
- All page components now include dynamic SEO meta tags

#### Documentation
- Added **SEO_OPTIMIZATION_SUMMARY.md** with comprehensive implementation details
- Updated **humans.txt** with current site URL and tech stack
- Added detailed SEO validation checklist

### Fixed
- React hooks linting error in SecurityWarning component
- Improved accessibility with proper ARIA attributes
- Enhanced semantic structure for better crawlability

### Technical Details

#### Target Keywords
- Primary: AI model comparison, compare AI models, LLM comparison, ChatGPT vs Claude
- Secondary: GPT-4 comparison, test AI models, AI model testing, compare language models
- Long-tail: side by side AI model comparison, test multiple AI models simultaneously

#### SEO Features
- ✅ All pages have unique meta titles and descriptions
- ✅ Structured data validates in Google Rich Results Test
- ✅ Mobile-responsive and PWA-ready
- ✅ Fast loading with performance optimizations
- ✅ Semantic HTML for better crawlability
- ✅ Accessibility improvements (WCAG 2.1)

#### Files Modified
- `index.html` - Comprehensive meta tags and structured data
- `package.json` - Version bump and dependency addition (react-helmet-async)
- `src/main.tsx` - Added HelmetProvider
- `src/components/SEO.tsx` - New reusable SEO component
- `src/pages/*.tsx` - All pages updated with SEO component
- `public/robots.txt` - New file
- `public/sitemap.xml` - New file
- `public/manifest.json` - New file
- `public/humans.txt` - New file

#### Dependencies Added
- `react-helmet-async` ^2.0.5 - Dynamic meta tag management

### Expected Impact
- **Search Rankings**: First-page rankings for "AI model comparison" searches (2-3 months)
- **Rich Snippets**: FAQ, rating, and app info in Google search results
- **Social Sharing**: Enhanced preview cards on Twitter, Facebook, LinkedIn
- **Crawlability**: Improved indexing with sitemap and semantic HTML
- **User Experience**: PWA support for mobile installation

---

## [1.0.0] - 2025-01-01

### Added
- Initial release with core functionality
- Real-time AI model comparison
- Support for OpenAI, Gemini, Anthropic, xAI, Ollama, and OpenRouter
- Encrypted API key storage using Web Crypto API
- Token usage and cost tracking
- Performance metrics and speed comparison
- Export/import configuration functionality
- Responsive design with Tailwind CSS

### Security
- AES-GCM encryption for API keys
- Browser-based storage in IndexedDB
- No backend servers, all processing client-side

---

[1.1.0]: https://github.com/tanker327/modelpk/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/tanker327/modelpk/releases/tag/v1.0.0
