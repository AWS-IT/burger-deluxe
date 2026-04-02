import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}

export function getCategoryName(categoryId: string): string {
  const categories: Record<string, string> = {
    'signature-burgers': 'Signature Burgers',
    'classic-burgers': 'Classic Burgers',
    'chicken-sides': 'Chicken & Sides',
    'fries-snacks': 'Fries & Snacks',
    'drinks-shakes': 'Drinks & Shakes',
    'desserts': 'Desserts'
  };
  return categories[categoryId] || categoryId;
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'confirmed': 'bg-blue-100 text-blue-800 border-blue-200',
    'preparing': 'bg-orange-100 text-orange-800 border-orange-200',
    'on-the-way': 'bg-purple-100 text-purple-800 border-purple-200',
    'delivered': 'bg-green-100 text-green-800 border-green-200',
    'cancelled': 'bg-red-100 text-red-800 border-red-200'
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
}

export function getStatusText(status: string): string {
  const statusTexts: Record<string, string> = {
    'pending': 'Ожидает подтверждения',
    'confirmed': 'Подтвержден',
    'preparing': 'Готовится',
    'on-the-way': 'В пути',
    'delivered': 'Доставлен',
    'cancelled': 'Отменен'
  };
  return statusTexts[status] || status;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function generateImageUrl(path: string): string {
  if (!path) return '/placeholder-dish.jpg';
  if (path.startsWith('http')) return path;
  const apiUrl = (import.meta as unknown as { env: { VITE_API_URL?: string } }).env?.VITE_API_URL || 'http://localhost:5000';
  return `${apiUrl}${path}`;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone);
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function isValidDeliveryTime(dateString: string): boolean {
  const deliveryTime = new Date(dateString);
  const now = new Date();
  const minDeliveryTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 минут от текущего времени

  return deliveryTime >= minDeliveryTime;
}

export function getMinDeliveryTime(): string {
  const now = new Date();
  const minTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 минут от сейчас
  return minTime.toISOString().slice(0, 16); // Формат для input[type="datetime-local"]
}