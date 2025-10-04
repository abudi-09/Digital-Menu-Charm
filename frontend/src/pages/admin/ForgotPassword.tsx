import { ShieldCheck, Mail, MessageSquare, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label as UiLabel } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  usePasswordResetIdentity,
  usePasswordResetRequest,
  useVerifyResetSms,
} from "@/hooks/usePasswordReset";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const requestSchema = z.object({
  method: z.enum(["email", "phone"]),
  value: z.string().trim().min(1, "A value is required"),
});

type RequestFormValues = z.infer<typeof requestSchema>;

const ForgotPassword = () => {
  const { toast } = useToast();
  const identity = usePasswordResetIdentity();
  const requestReset = usePasswordResetRequest();
  const verifySms = useVerifyResetSms();
  const navigate = useNavigate();

  const [phoneSessionId, setPhoneSessionId] = useState<string | null>(null);
  const [smsCode, setSmsCode] = useState("");

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      method: "email",
      value: "",
    },
    mode: "onChange",
  });

  const handleRequest = form.handleSubmit((values) => {
    requestReset.mutate(values, {
      onSuccess: (data) => {
        // If user requested phone (SMS) method, the response includes sessionId
        if (values.method === "phone" && data.sessionId) {
          setPhoneSessionId(data.sessionId);
          toast({
            title: "Verification sent",
            description:
              data.message ?? "We've sent an SMS with a verification code.",
          });
          return;
        }

        toast({
          title: "Reset link sent",
          description:
            data.message ??
            "Check your email to continue the secure password reset flow.",
        });
        form.reset({ email: "", phoneNumber: "" });
      },
      onError: (error) => {
        const description =
          (error as { response?: { data?: { message?: string } } }).response
            ?.data?.message ??
          "Unable to start password reset. Please try again.";
        toast({
          title: "Request failed",
          description,
          variant: "destructive",
        });
      },
    });
  });

  const handleSmsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneSessionId || smsCode.length < 4) return;

    verifySms.mutate(
      { sessionId: phoneSessionId, code: smsCode },
      {
        onSuccess: () => {
          toast({
            title: "Phone verified",
            description: "You can now set a new password.",
          });
          navigate(`/admin/set-password?sessionId=${phoneSessionId}`);
        },
        onError: (error) => {
          const description =
            (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message ?? "Verification code is invalid or expired.";
          toast({ title: "Code error", description, variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-xl p-8 space-y-6 bg-gradient-card border-border shadow-hover animate-scale-in">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">
              Secure Password Recovery
            </h1>
            <p className="text-sm text-muted-foreground">
              We'll guide you through a verified email and SMS process to reset
              your password safely.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-background/70 p-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-primary" />
              <div>
                <p className="font-medium text-foreground">Choose method</p>
                <p className="text-sm text-muted-foreground">
                  Select whether you'd like to receive a verification email or
                  an SMS code to reset your password.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={handleRequest} className="space-y-6">
            <div className="space-y-4 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Verify your details</p>
              <p>
                Enter the email address and phone number associated with your
                admin account. We'll only send the reset link if both match our
                records.
              </p>
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification method</FormLabel>
                    <div className="flex items-center gap-4">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="radio"
                          value="email"
                          checked={field.value === "email"}
                          onChange={() => field.onChange("email")}
                        />
                        <span className="text-sm">Email</span>
                      </label>
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="radio"
                          value="phone"
                          checked={field.value === "phone"}
                          onChange={() => field.onChange("phone")}
                        />
                        <span className="text-sm">SMS (phone)</span>
                      </label>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {form.watch("method") === "email"
                        ? "Email address"
                        : "Phone number"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          form.watch("method") === "email"
                            ? "you@example.com"
                            : "+1234567890"
                        }
                        autoComplete={
                          form.watch("method") === "email" ? "email" : "tel"
                        }
                        disabled={requestReset.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> Back to login
              </Link>
              <Button
                type="submit"
                className="gap-2"
                disabled={
                  identity.isLoading ||
                  requestReset.isPending ||
                  !form.formState.isValid
                }
              >
                {requestReset.isPending ? "Sending..." : "Send verification"}
              </Button>
            </div>
          </form>
        </Form>

        {phoneSessionId && (
          <div className="mt-6">
            <form onSubmit={handleSmsSubmit} className="space-y-4">
              <div className="text-center space-y-2">
                <MessageSquare className="mx-auto h-8 w-8 text-primary" />
                <p className="font-medium">Enter the code sent to your phone</p>
                <p className="text-sm text-muted-foreground">
                  If you didn't receive the code, try again or check your
                  number.
                </p>
              </div>
              <div>
                <UiLabel htmlFor="otp">Verification Code</UiLabel>
                <Input
                  id="otp"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={6}
                  value={smsCode}
                  onChange={(e) =>
                    setSmsCode(e.target.value.replace(/[^\d]/g, ""))
                  }
                  placeholder="000000"
                  className="text-center text-lg tracking-[0.4em]"
                  disabled={verifySms.isPending}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={verifySms.isPending || smsCode.length < 4}
                >
                  {verifySms.isPending ? "Verifying..." : "Verify code"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPhoneSessionId(null)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword;
