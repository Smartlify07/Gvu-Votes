import { createFileRoute, Link } from "@tanstack/react-router"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Navbar } from "@/components/navbar"
import { useState } from "react"
import { getContestantById, type ContestantWithVotes, type Vote } from "@/features/contestants/api"
import { useVoteMutation } from "@/features/contestants/hooks"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-provider"
import { ArrowLeft, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/vote/$id")({
  loader: async ({ params }) => {
    try {
      const contestant = await getContestantById(params.id)
      if (!contestant) return null
      return contestant as ContestantWithVotes & { categories?: { label: string } }
    } catch {
      return null
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Contestant Not Found | GVU Votes" },
          { name: "robots", content: "noindex" },
        ],
      }
    }

    const origin = typeof window !== "undefined"
      ? window.location.origin
      : "https://gvu-voting-platform.vercel.app"

    const bioSnippet = loaderData.bio
      ? loaderData.bio.slice(0, 150) + (loaderData.bio.length > 150 ? "..." : "")
      : `Support ${loaderData.name} in the GVU Votes election!`

    return {
      meta: [
        { title: `Vote for ${loaderData.name} | GVU Votes` },
        { property: "og:title", content: `Vote for ${loaderData.name} | GVU Votes` },
        { property: "og:description", content: `${bioSnippet} — ${loaderData.votes_count ?? 0} votes so far` },
        { property: "og:image", content: loaderData.avatarUrl },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:url", content: `${origin}/vote/${loaderData.id}` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `Vote for ${loaderData.name} | GVU Votes` },
        { name: "twitter:description", content: bioSnippet },
        { name: "twitter:image", content: loaderData.avatarUrl },
      ],
    }
  },
  component: VotePage,
})

function VotePage() {
  const { id } = Route.useParams()
  const contestant = Route.useLoaderData()
  const { isAuthenticated, user } = useAuth()
  const voteMutation = useVoteMutation()
  const [showAuthDialog, setShowAuthDialog] = useState(false)

  const handleVote = async () => {
    if (!user || !contestant) return

    try {
      await voteMutation.mutateAsync({ contestant_id: contestant.id, voter_id: user.id }, {
        onSuccess: () => {
          toast.success(`Voted for ${contestant.name}`)
        },
        onError: (error: any) => {
          if (error?.message.includes("duplicate key value violates unique constraint") || error?.code === "23505") {
            toast.error("You can't vote for another person in this category")
          } else {
            toast.error("An error occurred trying to vote")
          }
        }
      })
    } catch (error: unknown) {
      console.error(error)
    }
  }

  const handleShare = () => {
    const url = `${window.location.origin}/vote/${id}`
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Vote link copied to clipboard!")
    }).catch(() => {
      toast.error("Failed to copy link")
    })
  }

  if (!contestant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Contestant Not Found</h1>
        <p className="text-muted-foreground mb-8">
          This contestant doesn&apos;t exist or may have been removed.
        </p>
        <Link to="/" className={cn(buttonVariants({ variant: "default", size: "lg" }))}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </div>
    )
  }

  const hasVoted = (contestant as ContestantWithVotes).votes?.some(
    (v: Vote) => v.voter_id === user?.id
  )

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="flex items-center justify-center p-6 pt-24">
        <div className="w-full max-w-2xl">
          <Card className="group">
            <CardContent className="flex flex-col gap-6 p-6">
              <div className="relative h-96">
                <img
                  src={(contestant as ContestantWithVotes).avatarUrl}
                  alt={(contestant as ContestantWithVotes).name + " avatar"}
                  className="h-full w-full rounded-2xl bg-center object-cover object-center"
                />
                <button
                  onClick={handleShare}
                  className="absolute top-3 right-3 rounded-full bg-background/80 backdrop-blur-sm p-2 hover:bg-background/90 transition-colors"
                  aria-label="Share vote link"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>

              <CardHeader className="flex flex-col gap-2">
                <div className="flex flex-wrap justify-between items-center w-full">
                  <div className="gap flex flex-col">
                    <CardTitle className="text-2xl font-bold">{(contestant as ContestantWithVotes).name}</CardTitle>
                    <CardDescription>{(contestant as ContestantWithVotes).department}</CardDescription>
                  </div>
                  <CardAction>
                    <Badge variant="secondary">{(contestant as ContestantWithVotes).position}</Badge>
                  </CardAction>
                </div>
                {(contestant as ContestantWithVotes).bio && (
                  <CardDescription className="text-sm mt-2">
                    {(contestant as ContestantWithVotes).bio}
                  </CardDescription>
                )}
              </CardHeader>

              <div className="flex flex-col gap-4 justify-between mt-auto pt-4 border px-4 py-4">
                <div className="flex text-lg">
                  <h1 className="text-4xl text-primary font-semibold">
                    {(contestant as ContestantWithVotes).votes_count ?? 0}{' '}
                    <span className="text-muted-foreground text-base font-normal">
                      {((contestant as ContestantWithVotes).votes_count > 1 || (contestant as ContestantWithVotes).votes_count === 0) ? "Votes" : "Vote"}
                    </span>
                  </h1>
                </div>

                <Button
                  className="w-full h-12 text-lg truncate"
                  size="lg"
                  disabled={hasVoted}
                  onClick={() => {
                    if (!isAuthenticated) {
                      setShowAuthDialog(true)
                    } else {
                      handleVote()
                    }
                  }}
                >
                  {hasVoted ? "Voted" : `Vote for ${(contestant as ContestantWithVotes).name.split(" ")[0]} ⭐`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="p-8 gap-10 max-w-lg!">
          <DialogHeader>
            <DialogTitle className="text-3xl font-medium">Sign in to Vote</DialogTitle>
            <DialogDescription className="text-base">You need to sign in to vote for your favorite contestant</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-6">
            <Button
              size="lg"
              className="text-base"
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
              <Button variant="link" onClick={() => setShowAuthDialog(false)}>Maybe later</Button>
            </DialogTrigger>
          </div>
          <p className="text-xs text-center text-muted-foreground">Sign in required to cast your vote</p>
        </DialogContent>
      </Dialog>
    </div>
  )
}
