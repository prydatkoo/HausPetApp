import { HealthData } from '../../types';
import { API_ENDPOINTS } from '../../constants';
import apiClient from './apiClient';

class HealthService {
  async getHealthData(petId: string, timeRange: 'day' | 'week' | 'month'): Promise<HealthData[]> {
    const endpoint = API_ENDPOINTS.PETS.HEALTH_DATA.replace(':id', petId);
    const response = await apiClient.get<HealthData[]>(`${endpoint}?range=${timeRange}`);
    return response.map(item => ({
      ...item,
      timestamp: new Date(item.timestamp),
    }));
  }

  async getCurrentHealthData(petId: string): Promise<HealthData> {
    const endpoint = API_ENDPOINTS.PETS.HEALTH_DATA.replace(':id', petId);
    const item = await apiClient.get<HealthData>(`${endpoint}/current`);
    return { ...item, timestamp: new Date(item.timestamp) };
  }

  async createHealthAlert(alert: any): Promise<any> {
    // Placeholder endpoint; returns alert with an id
    const created = await apiClient.post<any>(`/health/alerts`, alert);
    return { ...created, timestamp: new Date(created.timestamp) };
  }

  async markAlertAsRead(alertId: string): Promise<void> {
    await apiClient.post(`/health/alerts/${alertId}/read`, {});
  }
}

export default new HealthService();
