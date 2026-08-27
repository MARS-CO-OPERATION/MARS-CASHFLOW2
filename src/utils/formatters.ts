export function formatUgx(amount: number): string {
  return `UGX ${Math.round(amount).toLocaleString('en-US')}`;
}

export function formatMoney(amount: number): string {
  return Math.round(amount).toLocaleString('en-US');
}

export function formatUgxShort(amount: number): string {
  const absAmount = Math.abs(amount);
  const prefix = amount < 0 ? '-UGX ' : 'UGX ';
  if (absAmount >= 1_000_000) {
    return `${prefix}${(absAmount / 1_000_000).toFixed(2)}M`;
  }
  if (absAmount >= 1_000) {
    return `${prefix}${(absAmount / 1_000).toFixed(0)}K`;
  }
  return `${prefix}${absAmount}`;
}

export function formatDate(timestamp: number | string): string {
  if (typeof timestamp === 'string') return timestamp;
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
