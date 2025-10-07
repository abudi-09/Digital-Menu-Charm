import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import * as z from "zod";
import { Wine, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { setToken } from "@/lib/auth";
import { useTranslation } from "react-i18next";

const loginSchema = z.object({
  email: z.string().trim().email("adminLogin.errors.invalid_email"),
  password: z.string().min(6, "adminLogin.errors.password_min"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: (payload: LoginFormData) =>
      api.post<{
        token: string;
        admin: {
          id: string;
          fullName: string;
          email: string;
          phoneNumber: string;
          role: string;
          emailVerified: boolean;
          phoneVerified: boolean;
        };
      }>("/admin/login", payload),
    onSuccess: ({ data }) => {
      setToken(data.token);
      toast({
        title: t("adminLogin.success.title"),
        description: t("adminLogin.success.welcome", {
          name: data.admin.fullName || data.admin.email,
        }),
      });
      navigate("/admin/dashboard", { replace: true });
    },
    onError: (error: unknown) => {
      const description = isAxiosError(error)
        ? error.response?.data?.message ??
          t("adminLogin.errors.invalid_credentials")
        : t("adminLogin.errors.unable_to_login");
      toast({
        title: t("adminLogin.errors.title"),
        description,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="absolute top-6 left-6">
        <button
          aria-label={t("common.back")}
          onClick={() => navigate("/")}
          className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-muted/60 hover:bg-muted text-foreground shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
      <Card className="w-full max-w-md p-8 bg-gradient-card border-border shadow-hover animate-scale-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
            <Wine className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold font-serif text-foreground mb-2">
            {t("adminLogin.title")}
          </h1>
          <p className="text-muted-foreground">{t("adminLogin.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">{t("adminLogin.email_label")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("adminLogin.email_placeholder")}
              {...register("email")}
              className={errors.email ? "border-destructive" : ""}
              disabled={loginMutation.isPending}
            />
            {errors.email && (
              <p className="text-xs text-destructive">
                {t(String(errors.email.message))}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("adminLogin.password_label")}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("adminLogin.password_placeholder")}
                {...register("password")}
                className={
                  errors.password ? "border-destructive pr-10" : "pr-10"
                }
                disabled={loginMutation.isPending}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">
                {t(String(errors.password.message))}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending
              ? t("adminLogin.logging_in")
              : t("adminLogin.login_button")}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <Link
            to="/admin/forgot-password"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {t("adminLogin.forgot_password")}
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default AdminLogin;
