// lib/guestAPI.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const guestApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const guestAPI = {
  // Book endpoints
  getBooks: async (category?: string) => {
    const params = category ? { category } : {};
    return guestApi.get('/books/', { params });
  },

  getBookByUuid: async (uuid: string) => {
    return guestApi.get(`/books/${uuid}/`);
  },

  getEBooks: async () => {
    return guestApi.get('/books/ebooks/');
  },

  // Video endpoints
  getVideos: async (category?: string) => {
    const params = category ? { category } : {};
    return guestApi.get('/videos/', { params });
  },

  getVideoByUuid: async (uuid: string) => {
    return guestApi.get(`/videos/${uuid}/`);
  },

  // Category endpoints
  getCategories: async () => {
    return guestApi.get('/categories/');
  },

  // Contact form
  submitContact: async (data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) => {
    return guestApi.post('/contact/', data);
  },
};