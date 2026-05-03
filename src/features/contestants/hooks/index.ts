import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  addContestant,
  getContestantVotes,
  getContestants,
  submitVote,
  type ContestantPayload,
  type VotePayload,
} from "../api"

const CONTESTANTS_QUERY_KEY = ["contestants"]
const VOTES_QUERY_KEY = "votes"

export function useContestants() {
  return useQuery({
    queryKey: CONTESTANTS_QUERY_KEY,
    queryFn: () => getContestants(),
  })
}

export function useContestantMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (variables: ContestantPayload) => addContestant(variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTESTANTS_QUERY_KEY })
    },
    onError: (error) => {
      console.error(error);
      throw error
    }
  })
}

export function useContestantVotes(contestantId: string) {
  return useQuery({
    queryKey: [...CONTESTANTS_QUERY_KEY, VOTES_QUERY_KEY, contestantId],
    queryFn: () => getContestantVotes(contestantId),
    enabled: !!contestantId,
  })
}

export function useVoteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (variables: VotePayload) => submitVote(variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTESTANTS_QUERY_KEY })
    },
  })
}
