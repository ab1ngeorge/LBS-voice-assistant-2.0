import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// ============================================
// resolve-questions: Auto-resolve unanswered questions
// 1. Picks pending questions from unanswered_questions
// 2. Scrapes relevant college website pages
// 3. Uses Groq LLM to extract a structured answer
// 4. Saves resolved answer into knowledge_base
// ============================================

const MAX_QUESTIONS_PER_RUN = 5
const MAX_ATTEMPTS = 3

/** Map question keywords to relevant website URLs */
function getRelevantUrls(question: string): string[] {
    const q = question.toLowerCase()
    const base = 'https://lbscek.ac.in'
    const urls: string[] = [base] // Always include homepage

    const keywordMap: Record<string, string[]> = {
        // Admission — Malayalam: പ്രവേശനം, കീം | Manglish: praveshanam, admission
        'admission|keam|eligibility|apply|entrance|പ്രവേശനം|കീം|praveshanam|admit': ['/admission-procedure/', '/admission-keam/', '/nri-scheme/', '/lateral-entry-scheme/'],
        // Fee — Malayalam: ഫീസ്, ശുല്ക | Manglish: fees, panam
        'fee|tuition|cost|payment|scholarship|ഫീസ്|ശുല്ക|fees|panam': ['/fee-structure/', '/annual-admission-fee/', '/fee-waiver-scheme/'],
        // Hostel/Mess — Malayalam: ഹോസ്റ്റൽ, മെസ്, ഭക്ഷണം | Manglish: hostel, mess, bhakshanam
        'hostel|mess|room|accommodation|warden|ഹോസ്റ്റൽ|മെസ്|ഭക്ഷണം|താമസം|bhakshanam|thamasam|food|menu': ['/hostel/'],
        // Placement — Malayalam: പ്ലേസ്മെന്റ്, ജോലി | Manglish: placement, joli
        'placement|job|recruit|company|package|salary|cgpu|പ്ലേസ്മെന്റ്|ജോലി|കമ്പനി|joli|ശമ്പളം|shamblam': ['/career-guidance-placement-unit-cgpu/'],
        // Library — Malayalam: ലൈബ്രറി, പുസ്തകം | Manglish: library, pusthakam
        'library|book|journal|reading|ലൈബ്രറി|പുസ്തകം|pusthakam|grandhashala': ['/central-library/', '/digital-library/'],
        // Bus/Transport — Malayalam: ബസ്, വാഹനം | Manglish: bus, vahanam
        'bus|transport|route|ബസ്|വാഹനം|യാത്ര|vahanam|yathra': ['/bus-service/'],
        // CSE — Malayalam: കമ്പ്യൂട്ടർ | Manglish: computer
        'cse|computer|software|it|information technology|കമ്പ്യൂട്ടർ|സോഫ്റ്റ്‌വെയർ': ['/computer-science-engineering-2/'],
        // Mechanical — Malayalam: മെക്കാനിക്കൽ
        'mechanical|mech|മെക്കാനിക്കൽ': ['/mechanical-engineering/'],
        // Electrical — Malayalam: ഇലക്ട്രിക്കൽ
        'electrical|eee|ഇലക്ട്രിക്കൽ': ['/electrical-electronics-engineering/'],
        // Electronics — Malayalam: ഇലക്ട്രോണിക്സ്
        'electronics|ece|communication|ഇലക്ട്രോണിക്സ്': ['/electronics-communication-engineering/'],
        // Civil — Malayalam: സിവിൽ
        'civil|സിവിൽ': ['/civil-engineering/'],
        // Administration — Malayalam: പ്രിൻസിപ്പൽ, ഡയറക്ടർ
        'principal|director|dean|administration|പ്രിൻസിപ്പൽ|ഡയറക്ടർ|ഡീൻ|അഡ്മിൻ': ['/principal/', '/director/', '/administrative-wing/'],
        // Clubs — Malayalam: ക്ലബ്, സ്റ്റാർട്ടപ്പ്
        'club|iedc|startup|innovation|entrepreneur|ക്ലബ്|സ്റ്റാർട്ടപ്പ്|നവീകരണം': ['/iedc/'],
        'nss|service|volunteer|എൻഎസ്എസ്|സേവനം': ['/national-service-scheme/'],
        'ieee|professional': ['/ieee/'],
        'alumni|പൂർവ്വ വിദ്യാർത്ഥി|alumini': ['/alumni-association/'],
        // Calendar — Malayalam: കലണ്ടർ, പരീക്ഷ
        'calendar|schedule|semester|exam|കലണ്ടർ|പരീക്ഷ|സെമസ്റ്റർ|pareeksha': ['/academic-calendar/'],
        // Syllabus — Malayalam: സിലബസ്, കോഴ്സ്
        'syllabus|curriculum|course|സിലബസ്|കോഴ്സ്|പാഠ്യപദ്ധതി': ['/syllabus/', '/programs/'],
        // Labs — Malayalam: ലാബ്
        'lab|computer center|computing|makerspace|ലാബ്': ['/central-computing-facility/', '/aicte-idea-lab/'],
        // Safety — Malayalam: റാഗിംഗ്, പരാതി
        'ragging|complaint|grievance|safety|റാഗിംഗ്|പരാതി|സുരക്ഷ': ['/anti-ragging-cell/', '/grievance-cell/'],
        // Sports — Malayalam: കായികം, സ്റ്റേഡിയം
        'sport|stadium|gym|cricket|football|കായികം|സ്റ്റേഡിയം|കളി|kali': ['/physical-education/'],
        // Campus — Malayalam: ക്യാമ്പസ്
        'map|direction|location|campus|navigate|ക്യാമ്പസ്|സ്ഥലം|വഴി|vazhi': ['/college-map/'],
        // Cultural — Malayalam: ഉത്സവം, സാംസ്കാരികം
        'union|cultural|fest|event|ഉത്സവം|സാംസ്കാരികം|ആഘോഷം|fest': ['/college-union/'],
        'nba|accreditation|iqac|quality': ['/nba-accreditation-process/', '/internal-quality-assurance-cell-iqac/'],
        'pta|parent|രക്ഷാകർത്താവ്|പിടിഎ': ['/parent-teacher-association/'],
        'governor|governing|board|ഭരണസമിതി': ['/board-of-governors/'],
        'download|form|application|ഫോം|അപേക്ഷ': ['/downloads/'],
        // Contact — Malayalam: ഫോൺ, ബന്ധപ്പെടുക
        'contact|phone|email|address|ഫോൺ|ബന്ധപ്പെടുക|വിലാസം|number': ['/contact-2/'],
        'news|update|latest|announcement|വാർത്ത|അറിയിപ്പ്|പുതിയ': ['/news-and-updates/'],
    }

    for (const [pattern, paths] of Object.entries(keywordMap)) {
        const keywords = pattern.split('|')
        if (keywords.some(kw => q.includes(kw))) {
            urls.push(...paths.map(p => `${base}${p}`))
        }
    }

    // Deduplicate and limit to 3 pages
    return [...new Set(urls)].slice(0, 3)
}

