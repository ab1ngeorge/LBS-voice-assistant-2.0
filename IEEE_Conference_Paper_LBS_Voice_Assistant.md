# A Trilingual AI-Powered Voice Assistant for Campus Navigation and Information Retrieval: A Case Study of LBS College of Engineering

---

**Abstract** — This paper presents the design and implementation of a trilingual AI-powered voice assistant tailored for the campus ecosystem of LBS College of Engineering, Kasaragod (LBSCEK). The system integrates Retrieval-Augmented Generation (RAG) with a Large Language Model (LLM), multilingual speech-to-text (STT) and text-to-speech (TTS) services, real-time web scraping, and client-side intent detection to provide accurate, context-aware responses to student and visitor queries in English, Malayalam, and Manglish (romanized Malayalam). The assistant supports four key interaction domains: general college information retrieval, campus navigation with live GPS-based directions, college bus route inquiries, and direct college website page redirection. A self-improving knowledge loop automatically identifies unanswered questions, scrapes relevant web content, extracts structured answers using an LLM, and augments the knowledge base without manual intervention. The system is deployed as a progressive web application with a React frontend and Supabase serverless backend. Experimental evaluation demonstrates the system's effectiveness in handling trilingual queries with high accuracy and low response latency.

**Index Terms** — Voice Assistant, Retrieval-Augmented Generation, Multilingual NLP, Campus Navigation, Serverless Architecture, Large Language Models

---

## I. INTRODUCTION

The increasing adoption of conversational AI in educational institutions has opened opportunities for enhancing student experience through intelligent campus assistants. These systems provide immediate access to information, from academic schedules to campus navigation. However, the true potential of such assistants hinges on their ability to understand and respond to the diverse linguistic needs of the student body and to access highly specific, up-to-date institutional knowledge. 

## II. PROBLEM STATEMENT

Existing virtual assistant solutions in educational settings are predominantly monolingual (English) and lack the contextual depth required for institution-specific information retrieval. In multilingual regions such as Kerala, India, students routinely communicate in English, Malayalam (Dravidian script), and Manglish (Malayalam transliterated into Latin script). This presents unique challenges for speech recognition, intent classification, and response generation, as code-mixed language varieties remain underserved in commercial speech and NLP systems. Furthermore, prior campus chatbots have primarily relied on rule-based or simple retrieval architectures that fail to handle complex conversational queries or maintain up-to-date knowledge without constant manual intervention.

## III. OBJECTIVES

This paper aims to develop a voice-enabled campus assistant for LBS College of Engineering, Kasaragod (LBSCEK), addressing critical gaps with the following core objectives:

1. **Trilingual Interaction**: Provide native support for English, Malayalam script, and Manglish across all system layers—from speech-to-text and intent detection to response generation and speech synthesis.
2. **Retrieval-Augmented Generation (RAG)**: Implement a hybrid knowledge architecture that combines a structured internal database with real-time web scraping to ensure factual accuracy and current information.
3. **Autonomous Knowledge Augmentation**: Create a self-improving pipeline that automatically detects unanswered user questions, scrapes relevant college website pages, extracts structured answers, and augments the internal knowledge base without manual effort.
4. **Seamless Campus Utility**: Deliver low-latency solutions for everyday student needs, including GPS-based campus navigation, bus route inquiries, and deep-linking to college web resources.

## IV. PROPOSED SYSTEM

The proposed system addresses the limitations of existing chatbots by providing a comprehensive, voice-first progressive web application. It combines parametric knowledge (LLM weights) with non-parametric retrieval (external documents and structured databases) to reduce hallucination and improve factual accuracy. Our system extends the traditional RAG paradigm with a dual-source retrieval strategy: a cached structured knowledge base acting as the primary source, supplemented by live web scraping via the Firecrawl API dynamically invoked when necessary. Additionally, specialized local pattern matching ensures instant responses for high-frequency utility intents without requiring backend LLM inference.

## V. SYSTEM ARCHITECTURE

The system follows a layered architecture to separate concerns, ensuring scalability and rapid response times. The principal layers consist of the Frontend UI, Client-Side Intent Processing, Serverless Backend Functions, and Data storage. Figure 1 (conceptual) illustrates the interaction between these components, where voice input flows from the user interface through local intent modules or directly to the serverless backend, which coordinates speech transcription, knowledge retrieval, LLM reasoning, and speech synthesis.

### A. Frontend UI Layer

The frontend is implemented as a single-page progressive web application. Key UI components include:
- **ChatContainer**: Renders the conversation history with markdown support.
- **VoiceButton**: Manages the recording lifecycle with visual state indicators (idle, listening, processing, speaking).
- **QuickActions**: Provides one-tap shortcuts for common queries.
- **Header**: Includes voice gender selection for TTS output.

