import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Language type for response generation
const VALID_LANGUAGES = ['malayalam', 'english', 'manglish'] as const;
type Language = typeof VALID_LANGUAGES[number];

// Input validation schema
const ChatInputSchema = z.object({
  message: z.string().min(1, 'Message is required').max(2000, 'Message too long'),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(2000, 'Message content too long')
  })).max(50, 'Too many messages in history').optional(),
  language: z.enum(VALID_LANGUAGES).default('english'),
  memory: z.object({
    last_intent: z.string().nullable(),
    last_entity: z.string().nullable(),
    last_location: z.string().nullable(),
  }).optional(),
});

// Translate common Malayalam/Manglish terms to English for reliable keyword matching
function translateMalayalamQuery(query: string): string {
  const mlToEn: [RegExp, string][] = [
    [/ഫീസ്|ഫീ|ഫീസ|fees ethra|fee ethra/gi, ' fee '],
    [/ഡിപ്പാർട്ട്മെന്റ്|വിഭാഗം|വകുപ്പ്/g, ' department '],
    [/അധ്യാപക[നർ]?|പ്രൊഫസർ|ഫാക്കൽറ്റി|സ്റ്റാഫ്/g, ' faculty '],
    [/എച്ച്\s*ഒ\s*ഡി|മേധാവി|തലവൻ/g, ' hod '],
    [/ഹോസ്റ്റ[ലൽ]്?|താമസം/g, ' hostel '],
    [/ബസ്സ?്?|ട്രാൻസ്പോർട്ട്|വാഹനം/g, ' bus '],
    [/പ്ലേസ്‌?മെന്റ്?|ജോലി|ശമ്പളം/g, ' placement '],
    [/അഡ്മിഷൻ|പ്രവേശനം/g, ' admission '],
    [/പരീക്ഷ|സിലബസ്/g, ' exam '],
    [/ക്ലബ്|ക്ലബ്ബ്/g, ' club '],
    [/ലൈബ്രറി|പുസ്തകശാല/g, ' library '],
    [/കാന്റീൻ|ഭക്ഷണം|മെസ്സ്/g, ' canteen '],
    [/സിഎസ്ഇ?|കമ്പ്യൂട്ടർ\s*സയൻസ്/g, ' cse '],
    [/ഇസിഇ|ഇലക്ട്രോണിക്സ്/g, ' ece '],
    [/ഇഇഇ|ഇലക്ട്രിക്കൽ/g, ' eee '],
    [/മെക്കാനിക്കൽ/g, ' mech '],
    [/സിവിൽ/g, ' civil '],
    [/പ്രിൻസിപ്പൽ/g, ' principal '],
    [/സ്കോളർഷിപ്പ്/g, ' scholarship '],
    [/വാർത്ത|അറിയിപ്പ്|പുതിയ/g, ' news '],
    [/വെബ്സൈറ്റ്|ലിങ്ക്/g, ' website '],
    [/ഐഇഡിസി|ഇന്നൊവേഷൻ/g, ' iedc '],
    [/എൻഎസ്എസ്/g, ' nss '],
    [/ഗ്രീവൻസ്|പരാതി/g, ' grievance '],
  ];
  let translated = query;
  for (const [pattern, replacement] of mlToEn) {
    translated = translated.replace(pattern, replacement);
  }
  return translated;
}

