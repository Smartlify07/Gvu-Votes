import { useEffect, useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { CheckCircle2, Loader2, Upload, User, Award, ImageIcon } from "lucide-react"
import { useContestantMutation, useCategories } from "../hooks"
import { supabase, signInWithGoogle } from "@/lib/supabase"
import { Spinner } from "@/components/ui/spinner"
import { DEPARTMENTS } from "@/lib/constants"
import { useAuth } from "@/contexts/auth-provider"

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
  category_id: z
    .string({
      error: "Input must not be empty",
    })
    .min(1, "Select a category"),
  bio: z
    .string({
      error: "Input must not be empty",
    })
    .min(10, "Bio must be at least 10 characters")
    .max(500, "Bio must be less than 500 characters"),
})

type FormData = z.infer<typeof formSchema>



export function RegisterForm() {
  const navigate = useNavigate()
  const { mutateAsync, isPending } = useContestantMutation()
  const { data: categories } = useCategories()
  const { user, isAuthenticated } = useAuth()
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [fileValue, setFileValue] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
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
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
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
    if (!isAuthenticated) {
      setShowAuthDialog(true)
      return
    }

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
          category_id: data.category_id,
          avatarUrl: thumbnailUrl,
          bio: data.bio,
          user_id: user?.id ?? ""
        },
        {
          onError: (error: any) => {
            if (
              error?.code === "23505" ||
              error?.message?.includes("duplicate key") ||
              error?.message?.includes("unique constraint")
            ) {
              toast.error("You have already registered with this matriculation number or email.")
            }
            else if (error?.code === "23514" || error?.message.includes("valid_matric_number_format") || error?.message.includes("violates check constraint")) {
              toast.error("Failed to register, this matric number isn't valid")
            }
            else {
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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
      {/* Personal Info Section */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-lg font-medium">
          <User className="h-5 w-5" />
          <h2>Personal Information</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Controller
            name="matriculationNumber"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="matric">
                  Matric Number <span className="text-destructive">*</span>
                </FieldLabel>
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
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="name">
                  Full Name <span className="text-destructive">*</span>
                </FieldLabel>
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
          />

          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </FieldLabel>
                <FieldContent>
                  <Input
                    {...field}
                    id="email"
                    type="email"
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
          />

          <Controller
            name="department"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="department">
                  Department <span className="text-destructive">*</span>
                </FieldLabel>
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
                      {DEPARTMENTS.map((d) => (
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
          />
        </div>
      </section>

      {/* Contestant Details Section */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-lg font-medium">
          <Award className="h-5 w-5" />
          <h2>Contestant Details</h2>
        </div>
        <FieldGroup>
          <FieldSet>
            <Controller
              name="category_id"
              control={control}
              render={({ fieldState, field }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="category_id">
                    Category <span className="text-destructive">*</span>
                  </FieldLabel>
                  <FieldContent className="">
                    <Select name={field.name} onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger
                        aria-invalid={fieldState.invalid}
                        className="w-full"
                        id="category_id"
                      >
                        {categories?.find(c => c.id === field.value)?.label ?? <span className="text-muted-foreground">Select category</span>}
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category_id && (
                      <FieldDescription className="text-destructive">
                        {errors.category_id.message}
                      </FieldDescription>
                    )}
                  </FieldContent>
                </Field>
              )}
            />

            <Controller
              name="bio"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="bio">
                    Campaign Bio <span className="text-destructive">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <Textarea
                      {...field}
                      id="bio"
                      placeholder="Tell us why people should vote for you..."
                      aria-invalid={fieldState.invalid}
                      className="text-sm min-h-[120px]"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                </Field>
              )}
            />
          </FieldSet>
        </FieldGroup>
      </section>

      {/* Image Section */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-lg font-medium">
          <ImageIcon className="h-5 w-5" />
          <h2>Profile Image</h2>
        </div>
        <Controller
          name="thumbnail"
          control={control}
          render={({ field, fieldState }) => (
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-[300px] cursor-pointer opacity-0"
                style={{ width: "400px", height: "300px" }}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  setFileValue(file ?? null)
                  if (file) {
                    field.onChange(file)
                    setValue("thumbnail", file)
                    const url = URL.createObjectURL(file)
                    setPreviewUrl(url)
                  }
                }}
              />
              <div
                className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-input bg-background hover:bg-accent/50 transition-colors"
                style={{ width: "100%", height: "300px" }}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Uploading...</p> </>
                ) : previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-full w-full object-contain rounded-lg"
                  />
                ) : uploadedUrl ? (
                  <>
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                    <p className="text-sm text-green-600">Uploaded</p>
                    <p className="text-xs text-muted-foreground">{fileValue?.name}</p>
                  </>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG up to 10MB
                    </p>
                  </>
                )}
              </div>
              {uploadError && (
                <FieldDescription className="text-destructive mt-2">
                  {uploadError}
                </FieldDescription>
              )}
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </div>

          )}
        />
      </section>

      {/* Submit Button */}
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

      {/* Sign In Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="p-8 gap-10 max-w-lg!">
          <DialogHeader>
            <DialogTitle className="text-3xl font-medium">Sign in to Register</DialogTitle>
            <DialogDescription className="text-base">You need to sign in to register as a contestant</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-6">
            <Button
              size={"lg"}
              className={"text-base"}
              variant="outline"
              onClick={async () => {
                try {
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
          <p className="text-xs text-center text-muted-foreground">Sign in required to register as a contestant</p>
        </DialogContent>
      </Dialog>
    </form>
  )
}