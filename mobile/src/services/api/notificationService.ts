import { Notification } from '../../types';
import { API_ENDPOINTS } from '../../constants';
import apiClient from './apiClient';

class NotificationService {
  async getNotifications(page: number = 1, limit: number = 50): Promise<Notification[]> {
    const response = await apiClient.get<Notification[]>(
      `${API_ENDPOINTS.NOTIFICATIONS.LIST}?page=${page}&limit=${limit}`
    );
    return response.map(notification => ({
      ...notification,
      createdAt: new Date(notification.createdAt),
    }));
  }

  async markAsRead(notificationId: string): Promise<void> {
    const endpoint = API_ENDPOINTS.NOTIFICATIONS.MARK_READ.replace(':id', notificationId);
    await apiClient.post(endpoint, {});
  }

  async markAllAsRead(): Promise<void> {
    await apiClient.post(`${API_ENDPOINTS.NOTIFICATIONS.LIST}/read-all`, {});
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.NOTIFICATIONS.LIST}/${notificationId}`);
  }

  async updateSettings(settings: Partial<{ [K in keyof NotificationServiceSettings]: boolean }>): Promise<NotificationServiceSettings> {
    return apiClient.put<NotificationServiceSettings>(API_ENDPOINTS.NOTIFICATIONS.SETTINGS, settings);
  }

  async sendTestNotification(): Promise<void> {
    await apiClient.post(`${API_ENDPOINTS.NOTIFICATIONS.LIST}/test`, {});
  }
}

interface NotificationServiceSettings {
  healthAlerts: boolean;
  locationAlerts: boolean;
  batteryAlerts: boolean;
  collarAlerts: boolean;
  appointmentReminders: boolean;
  socialUpdates: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

export default new NotificationService();
