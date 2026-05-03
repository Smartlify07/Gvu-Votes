import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ArrowUp, Vote } from "lucide-react"
import { useContestants, useVoteMutation } from "../hooks"

export function ContestantsList() {
  const { data, error, isPending } = useContestants()
  const voteMutation = useVoteMutation()

  if (isPending) {
    return <>Loading...</>
  }
  else if (error) {
    return <div>{error.message}</div>
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3 lg:gap-10">
      {data?.data?.map((contestant) => (
        <Card key={contestant.id} className="">
          <CardContent className="flex flex-col gap-6">
            <div className="h-90">
              <img
                src={contestant.avatarUrl}
                alt={contestant.name + " avatar"}
                className="h-full w-full rounded-2xl bg-center object-cover object-center"
              />
            </div>
            <CardHeader className="flex items-center justify-between">
              <div className="gap flex flex-col">
                <CardTitle className="text-xl">{contestant.name}</CardTitle>
                <CardDescription>{contestant.department}</CardDescription>
              </div>
              <CardAction>
                <Badge variant={"secondary"}>{contestant.position}</Badge>
              </CardAction>
            </CardHeader>
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-1">
                <Vote className="text-muted-foreground" size={20} />{" "}
                <span className="text-sm">
                  {contestant.votes?.[0]?.count ?? 0} votes
                </span>
              </div>

              <Button
                disabled={voteMutation.isPending}
                onClick={() =>
                  voteMutation.mutate({ contestant_id: contestant.id })
                }
              >
                Vote <ArrowUp />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
