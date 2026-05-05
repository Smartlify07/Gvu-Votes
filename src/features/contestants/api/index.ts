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
  voter_id: string
}
export type Vote = {
  id: string, voter_id: string, contestant_id: string, created_at: string,
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
  votes_count: number;
  votes: Vote[]
}

export async function getContestants() {
  try {
    const result = await supabase
      .from("contestants")
      .select("*, votes(*)")
      .returns<ContestantWithVotes[]>()
    const data = result.data?.map(c => ({
      ...c,
      votes_count: c.votes.length
    }))
    return data ?? []
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
    const { data, error } = await supabase.from("votes").insert({
      contestant_id: values.contestant_id,
      voter_id: values.voter_id,
    })
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
