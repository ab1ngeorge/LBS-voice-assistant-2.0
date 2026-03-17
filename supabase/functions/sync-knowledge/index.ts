import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// ============================================
// Efficient page-to-section mapping
// Each URL maps directly to one or more existing knowledge_base section_keys
// ============================================
interface PageEntry {
    url: string
    sectionKey: string       // Maps to existing knowledge_base.section_key
    label: string
    priority: number         // Higher = more important, fetched first
    mergeWith?: string       // Optional: merge content into another section_key
}

const COLLEGE_PAGES: PageEntry[] = [
    // 🏛️ Core Institution (Priority 10)
    { url: 'https://lbscek.ac.in/', sectionKey: 'gen_info', label: 'Homepage', priority: 10 },
    { url: 'https://lbscek.ac.in/admission-procedure/', sectionKey: 'admission_process', label: 'Admission Process', priority: 10 },
    { url: 'https://lbscek.ac.in/fee-structure/', sectionKey: 'fee_structure', label: 'Fee Structure', priority: 10 },
    { url: 'https://lbscek.ac.in/mandatory-disclosure/', sectionKey: 'gen_info', label: 'Mandatory Disclosure', priority: 9, mergeWith: 'gen_info' },
    { url: 'https://lbscek.ac.in/vision-mission/', sectionKey: 'gen_info', label: 'Vision & Mission', priority: 8, mergeWith: 'gen_info' },

    // 👨‍💼 Leadership (Priority 9)
    { url: 'https://lbscek.ac.in/principal/', sectionKey: 'leadership_admin', label: 'Principal', priority: 9 },
    { url: 'https://lbscek.ac.in/director/', sectionKey: 'leadership_admin', label: 'Director', priority: 9, mergeWith: 'leadership_admin' },
    { url: 'https://lbscek.ac.in/board-of-governors/', sectionKey: 'gov_body', label: 'Board of Governors', priority: 8 },
    { url: 'https://lbscek.ac.in/administration/', sectionKey: 'leadership_admin', label: 'Administration', priority: 8, mergeWith: 'leadership_admin' },

    // 🎓 Academics (Priority 9)
    { url: 'https://lbscek.ac.in/programs/', sectionKey: 'academic_programs', label: 'Programs', priority: 9 },
    { url: 'https://lbscek.ac.in/academic-calendar/', sectionKey: 'academic_calendar', label: 'Academic Calendar', priority: 8 },
    { url: 'https://lbscek.ac.in/schemes-syllabi/', sectionKey: 'curriculum', label: 'Schemes & Syllabi', priority: 8 },
    { url: 'https://lbscek.ac.in/regulations/', sectionKey: 'academic_policies', label: 'Academic Regulations', priority: 7 },

    // 🧑‍🏫 Departments → Faculty lists (Priority 8)
    { url: 'https://lbscek.ac.in/computer-science-engineering-2/', sectionKey: 'faculty_cse', label: 'CSE Department', priority: 8 },
    { url: 'https://lbscek.ac.in/mechanical-engineering/', sectionKey: 'faculty_mech', label: 'ME Department', priority: 8 },
    { url: 'https://lbscek.ac.in/electrical-electronics-engineering/', sectionKey: 'faculty_eee', label: 'EEE Department', priority: 8 },
    { url: 'https://lbscek.ac.in/electronics-communication-engineering/', sectionKey: 'faculty_ece', label: 'ECE Department', priority: 8 },
    { url: 'https://lbscek.ac.in/civil-engineering/', sectionKey: 'faculty_civil', label: 'Civil Department', priority: 8 },
    { url: 'https://lbscek.ac.in/applied-science/', sectionKey: 'faculty_appsci', label: 'Applied Science', priority: 7 },
    { url: 'https://lbscek.ac.in/departments/', sectionKey: 'academic_programs', label: 'All Departments', priority: 8, mergeWith: 'academic_programs' },

    // 🏃 Student Activities (Priority 7-8)
    { url: 'https://lbscek.ac.in/career-guidance-placement-unit-cgpu/', sectionKey: 'placements', label: 'Placements (CGPU)', priority: 9 },
    { url: 'https://lbscek.ac.in/iedc/', sectionKey: 'entrepreneurship', label: 'IEDC', priority: 7 },
    { url: 'https://lbscek.ac.in/college-union/', sectionKey: 'cultural_activities', label: 'College Union', priority: 6 },
    { url: 'https://lbscek.ac.in/alumni-association/', sectionKey: 'alumni', label: 'Alumni Association', priority: 6 },
    { url: 'https://lbscek.ac.in/nss/', sectionKey: 'cultural_activities', label: 'NSS', priority: 6, mergeWith: 'cultural_activities' },
    { url: 'https://lbscek.ac.in/ncc/', sectionKey: 'cultural_activities', label: 'NCC', priority: 6, mergeWith: 'cultural_activities' },
    { url: 'https://lbscek.ac.in/scholarships/', sectionKey: 'financial_aid', label: 'Scholarships', priority: 7 },

    // 🏘️ Facilities (Priority 7-8)
    { url: 'https://lbscek.ac.in/central-library/', sectionKey: 'library_resources_detailed', label: 'Central Library', priority: 7 },
    { url: 'https://lbscek.ac.in/hostel/', sectionKey: 'hostel_living', label: 'Hostel', priority: 8 },
    { url: 'https://lbscek.ac.in/bus-service/', sectionKey: 'transport_routes', label: 'Bus Service', priority: 7 },
    { url: 'https://lbscek.ac.in/central-computing-facility/', sectionKey: 'lab_infrastructure', label: 'Computing Facility', priority: 7 },
    { url: 'https://lbscek.ac.in/aicte-idea-lab/', sectionKey: 'makerspace', label: 'AICTE IDEA Lab', priority: 6 },
    { url: 'https://lbscek.ac.in/sports/', sectionKey: 'sports_fitness', label: 'Sports', priority: 6 },
    { url: 'https://lbscek.ac.in/cafeteria/', sectionKey: 'dining_options', label: 'Cafeteria', priority: 5 },
    { url: 'https://lbscek.ac.in/medical-facility/', sectionKey: 'health_wellness', label: 'Medical Facility', priority: 7 },
    { url: 'https://lbscek.ac.in/women-cell/', sectionKey: 'support_services', label: 'Women Cell', priority: 6 },

    // 🔗 Admission variants (Priority 8-9)
    { url: 'https://lbscek.ac.in/admission-keam/', sectionKey: 'admission_process', label: 'KEAM Admission', priority: 9, mergeWith: 'admission_process' },
    { url: 'https://lbscek.ac.in/nri-scheme/', sectionKey: 'admission_categories', label: 'NRI Scheme', priority: 8 },
    { url: 'https://lbscek.ac.in/lateral-entry-scheme/', sectionKey: 'admission_categories', label: 'Lateral Entry', priority: 8, mergeWith: 'admission_categories' },
    { url: 'https://lbscek.ac.in/mba-admission/', sectionKey: 'admission_categories', label: 'MBA Admission', priority: 8, mergeWith: 'admission_categories' },
    { url: 'https://lbscek.ac.in/mca-admission/', sectionKey: 'admission_categories', label: 'MCA Admission', priority: 8, mergeWith: 'admission_categories' },

    // 📞 Contact & Safety
    { url: 'https://lbscek.ac.in/contact-2/', sectionKey: 'useful_contacts', label: 'Contact Us', priority: 8 },
    { url: 'https://lbscek.ac.in/anti-ragging-cell/', sectionKey: 'ragging_prevention', label: 'Anti-Ragging', priority: 7 },
    { url: 'https://lbscek.ac.in/grievance-redressal/', sectionKey: 'support_services', label: 'Grievance Redressal', priority: 7, mergeWith: 'support_services' },
    { url: 'https://lbscek.ac.in/icc/', sectionKey: 'support_services', label: 'Internal Complaints Committee', priority: 6, mergeWith: 'support_services' },

    // 📊 Research & Innovation
    { url: 'https://lbscek.ac.in/research/', sectionKey: 'research_development', label: 'Research', priority: 7 },
    { url: 'https://lbscek.ac.in/ipr-cell/', sectionKey: 'research_development', label: 'IPR Cell', priority: 6, mergeWith: 'research_development' },
    { url: 'https://lbscek.ac.in/rd-cell/', sectionKey: 'research_development', label: 'R&D Cell', priority: 6, mergeWith: 'research_development' },

    // 📢 Media & Updates
    { url: 'https://lbscek.ac.in/news-events/', sectionKey: 'campus_news', label: 'News & Events', priority: 7 },
    { url: 'https://lbscek.ac.in/tenders/', sectionKey: 'procurement', label: 'Tenders', priority: 5 },
    { url: 'https://lbscek.ac.in/careers/', sectionKey: 'employment', label: 'Careers', priority: 6 },
]

