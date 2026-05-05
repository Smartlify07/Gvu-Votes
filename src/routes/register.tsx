import { createFileRoute } from "@tanstack/react-router"
import { RegisterForm } from "@/features/contestants/components/register-form"
import { Navbar } from "@/components/navbar"
import { VOTING_END_TIME } from "@/lib/constants"

export const Route = createFileRoute("/register")({
  component: RegisterPage,
})

function RegisterPage() {
  const formatTimeLeft = () => {
    const now = new Date()
    const diff = VOTING_END_TIME.getTime() - now.getTime()
    
    if (diff <= 0) {
      return "Voting ended"
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) {
      return `${days}d ${hours}h left`
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m left`
    }
    return `${minutes}m left`
  }
  
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />
      <div className="flex items-center min-h-screen justify-center p-4 md:p-12 pt-24 md:pt-28">
        <div className="w-full lg:max-w-2xl">
          <div className="absolute top-20 right-4 md:right-8 lg:right-12 flex items-center gap-2 text-sm md:text-base font-medium text-muted-foreground">
            <span>Voting ends:</span>
            <span className="text-primary">{formatTimeLeft()}</span>
          </div>
          <h1 className="mb-6 text-center text-3xl font-medium">
            Contestant Registration
          </h1>
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
