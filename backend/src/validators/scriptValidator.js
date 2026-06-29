index: z.string()
  .regex(/^\d+$/, "Index must be a non-negative integer")
  .refine((val) => parseInt(val, 10) <= 999999, { // Set a safe maximum limit
    message: "Index is too large",
  })
  .transform((val) => parseInt(val, 10)),
