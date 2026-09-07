/**
 * Removes the hour/min/seg part of the date
 * @param date
 * @returns Formatted date with year / month / days
 */
export function trimDate(date: Date): Date {
  if (date) {
    const [year, month, days] = date.toString().split(/-|T/);
    return new Date(Number(year), Number(month) - 1, Number(days));
  } else {
    return null;
  }
}
