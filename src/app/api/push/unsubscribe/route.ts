import { NextRequest } from 'next/server'
import { supabaseAdmin, isAdminEnabled } from '@/lib/supabaseAdmin'
import { requireAuth } from '@/lib/auth'

async function getWalletFromRequest(request: NextRequest): Promise<string | Response> {
	const auth = requireAuth(request)
	if (auth instanceof Response) {
		const w = request.headers.get('x-wallet')
		if (!w) return new Response(JSON.stringify({ error: 'Wallet not provided' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
		return w
	}
	return auth.walletAddress
}

export async function POST(request: NextRequest) {
	if (!isAdminEnabled() || !supabaseAdmin) {
		return new Response(JSON.stringify({ ok: false, supported: false, skipped: true, reason: 'admin_disabled' }), { status: 200, headers: { 'Content-Type': 'application/json' } })
	}
	const walletOrResp = await getWalletFromRequest(request)
	if (walletOrResp instanceof Response) return walletOrResp
	const wallet = walletOrResp

	let body: any
	try { body = await request.json() } catch {
		return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
	}
	const endpoint: string | undefined = body?.endpoint
	if (!endpoint) {
		return new Response(JSON.stringify({ error: 'endpoint required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
	}

	// Only delete the caller's subscription for this endpoint
	const { error } = await supabaseAdmin
		.from('notification_subscriptions')
		.delete()
		.eq('endpoint', endpoint)
		.eq('wallet_address', wallet)

	if (error) {
		return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { 'Content-Type': 'application/json' } })
	}
	return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

