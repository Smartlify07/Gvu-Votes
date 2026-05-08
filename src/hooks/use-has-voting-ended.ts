import { useState, useEffect } from "react"
import { hasVotingEnded } from "@/lib/constants"

export function useHasVotingEnded() {
  const [ended, setEnded] = useState(hasVotingEnded)
  useEffect(() => {
    const id = setInterval(() => setEnded(hasVotingEnded()), 1000)
    return () => clearInterval(id)
  }, [])
  return ended
}