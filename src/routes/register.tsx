import { createFileRoute } from "@tanstack/react-router"
import { RegisterForm } from "@/features/contestants/components/register-form"

export const Route = createFileRoute("/register")({
  component: RegisterPage,
})

function RegisterPage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-4 md:p-12">
      <div className="w-full max-w-2xl">
        <h1 className="mb-6 text-center text-3xl font-medium">
          Contestant Registration
        </h1>
        <RegisterForm />
      </div>
    </div>
  )
}