// ============================================
// Scraping & content helpers
// ============================================

/** Strip common boilerplate from scraped markdown */
function cleanContent(markdown: string): string {
    if (!markdown) return ''

    return markdown
        // Remove navigation menu lines
        .replace(/^(Home|About|Academics|Departments|Activities|Facilities|Contact|Fee Payment|Admission).*$/gm, '')
        // Remove social links
        .replace(/\[?(Facebook|Twitter|Instagram|LinkedIn|YouTube)\]?\s*\(?https?:\/\/[^\s)]+\)?/gi, '')
        // Remove empty lines bunched together (3+ → 2)
        .replace(/\n{3,}/g, '\n\n')
        // Remove cookie/consent notices
        .replace(/cookie.*consent.*\n/gi, '')
        .trim()
}

/** Truncate content to a safe length for DB storage */
function trimContent(text: string, maxChars = 6000): string {
    if (!text || text.length <= maxChars) return text || ''
    const cut = text.lastIndexOf('\n\n', maxChars)
    return text.slice(0, cut > 0 ? cut : maxChars) + '\n\n*(content truncated)*'
}

/** Scrape a single URL using Firecrawl with timeout */
async function scrapePage(url: string, apiKey: string): Promise<{ title: string; content: string } | null> {
    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 12000) // 12s timeout

        const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url,
                formats: ['markdown'],
                onlyMainContent: true,
                waitFor: 1500,
            }),
            signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
            console.warn(`HTTP ${response.status} for ${url}`)
            return null
        }

        const data = await response.json()

        if (data.success) {
            const rawContent = data.data?.markdown || data.markdown || ''
            const title = data.data?.metadata?.title || data.metadata?.title || ''

            if (rawContent && rawContent.length > 50) {
                return { title, content: cleanContent(rawContent) }
            }
        }
        return null
    } catch (error) {
        console.error(`Scrape failed for ${url}:`, error.message || error)
        return null
    }
}

