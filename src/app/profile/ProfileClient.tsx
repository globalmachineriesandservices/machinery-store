"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { profileUpdateSchema, changePasswordSchema, type ProfileUpdateInput, type ChangePasswordInput } from "@/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import ImageUploader from "@/components/admin/ImageUploader";
import { Loader2, User, Lock, MessageSquare, Star, Package, Eye, EyeOff, CheckCircle2, XCircle, Calendar, Phone, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserData {
  id: string; name: string | null; email: string; image: string | null;
  role: string; phone: string | null; address: string | null;
  createdAt: string; hasPassword: boolean; providers: string[];
  inquiries: Array<{
    id: string; status: string; message: string; createdAt: string;
    product: { name: string; slug: string; images: string[] } | null;
  }>;
  reviews: Array<{
    id: string; rating: number; comment: string; createdAt: string;
    product: { name: string; slug: string };
  }>;
}

export default function ProfileClient({ user }: { user: UserData }) {
  const { update } = useSession();
  const router = useRouter();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string[]>(user.image ? [user.image] : []);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const profileForm = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: { name: user.name || "", phone: user.phone || "", address: user.address || "" },
  });

  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const newPassword = passwordForm.watch("newPassword", "");

  const onProfileSubmit = async (data: ProfileUpdateInput) => {
    setProfileLoading(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, image: avatarUrl[0] || null }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      await update({ name: json.data.name, image: json.data.image });
      toast.success("Profile updated!");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordInput) => {
    setPasswordLoading(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "change-password", ...data }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success("Password changed!");
      passwordForm.reset();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const statusVariant = (s: string) => s === "PENDING" ? "warning" : s === "REPLIED" ? "success" : "secondary";

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <div style={{ background: "hsl(var(--primary))" }} className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-5"
          >
            <Avatar className="h-20 w-20 border-4 border-white/20">
              <AvatarImage src={avatarUrl[0] || user.image || ""} />
              <AvatarFallback className="text-2xl bg-orange-500 text-white font-bold">
                {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-extrabold text-white" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                {user.name || "My Account"}
              </h1>
              <p className="text-white/60 text-sm">{user.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge variant="secondary" className="text-xs bg-white/10 text-white border-white/20">
                  {user.role}
                </Badge>
                {user.providers.map((p) => (
                  <Badge key={p} variant="secondary" className="text-xs bg-white/10 text-white border-white/20 capitalize">
                    {p}
                  </Badge>
                ))}
                <span className="text-white/40 text-xs flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Joined {formatDate(user.createdAt)}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="profile">
          <TabsList className="mb-6 w-full sm:w-auto">
            <TabsTrigger value="profile"><User className="w-4 h-4 mr-1.5" />Profile</TabsTrigger>
            <TabsTrigger value="inquiries">
              <MessageSquare className="w-4 h-4 mr-1.5" />
              Inquiries {user.inquiries.length > 0 && `(${user.inquiries.length})`}
            </TabsTrigger>
            <TabsTrigger value="reviews">
              <Star className="w-4 h-4 mr-1.5" />
              Reviews {user.reviews.length > 0 && `(${user.reviews.length})`}
            </TabsTrigger>
            {user.hasPassword && (
              <TabsTrigger value="security"><Lock className="w-4 h-4 mr-1.5" />Security</TabsTrigger>
            )}
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Personal Information</CardTitle>
                  <CardDescription>Update your profile details.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <div>
                      <Label>Profile Picture</Label>
                      <div className="mt-2">
                        <ImageUploader
                          value={avatarUrl}
                          onChange={setAvatarUrl}
                          maxImages={1}
                          folder="machinery-store/avatars"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Full Name</Label>
                      <Input {...profileForm.register("name")} className="mt-1" />
                      {profileForm.formState.errors.name && (
                        <p className="text-xs text-destructive mt-1">{profileForm.formState.errors.name.message}</p>
                      )}
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <div className="relative mt-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input {...profileForm.register("phone")} placeholder="+1 234 567 8900" className="pl-9" />
                      </div>
                    </div>
                    <div>
                      <Label>Address</Label>
                      <div className="relative mt-1">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input {...profileForm.register("address")} placeholder="Your address" className="pl-9" />
                      </div>
                    </div>
                    <Button type="submit" disabled={profileLoading}>
                      {profileLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Save Changes
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Account Details</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Role</span>
                    <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>{user.role}</Badge>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Member since</span>
                    <span>{formatDate(user.createdAt)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Inquiries</span>
                    <span>{user.inquiries.length}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Reviews</span>
                    <span>{user.reviews.length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Inquiries Tab */}
          <TabsContent value="inquiries">
            <div className="space-y-4">
              {user.inquiries.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center py-16 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                    <p>No inquiries yet.</p>
                    <Button asChild variant="outline" className="mt-4">
                      <Link href="/products">Browse Products</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                user.inquiries.map((inq) => (
                  <Card key={inq.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        {inq.product?.images?.[0] && (
                          <div className="w-14 h-14 rounded-lg overflow-hidden border flex-shrink-0">
                            <Image src={inq.product.images[0]} alt={inq.product?.name || ""} width={56} height={56} className="object-cover w-full h-full" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              {inq.product ? (
                                <Link href={`/products/${inq.product.slug}`} className="font-semibold hover:text-primary transition-colors">
                                  {inq.product.name}
                                </Link>
                              ) : (
                                <p className="font-semibold text-muted-foreground">General Inquiry</p>
                              )}
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{inq.message}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              <Badge variant={statusVariant(inq.status) as "warning" | "success" | "secondary"} className="text-xs">
                                {inq.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{formatDate(inq.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <div className="space-y-4">
              {user.reviews.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center py-16 text-muted-foreground">
                    <Star className="w-12 h-12 mb-3 opacity-20" />
                    <p>No reviews yet.</p>
                    <Button asChild variant="outline" className="mt-4">
                      <Link href="/products">Browse Products to Review</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                user.reviews.map((rev) => (
                  <Card key={rev.id}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <Link href={`/products/${rev.product.slug}`} className="font-semibold hover:text-primary transition-colors">
                            {rev.product.name}
                          </Link>
                          <div className="flex gap-0.5 mt-1 mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={cn("w-4 h-4", i < rev.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground">{rev.comment}</p>
                        </div>
                        <span className="text-xs text-muted-foreground flex-shrink-0">{formatDate(rev.createdAt)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Security Tab */}
          {user.hasPassword && (
            <TabsContent value="security">
              <Card className="max-w-md">
                <CardHeader>
                  <CardTitle className="text-base">Change Password</CardTitle>
                  <CardDescription>Must be at least 8 characters with a number and uppercase letter.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <div>
                      <Label>Current Password</Label>
                      <div className="relative mt-1">
                        <Input type={showCurrent ? "text" : "password"} {...passwordForm.register("currentPassword")} className="h-11 pr-10" />
                        <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="text-xs text-destructive mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
                      )}
                    </div>
                    <div>
                      <Label>New Password</Label>
                      <div className="relative mt-1">
                        <Input type={showNew ? "text" : "password"} {...passwordForm.register("newPassword")} className="h-11 pr-10" />
                        <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {newPassword && (
                        <div className="mt-2 grid grid-cols-2 gap-1">
                          {[
                            { ok: newPassword.length >= 8, label: "8+ characters" },
                            { ok: /[A-Z]/.test(newPassword), label: "Uppercase" },
                            { ok: /[0-9]/.test(newPassword), label: "Number" },
                          ].map(({ ok, label }) => (
                            <div key={label} className="flex items-center gap-1.5">
                              {ok ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <XCircle className="w-3.5 h-3.5 text-muted-foreground" />}
                              <span className={cn("text-xs", ok ? "text-green-700" : "text-muted-foreground")}>{label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {passwordForm.formState.errors.newPassword && (
                        <p className="text-xs text-destructive mt-1">{passwordForm.formState.errors.newPassword.message}</p>
                      )}
                    </div>
                    <div>
                      <Label>Confirm New Password</Label>
                      <Input type="password" {...passwordForm.register("confirmPassword")} className="mt-1 h-11" />
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-xs text-destructive mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>
                    <Button type="submit" disabled={passwordLoading}>
                      {passwordLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Change Password
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
