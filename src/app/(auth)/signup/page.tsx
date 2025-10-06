"use client";

import { z } from "zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail } from "lucide-react";

// UI Components
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Custom Components
import FormBuilder, { FormType } from "@/components/core/FormBuilder";

// Hooks & Utils
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";
import { supabaseClient } from "@/utils/client";
import { GridPattern } from "@/components/ui/grid-pattern";
import { cn } from "@/lib/utils";

// ============================================================================
// SCHEMAS
// ============================================================================

const signupSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const otpSchema = z.object({
  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

// ============================================================================
// TYPES
// ============================================================================

type SignupFormData = z.infer<typeof signupSchema>;
type OtpFormData = z.infer<typeof otpSchema>;
type StepType = "signup" | "otp" | "adminPermission";

// ============================================================================
// FORM CONFIGURATIONS
// ============================================================================

const signupFormConfig: FormType = [
  {
    label: "Email",
    name: "email",
    input_type: "email",
    placeholder: "example@gmail.com",
    leftIcon: <Mail size={16} />,
  },
  {
    label: "Password",
    name: "password",
    input_type: "password",
    placeholder: "Enter your password",
    leftIcon: <Lock size={16} />,
  },
  {
    label: "Confirm Password",
    name: "confirmPassword",
    input_type: "password",
    placeholder: "Confirm your password",
    leftIcon: <Lock size={16} />,
  },
];

const otpFormConfig: FormType = [
  {
    name: "otp",
    input_type: "otp",
    placeholder: "Enter 6-digit OTP",
  },
];

// ============================================================================
// CONSTANTS
// ============================================================================

const RESEND_TIMER_DURATION = 30;

const TOAST_SUCCESS_STYLE = {
  background: "hsl(var(--background))",
  color: "hsl(var(--foreground))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "var(--radius)",
  padding: "16px",
  fontSize: "14px",
  fontWeight: "500",
  boxShadow: "0 4px 12px -4px hsl(var(--foreground) / 0.1)",
} as const;

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const AdminPermissionScreen = () => (
  <Card className="border-0 shadow-xl bg-gradient-to-b from-background to-muted/30">
    <CardHeader className="text-center pb-8 pt-12">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Lock className="h-8 w-8 text-primary" />
      </div>
      <CardTitle className="text-xl font-bold tracking-tight">
        Permission Required
      </CardTitle>
      <CardDescription className=" text-muted-foreground mt-2 max-w-sm mx-auto">
        Your account has been created successfully. Please contact an
        administrator to gain access to the dashboard.
      </CardDescription>
    </CardHeader>
    <CardContent className="pb-12">
      <div className="space-y-4">
        <Button asChild size="lg" className="w-full h-11 font-medium">
          <a href="/">Return to Homepage</a>
        </Button>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Need help? Contact{" "}
            <a
              href="mailto:admin@example.com"
              className="text-primary hover:underline font-medium"
            >
              admin@example.com
            </a>
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const SignupScreen = () => {
  // ========================================================================
  // HOOKS & STATE
  // ========================================================================

  const { signup, verifyOtp } = useAuth();

  const [step, setStep] = useState<StepType>("signup");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailForOtp, setEmailForOtp] = useState<string>("");
  const [resendTimer, setResendTimer] = useState(RESEND_TIMER_DURATION);
  const [canResend, setCanResend] = useState(false);

  // Form instances
  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Handle resend OTP timer
  useEffect(() => {
    if (step === "otp" && resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, resendTimer]);

  // ========================================================================
  // HELPER FUNCTIONS
  // ========================================================================

  const checkUserExists = async (email: string): Promise<string> => {
    const { data: checkResult, error: checkError } = await supabaseClient.rpc(
      "check_user_exists",
      { email_input: email.trim() }
    );

    if (checkError) {
      throw new Error("Error checking email. Please try again.");
    }

    return checkResult;
  };

  const showSuccessToast = (message: string) => {
    toast.success(message, {
      style: TOAST_SUCCESS_STYLE,
      duration: 3000,
    });
  };

  const resetOtpTimer = () => {
    setResendTimer(RESEND_TIMER_DURATION);
    setCanResend(false);
  };

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleSignupSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);

    try {
      const checkResult = await checkUserExists(data.email);

      if (checkResult !== "OK") {
        toast.error(
          checkResult || "An account with this email already exists."
        );
        return;
      }

      await signup(
        { email: data.email, password: data.password },
        {
          onSuccess: () => {
            setEmailForOtp(data.email);
            resetOtpTimer();
            setStep("otp");
          },
        }
      );
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setIsSubmitting(true);

    try {
      const checkResult = await checkUserExists(emailForOtp);

      if (checkResult !== "OK") {
        toast.error(
          checkResult || "An account with this email already exists."
        );
        return;
      }

      const passwordValue = signupForm.getValues("password");

      await signup(
        { email: emailForOtp, password: passwordValue },
        {
          onSuccess: () => {
            resetOtpTimer();
            showSuccessToast("OTP resent successfully!");
          },
        }
      );
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (data: OtpFormData) => {
    setIsSubmitting(true);

    try {
      await verifyOtp(
        { email: emailForOtp, token: data.otp, type: "signup" },
        {
          onSuccess: () => {
            setStep("adminPermission");
            showSuccessToast("OTP verified successfully!");
          },
        }
      );
    } catch (error) {
      // Error handling is managed by useAuth's toast notifications
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToSignup = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setStep("signup");
    otpForm.reset();
  };

  // ========================================================================
  // RENDER METHODS
  // ========================================================================

  const renderSignupStep = () => (
    <Card className="border-0  overflow-hidden relative">
      <div className=" flex size-full items-center top-0  justify-center absolute overflow-hidden h-[20%] bg-card p-15">
        <GridPattern
          width={20}
          height={20}
          x={-1}
          y={-1}
          className={cn(
            "[mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)] "
          )}
        />
      </div>
      <CardHeader className="text-center py-5 z-10">
        <CardTitle className="text-xl font-bold tracking-tight">
          Create your account
        </CardTitle>
        <CardDescription className=" text-muted-foreground mt-2">
          Enter your details to get started <br /> with your new account
        </CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-12 z-10">
        <Form {...signupForm}>
          <form
            onSubmit={signupForm.handleSubmit(handleSignupSubmit)}
            className="space-y-6"
          >
            <FormBuilder formConfig={signupFormConfig} />
            <Button
              size="lg"
              className="w-full h-11 font-medium shadow-md hover:shadow-lg transition-all duration-200"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                  Creating account...
                </div>
              ) : (
                "Create account"
              )}
            </Button>
          </form>
        </Form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-muted-foreground/20" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-3 text-muted-foreground font-medium">
              Already have an account?
            </span>
          </div>
        </div>

        <div className="text-center">
          <a
            href="/"
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1 hover:gap-2 duration-200"
          >
            Sign in instead
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </div>
      </CardContent>
    </Card>
  );

  const renderOtpStep = () => (
    <Card className="border-0 shadow-xl bg-gradient-to-b from-background to-muted/30">
      <CardHeader className="text-center pb-8 pt-12">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <svg
            className="h-8 w-8 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <CardTitle className="text-xl font-bold tracking-tight">
          Verify your email
        </CardTitle>
        <CardDescription className=" text-muted-foreground mt-2 max-w-sm mx-auto">
          We've sent a 6-digit verification code to{" "}
          <span className="font-semibold text-foreground">{emailForOtp}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-12">
        <Form {...otpForm}>
          <form
            onSubmit={otpForm.handleSubmit(handleOtpSubmit)}
            className="space-y-6"
          >
            <div className="flex justify-center">
              <div className="w-full max-w-xs">
                <FormBuilder formConfig={otpFormConfig} />
              </div>
            </div>
            <Button
              size="lg"
              className="w-full h-11 font-medium shadow-md hover:shadow-lg transition-all duration-200"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                  Verifying...
                </div>
              ) : (
                "Verify email"
              )}
            </Button>
          </form>
        </Form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-muted-foreground/20" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-3 text-muted-foreground font-medium">
              Didn't receive the code?
            </span>
          </div>
        </div>

        <div className="text-center space-y-4">
          <button
            onClick={handleResendOtp}
            disabled={!canResend || isSubmitting}
            className={`inline-flex items-center gap-2 text-sm font-medium transition-all duration-200 ${
              !canResend || isSubmitting
                ? "text-muted-foreground cursor-not-allowed"
                : "text-primary hover:text-primary/80 hover:gap-3"
            }`}
          >
            {canResend ? (
              <>
                Resend code
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </>
            ) : (
              <>Resend in {resendTimer}s</>
            )}
          </button>

          <div>
            <a
              href="#"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 hover:gap-2 duration-200"
              onClick={handleBackToSignup}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16l-4-4m0 0l4-4m-4 4h18"
                />
              </svg>
              Back to signup
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // ========================================================================
  // MAIN RENDER
  // ========================================================================

  return (
    <div className=" flex items-center justify-center ring-8 ring-accent  shadow border rounded-2xl  bg-card">
      <div className="relative w-full max-w-md z-10">
        {step === "signup" && renderSignupStep()}
        {step === "otp" && renderOtpStep()}
        {step === "adminPermission" && <AdminPermissionScreen />}
      </div>
    </div>
  );
};

export default SignupScreen;
