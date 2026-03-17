import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { RecursiveCharacterTextSplitter } from 'https://esm.sh/langchain@0.1.25/text_splitter'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface Document {
  id?: number
  url: string
  title: string
  content: string
  embedding?: number[]
  similarity?: number
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse request body
    const { action, query, url: scrapeUrl } = await req.json()

    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Action is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Route to appropriate handler
    switch (action) {
      case 'scrape':
        return await handleScrape(supabase, scrapeUrl)
      case 'ask':
        if (!query) {
          return new Response(
            JSON.stringify({ error: 'Query is required for ask action' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }
        return await handleAsk(supabase, query)
      case 'status':
        return await handleStatus(supabase)
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        error: 'An error occurred processing your request',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function handleScrape(supabase: any, customUrl?: string) {
  const apiKey = Deno.env.get('FIRECRAWL_API_KEY')
  if (!apiKey) {
    throw new Error('FIRECRAWL_API_KEY not configured')
  }

  const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openAIApiKey) {
    throw new Error('OPENAI_API_KEY not configured')
  }

  console.log('Starting website scrape with comprehensive URL list')

  // Complete list of all known LBS College pages organized by category
  const allKnownUrls: string[] = [
    // 🏛️ Institution
    'https://lbscek.ac.in/',
    'https://lbscek.ac.in/about-us/',
    'https://lbscek.ac.in/college-map/',
    'https://lbscek.ac.in/mandatory-disclosure/',
    'https://lbscek.ac.in/aicte-orders/',
    'https://lbscek.ac.in/nba-accreditation-process/',
    'https://lbscek.ac.in/special-rule/',
    'https://lbscek.ac.in/audit-reports/',
    'https://lbscek.ac.in/student-verification/',
    'https://lbscek.ac.in/quotations-and-tenders/',
    'https://lbscek.ac.in/anti-ragging-cell/',
    'https://lbscek.ac.in/aicte-online-skill-test/',
    'https://lbscek.ac.in/aicte-feedback/',
    'https://lbscek.ac.in/grievance-cell/',

    // 👨‍💼 Administration
    'https://lbscek.ac.in/board-of-governors/',
    'https://lbscek.ac.in/director/',
    'https://lbscek.ac.in/principal/',
    'https://lbscek.ac.in/ug-dean/',
    'https://lbscek.ac.in/dean-research-development/',
    'https://lbscek.ac.in/internal-compliance-committee/',
    'https://lbscek.ac.in/internal-quality-assurance-cell-iqac/',
    'https://lbscek.ac.in/administrative-wing/',
    'https://lbscek.ac.in/right-to-information/',

    // 🎓 Admission
    'https://lbscek.ac.in/admission-procedure/',
    'https://lbscek.ac.in/admission-keam/',
    'https://lbscek.ac.in/nri-scheme/',
    'https://lbscek.ac.in/lateral-entry-scheme/',
    'https://lbscek.ac.in/non-keam-admission/',
    'https://lbscek.ac.in/fee-waiver-scheme/',
    'https://lbscek.ac.in/fee-structure/',

    // 📚 Academics
    'https://lbscek.ac.in/departments/',
    'https://lbscek.ac.in/programs/',
    'https://lbscek.ac.in/syllabus/',
    'https://lbscek.ac.in/academic-calendar/',
    'https://lbscek.ac.in/downloads/',

    // 🧑‍🏫 Departments
    'https://lbscek.ac.in/computer-science-engineering-2/',
    'https://lbscek.ac.in/mechanical-engineering/',
    'https://lbscek.ac.in/electrical-electronics-engineering/',
    'https://lbscek.ac.in/electronics-communication-engineering/',
    'https://lbscek.ac.in/civil-engineering/',
    'https://lbscek.ac.in/applied-science/',
    'https://lbscek.ac.in/physical-education/',

    // 🏃 Activities
    'https://lbscek.ac.in/career-guidance-placement-unit-cgpu/',
    'https://lbscek.ac.in/alumni-association/',
    'https://lbscek.ac.in/national-service-scheme/',
    'https://lbscek.ac.in/parent-teacher-association/',
    'https://lbscek.ac.in/continuing-education-cell/',
    'https://lbscek.ac.in/iedc/',
    'https://lbscek.ac.in/industry-institute-interaction/',
    'https://lbscek.ac.in/ieee/',
    'https://lbscek.ac.in/college-union/',

    // 🏘️ Facilities
    'https://lbscek.ac.in/central-library/',
    'https://lbscek.ac.in/digital-library/',
    'https://lbscek.ac.in/central-computing-facility/',
    'https://lbscek.ac.in/aicte-idea-lab/',
    'https://lbscek.ac.in/hostel/',
    'https://lbscek.ac.in/bus-service/',
    'https://lbscek.ac.in/atm-facility/',
    'https://lbscek.ac.in/student-co-operative-society/',
    'https://lbscek.ac.in/fab-lab-facility/',
    'https://lbscek.ac.in/skill-delivery-platform/',

    // 💰 Fee Payment
    'https://lbscek.ac.in/annual-admission-fee/',
    'https://lbscek.ac.in/exam-other-fee-payment/',
    'https://lbscek.ac.in/semester-registration-online/',
    'https://lbscek.ac.in/hostel-rent/',

    // 📞 Contact
    'https://lbscek.ac.in/contact-2/',
  ]

  // If a custom URL is provided, scrape only that; otherwise use the full list
  const relevantUrls = customUrl ? [customUrl] : allKnownUrls

  console.log(`Will scrape ${relevantUrls.length} pages`)

  // Step 3: Scrape each relevant page
  const scrapedPages = []
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  })

  let totalChunks = 0

  for (const url of relevantUrls) {
    try {
      console.log('Scraping:', url)

      const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          formats: ['markdown'],
          onlyMainContent: true,
          waitFor: 2000,
        }),
      })

      const scrapeData = await scrapeResponse.json()

      if (scrapeResponse.ok && scrapeData.success) {
        const content = scrapeData.data?.markdown || scrapeData.markdown || ''
        const title = scrapeData.data?.metadata?.title ||
          scrapeData.metadata?.title ||
          new URL(url).pathname.replace(/\/$/, '').split('/').pop() ||
          'Untitled'

        if (content && content.length > 100) { // Only keep pages with substantial content
          // Split content into chunks
          const chunks = await textSplitter.splitText(content)

          // Process each chunk
          for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i]

            // Generate embedding using OpenAI
            const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${openAIApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'text-embedding-ada-002',
                input: chunk,
              }),
            })

            const embeddingData = await embeddingResponse.json()

            if (embeddingResponse.ok) {
              // Store in Supabase
              const { error } = await supabase.from('college_docs').insert({
                url,
                title: `${title} - Part ${i + 1}`,
                content: chunk,
                embedding: embeddingData.data[0].embedding,
                chunk_index: i,
                total_chunks: chunks.length,
                created_at: new Date().toISOString(),
              })

              if (error) {
                console.error('Error storing chunk:', error)
              } else {
                totalChunks++
              }
            } else {
              console.error('Embedding error:', embeddingData)
            }
          }

          scrapedPages.push({
            url,
            title,
            chunks: chunks.length
          })
        }
      } else {
        console.error('Failed to scrape:', url, scrapeData.error)
      }

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000))

    } catch (error) {
      console.error('Error processing URL:', url, error)
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: `Successfully processed ${scrapedPages.length} pages with ${totalChunks} chunks`,
      pages: scrapedPages,
      totalChunks
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function handleAsk(supabase: any, query: string) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openAIApiKey) {
    throw new Error('OPENAI_API_KEY not configured')
  }

  console.log('Processing question:', query)

  // Step 1: Generate embedding for the question
  const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-ada-002',
      input: query,
    }),
  })

  const embeddingData = await embeddingResponse.json()

  if (!embeddingResponse.ok) {
    console.error('Embedding error:', embeddingData)
    throw new Error('Failed to generate embedding for question')
  }

  const queryEmbedding = embeddingData.data[0].embedding

  // Step 2: Search for similar documents using vector similarity
  let { data: documents, error } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: 10,
  })

  if (error) {
    console.error('Search error:', error)
    throw new Error('Failed to search documents')
  }

  if (!documents || documents.length === 0) {
    // Try with lower threshold
    const { data: fallbackDocs, error: fallbackError } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: 5,
    })

    if (!fallbackError && fallbackDocs && fallbackDocs.length > 0) {
      documents = fallbackDocs
    } else {
      return new Response(
        JSON.stringify({
          answer: "I couldn't find specific information about that in the college website. Please try asking something else or contact the college directly at info@lbscek.ac.in",
          sources: [],
          found: false
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
  }

  // Step 3: Prepare context from retrieved documents
  const context = documents.map((doc: Document) =>
    `[Source: ${doc.title}]\nURL: ${doc.url}\nContent: ${doc.content}`
  ).join('\n\n---\n\n')

  // Step 4: Generate answer using GPT
  const completionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a knowledgeable assistant for LBS College of Engineering (LBS College of Engineering for Women, Kasaragod). 
          Answer questions based ONLY on the provided context from the college website. 
          If the context doesn't contain relevant information, say "I don't have specific information about that in the college website."
          Be concise, accurate, and helpful. Include specific details like dates, requirements, and contact information when available.
          Format your answer in clear paragraphs with bullet points if listing multiple items.`
        },
        {
          role: 'user',
          content: `Context from LBS College of Engineering website:\n${context}\n\nQuestion: ${query}\n\nPlease provide a helpful answer based on the context above:`
        }
      ],
      temperature: 0.3,
      max_tokens: 800,
    }),
  })

  const completionData = await completionResponse.json()

  if (!completionResponse.ok) {
    console.error('GPT error:', completionData)
    throw new Error('Failed to generate answer')
  }

  const answer = completionData.choices[0].message.content

  // Step 5: Format sources (remove duplicates by URL)
  const uniqueSources = new Map()
  documents.forEach((doc: Document) => {
    if (!uniqueSources.has(doc.url)) {
      uniqueSources.set(doc.url, {
        title: doc.title,
        url: doc.url,
        relevance: Math.round(doc.similarity * 100) / 100
      })
    }
  })

  const sources = Array.from(uniqueSources.values())

  return new Response(
    JSON.stringify({
      answer,
      sources,
      found: true,
      relevant_chunks: documents.length
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function handleStatus(supabase: any) {
  // Get document statistics
  const { data: stats, error } = await supabase
    .from('college_docs')
    .select('url, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Status error:', error)
    throw new Error('Failed to get status')
  }

  // Count unique URLs
  const uniqueUrls = new Set()
  stats?.forEach((doc: any) => uniqueUrls.add(doc.url))

  return new Response(
    JSON.stringify({
      total_chunks: stats?.length || 0,
      total_pages: uniqueUrls.size,
      last_updated: stats?.[0]?.created_at || null
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}