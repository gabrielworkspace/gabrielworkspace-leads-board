export interface DailyMetrics {
  date: string;
  lpRevenue: number;
  adSpend: number;
  messagesSent: number;
  messagesReplied: number;
}

export type LeadStatus = 'Replied' | 'Ignored' | 'Refused' | 'Closed' | 'Promised';
export type ServiceType = 'Landing Page' | 'Social Media' | 'SaaS';

export interface Lead {
  id: string;
  name: string;
  status: LeadStatus;
  serviceType?: ServiceType;
  deadline?: string; 
  value?: number;
  promiseDate?: string;
  created_at?: string;
  observations?: string;
}
