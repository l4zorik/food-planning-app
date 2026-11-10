'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, X, UtensilsCrossed } from 'lucide-react'

interface Recipe {
  id: string
  name: string
  description: string
  time: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  ingredients: string[]
  image: string
  cuisine: string
  servings: number
}

const RECIPES: Recipe[] = [
  {
    id: '1',
    name: 'Grilled Salmon with Lemon Butter',
    description: 'Pan-seared salmon fillet with a fresh lemon butter sauce and seasonal vegetables',
    time: '25 mins',
    difficulty: 'Easy',
    ingredients: ['Salmon', 'Butter', 'Lemon', 'Garlic', 'Broccoli', 'Salt', 'Pepper'],
    image: '🐟',
    cuisine: 'Mediterranean',
    servings: 2,
  },
  {
    id: '2',
    name: 'Margherita Pizza',
    description: 'Classic Italian pizza with fresh mozzarella, basil, and San Marzano tomatoes',
    time: '30 mins',
    difficulty: 'Medium',
    ingredients: ['Pizza Dough', 'Tomatoes', 'Mozzarella', 'Basil', 'Olive Oil', 'Garlic'],
    image: '🍕',
    cuisine: 'Italian',
    servings: 4,
  },
  {
    id: '3',
    name: 'Thai Green Curry',
    description: 'Creamy and spicy green curry with chicken, vegetables, and coconut milk',
    time: '35 mins',
    difficulty: 'Medium',
    ingredients: ['Chicken', 'Coconut Milk', 'Green Curry Paste', 'Thai Basil', 'Bell Pepper', 'Onion'],
    image: '🍛',
    cuisine: 'Thai',
    servings: 3,
  },
  {
    id: '4',
    name: 'Beef Tacos',
    description: 'Seasoned ground beef tacos with fresh toppings and cilantro lime crema',
    time: '20 mins',
    difficulty: 'Easy',
    ingredients: ['Ground Beef', 'Taco Shells', 'Lettuce', 'Tomato', 'Cheese', 'Sour Cream', 'Cilantro'],
    image: '🌮',
    cuisine: 'Mexican',
    servings: 4,
  },
  {
    id: '5',
    name: 'Spaghetti Carbonara',
    description: 'Authentic Roman pasta with creamy egg sauce, pancetta, and Parmesan',
    time: '20 mins',
    difficulty: 'Easy',
    ingredients: ['Spaghetti', 'Eggs', 'Pancetta', 'Parmesan', 'Black Pepper', 'Salt'],
    image: '🍝',
    cuisine: 'Italian',
    servings: 2,
  },
  {
    id: '6',
    name: 'Buddha Bowl',
    description: 'Nutritious bowl with quinoa, roasted vegetables, chickpeas, and tahini dressing',
    time: '30 mins',
    difficulty: 'Easy',
    ingredients: ['Quinoa', 'Chickpeas', 'Kale', 'Sweet Potato', 'Avocado', 'Tahini', 'Lemon'],
    image: '🥗',
    cuisine: 'Vegetarian',
    servings: 1,
  },
  {
    id: '7',
    name: 'Beef Stir Fry',
    description: 'Quick and delicious stir-fried beef with crispy vegetables and ginger soy sauce',
    time: '20 mins',
    difficulty: 'Easy',
    ingredients: ['Beef Strips', 'Soy Sauce', 'Ginger', 'Garlic', 'Broccoli', 'Bell Pepper', 'Rice'],
    image: '🍲',
    cuisine: 'Asian',
    servings: 2,
  },
  {
    id: '8',
    name: 'Caprese Salad',
    description: 'Simple and elegant salad with fresh tomatoes, mozzarella, basil, and balsamic',
    time: '10 mins',
    difficulty: 'Easy',
    ingredients: ['Tomatoes', 'Mozzarella', 'Basil', 'Olive Oil', 'Balsamic Vinegar', 'Salt', 'Pepper'],
    image: '🍅',
    cuisine: 'Italian',
    servings: 2,
  },
]

interface SwipeRecipesProps {
  onAddToShoppingList: (ingredients: string[]) => void
}

