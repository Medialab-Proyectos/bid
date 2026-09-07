export interface NotificationEmail {
  id: string;
  source: string;
  toAddresses: string[];
  ccAddresses: string[];
  bccAddresses: string[];
  subjectDecode: string;
  bodyDecode: string;
  createDate: string;
  language: string;
  formattedCreatedDate?: string;
  formattedEmails?: string;
  paddingBottom?: number;
}

export interface NotificationEmailResponse {
  notifications: NotificationEmail[];
  totalResult: number;
}

export interface NotificationsRequest {
  filterDate: Date;
  filterText: string;
  page: number;
  size: number;
}
