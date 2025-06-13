import React, { useEffect, useState } from 'react';
import BookCard from '../components/BookCard';
import api from '../services/api';

interface Book {
  id: number;
  title: string;
  author: string;
  cover_image: string;
}
// pages/Dashboard.tsx
const Dashboard = () => {
  const [userBooks, setUserBooks] = useState<Book[]>([]);

  useEffect(() => {
    api.get<Book[]>('/user/books/').then(res => setUserBooks(res.data));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Your Books</h1>
      <div className="grid grid-cols-3 gap-4">
        {userBooks.map(book => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard; // Proper export