'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const RECIPES = [
  { name: 'Mediterranean Buddha Bowl', color: 'bg-emerald-100 text-emerald-900' },
  { name: 'Grilled Salmon with Roasted Veggies', color: 'bg-blue-100 text-blue-900' },
  { name: 'Pasta Primavera', color: 'bg-yellow-100 text-yellow-900' },
  { name: 'Teriyaki Chicken Stir Fry', color: 'bg-orange-100 text-orange-900' },
  { name: 'Chickpea Curry', color: 'bg-red-100 text-red-900' },
  { name: 'Caprese Salad with Bread', color: 'bg-pink-100 text-pink-900' },
  { name: 'Vegetable Soup', color: 'bg-purple-100 text-purple-900' },
]

interface MealPlannerProps {
  meals: Record<string, string>
  onAddMeal: (day: string, recipe: string) => void
}

export function MealPlanner({ meals, onAddMeal }: MealPlannerProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-semibold text-slate-900 dark:text-white">
          Weekly Meal Plan
        </h2>
        <p className="text-slate-600 dark:text-slate-300">
          Plan your meals for the week and organize your shopping
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {DAYS.map((day) => (
          <Card key={day} className="flex flex-col border-amber-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{day}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-3">
              {meals[day] ? (
                <div className="flex flex-col gap-2">
                  <Badge className="w-fit bg-amber-100 text-amber-900">
                    {meals[day].split(' ')[0]}
                  </Badge>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {meals[day]}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAddMeal(day, '')}
                    className="mt-auto w-full text-destructive hover:bg-destructive/10"
                  >
                    <X className="size-4" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No meal planned
                  </p>
                  <div className="flex flex-col gap-1">
                    {RECIPES.slice(0, 3).map((recipe) => (
                      <Button
                        key={recipe.name}
                        variant="ghost"
                        size="sm"
                        onClick={() => onAddMeal(day, recipe.name)}
                        className={`text-xs ${recipe.color} justify-start`}
                      >
                        {recipe.name.substring(0, 20)}...
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-amber-200 bg-amber-50 dark:border-slate-700 dark:bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-sm">💡 Tip</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 dark:text-slate-300">
          Click on a recipe to add it to a day, then browse your ingredients in the Shopping List
          view.
        </CardContent>
      </Card>
    </div>
  )
}
