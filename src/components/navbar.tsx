import { Link } from "@tanstack/react-router"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { signOut } from "@/lib/supabase"
import { toast } from "sonner"

export function Navbar({ className }: { className?: string }) {
  const { user, isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success("Signed out successfully")
    } catch (error) {
      console.error("Sign out error:", error)
      toast.error("Failed to sign out")
    }
  }

  return (
    <nav className={cn("fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b bg-background/80 px-6 py-4 backdrop-blur-md", className)}>
      <Link to="/" className="flex items-center gap-2">
        <img src="../../public/logo.jpg" alt="Gvu Logo" className="size-8" />
        <span className="lg:text-xl font-bold">GVU Votes</span>
      </Link>

      <div className="hidden md:flex items-center gap-4">
        <Link to="/leaderboard" className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}>
          Leaderboard
        </Link>
        <Link to="/register" className={cn(buttonVariants({ variant: "default", size: "lg" }), "text-base")}>
          Register
        </Link>
      </div>

      <div className="hidden md:flex items-center justify-end">
        {isAuthenticated && user ? (
          <Avatar className="size-9">
            <AvatarImage src={user.user_metadata.avatar_url} alt={user.user_metadata.full_name} />
            <AvatarFallback>{user.user_metadata.full_name?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
          </Avatar>
        ) : (
          <Link to="/" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            Sign In
          </Link>
        )}
      </div>

      <button
        className="md:hidden p-2"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-background border-b p-4 flex flex-col gap-4 md:hidden">
          <Link to="/leaderboard" className={cn(buttonVariants({ variant: "ghost", size: "lg" }))} onClick={() => setIsOpen(false)}>
            Leaderboard
          </Link>
          <Link to="/register" className={cn(buttonVariants({ variant: "default", size: "lg" }), "text-base")} onClick={() => setIsOpen(false)}>
            Register
          </Link>
          <div className="flex items-center gap-4 border-t pt-4">
            {isAuthenticated && user ? (
              <>
                <Avatar className="size-9">
                  <AvatarImage src={user.user_metadata.avatar_url} alt={user.user_metadata.full_name} />
                  <AvatarFallback>{user.user_metadata.full_name?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">{user.user_metadata.full_name || user.email}</span>
                <button onClick={handleSignOut} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "ml-auto")}>
                  Logout
                </button>
              </>
            ) : (
              <Link to="/" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))} onClick={() => setIsOpen(false)}>
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}