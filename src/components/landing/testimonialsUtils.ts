export function validateEmail(value: string): boolean {
  if (!value.trim()) {
    return false;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(value.trim());
}

export function getAdjacentIndex(currentIndex: number, totalItems: number, step: number): number {
  if (totalItems <= 0) {
    return 0;
  }

  const nextIndex = currentIndex + step;
  if (nextIndex >= totalItems) {
    return nextIndex % totalItems;
  }

  if (nextIndex < 0) {
    return (totalItems + nextIndex) % totalItems;
  }

  return nextIndex;
}
