"use client";

import Link from 'next/link';
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, BarChart2Icon, LineChartIcon, HistoryIcon } from 'lucide-react';
import { analyticsNav } from '@/config/nav';

function classNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function AnalyticsMenu() {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple">
        <BarChart2Icon className="h-4 w-4" />
        Analytics
        <ChevronDownIcon className="ml-1 h-4 w-4" aria-hidden="true" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute left-0 z-50 mt-2 w-64 origin-top-left rounded-md bg-black/80 backdrop-blur-xl border-2 border-brand-purple/20 shadow-lg focus:outline-none">
          <div className="py-2">
            {analyticsNav.map((item) => (
              <Menu.Item key={item.href}>
                {({ active }) => (
                  <Link
                    href={item.href}
                    className={classNames(
                      active ? 'bg-brand-purple/10 text-white' : 'text-gray-300',
                      'flex items-start gap-3 px-4 py-3 text-sm'
                    )}
                  >
                    {item.label === 'Swaps' && <HistoryIcon className="h-4 w-4 mt-0.5 text-brand-purple" />}
                    {item.label === 'P&L' && <LineChartIcon className="h-4 w-4 mt-0.5 text-brand-purple" />}
                    {item.label === 'Wallet Stats' && <BarChart2Icon className="h-4 w-4 mt-0.5 text-brand-purple" />}
                    <div>
                      <div className="font-medium">{item.label}</div>
                      {item.description && (
                        <p className="text-xs text-gray-400">{item.description}</p>
                      )}
                    </div>
                  </Link>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
