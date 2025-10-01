import { API_ENDPOINTS } from '../../constants';
import apiClient from './apiClient';
import { CommunityPost, Comment, PetSitter, Review } from '../../types';

class CommunityService {
  async sendChatMessage(message: string, petId: string | null): Promise<{ response: string; context_used: boolean, condition_detected: string | null }> {
    const endpoint = API_ENDPOINTS.COMMUNITY.AI_CHAT;
    return apiClient.post(endpoint, { message, pet_id: petId });
  }

  async getPosts(page: number = 1, limit: number = 20): Promise<CommunityPost[]> {
    const endpoint = `${API_ENDPOINTS.COMMUNITY.POSTS}?page=${page}&limit=${limit}`;
    return apiClient.get<CommunityPost[]>(endpoint);
  }

  async createPost(postData: Omit<CommunityPost, 'id' | 'createdAt' | 'likes' | 'comments'>): Promise<CommunityPost> {
    return apiClient.post<CommunityPost>(API_ENDPOINTS.COMMUNITY.POSTS, postData);
  }

  async likePost(postId: string): Promise<CommunityPost> {
    return apiClient.post<CommunityPost>(`${API_ENDPOINTS.COMMUNITY.POSTS}/${postId}/like`, {});
  }

  async unlikePost(postId: string): Promise<CommunityPost> {
    return apiClient.post<CommunityPost>(`${API_ENDPOINTS.COMMUNITY.POSTS}/${postId}/unlike`, {});
  }

  async addComment(postId: string, content: string): Promise<Comment> {
    return apiClient.post<Comment>(`${API_ENDPOINTS.COMMUNITY.POSTS}/${postId}/comments`, { content });
  }

  async bookPetSitter(sitterId: string, petId: string, serviceType: string, date: Date, duration: number): Promise<any> {
    return apiClient.post(`${API_ENDPOINTS.COMMUNITY.PET_SITTERS}/${sitterId}/book`, { petId, serviceType, date, duration });
  }

  async addReview(sitterId: string, rating: number, comment: string, petId: string): Promise<Review> {
    return apiClient.post<Review>(`${API_ENDPOINTS.COMMUNITY.REVIEWS}`, { sitterId, rating, comment, petId });
  }

  async searchContent(query: string, type: 'posts' | 'sitters' | 'all'): Promise<{ posts?: CommunityPost[]; petSitters?: PetSitter[] }> {
    return apiClient.get(`${API_ENDPOINTS.COMMUNITY.POSTS}/search?query=${encodeURIComponent(query)}&type=${type}`);
  }

  async getUserPosts(userId: string): Promise<CommunityPost[]> {
    return apiClient.get<CommunityPost[]>(`${API_ENDPOINTS.COMMUNITY.POSTS}?userId=${userId}`);
  }
}

export default new CommunityService();
