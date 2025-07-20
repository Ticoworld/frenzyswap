# 🔗 FrenzySwap URL Sharing Feature

## Overview
FrenzySwap now supports pre-filled swap URLs for easy sharing and direct access to specific token pairs.

## Supported URL Parameters

### Method 1: Using Token Addresses (Raydium-compatible)
```
https://frenzyswap.com/swap?inputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&outputMint=94fzsMkuHAuFP4J8iMZS43euWr2CLtuvwLgyjPHyqcnY
```

### Method 2: Using Token Symbols (User-friendly)
```
https://frenzyswap.com/swap?from=USDC&to=MEME&amount=100
```

### Method 3: Mixed Parameters
```
https://frenzyswap.com/swap?from=SOL&outputMint=94fzsMkuHAuFP4J8iMZS43euWr2CLtuvwLgyjPHyqcnY&amount=1
```

## Parameter Reference

| Parameter | Description | Example |
|-----------|-------------|---------|
| `inputMint` | Input token mint address | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| `outputMint` | Output token mint address | `94fzsMkuHAuFP4J8iMZS43euWr2CLtuvwLgyjPHyqcnY` |
| `from` | Input token symbol | `USDC`, `SOL`, `MEME` |
| `to` | Output token symbol | `USDC`, `SOL`, `MEME` |
| `amount` | Pre-filled input amount | `100`, `1.5`, `0.1` |

## Common Use Cases

### 1. Marketing Campaigns
```
https://frenzyswap.com/swap?from=USDC&to=MEME
```

### 2. Social Media Sharing
```
https://frenzyswap.com/swap?from=SOL&to=MEME&amount=1
```

### 3. Partner Integration (Raydium-style)
```
https://frenzyswap.com/swap?inputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&outputMint=94fzsMkuHAuFP4J8iMZS43euWr2CLtuvwLgyjPHyqcnY
```

### 4. Documentation Examples
```
https://frenzyswap.com/swap?from=USDC&to=MEME&amount=100
```

## Features

- ✅ **Share Button**: Click the blue share icon to copy/share current swap configuration
- ✅ **Auto-Detection**: Supports both mint addresses and symbols
- ✅ **Fallback Support**: Gracefully handles unknown tokens
- ✅ **Mobile Sharing**: Uses native share API on mobile devices
- ✅ **Copy to Clipboard**: Automatic fallback for desktop browsers

## Token Address Reference

| Symbol | Mint Address |
|--------|--------------|
| SOL | `So11111111111111111111111111111111111111112` |
| USDC | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| MEME | `94fzsMkuHAuFP4J8iMZS43euWr2CLtuvwLgyjPHyqcnY` |

## Implementation Notes

- Parameters are processed in order of precedence
- Unknown tokens are ignored gracefully
- Amount parameter only applies to input token
- Share functionality includes both methods for maximum compatibility
- URLs are generated client-side for security

## Example Share URLs Generated

```javascript
// USDC → MEME with 100 amount
"https://frenzyswap.com/swap?inputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&outputMint=94fzsMkuHAuFP4J8iMZS43euWr2CLtuvwLgyjPHyqcnY&from=USDC&to=MEME&amount=100"

// SOL → MEME
"https://frenzyswap.com/swap?inputMint=So11111111111111111111111111111111111111112&outputMint=94fzsMkuHAuFP4J8iMZS43euWr2CLtuvwLgyjPHyqcnY&from=SOL&to=MEME"
```

This feature enhances user experience and enables powerful marketing and integration opportunities! 🚀
