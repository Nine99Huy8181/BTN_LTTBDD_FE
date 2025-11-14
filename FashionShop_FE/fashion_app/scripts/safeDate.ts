export const safeDate = (str: string | null) => {
  if (!str) return '—';
  const cleaned = str.replace(/\.\d+/, ''); // Cắt .670331
  const date = new Date(cleaned);
  return isNaN(date.getTime()) ? '—' : date.toLocaleDateString('vi-VN');
};