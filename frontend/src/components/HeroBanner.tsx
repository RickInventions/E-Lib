import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

export default function HeroBanner() {
  const navigate = useNavigate();
  // const { isAuthenticated, showAuthModal } = useAuth();

  return (
    <div className="bg-blue-600 text-white py-16">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6">Welcome to the Online Library</h1>
        <div className="max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search Book Titles, Authors, Publishers..."
            className="w-full p-3 rounded-l focus:outline-none text-gray-800"
            // onClick={() => !isAuthenticated && showAuthModal()}
            // readOnly={!isAuthenticated}
          />
          <button 
            className="bg-blue-800 p-3 rounded-r hover:bg-blue-900"
            // onClick={() => !isAuthenticated && showAuthModal()}
          >
            Search
          </button>
        </div>
        <button 
          className="mt-6 bg-white text-blue-800 px-6 py-2 rounded font-medium hover:bg-gray-100"
          onClick={() => navigate('/books')}
        >
          View Categories
        </button>
      </div>
    </div>
  );
}