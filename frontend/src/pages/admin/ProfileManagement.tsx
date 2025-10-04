import { useEffect, useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { isAxiosError } from "axios";
import { User, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  useAdminProfile,
  useUpdateAdminProfile,
  useChangePassword,
} from "@/hooks/useAdminProfile";
import { useTranslation } from "react-i18next";

const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(120, "Full name must be fewer than 120 characters"),
  email: z.string().trim().email("Invalid email address"),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^[+]?\d{8,15}$/u, "Phone number must be 8-15 digits"),
});

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

// verification badge removed (profile page no longer shows verification state)

const ProfileSkeleton = () => (
  <Card className="p-6 bg-gradient-card border-border space-y-6">
    <div className="flex items-center gap-3">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2 w-full">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
    </div>
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-40" />
    </div>
  </Card>
);

const ProfileManagement = () => {
  const { toast } = useToast();
  const { data: profile, isLoading, isRefetching } = useAdminProfile();
  const updateProfile = useUpdateAdminProfile();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (!profile) return;

    reset({
      fullName: profile.fullName,
      email: profile.email,
      phoneNumber: profile.phoneNumber,
    });
    // keep readonly view by default; editing toggles allow updates
  }, [profile, reset]);

  const onProfileSubmit = (values: ProfileFormData) => {
    updateProfile.mutate(
      {
        fullName: values.fullName,
        email: values.email,
        phoneNumber: values.phoneNumber,
      },
      {
        onSuccess: (data) => {
          toast({
            title: t("profile.toast_updated"),
            description: data.message,
          });
          reset({
            fullName: data.profile.fullName,
            email: data.profile.email,
            phoneNumber: data.profile.phoneNumber,
          });
          setIsEditingProfile(false);
        },
        onError: (error) => {
          const description = isAxiosError(error)
            ? error.response?.data?.message ?? t("profile.toast_unable_update")
            : t("profile.toast_unable_update");

          toast({
            title: t("profile.toast_update_failed"),
            description,
            variant: "destructive",
          });
        },
      }
    );
  };

  const onPasswordSubmit = (values: PasswordFormData) => {
    if (values.newPassword !== values.confirmPassword) {
      toast({
        title: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Password update pending",
      description:
        "Password changes are managed via the secure reset flow. Use the 'Forgot Password' option on the login screen.",
    });
    resetPassword();
  };

  // verification/resend flows removed from profile management UI

  const isSavingProfile = updateProfile.isPending || isRefetching;
  const changePassword = useChangePassword();

  return (
    <div className="p-4 md:p-8 space-y-8 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-2">
          {t("profile.title")}
        </h1>
        <p className="text-muted-foreground">{t("profile.subtitle")}</p>
      </div>

      {isLoading && !profile ? (
        <ProfileSkeleton />
      ) : (
        <Card className="p-6 bg-gradient-card border-border space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold font-serif text-foreground">
                  {t("profile.profile_info")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t("profile.profile_info_desc")}
                </p>
              </div>
            </div>
            {profile && (
              <Badge variant="outline" className="uppercase">
                {profile.role}
              </Badge>
            )}
          </div>

          {isEditingProfile ? (
            <form
              onSubmit={handleSubmit(onProfileSubmit)}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="fullName">{t("profile.full_name")}</Label>
                <Input
                  id="fullName"
                  placeholder="Jane Doe"
                  {...register("fullName")}
                  className={errors.fullName ? "border-destructive" : ""}
                  disabled={isSavingProfile}
                />
                {errors.fullName && (
                  <p className="text-xs text-destructive">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Label htmlFor="email">{t("profile.email")}</Label>
                  <div className="flex items-center gap-2"></div>
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  {...register("email")}
                  className={errors.email ? "border-destructive" : ""}
                  disabled={isSavingProfile}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Label htmlFor="phoneNumber">{t("profile.phone")}</Label>
                  <div className="flex items-center gap-2"></div>
                </div>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+1234567890"
                  {...register("phoneNumber")}
                  className={errors.phoneNumber ? "border-destructive" : ""}
                  disabled={isSavingProfile}
                />
                {errors.phoneNumber && (
                  <p className="text-xs text-destructive">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isSavingProfile}
                >
                  {isSavingProfile
                    ? t("profile.saving")
                    : t("profile.save_changes")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    reset({
                      fullName: profile?.fullName ?? "",
                      email: profile?.email ?? "",
                      phoneNumber: profile?.phoneNumber ?? "",
                    });
                    setIsEditingProfile(false);
                  }}
                >
                  {t("profile.cancel")}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <Label>{t("profile.full_name")}</Label>
                <div className="rounded-md bg-muted/20 p-3 text-sm text-foreground">
                  {profile?.fullName ?? "—"}
                </div>
              </div>

              <div>
                <Label>{t("profile.email")}</Label>
                <div className="rounded-md bg-muted/20 p-3 text-sm text-foreground">
                  {profile?.email ?? "—"}
                </div>
              </div>

              <div>
                <Label>{t("profile.phone")}</Label>
                <div className="rounded-md bg-muted/20 p-3 text-sm text-foreground">
                  {profile?.phoneNumber ?? "—"}
                </div>
              </div>

              <div>
                <Button
                  type="button"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => setIsEditingProfile(true)}
                >
                  {t("profile.edit_profile")}
                </Button>
              </div>
            </div>
          )}

          {/* verification UI removed from profile page */}
        </Card>
      )}

      <Separator />

      <Card className="p-6 bg-gradient-card border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold font-serif text-foreground">
              {t("profile.change_password")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("profile.change_password_desc")}
            </p>
          </div>
        </div>
        {!isChangingPassword ? (
          <div className="flex gap-2">
            <Button
              onClick={() => setIsChangingPassword(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {t("profile.change_password")}
            </Button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmitPassword(async (values) => {
              try {
                await changePassword.mutateAsync({
                  currentPassword: values.currentPassword,
                  newPassword: values.newPassword,
                });
                toast({
                  title: "Password updated",
                  description: "Your password has been changed.",
                });
                resetPassword();
                setIsChangingPassword(false);
              } catch (error) {
                const description = isAxiosError(error)
                  ? error.response?.data?.message ?? "Unable to change password"
                  : "Unable to change password";
                toast({
                  title: "Change failed",
                  description,
                  variant: "destructive",
                });
              }
            })}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                {...registerPassword("currentPassword")}
                className={
                  passwordErrors.currentPassword ? "border-destructive" : ""
                }
              />
              {passwordErrors.currentPassword && (
                <p className="text-xs text-destructive">
                  {passwordErrors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">{t("profile.new_password")}</Label>
              <Input
                id="newPassword"
                type="password"
                {...registerPassword("newPassword")}
                className={
                  passwordErrors.newPassword ? "border-destructive" : ""
                }
              />
              {passwordErrors.newPassword && (
                <p className="text-xs text-destructive">
                  {passwordErrors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {t("profile.confirm_password")}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                {...registerPassword("confirmPassword")}
                className={
                  passwordErrors.confirmPassword ? "border-destructive" : ""
                }
              />
              {passwordErrors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {passwordErrors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="rounded-lg bg-muted/50 p-4 text-xs text-muted-foreground">
              <p className="font-semibold">
                {t("profile.password_requirements")}
              </p>
              <p>{t("profile.pw_req_1")}</p>
              <p>{t("profile.pw_req_2")}</p>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {t("profile.save_changes")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsChangingPassword(false)}
              >
                {t("profile.cancel")}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default ProfileManagement;
