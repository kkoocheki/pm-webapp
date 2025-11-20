import { z } from "zod"

// Task schema
export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  label: z.string(),
  priority: z.string(),
  dueDate: z.string().optional(),
  progress: z.number().min(0).max(100),
})

export type Task = z.infer<typeof taskSchema>
