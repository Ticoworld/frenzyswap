export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.frenzyswap.com/#organization",
        "name": "FrenzySwap",
        "url": "https://www.frenzyswap.com/",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.frenzyswap.com/assets/logos/frenzyswap_logomark.svg",
          "width": 200,
          "height": 200
        },
        "description": "Premier Solana DEX aggregator for meme token trading",
        "foundingDate": "2024",
        "sameAs": [
          "https://twitter.com/FrenzySwap",
          "https://discord.gg/frenzyswap",
          "https://t.me/frenzyswap"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://www.frenzyswap.com/#website",
        "url": "https://www.frenzyswap.com/",
        "name": "FrenzySwap",
        "description": "Leading Solana DEX aggregator for meme tokens",
        "publisher": {
          "@id": "https://www.frenzyswap.com/#organization"
        },
        "potentialAction": [
          {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://www.frenzyswap.com/swap?search={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          }
        ]
      },
      {
        "@type": "WebApplication",
        "@id": "https://www.frenzyswap.com/#webapp",
        "name": "FrenzySwap DEX",
        "url": "https://www.frenzyswap.com/swap",
        "description": "Solana DEX aggregator powered by Jupiter Protocol",
        "applicationCategory": "DeFi",
        "operatingSystem": "Web Browser",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "featureList": [
          "DEX aggregation",
          "Best swap rates",
          "Meme token trading",
          "Solana blockchain",
          "Jupiter Protocol integration"
        ]
      },
      {
        "@type": "Article",
        "@id": "https://www.frenzyswap.com/#article",
        "headline": "FrenzySwap - Premier Solana DEX Aggregator",
        "description": "Trade meme tokens on Solana with the best rates using Jupiter Protocol aggregation",
        "author": {
          "@id": "https://www.frenzyswap.com/#organization"
        },
        "publisher": {
          "@id": "https://www.frenzyswap.com/#organization"
        },
        "mainEntityOfPage": {
          "@id": "https://www.frenzyswap.com/#website"
        },
        "datePublished": "2024-01-01",
        "dateModified": "2024-12-20",
        "image": {
          "@type": "ImageObject",
          "url": "https://www.frenzyswap.com/assets/frenzy-desktop.png",
          "width": 1200,
          "height": 630
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://www.frenzyswap.com/#breadcrumb",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.frenzyswap.com/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Swap",
            "item": "https://www.frenzyswap.com/swap"
          }
        ]
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
