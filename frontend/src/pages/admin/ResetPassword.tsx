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

type ResetStep =
  | "verify-email"
  | "enter-sms"
  | "set-password"
  | "complete"
  | "error";

const ResetPassword = () => {
  const { toast } = useToast();
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

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
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
              title: "Email verified",
              description: "We've sent a verification code to your phone.",
            });
          } else {
            setStep("set-password");
            toast({
              title: "Email verified",
              description: "You can reset your password now.",
            });
          }
        },
        onError: (error) => {
          const description =
            (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message ?? "Email verification failed or link expired.";
          setStep("error");
          setErrorMessage(description);
          toast({
            title: "Verification failed",
            description,
            variant: "destructive",
          });
        },
      }
    );
  }, [step, sessionId, token, verifyEmail, toast]);

  const handleSmsSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!sessionId || smsCode.length < 4) return;

    verifySms.mutate(
      { sessionId, code: smsCode },
      {
        onSuccess: () => {
          setStep("set-password");
          toast({
            title: "Phone verified",
            description: "You can now set a new password.",
          });
        },
        onError: (error) => {
          const description =
            (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message ?? "Verification code is invalid or expired.";
          toast({
            title: "Code error",
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
      setErrorMessage("Invalid password reset session.");
      return;
    }

    completeReset.mutate(
      { sessionId, newPassword: values.newPassword },
      {
        onSuccess: (data) => {
          setStep("complete");
          toast({
            title: "Password updated",
            description:
              data.message ?? "You can log in with your new password now.",
          });
        },
        onError: (error) => {
          const description =
            (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message ??
            "Unable to reset password. Please restart the process.";
          toast({
            title: "Reset failed",
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
              Unable to continue
            </h2>
            <p className="text-sm text-muted-foreground">
              {errorMessage ??
                "The verification link is invalid or has expired."}
            </p>
          </div>
          <div className="flex justify-center">
            <Link to="/admin/forgot-password">
              <Button variant="outline">Start over</Button>
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
              Verifying your email...
            </h2>
            <p className="text-sm text-muted-foreground">
              Please wait while we confirm your secure reset request.
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
              Enter verification code
            </h2>
            <p className="text-sm text-muted-foreground">
              We sent a 6-digit code to your registered phone number.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="smsCode">Verification Code</Label>
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
            {verifySms.isPending ? "Verifying..." : "Verify code"}
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
              Set a new password
            </h2>
            <p className="text-sm text-muted-foreground">
              Choose a strong password you haven't used before.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
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
            <Label htmlFor="confirmPassword">Confirm Password</Label>
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
            <p className="font-semibold">Password requirements</p>
            <p>• Minimum 8 characters</p>
            <p>• Include uppercase, lowercase, numbers, and symbols</p>
            <p>• Avoid passwords used elsewhere</p>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={completeReset.isPending}
          >
            {completeReset.isPending ? "Saving..." : "Save new password"}
          </Button>
        </form>
      );
    }

    return (
      <div className="space-y-4 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            Password updated successfully
          </h2>
          <p className="text-sm text-muted-foreground">
            You can now log in with your new password.
          </p>
        </div>
        <div className="flex justify-center">
          <Link to="/admin/login">
            <Button>Return to login</Button>
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
              Secure reset
            </p>
            <h1 className="text-2xl font-serif font-bold text-foreground">
              Admin Password Reset
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
