import { useEffect, useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button, buttonVariants } from "@/components/ui/button"
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
import { Loader2, Upload, User, Award, ImageIcon } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Spinner } from "@/components/ui/spinner"
import { DEPARTMENTS, CATEGORIES } from "@/lib/constants"
import { type ContestantWithVotes } from "../api"
import { Link } from "@tanstack/react-router"

const MAX_FILE_SIZE = 10000000
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
  bio: z
    .string({
      error: "Input must not be empty",
    })
    .min(10, "Bio must be at least 10 characters")
    .max(500, "Bio must be less than 500 characters"),
})

type FormData = z.infer<typeof formSchema>

export function EditContestantForm({ contestantId }: { contestantId: string }) {
  const navigate = useNavigate()
  const [isPending, setIsPending] = useState(false)
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [fileValue, setFileValue] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [initialData, setInitialData] = useState<ContestantWithVotes | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const cleanupRef = useRef<(() => void) | null>(null)

  const {
    handleSubmit,
    formState: { errors, isDirty },
    control,
    setValue,
    reset,
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

  useEffect(() => {
    const fetchContestant = async () => {
      if (initialData || !isLoading) return
      
      const { data, error } = await supabase
        .from("contestants")
        .select("*")
        .eq("id", contestantId)
        .single()
      
      if (error) {
        console.error(error)
        toast.error("Failed to load contestant")
        setIsLoading(false)
        return
      }
      
      setInitialData(data)
      setUploadedUrl(data.avatarUrl)
      reset({
        name: data.name,
        matriculationNumber: data.matriculationNumber,
        email: data.email,
        department: data.department,
        position: data.position,
        bio: data.bio,
        thumbnail: data.avatarUrl,
      })
      setIsLoading(false)
    }

    fetchContestant()
  }, [contestantId, initialData, isLoading, reset])

  const onSubmit = async (data: FormData) => {
    setIsPending(true)
    let thumbnailUrl = uploadedUrl || ""

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
        setIsPending(false)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from("contestants")
        .getPublicUrl(uploadData.path)

      thumbnailUrl = publicUrlData.publicUrl
    }

    try {
      const { error } = await supabase
        .from("contestants")
        .update({
          name: data.name,
          matriculationNumber: data.matriculationNumber,
          email: data.email,
          department: data.department,
          position: data.position,
          bio: data.bio,
          avatarUrl: thumbnailUrl,
        })
        .eq("id", contestantId)

      if (error) {
        console.error(error)
        toast.error("Failed to update contestant")
        return
      }

      toast.success("Contestant updated successfully!")
      navigate({ to: "/" })
    } catch (error) {
      console.error(error)
      toast.error("Failed to update contestant")
    } finally {
      setIsPending(false)
    }
  }

  const handleCancel = () => {
    if (isDirty) {
      setShowDiscardDialog(true)
    } else {
      navigate({ to: "/" })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
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
                    disabled

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
                    disabled
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
                  <Select name={field.name} onValueChange={field.onChange} value={field.value}>
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

      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-lg font-medium">
          <Award className="h-5 w-5" />
          <h2>Contestant Details</h2>
        </div>
        <FieldGroup>
          <FieldSet>
            <Controller
              name="position"
              control={control}
              render={({ fieldState, field }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="position">
                    Position Running For <span className="text-destructive">*</span>
                  </FieldLabel>
                  <FieldContent className="">
                    <Select name={field.name} onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger
                        aria-invalid={fieldState.invalid}
                        className="w-full"
                        id="position"
                      >
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            {p.label}
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
                  <img
                    src={uploadedUrl}
                    alt="Current profile"
                    className="h-full w-full object-contain rounded-lg"
                  />
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

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={isPending || isUploading}>
          {isPending ? (
            <>
              <Spinner />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>

      <Dialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <DialogContent className="p-6 gap-4">
          <DialogHeader>
            <DialogTitle>Discard Changes?</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Are you sure you want to leave?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDiscardDialog(false)}>
              Keep Editing
            </Button>
            <Link to="/" className={buttonVariants()}>
              Discard
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  )
}