// Function to scrape relevant pages based on query (with timeouts to prevent edge function crashes)
async function scrapeRelevantContent(query: string, apiKey: string): Promise<string> {
  const baseUrl = 'https://lbscek.ac.in';

  // Determine which pages to scrape based on query keywords
  // Translate Malayalam terms to English for reliable matching
  const translatedQuery = translateMalayalamQuery(query);
  const queryLower = (query + ' ' + translatedQuery).toLowerCase();
  // Always scrape homepage + relevant pages
  const pagesToScrape: string[] = [baseUrl];

  // Helper: check if query matches any keyword (supports Malayalam Unicode in original query)
  const q = query; // preserve original for Malayalam Unicode matching
  const matches = (...keywords: string[]) => keywords.some(kw => /[\u0D00-\u0D7F]/.test(kw) ? q.includes(kw) : queryLower.includes(kw));

  if (matches('placement', 'job', 'recruit', 'package', 'പ്ലേസ്‌മെന്റ്', 'ജോലി', 'ശമ്പളം', 'പാക്കേജ്', 'joli', 'shambalam')) {
    pagesToScrape.push(`${baseUrl}/placements`);
  }
  if (matches('bus', 'transport', 'timing', 'ബസ്', 'ബസ്സ്', 'ട്രാൻസ്പോർട്ട്', 'bus samayam', 'vahanam')) {
    pagesToScrape.push(`${baseUrl}/facilities`);
  }
  if (matches('hostel', 'accommodation', 'ഹോസ്റ്റൽ', 'താമസം', 'thamasam')) {
    pagesToScrape.push(`${baseUrl}/facilities`);
  }
  if (matches('canteen', 'food', 'mess', 'കാന്റീൻ', 'ഭക്ഷണം', 'മെസ്സ്', 'bhakshanam')) {
    pagesToScrape.push(`${baseUrl}/facilities`);
  }
  if (matches('exam', 'syllabus', 'academic', 'calendar', 'പരീക്ഷ', 'സിലബസ്', 'അക്കാദമിക്', 'pareeksha')) {
    pagesToScrape.push(`${baseUrl}/academics`);
  }
  if (matches('department', 'cse', 'ece', 'eee', 'mech', 'civil', 'ഡിപ്പാർട്ട്മെന്റ്', 'വിഭാഗം', 'vibhagam')) {
    pagesToScrape.push(`${baseUrl}/departments`);
  }
  if (matches('admission', 'fee', 'apply', 'അഡ്മിഷൻ', 'പ്രവേശനം', 'ഫീസ്', 'praveshanam', 'fees ethra')) {
    pagesToScrape.push(`${baseUrl}/admissions`);
  }
  if (matches('contact', 'phone', 'address', 'ബന്ധപ്പെടുക', 'ഫോൺ', 'നമ്പർ', 'phone number')) {
    pagesToScrape.push(`${baseUrl}/contact`);
  }
  if (matches('faculty', 'teacher', 'professor', 'hod', 'അധ്യാപകൻ', 'അധ്യാപിക', 'പ്രൊഫസർ', 'എച്ച് ഒ ഡി', 'എച്ച്ഒഡി', 'മേധാവി', 'adhyapakan', 'adhyapika')) {
    pagesToScrape.push(`${baseUrl}/faculty`);
  }
  if (matches('news', 'update', 'latest', 'election', 'union', 'notification', 'tender', 'event', 'വാർത്ത', 'പുതിയ', 'ഇലക്ഷൻ', 'യൂണിയൻ', 'അറിയിപ്പ്', 'vartha', 'puthiya')) {
    pagesToScrape.push(`${baseUrl}/news-and-updates`);
  }
  if (matches('alumni', 'alumnus', 'അലുംനി', 'പൂർവ്വ വിദ്യാർത്ഥി')) {
    pagesToScrape.push(`${baseUrl}/alumni-association/`);
  }
  if (matches('iqac', 'quality assurance', 'ഐക്യുഎസി', 'ഗുണനിലവാരം')) {
    pagesToScrape.push(`${baseUrl}/internal-quality-assurance-cell-iqac/`);
  }
  if (matches('iedc', 'innovation', 'entrepreneurship', 'ഐഇഡിസി', 'ഇന്നൊവേഷൻ')) {
    pagesToScrape.push(`${baseUrl}/iedc/`);
  }
  if (matches('nss', 'national service', 'എൻഎസ്എസ്')) {
    pagesToScrape.push(`${baseUrl}/national-service-scheme/`);
  }
  if (matches('library', 'ലൈബ്രറി', 'പുസ്തകശാല')) {
    pagesToScrape.push(`${baseUrl}/central-library/`);
  }
  if (matches('grievance', 'complaint', 'പരാതി', 'ഗ്രീവൻസ്', 'parathi')) {
    pagesToScrape.push(`${baseUrl}/grievance-cell/`);
  }
  if (matches('ragging', 'anti ragging', 'റാഗിംഗ്', 'ആന്റി റാഗിംഗ്')) {
    pagesToScrape.push(`${baseUrl}/anti-ragging-cell/`);
  }
  if (matches('nba', 'accreditation', 'എൻബിഎ', 'അക്രഡിറ്റേഷൻ')) {
    pagesToScrape.push(`${baseUrl}/nba-accreditation-process/`);
  }
  if (matches('scholarship', 'fee waiver', 'സ്കോളർഷിപ്പ്', 'ഫീ ഇളവ്', 'scholarship', 'fee ilavu')) {
    pagesToScrape.push(`${baseUrl}/fee-waiver-scheme/`);
  }
  if (matches('principal', 'director', 'പ്രിൻസിപ്പൽ', 'ഡയറക്ടർ')) {
    pagesToScrape.push(`${baseUrl}/principal/`);
  }
  if (matches('idea lab', 'fab lab', 'makerspace', 'ഐഡിയ ലാബ്', 'ഫാബ് ലാബ്', 'മേക്കർസ്പേസ്')) {
    pagesToScrape.push(`${baseUrl}/aicte-idea-lab/`);
  }
  if (matches('cgpu', 'career guidance', 'സിജിപിയു', 'കരിയർ ഗൈഡൻസ്')) {
    pagesToScrape.push(`${baseUrl}/career-guidance-placement-unit-cgpu/`);
  }

  // Remove duplicates, limit to 2 pages max to avoid timeouts
  const uniquePages = [...new Set(pagesToScrape)].slice(0, 2);

  const scrapedContent: string[] = [];

  for (const url of uniquePages) {
    try {
      console.log('Scraping for RAG:', url);

      // 5-second timeout per request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

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
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const markdown = data.data?.markdown || data.markdown || '';
        if (markdown) {
          scrapedContent.push(`\n--- Content from ${url} ---\n${markdown.slice(0, 2000)}`);
        }
      }
    } catch (error) {
      console.error('Error scraping (may be timeout):', url, error);
    }
  }

  return scrapedContent.join('\n\n') || 'No additional content scraped.';
}

// ============================================================
// DATABASE-BACKED KNOWLEDGE BASE (replaces hardcoded constant)
// ============================================================

// Supabase client for database access (service role for server-side operations)
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

// In-memory cache for knowledge base (avoids DB hit on every request)
let knowledgeCache: { data: string; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Minimal fallback if database is unreachable (bare essentials only — full data is in the database)
const MINIMAL_FALLBACK = `
# LBS College of Engineering, Kasaragod (LBSCEK)
Website: https://lbscek.ac.in/

## 1. General Information
- **Full Name:** Lal Bahadur Shastri College of Engineering, Kasaragod
- **Established:** 1993
- **Management:** L B S Centre for Science and Technology (Govt. of Kerala Undertaking)
- **Location:** Povval, Muliyar P.O., Kasaragod, Kerala - 671542
- **Campus Area:** 52 acres
- **Affiliation:** APJ Abdul Kalam Technological University (KTU)
- **Contact:** +91-4994-256300
- **Email:** principal@lbscek.ac.in, office@lbscek.ac.in
- **Website:** https://lbscek.ac.in/

For detailed and up-to-date information about fees, departments, admissions, placements, hostel, and more, please visit the official website: https://lbscek.ac.in/
`;

// Fetch knowledge base from Supabase database
async function fetchKnowledgeBase(): Promise<string> {
  // Return cached data if still fresh
  if (knowledgeCache && (Date.now() - knowledgeCache.fetchedAt) < CACHE_TTL_MS) {
    console.log('Using cached knowledge base');
    return knowledgeCache.data;
  }

  try {
    console.log('Fetching knowledge base from database...');
    const { data, error } = await supabaseClient
      .from('knowledge_base')
      .select('section_title, content')
      .order('section_order', { ascending: true });

    if (error) {
      console.error('Database fetch error:', error.message);
      return knowledgeCache?.data || MINIMAL_FALLBACK;
    }

    if (!data || data.length === 0) {
      console.warn('No knowledge base rows found in database');
      return MINIMAL_FALLBACK;
    }

    // Concatenate all sections into a single knowledge string
    const fullKnowledge = data.map(row => row.content).join('\n\n');

    // Update cache
    knowledgeCache = { data: fullKnowledge, fetchedAt: Date.now() };
    console.log(`Knowledge base loaded: ${data.length} sections, ${fullKnowledge.length} chars`);

    return fullKnowledge;
  } catch (err) {
    console.error('Failed to fetch knowledge base:', err);
    return knowledgeCache?.data || MINIMAL_FALLBACK;
  }
}

// ============================================================
// HYBRID SEARCH: Semantic (embedding) + Keyword (full-text)
// ============================================================

/**
 * Generate a 384-dim embedding for a query using HuggingFace Inference API.
 * Model: sentence-transformers/all-MiniLM-L6-v2 (free tier, fast, 384-dim).
 * Falls back to null if the API is unavailable.
 */
async function generateEmbedding(text: string): Promise<number[] | null> {
  const HF_API_KEY = Deno.env.get('HF_API_KEY');
  if (!HF_API_KEY) {
    console.warn('[Hybrid] HF_API_KEY not set — skipping semantic search');
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: text, options: { wait_for_model: true } }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn('[Hybrid] Embedding API returned', response.status);
      return null;
    }

    const embedding = await response.json();
    // HuggingFace returns the embedding directly as number[]
    if (Array.isArray(embedding) && embedding.length === 384) {
      return embedding;
    }
    // Some models wrap it in an extra array
    if (Array.isArray(embedding) && Array.isArray(embedding[0])) {
      return embedding[0];
    }
    console.warn('[Hybrid] Unexpected embedding shape:', typeof embedding);
    return null;
  } catch (err) {
    console.warn('[Hybrid] Embedding generation failed:', err);
    return null;
  }
}

