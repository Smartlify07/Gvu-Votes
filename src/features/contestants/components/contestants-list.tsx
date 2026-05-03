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
import { useContestants, useVoteMutation } from "../hooks"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"
import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3"
import { type ContestantWithVotes } from "../api"
import { getConfig } from "../flutterwave-config"
import { toast } from "sonner"
import { UsersRound } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { cn } from "@/lib/utils"

export type ContestantsListProps = {
  category?: string
}

export function ContestantsList({ category = "All" }: ContestantsListProps) {
  const { data, error, isPending } = useContestants()
  const voteMutation = useVoteMutation()
  const [selectedContestant, setSelectedContestant] = useState<ContestantWithVotes | null>(null)
  const [open, setOpen] = useState(false)
  const config = getConfig({
    public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
    tx_ref: (Date.now().toString()),
    amount: 200,
    currency: 'NGN',
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email: "smartlify09@gmail.com",
      phone_number: "090666927835",
      name: "Obinna Anosike",
    },
    customizations: {
      title: `Vote support`,
      description: `Support for ${selectedContestant?.name} for ${selectedContestant?.position}`,
      logo: 'https://example.com/logo.png', // Your store logo
    },
  })

  const handleFlutterPayment = useFlutterwave(config);
  const handleVote = () => {
    voteMutation.mutateAsync({ contestant_id: selectedContestant?.id || "" }, {

      onSuccess: () => {
        toast.success(`Voted for ${selectedContestant?.name || ""}`)
        setSelectedContestant(null); setOpen(false)
      },
      onError: (error) => {
        console.error(error.message)
        toast.error(`An error occurred, try voting again`)
      }
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
      {(!data?.data?.filter((c) => category === "All" || c.position === category).length) ? (
        <div className="col-span-full flex flex-col items-center justify-center gap-4 py-16 text-center">
          <UsersRound className="h-16 w-16 text-muted-foreground/50" />
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-medium">No contestants yet</h3>
            <p className="text-sm text-muted-foreground">
              Be the first to register for {category === "All" ? "this position" : category}!
            </p>
            <Link to="/register" className={cn(buttonVariants({
              variant: "default", size: "lg"
            }), "mt-4")}>Register</Link>
          </div>
        </div>
      ) : (
        <Dialog onOpenChange={setOpen} open={open}>
          {data?.data
            ?.filter((c) => category === "All" || c.position === category)
            .map((contestant) => (
              <Card key={contestant.id} className="">
                <CardContent className="flex flex-col gap-6">
                  <div className="h-90">
                    <img
                      src={contestant.avatarUrl}
                      alt={contestant.name + " avatar"}
                      className="h-full w-full rounded-2xl bg-center object-cover object-center"
                    />
                  </div>
                  <CardHeader className="flex flex-col gap-2">
                    <div className="flex items-center w-full justify-between">
                      <div className="gap flex flex-col">
                        <CardTitle className="text-xl truncate max-w-60">{contestant.name}</CardTitle>
                        <CardDescription>{contestant.department}</CardDescription>
                      </div>
                      <CardAction>
                        <Badge variant={"secondary"}>{contestant.position}</Badge>
                      </CardAction>
                    </div>
                    <CardDescription className="text-sm">{contestant.bio ?? ""}</CardDescription>
                  </CardHeader>
                  <div className="flex flex-col gap-4 justify-between px-4">

                    <div className="flex text-lg">
                      <h1 className="text-3xl text-primary font-semibold">
                        {contestant.votes?.[0]?.count ?? 0}{' '}
                        <span className="text-muted-foreground text-base font-normal">
                          {(contestant.votes?.[0]?.count > 1 || contestant.votes?.[0]?.count === 0) ? "Votes" : "Vote"}
                        </span>
                      </h1>
                    </div>


                    <DialogTrigger>
                      <Button className={"w-full h-12 text-lg"} size={"lg"} onClick={() => { setSelectedContestant(contestant); setOpen(true) }}>
                        Vote for {contestant.name.split(" ")[0]} ⭐
                      </Button>
                    </DialogTrigger>
                  </div>
                </CardContent>
              </Card>
            ))}

          <DialogContent className="p-8 gap-10 max-w-lg!" >
            <DialogHeader>
              <DialogTitle className="text-3xl font-medium">Vote for {selectedContestant?.name || ""}!</DialogTitle>
              <DialogDescription className="text-base">Support {selectedContestant?.name || ""} for {selectedContestant?.position || ""} and help them take the crown!</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-6">

              <h1 className="text-6xl font-medium text-center text-foreground">₦200</h1>
              <div className="flex flex-col gap-1">

                <Button size={"lg"} className={"h-14 text-base"} onClick={() => handleFlutterPayment({
                  callback: (response) => {
                    if (response.status === "completed") {
                      closePaymentModal();
                      handleVote()
                    }

                  },
                  onClose: () => { },
                })}>Vote now</Button>
                <DialogTrigger>

                  <Button variant={"link"}>Maybe later</Button>
                </DialogTrigger>
              </div>
            </div>


            <p className="text-xs text-center text-muted-foreground">One vote. Non-refundable</p>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
