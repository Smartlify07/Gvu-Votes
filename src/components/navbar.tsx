import { Link } from "@tanstack/react-router"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Navbar({ className }: { className?: string }) {
  const { user, isAuthenticated } = useAuth()

  return (
    <nav className={cn("fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b bg-background/80 px-6 py-4 backdrop-blur-md", className)}>
      <Link to="/" className="flex items-center gap-2">
        <img src="../../public/logo.jpg" alt="Gvu Logo" className="size-8" />
        <span className="lg:text-xl font-bold">GVU Votes</span>
      </Link>
      <div className="flex items-center gap-4">
        <Link to="/leaderboard" className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}>
          Leaderboard
        </Link>
        <Link to="/register" className={cn(buttonVariants({ variant: "default", size: "lg" }), "text-base")}>
          Register
        </Link>
      </div>
      <div className="flex items-center justify-end">
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
    </nav>
  )
}