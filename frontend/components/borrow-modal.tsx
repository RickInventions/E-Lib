import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { borrowBook } from "@/lib/api"
import type { Book, BorrowResponse } from "@/lib/types"
import { toast } from "@/hooks/use-toast"

interface BorrowModalProps {
  book: Book
  onBorrowSuccess: (response: BorrowResponse) => void
  children: React.ReactNode
}

export function BorrowModal({ book, onBorrowSuccess, children }: BorrowModalProps) {
  const [open, setOpen] = useState(false)
  const [days, setDays] = useState(7)
  const [isLoading, setIsLoading] = useState(false)

  const handleBorrow = async () => {
    if (!book.is_available || book.available_copies <= 0) {
      toast({
        title: "Book not available",
        description: "This book is currently not available for borrowing",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await borrowBook(book.book_uuid, days)
toast({
  title: "✅ Book Borrowed!",
  description: `You've successfully borrowed "${book.title}" for ${days} days. Due on ${new Date(response.due_date).toLocaleDateString()}`,
  duration: 5000,
});
      onBorrowSuccess(response)
      setOpen(false)
    } catch (error: any) {
  let message = error.message || "Failed to borrow book";
  
  if (message.includes("already have an active borrow")) {
    message = "You already have this book checked out";
  }
  
  toast({
    title: "Borrow Failed",
    description: message,
    variant: "destructive",
  });

    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Borrow "{book.title}"</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div>
            <p className="text-sm text-gray-500 mb-2">
              How many days would you like to borrow this book?
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm">1 day</span>
              <Slider 
                min={1}
                max={30}
                step={1}
                value={[days]}
                onValueChange={([value]) => setDays(value)}
                className="w-3/4"
              />
              <span className="text-sm">{days} days</span>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-sm text-blue-700">
              Please note: Books must be returned within {days} days. Late returns may incur penalties.
            </p>
          </div>
          
          <Button 
            onClick={handleBorrow} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Processing..." : "Confirm Borrow"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}