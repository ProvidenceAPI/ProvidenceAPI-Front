import api from './api';

export const authService = {
  // Login - según tu LocalStrategy
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });
      
      // Tu backend probablemente devuelve access_token
      if (response.access_token) {
        localStorage.setItem('providence_token', response.access_token);
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error.response?.data || error.message;
    }
  },

  // Register - según tu SignupDto
  register: async (userData) => {
    try {
      const response = await api.post('/auth/signin', userData);
      
      if (response.access_token) {
        localStorage.setItem('providence_token', response.access_token);
      }
      
      return response;
    } catch (error) {
      console.error('Register error:', error);
      throw error.response?.data || error.message;
    }
  },

  // Obtener mi perfil - según tu endpoint GET /users/me
  getMyProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error.response?.data || error.message;
    }
  },

  // Actualizar perfil - según tu endpoint PUT /users/me
  updateProfile: async (data) => {
    try {
      const response = await api.put('/users/profile', data);
      return response;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error.response?.data || error.message;
    }
  },

  // Cambiar contraseña (necesitarías crear este endpoint)
  changePassword: async (data) => {
    try {
      // Necesitas crear PUT /users/me/password en tu backend
      const response = await api.put('/users/profile/password', data);
      return response;
    } catch (error) {
      console.error('Change password error:', error);
      throw error.response?.data || error.message;
    }
  },

  // Subir imagen (probablemente necesitas endpoint)
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Necesitas crear POST /upload o similar
      const response = await api.put('users/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response
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

  // Cerrar sesión
  logout: () => {
    localStorage.removeItem('providence_token');
  },

  // Verificar autenticación
  checkAuth: () => {
    return !!localStorage.getItem('providence_token');
  }
};