/**
 * API client for Everbridge Kiosk backend
 */
import axios from 'axios';
import type {
  NotificationTemplate,
  NotificationRequest,
  NotificationStatus,
  ConfirmationResponse
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  /**
   * Get all notification templates
   */
  async getTemplates(): Promise<NotificationTemplate[]> {
    const response = await apiClient.get<NotificationTemplate[]>('/api/templates');
    return response.data;
  },

  /**
   * Get a specific template by ID
   */
  async getTemplate(templateId: string): Promise<NotificationTemplate> {
    const response = await apiClient.get<NotificationTemplate>(`/api/templates/${templateId}`);
    return response.data;
  },

  /**
   * Process confirmation for sending a notification
   */
  async confirmNotification(
    templateId: string,
    request: NotificationRequest
  ): Promise<ConfirmationResponse> {
    const response = await apiClient.post<ConfirmationResponse>(
      `/api/templates/${templateId}/confirm`,
      request
    );
    return response.data;
  },

  /**
   * Send a notification
   */
  async sendNotification(request: NotificationRequest): Promise<NotificationStatus> {
    const response = await apiClient.post<NotificationStatus>('/api/notifications/send', request);
    return response.data;
  },

  /**
   * Get notification status
   */
  async getNotificationStatus(notificationId: string): Promise<NotificationStatus> {
    const response = await apiClient.get<NotificationStatus>(
      `/api/notifications/${notificationId}/status`
    );
    return response.data;
  },

  /**
   * Get notification history
   */
  async getNotificationHistory(): Promise<NotificationStatus[]> {
    const response = await apiClient.get<NotificationStatus[]>('/api/notifications/history');
    return response.data;
  },
};

export default api;
