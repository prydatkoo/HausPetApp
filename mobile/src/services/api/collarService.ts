import { Collar, CollarSettings } from '../../types';
import { API_ENDPOINTS } from '../../constants';
import apiClient from './apiClient';

class CollarService {
  async scanForCollars(): Promise<Collar[]> {
    // Demo scan: return an empty list as placeholder
    return [];
  }

  async connectToCollar(collarId: string): Promise<Collar> {
    const status = await this.getStatus(collarId);
    return { ...status, bluetoothConnected: true };
  }

  async disconnectFromCollar(_collarId: string): Promise<void> {
    // no-op demo
  }

  async getStatus(collarId: string): Promise<Collar> {
    const endpoint = API_ENDPOINTS.COLLAR.STATUS.replace(':id', collarId);
    const response = await apiClient.get<Collar>(endpoint);
    return {
      ...response,
      lastSync: new Date(response.lastSync),
    };
  }

  async updateSettings(collarId: string, settings: Partial<CollarSettings>): Promise<Collar> {
    const endpoint = API_ENDPOINTS.COLLAR.SETTINGS.replace(':id', collarId);
    const updated = await apiClient.put<Collar>(endpoint, settings);
    return { ...updated, lastSync: new Date(updated.lastSync) };
  }

  async checkFirmwareUpdate(_collarId: string): Promise<{ available: boolean; version: string; downloadProgress: number; installProgress: number; isInstalling: boolean; }>{
    return { available: false, version: 'latest', downloadProgress: 0, installProgress: 0, isInstalling: false };
  }

  async installFirmwareUpdate(_collarId: string): Promise<void> {
    // no-op demo
  }

  async sendCommand(_collarId: string, _command: string, _params?: any): Promise<{ success: boolean }>{
    return { success: true };
  }
}

export default new CollarService();
