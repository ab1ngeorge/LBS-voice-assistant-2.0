// ─── Offline Cache Module ──────────────────────────────────────────────────
// Provides offline FAQ and navigation data for the LBS Voice Assistant.
// Uses localStorage to persist data between sessions.

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface OfflineFAQ {
  question: string;
  answer: string;
  keywords: string[]; // English + Malayalam + Manglish keywords for matching
  patterns?: string[]; // Full user phrases for high-confidence matching
}

export interface OfflineNavEntry {
  name: string;
  aliases: string[];
  location: string;
  description: string;
}

export interface OfflineCache {
  faqs: OfflineFAQ[];
  navigation: OfflineNavEntry[];
  last_updated: string; // ISO timestamp
}

export interface OfflineResponse {
  matched: boolean;
  matchType: 'faq' | 'navigation' | 'none';
  answer: string;
  isStale: boolean; // true if cache > 7 days old
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const CACHE_KEY = 'lbs_offline_cache';
const STALE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Real-time keywords that cannot be answered offline
const REALTIME_KEYWORDS = [
  'now', 'today', 'current', 'live', 'right now', 'at the moment', 'latest news',
  'ഇപ്പോൾ', 'ഇന്ന്', 'നിലവിൽ',
  'ippo', 'ippozhthe', 'innu', 'nilavil',
];

// ─────────────────────────────────────────────────────────────────────────────
// Default Seeded FAQs — Campus essentials available offline
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_FAQS: OfflineFAQ[] = [
  // General Info
  {
    question: 'What is LBS College of Engineering?',
    answer: 'LBS College of Engineering, Kasaragod (LBSCEK) is a government-aided engineering college established in 1993. It is managed by L B S Centre for Science and Technology (a Govt. of Kerala undertaking) and affiliated to APJ Abdul Kalam Technological University (KTU). The campus spans 52 acres at Povval, Muliyar P.O., Kasaragod, Kerala - 671542.',
    keywords: ['lbs', 'college', 'about', 'what is', 'lbscek', 'established', 'general', 'info', 'information', 'കോളേജ്', 'എന്താണ്', 'college entha'],
    patterns: ['what is lbs college', 'tell me about lbs', 'about lbs college', 'lbs college entha', 'college kurichu parayoo', 'lbs എന്താണ്', 'lbscek about'],
  },
  {
    question: 'What is the contact information?',
    answer: 'Phone: +91-4994-256300 | Email: principal@lbscek.ac.in, office@lbscek.ac.in | Website: https://lbscek.ac.in/ | Address: Povval, Muliyar P.O., Kasaragod, Kerala - 671542',
    keywords: ['contact', 'phone', 'email', 'address', 'number', 'call', 'ബന്ധപ്പെടുക', 'ഫോൺ', 'നമ്പർ', 'phone number', 'vilikkoo', 'address evide'],
    patterns: ['contact number', 'phone number of college', 'college email', 'college address', 'contact information', 'how to contact', 'college phone number', 'email address', 'college number entha'],
  },
  {
    question: 'What is the vision and mission?',
    answer: 'Vision: To be a centre of excellence in engineering education and research. Mission: To impart quality technical education, promote research and innovation, and develop competent engineers with social commitment.',
    keywords: ['vision', 'mission', 'goal', 'objective', 'aim', 'വിഷൻ', 'മിഷൻ', 'ലക്ഷ്യം', 'vision mission'],
    patterns: ['vision and mission', 'what is the vision', 'what is the mission', 'college vision', 'college mission'],
  },
  {
    question: 'Who is the Principal?',
    answer: 'The Principal of LBSCEK is the chief administrative and academic officer of the college. For the current principal\'s details, please visit: https://lbscek.ac.in/principal/',
    keywords: ['principal', 'director', 'head', 'പ്രിൻസിപ്പൽ', 'principal aaru'],
    patterns: ['who is the principal', 'principal aaru', 'principal name', 'college principal'],
  },

  // Departments
  {
    question: 'What departments are available?',
    answer: 'LBSCEK offers 5 B.Tech programs: Computer Science & Engineering (CSE), Electronics & Communication Engineering (ECE), Electrical & Electronics Engineering (EEE), Mechanical Engineering (ME), and Civil Engineering (CE). MCA and M.Tech programs are also available.',
    keywords: ['department', 'departments', 'course', 'program', 'branch', 'btech', 'cse', 'ece', 'eee', 'mechanical', 'civil', 'mca', 'ഡിപ്പാർട്ട്മെന്റ്', 'വിഭാഗം', 'കോഴ്സ്', 'department ethra', 'vibhagam'],
    patterns: ['what departments', 'departments available', 'which departments', 'how many departments', 'list departments', 'what courses', 'which courses', 'btech programs', 'department entha', 'ethra department', 'courses offered'],
  },
  {
    question: 'What are the CSE department timings?',
    answer: 'The CSE department works from 9:00 AM to 4:00 PM on working days (Monday to Friday). Labs are typically available from 9:00 AM to 3:30 PM.',
    keywords: ['cse', 'computer science', 'timing', 'time', 'hours', 'open', 'close', 'സിഎസ്ഇ', 'കമ്പ്യൂട്ടർ', 'സമയം', 'cse samayam', 'cse time'],
    patterns: ['cse department timing', 'cse timings', 'cse department hours', 'computer science timing', 'cse time entha', 'cse samayam entha'],
  },
  {
    question: 'What are the department working hours?',
    answer: 'All academic departments operate from 9:00 AM to 4:00 PM on working days (Monday to Friday). The office works from 9:00 AM to 5:00 PM.',
    keywords: ['working hours', 'office hours', 'timing', 'when open', 'department time', 'office time', 'സമയം', 'പ്രവൃത്തി സമയം', 'samayam', 'office samayam'],
    patterns: ['working hours', 'office hours', 'department timing', 'when does office open', 'office time', 'college timing', 'college working hours'],
  },

  // Admission
  {
    question: 'How to get admission?',
    answer: 'Admission to B.Tech programs is through KEAM (Kerala Engineering Architecture Medical) entrance exam conducted by CEE Kerala. Management and NRI quota seats are also available. Key documents: KEAM allotment memo, 10th & 12th mark sheets, transfer certificate, community certificate, income certificate.',
    keywords: ['admission', 'apply', 'keam', 'entrance', 'seat', 'intake', 'join', 'how to join', 'അഡ്മിഷൻ', 'പ്രവേശനം', 'admission engane', 'praveshanam'],
    patterns: ['how to get admission', 'admission process', 'how to apply', 'how to join', 'admission engane', 'keam admission', 'admission procedure'],
  },

  // Fee Structure
  {
    question: 'What is the fee structure?',
    answer: 'Approximate annual fee for B.Tech: ₹35,000 (Merit/Government seats). Management quota fees are higher. Hostel fee: approximately ₹5,000-8,000 per year. Bus fee varies by route (₹4,000-8,000 per year). For exact current fees, visit: https://lbscek.ac.in/admissions/',
    keywords: ['fee', 'fees', 'tuition', 'cost', 'payment', 'ethra', 'ഫീസ്', 'ഫീ', 'പണം', 'ചെലവ്', 'fee ethra', 'fees ethra', 'panam'],
    patterns: ['fee structure', 'what is the fee', 'how much fee', 'fee ethra', 'tuition fee', 'btech fee', 'college fee', 'annual fee', 'fees ethra', 'fee details'],
  },

  // Hostel
  {
    question: 'Is hostel available?',
    answer: "Yes! LBSCEK has separate hostels for boys and girls. Men's Hostel is on campus. Ladies Hostel (Shahanas Hostel) is also available. Hostel fee is approximately ₹5,000-8,000 per year. Mess charges are additional. Apply early as seats are limited.",
    keywords: ['hostel', 'accommodation', 'room', 'stay', 'boys hostel', 'girls hostel', 'mess', 'ഹോസ്റ്റൽ', 'താമസം', 'hostel undo', 'thamasam'],
    patterns: ['is hostel available', 'hostel available', 'hostel undo', 'boys hostel', 'girls hostel', 'hostel details', 'hostel info', 'hostel fee', 'hostel thamasam', 'hostel undu'],
  },

  // Placements
  {
    question: 'What about placements?',
    answer: 'LBSCEK has an active Career Guidance & Placement Unit (CGPU). Top recruiters include TCS, Infosys, Wipro, UST Global, and other major IT companies. Average package ranges from ₹3-6 LPA. The placement cell conducts training programs, mock interviews, and campus drives. Visit: https://lbscek.ac.in/placements',
    keywords: ['placement', 'job', 'recruit', 'package', 'salary', 'company', 'career', 'cgpu', 'പ്ലേസ്‌മെന്റ്', 'ജോലി', 'ശമ്പളം', 'placement entha', 'joli', 'shambalam'],
    patterns: ['placement details', 'placement stats', 'placement record', 'placement companies', 'average package', 'placement entha', 'placement rate', 'which companies', 'campus placement', 'job placement', 'placement info'],
  },

  // Canteen
  {
    question: 'Tell me about the canteen',
    answer: 'The college canteen is located near the central area of the campus. It serves breakfast, lunch, snacks, and beverages. Menu includes: Dosa (₹15-25), Puttu & Kadala (₹20), Idli (₹15), Meals/Oonu (₹50-60), Tea (₹10), Coffee (₹15), and various snacks. Open from 8:00 AM to 5:00 PM on working days.',
    keywords: ['canteen', 'food', 'menu', 'mess', 'cafeteria', 'eat', 'dosa', 'tea', 'coffee', 'meal', 'കാന്റീൻ', 'ഭക്ഷണം', 'ചായ', 'canteen menu', 'bhakshanam', 'oonu', 'chaya'],
    patterns: ['canteen menu', 'what food', 'canteen food', 'what about canteen', 'canteen timing', 'canteen entha', 'mess menu', 'canteen il entha', 'food available'],
  },

  // Library
  {
    question: 'What about the library?',
    answer: 'The Central Library has a collection of 30,000+ books, journals, and digital resources. Digital library access is available through DELNET. Open: 9:00 AM to 5:00 PM (Mon-Fri), 9:00 AM to 1:00 PM (Sat). Services: book lending, reference section, reading room, internet access, and NPTEL video courseware.',
    keywords: ['library', 'books', 'reading', 'digital library', 'ലൈബ്രറി', 'പുസ്തകശാല', 'വായനശാല', 'library evide', 'library timing', 'pustakashala'],
    patterns: ['library details', 'library timing', 'library hours', 'about library', 'library info', 'library evide', 'how many books', 'digital library'],
  },

  // Bus Transport
  {
    question: 'Is college bus available?',
    answer: 'Yes! College buses operate on two main routes: Nileshwaram side and Kasaragod side. Buses arrive at college by 9:15 AM and depart at 4:00 PM. Student fare ranges from ₹20 to ₹85 depending on distance. Use the bus intent (type "bus from [your place]") for specific stop details.',
    keywords: ['bus', 'transport', 'route', 'bus time', 'bus route', 'ബസ്', 'ട്രാൻസ്പോർട്ട്', 'bus undo', 'bus samayam'],
    patterns: ['college bus available', 'bus available', 'bus undo', 'bus timing', 'bus routes', 'bus details', 'college bus info', 'transport details'],
  },

  // Clubs
  {
    question: 'What clubs are available?',
    answer: 'Student clubs include: IEEE Student Branch, IEDC (Innovation & Entrepreneurship), GDSC (Google Developer Student Club), NSS (National Service Scheme), NCC, μLearn, TinkerHub, FOSS Cell, Robotics Club, Cultural Club, and Sports Club. These clubs organize workshops, hackathons, and technical events throughout the year.',
    keywords: ['club', 'clubs', 'ieee', 'iedc', 'gdsc', 'nss', 'ncc', 'mulearn', 'tinkerhub', 'foss', 'ക്ലബ്', 'club entha', 'clubs evide'],
    patterns: ['what clubs', 'clubs available', 'list clubs', 'which clubs', 'club entha', 'student clubs', 'clubs in college', 'technical clubs'],
  },

  // Exams
  {
    question: 'How does the exam system work?',
    answer: 'LBSCEK follows the KTU (APJ Abdul Kalam Technological University) semester system. Each semester has internal assessments (series tests, assignments) and university exams. Minimum 75% attendance is required to appear for exams. Results are published on ktu.edu.in.',
    keywords: ['exam', 'exams', 'ktu', 'semester', 'attendance', 'result', 'test', 'syllabus', 'പരീക്ഷ', 'സിലബസ്', 'exam engane', 'pareeksha'],
    patterns: ['exam system', 'how exams work', 'exam details', 'ktu exam', 'semester exam', 'exam engane', 'attendance requirement', 'exam results'],
  },

  // Scholarship
  {
    question: 'Are scholarships available?',
    answer: 'Yes! Various scholarships are available: E-Grantz (Kerala Govt.), Central Sector Scholarship, Post Matric Scholarship for SC/ST/OBC students, Merit-cum-Means Scholarship, and Private Trust scholarships. Apply through the respective portals. Contact the office for guidance.',
    keywords: ['scholarship', 'fee waiver', 'financial aid', 'egrantz', 'സ്കോളർഷിപ്പ്', 'scholarship undo', 'fee ilavu'],
    patterns: ['scholarship available', 'scholarships', 'scholarship undo', 'fee waiver', 'financial aid', 'egrantz scholarship', 'how to get scholarship'],
  },

  // Facilities
  {
    question: 'What facilities does the campus have?',
    answer: 'Campus facilities include: Central Library, Computer Labs, Fab Lab, Idea Lab, Sports Complex (football ground, basketball, volleyball, cricket), Gym, Auditorium, Canteen, ATM (SBI), Co-operative Society (stationery shop), Wi-Fi campus, Reprographic Centre (xerox/print), and separate Boys & Girls hostels.',
    keywords: ['facility', 'facilities', 'infrastructure', 'lab', 'wifi', 'gym', 'sport', 'auditorium', 'സൗകര്യം', 'facility entha', 'campus facilities'],
    patterns: ['campus facilities', 'what facilities', 'facilities available', 'infrastructure', 'campus amenities', 'facility entha', 'list facilities'],
  },

  // ATM
  {
    question: 'Is there an ATM on campus?',
    answer: 'Yes! There is an SBI ATM on the college campus, available 24/7. It is located near the main building area.',
    keywords: ['atm', 'sbi', 'bank', 'cash', 'money', 'എടിഎം', 'ബാങ്ക്', 'atm evide', 'paisa'],
    patterns: ['atm on campus', 'is there atm', 'atm available', 'sbi atm', 'atm evide', 'where is atm', 'bank on campus'],
  },

  // Dress Code
  {
    question: 'What is the dress code?',
    answer: 'LBSCEK has a prescribed dress code. Students must wear the college uniform on working days. ID cards must be worn and visible at all times inside the campus. Specific lab dress codes (aprons, safety gear) apply in workshops and labs.',
    keywords: ['dress', 'dress code', 'uniform', 'ഡ്രസ്സ്', 'യൂണിഫോം', 'dress code entha'],
    patterns: ['dress code', 'what is dress code', 'college uniform', 'dress code entha', 'uniform rules'],
  },

  // Anti-Ragging
  {
    question: 'What about ragging rules?',
    answer: 'Ragging is strictly prohibited on campus and in hostels. LBSCEK has an active Anti-Ragging Cell. Any incident of ragging must be reported to the Anti-Ragging Committee. Violators face strict disciplinary action including expulsion. Helpline: Anti-Ragging UGC helpline 1800-180-5522.',
    keywords: ['ragging', 'anti ragging', 'bully', 'complaint', 'റാഗിംഗ്', 'ragging complaint', 'anti ragging'],
    patterns: ['ragging rules', 'anti ragging', 'ragging complaint', 'is ragging allowed', 'ragging helpline', 'report ragging'],
  },

  // Grievance
  {
    question: 'How to file a grievance?',
    answer: 'Students can file grievances through the Grievance Redressal Cell. Submit complaints to the designated committee members or through the college website: https://lbscek.ac.in/grievance-cell/. All complaints are treated confidentially.',
    keywords: ['grievance', 'complaint', 'problem', 'issue', 'ഗ്രീവൻസ്', 'പരാതി', 'grievance engane', 'parathi'],
    patterns: ['file grievance', 'how to complain', 'grievance cell', 'submit complaint', 'grievance engane', 'parathi kodukkan'],
  },

  // Website
  {
    question: 'What is the college website?',
    answer: 'Official website: https://lbscek.ac.in/ — You can find information about departments, admissions, placements, news, events, and more. Student portal and KTU links are also accessible from the website.',
    keywords: ['website', 'site', 'link', 'url', 'portal', 'വെബ്സൈറ്റ്', 'ലിങ്ക്', 'website link', 'site link'],
    patterns: ['college website', 'website link', 'official website', 'college url', 'website entha'],
  },

  // Campus Location
  {
    question: 'Where is the college located?',
    answer: 'LBS College of Engineering is located at Povval, Muliyar P.O., Kasaragod District, Kerala - 671542. It is approximately 12 km from Kasaragod town and 8 km from Kanhangad. The nearest railway station is Kanhangad (8 km).',
    keywords: ['where', 'location', 'address', 'direction', 'how to reach college', 'എവിടെ', 'സ്ഥലം', 'college evide', 'location evide'],
    patterns: ['where is college', 'college location', 'college address', 'how to reach college', 'where is lbs', 'college evide', 'nearest railway station'],
  },

  // Accreditation
  {
    question: 'Is the college accredited?',
    answer: 'LBSCEK is affiliated to APJ Abdul Kalam Technological University (KTU). The college has NBA accreditation for select programs. IQAC (Internal Quality Assurance Cell) ensures continuous quality improvement.',
    keywords: ['accreditation', 'nba', 'naac', 'iqac', 'affiliated', 'rank', 'അക്രഡിറ്റേഷൻ', 'accreditation undo'],
    patterns: ['is college accredited', 'accreditation status', 'nba accreditation', 'college ranking', 'affiliated university', 'accreditation undo'],
  },

  // Alumni
  {
    question: 'Is there an alumni association?',
    answer: 'Yes! LBSCEK has an active Alumni Association. Alumni can register through the college website. The association organizes annual meets, mentorship programs, and career networking events. Visit: https://lbscek.ac.in/alumni-association/',
    keywords: ['alumni', 'alumnus', 'former student', 'അലുംനി', 'alumni undo', 'poorvva vidyarthi'],
    patterns: ['alumni association', 'is there alumni', 'alumni network', 'alumni undo', 'former students association'],
  },

  // IEDC
  {
    question: 'What is IEDC?',
    answer: 'IEDC (Innovation and Entrepreneurship Development Centre) is a student-driven club that promotes innovation, startup culture, and entrepreneurship. It organizes bootcamps, ideathons, workshops, and provides seed funding for student projects. Visit: https://lbscek.ac.in/iedc/',
    keywords: ['iedc', 'innovation', 'entrepreneurship', 'startup', 'ഐഇഡിസി', 'ഇന്നൊവേഷൻ', 'iedc entha'],
    patterns: ['what is iedc', 'iedc details', 'iedc about', 'iedc entha', 'innovation club', 'entrepreneurship cell'],
  },

  // Fab Lab / Idea Lab
  {
    question: 'What is the Fab Lab / Idea Lab?',
    answer: 'The AICTE Idea Lab and Campus Fab Lab are equipped with 3D printers, laser cutters, CNC machines, PCB fabrication equipment, and IoT kits. Students can prototype hardware projects and participate in maker activities. Open during department hours.',
    keywords: ['fab lab', 'fablab', 'idea lab', 'makerspace', '3d printer', 'ഫാബ് ലാബ്', 'ഐഡിയ ലാബ്', 'fab lab entha', 'idea lab entha'],
    patterns: ['what is fab lab', 'fab lab details', 'idea lab details', 'fab lab entha', 'idea lab entha', '3d printer available', 'makerspace'],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Default Navigation Entries (derived from known campus locations)
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_NAVIGATION: OfflineNavEntry[] = [
  { name: 'Main Entrance', aliases: ['main gate', 'college gate', 'campus entrance'], location: 'Front of Campus', description: 'Main entrance gate of LBS College of Engineering' },
  { name: 'CSE Department', aliases: ['cse', 'computer science', 'cs block'], location: 'CSE Block', description: 'Computer Science & IT Department' },
  { name: 'ECE Department', aliases: ['ece', 'electronics'], location: 'ECE Block', description: 'Electronics & Communication Department' },
  { name: 'EEE Department', aliases: ['eee', 'electrical'], location: 'EEE Block', description: 'Electrical & Electronics Department' },
  { name: 'ME Department', aliases: ['mechanical', 'mech'], location: 'Mechanical Block', description: 'Mechanical Engineering Department' },
  { name: 'CE Department', aliases: ['civil', 'ce'], location: 'Civil Block', description: 'Civil Engineering Department' },
  { name: 'Central Library', aliases: ['library', 'reading room'], location: 'Near Main Building', description: 'Central Library with 30,000+ books' },
  { name: 'College Canteen', aliases: ['canteen', 'mess', 'food'], location: 'Central Campus', description: 'Main canteen serving breakfast, lunch, and snacks' },
  { name: "Men's Hostel", aliases: ['boys hostel', 'hostel'], location: 'On Campus', description: "Boys' hostel accommodation" },
  { name: 'Shahanas Hostel', aliases: ['girls hostel', 'ladies hostel', 'shahanas'], location: 'Near Campus', description: "Ladies' hostel accommodation" },
  { name: 'SBI ATM', aliases: ['atm', 'bank', 'sbi'], location: 'Near Main Building', description: 'SBI ATM available 24/7' },
  { name: 'Auditorium', aliases: ['auditorium', 'audi', 'hall'], location: 'Main Campus', description: 'College auditorium for events and functions' },
  { name: 'Sports Area', aliases: ['sports', 'playground', 'ground', 'football'], location: 'Campus Ground', description: 'Multipurpose sports area and football ground' },
  { name: 'Fab Lab', aliases: ['fab lab', 'fablab', 'fabrication lab'], location: 'Near Departments', description: 'Campus Fab Lab with 3D printers and tools' },
  { name: 'Bus Garage', aliases: ['bus stop', 'bus garage', 'transport'], location: 'Campus Entrance Side', description: 'College bus parking and boarding area' },
  { name: 'Reprographic Centre', aliases: ['xerox', 'photocopy', 'print'], location: 'Near Main Building', description: 'Xerox, printing, and photocopying services' },
  { name: 'Co-operative Society', aliases: ['cooperative', 'coop', 'society', 'stationery'], location: 'Campus', description: 'Student co-operative store for stationery and supplies' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Cache Management
// ─────────────────────────────────────────────────────────────────────────────

/** Load cache from localStorage */
export function loadCache(): OfflineCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OfflineCache;
  } catch {
    console.warn('[Offline] Failed to load cache from localStorage');
    return null;
  }
}

/** Save cache to localStorage */
export function saveCache(cache: OfflineCache): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    console.warn('[Offline] Failed to save cache to localStorage');
  }
}

/** Initialize cache: seeds defaults on first load, preserves existing cache */
export function initializeCache(): OfflineCache {
  const existing = loadCache();
  if (existing && existing.faqs.length > 0) {
    console.log('[Offline] Cache loaded:', existing.faqs.length, 'FAQs,', existing.navigation.length, 'nav entries');
    return existing;
  }

  const fresh: OfflineCache = {
    faqs: DEFAULT_FAQS,
    navigation: DEFAULT_NAVIGATION,
    last_updated: new Date().toISOString(),
  };
  saveCache(fresh);
  console.log('[Offline] Cache initialized with', fresh.faqs.length, 'FAQs and', fresh.navigation.length, 'nav entries');
  return fresh;
}

/**
 * Fetch auto-promoted FAQs from Supabase `dynamic_faqs` table and merge
 * them into the local cache. This makes the local pipeline smarter over time.
 * Call this after initializeCache() — it runs in the background and does not block.
 */
export async function fetchAndMergeDynamicFAQs(cache: OfflineCache): Promise<void> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !supabaseKey) return;

    const response = await fetch(
      `${supabaseUrl}/rest/v1/dynamic_faqs?select=question,answer,keywords&order=hit_count.desc&limit=30`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!response.ok) {
      console.warn('[DynamicFAQ] Fetch failed:', response.status);
      return;
    }

    const dynamicFaqs: Array<{ question: string; answer: string; keywords: string[] }> = await response.json();

    if (!dynamicFaqs || dynamicFaqs.length === 0) {
      console.log('[DynamicFAQ] No dynamic FAQs available yet');
      return;
    }

    // Merge: only add FAQs whose questions don't already exist in the cache
    const existingQuestions = new Set(cache.faqs.map(f => f.question.toLowerCase()));
    let added = 0;

    for (const dfaq of dynamicFaqs) {
      if (!existingQuestions.has(dfaq.question.toLowerCase())) {
        cache.faqs.push({
          question: dfaq.question,
          answer: dfaq.answer,
          keywords: dfaq.keywords || [],
          patterns: [dfaq.question.toLowerCase()],
        });
        existingQuestions.add(dfaq.question.toLowerCase());
        added++;
      }
    }

    if (added > 0) {
      saveCache(cache);
      console.log(`[DynamicFAQ] Merged ${added} auto-promoted FAQs into local cache (total: ${cache.faqs.length})`);
    } else {
      console.log('[DynamicFAQ] All dynamic FAQs already in cache');
    }
  } catch (error) {
    console.warn('[DynamicFAQ] Failed to fetch dynamic FAQs:', error);
  }
}