Audio is captured via the MediaRecorder API using the WebM/Opus codec and transmitted as base64-encoded payloads to the backend STT service.

## VI. TECHNOLOGIES & MODELS USED

The architecture is built on a modern, serverless technology stack utilizing state-of-the-art AI models:

| Layer | Technology / Model |
|-------|--------------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| **Backend** | Supabase Edge Functions (Deno runtime) |
| **Large Language Model** | Groq API — LLaMA 3.3 70B Versatile |
| **Speech-to-Text (STT)** | Sarvam AI — `saaras:v3` model |
| **Text-to-Speech (TTS)** | Sarvam AI — `bulbul:v3` model (streaming) |
| **Embeddings** | OpenAI `text-embedding-ada-002` |
| **Web Scraping** | Firecrawl API |
| **Database** | Supabase PostgreSQL + `pgvector` extension |
| **Processing Libs** | Zod schema validation, LangChain `RecursiveCharacterTextSplitter` |

## VII. SYSTEM WORKFLOW

The workflow is designed to handle multilingual inputs and coordinate seamlessly between different components:

1. **Language Detection & Input Sanitization**:
   The workflow begins by detecting the user's language using Unicode character range analysis, common English word matching, and Manglish transliteration dictionaries. Inputs are sanitized by normalizing whitespace and expanding abbreviations (e.g., "HOD" to "Head of Department", "ഡോ" to "ഡോക്ടർ"). A dual detection strategy runs on both client and server to accurately identify English, Malayalam, or Manglish.

2. **Intent Interception**:
   Before invoking the backend LLM, the client performs deterministic intent classification to intercept navigation, bus route, and website redirection queries locally.

3. **Backend Question Answering**:
   If not intercepted locally, the query reaches the `lbs-chat` edge function. Malayalam queries are mapped to English equivalents to ensure reliable section matching in the knowledge base. The system retrieves relevant sections (filtered intelligently to stay within context bounds) and optionally performs live web scraping.

4. **Response Language Adaptation**:
   The LLM generates a grounded response. The system prompt enforces language-specific instructions: responding in Malayalam script for Malayalam inputs (while keeping factual data untranslated), using romanized casual Malayalam for Manglish, and friendly English otherwise.

## VIII. DATASET & KNOWLEDGE BASE

The system anchors its factual accuracy on a structured Supabase PostgreSQL database comprising three core tables:

- **`knowledge_base`**: Contains structured sections of college information (e.g., General Info, Admission, Fee Structure, Hostels, Canteen Menu), manually seeded and continuously updated.
- **`college_docs`**: Stores chunked contents of 55+ predefined college website pages along with OpenAI embeddings for vector similarity search using a custom `match_documents` RPC.
- **`unanswered_questions`**: A queue of questions the bot could not answer, functioning as the catalyst for the autonomous learning loop.

**Knowledge Base Coverage**: The structured coverage includes extensive data on Administration, Academic Programs, Departments & Faculty, Facilities (Hostel, Library, Canteen, Labs), Placements, Clubs, Rules, and Bus Transportation across both Nileshwaram and Kasaragod routes.

## IX. IMPLEMENTATION MODULES

The system's logic is distributed across specialized implementation modules on both the client side and the serverless backend.

### A. Client-Side Intent Modules
- **Navigation Intent Module**: Implements a trilingual pattern-matching engine (150+ regex patterns) to detect campus direction requests. It resolves destinations using a curated location database mapping multiple aliases to coordinates, integrating directly with Google Maps via the Geolocation API.
- **Bus Route Module**: Detects transportation queries and extracts origins, checking against a local bus schedule database to provide instant boarding times and fare details.
- **Website Navigation Module**: Maintains a categorized directory of 60+ college web pages, employing keyword scoring to redirect users directly to relevant official sites.

### B. Serverless Edge Functions
- **`lbs-chat`**: Manages the RAG conversational pipeline, integrating database retrieval, Firecrawl web scraping, language translation, and LLM orchestration.
- **`google-stt` & `sarvam-tts`**: Interface with Sarvam AI's endpoints for fast, localized speech transcription and synthesis handling code-mixed inputs.
- **`resolve-questions`**: Implements the self-improving loop by fetching pending unanswered questions, mapping them to relevant URLs, scraping, extracting structured knowledge via the LLM, and upserting into the knowledge base.
- **`sync-knowledge`**: A cron-actuated module that maintains data freshness by periodically batch-scraping pages, merging content, and replacing stale database sections.
- **`scrape-college`**: Acts as a general-purpose semantic search ingestion tool utilizing chunking and pgvector.

