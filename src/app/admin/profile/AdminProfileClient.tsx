"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { profileUpdateSchema, changePasswordSchema, type ProfileUpdateInput, type ChangePasswordInput } from "@/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ImageUploader from "@/components/admin/ImageUploader";
import { Loader2, User, Lock, ShieldCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface UserData {
  id: string; name: string | null; email: string; image: string | null;
  role: string; phone: string | null; address: string | null;
  createdAt: string; hasPassword: boolean; providers: string[];
}

export default function AdminProfileClient({ user }: { user: UserData }) {
  const { update } = useSession();
  const router = useRouter();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string[]>(user.image ? [user.image] : []);

  const profileForm = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: { name: user.name || "", phone: user.phone || "", address: user.address || "" },
  });

  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

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
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
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
      toast.success("Password changed successfully!");
      passwordForm.reset();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Tabs defaultValue="profile">
      <TabsList className="mb-6">
        <TabsTrigger value="profile"><User className="w-4 h-4 mr-2" />Profile</TabsTrigger>
        {user.hasPassword && (
          <TabsTrigger value="security"><Lock className="w-4 h-4 mr-2" />Security</TabsTrigger>
        )}
      </TabsList>

      {/* Profile Tab */}
      <TabsContent value="profile">
        <div className="space-y-6">
          {/* Account info card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={avatarUrl[0] || user.image || ""} />
                  <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                    {user.name?.[0]?.toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="default" className="text-xs"><ShieldCheck className="w-3 h-3 mr-1" />{user.role}</Badge>
                    {user.providers.map((p) => (
                      <Badge key={p} variant="outline" className="text-xs capitalize">{p}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              <Separator className="my-4" />
              <p className="text-xs text-muted-foreground">Member since {formatDate(user.createdAt)}</p>
            </CardContent>
          </Card>

          {/* Edit form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Edit Profile</CardTitle>
              <CardDescription>Update your personal information.</CardDescription>
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
                  <Label>Phone Number</Label>
                  <Input {...profileForm.register("phone")} placeholder="+1 234 567 8900" className="mt-1" />
                </div>

                <div>
                  <Label>Address</Label>
                  <Input {...profileForm.register("address")} placeholder="Your address" className="mt-1" />
                </div>

                <Button type="submit" disabled={profileLoading}>
                  {profileLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Security Tab */}
      {user.hasPassword && (
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Change Password</CardTitle>
              <CardDescription>Must be at least 8 characters with uppercase and number.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-sm">
                <div>
                  <Label>Current Password</Label>
                  <Input type="password" {...passwordForm.register("currentPassword")} className="mt-1" />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-xs text-destructive mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
                  )}
                </div>
                <div>
                  <Label>New Password</Label>
                  <Input type="password" {...passwordForm.register("newPassword")} className="mt-1" />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-xs text-destructive mt-1">{passwordForm.formState.errors.newPassword.message}</p>
                  )}
                </div>
                <div>
                  <Label>Confirm New Password</Label>
                  <Input type="password" {...passwordForm.register("confirmPassword")} className="mt-1" />
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
  );
}
