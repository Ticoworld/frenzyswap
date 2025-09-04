import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'
import React from 'react'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') || 'FrenzySwap'
  const subtitle = searchParams.get('subtitle') || 'Trade smarter on Solana'
  const stat = searchParams.get('stat') || ''
  return new ImageResponse(
    (
      <div style={{ display: 'flex', height: '100%', width: '100%', background: '#0b0b0b', color: 'white', padding: 48, fontSize: 48, justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontWeight: 800, color: '#facc15' }}>{title}</div>
          <div style={{ fontSize: 28, color: '#cbd5e1' }}>{subtitle}</div>
          {stat && <div style={{ marginTop: 12, fontSize: 40 }}>{stat}</div>}
        </div>
        <div style={{ height: 120, width: 120, borderRadius: 24, background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #374151' }}>
          <span style={{ color: '#facc15' }}>FS</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