/** Scrape a URL using Firecrawl */
async function scrapePage(url: string, apiKey: string): Promise<string> {
    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 12000)

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

        if (!response.ok) return ''

        const data = await response.json()
        if (data.success) {
            const content = data.data?.markdown || data.markdown || ''
            return content.slice(0, 4000) // Limit per page
        }
        return ''
    } catch {
        return ''
    }
}

/** Use Groq LLM to extract a structured answer from scraped content */
async function extractAnswer(
    question: string,
    scrapedContent: string,
    groqKey: string
): Promise<{ answer: string; sectionTitle: string } | null> {
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${groqKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: `You are a knowledge extraction assistant for LBS College of Engineering (LBSCEK), Kasaragod.

TASK: Extract a factual, structured answer from the provided website content to answer the user's question.

RULES:
1. ONLY use information explicitly present in the scraped content. DO NOT make up information.
2. If the content does NOT contain an answer, respond with EXACTLY: NO_ANSWER_FOUND
3. Format the answer as a clean, concise knowledge base entry using markdown.
4. Include a section title that describes the topic.
5. Start with "SECTION_TITLE: <title>" on the first line, then the answer content.
6. Keep the answer focused and under 500 words.
7. Include specific details like numbers, names, dates, URLs when available.`
                    },
                    {
                        role: 'user',
                        content: `QUESTION: ${question}\n\nWEBSITE CONTENT:\n${scrapedContent}`
                    }
                ],
                max_tokens: 800,
                temperature: 0.1,
            }),
        })

        if (!response.ok) {
            console.error('Groq API error:', response.status)
            return null
        }

        const data = await response.json()
        const reply = data.choices?.[0]?.message?.content || ''

        if (reply.includes('NO_ANSWER_FOUND') || reply.length < 20) {
            return null
        }

        // Parse section title and answer
        const titleMatch = reply.match(/SECTION_TITLE:\s*(.+)/i)
        const sectionTitle = titleMatch ? titleMatch[1].trim() : 'Resolved Question'
        const answer = reply.replace(/SECTION_TITLE:\s*.+\n?/i, '').trim()

        return { answer, sectionTitle }
    } catch (error) {
        console.error('LLM extraction error:', error)
        return null
    }
}

