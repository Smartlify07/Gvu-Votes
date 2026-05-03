import { supabase } from "@/lib/supabase"
import type { PostgrestSingleResponse } from "@supabase/supabase-js"

export type ContestantPayload = {
  name: string
  matriculationNumber: string
  email: string
  department: string
  position: string
  avatarUrl: string
}


type Contestant = {
  name: string
  matriculationNumber: string
  email: string
  department: string
  position: string
  avatarUrl: string
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
    await supabase.from("contestants").insert(values)
  } catch (error) {
    console.error(error)
    throw error
  }
}
