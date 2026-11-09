'use client'

import { useState } from 'react'
import { MealPlanner } from '@/components/meal-planner'
import { RecipeBrowser } from '@/components/recipe-browser'
import { ShoppingList } from '@/components/shopping-list'
import { Button } from '@/components/ui/button'
import { UtensilsCrossed, BookOpen, ShoppingCart } from 'lucide-react'

export default function Page() {
  const [view, setView] = useState<'planner' | 'recipes' | 'shopping'>('planner')
  const [meals, setMeals] = useState<Record<string, string>>({})
  const [ingredients, setIngredients] = useState<Record<string, boolean>>({})

  const handleAddMeal = (day: string, recipe: string) => {
    setMeals((prev) => ({ ...prev, [day]: recipe }))
  }

  const handleAddIngredients = (items: string[]) => {
    setIngredients((prev) => ({
      ...prev,
      ...items.reduce(
        (acc, item) => {
          acc[item] = false
          return acc
        },
        {} as Record<string, boolean>
      ),
    }))
  }

  const handleToggleIngredient = (item: string) => {
    setIngredients((prev) => ({
      ...prev,
      [item]: !prev[item],
    }))
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-amber-100 bg-white/50 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UtensilsCrossed className="size-8 text-amber-600" />
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Meal Planner
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex gap-3">
          <Button
            onClick={() => setView('planner')}
            variant={view === 'planner' ? 'default' : 'outline'}
            className="gap-2"
          >
            <UtensilsCrossed className="size-4" />
            Weekly Plan
          </Button>
          <Button
            onClick={() => setView('recipes')}
            variant={view === 'recipes' ? 'default' : 'outline'}
            className="gap-2"
          >
            <BookOpen className="size-4" />
            Recipes
          </Button>
          <Button
            onClick={() => setView('shopping')}
            variant={view === 'shopping' ? 'default' : 'outline'}
            className="gap-2"
          >
            <ShoppingCart className="size-4" />
            Shopping List
            {Object.keys(ingredients).length > 0 && (
              <span className="ml-1 inline-flex size-5 items-center justify-center rounded-full bg-orange-500 text-xs font-semibold text-white">
                {Object.values(ingredients).filter((v) => !v).length}
              </span>
            )}
          </Button>
        </div>
      </nav>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {view === 'planner' && (
          <MealPlanner meals={meals} onAddMeal={handleAddMeal} />
        )}
        {view === 'recipes' && (
          <RecipeBrowser
            onSelectRecipe={(recipe) => {
              handleAddIngredients(recipe.ingredients)
              setView('shopping')
            }}
          />
        )}
        {view === 'shopping' && (
          <ShoppingList
            items={ingredients}
            onToggleItem={handleToggleIngredient}
          />
        )}
      </section>
    </main>
  )
}
