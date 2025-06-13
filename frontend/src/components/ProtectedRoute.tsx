// components/ProtectedRoute.tsx
import { Navigate, Outlet, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  return token ? <Outlet /> : <Navigate to="/login" />;
};

// Usage in App.tsx
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
</Route>