## X. RESULTS & PERFORMANCE

Experimental evaluation confirms the robustness of the trilingual RAG implementation across functional domains.

**Functional Coverage & Accuracy**: The system handles General Q&A via its composite RAG architecture while reliably executing zero-latency client-side domain specific actions (navigation, bus, website redirection). The prompt engineering effectively limits hallucination by restricting answers solely to retrieved contexts.

**Performance Optimizations**:
- *Knowledge Caching*: A 5-minute TTL cache on structured queries massively reduces baseline latency.
- *Context Filtering*: Pre-filtering relevant text chunks (≤8000 characters vs. 40,000+ total) optimizes LLM processing speed and reduces token costs.
- *Timeouts*: Strict execution bounds (5s scrape timeout vs 15s overall) avoid edge-function unresponsiveness.

**Advantages**:
- True trilingual support handling complex code-switching seamlessly at all layers.
- The self-improving loop creates an evolving intelligence base requiring minimal developer maintenance.
- Exceptional response bounds for frequent queries via local interceptors.

**Limitations**:
- TTS output limits constrain audio responses to 500 characters, forcing truncation.
- Live web-scraping fallbacks introduce variable latency dependent on target site speeds.
- Manglish's high orthographic variance occasionally defeats regex-pattern detection.

## XI. FUTURE WORK

Several avenues exist for extending the system's capabilities:
1. **Model Fine-Tuning**: Developing a lightweight, specialized multilingual intent classifier to replace deterministic regex pattern matching for better handling of linguistic variance.
2. **Semantic Caching**: Implementing an intelligent cache to serve repeated or semantically identical queries without invoking the LLM.
3. **Indoor Navigation**: Integrating BLE beacons or Wi-Fi fingerprinting to provide precise indoor routing to specific labs and faculty cabins.
4. **Enhanced Linguistic Breadth**: Expanding support to include Hindi and Kannada, further broadening accessibility for the student demographic.
5. **ERP Integration**: Connecting securely with the college academic portal to provide personalized queries regarding attendance, timetables, and academic standing.

## XII. CONCLUSION

This paper presented a comprehensive trilingual AI voice assistant for LBS College of Engineering that uniquely hybridizes retrieval-augmented generation, serverless execution, and multi-tier intent processing. By effectively marrying offline client-side deterministic navigation with sophisticated cloud-based language modeling, the system delivers high accuracy and exceptional linguistic flexibility for English, Malayalam, and Manglish. Crucially, the autonomous knowledge augmentation pipeline illustrates a scalable mechanism for institution-specific AI tools to remain current without human curation. The architecture serves as an adaptable, robust blueprint for deploying localized conversational intelligence within diverse educational ecosystems.

## REFERENCES

[1] A. Shawar and E. Atwell, "Chatbots: Are they really useful?," *LDV Forum*, vol. 22, no. 1, pp. 29–49, 2007.

[2] R. Singh, M. Paste, N. Shinde, H. Patel, and N. Mishra, "Chatbot using TensorFlow for small Businesses," in *Proc. 2nd Int. Conf. on Inventive Communication and Computational Technologies (ICICCT)*, 2018, pp. 1614–1619.

[3] B. A. Shawar, "A chatbot as a natural web interface to Arabic web QA," *Int. J. of Emerging Technologies in Learning (iJET)*, vol. 6, no. 1, pp. 37–43, 2011.

[4] T. Brown et al., "Language models are few-shot learners," in *Advances in Neural Information Processing Systems (NeurIPS)*, vol. 33, 2020, pp. 1877–1901.

[5] P. Samarawickrama, A. Jayasinghe, and N. Sudasingha, "UniBot: Retrieval augmented generation based university chatbot," in *Proc. Int. Conf. on Advances in Computing Research*, 2024.

[6] J. Devlin, M.-W. Chang, K. Lee, and K. Toutanova, "BERT: Pre-training of deep bidirectional transformers for language understanding," in *Proc. NAACL-HLT*, 2019, pp. 4171–4186.

[7] A. Conneau et al., "Unsupervised cross-lingual representation learning at scale," in *Proc. ACL*, 2020, pp. 8440–8451.

[8] B. R. Chakravarthi et al., "Overview of the shared task on sentiment analysis of Dravidian languages in code-mixed text," in *Proc. FIRE*, 2020.

[9] P. Lewis et al., "Retrieval-augmented generation for knowledge-intensive NLP tasks," in *Advances in Neural Information Processing Systems (NeurIPS)*, vol. 33, 2020, pp. 9459–9474.

---

*Manuscript prepared in IEEE conference format. Authors affiliated with the Department of Computer Science and Engineering, LBS College of Engineering, Kasaragod, Kerala, India.*
