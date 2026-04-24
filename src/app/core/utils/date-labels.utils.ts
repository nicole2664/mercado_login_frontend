export const MONTH_LABELS = [
  '',
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

export function shortMonthLabel(yyyyMM: string): string {
  if (!yyyyMM) return '';
  const [y, m] = yyyyMM.split('-');
  return `${MONTH_LABELS[+m]} '${y.slice(2)}`;
}
