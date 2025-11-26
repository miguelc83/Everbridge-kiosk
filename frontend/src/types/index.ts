/**
 * Type definitions for Everbridge Kiosk
 */

export const CriticalityLevel = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical"
} as const;

export type CriticalityLevel = typeof CriticalityLevel[keyof typeof CriticalityLevel];

export interface NotificationTemplate {
  id: string;
  name: string;
  description?: string;
  criticality: CriticalityLevel;
  message_subject?: string;
  message_body?: string;
  contact_paths?: string[];
  variables?: Record<string, any>;
}

export interface NotificationRequest {
  template_id: string;
  variables?: Record<string, any>;
  confirmation_count: number;
}

export interface NotificationStatus {
  id: string;
  template_name: string;
  status: string;
  sent_at: string;
  recipients_count?: number;
  delivered_count?: number;
  failed_count?: number;
  details?: Record<string, any>;
}

export interface ConfirmationResponse {
  required_confirmations: number;
  current_confirmations: number;
  can_proceed: boolean;
  message: string;
}
