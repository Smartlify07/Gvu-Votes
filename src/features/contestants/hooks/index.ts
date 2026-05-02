import { useMutation, useQuery } from "@tanstack/react-query"
import { addContestant, getContestants, type ContestantPayload } from "../api"

const CONTESTANTS_QUERY_KEY = ["contestants"]
export function useContestants() {
  return useQuery({
    queryKey: CONTESTANTS_QUERY_KEY,
    queryFn: () => getContestants(),
  })
}

export function useContestantMutation() {
  return useMutation({
    mutationFn: (variables: ContestantPayload) => addContestant(variables),
  })
}
