'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Trash2, Copy, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

interface ShoppingListProps {
  items: Record<string, boolean>
  onToggleItem: (item: string) => void
}

const CATEGORIES: Record<string, string[]> = {
  Produce: ['tomatoes', 'cucumber', 'cherry tomatoes', 'red bell pepper', 'zucchini', 'asparagus', 'peas', 'bell peppers', 'broccoli', 'spinach', 'onion', 'garlic', 'ginger', 'lemon', 'carrots'],
  Pantry: ['quinoa', 'rice', 'pasta', 'chickpeas', 'soy sauce', 'honey', 'tahini', 'olive oil', 'sesame oil', 'cumin', 'turmeric', 'salt', 'pepper', 'balsamic vinegar', 'bread'],
  Protein: ['salmon fillet', 'chicken breast'],
  Dairy: ['mozzarella', 'parmesan'],
  Herbs: ['basil', 'cilantro', 'dill', 'green onions'],
  Other: ['coconut milk'],
}

export function ShoppingList({ items, onToggleItem }: ShoppingListProps) {
  const [copiedMessage, setCopiedMessage] = useState(false)

  const categorizedItems = Object.entries(CATEGORIES).reduce(
    (acc, [category, categoryItems]) => {
      const matching = categoryItems.filter((item) => item in items)
      if (matching.length > 0) {
        acc[category] = matching
      }
      return acc
    },
    {} as Record<string, string[]>
  )

  const totalItems = Object.keys(items).length
  const completedItems = Object.values(items).filter((v) => v).length
  const remainingItems = totalItems - completedItems

  const handleCopyList = () => {
    const listText = Object.entries(categorizedItems)
      .map(([category, categoryItems]) => {
        const categoryList = categoryItems
          .map((item) => `${items[item] ? '✓' : '○'} ${item}`)
          .join('\n')
        return `${category}\n${categoryList}`
      })
      .join('\n\n')

    navigator.clipboard.writeText(listText)
    setCopiedMessage(true)
    setTimeout(() => setCopiedMessage(false), 2000)
  }

  if (totalItems === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="mb-2 text-2xl font-semibold text-slate-900 dark:text-white">
            Shopping List
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Your shopping list will appear here
          </p>
        </div>

        <Card className="border-amber-200 bg-amber-50 dark:border-slate-700 dark:bg-slate-800/50">
          <CardContent className="pt-6 text-center">
            <p className="mb-4 text-slate-700 dark:text-slate-300">
              Add recipes to create your shopping list
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-semibold text-slate-900 dark:text-white">
          Shopping List
        </h2>
        <p className="text-slate-600 dark:text-slate-300">
          {remainingItems} items to buy • {completedItems} completed
        </p>
      </div>

      {/* Progress */}
      <Card className="border-amber-200 dark:border-slate-700">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Progress</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {completedItems}/{totalItems}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                style={{ width: `${totalItems > 0 ? (completedItems / totalItems) * 100 : 0}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={handleCopyList}
          variant="outline"
          className="gap-2"
        >
          <Copy className="size-4" />
          {copiedMessage ? 'Copied!' : 'Copy List'}
        </Button>
      </div>

      {/* Categorized List */}
      <div className="space-y-4">
        {Object.entries(categorizedItems).map(([category, categoryItems]) => (
          <Card key={category} className="border-amber-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categoryItems.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Checkbox
                      checked={items[item] || false}
                      onCheckedChange={() => onToggleItem(item)}
                      className="cursor-pointer"
                    />
                    <span
                      className={`flex-1 cursor-pointer ${
                        items[item]
                          ? 'line-through text-slate-400'
                          : 'text-slate-700 dark:text-slate-200'
                      }`}
                      onClick={() => onToggleItem(item)}
                    >
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </span>
                    {items[item] && (
                      <CheckCircle2 className="size-5 text-emerald-500" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tips */}
      <Card className="border-amber-200 bg-amber-50 dark:border-slate-700 dark:bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-sm">📋 Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <p>• Click items to mark them as bought</p>
          <p>• Use the Copy button to paste your list in Notes or send to your phone</p>
          <p>• Add more recipes from the Recipes tab to expand your list</p>
        </CardContent>
      </Card>
    </div>
  )
}
