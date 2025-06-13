import { useState } from "react";
import api from "../services/api";

// components/SearchBar.tsx
const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <input
      type="text"
      placeholder="Search books..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full p-2 border rounded"
    />
  );
};
// API call with search
// api.get(`/books/?search=${searchTerm}`);
export default SearchBar;