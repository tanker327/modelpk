import { z } from 'zod'

// Example Zod schema to demonstrate runtime validation
export const ExampleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.number().min(0, 'Age must be positive').optional(),
})

export type ExampleType = z.infer<typeof ExampleSchema>

// Example usage function
export function validateExample(data: unknown): ExampleType {
  return ExampleSchema.parse(data)
}
