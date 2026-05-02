import { supabase } from "@/lib/supabase"

export type ContestantPayload = {
  name: string
  matriculationNumber: string
  email: string
  thumbnail: string
  department: string
  position: string
}

export async function getContestants() {
  try {
    const result = await supabase.from("contestants").select("*")
    return result
  } catch (error) {
    console.error(error)
    throw error
  }
}

export async function addContestant(values: ContestantPayload) {
  try {
    await supabase.from("contestants").insert(values).select("*")
  } catch (error) {
    console.error(error)
    throw error
  }
}
