"use client"

import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Target, TrendingUp, Shield, Zap } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { isAuthenticated, isLoading, startRiotLogin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // 認証済みの場合はダッシュボードにリダイレクト
    if (!isLoading && isAuthenticated) {
      const redirectUrl = typeof window !== 'undefined' 
        ? sessionStorage.getItem('redirectAfterLogin') || '/dashboard'
        : '/dashboard'
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('redirectAfterLogin')
      }
      router.push(redirectUrl)
    }
  }, [isLoading, isAuthenticated, router])

  // 認証済みならリダイレクト中
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">SL</span>
            </div>
            <span className="font-bold text-xl">SensiLog</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
            <Button 
              onClick={startRiotLogin} 
              disabled={isLoading}
              className="bg-[#D13639] hover:bg-[#B82E31] text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  読み込み中...
                </>
              ) : (
                "Riot IDでログイン"
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="container mx-auto px-4 py-20 lg:py-32">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              VALORANTの感度を
              <br />
              <span className="text-primary">科学的に</span>管理する
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              マッチ履歴と感度設定を紐付けて分析。
              あなたの最適な感度を見つけましょう。
            </p>
            <div className="pt-4">
              <Button 
                size="lg" 
                onClick={startRiotLogin}
                disabled={isLoading}
                className="bg-[#D13639] hover:bg-[#B82E31] text-white text-lg px-8 py-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    読み込み中...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    無料で始める
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={Target}
              title="感度管理"
              description="DPI、ゲーム内感度、エイム感度などを一元管理"
            />
            <FeatureCard 
              icon={TrendingUp}
              title="パフォーマンス分析"
              description="マッチごとのK/D、HS%、ADRなどを詳細に分析"
            />
            <FeatureCard 
              icon={Shield}
              title="履歴トラッキング"
              description="感度変更の履歴とパフォーマンスの相関を可視化"
            />
            <FeatureCard 
              icon={Zap}
              title="最適化提案"
              description="データに基づいた最適な設定を提案"
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-secondary/50 py-16 lg:py-24">
          <div className="container mx-auto px-4 text-center space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold">
              今すぐ始めましょう
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Riot IDでログインするだけで、すぐに使い始められます。
              無料でご利用いただけます。
            </p>
            <Button 
              size="lg" 
              onClick={startRiotLogin}
              disabled={isLoading}
              className="bg-[#D13639] hover:bg-[#B82E31] text-white"
            >
              {isLoading ? "読み込み中..." : "Riot IDでログイン"}
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">SL</span>
              </div>
              <span className="font-semibold">SensiLog</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 SensiLog. All rights reserved.
            </p>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            SensiLog is not affiliated with Riot Games or any of its subsidiaries.
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string 
}) {
  return (
    <div className="p-6 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}