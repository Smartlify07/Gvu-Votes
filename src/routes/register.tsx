import { createFileRoute } from "@tanstack/react-router"
import { RegisterForm } from "@/features/contestants/components/register-form"
import { Navbar } from "@/components/navbar"
import { VOTING_END_TIME } from "@/lib/constants"
import { useEffect, useState } from "react"

export const Route = createFileRoute("/register")({
  component: RegisterPage,
})

function RegisterPage() {
  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const diff = VOTING_END_TIME.getTime() - now.getTime()

      if (diff <= 0) {
        return "Voting ended"
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      if (days > 0) {
        return `${days.toString().padStart(2, "0")}days ${hours.toString().padStart(2, "0")}hrs ${minutes.toString().padStart(2, "0")}mins ${seconds.toString().padStart(2, "0")}s`
      }

      return `${hours.toString().padStart(2, "0")}hrs ${minutes.toString().padStart(2, "0")}mins ${seconds.toString().padStart(2, "0")}s`
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />
      <div className="flex items-center min-h-screen justify-center p-4 md:p-12 pt-24 md:pt-36">
        <div className="w-full lg:max-w-2xl">
          <div className="absolute top-24 right-4 md:right-8 lg:right-12 flex items-center gap-2 text-sm md:text-base font-medium text-muted-foreground">
            <span>Voting ends in:</span>
            <span className="text-primary font-mono text-lg">{timeLeft}</span>
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