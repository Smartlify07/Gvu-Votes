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
import { useContestants } from "../hooks"

type Position = "Mr. GVU" | "Miss GVU" | "Best Pageantry"
type Department =
  | "Mass Communication"
  | "Computer Science"
  | "Economics"
  | "Accounting"

interface Contestant {
  id: string
  name: string
  department: Department // Added field
  position: Position
  voteCount: number
  thumbnail: string
}
const contestants: Contestant[] = [
  {
    id: "GVU-2026-001",
    name: "Chidi Okechukwu",
    department: "Computer Science",
    position: "Mr. GVU",
    voteCount: 1240,
    thumbnail:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80",
  },
  {
    id: "GVU-2026-002",
    name: "Sarah Adenuga",
    department: "Mass Communication",
    position: "Miss GVU",
    voteCount: 1580,
    thumbnail:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80",
  },
  {
    id: "GVU-2026-003",
    name: "David Adeleke",
    department: "Economics",
    position: "Mr. GVU",
    voteCount: 945,
    thumbnail:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80",
  },
  {
    id: "GVU-2026-004",
    name: "Amara Kanu",
    department: "Accounting",
    position: "Miss GVU",
    voteCount: 2100,
    thumbnail:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80",
  },
  {
    id: "GVU-2026-005",
    name: "Emmanuel Etim",
    department: "Computer Science",
    position: "Best Pageantry",
    voteCount: 870,
    thumbnail:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80",
  },
  {
    id: "GVU-2026-006",
    name: "Blessing Sunday",
    department: "Mass Communication",
    position: "Best Pageantry",
    voteCount: 1125,
    thumbnail:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80",
  },
]

export function ContestantsList() {
  const { data, error, isPending } = useContestants();
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
                  {10} votes
                </span>
              </div>

              <Button>
                Vote <ArrowUp />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
