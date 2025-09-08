"use client";

import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'

export default function InviteCard({ wallet }: { wallet: string }) {
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const inviteUrl = useMemo(() => {
    if (!token) return ''
    const base = typeof window !== 'undefined' ? window.location.origin : ''
    return `${base}/login?invite=${token}`
  }, [token])

  async function generateInvite() {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-wallet': wallet },
        body: JSON.stringify({ maxUses: 1 })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to create invite')
      setToken(data.token)
      toast.success('Invite link created')
    } catch (e: any) {
      setError(e?.message || 'Failed to create invite')
      toast.error(e?.message || 'Failed to create invite')
    } finally {
      setLoading(false)
    }
  }

  async function copyInvite() {
    if (!inviteUrl) return
    try {
      await navigator.clipboard.writeText(inviteUrl)
      toast.success('Copied!')
    } catch {
      toast.error('Copy failed')
    }
  }

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Invite friends</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Generate a secure invite link. When accepted, your friend is auto-whitelisted and you earn points.</p>
        </div>
        <button
          onClick={generateInvite}
          disabled={loading}
          className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white"
          aria-label="Generate invite link"
        >{loading ? 'Generating…' : 'Generate Invite Link'}</button>
      </div>
      {error && (
        <div role="alert" className="mt-3 text-sm text-red-400">{error}</div>
      )}
      {token && (
        <div className="mt-4 flex flex-col md:flex-row gap-3" aria-live="polite">
          <input
            readOnly
            value={inviteUrl}
            className="flex-1 px-3 py-2 rounded bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200"
            aria-label="Invite link"
          />
          <button onClick={copyInvite} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-600">Copy</button>
        </div>
      )}
      <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">Your link looks like /login?invite=&lt;token&gt;. Share it only with people you trust.</div>
    </section>
  )
}