/**
 * Direct section lookup for high-precision queries.
 * Maps specific query patterns to exact section_keys in the database.
 * Returns the matched content or null if no direct match.
 */
async function directSectionLookup(query: string): Promise<string | null> {
  const translatedQuery = translateMalayalamQuery(query);
  const q = (query + ' ' + translatedQuery).toLowerCase();

  // Map query patterns to exact section_keys
  const sectionKeys: string[] = [];

  // HOD queries — detect "hod" + department name
  const isHodQuery = /\bhod\b|head of department|head of dept|\bമേധാവി|എച്ച്\s*ഒ\s*ഡി/i.test(q);

  if (isHodQuery) {
    if (/\bcse\b|computer science/i.test(q)) {
      sectionKeys.push('cse_hod_contact', 'dept_cse', 'cse_faculty_list_complete');
    } else if (/\bece\b|electronics.*communication/i.test(q)) {
      sectionKeys.push('dept_ece', 'ece_faculty_list_complete');
    } else if (/\beee\b|electrical/i.test(q)) {
      sectionKeys.push('dept_eee', 'eee_faculty_list_complete');
    } else if (/\bmech|mechanical/i.test(q)) {
      sectionKeys.push('dept_me', 'mechanical_faculty_list_complete');
    } else if (/\bcivil/i.test(q)) {
      sectionKeys.push('dept_civil', 'civil_faculty_list_complete');
    } else if (/\bit\b|information technology/i.test(q)) {
      sectionKeys.push('it_faculty_list_complete');
    } else if (/\bapplied science|maths|physics|chemistry/i.test(q)) {
      sectionKeys.push('applied_science_faculty_list_complete');
    } else {
      // Generic HOD query — return all departments' HOD/faculty info
      sectionKeys.push('departments_faculty_detailed', 'cse_hod_contact');
    }
  }

  // Department-specific queries (non-HOD)
  if (!isHodQuery) {
    if (/\bcse\b|computer science/i.test(q) && /\bfaculty|teacher|professor|staff/i.test(q)) {
      sectionKeys.push('dept_cse', 'cse_faculty_list_complete');
    }
    if (/\bece\b/i.test(q) && /\bfaculty|teacher|professor|staff/i.test(q)) {
      sectionKeys.push('dept_ece', 'ece_faculty_list_complete');
    }
  }

  // Contact queries
  if (/\bcontact|phone|number|email/i.test(q)) {
    if (/\bcse\b|computer science/i.test(q)) {
      sectionKeys.push('cse_hod_contact', 'useful_contacts_summary');
    }
    if (/\bprincipal/i.test(q)) {
      sectionKeys.push('useful_contacts_summary');
    }
  }

  if (sectionKeys.length === 0) return null;

  try {
    console.log(`[DirectLookup] Fetching section_keys: ${sectionKeys.join(', ')}`);
    const { data, error } = await supabaseClient
      .from('knowledge_base')
      .select('content')
      .in('section_key', sectionKeys);

    if (error || !data || data.length === 0) {
      console.warn('[DirectLookup] No results:', error?.message);
      return null;
    }

    console.log(`[DirectLookup] Found ${data.length} direct matches`);
    return data.map((row: any) => row.content).join('\n\n');
  } catch (err) {
    console.warn('[DirectLookup] Failed:', err);
    return null;
  }
}

/**
 * Perform hybrid search: combines pgvector semantic similarity
 * with PostgreSQL full-text keyword search via the hybrid_search RPC.
 * Falls back to null if the RPC is unavailable.
 */
async function hybridSearch(query: string, matchCount = 5): Promise<string | null> {
  try {
    // Translate Malayalam to English keywords for better full-text matching
    const translatedQuery = translateMalayalamQuery(query);
    const searchText = `${query} ${translatedQuery}`.trim();

    // Generate embedding (may be null if HF key is missing)
    const embedding = await generateEmbedding(searchText);

    console.log(`[Hybrid] Searching: "${searchText.substring(0, 60)}..." embedding=${embedding ? 'yes' : 'no'}`);

    const { data, error } = await supabaseClient.rpc('hybrid_search', {
      query_text: searchText,
      query_embedding: embedding ? `[${embedding.join(',')}]` : null,
      match_count: matchCount,
      semantic_weight: embedding ? 0.6 : 0.0,  // If no embedding, rely 100% on keywords
      keyword_weight: embedding ? 0.4 : 1.0,
    });

    if (error) {
      console.warn('[Hybrid] RPC error:', error.message);
      return null;
    }

    if (!data || data.length === 0) {
      console.log('[Hybrid] No matches found');
      return null;
    }

    console.log(`[Hybrid] Found ${data.length} matches (top score: ${data[0].combined_score.toFixed(3)})`);

    // Concatenate matched sections into context
    const context = data
      .map((row: any) => row.content)
      .join('\n\n');

    return context.slice(0, 8000); // Cap at 8000 chars for token safety
  } catch (err) {
    console.warn('[Hybrid] Search failed:', err);
    return null;
  }
}