/** Scrape multiple pages in parallel (batch of N) */
async function scrapeBatch(pages: PageEntry[], apiKey: string, batchSize = 3): Promise<Map<string, { title: string; content: string; label: string }>> {
    const results = new Map<string, { title: string; content: string; label: string }>()

    for (let i = 0; i < pages.length; i += batchSize) {
        const batch = pages.slice(i, i + batchSize)
        console.log(`[Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(pages.length / batchSize)}] Scraping: ${batch.map(p => p.label).join(', ')}`)

        const promises = batch.map(async (page) => {
            const scraped = await scrapePage(page.url, apiKey)
            return { page, scraped }
        })

        const batchResults = await Promise.allSettled(promises)

        for (const result of batchResults) {
            if (result.status === 'fulfilled' && result.value.scraped) {
                const { page, scraped } = result.value
                const key = page.mergeWith || page.sectionKey

                if (results.has(key)) {
                    // Merge: append content to existing section
                    const existing = results.get(key)!
                    existing.content += `\n\n---\n\n### ${page.label}\n\n${scraped.content}`
                } else {
                    results.set(key, {
                        title: scraped.title || page.label,
                        content: `### ${page.label}\n\n${scraped.content}`,
                        label: page.label,
                    })
                }
                console.log(`  ✓ ${page.label} (${scraped.content.length} chars)`)
            } else {
                const page = result.status === 'fulfilled' ? result.value.page : null
                console.warn(`  ✗ ${page?.label || 'unknown'}: No content`)
            }
        }

        // Rate-limit between batches (1 second)
        if (i + batchSize < pages.length) {
            await new Promise(resolve => setTimeout(resolve, 1000))
        }
    }

    return results
}

