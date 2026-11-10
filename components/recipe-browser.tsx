'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChefHat, Clock, Users } from 'lucide-react'

interface Recipe {
  id: string
  name: string
  description: string
  time: number
  servings: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  ingredients: string[]
  tags: string[]
}

const RECIPES: Recipe[] = [
  {
    id: '1',
    name: 'Mediterranean Buddha Bowl',
    description: 'A vibrant mix of grains, roasted veggies, and tahini dressing',
    time: 30,
    servings: 2,
    difficulty: 'Easy',
    ingredients: ['quinoa', 'chickpeas', 'cherry tomatoes', 'cucumber', 'red bell pepper', 'tahini', 'lemon', 'olive oil', 'salt', 'pepper'],
    tags: ['Vegetarian', 'Healthy', 'Quick'],
  },
  {
    id: '2',
    name: 'Grilled Salmon with Roasted Vegetables',
    description: 'Omega-3 rich salmon with seasonal roasted vegetables',
    time: 45,
    servings: 2,
    difficulty: 'Medium',
    ingredients: ['salmon fillet', 'broccoli', 'zucchini', 'carrots', 'olive oil', 'garlic', 'lemon', 'dill', 'salt', 'pepper'],
    tags: ['Protein', 'Healthy', 'Seafood'],
  },
  {
    id: '3',
    name: 'Pasta Primavera',
    description: 'Light and fresh pasta with spring vegetables',
    time: 25,
    servings: 2,
    difficulty: 'Easy',
    ingredients: ['pasta', 'zucchini', 'asparagus', 'peas', 'cherry tomatoes', 'basil', 'parmesan', 'olive oil', 'garlic', 'lemon'],
    tags: ['Vegetarian', 'Comfort Food', 'Quick'],
  },
  {
    id: '4',
    name: 'Teriyaki Chicken Stir Fry',
    description: 'Crispy chicken in a savory-sweet Asian sauce',
    time: 35,
    servings: 2,
    difficulty: 'Medium',
    ingredients: ['chicken breast', 'bell peppers', 'broccoli', 'soy sauce', 'ginger', 'garlic', 'honey', 'sesame oil', 'rice', 'green onions'],
    tags: ['Asian', 'Quick', 'Protein'],
  },
  {
    id: '5',
    name: 'Chickpea Curry',
    description: 'Warm and comforting coconut chickpea curry',
    time: 40,
    servings: 3,
    difficulty: 'Medium',
    ingredients: ['chickpeas', 'coconut milk', 'spinach', 'onion', 'garlic', 'ginger', 'cumin', 'turmeric', 'cilantro', 'rice'],
    tags: ['Vegan', 'Comfort Food', 'Spicy'],
  },
  {
    id: '6',
    name: 'Caprese Salad with Bread',
    description: 'Classic Italian salad with fresh mozzarella and heirloom tomatoes',
    time: 15,
    servings: 2,
    difficulty: 'Easy',
    ingredients: ['tomatoes', 'mozzarella', 'basil', 'balsamic vinegar', 'olive oil', 'salt', 'pepper', 'bread'],
    tags: ['Vegetarian', 'Italian', 'Light'],
  },
]

interface RecipeBrowserProps {
  onSelectRecipe: (recipe: Recipe) => void
}

export function RecipeBrowser({ onSelectRecipe }: RecipeBrowserProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)

  const filtered =
    selectedDifficulty === null
      ? RECIPES
      : RECIPES.filter((r) => r.difficulty === selectedDifficulty)

  const difficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-900'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-900'
      case 'Hard':
        return 'bg-red-100 text-red-900'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-semibold text-slate-900 dark:text-white">
          Recipe Collection
        </h2>
        <p className="text-slate-600 dark:text-slate-300">
          Browse and add recipes to your shopping list
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedDifficulty === null ? 'default' : 'outline'}
          onClick={() => setSelectedDifficulty(null)}
          size="sm"
        >
          All
        </Button>
        {['Easy', 'Medium', 'Hard'].map((difficulty) => (
          <Button
            key={difficulty}
            variant={selectedDifficulty === difficulty ? 'default' : 'outline'}
            onClick={() => setSelectedDifficulty(difficulty)}
            size="sm"
          >
            {difficulty}
          </Button>
        ))}
      </div>

      {/* Recipe Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((recipe) => (
          <Card
            key={recipe.id}
            className="flex flex-col border-amber-200 dark:border-slate-700"
          >
            <CardHeader>
              <div className="mb-2 flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{recipe.name}</CardTitle>
                  <CardDescription className="mt-1">{recipe.description}</CardDescription>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                <Badge className={`text-xs ${difficultyColor(recipe.difficulty)}`}>
                  {recipe.difficulty}
                </Badge>
                {recipe.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <div className="flex gap-4 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock className="size-4" />
                  {recipe.time}m
                </div>
                <div className="flex items-center gap-1">
                  <Users className="size-4" />
                  {recipe.servings} servings
                </div>
              </div>

              <div className="flex-1">
                <p className="mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Ingredients ({recipe.ingredients.length}):
                </p>
                <div className="flex flex-wrap gap-1">
                  {recipe.ingredients.slice(0, 5).map((ing) => (
                    <Badge
                      key={ing}
                      variant="outline"
                      className="text-xs"
                    >
                      {ing}
                    </Badge>
                  ))}
                  {recipe.ingredients.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{recipe.ingredients.length - 5}
                    </Badge>
                  )}
                </div>
              </div>

              <Button
                onClick={() => onSelectRecipe(recipe)}
                className="w-full gap-2 bg-amber-600 hover:bg-amber-700"
              >
                <ChefHat className="size-4" />
                Add to List
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