// Auto-detect language from user message
function detectLanguage(message: string): Language {
  // Check for Malayalam Unicode characters (range: 0D00-0D7F)
  const malayalamRegex = /[\u0D00-\u0D7F]/;
  const hasMalayalam = malayalamRegex.test(message);

  // Check for English letters
  const englishRegex = /[a-zA-Z]/;
  const hasEnglish = englishRegex.test(message);

  // Common Manglish patterns (Malayalam words written in English)
  const manglishPatterns = /\b(aanu|alla|enth|enthu|evide|enne|njan|nee|ningal|aval|avan|avar|ivide|avide|engane|enthina|entha|enik|ninaku|evidunnu|evidekku|evideyanu|evideyaa|poyi|vannu|cheythu|cheyyuka|ariyilla|ariyam|mathi|venda|veno|venam|pore|potte|pwoli|adipoli|kollam|sherikkum|sheriyanu|thanne|anno|alle|ille|und|undu|illa|undo|illallo|allenkil|athupole|ippo|appo|pinne|ennitt|athu|ithu|ethu|entho|enthoru|enthaanu|evidennu|evidekk|evidenna|enth|enna|paranjath|parayoo|nokkoo|nokku|poda|podi|mwone|mwol|chetta|chechi|mol|mon|ethra|eniku|collegil|eppol|samayam|ariyumo|parayumo|nokkumo|cheyyanam|poyikkotte|evidaru|evidaanu|ariyaamoo|parayu|cheyyu|ishtam|vendaam|onnum|kurachu|valare|nalla|mosham|nannayi|kazhiyu|kazhinju|kazhinju|pattuo|pattilla|kittumo|kittum|kittiyilla|pokunnu|varunnu|pidikkum|enikkariyan|parayaam|vilikkoo|vilikkuka|chodikkoo|chodichu|tharumo|tharam|ningade|entede|avarde|ivarde)\b/i;
  const hasManglishPatterns = manglishPatterns.test(message);

  // Decision logic:
  // 1. Pure Malayalam script = Malayalam
  // 2. Mix of Malayalam script + English = Manglish (for code-switching)
  // 3. English letters + Manglish patterns = Manglish
  // 4. Pure English = English

  if (hasMalayalam && !hasEnglish) {
    return 'malayalam';
  } else if (hasMalayalam && hasEnglish) {
    return 'manglish';
  } else if (hasManglishPatterns) {
    return 'manglish';
  } else {
    return 'english';
  }
}

// Language instructions based on detected language
function getLanguageInstruction(language: Language): string {
  switch (language) {
    case 'malayalam':
      return `LANGUAGE: Respond in Malayalam script (മലയാളം). IMPORTANT: First, mentally translate the user's Malayalam question to English to understand what they are asking. Then find the answer from the English knowledge base. Keep ALL numbers, fees (₹), names, dates, phone numbers, emails, and URLs EXACTLY as they appear in the context — do NOT translate or modify factual data. Only translate the surrounding explanation text to Malayalam. NEVER repeat the same information in multiple languages. CRITICAL: 'എച്ച് ഒ ഡി' = HOD (Head of Department). 'ഡീൻ' = Dean. These are DIFFERENT roles — never confuse them.`;
    case 'manglish':
      return `LANGUAGE: Respond in Manglish (Malayalam words in English letters). Keep numbers, fees, names, and dates unchanged. Casual tone. NEVER repeat the same information in multiple languages.`;
    case 'english':
    default:
      return `LANGUAGE: Respond in clear, friendly English. NEVER repeat the same information in multiple languages.`;
  }
}

const SYSTEM_PROMPT = `You are LBS Bot, a friendly voice assistant for LBS College of Engineering, Kasaragod (LBSCEK).
Official Website: https://lbscek.ac.in/

### Core Behavior
- Understand the user's intent clearly before answering.
- Respond ONLY to what is asked — do not add extra or unrelated information.
- Avoid long explanations unless explicitly requested.
- If the query is unclear, ask a clarification question instead of guessing.

### Answer Rules
- Give direct, specific answers. No generic or broad responses.
- Do not include unnecessary context, suggestions, or assumptions.
- Stay strictly within the scope of the question.
- Keep ALL responses under 150 words. Be brief and direct.

### Follow-up Interaction
- Maintain a natural conversational flow.
- Ask relevant follow-up questions when the query is ambiguous, more details are needed, or it improves answer accuracy.
- Do not dump all information at once — interact progressively.

### Data & Accuracy Rules
1. ONLY answer using information from the "COLLEGE KNOWLEDGE BASE" and "LIVE WEBSITE DATA" sections provided below. ABSOLUTELY NOTHING ELSE.
2. If the answer is NOT found in the provided context, say: "I don't have that info. Please check lbscek.ac.in 🙏"
3. NEVER guess, assume, or generate information not explicitly present in the context.
4. No hallucinations — if unsure, say you don't know.
5. ACCURACY > helpfulness. Wrong info is worse than saying "I don't know".
6. For dates/events/news, ONLY use what is explicitly written in the context. Do NOT infer dates.
7. Use the COLLEGE KNOWLEDGE BASE as the primary source. Live website data supplements it with latest updates.

### Language Rules
1. NEVER repeat the same fact in two languages. Say it ONCE only.
2. Pick ONE language based on user's input. Stick to it.

### Role Disambiguation
- "Academic Dean" and "HOD (Head of Department)" are DIFFERENT roles. If asked about "HOD" or "head of department" (also "എച്ച് ഒ ഡി" or "മേധാവി" in Malayalam), use ONLY the data explicitly labelled as "HOD", NOT "Dean" or "Academic Dean".

### Conversation Context Resolution
- The user may refer to previous entities using pronouns like "it", "there", "that", "they".
- You MUST resolve such references using the Conversation Memory provided below.
- If the current query contains ambiguous references, resolve them using the last known entity or location.
- If multiple interpretations are possible, choose the most recent relevant entity.
- If no context is available and the query is ambiguous, ask a clarification question.

Style: Warm, 1-2 emojis max, straight to the point.`;

// Build memory context string for injection into the LLM prompt
function buildMemoryContext(memory?: { last_intent: string | null; last_entity: string | null; last_location: string | null }): string {
  if (!memory || (!memory.last_intent && !memory.last_entity && !memory.last_location)) {
    return '';
  }
  return `\n\n## CONVERSATION MEMORY (use to resolve pronouns like "it", "there", "that"):\n- Last Intent: ${memory.last_intent || 'none'}\n- Last Entity: ${memory.last_entity || 'none'}\n- Last Location: ${memory.last_location || 'none'}\nIf the user says "it", "there", "that" etc., they are referring to: ${memory.last_entity || memory.last_location || 'unknown'}`;
}