/** Check if a section needs updating (older than refresh days) */
async function shouldUpdateSection(supabase: any, sectionKey: string, refreshDays: number): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .from('knowledge_base')
            .select('updated_at')
            .eq('section_key', sectionKey)
            .single()

        if (error || !data) return true

        const lastUpdate = new Date(data.updated_at)
        const daysSince = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)
        return daysSince > refreshDays
    } catch {
        return true
    }
}

// ============================================
// Main handler
// ============================================
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
        const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY')
        if (!firecrawlKey) throw new Error('FIRECRAWL_API_KEY not configured')

        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        if (!supabaseUrl || !supabaseKey) throw new Error('Missing Supabase credentials')

        const supabase = createClient(supabaseUrl, supabaseKey)

        // Parse options from request body
        let forceRefresh = false
        let refreshDays = 7
        let batchSize = 3

        try {
            const body = await req.json()
            forceRefresh = body?.force === true
            refreshDays = body?.refreshDays || 7
            batchSize = Math.min(body?.batchSize || 3, 5) // Max 5 parallel
        } catch {
            // Defaults
        }

        // Sort by priority (highest first)
        const sortedPages = [...COLLEGE_PAGES].sort((a, b) => b.priority - a.priority)

        // Filter out sections that don't need updating
        let pagesToSync: PageEntry[]
        if (forceRefresh) {
            pagesToSync = sortedPages
            console.log(`Force refresh: syncing all ${pagesToSync.length} pages`)
        } else {
            // Check which sections need updating
            const uniqueKeys = [...new Set(sortedPages.map(p => p.mergeWith || p.sectionKey))]
            const needsUpdate = new Set<string>()

            for (const key of uniqueKeys) {
                if (await shouldUpdateSection(supabase, key, refreshDays)) {
                    needsUpdate.add(key)
                }
            }

            pagesToSync = sortedPages.filter(p => needsUpdate.has(p.mergeWith || p.sectionKey))
            console.log(`${pagesToSync.length}/${sortedPages.length} pages need updating (${needsUpdate.size} sections stale)`)
        }

        if (pagesToSync.length === 0) {
            return new Response(
                JSON.stringify({
                    success: true,
                    message: 'All sections are up to date',
                    stats: { synced: 0, skipped: sortedPages.length, failed: 0, total: sortedPages.length }
                }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Scrape pages in parallel batches
        const scrapedData = await scrapeBatch(pagesToSync, firecrawlKey, batchSize)

        console.log(`\nScraped ${scrapedData.size} sections. Upserting to database...`)

        // Batch upsert: prepare all records at once
        const records = Array.from(scrapedData.entries()).map(([sectionKey, data], idx) => ({
            section_key: sectionKey,
            section_title: data.title,
            content: trimContent(data.content),
            section_order: idx + 1,
            updated_at: new Date().toISOString(),
        }))

        // Upsert all at once
        let synced = 0
        let failed = 0
        const errors: string[] = []

        // Supabase upsert in chunks of 10 (to avoid payload limits)
        for (let i = 0; i < records.length; i += 10) {
            const chunk = records.slice(i, i + 10)
            const { error } = await supabase
                .from('knowledge_base')
                .upsert(chunk, { onConflict: 'section_key' })

            if (error) {
                console.error(`Batch upsert error:`, error.message)
                failed += chunk.length
                errors.push(error.message)
            } else {
                synced += chunk.length
                console.log(`  ✓ Upserted batch ${Math.floor(i / 10) + 1} (${chunk.length} records)`)
            }
        }

        const skipped = sortedPages.length - pagesToSync.length

        console.log('\n=== Sync Complete ===')
        console.log(`Synced: ${synced} | Skipped: ${skipped} | Failed: ${failed}`)

        return new Response(
            JSON.stringify({
                success: true,
                message: `Synced ${synced} sections from ${pagesToSync.length} pages`,
                stats: { synced, skipped, failed, total: sortedPages.length },
                sections: Array.from(scrapedData.keys()),
                errors: errors.length > 0 ? errors : undefined
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        console.error('Fatal sync error:', error)
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message,
                stack: Deno.env.get('ENVIRONMENT') === 'development' ? error.stack : undefined
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})