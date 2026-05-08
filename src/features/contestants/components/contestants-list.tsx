import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useCategories, useContestants, useVoteMutation } from "../hooks"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"
import { type ContestantWithVotes } from "../api"
import { toast } from "sonner"
import { UsersRound, Pencil, Share2 } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { cn, slugify } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-provider"
import { useHasVotingEnded } from "@/hooks/use-has-voting-ended"

export type ContestantsListProps = {
  category?: string
}

export function ContestantsList({ category = "All" }: ContestantsListProps) {
  const { data, error, isPending } = useContestants()
  const voteMutation = useVoteMutation()
  const { isAuthenticated, user } = useAuth()
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const votingEnded = useHasVotingEnded()
  const { data: categories } = useCategories()
  const actualCategory = category === "All" ? "All" : categories?.find((category_) => category_.id === category)?.label
  const handleVote = async (contestant: ContestantWithVotes) => {
    if (!user) return

    try {
      await voteMutation.mutateAsync({ contestant_id: contestant.id, voter_id: user.id }, {
        onSuccess: () => {
          toast.success(`Voted for ${contestant.name}`)

        },
        onError: (error: any) => {
          if (error?.message.includes("duplicate key value violates unique constraint") || error?.code === "23505") {
            toast.error("You can't vote for another person in this category")
          }
          else {
            toast.error("An error occurred trying to vote")
          }
        }
      })
    } catch (error: unknown) {
      console.error(error)
    }
  }

  const handleShare = (contestant: ContestantWithVotes) => {
    const slug = slugify(contestant.name)
    const url = `${window.location.origin}/vote/${slug}`
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Vote link copied to clipboard!")
    }).catch(() => {
      toast.error("Failed to copy link")
    })
  }


  if (isPending) {
    return <>Loading...</>
  }
  else if (error) {
    return <div>{error.message}</div>
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-10">
      {(!data?.filter((c) => category === "All" || c.category_id === category).length) ? (
        <div className="col-span-full flex flex-col items-center justify-center gap-4 py-16 text-center">
          <UsersRound className="h-16 w-16 text-muted-foreground/50" />
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-medium">No contestants yet</h3>
            <p className="text-sm text-muted-foreground">
              Be the first to register for {category === "All" ? "this position" : actualCategory}!
            </p>
            <Link to="/register" className={cn(buttonVariants({
              variant: "default", size: "lg"
            }), "mt-4")}>Register</Link>
          </div>
        </div>
      ) : (
        <>
          {data
            ?.filter((c) => category === "All" || c.category_id === category)
            .map((contestant) => {


              return (
                <Card key={contestant.id} className="group relative">
                  <CardContent className="flex flex-col gap-6 min-h-full">
                    <div className="relative h-90">
                      <img
                        src={contestant.avatarUrl}
                        alt={contestant.name + " avatar"}
                        className="h-full w-full rounded-2xl bg-center object-cover object-center"
                      />
                      <button
                        onClick={() => handleShare(contestant)}
                        className="absolute top-3 right-3 lg:opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-background/80 backdrop-blur-sm p-2 hover:bg-background/90"
                        aria-label="Share vote link"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                    <CardHeader className="flex flex-col gap-2">
                      <div className="flex flex-wrap justify-between items-center w-full">
                        <div className="gap flex flex-col">
                          <CardTitle className="text-xl truncate max-w-60">{contestant.name}</CardTitle>
                          <CardDescription>{contestant.department}</CardDescription>
                        </div>
                        <CardAction>
                          <Badge variant={"secondary"}>{contestant.category_label}</Badge>
                        </CardAction>
                      </div>
                      <div className="flex items-center w-full justify-between">

                        <CardDescription className="text-sm">{contestant.bio ?? ""}</CardDescription>
                        {user?.id === contestant.user_id && !votingEnded && (
                          <Link
                            to="/contestants/$id/edit"
                            params={{ id: contestant.id }}
                            className={cn(
                              buttonVariants({ variant: "ghost", size: "icon" }),
                              "lg:opacity-0 group-hover:opacity-100 flex items-center gap-2 lg:gap-1 w-fit px-3 transition-opacity"
                            )}
                          >
                            Edit
                            <Pencil className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </CardHeader>
                    <div className="flex flex-col gap-4 justify-between mt-auto pt-4 px-4">

                      <div className="flex text-lg">
                        <h1 className="text-3xl text-primary font-semibold">
                          {contestant.votes_count ?? 0}{' '}
                          <span className="text-muted-foreground text-base font-normal">
                            {(contestant.votes_count > 1 || contestant.votes_count === 0) ? "Votes" : "Vote"}
                          </span>
                        </h1>
                      </div>

                      <Button
                        className={"w-full h-12 text-lg self-end mt-auto truncate"}
                        size={"lg"}
                        disabled={contestant.has_voted || votingEnded}
                        onClick={() => {
                          if (!isAuthenticated) {
                            setShowAuthDialog(true)
                          } else {
                            handleVote(contestant)
                          }
                        }}
                      >
                        {votingEnded ? "Voting Closed" : contestant.has_voted ? "Voted" : `Vote for ${contestant.name.split(" ")[0]} ⭐`}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

          <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
            <DialogContent className="p-8 gap-10 max-w-lg!">
              <DialogHeader>
                <DialogTitle className="text-3xl font-medium">Sign in to Vote</DialogTitle>
                <DialogDescription className="text-base">You need to sign in to vote for your favorite contestant</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-6">
                <Button
                  size={"lg"}
                  className={"text-base"}
                  variant="outline"
                  onClick={async () => {
                    try {
                      const { signInWithGoogle } = await import("@/lib/supabase")
                      await signInWithGoogle()
                    } catch (error) {
                      console.error("Sign in error:", error)
                      toast.error("Failed to sign in with Google")
                    }
                  }}
                >
                  <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill="#4285F4" d="M14.9 8.161c0-.476-.039-.954-.121-1.422h-6.64v2.695h3.802a3.24 3.24 0 01-1.407 2.127v1.75h2.269c1.332-1.22 2.097-3.02 2.097-5.15z"></path><path fill="#34A853" d="M8.14 15c1.898 0 3.499-.62 4.665-1.69l-2.268-1.749c-.631.427-1.446.669-2.395.669-1.836 0-3.393-1.232-3.952-2.888H1.85v1.803A7.044 7.044 0 008.14 15z"></path><path fill="#FBBC04" d="M4.187 9.342a4.17 4.17 0 010-2.68V4.859H1.849a6.97 6.97 0 000 6.286l2.338-1.803z"></path><path fill="#EA4335" d="M8.14 3.77a3.837 3.837 0 012.7 1.05l2.01-1.999a6.786 6.786 0 00-4.71-1.82 7.042 7.042 0 00-6.29 3.858L4.186 6.66c.556-1.658 2.116-2.89 3.952-2.89z"></path></g></svg>
                  Sign in with Google
                </Button>
                <DialogTrigger>
                  <Button variant={"link"} onClick={() => setShowAuthDialog(false)}>Maybe later</Button>
                </DialogTrigger>
              </div>
              <p className="text-xs text-center text-muted-foreground">Sign in required to cast your vote</p>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}