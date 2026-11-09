'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import { Wand2, Copy, Check, Loader2 } from 'lucide-react'

interface GeneratedPlan {
  id: string
  name: string
  days: {
    day: string
    meals: {
      breakfast: string
      lunch: string
      dinner: string
    }
    ingredients: string[]
  }[]
  generatedAt: Date
}

export function AiPlans() {
  const [preferences, setPreferences] = useState('')
  const [dietary, setDietary] = useState('')
  const [loading, setLoading] = useState(false)
  const [plans, setPlans] = useState<GeneratedPlan[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const generatePlan = async () => {
    if (!preferences.trim()) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/generate-meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences,
          dietary: dietary || 'none',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate plan')
      }

      const data = await response.json()
      const newPlan: GeneratedPlan = {
        id: Date.now().toString(),
        name: `${preferences.split(' ')[0]}'s Week`,
        days: data.plan,
        generatedAt: new Date(),
      }

      setPlans((prev) => [newPlan, ...prev])
      setPreferences('')
      setDietary('')
    } catch (error) {
      console.error('Error generating plan:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyPlanToClipboard = (plan: GeneratedPlan) => {
    const text = plan.days
      .map(
        (d) =>
          `${d.day}\nBreakfast: ${d.meals.breakfast}\nLunch: ${d.meals.lunch}\nDinner: ${d.meals.dinner}\nIngredients: ${d.ingredients.join(', ')}`
      )
      .join('\n\n')

    navigator.clipboard.writeText(text)
    setCopiedId(plan.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const deletePlan = (id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Generator Section */}
      <Card className="border-purple-200 dark:border-purple-900/50">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30">
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="size-5 text-purple-600" />
            AI Meal Plan Generator
          </CardTitle>
          <CardDescription>
            Describe what you&apos;d like to eat and get a personalized weekly plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">What kind of meals do you want?</label>
            <Input
              placeholder="e.g., Mediterranean, quick weeknight dinners, healthy options..."
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  generatePlan()
                }
              }}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Dietary restrictions (optional)</label>
            <Input
              placeholder="e.g., vegetarian, gluten-free, vegan..."
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  generatePlan()
                }
              }}
              disabled={loading}
            />
          </div>

          <Button
            onClick={generatePlan}
            disabled={loading || !preferences.trim()}
            className="w-full gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generating your plan...
              </>
            ) : (
              <>
                <Wand2 className="size-4" />
                Generate Weekly Plan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Plans Section */}
      {plans.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Your Generated Plans</h3>
          {plans.map((plan) => (
            <Card key={plan.id} className="overflow-hidden border-purple-100 dark:border-purple-900/30">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{plan.name}</CardTitle>
                    <CardDescription className="text-xs">
                      Generated {plan.generatedAt.toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyPlanToClipboard(plan)}
                      className="gap-1"
                    >
                      {copiedId === plan.id ? (
                        <>
                          <Check className="size-4 text-green-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="size-4" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePlan(plan.id)}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/20"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
                  {plan.days.map((dayPlan, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-purple-100 bg-gradient-to-br from-white to-purple-50 p-3 dark:border-purple-900/30 dark:from-slate-800 dark:to-purple-950/20"
                    >
                      <h4 className="mb-3 text-sm font-semibold text-purple-900 dark:text-purple-200">
                        {dayPlan.day}
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="font-medium text-purple-700 dark:text-purple-300">
                            Breakfast:
                          </span>
                          <p className="mt-0.5 text-slate-600 dark:text-slate-400">
                            {dayPlan.meals.breakfast}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-purple-700 dark:text-purple-300">
                            Lunch:
                          </span>
                          <p className="mt-0.5 text-slate-600 dark:text-slate-400">
                            {dayPlan.meals.lunch}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-purple-700 dark:text-purple-300">
                            Dinner:
                          </span>
                          <p className="mt-0.5 text-slate-600 dark:text-slate-400">
                            {dayPlan.meals.dinner}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-lg bg-purple-50 p-3 dark:bg-purple-950/20">
                  <p className="text-xs font-medium text-purple-900 dark:text-purple-200">
                    All Ingredients Needed:
                  </p>
                  <p className="mt-2 flex flex-wrap gap-1 text-xs text-slate-600 dark:text-slate-400">
                    {Array.from(new Set(plan.days.flatMap((d) => d.ingredients)))
                      .join(', ')
                      .split(', ')
                      .map((ingredient, idx) => (
                        <span
                          key={idx}
                          className="inline-block rounded-full bg-white px-2 py-1 dark:bg-slate-800"
                        >
                          {ingredient}
                        </span>
                      ))}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {plans.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-purple-200 bg-purple-50/50 p-12 text-center dark:border-purple-900/30 dark:bg-purple-950/10">
          <Wand2 className="mx-auto size-12 text-purple-200 dark:text-purple-900/50" />
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            Generate your first AI meal plan to get started
          </p>
        </div>
      )}
    </div>
  )
}