/** Check if cache is stale (older than 7 days) */
export function isCacheStale(cache: OfflineCache): boolean {
  const lastUpdated = new Date(cache.last_updated).getTime();
  return Date.now() - lastUpdated > STALE_THRESHOLD_MS;
}

/** Update cache with fresh data from backend knowledge base sections */
export function updateCacheFromSections(sections: Array<{ question: string; answer: string; keywords?: string[] }>): void {
  const cache = loadCache() || initializeCache();

  // Merge: add new FAQs, update existing by question match
  for (const section of sections) {
    const existingIdx = cache.faqs.findIndex(
      (f) => f.question.toLowerCase() === section.question.toLowerCase(),
    );
    const entry: OfflineFAQ = {
      question: section.question,
      answer: section.answer,
      keywords: section.keywords || extractKeywords(section.question + ' ' + section.answer),
    };
    if (existingIdx >= 0) {
      cache.faqs[existingIdx] = entry;
    } else {
      cache.faqs.push(entry);
    }
  }

  cache.last_updated = new Date().toISOString();
  saveCache(cache);
  console.log('[Offline] Cache updated with', sections.length, 'sections from backend');
}

// ─────────────────────────────────────────────────────────────────────────────
// Local Query Matching
// ─────────────────────────────────────────────────────────────────────────────

