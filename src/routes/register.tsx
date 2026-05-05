import { createFileRoute } from "@tanstack/react-router"
import { RegisterForm } from "@/features/contestants/components/register-form"
import { Navbar } from "@/components/navbar"

export const Route = createFileRoute("/register")({
  component: RegisterPage,
})

function RegisterPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />
      <div className="flex items-center min-h-screen justify-center p-4 md:p-12 pt-24 md:pt-28">
        <div className="w-full lg:max-w-2xl">
          <h1 className="mb-6 text-center text-3xl font-medium">
            Contestant Registration
          </h1>
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
