import { supabase } from "@/lib/supabase"

export type ContestantPayload = {
  name: string
  matriculationNumber: string
  email: string
  department: string
  position: string
  avatarUrl: string
  bio: string
}

export type VotePayload = {
  contestant_id: string
}

export type ContestantWithVotes = {
  id: string
  name: string
  matriculationNumber: string
  email: string
  department: string
  position: string
  avatarUrl: string
  bio: string
  votes: { count: number }[]
}

export async function getContestants() {
  try {
    const result = await supabase
      .from("contestants")
      .select("*, votes(count)")
      .returns<ContestantWithVotes[]>()
    return result
  } catch (error) {
    console.error(error)
    throw error
  }
}

export async function addContestant(values: ContestantPayload) {
  try {
    const { data, error } = await supabase.from("contestants").insert(values)
    if (error) {
      console.error(error)
      throw error
    }
    return data
  } catch (error) {
    console.error(error)
    throw error
  }
}

export async function submitVote(values: VotePayload) {
  try {
    await supabase.from("votes").insert(values)
  } catch (error) {
    console.error(error)
    throw error
  }
}

export async function getContestantVotes(contestantId: string) {
  try {
    const result = await supabase
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("contestant_id", contestantId)
    return result
  } catch (error) {
    console.error(error)
    throw error
  }
}
