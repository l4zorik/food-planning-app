import { generateText, gateway } from 'ai'
import { NextResponse } from 'next/server'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export async function POST(request: Request) {
  try {
    const { preferences, dietary } = await request.json()

    if (typeof preferences !== 'string' || preferences.trim().length < 2) {
      return NextResponse.json({ error: 'Please describe your meal preferences.' }, { status: 400 })
    }

    const { text } = await generateText({
      model: gateway('openai/gpt-4o-mini'),
      system:
        'You create practical weekly meal plans. Return only valid JSON with a plan array of exactly seven objects. Each object must have day, meals (breakfast, lunch, dinner), and ingredients (array of strings). Keep meals concise and ingredients realistic.',
      prompt: `Create a 7-day meal plan for these preferences: ${preferences.trim()}. Dietary restrictions: ${dietary || 'none'}. Use these days in order: ${DAYS.join(', ')}.`,
    })

    const parsed = JSON.parse(text.replace(/^```json\s*|\s*```$/g, '').trim())
    if (!Array.isArray(parsed.plan) || parsed.plan.length !== 7) {
      throw new Error('Invalid plan format')
    }

    return NextResponse.json({ plan: parsed.plan })
  } catch (error) {
    console.error('[v0] Meal plan generation failed:', error)
    return NextResponse.json({ error: 'Unable to generate a plan right now.' }, { status: 500 })
  }
}
