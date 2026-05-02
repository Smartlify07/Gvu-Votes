import { z } from "zod"

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  matriculationNumber: z.string().min(5, "Invalid matric number"),
  email: z.string().email("Invalid email address"),
  thumbnail: z.instanceof(File).refine(file => file.size < 5000000, "File must be less than 5MB"),
  department: z.enum(["Computer science", "Mass Communication", "Accounting", "Economics"]),
  position: z.enum(["Pageantry", "Mr Gvu", "Miss GVU", "Best Ebony Male", "Best Ebony Female", "Best dressed"]),
})

export type RegisterFormData = z.infer<typeof registerSchema>
