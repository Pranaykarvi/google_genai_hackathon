import { SignedIn, SignedOut } from "@clerk/nextjs"
import LandingPage from "@/components/landing-page"
import Dashboard from "@/components/dashboard"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <SignedOut>
        <LandingPage />
      </SignedOut>
      <SignedIn>
        <Dashboard />
      </SignedIn>
    </main>
  )
}
