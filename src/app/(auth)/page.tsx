"use client";

import { z } from "zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  X,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

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
import { Alert, AlertDescription } from "@/components/ui/alert";

// Custom Components
import FormBuilder, { FormType } from "@/components/core/FormBuilder";

// Hooks & Utils
import useAuth from "@/hooks/useAuth";
import { supabaseClient } from "@/utils/client";
import { toast } from "sonner";
import { GridPattern } from "@/components/ui/grid-pattern";
import { cn } from "@/lib/utils";

// ============================================================================
// SCHEMAS
// ============================================================================

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

const otpSchema = z.object({
  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmNewPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
  });

// ============================================================================
// TYPES
// ============================================================================

type LoginFormData = z.infer<typeof loginSchema>;
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
type OtpFormData = z.infer<typeof otpSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
type StepType = "login" | "forgotPassword" | "otp" | "resetPassword";

// ============================================================================
// FORM CONFIGURATIONS
// ============================================================================

const loginFormConfig: FormType = [
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
];

const forgotPasswordFormConfig: FormType = [
  {
    label: "Email",
    name: "email",
    input_type: "email",
    placeholder: "example@gmail.com",
    leftIcon: <Mail size={16} />,
  },
];

const otpFormConfig: FormType = [
  {
    name: "otp",
    input_type: "otp",
    placeholder: "Enter 6-digit OTP",
  },
];

const resetPasswordFormConfig: FormType = [
  {
    label: "New Password",
    name: "newPassword",
    input_type: "password",
    placeholder: "Enter new password",
    leftIcon: <Lock size={16} />,
  },
  {
    label: "Confirm New Password",
    name: "confirmNewPassword",
    input_type: "password",
    placeholder: "Confirm new password",
    leftIcon: <Lock size={16} />,
  },
];

// ============================================================================
// CONSTANTS
// ============================================================================

