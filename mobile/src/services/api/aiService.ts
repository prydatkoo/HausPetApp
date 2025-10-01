import apiClient from './apiClient';
import { API_ENDPOINTS } from '../../constants';

class AIService {
  async chat(message: string): Promise<string> {
    try {
      const res = await apiClient.post<{ reply: string }>(API_ENDPOINTS.COMMUNITY.AI_CHAT, { message });
      return res.reply || 'Sorry, I did not get that.';
    } catch (e: any) {
      return e?.message || 'Network error. Please try again.';
    }
  }
}

export default new AIService();


