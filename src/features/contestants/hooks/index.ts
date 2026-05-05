import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  addContestant,
  getContestantVotes,
  getContestants,
  submitVote,
  updateContestantBio,
  checkUserVoted,
  type ContestantPayload,
  type VotePayload,
} from "../api"

export const CONTESTANTS_QUERY_KEY = ["contestants"]
export const VOTES_QUERY_KEY = "votes"

export { checkUserVoted }

export function useContestants() {
  const query = useQuery({
    queryKey: CONTESTANTS_QUERY_KEY,
    queryFn: () => getContestants(),
  })
  return query
}

export function useContestantMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (variables: ContestantPayload, userId?: string) => addContestant(variables, userId),
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

export function useUpdateBioMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ contestantId, bio }: { contestantId: string; bio: string }) =>
      updateContestantBio(contestantId, bio),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTESTANTS_QUERY_KEY })
    },
    onError: (error) => {
      console.error(error);
      throw error
    }
  })
}