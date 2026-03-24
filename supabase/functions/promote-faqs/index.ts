import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// ============================================
// Auto-Promote FAQs from chat_analytics
// ============================================
// Analyzes the chat_analytics table for frequently asked questions
// that were successfully answered by the LLM. Promotes them to
// the dynamic_faqs table so the frontend can serve them locally.

const MIN_HIT_COUNT = 20       // Minimum times a query must appear
const MAX_PROMOTED_FAQS = 50   // Cap on total dynamic FAQs

/**
 * Normalize a query for grouping: lowercase, trim, remove punctuation,
 * collapse whitespace. This groups slight variants of the same question.
 */
function normalizeForGrouping(query: string): string {
  return query
    .toLowerCase()
    .replace(/[^\w\s\u0D00-\u0D7F]/g, ' ')  // Keep letters, digits, Malayalam, spaces
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Extract simple keywords from a question for FAQ matching.
 */
function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    'the', 'is', 'a', 'an', 'of', 'to', 'in', 'for', 'and', 'or', 'on',
    'at', 'by', 'it', 'i', 'me', 'my', 'we', 'do', 'can', 'how', 'what',
    'which', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'please',
    'tell', 'about', 'where', 'when', 'does', 'this', 'that',
  ])
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s\u0D00-\u0D7F]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w))
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !supabaseKey) throw new Error('Missing Supabase credentials')

    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('[Promote] Starting FAQ promotion analysis...')

    // Step 1: Fetch all successfully answered queries from analytics
    const { data: analytics, error: fetchError } = await supabase
      .from('chat_analytics')
      .select('query')
      .eq('was_answered', true)
      .order('created_at', { ascending: false })
      .limit(5000) // Analyze last 5000 answered queries

    if (fetchError) throw new Error(`Failed to fetch analytics: ${fetchError.message}`)
    if (!analytics || analytics.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No analytics data to analyze', promoted: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[Promote] Analyzing ${analytics.length} answered queries...`)

    // Step 2: Group by normalized query and count
    const queryGroups = new Map<string, { count: number; original: string }>()

    for (const row of analytics) {
      const normalized = normalizeForGrouping(row.query)
      if (normalized.length < 5) continue // Skip very short queries

      const existing = queryGroups.get(normalized)
      if (existing) {
        existing.count++
      } else {
        queryGroups.set(normalized, { count: 1, original: row.query })
      }
    }

    // Step 3: Filter to queries that meet the threshold
    const frequentQueries = Array.from(queryGroups.entries())
      .filter(([_, group]) => group.count >= MIN_HIT_COUNT)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, MAX_PROMOTED_FAQS)

    console.log(`[Promote] Found ${frequentQueries.length} queries with ≥${MIN_HIT_COUNT} hits`)

    if (frequentQueries.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: `No queries found with ≥${MIN_HIT_COUNT} hits yet`,
          promoted: 0,
          totalAnalyzed: analytics.length,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 4: For each frequent question, get the LLM's most recent successful answer
    // by re-querying the chat function (or we could store answers in analytics in the future).
    // For now, we store the question with a placeholder answer that the admin can review.
    const records = frequentQueries.map(([normalized, group]) => ({
      question: group.original.substring(0, 500),
      answer: `This is a frequently asked question (asked ${group.count}+ times). Please provide a curated answer.`,
      hit_count: group.count,
      keywords: extractKeywords(normalized),
    }))

    // Step 5: Upsert into dynamic_faqs
    const { error: upsertError } = await supabase
      .from('dynamic_faqs')
      .upsert(records, { onConflict: 'question' })

    if (upsertError) throw new Error(`Failed to upsert FAQs: ${upsertError.message}`)

    console.log(`[Promote] Successfully promoted ${records.length} FAQs`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Promoted ${records.length} frequently asked questions`,
        promoted: records.length,
        totalAnalyzed: analytics.length,
        topQuestions: frequentQueries.slice(0, 5).map(([_, g]) => ({
          question: g.original.substring(0, 100),
          hits: g.count,
        })),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('[Promote] Fatal error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
