import { useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCompletePasswordReset } from "@/hooks/usePasswordReset";
import { useTranslation } from "react-i18next";

const passwordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[a-z]/, "Include at least one lowercase letter")
      .regex(/\d/, "Include at least one number")
      .regex(/[^A-Za-z0-9]/, "Include at least one symbol"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((val) => val.newPassword === val.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

const SetPassword = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("sessionId") ?? "";
  const navigate = useNavigate();
  const { t } = useTranslation();

  const completeReset = useCompletePasswordReset();

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (!sessionId) {
      toast({
        title: t("setPassword.invalid_session"),
        description: t("setPassword.missing_session"),
        variant: "destructive",
      });
      navigate("/admin/forgot-password");
    }
  }, [sessionId, navigate, toast, t]);

  const onSubmit = (values: PasswordFormData) => {
    if (!sessionId) return;
    completeReset.mutate(
      { sessionId, newPassword: values.newPassword },
      {
        onSuccess: () => {
          toast({
            title: t("setPassword.toast_updated"),
            description: t("setPassword.toast_login"),
          });
          navigate("/admin/login");
        },
        onError: (error) => {
          const description =
            (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message ?? t("setPassword.toast_failed");
          toast({
            title: t("adminLogin.errors.title", "Reset failed"),
            description,
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8 space-y-6 bg-gradient-card border-border shadow-hover">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              {t("setPassword.secure_reset")}
            </p>
            <h1 className="text-2xl font-serif font-bold text-foreground">
              {t("setPassword.title")}
            </h1>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="newPassword">{t("setPassword.new_password")}</Label>
            <Input
              id="newPassword"
              type="password"
              {...form.register("newPassword")}
            />
            {form.formState.errors.newPassword && (
              <p className="text-xs text-destructive">
                {form.formState.errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              {t("setPassword.confirm_password")}
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              {...form.register("confirmPassword")}
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex justify-between">
            <Link to="/admin/login">{t("setPassword.cancel")}</Link>
            <Button type="submit" disabled={completeReset.isPending}>
              {completeReset.isPending
                ? t("setPassword.saving")
                : t("setPassword.save_new_password")}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SetPassword;