/** Extract simple keywords from text for matching */
function extractKeywords(text: string): string[] {
  const stopWords = new Set(['the', 'is', 'a', 'an', 'of', 'to', 'in', 'for', 'and', 'or', 'on', 'at', 'by', 'it', 'i', 'me', 'my', 'we', 'do', 'can', 'how', 'what', 'which', 'are', 'was', 'were', 'be', 'been', 'have', 'has']);
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s\u0D00-\u0D7F]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));
}

/**
 * Match a query against cached FAQs using keyword + pattern scoring.
 * Returns the best match or null if no decent match is found.
 */
export function matchOfflineFAQ(query: string, cache: OfflineCache): OfflineFAQ | null {
  if (!query || query.trim().length === 0) return null;

  const queryLower = query.toLowerCase();
  const queryKeywords = extractKeywords(query);

  let bestMatch: OfflineFAQ | null = null;
  let bestScore = 0;

  for (const faq of cache.faqs) {
    let score = 0;

    // Pattern matching (highest priority — full-phrase matches)
    if (faq.patterns) {
      for (const pattern of faq.patterns) {
        const patternLower = pattern.toLowerCase();
        if (queryLower.includes(patternLower)) {
          // Full phrase match gets 3× the pattern length
          score += patternLower.length * 3;
        }
      }
    }

    // Keyword matching (secondary scorer)
    for (const kw of faq.keywords) {
      if (/[\u0D00-\u0D7F]/.test(kw)) {
        // Malayalam keyword — substring match on original query
        if (query.includes(kw)) score += kw.length * 2;
      } else {
        // English/Manglish — case-insensitive
        if (queryLower.includes(kw.toLowerCase())) score += kw.length;
      }
    }

    // Bonus: direct words from query appearing in FAQ keywords
    for (const qkw of queryKeywords) {
      if (faq.keywords.some((k) => k.toLowerCase() === qkw)) {
        score += 3;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  }

  // Minimum threshold to avoid garbage matches (offline — lenient)
  return bestScore >= 4 ? bestMatch : null;
}

/**
 * Match a query against cached FAQs for ONLINE use.
 * Uses a HIGHER threshold than offline to ensure only strong matches
 * bypass the LLM. Weak / ambiguous queries fall through to the AI.
 */
export function matchFAQForOnline(query: string, cache?: OfflineCache): OfflineFAQ | null {
  const resolvedCache = cache || loadCache() || initializeCache();
  if (!query || query.trim().length === 0) return null;

  const queryLower = query.toLowerCase();
  const queryKeywords = extractKeywords(query);

  let bestMatch: OfflineFAQ | null = null;
  let bestScore = 0;

  for (const faq of resolvedCache.faqs) {
    let score = 0;

    // Pattern matching (highest priority)
    if (faq.patterns) {
      for (const pattern of faq.patterns) {
        const patternLower = pattern.toLowerCase();
        if (queryLower.includes(patternLower)) {
          score += patternLower.length * 3;
        }
      }
    }

    // Keyword matching
    for (const kw of faq.keywords) {
      if (/[\u0D00-\u0D7F]/.test(kw)) {
        if (query.includes(kw)) score += kw.length * 2;
      } else {
        if (queryLower.includes(kw.toLowerCase())) score += kw.length;
      }
    }

    // Bonus: direct keyword matches
    for (const qkw of queryKeywords) {
      if (faq.keywords.some((k) => k.toLowerCase() === qkw)) {
        score += 3;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  }

  // HIGHER threshold for online — only confident matches bypass the LLM
  return bestScore >= 8 ? bestMatch : null;
}

/**
 * Match a query against cached navigation entries.
 * Returns the match or null.
 */
export function matchOfflineNavigation(query: string, cache: OfflineCache): OfflineNavEntry | null {
  if (!query || query.trim().length === 0) return null;

  const queryLower = query.toLowerCase();

  let bestMatch: OfflineNavEntry | null = null;
  let bestScore = 0;

  for (const nav of cache.navigation) {
    let score = 0;

    // Match against name
    if (queryLower.includes(nav.name.toLowerCase())) {
      score += nav.name.length * 2;
    }

    // Match against aliases
    for (const alias of nav.aliases) {
      if (queryLower.includes(alias.toLowerCase())) {
        score += alias.length;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = nav;
    }
  }

  return bestScore >= 3 ? bestMatch : null;
}

/**
 * Check if a query asks for real-time data that can't be served offline.
 */
function isRealtimeQuery(query: string): boolean {
  const queryLower = query.toLowerCase();
  for (const kw of REALTIME_KEYWORDS) {
    if (/[\u0D00-\u0D7F]/.test(kw)) {
      if (query.includes(kw)) return true;
    } else {
      if (queryLower.includes(kw)) return true;
    }
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Offline Query Handler
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Handle a user query using only offline cached data.
 * Tries: real-time check → FAQ match → navigation match → fallback.
 */
export function handleOfflineQuery(query: string, cache?: OfflineCache): OfflineResponse {
  const resolvedCache = cache || loadCache() || initializeCache();
  const stale = isCacheStale(resolvedCache);

  // 1. Check for real-time data requests
  if (isRealtimeQuery(query)) {
    return {
      matched: false,
      matchType: 'none',
      answer: '📴 Real-time information is not available offline. Please connect to the internet for live data.',
      isStale: stale,
    };
  }

  // 2. Try FAQ match
  const faqMatch = matchOfflineFAQ(query, resolvedCache);
  if (faqMatch) {
    let answer = `📴 **Offline Mode**\n\n${faqMatch.answer}`;
    if (stale) {
      answer += '\n\n⚠️ *This data may not be up to date. Connect to the internet for the latest information.*';
    }
    return {
      matched: true,
      matchType: 'faq',
      answer,
      isStale: stale,
    };
  }

  // 3. Try navigation match
  const navMatch = matchOfflineNavigation(query, resolvedCache);
  if (navMatch) {
    let answer = `📴 **Offline Mode**\n\n📍 **${navMatch.name}**\n📌 Location: ${navMatch.location}\nℹ️ ${navMatch.description}`;
    if (stale) {
      answer += '\n\n⚠️ *Data may not be up to date.*';
    }
    answer += '\n\n*For live GPS navigation, please connect to the internet.*';
    return {
      matched: true,
      matchType: 'navigation',
      answer,
      isStale: stale,
    };
  }

  // 4. No match — fallback
  return {
    matched: false,
    matchType: 'none',
    answer: '📴 This information is not available offline. Please connect to the internet to get help from LBS Bot. 🙏',
    isStale: stale,
  };
}