/** Generate a section key from question text */
function questionToSectionKey(question: string, id: number): string {
    const words = question
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 2)
        .slice(0, 4)
        .join('_')
    return `resolved_${words || id}`
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
        const groqKey = Deno.env.get('GROQ_API_KEY')
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!firecrawlKey) throw new Error('FIRECRAWL_API_KEY not configured')
        if (!groqKey) throw new Error('GROQ_API_KEY not configured')
        if (!supabaseUrl || !supabaseKey) throw new Error('Missing Supabase credentials')

        const supabase = createClient(supabaseUrl, supabaseKey)

        // Fetch pending questions (oldest first)
        const { data: questions, error: fetchError } = await supabase
            .from('unanswered_questions')
            .select('*')
            .eq('status', 'pending')
            .lt('attempts', MAX_ATTEMPTS)
            .order('created_at', { ascending: true })
            .limit(MAX_QUESTIONS_PER_RUN)

        if (fetchError) throw new Error(`Failed to fetch questions: ${fetchError.message}`)

        if (!questions || questions.length === 0) {
            return new Response(
                JSON.stringify({ success: true, message: 'No pending questions to resolve', resolved: 0 }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        console.log(`Processing ${questions.length} unanswered questions...`)

        const results = { resolved: 0, unresolvable: 0, retrying: 0 }

        for (const q of questions) {
            console.log(`\n[Q${q.id}] "${q.question.substring(0, 80)}..."`)

            // Mark as resolving
            await supabase
                .from('unanswered_questions')
                .update({ status: 'resolving', attempts: q.attempts + 1 })
                .eq('id', q.id)

            // Get relevant URLs for this question
            const urls = getRelevantUrls(q.question)
            console.log(`  Scraping ${urls.length} pages: ${urls.join(', ')}`)

            // Scrape pages
            const scrapedParts: string[] = []
            for (const url of urls) {
                const content = await scrapePage(url, firecrawlKey)
                if (content) {
                    scrapedParts.push(`--- Content from ${url} ---\n${content}`)
                }
                // Small delay between scrapes
                await new Promise(r => setTimeout(r, 500))
            }

            const allScraped = scrapedParts.join('\n\n')

            if (!allScraped || allScraped.length < 100) {
                console.log(`  ✗ No useful content scraped`)
                if (q.attempts + 1 >= MAX_ATTEMPTS) {
                    await supabase
                        .from('unanswered_questions')
                        .update({ status: 'unresolvable' })
                        .eq('id', q.id)
                    results.unresolvable++
                } else {
                    await supabase
                        .from('unanswered_questions')
                        .update({ status: 'pending' })
                        .eq('id', q.id)
                    results.retrying++
                }
                continue
            }

            // Use LLM to extract answer
            console.log(`  Extracting answer with LLM (${allScraped.length} chars of context)...`)
            const extracted = await extractAnswer(q.question, allScraped, groqKey)

            if (!extracted) {
                console.log(`  ✗ LLM could not find answer`)
                if (q.attempts + 1 >= MAX_ATTEMPTS) {
                    await supabase
                        .from('unanswered_questions')
                        .update({ status: 'unresolvable' })
                        .eq('id', q.id)
                    results.unresolvable++
                } else {
                    await supabase
                        .from('unanswered_questions')
                        .update({ status: 'pending' })
                        .eq('id', q.id)
                    results.retrying++
                }
                continue
            }

            // Save to knowledge_base
            const sectionKey = questionToSectionKey(q.question, q.id)
            const formattedContent = `## ${extracted.sectionTitle}\n\n${extracted.answer}\n\n*Auto-resolved from user question on ${new Date().toLocaleDateString()}*`

            // Get next section_order
            const { data: maxOrder } = await supabase
                .from('knowledge_base')
                .select('section_order')
                .order('section_order', { ascending: false })
                .limit(1)
                .single()

            const nextOrder = (maxOrder?.section_order || 200) + 1

            const { error: upsertError } = await supabase
                .from('knowledge_base')
                .upsert({
                    section_key: sectionKey,
                    section_title: extracted.sectionTitle,
                    content: formattedContent,
                    section_order: nextOrder,
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'section_key' })

            if (upsertError) {
                console.error(`  ✗ Failed to save to knowledge_base:`, upsertError.message)
                await supabase
                    .from('unanswered_questions')
                    .update({ status: 'pending' })
                    .eq('id', q.id)
                results.retrying++
                continue
            }

            // Mark question as resolved
            await supabase
                .from('unanswered_questions')
                .update({
                    status: 'resolved',
                    resolved_answer: extracted.answer.substring(0, 2000),
                    resolved_section_key: sectionKey,
                    source_url: urls.join(', '),
                    resolved_at: new Date().toISOString(),
                })
                .eq('id', q.id)

            console.log(`  ✓ Resolved! Added to knowledge_base as "${sectionKey}"`)
            results.resolved++

            // Rate limit between questions
            await new Promise(r => setTimeout(r, 1000))
        }

        console.log(`\n=== Resolve Complete ===`)
        console.log(`Resolved: ${results.resolved} | Unresolvable: ${results.unresolvable} | Retrying: ${results.retrying}`)

        return new Response(
            JSON.stringify({
                success: true,
                message: `Processed ${questions.length} questions`,
                stats: results,
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        console.error('Fatal resolve error:', error)
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