// Server-side pronoun resolution for knowledge base query
function resolveQueryWithMemory(query: string, memory?: { last_intent: string | null; last_entity: string | null; last_location: string | null }): string {
  if (!memory) return query;
  const referenceEntity = memory.last_entity || memory.last_location;
  if (!referenceEntity) return query;

  // Simple pronoun detection and replacement for the retrieval pipeline
  const pronounsEN = ['\\bit\\b', '\\bthere\\b', '\\bthat\\b', '\\bthey\\b', '\\bthis\\b', '\\bthe place\\b', '\\bthat place\\b'];
  const hasPronoun = pronounsEN.some(p => new RegExp(p, 'i').test(query));

  // Check for Malayalam pronouns
  const pronounsML = ['അത്', 'അവിടെ', 'ഇത്'];
  const hasMalayalamPronoun = pronounsML.some(p => query.includes(p));

  if (!hasPronoun && !hasMalayalamPronoun) return query;

  let resolved = query;
  if (hasMalayalamPronoun) {
    for (const p of pronounsML) {
      resolved = resolved.replace(p, referenceEntity);
    }
  } else {
    for (const p of pronounsEN) {
      resolved = resolved.replace(new RegExp(p, 'gi'), referenceEntity);
    }
  }
  console.log(`[Memory] Server resolved query: "${query}" → "${resolved}"`);
  return resolved;
}

// Provide translation hints and disambiguation for queries (all languages)
function getQueryTranslationHint(query: string, language: Language): string {
  const q = query;
  const qLower = query.toLowerCase();
  const hints: string[] = [];

  // English HOD queries
  if (/\bhod\b|head of department|head of dept/i.test(qLower)) {
    hints.push('The user is asking about HOD (Head of Department)');
    hints.push('REMEMBER: HOD and Dean are DIFFERENT roles. Use ONLY data labelled "HOD:", NOT "Dean" or "Academic Dean"');
    if (/\bcse\b|computer science/i.test(qLower)) {
      hints.push('CSE HOD is Dr. Manoj Kumar G, NOT Dr. Praveen Kumar K (who is Academic Dean)');
    }
  }

  // Detect HOD-related queries in Malayalam
  if (/എച്ച്\s*ഒ\s*ഡി|മേധാവി|തലവൻ/u.test(q)) {
    if (!hints.some(h => h.includes('HOD'))) {
      hints.push('The user is asking about HOD (Head of Department)');
      hints.push('REMEMBER: HOD and Dean are DIFFERENT roles. Use ONLY data labelled "HOD:", NOT "Dean" or "Academic Dean"');
    }
  }

  // Detect department names (Malayalam)
  if (/സി\s*എസ്|സിഎസ്ഇ|കമ്പ്യൂട്ടർ\s*സയൻസ്/u.test(q)) {
    hints.push('Department: CSE (Computer Science & Engineering)');
    hints.push('CSE HOD is Dr. Manoj Kumar G, NOT Dr. Praveen Kumar K (who is Academic Dean)');
  }
  if (/ഇ\s*സി\s*ഇ|ഇലക്ട്രോണിക്സ്/u.test(q)) hints.push('Department: ECE (Electronics & Communication)');
  if (/ഇ\s*ഇ\s*ഇ|ഇലക്ട്രിക്കൽ/u.test(q)) hints.push('Department: EEE (Electrical & Electronics)');
  if (/മെക്കാനിക്കൽ/u.test(q)) hints.push('Department: Mechanical Engineering');
  if (/സിവിൽ/u.test(q)) hints.push('Department: Civil Engineering');

  if (hints.length === 0) return '';
  return `\n\n## QUERY HINT (disambiguation):\n${hints.map(h => '- ' + h).join('\n')}`;
}

