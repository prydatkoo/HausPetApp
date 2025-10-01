import { APP_CONFIG, STORAGE_KEYS } from '../../constants';
import { getItemAsync } from 'expo-secure-store';

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = APP_CONFIG.apiBaseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    
    // Always fetch the latest token from storage before a request
    let token = await getItemAsync(STORAGE_KEYS.USER_TOKEN);

    // Allow demo/guest access for AI/chat endpoints by attaching a demo token when missing
    if (!token) {
      const isAiOrCommunityEndpoint = /^(\/api\/v1\/(ai|community)\/|.*\/ai\/chat)/.test(endpoint);
      if (isAiOrCommunityEndpoint) {
        token = 'demo-token';
      }
    }

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    const maxAttempts = 3;
    let attempt = 0;
    let lastError: any = null;
    while (attempt < maxAttempts) {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        const errorMessage = (errorData && (errorData.message || errorData.error)) || response.statusText || 'An unknown error occurred';
        // Quiet expected 404s (e.g., missing current location/health) in development by suppressing the warning
        if (response.status === 404) {
          const suppress404Warning = /\/pets\/[^/]+\/(location|health)\/current$/.test(url);
          if (!suppress404Warning) {
            if (typeof __DEV__ !== 'undefined' && __DEV__) {
              console.warn(`API 404: ${url} — ${errorData?.message || 'Not found'}`);
            }
          }
        } else {
          console.warn(`API Error: ${response.status} ${response.statusText} for ${url}`);
          if (typeof __DEV__ !== 'undefined' && __DEV__) {
            const message = typeof errorData === 'object' ? (errorData.message || errorData.error || 'Unknown error') : String(errorData);
            console.warn('API error message:', message);
          }
        }
        const error: any = new Error(errorMessage);
        error.status = response.status;
        // Retry transient server errors
        if ([500, 502, 503, 504].includes(response.status) && attempt < maxAttempts - 1) {
          const backoffMs = 300 * Math.pow(2, attempt);
          await new Promise(res => setTimeout(res, backoffMs));
          attempt += 1;
          lastError = error;
          continue;
        }
        throw error;
      }

      if (response.status === 204) {
        return {} as T;
      }

      return response.json();
    }

    throw lastError || new Error('Unknown network error');
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export default new ApiClient();
