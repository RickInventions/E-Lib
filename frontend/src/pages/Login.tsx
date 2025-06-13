import { useState } from "react";
import api from "../services/api";

// pages/Login.tsx
const Login = () => {
  const [username, setusername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      interface LoginResponse {
        token: string;
        // add other fields if needed
      }
      const res = await api.post<LoginResponse>('/auth/login/', { username, password });
      localStorage.setItem('token', res.data.token);  // Store token
      window.location.href = '/dashboard';  // Redirect
    } catch (err) {
      alert('Login failed!');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-10">
      <input 
        type="text" 
        value={username} 
        onChange={(e) => setusername(e.target.value)} 
        className="w-full p-2 mb-4 border rounded"
        placeholder="Enter Username"
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        className="w-full p-2 mb-4 border rounded"
        placeholder="Enter Password"
      />
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
        Login
      </button>
    </form>
  );
};

export default Login;