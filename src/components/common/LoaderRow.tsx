"use client";
import React from 'react';

export default function LoaderRow({ cols, count = 3 }: { cols: number; count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td colSpan={cols} className="px-6 py-3">
            <div className="h-4 w-full bg-gray-700/60 rounded" />
          </td>
        </tr>
      ))}
    </>
  );
}
