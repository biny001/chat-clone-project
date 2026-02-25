"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Check, Loader2 } from "lucide-react";
import { LogoIcon } from "@/components/icons";
import { signIn, signUp, useSession } from "@/lib/auth-client";
import { useToast } from "@/hooks/use-toast";

const testimonials = [
  {
    quote: "Switched our entire team in a week. The simplicity is unmatched.",
    name: "Sarah Chen",
    role: "Head of Product, Vercel",
    avatar: "SC",
  },
  {
    quote: "Finally, a tool that feels like it was designed by people who actually use it.",
    name: "Marcus Webb",
    role: "CTO, Linear",
    avatar: "MW",
  },
  {
    quote: "Our response times dropped 40% in the first month.",
    name: "Anya Patel",
    role: "VP Engineering, Stripe",
    avatar: "AP",
  },
];

const stats = [
  { value: "12k+", label: "Teams" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9★", label: "Rating" },
];

const Auth = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session) {
      router.replace("/");
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn.email({ email, password });
        if (error) {
          toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
        } else {
          router.replace("/");
        }
      } else {
        const { error } = await signUp.email({ email, password, name });
        if (error) {
          toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
        } else {
          router.replace("/");
        }
      }
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    await signIn.social({ provider: "google", callbackURL: "/" });
  };

  const handleAppleSignIn = () => {
    toast({ title: "Coming soon", description: "Apple sign-in is not yet available." });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* ─── Left: Visual + Social Proof ─── */}
      <div className="relative hidden w-[55%] overflow-hidden lg:block">
        {/* background image */}
        <img
          src="/auth-visual.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* overlay */}
        <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" />

        {/* content */}
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          {/* logo */}
          <div className="flex items-center gap-3">
            <LogoIcon />
            <span className="text-xl font-semibold tracking-tight text-primary-foreground">
              Chatly
            </span>
          </div>

          {/* testimonial carousel */}
          <div className="max-w-lg">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <p className="text-2xl font-light leading-relaxed tracking-tight text-primary-foreground/90">
                  "{testimonials[activeTestimonial].quote}"
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {testimonials[activeTestimonial].avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary-foreground">
                      {testimonials[activeTestimonial].name}
                    </p>
                    <p className="text-xs text-primary-foreground/60">
                      {testimonials[activeTestimonial].role}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* dots */}
            <div className="mt-8 flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === activeTestimonial
                      ? "w-8 bg-primary"
                      : "w-4 bg-primary-foreground/30 hover:bg-primary-foreground/50"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* stats */}
          <div className="flex gap-12">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-semibold text-primary-foreground">
                  {s.value}
                </p>
                <p className="text-xs uppercase tracking-widest text-primary-foreground/50">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Right: Auth Form ─── */}
      <div className="flex w-full flex-col items-center justify-center px-6 lg:w-[45%] lg:px-20">
        <div className="w-full max-w-[400px]">
          {/* mobile logo */}
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <LogoIcon />
            <span className="text-xl font-semibold tracking-tight text-foreground">
              Chatly
            </span>
          </div>

          {/* heading */}
          <motion.div
            key={isLogin ? "login" : "signup"}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {isLogin
                ? "Enter your credentials to access your workspace"
                : "Start collaborating with your team in seconds"}
            </p>
          </motion.div>

          {/* social buttons */}
          <div className="mt-8 flex gap-3">
            <button
              onClick={handleGoogleSignIn}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>
            <button
              onClick={handleAppleSignIn}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.18 0-.36-.02-.53-.06-.01-.18-.04-.56-.04-.95 0-1.05.45-2.3 1.23-3.09.39-.4.97-.82 1.66-1.13.68-.3 1.32-.47 1.89-.51.01.21.02.43.02.65zm4.655 16.96c-.01.03-.02.06-.03.09-.36 1.1-.96 2.08-1.7 2.96-.68.8-1.39 1.61-2.5 1.61-1.1 0-1.47-.65-2.73-.65-1.28 0-1.7.63-2.73.67-1.07.04-1.89-.87-2.57-1.67-1.39-1.63-2.46-4.62-1.03-6.64.71-1 1.97-1.63 3.34-1.65 1.07-.02 2.08.72 2.73.72.66 0 1.88-.89 3.17-.76.54.02 2.06.22 3.03 1.64-.08.05-1.81 1.06-1.79 3.15.02 2.5 2.19 3.33 2.21 3.34zm-2.62-11.22c-.01 0-.01 0 0 0z" />
              </svg>
              Apple
            </button>
          </div>

          {/* divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              or
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Password
                </label>
                {isLogin && (
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-xl border border-border bg-background px-4 pr-11 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* CTA */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Please wait...
                </>
              ) : (
                <>
                  {isLogin ? "Sign in" : "Create account"}
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </>
              )}
            </motion.button>
          </form>

          {/* trust badges (signup only) */}
          <AnimatePresence>
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-5 space-y-2"
              >
                {[
                  "Free 14-day trial, no card required",
                  "SOC 2 compliant & end-to-end encrypted",
                  "Cancel anytime, export your data",
                ].map((text) => (
                  <div
                    key={text}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <Check size={14} className="text-primary" />
                    {text}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* toggle */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold text-primary hover:underline"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