// Smart context filter: only send relevant sections of the knowledge base to avoid token limits
function getRelevantKnowledge(query: string, fullKnowledge: string): string {
  // Translate Malayalam terms to English for reliable section matching
  const translatedQuery = translateMalayalamQuery(query);
  const queryLower = (query + ' ' + translatedQuery).toLowerCase();

  // Split the knowledge base into sections by ## headers
  const sections = fullKnowledge.split(/(?=## \d+\.)/).filter(s => s.trim());

  // Always include these baseline sections (small, always useful)
  const alwaysIncludePatterns = ['general information', 'leadership', 'academic programs', 'vision & mission'];

  // Query keywords → section title keywords (match against section content/title)
  const queryToSectionMap: Array<{ queryKeywords: string[]; sectionKeywords: string[] }> = [
    // Vision & Mission — EN + ML + Manglish
    {
      queryKeywords: [
        'vision', 'mission', 'goal', 'objective', 'motto', 'aim', 'purpose',
        'വിഷൻ', 'മിഷൻ', 'ലക്ഷ്യം', 'ഉദ്ദേശ്യം',
        'vision', 'mission', 'lakshyam', 'uddesham'
      ], sectionKeywords: ['vision', 'mission']
    },

    // Departments & Faculty — EN + ML + Manglish
    {
      queryKeywords: [
        'department', 'faculty', 'teacher', 'professor', 'hod', 'head', 'cse', 'ece', 'eee', 'mech', 'civil', 'it ', 'mca', 'staff',
        // Malayalam
        'ഡിപ്പാർട്ട്മെന്റ്', 'വിഭാഗം', 'അധ്യാപകൻ', 'അധ്യാപിക', 'പ്രൊഫസർ', 'ഫാക്കൽറ്റി', 'സ്റ്റാഫ്', 'വകുപ്പ്', 'സിഎസ്ഇ', 'ഇസിഇ', 'ഇഇഇ', 'മെക്കാനിക്കൽ', 'സിവിൽ',
        'എച്ച് ഒ ഡി', 'എച്ച്ഒഡി', 'മേധാവി', 'തലവൻ', 'സി എസ്', 'സി.എസ്',
        // Manglish
        'department', 'teacher', 'adhyapakan', 'adhyapika', 'vibhagam', 'vakuppu', 'hod aar'
      ], sectionKeywords: ['departments', 'faculty']
    },

    // Fee Structure — EN + ML + Manglish
    {
      queryKeywords: [
        'fee', 'tuition', 'cost', 'payment', 'scholarship',
        'ഫീസ്', 'ട്യൂഷൻ', 'പണം', 'സ്കോളർഷിപ്പ്', 'ചെലവ്', 'ഫീ',
        'fees', 'fee ethra', 'panam', 'chelavu', 'scholarship'
      ], sectionKeywords: ['fee structure']
    },

    // Bus & Transport — EN + ML + Manglish
    {
      queryKeywords: [
        'bus', 'transport', 'route',
        'ബസ്', 'ബസ്സ്', 'ട്രാൻസ്പോർട്ട്', 'റൂട്ട്', 'വാഹനം', 'യാത്ര',
        'bus', 'vahanam', 'yathra', 'route'
      ], sectionKeywords: ['transportation', 'bus route', 'bus fee']
    },

    // Facilities — EN + ML + Manglish
    {
      queryKeywords: [
        'hostel', 'accommodation', 'room', 'mess', 'warden', 'library', 'canteen', 'atm', 'lab', 'wifi', 'sport', 'gym', 'makerspace',
        'ഹോസ്റ്റൽ', 'ലൈബ്രറി', 'കാന്റീൻ', 'ലാബ്', 'ജിം', 'സ്പോർട്സ്', 'വൈഫൈ', 'മെസ്സ്', 'എടിഎം', 'താമസം', 'മുറി',
        'hostel', 'library', 'canteen', 'lab', 'gym', 'wifi', 'mess', 'atm', 'thamasam', 'muri'
      ], sectionKeywords: ['facilities', 'facility details']
    },

    // Placements — EN + ML + Manglish
    {
      queryKeywords: [
        'placement', 'job', 'recruit', 'package', 'company', 'salary', 'career',
        'പ്ലേസ്‌മെന്റ്', 'ജോലി', 'കമ്പനി', 'ശമ്പളം', 'റിക്രൂട്ട്മെന്റ്', 'കരിയർ', 'പാക്കേജ്',
        'placement', 'joli', 'company', 'shambalam', 'salary', 'career', 'package'
      ], sectionKeywords: ['placements']
    },

    // Clubs — EN + ML + Manglish
    {
      queryKeywords: [
        'club', 'ieee', 'iedc', 'gdsc', 'nss', 'ncc', 'mulearn', 'tinkerhub', 'foss',
        'ക്ലബ്', 'ഐഇഇഇ', 'ഐഇഡിസി', 'എൻഎസ്എസ്', 'എൻസിസി',
        'club', 'clubs'
      ], sectionKeywords: ['clubs', 'student clubs']
    },

    // Admission — EN + ML + Manglish
    {
      queryKeywords: [
        'admission', 'apply', 'keam', 'entrance', 'seat', 'intake', 'document',
        'അഡ്മിഷൻ', 'പ്രവേശനം', 'കീം', 'എൻട്രൻസ്', 'സീറ്റ്', 'അപേക്ഷ',
        'admission', 'praveshanam', 'keam', 'seat', 'apply cheyyan', 'apeksha'
      ], sectionKeywords: ['admission']
    },

    // Exams & Regulations — EN + ML + Manglish
    {
      queryKeywords: [
        'exam', 'ktu', 'syllabus', 'semester', 'attendance', 'regulation', 'dress', 'ragging',
        'പരീക്ഷ', 'സിലബസ്', 'സെമസ്റ്റർ', 'അറ്റൻഡൻസ്', 'റെഗുലേഷൻ', 'ഡ്രസ്സ്', 'റാഗിംഗ്', 'കെടിയു',
        'pareeksha', 'exam', 'syllabus', 'semester', 'attendance', 'dress code', 'ragging'
      ], sectionKeywords: ['regulations', 'academic regulations']
    },

    // Projects & Publications — EN + ML + Manglish
    {
      queryKeywords: [
        'project', 'publication', 'magazine', 'fest', 'techsurge', 'rhythm',
        'പ്രോജക്ട്', 'പ്രസിദ്ധീകരണം', 'മാഗസിൻ', 'ഫെസ്റ്റ്',
        'project', 'publication', 'magazine', 'fest'
      ], sectionKeywords: ['projects', 'publications']
    },

    // Location — EN + ML + Manglish
    {
      queryKeywords: [
        'where', 'location', 'direction', 'navigate', 'find',
        'എവിടെ', 'സ്ഥലം', 'ദിശ', 'കണ്ടെത്തുക', 'വഴി',
        'evide', 'evideyanu', 'sthalam', 'vazhi', 'location'
      ], sectionKeywords: ['location context']
    },

    // News & Updates — EN + ML + Manglish
    {
      queryKeywords: [
        'news', 'update', 'latest', 'event', 'election', 'union', 'notification', 'tender',
        'വാർത്ത', 'പുതിയ', 'ഇവന്റ്', 'ഇലക്ഷൻ', 'യൂണിയൻ', 'അറിയിപ്പ്', 'ടെൻഡർ', 'അപ്ഡേറ്റ്',
        'vartha', 'puthiya', 'event', 'election', 'union', 'ariyippu', 'update', 'latest'
      ], sectionKeywords: ['latest', 'news']
    },

    // College Union — EN + ML + Manglish
    {
      queryKeywords: [
        'union', 'chairperson', 'secretary', 'vice chairperson', 'arts secretary', 'magazine editor', 'lady rep', 'uuc', 'councillor',
        'rifda', 'adhiraj', 'nandana', 'abhinand', 'jasil', 'abhijith', 'rizza', 'nafida', 'afna',
        'യൂണിയൻ', 'ചെയർപേഴ്സൺ', 'സെക്രട്ടറി', 'കോളേജ് യൂണിയൻ',
        'union', 'chairperson', 'secretary', 'college union'
      ], sectionKeywords: ['college union']
    },

    // Canteen Menu — EN + ML + Manglish
    {
      queryKeywords: [
        'canteen', 'menu', 'food', 'price', 'dosa', 'puttu', 'idli', 'biriyani', 'tea', 'coffee', 'chaya', 'kappi', 'omelette', 'meals', 'oonu', 'porotta', 'chapathi', 'vada', 'snack', 'breakfast', 'beverage',
        'കാന്റീൻ', 'മെനു', 'ഭക്ഷണം', 'വില', 'ദോശ', 'പുട്ട്', 'ഇഡ്ഡലി', 'ബിരിയാണി', 'ചായ', 'കാപ്പി',
        'canteen', 'menu', 'bhakshanam', 'vila', 'dosa price', 'chaya price'
      ], sectionKeywords: ['canteen']
    },

    // Website Directory — EN + ML + Manglish
    {
      queryKeywords: [
        'website', 'link', 'page', 'url', 'portal', 'site', 'open', 'visit', 'alumni', 'iqac', 'nba', 'accreditation', 'iedc', 'nss', 'pta', 'ieee', 'grievance', 'ragging', 'anti ragging', 'rti', 'right to information', 'tender', 'quotation', 'audit', 'disclosure', 'aicte', 'idea lab', 'fab lab', 'skill delivery', 'cgpu', 'career guidance', 'digital library', 'computing facility', 'co-operative', 'college union', 'continuing education', 'industry institute', 'semester registration', 'hostel rent', 'exam fee', 'annual fee', 'downloads', 'verification',
        'വെബ്സൈറ്റ്', 'ലിങ്ക്', 'പേജ്', 'പോർട്ടൽ', 'സൈറ്റ്', 'അലുംനി', 'ഗ്രീവൻസ്',
        'website', 'link', 'page', 'site', 'portal'
      ], sectionKeywords: ['website directory']
    },
  ];

  const matched: string[] = [];

  for (const section of sections) {
    const sectionLower = section.toLowerCase();

    // Always include baseline sections
    if (alwaysIncludePatterns.some(pattern => sectionLower.includes(pattern))) {
      matched.push(section);
      continue;
    }

    // Check if query matches any keywords for this section
    for (const mapping of queryToSectionMap) {
      const queryMatches = mapping.queryKeywords.some(kw => queryLower.includes(kw));
      const sectionMatches = mapping.sectionKeywords.some(sk => sectionLower.includes(sk));
      if (queryMatches && sectionMatches) {
        matched.push(section);
        break;
      }
    }
  }

  // If no specific sections matched beyond baseline, return baseline only (for greetings etc.)
  if (matched.length <= 3) {
    // For Malayalam queries, include more context so the LLM can find the answer
    const hasMalayalam = /[\u0D00-\u0D7F]/.test(query);
    if (hasMalayalam) {
      return fullKnowledge.slice(0, 6000);
    }
    return matched.join('\n').slice(0, 4000);
  }

  // Truncate to ~8000 chars to be safe with tokens
  return matched.join('\n').slice(0, 8000);
}

// ============================================================
// RATE LIMITING HELPERS
// ============================================================
const RATE_LIMIT_MAX = 30; // max requests per minute per IP

function getClientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown';
}

async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = new Date();
  windowStart.setSeconds(0, 0); // truncate to current minute

  try {
    // Try to get existing count for this window
    const { data, error } = await supabaseClient
      .from('rate_limits')
      .select('request_count')
      .eq('client_ip', ip)
      .gte('window_start', windowStart.toISOString())
      .order('window_start', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Rate limit check error:', error.message);
      return { allowed: true, remaining: RATE_LIMIT_MAX }; // fail open
    }

    const currentCount = data?.request_count || 0;

    if (currentCount >= RATE_LIMIT_MAX) {
      return { allowed: false, remaining: 0 };
    }

    // Upsert: increment or insert
    if (data) {
      await supabaseClient
        .from('rate_limits')
        .update({ request_count: currentCount + 1 })
        .eq('client_ip', ip)
        .gte('window_start', windowStart.toISOString());
    } else {
      await supabaseClient
        .from('rate_limits')
        .insert({ client_ip: ip, window_start: windowStart.toISOString(), request_count: 1 });
    }

    return { allowed: true, remaining: RATE_LIMIT_MAX - currentCount - 1 };
  } catch (err) {
    console.error('Rate limit error:', err);
    return { allowed: true, remaining: RATE_LIMIT_MAX }; // fail open
  }
}

