// context/AuthContext.tsx
import { createContext, useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../components/Authmodal';

type AuthContextType = {
  isAuthenticated: boolean;
  showAuthModal: () => void;
  hideAuthModal: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

// Add proper type for children
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [isAuthenticated] = useState(false); // Remove setter if unused
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showAuthModal = useCallback(() => setIsModalOpen(true), []);
  const hideAuthModal = useCallback(() => setIsModalOpen(false), []);

  const handleLoginClick = useCallback(() => {
    hideAuthModal();
    navigate('/login');
  }, [navigate, hideAuthModal]);

  const handleRegisterClick = useCallback(() => {
    hideAuthModal();
    navigate('/register');
  }, [navigate, hideAuthModal]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, showAuthModal, hideAuthModal }}>
      {children}
      <AuthModal 
        isOpen={isModalOpen}
        onClose={hideAuthModal}
        onLoginClick={handleLoginClick}
        onRegisterClick={handleRegisterClick}
      />
    </AuthContext.Provider>
  );
}

// Add this export
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}