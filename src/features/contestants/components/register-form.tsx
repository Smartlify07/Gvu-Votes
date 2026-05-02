import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { toast } from "sonner"
import { useNavigate } from "@tanstack/react-router"
import { useContestantMutation } from "../hooks"
import { supabase } from "@/lib/supabase"

const formSchema = z.object({
  name: z
    .string({
      error: "Input must not be empty",
    })
    .min(2, "Name must be at least 2 characters"),
  matriculationNumber: z
    .string({
      error: "Input must not be empty",
    })
    .min(5, "Invalid matric number"),
  email: z.email({ error: "Invalid email address" }),
  thumbnail: z
    .union([
      z
        .instanceof(File, { message: "Image is required" })
        .refine((file) => !file || file.size !== 0 || file.size <= 5000000, {
          message: "Max size exceeded",
        }),
      z.string().optional(), // to hold default image
    ])
    .refine((value) => value instanceof File || typeof value === "string", {
      message: "Image is required",
    }),
  department: z
    .string({
      error: "Input must not be empty",
    })
    .min(1, "Select a department"),
  position: z
    .string({
      error: "Input must not be empty",
    })
    .min(1, "Select a position"),
})

type FormData = z.infer<typeof formSchema>

const departments = [
  "Computer science",
  "Mass Communication",
  "Accounting",
  "Economics",
]
const positions = [
  "Pageantry",
  "Mr Gvu",
  "Miss GVU",
  "Best Ebony Male",
  "Best Ebony Female",
  "Best dressed",
]

export function RegisterForm() {
  const navigate = useNavigate()
  const { mutate, isPending } = useContestantMutation()

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
  })

  const onSubmit = async (data: FormData) => {
    let thumbnailUrl = ""

    if (data.thumbnail instanceof File) {
      const file = data.thumbnail
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("contestants")
        .upload(fileName, file)

      if (uploadError) {
        console.error(uploadError)
        toast.error("Failed to upload image")
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from("contestants")
        .getPublicUrl(uploadData.path)

      thumbnailUrl = publicUrlData.publicUrl
    } else if (typeof data.thumbnail === "string") {
      thumbnailUrl = data.thumbnail
    }

    mutate(
      {
        name: data.name,
        matriculationNumber: data.matriculationNumber,
        email: data.email,
        thumbnail: thumbnailUrl,
        department: data.department,
        position: data.position,
      },
      {
        onSuccess: () => {
          toast.success("Registration successful!")
          navigate({ to: "/" })
        },
        onError: () => {
          toast.error("Registration failed. Please try again.")
        },
      }
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <FieldSet>
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <FieldContent>
                  <Input
                    {...field}
                    id="name"
                    placeholder="Enter your name"
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldContent>
              </Field>
            )}
          ></Controller>

          <Controller
            name="matriculationNumber"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="matric">Matric Number</FieldLabel>
                <FieldContent>
                  <Input
                    {...field}
                    id="matric"
                    placeholder="Enter matric number"
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldContent>
              </Field>
            )}
          />

          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <FieldContent>
                  <Input
                    {...field}
                    id="email"
                    placeholder="Enter your email address"
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldContent>
              </Field>
            )}
          ></Controller>

          <Controller
            name="thumbnail"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="thumbnail">Thumbnail</FieldLabel>
                <FieldContent>
                  <Input
                    aria-invalid={fieldState.invalid}
                    id="thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) field.onChange(file)
                    }}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldContent>
              </Field>
            )}
          ></Controller>

          <Controller
            name="department"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="department">Department</FieldLabel>
                <FieldContent>
                  <Select name={field.name} onValueChange={field.onChange}>
                    <SelectTrigger
                      className="w-full"
                      aria-invalid={fieldState.invalid}
                      id="department"
                    >
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldContent>
              </Field>
            )}
          ></Controller>

          <Controller
            name="position"
            control={control}
            render={({ fieldState, field }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="position">Position</FieldLabel>
                <FieldContent className="">
                  <Select name={field.name} onValueChange={field.onChange}>
                    <SelectTrigger
                      aria-invalid={fieldState.invalid}
                      className="w-full"
                      id="position"
                    >
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.position && (
                    <FieldDescription className="text-destructive">
                      {errors.position.message}
                    </FieldDescription>
                  )}
                </FieldContent>
              </Field>
            )}
          ></Controller>
        </FieldSet>

        <Field orientation="horizontal">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <svg
                  className="mr-2 -ml-1 h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Registering...
              </>
            ) : (
              "Register"
            )}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
