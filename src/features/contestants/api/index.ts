import { supabase } from "@/lib/supabase"
import { slugify } from "@/lib/utils"

export type Category = {
  id: string
  label: string
  value: string
  created_at: string
}

export type ContestantPayload = {
  name: string
  matriculationNumber: string
  email: string
  department: string
  category_id: string
  avatarUrl: string
  bio: string
  user_id: string;
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
  category_id: string
  position: string
  avatarUrl: string
  bio: string
  user_id: string
  votes_count: number;
  category_label: string;
  has_voted: boolean;
}

export async function getContestants() {
  try {
    const { error, data } = await supabase
      .from("contestants_with_vote_counts")
      .select("*").returns<ContestantWithVotes[]>()
    if (error) {
      console.error(error)
      throw error
    }
    return data ?? []
  } catch (error) {
    console.error(error)
    throw error
  }
}

export async function getTotalVotes() {
  try {

    const { data, error } = await supabase
      .from('contestants_with_vote_counts')
      .select('votes_count')
    if (error) {
      throw error

    }
    const total = (data ?? []).reduce((sum, r) => sum + (r.votes_count ?? 0), 0);
    return total
  }

  catch (error) {
    console.error(error)
    throw error
  }

}
export async function addContestant(values: ContestantPayload,) {
  try {
    const { data, error } = await supabase.from("contestants").insert({
      ...values,
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

export async function submitVote(values: VotePayload) {
  try {
    const { data, error } = await supabase.from("votes").upsert({
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

export async function updateContestantBio(contestantId: string, bio: string) {
  try {
    const { data, error } = await supabase
      .from("contestants")
      .update({ bio })
      .eq("id", contestantId)
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

export async function getContestantById(contestantId: string) {
  try {
    const result = await supabase
      .from("contestants_with_vote_counts")
      .select("*")
      .eq("id", contestantId)
      .returns<(ContestantWithVotes)[]>()
      .single()
    if (result.error) {
      console.error(result.error)
      throw result.error
    }
    const data = result.data
    return data
  } catch (error) {
    console.error(error)
    throw error
  }
}

export async function getContestantBySlug(slug: string) {
  try {
    const result = await supabase
      .from("contestants_with_vote_counts")
      .select("*")
      .returns<(ContestantWithVotes)[]>()
    if (result.error) {
      console.error(result.error)
      throw result.error
    }
    const matched = result.data?.find(
      (c) => slugify(c.name) === slug
    )
    if (!matched) return null
    return matched
  } catch (error) {
    console.error(error)
    throw error
  }
}

export async function updateContestant(contestantId: string, values: Partial<ContestantPayload>) {
  try {
    const { data, error } = await supabase
      .from("contestants")
      .update(values)
      .eq("id", contestantId)
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

export async function checkUserVoted(voterId: string, contestantId: string) {
  try {
    const { data, error } = await supabase
      .from("votes")
      .select("id")
      .eq("voter_id", voterId)
      .eq("contestant_id", contestantId)
      .maybeSingle()
    if (error) {
      console.error(error)
      throw error
    }
    return !!data
  } catch (error) {
    console.error(error)
    throw error
  }
}

export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .returns<Category[]>()
      .order("created_at", { ascending: true })
    if (error) {
      console.error(error)
      throw error
    }
    return data ?? []
  } catch (error) {
    console.error(error)
    throw error
  }
}