// ============================================================
// UNANSWERED QUESTION DETECTION PHRASES (shared for streaming & non-streaming)
// ============================================================
const cantAnswerPhrases = [
  // English
  "don't have that info",
  "don't have that information",
  "don't have specific info",
  "not available in my",
  "not found in",
  "check lbscek.ac.in",
  "visit lbscek.ac.in",
  "visit the official",
  "contact the college directly",
  "i don't know",
  "i do not have",
  "not in the provided context",
  "cannot find",
  "no information available",
  // Malayalam (മലയാളം)
  "വിവരം ലഭ്യമല്ല",
  "വിവരം ഇല്ല",
  "അറിയില്ല",
  "ലഭ്യമല്ല",
  "എന്റെ കൈയിൽ ഇല്ല",
  "കൃത്യമായ വിവരം",
  "ഔദ്യോഗിക വെബ്സൈറ്റ്",
  "കോളേജുമായി ബന്ധപ്പെടുക",
  "lbscek.ac.in സന്ദർശിക്കുക",
  // Manglish
  "ariyilla",
  "information illa",
  "vivaram illa",
  "labhyamalla",
  "college contact cheyyuka",
  "website check cheyyuka",
];

// Log analytics (fire-and-forget)
function logAnalytics(query: string, language: string, responseTimeMs: number, tokensUsed: number, wasAnswered: boolean) {
  supabaseClient
    .from('chat_analytics')
    .insert({
      query: query.substring(0, 500),
      detected_language: language,
      response_time_ms: responseTimeMs,
      tokens_used: tokensUsed,
      was_answered: wasAnswered,
    })
    .then(({ error }) => {
      if (error) console.error('Analytics log error:', error.message);
      else console.log('📊 Analytics logged');
    });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestStartTime = Date.now();

  try {
    // ── Rate Limiting ──────────────────────────────────────────
    const clientIp = getClientIp(req);
    const rateCheck = await checkRateLimit(clientIp);

    if (!rateCheck.allowed) {
      console.warn(`🚫 Rate limited IP: ${clientIp}`);
      return new Response(
        JSON.stringify({
          success: false,
          rateLimited: true,
          message: 'Too many requests! Please wait a moment before trying again. 🙏',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Input validation
    const rawBody = await req.json();
    const parseResult = ChatInputSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid input',
          details: parseResult.error.errors.map(e => e.message)
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { message, messages, language, memory } = parseResult.data;

    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');

    if (!GROQ_API_KEY) {
      console.error('GROQ_API_KEY is not configured');
      return new Response(
        JSON.stringify({ success: false, message: 'AI service is not configured. Please contact admin.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the user's question
    const userQuery = message || messages?.[messages.length - 1]?.content || '';

    // RAG Strategy: Direct lookup → Hybrid search → Keyword filter fallback
    let liveContent = '';
    let ragContext = '';

    // Resolve pronouns in query using memory BEFORE knowledge retrieval
    const resolvedQuery = resolveQueryWithMemory(userQuery, memory);

    // Step 1: Try direct section lookup for high-precision queries (HOD, specific contacts)
    const directResult = await directSectionLookup(resolvedQuery);

    // Step 2: Try hybrid search (semantic + keyword via pgvector + tsvector)
    const hybridResult = await hybridSearch(resolvedQuery, 5);

    if (directResult || hybridResult) {
      let combinedContext = '';
      if (directResult) {
        console.log('[RAG] Using direct section lookup (high-priority)');
        combinedContext += `### PRECISE MATCH (use this FIRST for the answer):\n${directResult}`;
      }
      if (hybridResult) {
        console.log('[RAG] Using hybrid search results');
        // If we have direct results, hybrid is supplemental; otherwise it's primary
        combinedContext += `${directResult ? '\n\n### ADDITIONAL CONTEXT:\n' : ''}${hybridResult}`;
      }
      ragContext = `## COLLEGE KNOWLEDGE BASE (PRIMARY SOURCE - USE THIS FIRST):\n${combinedContext}`;
    } else {
      // Fallback: keyword-based section filter on the full knowledge base
      console.log('[RAG] Hybrid search unavailable — falling back to keyword filter');
      const fullKnowledge = await fetchKnowledgeBase();
      const relevantKnowledge = getRelevantKnowledge(resolvedQuery, fullKnowledge);
      ragContext = `## COLLEGE KNOWLEDGE BASE (PRIMARY SOURCE - USE THIS FIRST):\n${relevantKnowledge}`;
    }

    // Only scrape the website if Firecrawl is available (for latest updates/news)
    if (FIRECRAWL_API_KEY && userQuery) {
      try {
        console.log('Supplementing with live data from lbscek.ac.in for query:', userQuery);
        // Global 8-second timeout for all scraping
        const scrapePromise = scrapeRelevantContent(userQuery, FIRECRAWL_API_KEY);
        const timeoutPromise = new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error('Scraping timed out')), 8000)
        );
        const scrapedContent = await Promise.race([scrapePromise, timeoutPromise]);
        if (scrapedContent && scrapedContent !== 'No additional content scraped.') {
          liveContent = scrapedContent;
        }
      } catch (err) {
        console.error('Scraping failed or timed out, using knowledge base only:', err);
      }
    }

    // Append live data as supplement if available
    if (liveContent) {
      ragContext += `\n\n## LIVE WEBSITE DATA (SUPPLEMENTAL - use for latest news/updates or if knowledge base doesn't cover the topic):\n${liveContent}`;
    }

    // Build conversation history (limit to last 10 messages to prevent token overflow)
    const recentMessages = messages?.slice(-10) || [];
    const conversationHistory = recentMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Add the new user message if provided
    if (message) {
      conversationHistory.push({ role: 'user', content: message });
    }

    // Auto-detect language from user's message (overrides frontend language)
    const detectedLanguage = detectLanguage(userQuery);
    const languageInstruction = getLanguageInstruction(detectedLanguage);
    console.log('Auto-detected language:', detectedLanguage, 'for query:', userQuery.substring(0, 50));

    // ── Groq API call with STREAMING ───────────────────────────
    const groqController = new AbortController();
    const groqTimeout = setTimeout(() => groqController.abort(), 15000);

    let groqResponse: Response;
    try {
      groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: `${SYSTEM_PROMPT}\n\n${languageInstruction}${buildMemoryContext(memory)}` },
            { role: 'user', content: `Here is the ONLY source of truth you can use to answer questions. DO NOT use any other knowledge:\n\n${ragContext}${getQueryTranslationHint(userQuery, detectedLanguage)}` },
            { role: 'assistant', content: 'Understood. I will STRICTLY only use the provided context. If the answer is not in the context, I will say I don\'t have that info and direct to lbscek.ac.in.' },
            ...conversationHistory,
          ],
          max_tokens: 500,
          temperature: 0.2,
          stream: true,
        }),
        signal: groqController.signal,
      });
    } catch (fetchErr) {
      clearTimeout(groqTimeout);
      console.error('Groq API fetch error (likely timeout):', fetchErr);
      return new Response(
        JSON.stringify({ success: false, message: 'AI service timed out. Please try again.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    clearTimeout(groqTimeout);

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text().catch(() => 'Unknown error');
      console.error('AI Gateway error:', groqResponse.status, errorText);

      const userMessage = groqResponse.status === 429
        ? 'Too many requests. Please try again in a moment. 🙏'
        : groqResponse.status === 402
          ? 'AI service temporarily unavailable. Please try again later.'
          : 'AI service error. Please try again later.';

      return new Response(
        JSON.stringify({ success: false, message: userMessage }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── Stream the response as SSE to the client ──────────────
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        let fullText = '';
        let totalTokens = 0;

        try {
          const reader = groqResponse.body!.getReader();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // keep incomplete line in buffer

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data: ')) continue;

              const jsonStr = trimmed.slice(6);
              if (jsonStr === '[DONE]') continue;

              try {
                const parsed = JSON.parse(jsonStr);
                const delta = parsed.choices?.[0]?.delta?.content || '';
                if (delta) {
                  fullText += delta;
                  // Send chunk as SSE
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'chunk', text: delta })}\n\n`));
                }
                // Capture usage if present (Groq sends it in the last chunk)
                if (parsed.usage) {
                  totalTokens = parsed.usage.total_tokens || 0;
                }
              } catch {
                // Skip malformed JSON chunks
              }
            }
          }

          // ── Post-stream processing ─────────────────────────────
          const responseTimeMs = Date.now() - requestStartTime;
          const assistantMessage = fullText || 'Sorry, please try again later!';

          console.log('AI streaming response completed with RAG context');

          // Send the final "done" event
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', fullText: assistantMessage })}\n\n`));

          // Unanswered question detection
          const msgLower = assistantMessage.toLowerCase();
          const isUnanswered = cantAnswerPhrases.some(phrase => msgLower.includes(phrase));

          if (isUnanswered && userQuery && userQuery.length > 5) {
            supabaseClient
              .from('unanswered_questions')
              .insert({
                question: userQuery.substring(0, 500),
                detected_language: detectedLanguage,
              })
              .then(({ error: logError }) => {
                if (logError) console.error('Failed to log unanswered question:', logError.message);
                else console.log('📝 Logged unanswered question for auto-resolution:', userQuery.substring(0, 80));
              });
          }

          // Log analytics
          logAnalytics(userQuery, detectedLanguage, responseTimeMs, totalTokens, !isUnanswered);

          controller.close();
        } catch (streamErr) {
          console.error('Stream processing error:', streamErr);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Stream interrupted' })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Something went wrong. Please try again.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
