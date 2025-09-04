"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileBottomNav() {
	const pathname = usePathname();
	const hideOn = ['/swap'];
	if (hideOn.includes(pathname)) return null;
	return (
		<nav className="md:hidden fixed bottom-3 left-0 right-0 z-[90]" aria-label="Mobile quick nav">
			<div className="mx-auto w-[min(96%,480px)] grid grid-cols-3 gap-2 rounded-xl bg-gray-800/95 border border-gray-700 shadow-lg px-3 py-2">
				<Link href="/" className="text-center py-2 rounded text-gray-200 bg-gray-700/50 hover:bg-gray-700">Home</Link>
				<Link href="/swap" className="text-center py-2 rounded text-black bg-yellow-600 hover:bg-yellow-500">Swap</Link>
				<Link href="/settings" className="text-center py-2 rounded text-gray-200 bg-gray-700/50 hover:bg-gray-700">Settings</Link>
			</div>
		</nav>
	);
}

