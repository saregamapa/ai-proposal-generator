import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function formatCurrency(amount: number, currency = 'USD'): string { return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount); }
export function formatDate(dateString: string|Date): string { return format(new Date(dateString), 'MMM d, yyyy'); }
export function formatRelative(dateString: string|Date): string { return formatDistanceToNow(new Date(dateString), { addSuffix: true }); }
export function truncate(str: string, length = 60): string { return str.length > length ? str.slice(0, length)+'...' : str; }
