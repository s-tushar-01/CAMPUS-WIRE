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

export function usernameHandle(user) {
  if (!user?.username) return '';
  return `@${user.username}`;
}

export function displayName(user, fallback = 'CampusWire user') {
  return user?.name || user?.username || fallback;
}

export function profilePath(user) {
  return `/profile/${user?.username || user?._id}`;
}

export function unwrapApi(error) {
  return error?.response?.data?.message || error?.response?.data?.errors?.[0]?.msg || error.message || 'Something went wrong';
}
