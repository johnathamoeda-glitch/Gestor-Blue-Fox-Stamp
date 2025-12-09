export type FilterType = 'all' | 'year' | 'month' | 'week' | 'day';

export const filterListByDate = <T>(
  list: T[],
  dateField: keyof T,
  type: FilterType,
  value: string
): T[] => {
  if (type === 'all' || !value) return list;

  return list.filter(item => {
    const itemDate = new Date(item[dateField] as number);
    
    // Adjust for timezone offset to ensure string comparison matches local date input
    // This is a simple way to handle the fact that inputs are usually YYYY-MM-DD local
    const localDate = new Date(itemDate.getTime() - (itemDate.getTimezoneOffset() * 60000));
    
    switch (type) {
      case 'year':
        return localDate.toISOString().slice(0, 4) === value; // value format: YYYY
      case 'month':
        return localDate.toISOString().slice(0, 7) === value; // value format: YYYY-MM
      case 'day':
        return localDate.toISOString().slice(0, 10) === value; // value format: YYYY-MM-DD
      case 'week': {
        // value format: YYYY-Www (ISO Week)
        const [yearStr, weekStr] = value.split('-W');
        const year = parseInt(yearStr);
        const week = parseInt(weekStr);
        
        // Calculate start and end of that ISO week
        const simpleDate = new Date(year, 0, 1 + (week - 1) * 7);
        const dayOfWeek = simpleDate.getDay();
        const ISOweekStart = simpleDate;
        if (dayOfWeek <= 4)
            ISOweekStart.setDate(simpleDate.getDate() - simpleDate.getDay() + 1);
        else
            ISOweekStart.setDate(simpleDate.getDate() + 8 - simpleDate.getDay());
            
        const ISOweekEnd = new Date(ISOweekStart);
        ISOweekEnd.setDate(ISOweekStart.getDate() + 6);
        ISOweekEnd.setHours(23, 59, 59, 999);
        ISOweekStart.setHours(0, 0, 0, 0);

        return itemDate.getTime() >= ISOweekStart.getTime() && itemDate.getTime() <= ISOweekEnd.getTime();
      }
      default:
        return true;
    }
  });
};

export const getPeriodLabel = (type: FilterType, value: string): string => {
  if (type === 'all') return 'Todo o Período';
  if (!value) return '';

  const [year, part2, part3] = value.split(/[-W]/);

  switch (type) {
    case 'year':
      return `Ano de ${year}`;
    case 'month':
      const date = new Date(parseInt(year), parseInt(part2) - 1, 1);
      return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    case 'week':
      return `Semana ${part2} de ${year}`;
    case 'day':
      const dayDate = new Date(parseInt(year), parseInt(part2) - 1, parseInt(part3));
      return dayDate.toLocaleDateString('pt-BR', { dateStyle: 'full' });
    default:
      return '';
  }
};