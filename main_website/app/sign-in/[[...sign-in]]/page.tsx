import { SignIn } from "@clerk/nextjs"
import { Shield } from "lucide-react"
import Link from "next/link"

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 mb-8">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Falsify</span>
          </Link>
          <h2 className="text-3xl font-bold">Welcome back</h2>
          <p className="text-muted-foreground mt-2">Sign in to your account to continue detecting misinformation</p>
        </div>

        {/* Clerk SignIn Component */}
        <div className="flex justify-center">
          <SignIn
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "bg-card border-border shadow-lg",
                headerTitle: "text-foreground",
                headerSubtitle: "text-muted-foreground",
                socialButtonsBlockButton: "bg-card border-border text-foreground hover:bg-accent",
                formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
                formFieldInput: "bg-input border-border text-foreground",
                footerActionLink: "text-primary hover:text-primary/80",
              },
            }}
          />
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/sign-up" className="text-primary hover:text-primary/80 font-medium">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
