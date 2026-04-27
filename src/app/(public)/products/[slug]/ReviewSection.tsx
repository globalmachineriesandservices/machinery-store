"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { reviewSchema, type ReviewInput } from "@/schemas";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Star, Loader2, MessageSquare } from "lucide-react";

interface Review {
  id: string; rating: number; comment: string; createdAt: string;
  user: { name: string | null; image: string | null };
}

interface Props {
  productId: string;
  reviews: Review[];
  isLoggedIn: boolean;
  userId?: string;
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <Star className={`w-7 h-7 transition-colors ${(hover || value) >= star ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ productId, reviews: initialReviews, isLoggedIn, userId }: Props) {
  const [reviews, setReviews] = useState(initialReviews);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [showForm, setShowForm] = useState(false);

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5, productId },
  });

  const onSubmit = async (data: ReviewInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, rating, productId }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setReviews((prev) => [json.data, ...prev]);
      toast.success("Review submitted!");
      setShowForm(false);
      reset();
      setRating(5);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <Separator className="mb-10" />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-extrabold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            REVIEWS {reviews.length > 0 && `(${reviews.length})`}
          </h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{avgRating.toFixed(1)} out of 5</span>
            </div>
          )}
        </div>
        {isLoggedIn && !showForm && (
          <Button variant="outline" onClick={() => setShowForm(true)}>
            <Star className="w-4 h-4 mr-2" />Write a Review
          </Button>
        )}
        {!isLoggedIn && (
          <Button variant="outline" asChild>
            <Link href="/auth/login">Sign in to Review</Link>
          </Button>
        )}
      </div>

      {/* Write review form */}
      {showForm && (
        <div className="bg-muted/40 rounded-2xl p-6 mb-8 border">
          <h3 className="font-semibold mb-4">Your Review</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label className="mb-2 block">Rating</Label>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <div>
              <Label>Comment *</Label>
              <Textarea {...register("comment")} placeholder="Share your experience with this product..." rows={4} className="mt-1" />
              {errors.comment && <p className="text-xs text-destructive mt-1">{errors.comment.message}</p>}
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Submit Review
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="flex gap-4">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={review.user.image || ""} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {review.user.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="font-semibold text-sm">{review.user.name || "Anonymous"}</p>
                  <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
                </div>
                <div className="flex gap-0.5 mt-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
