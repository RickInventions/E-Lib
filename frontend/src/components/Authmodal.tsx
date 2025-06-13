// AuthModal.tsx
type Props = {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;  // New prop
  onRegisterClick: () => void;  // New prop
};

export default function AuthModal({ 
  isOpen, 
  onClose,
  onLoginClick,
  onRegisterClick 
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">Account Required</h2>
        <p className="mb-6">You need an account to access this feature.</p>
        <div className="flex space-x-4">
          <button
            onClick={onLoginClick}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Sign In
          </button>
          <button
            onClick={onRegisterClick}
            className="flex-1 bg-gray-200 py-2 rounded hover:bg-gray-300"
          >
            Register
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-4 text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}