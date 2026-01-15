import api from './api';

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/signin', {
        email,
        password
      });

      if (response.access_token) {
        localStorage.setItem('providence_token', response.data.access_token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error.response?.data || error.message;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error.response?.data || error.message;
    }
  },

  getMyProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error.response?.data || error.message;
    }
  },

  updateProfile: async (data) => {
    try {
      const response = await api.put('/users/profile', data);
      return response;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error.response?.data || error.message;
    }
  },

  changePassword: async (data) => {
    try {
      const response = await api.put('/users/profile/password', data);
      return response;
    } catch (error) {
      console.error('Change password error:', error);
      throw error.response?.data || error.message;
    }
  },

  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await api.put('/users/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.url || response.profileImage;
    } catch (error) {
      console.error('Upload image error:', error);
      throw error.response?.data || error.message;
    }
  },

  updateProfileImageUrl: async (imageUrl) => {
    try {
      const response = await api.put('/users/profile/image-url', {
        imageUrl
      });
      return response;
    } catch (error) {
      console.error('Update image URL error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('providence_token');
  },

  checkAuth: () => {
    return !!localStorage.getItem('providence_token');
  }
};
