import { Role } from "@/generated/prisma/enums";

// ─── User ─────────────────────────────────────────────────────────────────────
export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: Role;
  phone: string | null;
  address: string | null;
  createdAt: Date;
}

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: Role;
}

// ─── Category ─────────────────────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: { products: number };
}

// ─── Product ──────────────────────────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  specifications: Record<string, string> | null;
  images: string[];
  featured: boolean;
  inStock: boolean;
  categoryId: string;
  category: Category;
  createdAt: Date;
  updatedAt: Date;
  _count?: { reviews: number; inquiries: number };
  reviews?: Review[];
}

export interface ProductFilters {
  categoryId?: string;
  search?: string;
  featured?: boolean;
  inStock?: boolean;
  page?: number;
  limit?: number;
}

// ─── Review ───────────────────────────────────────────────────────────────────
export interface Review {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  productId: string;
  user: { name: string | null; image: string | null };
  createdAt: Date;
  updatedAt: Date;
}

// ─── Inquiry ──────────────────────────────────────────────────────────────────
export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string;
  status: "PENDING" | "REPLIED" | "CLOSED";
  productId: string | null;
  userId: string | null;
  product?: { name: string; slug: string } | null;
  user?: { name: string | null; email: string } | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Company ──────────────────────────────────────────────────────────────────
export interface CompanyDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  description: string | null;
  logo: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  whatsApp: string | null;
  twitter: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Contact ──────────────────────────────────────────────────────────────────
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

// ─── API Responses ────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Admin Dashboard Stats ────────────────────────────────────────────────────
export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalUsers: number;
  totalInquiries: number;
  pendingInquiries: number;
  recentInquiries: Inquiry[];
  featuredProducts: number;
}
