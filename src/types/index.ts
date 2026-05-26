export interface DailyMetrics {
  day: number;
  date: string;
  lpRevenue: number;
  adSpend: number;
  messagesSent: number;
  messagesReplied: number;
}

export type LeadStatus = 'Replied' | 'Ignored' | 'Closed' | 'Promised';

export interface Lead {
  id: string;
  name: string;
  status: LeadStatus;
  deadline?: string; 
  value?: number;
  promiseDate?: string;
}
