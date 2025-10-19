import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
  canonical?: string
  ogImage?: string
  keywords?: string
  type?: string
}

export function SEO({
  title = 'ModelPK - Compare AI Models Side-by-Side | AI Model Comparison Tool',
  description = 'Compare ChatGPT, Claude, Gemini, and 100+ AI models side-by-side in real-time. Test multiple LLMs with the same prompt, track performance, cost, and speed. 100% browser-based with encrypted API key storage.',
  canonical = 'https://modelpk.com/',
  ogImage = 'https://modelpk.com/logo.svg',
  keywords = 'AI model comparison, compare AI models, LLM comparison, ChatGPT vs Claude, AI benchmarking tool, GPT-4 comparison, test AI models, AI model testing, compare language models, AI racing tool, model performance comparison',
  type = 'website',
}: SEOProps) {
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  )
}
