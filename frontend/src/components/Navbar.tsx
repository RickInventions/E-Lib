import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, showAuthModal } = useAuth(); // Destructure showAuthModal

  return (
    <nav className="bg-blue-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-2xl font-bold">E-Library</Link>
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/books" className="hover:underline">Books</Link>
          <Link to="#" onClick={(e) => {
            e.preventDefault();
            if (!isAuthenticated) showAuthModal(); // Modal for guests
          }} className="hover:underline">Videos</Link>
          <Link to="/about" className="hover:underline">About</Link>
        </div>
        <div className="space-x-4">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="bg-white text-blue-800 px-4 py-2 rounded hover:bg-gray-100">Login</Link>
              <Link to="/register" className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">Register</Link>
            </>
          ) : (
            <Link to="/dashboard" className="bg-green-600 px-4 py-2 rounded hover:bg-green-700">Dashboard</Link>
          )}
        </div>
      </div>
    </nav>
  );
}