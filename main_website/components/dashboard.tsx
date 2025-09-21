"use client";

import { useEffect, useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, Globe, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  // Optional: mount guard to avoid hydration errors
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Falsify</h1>
          </div>
          {/* Render UserButton only after mount to avoid hydration mismatch */}
          {mounted ? <UserButton afterSignOutUrl="/" /> : null}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Detection Dashboard</h2>
          <p className="text-muted-foreground">Choose a detection module to analyze content for misinformation.</p>
        </div>

        {/* Module Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/deepfake">
            <Card className="bg-card border-border hover:border-primary transition-colors cursor-pointer group">
              <CardHeader>
                <Eye className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <CardTitle className="flex items-center justify-between">
                  Deepfake Detection
                  <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardTitle>
                <CardDescription>
                  Upload videos or images to detect AI-generated deepfakes and manipulated content.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Analyze Media</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/phishing">
            <Card className="bg-card border-border hover:border-primary transition-colors cursor-pointer group">
              <CardHeader>
                <Globe className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <CardTitle className="flex items-center justify-between">
                  Phishing Detection
                  <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardTitle>
                <CardDescription>
                  Enter a website URL to check for phishing attempts and malicious content.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Check Website</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/fake-news">
            <Card className="bg-card border-border hover:border-primary transition-colors cursor-pointer group">
              <CardHeader>
                <FileText className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <CardTitle className="flex items-center justify-between">
                  Fake News Detection
                  <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardTitle>
                <CardDescription>
                  Analyze news articles and text content to verify authenticity and detect bias.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Verify News</Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold mb-4">Recent Activity</h3>
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center py-8">
                No recent activity. Start by selecting a detection module above.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