const RESEND_TIMER_DURATION = 30;

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const CustomAlert = ({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) => (
  <Alert className="mb-6 border-destructive/50 bg-destructive/10 text-destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription className="flex items-center justify-between">
      <span className="text-sm font-medium text-destructive">{message}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="h-auto p-1 text-destructive hover:text-destructive/80"
      >
        <X className="h-4 w-4" />
      </Button>
    </AlertDescription>
  </Alert>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const LoginScreen = () => {
  // ========================================================================
  // HOOKS & STATE
  // ========================================================================

  const router = useRouter();
  const { login, forgotPassword, verifyOtp, user, userLoading } = useAuth();

  const [step, setStep] = useState<StepType>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailForOtp, setEmailForOtp] = useState<string>("");
  const [showNonAdminAlert, setShowNonAdminAlert] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_TIMER_DURATION);
  const [canResend, setCanResend] = useState(false);

  // Form instances
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const forgotPasswordForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const resetPasswordForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  // Auto-dismiss non-admin alert after 5 seconds
  useEffect(() => {
    if (showNonAdminAlert) {
      const timer = setTimeout(() => {
        setShowNonAdminAlert(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showNonAdminAlert]);

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

  const showSuccessToast = (message: string) => {
    toast.success(message);
  };

  const resetOtpTimer = () => {
    setResendTimer(RESEND_TIMER_DURATION);
    setCanResend(false);
  };

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleLoginSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);

    try {
      await login(
        { email: data.email, password: data.password },
        {
          onSuccess: (userData) => {
            if (userData && userData.isAdmin) {
              router.push("/dashboard");
              showSuccessToast("Welcome back! Logged in successfully.");
            } else {
              setShowNonAdminAlert(true);
            }
          },
        }
      );
    } catch (error) {
      // Error handling is managed by useAuth's toast notifications
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);

    try {
      await forgotPassword(data.email, {
        onSuccess: () => {
          setEmailForOtp(data.email);
          resetOtpTimer();
          setStep("otp");
        },
      });
    } catch (error) {
      // Error handling is managed by useAuth's toast notifications
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setIsSubmitting(true);

    try {
      await forgotPassword(emailForOtp, {
        onSuccess: () => {
          resetOtpTimer();
          showSuccessToast("OTP resent successfully!");
        },
      });
    } catch (error) {
      // Error handling is managed by useAuth's toast notifications
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (data: OtpFormData) => {
    setIsSubmitting(true);

    try {
      await verifyOtp(
        { email: emailForOtp, token: data.otp, type: "recovery" },
        {
          onSuccess: () => {
            setStep("resetPassword");
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

  const handleResetPasswordSubmit = async (data: ResetPasswordFormData) => {
    setIsSubmitting(true);

    try {
      await supabaseClient.auth.updateUser({ password: data.newPassword });
      showSuccessToast("Password reset successfully!");
      setStep("login");
      // Reset forms
      resetPasswordForm.reset();
      loginForm.reset();
    } catch (error) {
      toast.error("Failed to reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setStep("login");
    setShowNonAdminAlert(false);
    // Reset forms
    forgotPasswordForm.reset();
    otpForm.reset();
    resetPasswordForm.reset();
  };

  const handleBackToForgotPassword = (
    e: React.MouseEvent<HTMLAnchorElement>
  ) => {
    e.preventDefault();
    setStep("forgotPassword");
    otpForm.reset();
  };

  // ========================================================================
  // RENDER METHODS
  // ========================================================================

  const renderLoginStep = () => (
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

      <CardHeader className="text-center relative z-10 py-5">
        <CardTitle className="text-xl font-bold tracking-tight">
          Welcome back, Admin
        </CardTitle>
        <CardDescription className=" text-muted-foreground ">
          Sign in to your dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="px-8 relative z-10 pb-12">
        {showNonAdminAlert && (
          <CustomAlert
            message="You are not authorized to access this dashboard. Please contact the superadmin."
            onClose={() => setShowNonAdminAlert(false)}
          />
        )}

        <Form {...loginForm}>
          <form
            onSubmit={loginForm.handleSubmit(handleLoginSubmit)}
            className="space-y-6"
          >
            <FormBuilder formConfig={loginFormConfig} />
            <Button
              size="lg"
              className="w-full h-11 font-medium shadow-md hover:shadow-lg transition-all duration-200"
              type="submit"
              disabled={isSubmitting || userLoading}
            >
              {isSubmitting || userLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                  Signing in...
                </div>
              ) : (
                "Sign in"
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
              Need help?
            </span>
          </div>
        </div>

        <div className="space-y-4 text-center">
          <a
            href="#"
            className="block text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              setStep("forgotPassword");
            }}
          >
            Forgot your password?
          </a>

          <div className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <a
              href="/signup"
              className="font-medium text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1 hover:gap-2 duration-200"
            >
              Sign up
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
        </div>
      </CardContent>
    </Card>
  );

  const renderForgotPasswordStep = () => (
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
          Reset your password
        </CardTitle>
        <CardDescription className=" text-muted-foreground mt-2 max-w-sm mx-auto">
          Enter your email address and we&apos;ll <br /> send you a verification
          code
        </CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-12 z-10">
        <Form {...forgotPasswordForm}>
          <form
            onSubmit={forgotPasswordForm.handleSubmit(
              handleForgotPasswordSubmit
            )}
            className="space-y-6"
          >
            <FormBuilder formConfig={forgotPasswordFormConfig} />
            <Button
              size="lg"
              className="w-full h-11 font-medium shadow-md hover:shadow-lg transition-all duration-200"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                  Sending code...
                </div>
              ) : (
                "Send verification code"
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
              Remember your password?
            </span>
          </div>
        </div>

        <div className="text-center">
          <a
            href="#"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 hover:gap-2 duration-200"
            onClick={handleBackToLogin}
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
            Back to login
          </a>
        </div>
      </CardContent>
    </Card>
  );

  const renderOtpStep = () => (
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
          Enter verification code
        </CardTitle>
        <CardDescription className=" text-muted-foreground mt-2 max-w-sm mx-auto">
          We&apso;ve sent a 6-digit code to{" "}
          <span className="font-semibold text-foreground">{emailForOtp}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-12 z-10">
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
                "Verify code"
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
              Didn&apos;t receive the code?
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
                <RotateCcw className="h-4 w-4" />
              </>
            ) : (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin"></div>
                Resend in {resendTimer}s
              </>
            )}
          </button>

          <div>
            <a
              href="#"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 hover:gap-2 duration-200"
              onClick={handleBackToLogin}
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
              Back to login
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderResetPasswordStep = () => (
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
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-xl font-bold tracking-tight">
          Create new password
        </CardTitle>
        <CardDescription className=" text-muted-foreground mt-2 max-w-sm mx-auto">
          Choose a strong password to secure your account
        </CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-12 z-10">
        <Form {...resetPasswordForm}>
          <form
            onSubmit={resetPasswordForm.handleSubmit(handleResetPasswordSubmit)}
            className="space-y-6"
          >
            <FormBuilder formConfig={resetPasswordFormConfig} />
            <Button
              size="lg"
              className="w-full h-11 font-medium shadow-md hover:shadow-lg transition-all duration-200"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                  Updating password...
                </div>
              ) : (
                "Update password"
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
              All set?
            </span>
          </div>
        </div>

        <div className="text-center">
          <a
            href="#"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 hover:gap-2 duration-200"
            onClick={handleBackToLogin}
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
            Back to login
          </a>
        </div>
      </CardContent>
    </Card>
  );

  // ========================================================================
  // MAIN RENDER
  // ========================================================================

  return (
    <div className=" flex items-center justify-center ring-8 ring-accent  shadow border rounded-2xl  bg-card">
      <div className="relative w-full  z-10">
        {step === "login" && renderLoginStep()}
        {step === "forgotPassword" && renderForgotPasswordStep()}
        {step === "otp" && renderOtpStep()}
        {step === "resetPassword" && renderResetPasswordStep()}
      </div>
    </div>
  );
};

export default LoginScreen;
