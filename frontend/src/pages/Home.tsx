// pages/Home.tsx
import { useState, useEffect } from 'react';
import BookCard from '../components/BookCard';
import Footer from '../components/Footer';
import HeroBanner from '../components/HeroBanner';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import BriefContact from '../components/BriefContatct';
type Book = {
    id: number;
  title: string;
  author: string;
  cover_image: string;
};
export default function Home() {
  const { showAuthModal, isAuthenticated } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    api.get<Book[]>('/books/?featured=true').then(res => setBooks(res.data));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <HeroBanner />
      <main className="flex-grow container mx-auto py-8">
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Books</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {books.map(book => (
              <BookCard 
                key={book.id} 
                book={book}
                onClick={() => !isAuthenticated && showAuthModal()}
              />
            ))}
          </div>
        </section>
      </main>
      <BriefContact />
      <Footer />
    </div>
  );
}