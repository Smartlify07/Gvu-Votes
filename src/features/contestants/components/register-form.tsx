import { useEffect, useRef, useState } from "react"
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
import { CheckCircle2, Loader2 } from "lucide-react"
import { useContestantMutation } from "../hooks"
import { supabase } from "@/lib/supabase"
import { Spinner } from "@/components/ui/spinner"

const MAX_FILE_SIZE = 10000000 // 10MB
const DEBOUNCE_DELAY = 500

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
        .refine((file) => file.size <= MAX_FILE_SIZE, {
          message: "Image size exceeds 10MB limit",
        }),
      z.string().optional(),
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
  const { mutateAsync, isPending } = useContestantMutation()
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [fileValue, setFileValue] = useState<File | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  const {
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
  })

  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
      }
    }
  }, [])

  useEffect(() => {
    if (!fileValue) {
      setUploadedUrl(null)
      setUploadError(null)
      return
    }

    setUploadError(null)
    setIsUploading(true)

    const timer = setTimeout(async () => {
      const fileExt = fileValue.name.split(".").pop()
      const fileName = `${Date.now()}.${fileExt}`

      const { error } = await supabase.storage
        .from("contestants")
        .upload(fileName, fileValue)

      if (error) {
        setUploadError(error.message)
        setIsUploading(false)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from("contestants")
        .getPublicUrl(fileName)

      setUploadedUrl(publicUrlData.publicUrl)
      setIsUploading(false)
    }, DEBOUNCE_DELAY)

    cleanupRef.current = () => clearTimeout(timer)

    return () => {
      cleanupRef.current?.()
    }
  }, [fileValue])

  const onSubmit = async (data: FormData) => {
    let thumbnailUrl = uploadedUrl || (data.thumbnail instanceof File ? "" : data.thumbnail || "")

    if (data.thumbnail instanceof File && !uploadedUrl) {
      setIsUploading(true)
      const file = data.thumbnail
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("contestants")
        .upload(fileName, file)

      setIsUploading(false)

      if (uploadError) {
        toast.error("Failed to upload image")
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from("contestants")
        .getPublicUrl(uploadData.path)

      thumbnailUrl = publicUrlData.publicUrl
    }

    try {
      await mutateAsync(
        {
          name: data.name,
          matriculationNumber: data.matriculationNumber,
          email: data.email,
          department: data.department,
          position: data.position,
          avatarUrl: thumbnailUrl,
        },
        {
          onError: (error: any) => {
            if (
              error?.code === "23505" ||
              error?.message?.includes("duplicate key") ||
              error?.message?.includes("unique constraint")
            ) {
              toast.error("You have already registered with this matriculation number or email.")
            } else {
              toast.error("Registration failed. Please try again.")
            }
          },
          onSuccess: () => {
            toast.success("Registration successful!")
            navigate({ to: "/" })
          },
        }
      )
    } catch {
      // Error already handled in onError
    }
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
                    className="text-sm"
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
                    className="text-sm"
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
                    className="text-sm"
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
                      setFileValue(file ?? null)
                      if (file) {
                        field.onChange(file)
                        setValue("thumbnail", file)
                      }
                    }}
                  />
                  {isUploading && (
                    <FieldDescription className="flex items-center gap-1 text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Uploading...
                    </FieldDescription>
                  )}
                  {!isUploading && uploadedUrl && (
                    <FieldDescription className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      Uploaded
                    </FieldDescription>
                  )}
                  {!isUploading && uploadError && (
                    <FieldDescription className="text-destructive">
                      {uploadError}
                    </FieldDescription>
                  )}
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
          <Button type="submit" className="w-full" disabled={isPending || isUploading}>
            {isPending ? (
              <>
                <Spinner />
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
