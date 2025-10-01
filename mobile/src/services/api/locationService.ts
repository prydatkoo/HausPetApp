import { LocationData, SafeZone } from '../../types';
import { API_ENDPOINTS } from '../../constants';
import apiClient from './apiClient';

class LocationService {
  async getCurrentLocation(petId: string): Promise<LocationData> {
    const endpoint = API_ENDPOINTS.PETS.LOCATION_DATA.replace(':id', petId);
    const response = await apiClient.get<LocationData>(`${endpoint}/current`);
    return {
      ...response,
      timestamp: new Date(response.timestamp),
    };
  }

  async getLocationHistory(petId: string, timeRange: 'day' | 'week' | 'month'): Promise<LocationData[]> {
    const endpoint = API_ENDPOINTS.PETS.LOCATION_DATA.replace(':id', petId);
    const response = await apiClient.get<LocationData[]>(`${endpoint}?range=${timeRange}`);
    return response.map(item => ({ ...item, timestamp: new Date(item.timestamp) }));
  }

  async createSafeZone(safeZone: Omit<SafeZone, 'id' | 'createdAt'>): Promise<SafeZone> {
    const created = await apiClient.post<SafeZone>(`/location/safe-zones`, safeZone);
    return { ...created, createdAt: new Date(created.createdAt) };
  }

  async updateSafeZone(id: string, data: Partial<SafeZone>): Promise<SafeZone> {
    const updated = await apiClient.put<SafeZone>(`/location/safe-zones/${id}`, data);
    return { ...updated, createdAt: new Date(updated.createdAt) };
  }

  async deleteSafeZone(id: string): Promise<void> {
    await apiClient.delete(`/location/safe-zones/${id}`);
  }

  async getSafeZones(): Promise<SafeZone[]> {
    const zones = await apiClient.get<SafeZone[]>(`/location/safe-zones`);
    return zones.map(z => ({ ...z, createdAt: new Date(z.createdAt) }));
  }

  async activateLostPetMode(_petId: string): Promise<void> {
    // no-op demo
  }

  async deactivateLostPetMode(_petId: string): Promise<void> {
    // no-op demo
  }
}

export default new LocationService();
