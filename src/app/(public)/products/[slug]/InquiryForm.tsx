"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { inquirySchema, type InquiryInput } from "@/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, MessageSquare, CheckCircle } from "lucide-react";

interface Props {
  productId: string;
  productName: string;
  userId?: string;
  userEmail?: string | null;
  userName?: string | null;
}

export default function InquiryForm({ productId, productName, userId, userEmail, userName }: Props) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<InquiryInput>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: userName || "",
      email: userEmail || "",
      message: `Hi, I'm interested in the ${productName} and would like to receive pricing and availability information.`,
      productId,
    },
  });

  const onSubmit = async (data: InquiryInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, productId }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setSubmitted(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send inquiry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setSubmitted(false); reset(); } }}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full font-semibold">
          <MessageSquare className="w-5 h-5 mr-2" />Request Information
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request Information</DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Inquiry Sent!</h3>
            <p className="text-muted-foreground text-sm">
              Thank you for your interest in <strong>{productName}</strong>.
              Our team will contact you shortly with pricing and details.
            </p>
            <Button className="mt-6" onClick={() => { setOpen(false); setSubmitted(false); }}>
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register("productId")} />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Name *</Label>
                <Input {...register("name")} placeholder="Your name" className="mt-1" />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label>Email *</Label>
                <Input type="email" {...register("email")} placeholder="your@email.com" className="mt-1" />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Phone</Label>
                <Input {...register("phone")} placeholder="+1 234 567 8900" className="mt-1" />
              </div>
              <div>
                <Label>Company</Label>
                <Input {...register("company")} placeholder="Company name" className="mt-1" />
              </div>
            </div>

            <div>
              <Label>Message *</Label>
              <Textarea {...register("message")} rows={4} className="mt-1" />
              {errors.message && <p className="text-xs text-destructive mt-1">{errors.message.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Send Inquiry
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
