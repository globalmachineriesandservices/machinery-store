import { z } from 'zod'

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[^A-Za-z0-9]/,
        'Password must contain at least one special character',
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// ─── Product ──────────────────────────────────────────────────────────────────
// Key feature: { title: string; points: string[] }
export const keyFeatureSchema = z.object({
  title: z.string().min(1, 'Feature title is required'),
  points: z.array(z.string().min(1)).min(1, 'At least one point is required'),
})

export const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  brand: z.string().optional(),
  specifications: z.record(z.string(), z.string()).optional(),
  keyFeatures: z.array(keyFeatureSchema).optional(),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  featured: z.boolean().default(false),
  inStock: z.boolean().default(true),
  categoryId: z.string().min(1, 'Category is required'),
})

// ─── Category ─────────────────────────────────────────────────────────────────
export const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  image: z.string().optional(),
})

// ─── Inquiry ──────────────────────────────────────────────────────────────────
export const inquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  productId: z.string().optional(),
})

// ─── Contact ──────────────────────────────────────────────────────────────────
export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
})

// ─── FAQ ──────────────────────────────────────────────────────────────────────
export const faqSchema = z.object({
  question: z.string().min(10, 'Question must be at least 10 characters'),
  answer: z.string().min(20, 'Answer must be at least 20 characters'),
  order: z.number().int().min(0).default(0),
})

// ─── Company ──────────────────────────────────────────────────────────────────
// Accepts null, undefined, empty string, or valid URL string
// The API route converts undefined back to null before writing to DB
const urlField = z
  .union([
    z.string().url('Invalid URL'),
    z.literal(''),
    z.literal(null),
    z.undefined(),
  ])
  .transform((v) => (v === '' || v === null ? undefined : v))
  .optional()

const strField = z
  .union([z.string(), z.literal(null), z.undefined()])
  .transform((v) => (v === null ? undefined : v))
  .optional()

export const companySchema = z.object({
  name: z.string().min(2, 'Company name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone is required'),
  address: z.string().min(5, 'Address is required'),
  description: strField,
  logo: strField,
  website: urlField,
  facebook: urlField,
  instagram: urlField,
  tiktok: urlField,
  whatsApp: urlField,
  twitter: urlField,
})

// ─── Review ───────────────────────────────────────────────────────────────────
export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, 'Comment must be at least 10 characters'),
  productId: z.string().min(1, 'Product ID is required'),
})

// ─── Profile Update ───────────────────────────────────────────────────────────
export const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  address: z.string().optional(),
  image: z.string().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type KeyFeatureInput = z.infer<typeof keyFeatureSchema>
export type ProductInput = z.infer<typeof productSchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type InquiryInput = z.infer<typeof inquirySchema>
export type ContactInput = z.infer<typeof contactSchema>
export type FAQInput = z.infer<typeof faqSchema>
export type CompanyInput = z.infer<typeof companySchema>
export type ReviewInput = z.infer<typeof reviewSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
