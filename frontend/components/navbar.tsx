"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { AuthModal } from "./auth-modal"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { BookOpen, User, LogOut, Menu, BookMarked, Settings } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleAuthRequired = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return false
    }
    return true
  }

  const NavLinks = ({ mobile = false, setShowAuthModal }: { mobile?: boolean, setShowAuthModal: (open: boolean) => void }) => (
    <>
      <Link href="/" className={`${mobile ? "block py-2" : ""} hover:text-primary transition-colors`}>
        Home
      </Link>
      <Link href="/books" className={`${mobile ? "block py-2" : ""} hover:text-primary transition-colors`}>
        Books
      </Link>
      <button
        className={`${mobile ? "block py-2 w-full text-left" : ""} hover:text-primary transition-colors`}
        onClick={(e) => {
          e.preventDefault();
          if (!isAuthenticated) {
            setShowAuthModal(true);
          } else {
            window.location.href = "/videos";
          }
        }}
      >
        Videos
      </button>

      {/* Show different navigation based on user role */}
      {isAuthenticated && user?.role === "admin" ? (
        // Admin Navigation
        <Link href="/admin" className={`${mobile ? "block py-2" : ""} hover:text-primary transition-colors`}>
          Admin Panel
        </Link>
      ) : (
        // Regular User Navigation
        <>
          <Link href="/contact" className={`${mobile ? "block py-2" : ""} hover:text-primary transition-colors`}>
            Contact
          </Link>
          {isAuthenticated && (
            <>
              <Link href="/dashboard" className={`${mobile ? "block py-2" : ""} hover:text-primary transition-colors`}>
                Dashboard
              </Link>
              <Link href="/my-books" className={`${mobile ? "block py-2" : ""} hover:text-primary transition-colors`}>
                My Books
              </Link>
            </>
          )}
        </>
      )}
    </>
  )

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-md border-b"
            : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 group">
              <BookOpen
                className={`h-6 w-6 transition-transform duration-300 ${isScrolled ? "scale-95" : "scale-100"} group-hover:scale-110`}
              />
              <span className={`font-bold text-xl transition-all duration-300 ${isScrolled ? "text-lg" : "text-xl"}`}>
                Digital Library
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
<NavLinks setShowAuthModal={setShowAuthModal} />
            </div>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full hover:scale-105 transition-transform"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>

                    {/* Show different dropdown items based on user role */}
                    {user?.role === "admin" ? (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="flex items-center">
                            <Settings className="mr-2 h-4 w-4" />
                            Admin Panel
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/books-to-return" className="flex items-center">
                            <BookMarked className="mr-2 h-4 w-4" />
                            Books to Return
                          </Link>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard" className="flex items-center">
                            <BookOpen className="mr-2 h-4 w-4" />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/my-books" className="flex items-center">
                            <BookMarked className="mr-2 h-4 w-4" />
                            My Books
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    <DropdownMenuItem onClick={logout} className="flex items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => setShowAuthModal(true)} className="hover:scale-105 transition-transform">
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile Navigation */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="hover:scale-105 transition-transform">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-4">
                  <NavLinks mobile setShowAuthModal={setShowAuthModal} />
                  {isAuthenticated ? (
                    <div className="pt-4 border-t">
                      <div className="flex items-center space-x-2 mb-4">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user?.name}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">{user?.role}</span>
                      </div>
                      <div className="space-y-2">
                        <Link href="/profile" className="block py-2 hover:text-primary transition-colors">
                          Profile
                        </Link>

                        {/* Show different mobile menu items based on user role */}
                        {user?.role === "admin" ? (
                          <>
                            <Link href="/admin" className="block py-2 hover:text-primary transition-colors">
                              Admin Panel
                            </Link>
                            <Link
                              href="/admin/books-to-return"
                              className="block py-2 hover:text-primary transition-colors"
                            >
                              Books to Return
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link href="/dashboard" className="block py-2 hover:text-primary transition-colors">
                              Dashboard
                            </Link>
                            <Link href="/my-books" className="block py-2 hover:text-primary transition-colors">
                              My Books
                            </Link>
                          </>
                        )}

                        <button
                          onClick={logout}
                          className="block py-2 hover:text-primary transition-colors text-left w-full"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Button onClick={() => setShowAuthModal(true)} className="mt-4">
                      Sign In
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-16" />

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  )
}
