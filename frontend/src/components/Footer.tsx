import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white p-6">
      <div className="container mx-auto flex justify-between">
        <div>© 2025 E-Library</div>
        <div className="flex space-x-4">
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Privacy</a>
          <Link to="/register" className="hover:underline">Signup</Link>
          <Link to="/login" className="hover:underline">Login</Link>
        </div>
      </div>
    </footer>
  );
}