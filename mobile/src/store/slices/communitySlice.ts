import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CommunityPost, Comment, PetSitter, Review } from '../../types';
import CommunityService from '../../services/api/communityService';

interface CommunityState {
  posts: CommunityPost[];
  petSitters: PetSitter[];
  userPosts: CommunityPost[];
  bookmarks: string[]; // post IDs
  isLoading: boolean;
  error: string | null;
  searchResults: SearchResults;
}

interface SearchResults {
  posts: CommunityPost[];
  petSitters: PetSitter[];
  isSearching: boolean;
}

const initialState: CommunityState = {
  posts: [],
  petSitters: [],
  userPosts: [],
  bookmarks: [],
  isLoading: false,
  error: null,
  searchResults: {
    posts: [],
    petSitters: [],
    isSearching: false,
  },
};

// Async thunks
export const fetchCommunityPosts = createAsyncThunk(
  'community/fetchPosts',
  async ({ page = 1, limit = 20 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const posts = await CommunityService.getPosts(page, limit);
      return { posts, page };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch community posts');
    }
  }
);

export const createPost = createAsyncThunk(
  'community/createPost',
  async (postData: Omit<CommunityPost, 'id' | 'createdAt' | 'likes' | 'comments'>, { rejectWithValue }) => {
    try {
      const post = await CommunityService.createPost(postData);
      return post;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create post');
    }
  }
);

export const likePost = createAsyncThunk(
  'community/likePost',
  async (postId: string, { rejectWithValue }) => {
    try {
      const updatedPost = await CommunityService.likePost(postId);
      return updatedPost;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to like post');
    }
  }
);

export const unlikePost = createAsyncThunk(
  'community/unlikePost',
  async (postId: string, { rejectWithValue }) => {
    try {
      const updatedPost = await CommunityService.unlikePost(postId);
      return updatedPost;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to unlike post');
    }
  }
);

export const addComment = createAsyncThunk(
  'community/addComment',
  async ({ postId, content }: { postId: string; content: string }, { rejectWithValue }) => {
    try {
      const comment = await CommunityService.addComment(postId, content);
      return { postId, comment };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add comment');
    }
  }
);

export const fetchPetSitters = createAsyncThunk(
  'community/fetchPetSitters',
  async ({ location, radius = 10 }: { location: { latitude: number; longitude: number }; radius?: number } = { location: { latitude: 0, longitude: 0 } }, { rejectWithValue }) => {
    try {
      // For mock server, directly fetch from /sitters endpoint
      const response = await fetch('http://192.168.13.23:8080/sitters');
      if (!response.ok) {
        throw new Error('Failed to fetch sitters');
      }
      const petSitters = await response.json();
      return petSitters;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch pet sitters');
    }
  }
);

export const bookPetSitter = createAsyncThunk(
  'community/bookPetSitter',
  async ({ sitterId, petId, serviceType, date, duration }: {
    sitterId: string;
    petId: string;
    serviceType: string;
    date: Date;
    duration: number;
  }, { rejectWithValue }) => {
    try {
      const booking = await CommunityService.bookPetSitter(sitterId, petId, serviceType, date, duration);
      return booking;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to book pet sitter');
    }
  }
);

export const addReview = createAsyncThunk(
  'community/addReview',
  async ({ sitterId, rating, comment, petId }: {
    sitterId: string;
    rating: number;
    comment: string;
    petId: string;
  }, { rejectWithValue }) => {
    try {
      const review = await CommunityService.addReview(sitterId, rating, comment, petId);
      return { sitterId, review };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add review');
    }
  }
);

export const searchContent = createAsyncThunk(
  'community/searchContent',
  async ({ query, type }: { query: string; type: 'posts' | 'sitters' | 'all' }, { rejectWithValue }) => {
    try {
      const results = await CommunityService.searchContent(query, type);
      return results;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Search failed');
    }
  }
);

export const fetchUserPosts = createAsyncThunk(
  'community/fetchUserPosts',
  async (userId: string, { rejectWithValue }) => {
    try {
      const posts = await CommunityService.getUserPosts(userId);
      return posts;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user posts');
    }
  }
);

const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    bookmarkPost: (state, action: PayloadAction<string>) => {
      if (!state.bookmarks.includes(action.payload)) {
        state.bookmarks.push(action.payload);
      }
    },
    unbookmarkPost: (state, action: PayloadAction<string>) => {
      state.bookmarks = state.bookmarks.filter(id => id !== action.payload);
    },
    clearSearchResults: (state) => {
      state.searchResults = {
        posts: [],
        petSitters: [],
        isSearching: false,
      };
    },
    updatePost: (state, action: PayloadAction<CommunityPost>) => {
      const index = state.posts.findIndex(post => post.id === action.payload.id);
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
      const userPostIndex = state.userPosts.findIndex(post => post.id === action.payload.id);
      if (userPostIndex !== -1) {
        state.userPosts[userPostIndex] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch community posts
    builder
      .addCase(fetchCommunityPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCommunityPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        const { posts, page } = action.payload;
        if (page === 1) {
          state.posts = posts;
        } else {
          state.posts.push(...posts);
        }
        state.error = null;
      })
      .addCase(fetchCommunityPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create post
    builder
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
        state.userPosts.unshift(action.payload);
      });

    // Like/Unlike post
    builder
      .addCase(likePost.fulfilled, (state, action) => {
        const post = state.posts.find(p => p.id === action.payload.id);
        if (post) {
          post.likes = action.payload.likes;
        }
      })
      .addCase(unlikePost.fulfilled, (state, action) => {
        const post = state.posts.find(p => p.id === action.payload.id);
        if (post) {
          post.likes = action.payload.likes;
        }
      });

    // Add comment
    builder
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        const post = state.posts.find(p => p.id === postId);
        if (post) {
          post.comments.push(comment);
        }
      });

    // Fetch pet sitters
    builder
      .addCase(fetchPetSitters.fulfilled, (state, action) => {
        state.petSitters = action.payload;
      });

    // Add review
    builder
      .addCase(addReview.fulfilled, (state, action) => {
        const { sitterId, review } = action.payload;
        const sitter = state.petSitters.find(s => s.id === sitterId);
        if (sitter) {
          sitter.reviews.push(review);
          // Recalculate rating
          const totalRating = sitter.reviews.reduce((sum, r) => sum + r.rating, 0);
          sitter.rating = totalRating / sitter.reviews.length;
        }
      });

    // Search
    builder
      .addCase(searchContent.pending, (state) => {
        state.searchResults.isSearching = true;
      })
      .addCase(searchContent.fulfilled, (state, action) => {
        state.searchResults.isSearching = false;
        state.searchResults.posts = action.payload.posts || [];
        state.searchResults.petSitters = action.payload.petSitters || [];
      })
      .addCase(searchContent.rejected, (state) => {
        state.searchResults.isSearching = false;
        state.searchResults.posts = [];
        state.searchResults.petSitters = [];
      });

    // Fetch user posts
    builder
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.userPosts = action.payload;
      });
  },
});

export const {
  clearError,
  bookmarkPost,
  unbookmarkPost,
  clearSearchResults,
  updatePost,
} = communitySlice.actions;

export default communitySlice.reducer;