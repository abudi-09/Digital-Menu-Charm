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

  const completeReset = useCompletePasswordReset();

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (!sessionId) {
      toast({
        title: "Invalid session",
        description: "Missing password reset session. Please try again.",
        variant: "destructive",
      });
      navigate("/admin/forgot-password");
    }
  }, [sessionId, navigate, toast]);

  const onSubmit = (values: PasswordFormData) => {
    if (!sessionId) return;
    completeReset.mutate(
      { sessionId, newPassword: values.newPassword },
      {
        onSuccess: () => {
          toast({
            title: "Password updated",
            description: "You can now log in.",
          });
          navigate("/admin/login");
        },
        onError: (error) => {
          const description =
            (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message ??
            "Unable to reset password. Please restart the process.";
          toast({ title: "Reset failed", description, variant: "destructive" });
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
              Secure reset
            </p>
            <h1 className="text-2xl font-serif font-bold text-foreground">
              Set new password
            </h1>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
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
            <Label htmlFor="confirmPassword">Confirm Password</Label>
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
            <Link to="/admin/login">Cancel</Link>
            <Button type="submit" disabled={completeReset.isPending}>
              {completeReset.isPending ? "Saving..." : "Save new password"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SetPassword;
