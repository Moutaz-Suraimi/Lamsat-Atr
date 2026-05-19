export const formatPrice = (n: number | null | undefined) =>
  new Intl.NumberFormat("ar-YE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n ?? 0)) + " ر.س";

export const discountPercent = (price: number, sale?: number | null) => {
  if (!sale || sale >= price) return 0;
  return Math.round(((price - sale) / price) * 100);
};
