import type { DailyMetrics, Lead } from './types';
import { format, subDays } from 'date-fns';

export const currentDay = 30;
export const currentDate = format(new Date(), 'dd MMM, yyyy');

// Generate 30 days of data
export const historicalMetrics: DailyMetrics[] = Array.from({ length: 30 }).map((_, i) => {
  const date = subDays(new Date(), 29 - i);
  // Base values with some random noise to make the chart look organic
  const baseAdSpend = 100 + (i * 15) + (Math.random() * 50 - 25);
  const baseRevenue = baseAdSpend * (1.5 + Math.random() * 2); 
  const messages = 50 + i * 2 + Math.floor(Math.random() * 10);
  const replied = Math.floor(messages * (0.1 + Math.random() * 0.2));

  return {
    day: i + 1,
    date: format(date, 'MMM dd'),
    lpRevenue: parseFloat(baseRevenue.toFixed(2)),
    adSpend: parseFloat(baseAdSpend.toFixed(2)),
    messagesSent: messages,
    messagesReplied: replied,
  };
});

export const pipelineLeads: Lead[] = [
  { id: '1', name: 'João Silva', status: 'Replied', deadline: '24h', value: 3000 },
  { id: '2', name: 'Maria Souza', status: 'Replied', deadline: '48h', value: 1500 },
  { id: '3', name: 'Tech Solutions', status: 'Closed', value: 2500 },
  { id: '4', name: 'Eduardo (Insta)', status: 'Closed', value: 1000 },
  { id: '5', name: 'Carlos (Whats)', status: 'Ignored' },
  { id: '6', name: 'Ana Costa', status: 'Ignored' },
  { id: '7', name: 'Pedro M.', status: 'Ignored' },
];