export function SwipeRecipes({ onAddToShoppingList }: SwipeRecipesProps) {
  const [recipes, setRecipes] = useState<Recipe[]>(RECIPES)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [liked, setLiked] = useState<Set<string>>(new Set())
  const [swiped, setSwiped] = useState<Set<string>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)
  const [dragStart, setDragStart] = useState(0)
  const [dragEnd, setDragEnd] = useState(0)

  const currentRecipe = recipes[currentIndex]
  const isComplete = currentIndex >= recipes.length

  const handleLike = () => {
    if (!currentRecipe) return
    setLiked((prev) => new Set(prev).add(currentRecipe.id))
    setSwiped((prev) => new Set(prev).add(currentRecipe.id))
    moveToNext()
  }

  const handlePass = () => {
    setSwiped((prev) => new Set(prev).add(currentRecipe.id))
    moveToNext()
  }

  const handleAddToList = () => {
    onAddToShoppingList(currentRecipe.ingredients)
    handleLike()
  }

  const moveToNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, recipes.length))
  }

  const shuffleRecipes = (items: Recipe[]) => {
    const next = [...items]
    for (let index = next.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1))
      ;[next[index], next[randomIndex]] = [next[randomIndex], next[index]]
    }
    return next
  }

  const handleReset = () => {
    setRecipes((previous) => shuffleRecipes(previous))
    setCurrentIndex(0)
    setLiked(new Set())
    setSwiped(new Set())
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStart(e.clientX)
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    setDragEnd(e.clientX)
    const distance = dragStart - e.clientX
    if (Math.abs(distance) > 50) {
      if (distance > 0) {
        handlePass()
      } else {
        handleLike()
      }
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStart(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    setDragEnd(e.changedTouches[0].clientX)
    const distance = dragStart - e.changedTouches[0].clientX
    if (Math.abs(distance) > 50) {
      if (distance > 0) {
        handlePass()
      } else {
        handleLike()
      }
    }
  }

  const swipedCount = swiped.size
  const totalRecipes = RECIPES.length
  const progress = Math.round((swipedCount / totalRecipes) * 100)

  if (isComplete) {
    return (
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Recipe Collection</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">All 8 recipes from your Discover session, ready to save or print.</p>
        </div>
        <div className="mx-auto w-full max-w-[794px] rounded-sm bg-white p-8 text-slate-900 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-700 print:shadow-none">
          <div className="border-b-2 border-slate-900 pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">Food Planner</p>
            <h1 className="mt-2 text-3xl font-bold">Recipe Collection</h1>
            <p className="mt-1 text-sm text-slate-500">Your complete Discover recipe sheet</p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-6">
            {recipes.map((recipe, index) => (
              <article key={recipe.id} className="break-inside-avoid border-b border-slate-200 pb-4">
                <div className="flex items-start gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">{index + 1}</span>
                  <div className="min-w-0">
                    <h3 className="font-bold leading-tight">{recipe.name}</h3>
                    <p className="mt-1 text-xs text-slate-500">{recipe.cuisine} · {recipe.time} · {recipe.servings} servings</p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">{recipe.ingredients.join(' · ')}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-500">
            <span>{liked.size} liked recipes</span>
            <span>Food Planner · Discover</span>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
  <Button onClick={() => window.print()} className="bg-amber-600 hover:bg-amber-700">Save A4 recipe sheet</Button>
  <Button onClick={handleReset} variant="outline">Reset and remix recommendations</Button>
  </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {currentIndex < recipes.length ? (
        <div className="flex flex-col items-center justify-center gap-8 py-12 px-4">
          <div className="text-sm text-muted-foreground">
            {currentIndex + 1}/{recipes.length} recipes • {Math.round(((currentIndex + 1) / recipes.length) * 100)}% explored
          </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
          <span>{swipedCount}/{totalRecipes} recipes</span>
          <span>{progress}% explored</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-amber-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card Container */}
      <div className="flex items-center justify-center">
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="cursor-grab active:cursor-grabbing"
        >
          <Card className="w-96 border-2 border-amber-100 shadow-2xl dark:border-slate-700">
            <CardHeader className="space-y-4 pb-3">
              <div className="text-center">
                <div className="text-6xl mb-4">{currentRecipe.image}</div>
                <CardTitle className="text-2xl">{currentRecipe.name}</CardTitle>
                <CardDescription className="mt-2">{currentRecipe.description}</CardDescription>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="outline">{currentRecipe.cuisine}</Badge>
                <Badge
                  variant={
                    currentRecipe.difficulty === 'Easy'
                      ? 'secondary'
                      : currentRecipe.difficulty === 'Medium'
                        ? 'default'
                        : 'destructive'
                  }
                >
                  {currentRecipe.difficulty}
                </Badge>
                <Badge variant="outline">{currentRecipe.time}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    Servings
                  </p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {currentRecipe.servings}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    Ingredients
                  </p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {currentRecipe.ingredients.length}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                  Key Ingredients
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentRecipe.ingredients.slice(0, 5).map((ingredient) => (
                    <Badge key={ingredient} variant="secondary" className="text-xs">
                      {ingredient}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Swipe Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handlePass}
                  variant="outline"
                  className="flex-1 gap-2"
                  size="lg"
                >
                  <X className="size-4" />
                  Pass
                </Button>
                <Button
                  onClick={handleAddToList}
                  className="flex-1 gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                  size="lg"
                >
                  <Heart className="size-4" />
                  Like
                </Button>
              </div>

              <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                or drag to swipe
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Liked Recipes */}
      {liked.size > 0 && (
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Your Likes ({liked.size})
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {RECIPES.filter((r) => liked.has(r.id)).map((recipe) => (
              <Card key={recipe.id} className="border-amber-100 dark:border-slate-700">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-3xl mb-1">{recipe.image}</div>
                      <CardTitle className="text-base">{recipe.name}</CardTitle>
                    </div>
                    <Heart className="size-5 fill-red-500 text-red-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {recipe.time}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {recipe.difficulty}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
        </div>
      ) : null}
    </div>
  )
}
