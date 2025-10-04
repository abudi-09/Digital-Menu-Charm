import { useEffect, useMemo, useState, useRef, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  useCompletePasswordReset,
  useVerifyResetEmail,
  useVerifyResetSms,
} from "@/hooks/usePasswordReset";
import { CheckCircle2, Loader2, MessageSquare, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

const buildSchema = (t: (k: string, def?: string) => string) =>
  z
    .object({
      newPassword: z
        .string()
        .min(
          8,
          t("resetPassword.pw_req_1", "Password must be at least 8 characters")
        )
        .regex(
          /[A-Z]/,
          t("profile.pw_req_2", "Include at least one uppercase letter")
        )
        .regex(
          /[a-z]/,
          t("profile.pw_req_2", "Include at least one lowercase letter")
        )
        .regex(/\d/, t("profile.pw_req_2", "Include at least one number"))
        .regex(
          /[^A-Za-z0-9]/,
          t("profile.pw_req_2", "Include at least one symbol")
        ),
      confirmPassword: z
        .string()
        .min(
          8,
          t("resetPassword.pw_req_1", "Password must be at least 8 characters")
        ),
    })
    .refine((val) => val.newPassword === val.confirmPassword, {
      message: t("resetPassword.passwords_no_match", "Passwords do not match"),
      path: ["confirmPassword"],
    });

type PasswordFormData = z.infer<ReturnType<typeof buildSchema>>;

type ResetStep =
  | "verify-email"
  | "enter-sms"
  | "set-password"
  | "complete"
  | "error";

const ResetPassword = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("sessionId") ?? "";
  const token = searchParams.get("token") ?? "";

  const [step, setStep] = useState<ResetStep>(() =>
    sessionId && token ? "verify-email" : "error"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [smsCode, setSmsCode] = useState("");

  const verifyEmail = useVerifyResetEmail();
  const verifySms = useVerifyResetSms();
  const completeReset = useCompletePasswordReset();

  // guard to ensure we only trigger email verification once per mount/link
  const didTriggerEmailVerify = useRef(false);

  const tt = (k: string, def?: string) =>
    def ? t(k, { defaultValue: def }) : t(k);

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(buildSchema(tt)),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const isBusy = useMemo(
    () =>
      verifyEmail.isPending || verifySms.isPending || completeReset.isPending,
    [verifyEmail.isPending, verifySms.isPending, completeReset.isPending]
  );
  useEffect(() => {
    if (step !== "verify-email" || !sessionId || !token) {
      return;
    }

    // prevent duplicate calls when component re-renders or React strict mode causes double effect
    if (didTriggerEmailVerify.current) return;
    didTriggerEmailVerify.current = true;

    verifyEmail.mutate(
      { sessionId, token },
      {
        onSuccess: ({ smsRequired }) => {
          setSmsCode("");
          if (smsRequired) {
            setStep("enter-sms");
            toast({
              title: t("adminLogin.success.title", "Email verified"),
              description: t("resetPassword.enter_sms_desc"),
            });
          } else {
            setStep("set-password");
            toast({
              title: t("adminLogin.success.title", "Email verified"),
              description: t("resetPassword.set_password_desc"),
            });
          }
        },
        onError: (error) => {
          const description =
            (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message ?? t("resetPassword.link_invalid");
          setStep("error");
          setErrorMessage(description);
          toast({
            title: t("resetPassword.verification_failed"),
            description,
            variant: "destructive",
          });
        },
      }
    );
  }, [step, sessionId, token, verifyEmail, toast, t]);

  const handleSmsSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!sessionId || smsCode.length < 4) return;

    verifySms.mutate(
      { sessionId, code: smsCode },
      {
        onSuccess: () => {
          setStep("set-password");
          toast({
            title: t("forgotPassword.phone_verified"),
            description: t("forgotPassword.you_can_set_password"),
          });
        },
        onError: (error) => {
          const description =
            (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message ?? t("forgotPassword.code_invalid");
          toast({
            title: t("forgotPassword.code_error"),
            description,
            variant: "destructive",
          });
        },
      }
    );
  };

  const handlePasswordSubmit = (values: PasswordFormData) => {
    if (!sessionId) {
      setStep("error");
      setErrorMessage(t("setPassword.missing_session"));
      return;
    }

    completeReset.mutate(
      { sessionId, newPassword: values.newPassword },
      {
        onSuccess: (data) => {
          setStep("complete");
          toast({
            title: t("profile.toast_password_updated", "Password updated"),
            description: data.message ?? t("resetPassword.complete_desc"),
          });
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

  const renderContent = () => {
    if (step === "error") {
      return (
        <div className="space-y-4 text-center">
          <Shield className="mx-auto h-10 w-10 text-destructive" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              {t("resetPassword.unable_continue")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {errorMessage ?? t("resetPassword.link_invalid")}
            </p>
          </div>
          <div className="flex justify-center">
            <Link to="/admin/forgot-password">
              <Button variant="outline">{t("resetPassword.start_over")}</Button>
            </Link>
          </div>
        </div>
      );
    }

    if (step === "verify-email") {
      return (
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              {t("resetPassword.verifying_email")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("resetPassword.please_wait")}
            </p>
          </div>
        </div>
      );
    }

    if (step === "enter-sms") {
      return (
        <form onSubmit={handleSmsSubmit} className="space-y-6">
          <div className="space-y-2 text-center">
            <MessageSquare className="mx-auto h-10 w-10 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">
              {t("resetPassword.enter_sms_title")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("resetPassword.enter_sms_desc")}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="smsCode">
              {t("forgotPassword.verification_code")}
            </Label>
            <Input
              id="smsCode"
              inputMode="numeric"
              pattern="\d*"
              maxLength={6}
              value={smsCode}
              onChange={(event) =>
                setSmsCode(event.target.value.replace(/[^\d]/g, ""))
              }
              placeholder="000000"
              className="text-center text-lg tracking-[0.4em]"
              disabled={verifySms.isPending}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={verifySms.isPending || smsCode.length < 4}
          >
            {verifySms.isPending
              ? t("forgotPassword.verifying")
              : t("forgotPassword.verify_code")}
          </Button>
        </form>
      );
    }

    if (step === "set-password") {
      return (
        <form
          onSubmit={form.handleSubmit(handlePasswordSubmit)}
          className="space-y-6"
        >
          <div className="space-y-2 text-center">
            <Shield className="mx-auto h-10 w-10 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">
              {t("resetPassword.set_password_title")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("resetPassword.set_password_desc")}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">
              {t("resetPassword.new_password")}
            </Label>
            <Input
              id="newPassword"
              type="password"
              {...form.register("newPassword")}
              className={
                form.formState.errors.newPassword ? "border-destructive" : ""
              }
              disabled={completeReset.isPending}
            />
            {form.formState.errors.newPassword && (
              <p className="text-xs text-destructive">
                {form.formState.errors.newPassword.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              {t("resetPassword.confirm_password")}
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              {...form.register("confirmPassword")}
              className={
                form.formState.errors.confirmPassword
                  ? "border-destructive"
                  : ""
              }
              disabled={completeReset.isPending}
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>
          <div className="rounded-lg bg-muted/50 p-4 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold">
              {t("resetPassword.pw_requirements")}
            </p>
            <p>{t("resetPassword.pw_req_1")}</p>
            <p>{t("resetPassword.pw_req_2")}</p>
            <p>{t("resetPassword.pw_req_3")}</p>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={completeReset.isPending}
          >
            {completeReset.isPending
              ? t("resetPassword.saving")
              : t("resetPassword.save_new_password")}
          </Button>
        </form>
      );
    }

    return (
      <div className="space-y-4 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            {t("resetPassword.complete_title")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("resetPassword.complete_desc")}
          </p>
        </div>
        <div className="flex justify-center">
          <Link to="/admin/login">
            <Button>{t("resetPassword.return_login")}</Button>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8 space-y-6 bg-gradient-card border-border shadow-hover">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              {t("resetPassword.secure_reset")}
            </p>
            <h1 className="text-2xl font-serif font-bold text-foreground">
              {t("resetPassword.title")}
            </h1>
          </div>
          {isBusy && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
        </div>

        {renderContent()}
      </Card>
    </div>
  );
};

export default ResetPassword;
