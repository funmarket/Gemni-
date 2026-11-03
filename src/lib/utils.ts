import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function formatNumber(num: number): string { return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(num); }
export function truncateAddress(address: string): string { if (!address) return ''; return `${address.slice(0, 4)}...${address.slice(-4)}`; }
