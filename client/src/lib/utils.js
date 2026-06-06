import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function imageUrl(value) {
  return value?.url || value || '';
}

export function initials(name = 'CampusWire') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function unwrapApi(error) {
  return error?.response?.data?.message || error?.response?.data?.errors?.[0]?.msg || error.message || 'Something went wrong';
}
