// components/BookCard.tsx
type Book = {
  id: number;
  title: string;
  author: string;
  cover_image: string;
};

type BookCardProps = {
  book: Book;
  onClick?: () => void; // Make optional
};

export default function BookCard({ book, onClick }: BookCardProps) {
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
      onClick={onClick} // Add onClick handler
    >
      <img 
        src={`http://localhost:8000${book.cover_image}`}
        alt={book.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-bold text-lg">{book.title}</h3>
        <p className="text-gray-600">{book.author}</p>
      </div>
    </div>
  );
}