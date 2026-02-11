"use client"
import * as React from "react"
import { CheckIcon } from "@radix-ui/react-icons"
import { cn } from "@/lib/utils"

type PlanLevel = "starter" | "pro" | "enterprise"

interface PricingFeature {
  name: string
  included: PlanLevel | "all"
}

interface PricingPlan {
  name: string
  level: PlanLevel
  price: {
    monthly: number
    yearly: number
  }
  popular?: boolean
}

const features: PricingFeature[] = [
  { name: "Real-time conversation analysis", included: "starter" },
  { name: "Up to 10,000 messages/month", included: "starter" },
  { name: "Basic sentiment detection", included: "starter" },
  { name: "Email support", included: "starter" },
  { name: "Advanced emotional intelligence", included: "pro" },
  { name: "Up to 100,000 messages/month", included: "pro" },
  { name: "Multi-language support (50+ languages)", included: "pro" },
  { name: "Priority support", included: "pro" },
  { name: "Custom AI model training", included: "enterprise" },
  { name: "Unlimited messages", included: "enterprise" },
  { name: "Dedicated account manager", included: "enterprise" },
  { name: "24/7 phone support", included: "enterprise" },
  { name: "API access", included: "all" },
  { name: "Team collaboration tools", included: "all" },
]

const plans: PricingPlan[] = [
  {
    name: "Starter",
    price: { monthly: 29, yearly: 290 },
    level: "starter",
  },
  {
    name: "Pro",
    price: { monthly: 99, yearly: 990 },
    level: "pro",
    popular: true,
  },
  {
    name: "Enterprise",
    price: { monthly: 299, yearly: 2990 },
    level: "enterprise",
  },
]

function shouldShowCheck(included: PricingFeature["included"], level: PlanLevel): boolean {
  if (included === "all") return true
  if (included === "enterprise" && level === "enterprise") return true
  if (included === "pro" && (level === "pro" || level === "enterprise")) return true
  if (included === "starter") return true
  return false
}

export function PricingSection() {
  const [isYearly, setIsYearly] = React.useState(false)
  const [selectedPlan, setSelectedPlan] = React.useState<PlanLevel>("pro")

  return (
    <section className="py-24 bg-black border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-[40px] font-semibold leading-tight mb-4 text-white" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>Choose Your Plan</h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>
            Get started with Auralink's communication intelligence platform. All plans include API access and team
            collaboration.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-full p-1">
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={cn(
                "px-6 py-2 rounded-full text-lg transition-all",
                !isYearly ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-white",
              )}
              style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setIsYearly(true)}
              className={cn(
                "px-6 py-2 rounded-full text-lg transition-all",
                isYearly ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-white",
              )}
              style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}
            >
              Yearly
              <span className="ml-2 text-sm text-[hsl(174,62%,56%)]">Save 17%</span>
            </button>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <button
              key={plan.name}
              type="button"
              onClick={() => setSelectedPlan(plan.level)}
              className={cn(
                "relative p-8 rounded-2xl text-left transition-all border-2",
                selectedPlan === plan.level
                  ? "border-[hsl(174,62%,56%)] bg-[hsl(174,62%,56%)]/10"
                  : "border-white/10 hover:border-[hsl(174,62%,56%)]/50",
              )}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[hsl(174,62%,56%)] text-black px-4 py-1 rounded-full text-sm font-semibold" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>
                  Most Popular
                </span>
              )}
              <div className="mb-6">
                <h3 className="text-2xl font-semibold mb-2 text-white" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-semibold text-white" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>
                    ${isYearly ? plan.price.yearly : plan.price.monthly}
                  </span>
                  <span className="text-lg text-zinc-400" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>/{isYearly ? "year" : "month"}</span>
                </div>
              </div>
              <div
                className={cn(
                  "w-full py-3 px-6 rounded-full text-lg transition-all text-center font-semibold",
                  selectedPlan === plan.level ? "bg-[hsl(174,62%,56%)] text-black" : "bg-zinc-800 text-white",
                )}
                style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}
              >
                {selectedPlan === plan.level ? "Selected" : "Select Plan"}
              </div>
            </button>
          ))}
        </div>

        {/* Features Table */}
        <div className="border border-white/10 rounded-2xl overflow-hidden bg-zinc-900/50">
          <div className="overflow-x-auto">
            <div className="min-w-[768px]">
              {/* Table Header */}
              <div className="flex items-center p-6 bg-zinc-900 border-b border-white/10">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>Features</h3>
                </div>
                <div className="flex items-center gap-8">
                  {plans.map((plan) => (
                    <div key={plan.level} className="w-24 text-center text-lg font-semibold text-white" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>
                      {plan.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature Rows */}
              {features.map((feature, index) => (
                <div
                  key={feature.name}
                  className={cn(
                    "flex items-center p-6 transition-colors",
                    index % 2 === 0 ? "bg-transparent" : "bg-zinc-900/30",
                    feature.included === selectedPlan && "bg-[hsl(174,62%,56%)]/5",
                  )}
                >
                  <div className="flex-1">
                    <span className="text-lg text-white" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>{feature.name}</span>
                  </div>
                  <div className="flex items-center gap-8">
                    {plans.map((plan) => (
                      <div key={plan.level} className="w-24 flex justify-center">
                        {shouldShowCheck(feature.included, plan.level) ? (
                          <div className="w-6 h-6 rounded-full bg-[hsl(174,62%,56%)] flex items-center justify-center">
                            <CheckIcon className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-12 text-center">
          <button className="bg-[hsl(174,62%,56%)] text-black px-[18px] py-[15px] rounded-full font-semibold text-lg hover:rounded-2xl transition-all" style={{ fontFamily: "var(--font-sans), Space Grotesk, sans-serif" }}>
            Get started with {plans.find((p) => p.level === selectedPlan)?.name}
          </button>
        </div>
      </div>
    </section>
  )
}
