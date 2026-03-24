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
    answer: 'The Principal of LBSCEK is Prof. (Dr.) Mohammad Sekoor T. Phone: 04994-250290 | Email: principal@lbscek.ac.in',
    keywords: ['principal', 'director', 'head', 'പ്രിൻസിപ്പൽ', 'principal aaru', 'mohammad sekoor', 'sekoor'],
    patterns: ['who is the principal', 'principal aaru', 'principal name', 'college principal', 'principal phone', 'principal email'],
  },

  // Departments
  {
    question: 'What departments are available?',
    answer: 'LBSCEK offers 5 B.Tech programs: Computer Science & Engineering (CSE), Electronics & Communication Engineering (ECE), Electrical & Electronics Engineering (EEE), Mechanical Engineering (ME), and Civil Engineering (CE). MCA and M.Tech programs are also available.',
    keywords: ['department', 'departments', 'course', 'program', 'branch', 'btech', 'mca', 'ഡിപ്പാർട്ട്മെന്റ്', 'വിഭാഗം', 'കോഴ്സ്', 'department ethra', 'vibhagam'],
    patterns: ['what departments', 'departments available', 'which departments', 'how many departments', 'list departments', 'what courses', 'which courses', 'btech programs', 'department entha', 'ethra department', 'courses offered'],
  },

  // HOD Information (Department-specific)
  {
    question: 'Who is the HOD of CSE?',
    answer: 'The HOD of Computer Science & Engineering (CSE) is Dr. Manoj Kumar G (Professor). Phone: 8547458075, Email: manojkumar@lbscek.ac.in',
    keywords: ['cse hod', 'cse head', 'computer science hod', 'hod cse', 'head cse', 'cse department head', 'manoj kumar g', 'സിഎസ്ഇ എച്ച്ഒഡി', 'സിഎസ്ഇ മേധാവി'],
    patterns: ['cse hod', 'cse hod name', 'who is cse hod', 'who is the hod of cse', 'hod of cse', 'cse head of department', 'head of cse department', 'cse department hod', 'computer science hod'],
  },
  {
    question: 'Who is the HOD of ECE?',
    answer: 'The HOD of Electronics & Communication Engineering (ECE) is Dr. Mary Reena K.E. (Professor). Email: eced@lbscek.ac.in',
    keywords: ['ece hod', 'ece head', 'electronics hod', 'hod ece', 'head ece', 'mary reena', 'ഇസിഇ എച്ച്ഒഡി', 'ഇസിഇ മേധാവി'],
    patterns: ['ece hod', 'ece hod name', 'who is ece hod', 'who is the hod of ece', 'hod of ece', 'ece head of department', 'ece department hod', 'electronics hod'],
  },
  {
    question: 'Who is the HOD of EEE?',
    answer: 'The HOD of Electrical & Electronics Engineering (EEE) is Prof. Jayakumar M (Associate Professor and Head of Department). Mobile: 9446463953',
    keywords: ['eee hod', 'eee head', 'electrical hod', 'hod eee', 'head eee', 'jayakumar', 'ഇഇഇ എച്ച്ഒഡി', 'ഇഇഇ മേധാവി'],
    patterns: ['eee hod', 'eee hod name', 'who is eee hod', 'who is the hod of eee', 'hod of eee', 'eee head of department', 'eee department hod', 'electrical hod'],
  },
  {
    question: 'Who is the HOD of Mechanical Engineering?',
    answer: 'The HOD of Mechanical Engineering (ME) is Dr. Manoj Kumar C.V. (Associate Professor). Mobile: 9895663157, Email: cvmanojkumar@lbscek.ac.in',
    keywords: ['mechanical hod', 'me hod', 'mech hod', 'hod mechanical', 'hod me', 'manoj kumar cv', 'മെക്കാനിക്കൽ എച്ച്ഒഡി', 'മെക്കാനിക്കൽ മേധാവി'],
    patterns: ['mechanical hod', 'me hod', 'mech hod', 'who is mechanical hod', 'who is the hod of mechanical', 'hod of mechanical', 'mechanical department hod', 'mechanical head of department'],
  },
  {
    question: 'Who is the HOD of Civil Engineering?',
    answer: 'The HOD of Civil Engineering (CE) is Dr. Anjali M S (Associate Professor). Mobile: 9496251434, Email: anjalims@lbscek.ac.in',
    keywords: ['civil hod', 'ce hod', 'hod civil', 'hod ce', 'anjali', 'സിവിൽ എച്ച്ഒഡി', 'സിവിൽ മേധാവി'],
    patterns: ['civil hod', 'ce hod', 'who is civil hod', 'who is the hod of civil', 'hod of civil', 'civil department hod', 'civil head of department'],
  },

  {
    question: 'What are the CSE department timings?',
    answer: 'The CSE department works from 9:00 AM to 4:00 PM on working days (Monday to Friday). Labs are typically available from 9:00 AM to 3:30 PM.',
    keywords: ['cse timing', 'cse time', 'cse hours', 'computer science timing', 'സിഎസ്ഇ സമയം', 'cse samayam', 'cse open'],
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
    faqs: ALL_FAQS,
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
// Keywords that signal the user is asking about a specific person/role, not a general list
const SPECIFIC_ROLE_KEYWORDS = ['hod', 'head', 'head of department', 'faculty', 'teacher', 'professor', 'staff', 'who is', 'name of',
  'മേധാവി', 'തലവൻ', 'എച്ച്ഒഡി', 'എച്ച് ഒ ഡി', 'അധ്യാപകൻ', 'അധ്യാപിക', 'ഫാക്കൽറ്റി'];

// Generic FAQ questions that should NOT match when the user asks about specific roles
const GENERIC_FAQ_QUESTIONS: string[] = [
  'what departments are available?',
  'what are the department working hours?',
  'tell me about departments & faculty (detailed)',
  'tell me about academic programs',
  'what facilities does the campus have?',
];

// --- GENERATED FAQs FROM SEED.SQL ---
// These extend the core DEFAULT_FAQS with comprehensive knowledge base entries
const GENERATED_FAQS: OfflineFAQ[] = [

  {
    question: 'Tell me about General Information',
    answer: '- **Full Name:** Lal Bahadur Shastri College of Engineering, Kasaragod\n- **Established:** 1993\n- **Management:** L B S Centre for Science and Technology (Govt. of Kerala Undertaking)\n- **Location:** Povval, Muliyar P.O., Kasaragod, Kerala - 671542 (12 km from Kasaragod town)\n- **Campus Area:** 52 acres\n- **Affiliation:** APJ Abdul Kalam Technological University (KTU)\n- **Approval:** AICTE\n- **Contact:** +91-4994-256300, +91-4994-256301\n- **Email:** principal@lbscek.ac.in, office@lbscek.ac.in, admission@lbscek.ac.in\n- **Working Hours:** 9:00 AM - 4:30 PM (Class Timings: 9:15 AM - 4:00 PM)\n- **Office Hours:** 9:00 AM - 5:00 PM (Mon-Fri), 9:00 AM - 1:00 PM (Sat)',
    keywords: ['information', 'general'],
    patterns: ['general information'],
  },
  {
    question: 'Tell me about Leadership & Administration',
    answer: '- **Principal:** Dr. Mohammad Shekoor T (Mechanical Dept) | Ph: 04994-250290\n- **Academic Dean (UG):** Dr. Praveen Kumar K (Professor, CSE) | Ph: 9447375156 | Email: praveenkodoth@lbscek.ac.in\n- **Student Affairs Dean (UG):** Dr. Vinodu George (Professor, CSE) | Ph: 9447386534 | Email: vinodu@lbscek.ac.in\n- **Administrative Officer:** Mr. Ajesh S\n- **Governing Body Chairman:** Sri. Pinarayi Vijayan (Hon. Chief Minister of Kerala)\n- **Governing Body Vice Chairperson:** Dr. R. Bindu (Hon. Minister for Higher Education)',
    keywords: ['leadership', 'administration'],
    patterns: ['leadership & administration'],
  },
  {
    question: 'Tell me about Academic Programs',
    answer: '- **B.Tech Courses:** Computer Science (CSE), Electronics (ECE), Electrical (EEE), Mechanical (ME), Civil (CE), Information Technology (IT)\n- **M.Tech Specializations:** Computer Science & Engineering, VLSI Design, Power Systems, Thermal Engineering\n- **Postgraduate:** Master of Computer Applications (MCA)\n- **Annual Intake:** 480 (UG), 18 (PG - CSE)',
    keywords: ['programs', 'academic'],
    patterns: ['academic programs'],
  },
  {
    question: 'Tell me about Departments & Faculty (Detailed)',
    answer: '### Computer Science & Engineering (CSE)\n- **HOD:** Dr. Manoj Kumar G (Professor) | Ph: 8547458075\n- **Professors:** Dr. Praveen Kumar K, Dr. Vinodu George, Dr. Jayalekshmi S\n- **Associate Professors:** Dr. Sulphikar A, Dr. Rahul C\n- **Assistant Professors:** Binoy D M Panikar, Safarunisa K M, Rajesh Kumar P M, Reema K V, Nishy Reshmi S, Lijin Das S, Krishnaprasad P K, Dr. Sarith Divakar M, Indu K B, Baby Sunitha V P, Fathimath Sameera M A, Vengayil Nayana Murali, Sajina K., Prathima A, Rasna P, Navami Aravind A, Geetha A V, Arathi S S, Sandra Mercelin\n\n### Information Technology (IT)\n- **HOD:** Dr. Anver S R (Professor)\n- **Professor:** Dr. Smithamol M B\n- **Assistant Professors:** Seena Thomas, Ayshath Sithara, Seetha Das V, Dhanyashree A S, Ramya P M, Sreejai, Nimitha Raj\n\n### Electronics & Communication (ECE)\n- **HOD:** Dr. Mary Reena K E (Professor)\n- **Professors:** Dr. Sheeba K, Dr. Pramod P\n- **Associate Professors:** Santo Mathew, Dr. Arathi T\n- **Assistant Professors:** Dr. Baiju P S, Dr. Anusree L, Dr. Anitha K, Zainaba Abdulrahiman, Vaishnavi T V\n\n### Electrical & Electronics (EEE)\n- **HOD:** Prof. Jayakumar M (Associate Professor)\n- **Professor:** Dr. Rajashree Raghavan\n- **Associate Professors:** Dr. Visalakshi V, Baby Sindhu A V, Dr. Aseem K\n- **Assistant Professors:** Dr. Sheeja V, Dr. Kannan M, Abhilash V Nair, Anish Joseph Jacob, Arun S Mathew, Mujeeb Rahuman, Seena K R\n\n### Mechanical Engineering (ME)\n- **HOD:** Dr. Manoj Kumar C V (Associate Professor)\n- **Associate Professors:** Mahesh P V, Dr. Swaraj Kumar B, Dr. Anil Kumar B C\n- **Assistant Professors:** Jowhar Mubarak, Vinod O M, Sreejith M, Prajina N V, Mukul Joseph, Latheesh Bharathan, Aswanth K, Kamaljith K\n\n### Civil Engineering (CE)\n- **HOD:** Dr. Anjali M S (Associate Professor)\n- **Assistant Professors:** Dr. Arun N R, Merlin R, Sruthi M, Sreevidya V, Jisha K V, Anjali M, Drisya M D, Athira Suresh, Sarga P Surendran\n\n### Applied Science\n- **HOD:** Prof. Vineesh Kumar K V (Mathematics)\n- **Mathematics Faculty:** Ramya M R, Smitha P, Rabiyathul Hadaviyya\n- **Chemistry Faculty:** Fathimath Ruksana A K, Dr. Dhanya Balan A P\n- **Physics Faculty:** Akhil Kumar A, Darshana N P\n- **Economics:** Jasir M H\n- **English:** Rajesh A, Vishnupriya V S\n- **Physical Education:** Prof. Joshua P Y',
    keywords: ['departments', 'detailed', 'faculty'],
    patterns: ['departments & faculty (detailed)'],
  },
  {
    question: 'Tell me about Fee Structure (2025-26 Academic Year)',
    answer: '### B.Tech Regular\n- **Merit Seat (Total):** ₹56,870/year\n- **SC/ST/OEC:** ₹1,000/year (Token amount)\n- **Fee Waiver (FW):** ₹18,620/year\n- **High Fee Seat:** ₹88,370/year\n\n### B.Tech Lateral Entry (LET)\n- **Merit Seat:** ₹49,200 + KTU Exam Fees\n- **Fee Waiver:** ₹10,950 + KTU Exam Fees\n\n### M.Tech\n- **Total Fee:** ₹44,880/year (College: ₹37,950 + KTU: ₹6,930)\n\n### Miscellaneous Fees (Included in Total)\n- **PTA Membership:** ₹5,000\n- **Union Fee:** ₹1,200\n- **Placement Fee:** ₹500\n- **Dept Association:** ₹1,000\n- **Sports Fund:** ₹250',
    keywords: ['structure', 'fee', 'academic', 'year', 'fee', 'fees', 'amount', 'pay', 'how much'],
    patterns: ['fee structure (2025-26 academic year)', 'fee ethra', 'what is the fee'],
  },
  {
    question: 'Tell me about Transportation (Bus Routes & Fees)',
    answer: '- **Total Buses:** 6 (Melparamb, Kanhangad, Kasaragod, Periya, Pallikara, Nileshwaram)\n- **Bus Fees (Student/Year):**\n  - **Pallikkara:** ₹11,910 (Pickup 8:10 AM)\n  - **Bekal:** ₹11,180 (Pickup 8:15 AM)\n  - **Palakkunnu:** ₹10,530 (Pickup 8:20 AM)\n  - **Uduma:** ₹10,060 (Pickup 8:25 AM)\n  - **Kalanadu:** ₹9,420 (Pickup 8:30 AM)\n  - **Melparamba:** ₹8,960 (Pickup 8:35 AM)\n  - **Chaliyancode:** ₹8,580 (Pickup 8:40 AM)\n  - **Chemnad:** ₹8,500 (Pickup 8:45 AM)\n  - **Kasaragod:** ₹8,400 (Pickup 8:50 AM)\n  - **Vidya Nagar:** ₹5,630 (Pickup 8:55 AM)\n  - **Nalam Mile:** ₹4,530 (Pickup 9:00 AM)\n  - **Cherkala:** ₹3,420 (Pickup 9:05 AM)',
    keywords: ['bus', 'fees', 'routes', 'transportation', 'fee', 'fees', 'amount', 'pay', 'how much', 'bus', 'transport', 'route'],
    patterns: ['transportation (bus routes & fees)', 'fee ethra', 'what is the fee', 'bus route', 'bus fee', 'bus list'],
  },
  {
    question: 'Tell me about Facilities & Infrastructure',
    answer: '- **Central Library:** 25,000+ books, 5,000+ e-journals. Open 8:30 AM - 8:00 PM.\n- **Hostels:** Men\'\'s (300 capacity) & Ladies\'\' "Shahanas" (200 capacity).\n- **Hostel Fees:** ~₹9,250 (General), ~₹2,250 (SC/ST).\n- **Computing:** 8 Labs, 400+ Systems, 1 Gbps NKN Connectivity.\n- **Sports:** Football ground, Cricket pitch, Indoor stadium, Gym.\n- **Other:** Canteen (South/North Indian), ATM (Central Bank), Co-operative Store, Medical Room, LBS Makerspace.',
    keywords: ['infrastructure', 'facilities'],
    patterns: ['facilities & infrastructure'],
  },
  {
    question: 'Tell me about Placements',
    answer: '- **Highest Package:** ₹12 LPA (2023 Batch)\n- **Average Package:** ₹4.5 LPA\n- **Placement Rate:** 85% of eligible students\n- **Top Recruiters:** TCS, Infosys, Wipro, Cognizant, Tech Mahindra, Bosch, BYJU\'\'S, Gadgeon',
    keywords: ['placements'],
    patterns: ['placements'],
  },
  {
    question: 'Tell me about Student Clubs (IEDC & Technical)',
    answer: '- **MULEARN:** Peer learning platform for skills.\n- **TINKERHUB:** Community for makers and innovators.\n- **FOSS CLUB:** Free and Open Source Software community.\n- **CYBER COMMUNITY:** Ethical hacking and cybersecurity.\n- **GALAXIA:** Space science and astronomy club.\n- **GDG on Campus:** Google Developer Group for Web/AI/Cloud.\n- **WOMEN TECH MAKERS (WTM):** Empowering women in technology.\n- **AWS CLOUD CLUB:** Amazon Web Services and cloud computing.\n- **KBA CHAPTER:** Kerala Blockchain Academy student chapter.\n- **CODERS CLUB:** Programming and problem-solving community.\n- **IEEE, CSI, ISTE, SAE:** Professional technical body chapters.',
    keywords: ['clubs', 'iedc', 'technical', 'student'],
    patterns: ['student clubs (iedc & technical)'],
  },
  {
    question: 'Tell me about Admission & Documents Required',
    answer: '- **Entrance Exam:** KEAM (Kerala Engineering Architecture Medical) score is mandatory for B.Tech.\n- **Eligibility:** 10+2 with minimum 50% marks in Physics, Chemistry, and Mathematics.\n- **Documents Checklist:**\n  - KEAM Rank Card & Admit Card.\n  - 10th & 12th Mark Sheets/Certificates.\n  - Transfer Certificate (TC) & Conduct Certificate.\n  - Passport size photos.\n  - Migration Certificate (if from boards other than Kerala State).\n- **NRI Admission:** Requires separate eligibility checks and additional documents.',
    keywords: ['required', 'documents', 'admission'],
    patterns: ['admission & documents required'],
  },
  {
    question: 'Tell me about Academic Regulations & Discipline',
    answer: '- **Attendance:** Minimum 75% attendance required in each subject to appear for university exams.\n- **Dress Code:** Formal dress code is mandatory for students.\n- **Ragging:** Strictly prohibited. Criminal offence punishable by suspension/dismissal.\n- **Schedule:**\n  - Odd Semester: July - December.\n  - Even Semester: January - May.\n  - Summer Vacation: Typically May-June.',
    keywords: ['discipline', 'regulations', 'academic'],
    patterns: ['academic regulations & discipline'],
  },
  {
    question: 'Tell me about Specific Facility Details',
    answer: '- **Banking:**\n  - **Branch:** Central Bank of India (Campus Branch) is located near the Fluid Mechanics Lab but is **temporarily closed**.\n  - **ATM:** Available near the college main gate/entrance.\n- **Specialized Labs:**\n  - **Mechanical:** CAD/CAM Lab, Fluid Mechanics Lab, Workshop.\n  - **CSE/IT:** Networking Lab, Project Labs, Internet Lab.\n  - **Electronics:** DSP Lab, VLSI Lab.\n- **Library Staff:**\n  - **Librarian:** Mr. Vinod Kumar K T.\n  - **Librarian Grade IV:** Mrs. Beena Varghese.\n- **Physical Education:**\n  - **Assistant Professor:** Prof. Joshua P Y.',
    keywords: ['specific', 'facility', 'details'],
    patterns: ['specific facility details'],
  },
  {
    question: 'Tell me about Student Projects & Publications',
    answer: '- **Projects:**\n  - **Mini Project:** Conducted in the 3rd year.\n  - **Major Project:** Conducted in the final year.\n  - **Support:** Faculty guides assigned; labs available for extended hours.\n- **College Magazine:** Annual publication featuring student articles, poems, artwork, and academic achievements.\n- **Tech Fest:** \'\'TECHSURGE\'\' (Annual).\n- **Cultural Fest:** \'\'RHYTHM\'\' (Annual).',
    keywords: ['projects', 'publications', 'student'],
    patterns: ['student projects & publications'],
  },
  {
    question: 'Tell me about Detailed Location Context (For Navigation)',
    answer: '- **"Where is the Mechanical Dept?"** -> Beside the football ground, along LBS Ground Road.\n- **"Where is the CSE Dept?"** -> Uphill from the main academic block, near the library and Shahanas hostel.\n- **"Where is the Canteen?"** -> Downhill from the main academic block.\n- **"Where is the PG Block?"** -> Near the Fluid Mechanics Lab and Central Bank building.\n- **"Where is the Makerspace?"** -> Near the Administrative building and Computer Lab.',
    keywords: ['detailed', 'location', 'navigation', 'context'],
    patterns: ['detailed location context (for navigation)'],
  },
  {
    question: 'Tell me about Detailed Bus Fee Structure (Staff & Students)',
    answer: '- **Pallikkara Route:**\n  - Student Fee: ₹11,910/year\n  - Staff Fee: ₹14,810/year\n- **Bekal Route:**\n  - Student Fee: ₹11,180/year\n  - Staff Fee: ₹13,860/year\n- **Palakkunnu Route:**\n  - Student Fee: ₹10,530/year\n  - Staff Fee: ₹13,130/year\n- **Uduma Route:**\n  - Student Fee: ₹10,060/year\n  - Staff Fee: ₹12,500/year\n- **Kalanadu Route:**\n  - Student Fee: ₹9,420/year\n  - Staff Fee: ₹11,660/year\n- **Melparamba Route:**\n  - Student Fee: ₹8,960/year\n  - Staff Fee: ₹11,240/year\n- **Chaliyancode Route:**\n  - Student Fee: ₹8,580/year\n  - Staff Fee: ₹10,710/year\n- **Chemnad Route:**\n  - Student Fee: ₹8,500/year\n  - Staff Fee: ₹10,290/year\n- **Kasaragod Route:**\n  - Student Fee: ₹8,400/year\n  - Staff Fee: ₹10,200/year\n- **Vidya Nagar Route:**\n  - Student Fee: ₹5,630/year\n  - Staff Fee: ₹6,930/year\n- **Nalam Mile Route:**\n  - Student Fee: ₹4,530/year\n  - Staff Fee: ₹5,570/year\n- **Cherkala Route:**\n  - Student Fee: ₹3,420/year\n  - Staff Fee: ₹4,200/year',
    keywords: ['structure', 'detailed', 'staff', 'students', 'bus', 'fee', 'fee', 'fees', 'amount', 'pay', 'how much', 'bus', 'transport', 'route'],
    patterns: ['detailed bus fee structure (staff & students)', 'fee ethra', 'what is the fee', 'bus route', 'bus fee', 'bus list'],
  },
  {
    question: 'Tell me about Administrative Staff',
    answer: '- **Administrative Officer:** Mr. Ajesh S\n- **Senior Superintendent:** Mr. Santhosh Kumar K\n- **Junior Superintendent:** Mrs. Shaina Pacha\n- **Head Accountant:** Mr. Aneesh Mohan C S\n- **LBS Centre Member Secretary:** Prof. (Dr.) M. Abdul Rahiman\n- **Board of Governors Chairman:** Prof. M. Thamban Nair',
    keywords: ['staff', 'administrative'],
    patterns: ['administrative staff'],
  },
  {
    question: 'Tell me about Detailed Club Missions',
    answer: '- **MULEARN:** Innovative learning platform offering personalized educational experiences via adaptive technology.\n- **TINKERHUB:** Community of tinkerers and makers empowering people to innovate.\n- **FOSS CLUB:** Promotes "Free and Open Source Software"; focuses on learning, sharing, and contributing the open way.\n- **CYBER COMMUNITY:** Focuses on practical cybersecurity, ethical hacking, and responsible technology use.\n- **Microsoft Learn Student Ambassadors (MLSA):** Global initiative to empower students as campus leaders in tech (Azure, AI, Power Platform).\n- **CODERS CLUB:** The hub for programming; helps beginners take first steps and challenges advanced learners.\n- **GALAXIA:** Dedicated to space science, astronomy, and space technology.\n- **GDG on Campus:** Community for developers interested in Google technologies (Web, Mobile, Cloud, AI).\n- **KBA CHAPTER (Blockchain):** Official Kerala Blockchain Academy chapter; promotes awareness of decentralized technologies.\n- **WOW (Women of Wonder):** Inclusive space for women to voice ideas, showcase talents, and inspire positive change.\n- **AWS CLOUD CLUB:** Student-led community for learning Amazon Web Services and cloud computing.',
    keywords: ['missions', 'detailed', 'club'],
    patterns: ['detailed club missions'],
  },
  {
    question: 'Tell me about Campus Landmarks & Directions',
    answer: '- **Main Roads:** LBS Campus Road, LBS Ground Road, L.B.S Road.\n- **Academic Block:** Central building along LBS Campus Road.\n- **Football Ground:** Large open ground near the Mechanical Dept.\n- **Fluid Mechanics Lab:** Located along LBS Ground Road, near the PG Section.\n- **Central Bank Building:** Located near the Fluid Mechanics Lab (temporarily closed).\n- **Makerspace:** Located near the Administrative Building and Computer Lab.',
    keywords: ['landmarks', 'directions', 'campus'],
    patterns: ['campus landmarks & directions'],
  },
  {
    question: 'Tell me about Placement Training Specifics',
    answer: '- **Training Cell:** Dedicated Training & Placement Cell with a full-time coordinator.\n- **Programs:**\n  - Aptitude training.\n  - Technical workshops.\n  - Mock interviews.\n  - Group Discussion (GD) sessions.\n  - Guidance for GATE, CAT, GRE, TOEFL.\n- **Internships:** Facilitates summer internships with stipends in reputed companies.',
    keywords: ['placement', 'specifics', 'training'],
    patterns: ['placement training specifics'],
  },
  {
    question: 'Tell me about Miscellaneous',
    answer: '- **Campus Banking:** While the branch is closed, fee payments are fully digital/online.\n- **Educational Loans:** Assistance provided for loan documentation.\n- **Insurance:** Student accident insurance coverage is provided.\n- **Health Camps:** Regular health check-up camps are organized.\n- **Counseling:** Mental health counseling services available for students.',
    keywords: ['miscellaneous'],
    patterns: ['miscellaneous'],
  },
  {
    question: 'Tell me about Detailed M.Tech Fee Breakdown (2025-26)',
    answer: '- **Tuition Fee:** ₹24,000\n- **Caution Deposit (Refundable):** ₹5,000\n- **Establishment Charges:** ₹2,000\n- **Admission Fee:** ₹1,000\n- **Library Fee:** ₹1,000\n- **Professional Bodies Fee:** ₹1,000\n- **Online Academic Management Fee:** ₹450\n- **Special Fee:** ₹350\n- **KTU Fees:**\n  - Examination Fee: ₹4,300\n  - Administration Fee: ₹1,050\n  - Affiliation Fee: ₹1,050\n  - Arts & Sports Fee: ₹530',
    keywords: ['breakdown', 'fee', 'tech', 'detailed', 'fee', 'fees', 'amount', 'pay', 'how much'],
    patterns: ['detailed m.tech fee breakdown (2025-26)', 'fee ethra', 'what is the fee'],
  },
  {
    question: 'Tell me about Lab Infrastructure & Software',
    answer: '- **Licensed Software:** MATLAB, AutoCAD, ANSYS, Oracle.\n- **Lab Access:** 8:30 AM to 8:00 PM (open all days including weekends during project work).\n- **Internet:** High-speed internet via National Knowledge Network (NKN).\n- **Systems:** 400+ computers across 8 labs.',
    keywords: ['lab', 'software', 'infrastructure'],
    patterns: ['lab infrastructure & software'],
  },
  {
    question: 'Tell me about Hostel Living & Amenities',
    answer: '- **Room Types:** Single, double, and triple sharing rooms available.\n- **Mess Details:** Separate vegetarian and non-vegetarian mess available.\n- **Cuisine:** North Indian and South Indian food options.\n- **Security:** 24/7 security, CCTV surveillance, and warden supervision.\n- **Visiting:** Parents can visit on weekends with prior permission.\n- **Facilities:** Wi-Fi, reading room, TV room, indoor games, gym, laundry.',
    keywords: ['living', 'hostel', 'amenities', 'hostel', 'room', 'mess', 'accommodation'],
    patterns: ['hostel living & amenities', 'hostel details', 'hostel available'],
  },
  {
    question: 'Tell me about Cultural & Hobby Clubs (Non-Technical)',
    answer: '- **Music Club:** For musical talents and events.\n- **Dance Club:** Organizes dance performances and competitions.\n- **Drama Club:** Focuses on theater and acting.\n- **Fine Arts Club:** Promotes painting, sketching, and other arts.\n- **Literary Club:** For debates, writing, and literature.\n- **Photography Club:** For photography enthusiasts.\n- **Nature Club:** Focuses on environmental awareness and activities.\n- **Entrepreneurship Cell:** Foster startup culture.',
    keywords: ['non', 'technical', 'clubs', 'hobby', 'cultural'],
    patterns: ['cultural & hobby clubs (non-technical)'],
  },
  {
    question: 'Tell me about Fee Payment & Banking',
    answer: '- **Payment Mode:** Online payment available through the college portal.\n- **ATM:** Available near the college entrance.\n- **Bank Branch:** Central Bank of India (Campus Branch) - *Temporarily Closed*.\n- **Loans:** Assistance provided for educational loan documentation.',
    keywords: ['payment', 'fee', 'banking', 'fee', 'fees', 'amount', 'pay', 'how much'],
    patterns: ['fee payment & banking', 'fee ethra', 'what is the fee'],
  },
  {
    question: 'Tell me about Campus Events & Festivals',
    answer: '- **Tech Fest:** \'\'TECHSURGE\'\' - Annual technical festival featuring hackathons, coding competitions, and project exhibitions.\n- **Cultural Fest:** \'\'RHYTHM\'\' - Annual cultural festival for arts, music, dance, and drama.\n- **Sports Meet:** Annual sports meet and inter-collegiate tournaments.\n- **Department Days:** Specific celebrations organized by each engineering department.\n- **Project Exhibition:** Annual showcase of student major and mini projects.\n- **Observances:** Teachers\'\' day, Onam, Christmas, and Eid celebrations.',
    keywords: ['events', 'festivals', 'campus'],
    patterns: ['campus events & festivals'],
  },
  {
    question: 'Tell me about Library Resources (Detailed)',
    answer: '- **Books:** Over 25,000 volumes.\n- **Journals:** 100+ print journals and 5,000+ e-journals.\n- **Digital Access:**\n  - DELNET (Developing Library Network).\n  - National Digital Library (NDL).\n  - IEEE Xplore digital library access.\n- **Facilities:** Reference section, reading rooms, digital library terminals, photocopying/reprographic services.',
    keywords: ['library', 'resources', 'detailed'],
    patterns: ['library resources (detailed)'],
  },
  {
    question: 'Tell me about Sports Facilities (Detailed)',
    answer: '- **Main Stadium:** College main stadium on campus.\n- **Playground:** Large ground suitable for football and cricket.\n- **Indoor Stadium:** Multi-purpose facility for badminton, table tennis, and chess.\n- **Courts:** Volleyball and basketball courts available.\n- **Gymnasium:** Well-equipped gym with a trainer.\n- **Coaching:** Professional coaching available for major sports teams.',
    keywords: ['facilities', 'detailed', 'sports'],
    patterns: ['sports facilities (detailed)'],
  },
  {
    question: 'Tell me about Ragging Prevention',
    answer: '- **Policy:** Zero Tolerance towards ragging.\n- **Helpline:** National Anti-Ragging Helpline 1800-180-5522.\n- **Committees:**\n  - Anti-Ragging Committee (Faculty & Administration).\n  - Anti-Ragging Squad (Monitors campus spots).\n- **Consequences:** Suspension or dismissal for perpetrators.\n- **Freshers:** Separate induction and orientation programs to ensure safety.',
    keywords: ['prevention', 'ragging'],
    patterns: ['ragging prevention'],
  },
  {
    question: 'Tell me about Campus Connectivity',
    answer: '- **Internet:** 1 Gbps backbone connectivity via NKN (National Knowledge Network).\n- **Wi-Fi:** Campus-wide access in academic blocks and hostels.\n- **Access:** Free for students and staff for academic purposes.\n- **Computer Center:** Central facility for browsing and research.',
    keywords: ['connectivity', 'campus'],
    patterns: ['campus connectivity'],
  },
  {
    question: 'Tell me about History of Expansion',
    answer: '- **Original Area:** Started with 20,000 sq.ft. of built-up area.\n- **Current Area:** Expanded to 2.5 lakh sq.ft.\n- **Land:** 52 acres provided by Plantation Corporation Kerala.\n- **Timeline:**\n  - 1993: Established.\n  - 1995: Moved to current campus.\n  - 2000: IT branch started.\n  - 2008: Civil Engineering branch started.\n  - 2013-15: PG programs (M.Tech) added.',
    keywords: ['history', 'expansion'],
    patterns: ['history of expansion'],
  },
  {
    question: 'Tell me about Admission Categories',
    answer: '- **Government Quota:** Admission through KEAM counseling.\n- **Management Quota:** Available as per government norms.\n- **NRI Quota:** 15% seats reserved; requires separate application.\n- **Lateral Entry:** Direct second-year admission for Diploma holders.\n- **Special Reservations:** Sports quota, differently-abled quota (Saksham), and community-based reservations (SC/ST/OEC).',
    keywords: ['categories', 'admission'],
    patterns: ['admission categories'],
  },
  {
    question: 'Tell me about Useful Contacts (Summary)',
    answer: '- **Principal:** 04994-250290\n- **Office:** 04994-256300\n- **Fax:** 04994-256302\n- **Academic Dean (CSE):** 9447375156\n- **Student Affairs Dean:** 9447386534\n- **CSE HOD:** 8547458075',
    keywords: ['summary', 'useful', 'contacts'],
    patterns: ['useful contacts (summary)'],
  },
  {
    question: 'Tell me about Governing Body & High-Level Administration',
    answer: '- **Chairman (Governing Body):** Sri. Pinarayi Vijayan (Hon. Chief Minister of Kerala)\n- **Vice Chairperson (Governing Body):** Dr. R. Bindu (Hon. Minister for Higher Education)\n- **Chairperson (Executive Committee):** Dr. Sharmila Mary Joseph IAS (Principal Secretary)\n- **Member Secretary (LBS Centre):** Prof. (Dr.) M. Abdul Rahiman\n- **Chairman (Board of Governors):** Prof. M. Thamban Nair',
    keywords: ['governing', 'body', 'administration', 'level', 'high'],
    patterns: ['governing body & high-level administration'],
  },
  {
    question: 'Tell me about Detailed Miscellaneous Fee Breakdown (B.Tech)',
    answer: '- **Total Miscellaneous Fee:** ₹9,800 (One-time/Annual as applicable)\n- **PTA Membership Fee:** ₹5,000\n- **College Union Fee:** ₹1,200\n- **Department Association Fee:** ₹1,000\n- **Career Guidance & Placement Fee:** ₹500\n- **Co-operative Society (Kit + ID Card):** ₹1,650\n- **Sports Development Fund:** ₹250\n- **Series Examination Fee:** ₹200',
    keywords: ['detailed', 'tech', 'miscellaneous', 'fee', 'breakdown', 'fee', 'fees', 'amount', 'pay', 'how much'],
    patterns: ['detailed miscellaneous fee breakdown (b.tech)', 'fee ethra', 'what is the fee'],
  },
  {
    question: 'Tell me about Bus Pickup Schedule (Morning)',
    answer: '- **Pallikkara:** 8:10 AM\n- **Bekal:** 8:15 AM\n- **Palakkunnu:** 8:20 AM\n- **Uduma:** 8:25 AM\n- **Kalanadu:** 8:30 AM\n- **Melparamba:** 8:35 AM\n- **Chaliyancode:** 8:40 AM\n- **Chemnad:** 8:45 AM\n- **Kasaragod:** 8:50 AM\n- **Vidya Nagar:** 8:55 AM\n- **Nalam Mile:** 9:00 AM\n- **Cherkala:** 9:05 AM',
    keywords: ['bus', 'morning', 'schedule', 'pickup', 'bus', 'transport', 'route'],
    patterns: ['bus pickup schedule (morning)', 'bus route', 'bus fee', 'bus list'],
  },
  {
    question: 'Tell me about Campus Navigation: Landmarks',
    answer: '- **LBS Campus Road:** The main road running through the campus.\n- **Main Academic Block:** Located centrally along LBS Campus Road.\n- **Library:** Located "uphill" from the main academic block.\n- **CSE Department:** Located "uphill" near the Library and Shahanas Hostel.\n- **Canteen:** Located "downhill" from the main academic block.\n- **Mechanical Department:** Located beside the football ground along LBS Ground Road.\n- **Fluid Mechanics Lab:** Located along LBS Ground Road.\n- **PG Section:** Near the Fluid Mechanics Lab.',
    keywords: ['navigation', 'landmarks', 'campus'],
    patterns: ['campus navigation: landmarks'],
  },
  {
    question: 'Tell me about IEDC Club Descriptions: Learning & Making',
    answer: '- **MULEARN:** A peer learning platform using adaptive technology for personalized education.\n- **TINKERHUB:** A community of tinkerers and makers passionate about innovation.\n- **FOSS CLUB:** Promotes Free and Open Source Software, focusing on "learning, sharing, and contributing the open way."',
    keywords: ['club', 'iedc', 'descriptions', 'making', 'learning'],
    patterns: ['iedc club descriptions: learning & making'],
  },
  {
    question: 'Tell me about IEDC Club Descriptions: Coding & Cyber',
    answer: '- **CYBER COMMUNITY:** Focuses on practical cybersecurity, ethical hacking, and responsible tech use; emphasizes "learning-by-doing."\n- **CODERS CLUB:** The hub for programming; helps beginners and challenges advanced learners with coding competitions.\n- **MSA (Microsoft Learn Student Ambassadors):** Provides access to Microsoft resources (Azure, AI) and mentorship to build campus leaders.',
    keywords: ['coding', 'club', 'iedc', 'descriptions', 'cyber'],
    patterns: ['iedc club descriptions: coding & cyber'],
  },
  {
    question: 'Tell me about IEDC Club Descriptions: Specialized Tech',
    answer: '- **GALAXIA:** The official space club dedicated to astronomy and space technology.\n- **GDG on Campus:** Google Developer Groups community for Web, Mobile, AI/ML, and Cloud technologies.\n- **AWS CLOUD CLUB:** Student-led community for learning Amazon Web Services and cloud computing.\n- **KBA CHAPTER:** Kerala Blockchain Academy chapter promoting decentralized technology awareness.',
    keywords: ['club', 'iedc', 'descriptions', 'tech', 'specialized'],
    patterns: ['iedc club descriptions: specialized tech'],
  },
  {
    question: 'Tell me about IEDC Club Descriptions: Social & Innovation',
    answer: '- **YIP CLUB:** Part of the Young Innovators Programme (K-DISC) to create solutions for sustainable development.\n- **WOW (Women of Wonder):** Empowers women through creativity, leadership, and social impact.\n- **WOMEN TECH MAKERS (WTM):** Google\'\'s program to provide visibility and resources for women in technology.',
    keywords: ['club', 'innovation', 'iedc', 'descriptions', 'social'],
    patterns: ['iedc club descriptions: social & innovation'],
  },
  {
    question: 'Tell me about CSE Faculty List (Complete)',
    answer: '- **Professors:** Dr. Manoj Kumar G (HOD), Dr. Praveen Kumar K (Dean), Dr. Vinodu George (Dean), Dr. Jayalekshmi S.\n- **Associate Professors:** Dr. Sulphikar A, Dr. Rahul C.\n- **Assistant Professors:** Binoy D M Panikar, Safarunisa K M, Rajesh Kumar P M, Reema K V, Nishy Reshmi S, Lijin Das S, Krishnaprasad P K, Dr. Sarith Divakar M, Indu K B, Baby Sunitha V P, Fathimath Sameera M A, Vengayil Nayana Murali, Sajina K., Prathima A, Rasna P, Navami Aravind A, Geetha A V, Arathi S S, Sandra Mercelin.',
    keywords: ['complete', 'list', 'cse', 'faculty'],
    patterns: ['cse faculty list (complete)'],
  },
  {
    question: 'Tell me about IT Faculty List (Complete)',
    answer: '- **HOD:** Dr. Anver S R (Professor).\n- **Professor:** Dr. Smithamol M B.\n- **Assistant Professors:** Seena Thomas, Ayshath Sithara, Seetha Das V, Dhanyashree A S, Ramya P M, Sreejai, Nimitha Raj.',
    keywords: ['complete', 'list', 'faculty'],
    patterns: ['it faculty list (complete)'],
  },
  {
    question: 'Tell me about Mechanical Faculty List (Complete)',
    answer: '- **HOD:** Dr. Manoj Kumar C V (Associate Professor).\n- **Associate Professors:** Mahesh P V, Dr. Swaraj Kumar B, Dr. Anil Kumar B C.\n- **Assistant Professors:** Jowhar Mubarak, Vinod O M, Sreejith M, Prajina N V, Mukul Joseph, Latheesh Bharathan, Aswanth K, Kamaljith K.',
    keywords: ['faculty', 'complete', 'list', 'mechanical'],
    patterns: ['mechanical faculty list (complete)'],
  },
  {
    question: 'Tell me about EEE Faculty List (Complete)',
    answer: '- **HOD:** Prof. Jayakumar M (Associate Professor).\n- **Professor:** Dr. Rajashree Raghavan.\n- **Associate Professors:** Dr. Visalakshi V, Baby Sindhu A V, Dr. Aseem K.\n- **Assistant Professors:** Dr. Sheeja V, Dr. Kannan M, Abhilash V Nair, Anish Joseph Jacob, Arun S Mathew, Mujeeb Rahuman, Seena K R.',
    keywords: ['faculty', 'complete', 'list', 'eee'],
    patterns: ['eee faculty list (complete)'],
  },
  {
    question: 'Tell me about ECE Faculty List (Complete)',
    answer: '- **HOD:** Dr. Mary Reena K E (Professor).\n- **Professors:** Dr. Sheeba K, Dr. Pramod P.\n- **Associate Professors:** Santo Mathew, Dr. Arathi T.\n- **Assistant Professors:** Dr. Baiju P S, Dr. Anusree L, Dr. Anitha K, Zainaba Abdulrahiman, Vaishnavi T V.',
    keywords: ['ece', 'complete', 'list', 'faculty'],
    patterns: ['ece faculty list (complete)'],
  },
  {
    question: 'Tell me about Civil Faculty List (Complete)',
    answer: '- **HOD:** Dr. Anjali M S (Associate Professor).\n- **Assistant Professors:** Dr. Arun N R, Merlin R, Sruthi M, Sreevidya V, Jisha K V, Anjali M, Drisya M D, Athira Suresh, Sarga P Surendran.',
    keywords: ['complete', 'list', 'civil', 'faculty'],
    patterns: ['civil faculty list (complete)'],
  },
  {
    question: 'Tell me about Applied Science Faculty List (Complete)',
    answer: '- **Mathematics:** Prof. Vineesh Kumar K V (HOD), Ramya M R, Smitha P, Rabiyathul Hadaviyya.\n- **Chemistry:** Fathimath Ruksana A K, Dr. Dhanya Balan A P.\n- **Physics:** Akhil Kumar A, Darshana N P.\n- **Economics:** Jasir M H.\n- **English:** Rajesh A, Vishnupriya V S.',
    keywords: ['faculty', 'science', 'applied', 'complete', 'list'],
    patterns: ['applied science faculty list (complete)'],
  },
  {
    question: 'Tell me about Office & Library Staff',
    answer: '- **Administrative Officer:** Mr. Ajesh S.\n- **Senior Superintendent:** Mr. Santhosh Kumar K.\n- **Junior Superintendent:** Mrs. Shaina Pacha.\n- **Head Accountant:** Mr. Aneesh Mohan C S.\n- **Librarian:** Mr. Vinod Kumar K T.\n- **Librarian Grade IV:** Mrs. Beena Varghese.\n- **Physical Education:** Prof. Joshua P Y.',
    keywords: ['library', 'staff', 'office'],
    patterns: ['office & library staff'],
  },
  {
    question: 'Tell me about Detailed Hostel Fees',
    answer: '- **General Category:** ₹9,250 per year.\n- **Reserved Category (SC/ST/OEC):** ₹2,250 per year.\n- **Policy:** Hostel fees are optional and apply equally to Regular and Lateral Entry students.',
    keywords: ['fees', 'hostel', 'detailed', 'fee', 'fees', 'amount', 'pay', 'how much', 'hostel', 'room', 'mess', 'accommodation'],
    patterns: ['detailed hostel fees', 'fee ethra', 'what is the fee', 'hostel details', 'hostel available'],
  },
  {
    question: 'Tell me about Hostel Facilities & Mess',
    answer: '- **Capacity:** 300 (Boys), 200 (Girls - Shahanas Hostel).\n- **Mess:** Separate Vegetarian and Non-Vegetarian mess halls.\n- **Food Type:** North Indian and South Indian dishes available.\n- **Amenities:** Wi-Fi, Gym, TV room, Indoor games, Laundry.\n- **Medical:** First aid facility and tie-ups with nearby hospitals.',
    keywords: ['mess', 'facilities', 'hostel', 'hostel', 'room', 'mess', 'accommodation'],
    patterns: ['hostel facilities & mess', 'hostel details', 'hostel available'],
  },
  {
    question: 'Tell me about M.Tech Fee Components (Detailed)',
    answer: '- **Admission Fee:** ₹1,000\n- **Tuition Fee:** ₹24,000\n- **Special Fee:** ₹350\n- **Caution Deposit:** ₹5,000\n- **Establishment Charges:** ₹2,000\n- **Library Fees:** ₹1,000\n- **Professional Bodies:** ₹1,000\n- **Online Academic Mgmt:** ₹450\n- **KTU Exam Fee:** ₹4,300',
    keywords: ['components', 'fee', 'tech', 'detailed', 'fee', 'fees', 'amount', 'pay', 'how much'],
    patterns: ['m.tech fee components (detailed)', 'fee ethra', 'what is the fee'],
  },
  {
    question: 'Tell me about Academic Calendar & Timing',
    answer: '- **College Hours:** 9:00 AM to 4:30 PM (Mon-Fri).\n- **Class Hours:** 9:15 AM to 4:00 PM.\n- **Lunch Break:** 1:00 PM to 1:45 PM.\n- **Library (Weekdays):** 8:30 AM to 8:00 PM.\n- **Library (Saturday):** 8:30 AM to 5:00 PM.\n- **Library (Sunday):** 10:00 AM to 4:00 PM.\n- **Computer Center:** 8:30 AM to 8:00 PM (All days).',
    keywords: ['calendar', 'timing', 'academic'],
    patterns: ['academic calendar & timing'],
  },
  {
    question: 'Tell me about Admission Eligibility & Process',
    answer: '- **B.Tech:** 10+2 with 50% in Physics, Chemistry, Maths + KEAM Rank.\n- **Lateral Entry:** Diploma holders eligible for 2nd year.\n- **NRI Quota:** 15% seats reserved; separate docs required.\n- **Documents:** KEAM Rank/Admit Card, 10th/12th Marksheets, TC, Conduct Cert, Photos.\n- **Application Dates:** KEAM usually opens Jan; Counseling June-July.',
    keywords: ['process', 'eligibility', 'admission'],
    patterns: ['admission eligibility & process'],
  },
  {
    question: 'Tell me about Scholarships & Financial Aid',
    answer: '- **E-Grantz:** For SC/ST/OEC/SEBC categories.\n- **MCM Scholarship:** Merit-cum-Means for minority communities.\n- **Pragati Scholarship:** AICTE scheme for girls.\n- **Saksham Scholarship:** AICTE scheme for differently-abled.\n- **TFW:** Tuition Fee Waiver for meritorious low-income students.',
    keywords: ['financial', 'aid', 'scholarships'],
    patterns: ['scholarships & financial aid'],
  },
  {
    question: 'Tell me about Anti-Ragging Measures',
    answer: '- **Policy:** Zero Tolerance.\n- **Helpline:** 1800-180-5522.\n- **Squad:** Faculty squads monitor the campus.\n- **Surveillance:** CCTV monitoring active.\n- **Action:** Suspension or dismissal for offenders.',
    keywords: ['anti', 'measures', 'ragging'],
    patterns: ['anti-ragging measures'],
  },
  {
    question: 'Tell me about History & Infrastructure Growth',
    answer: '- **Established:** 1993 (Temporary building), 1995 (Current campus).\n- **Land:** 52 acres given by Plantation Corporation Kerala at Povval.\n- **Expansion:** Started with 20,000 sq.ft.; now 2.5 lakh sq.ft.\n- **Affiliation Change:** Calicut U (1993-96) -> Kannur U (1996-2015) -> KTU (2015-Present).',
    keywords: ['history', 'infrastructure', 'growth'],
    patterns: ['history & infrastructure growth'],
  },
  {
    question: 'Tell me about Placements & Training',
    answer: '- **Placement Cell:** Full-time coordinator available.\n- **Training:** Aptitude, Technical, Mock Interviews, GD sessions.\n- **Stats:** 85% placement rate; Highest Package ₹12 LPA; Avg ₹4.5 LPA.\n- **Recruiters:** TCS, Infosys, Wipro, Cognizant, Tech Mahindra, Bosch, BYJU\'\'S.\n- **Higher Studies:** Guidance for GATE, CAT, GRE, TOEFL.',
    keywords: ['placements', 'training'],
    patterns: ['placements & training'],
  },
  {
    question: 'Tell me about Sports & Fitness Details',
    answer: '- **Main Ground:** Football & Cricket.\n- **Indoor Stadium:** Badminton, Table Tennis, Chess.\n- **Gym:** Well-equipped with trainer.\n- **Courts:** Volleyball, Basketball.\n- **Events:** Annual Sports Meet, Inter-collegiate tournaments.',
    keywords: ['details', 'fitness', 'sports'],
    patterns: ['sports & fitness details'],
  },
  {
    question: 'Tell me about Library Resources',
    answer: '- **Books:** 25,000+ volumes.\n- **Journals:** 100+ print, 5000+ e-journals.\n- **Digital:** DELNET, NDL, IEEE Xplore access.\n- **Services:** Reference, Circulation, Reprography (Photocopy).',
    keywords: ['library', 'resources'],
    patterns: ['library resources'],
  },
  {
    question: 'Tell me about Campus Connectivity',
    answer: '- **Internet:** 1 Gbps via NKN (National Knowledge Network).\n- **Wi-Fi:** Available in academic blocks and hostels.\n- **Access:** Free for academic purposes.',
    keywords: ['connectivity', 'campus'],
    patterns: ['campus connectivity'],
  },
  {
    question: 'Tell me about Student Projects',
    answer: '- **Mini Project:** 3rd Year.\n- **Major Project:** Final Year.\n- **Funding:** Support for innovative projects.\n- **Exhibition:** Annual project exhibition.',
    keywords: ['projects', 'student'],
    patterns: ['student projects'],
  },
  {
    question: 'Tell me about Canteen Details',
    answer: '- **Location:** Downhill from Academic Block.\n- **Timings:** 8:00 AM to 5:00 PM.\n- **Menu:** Breakfast, Lunch, Snacks (Veg & Non-Veg).\n- **Pricing:** Subsidized rates for students/staff.',
    keywords: ['canteen', 'details'],
    patterns: ['canteen details'],
  },
  {
    question: 'Tell me about Co-operative Store',
    answer: '- **Items:** Textbooks, Practical Records, Drawing Instruments, Stationery.\n- **Services:** Photostat, Binding.\n- **Rates:** Discounted for students.',
    keywords: ['store', 'operative'],
    patterns: ['co-operative store'],
  },
  {
    question: 'Tell me about Medical Facilities',
    answer: '- **On-Campus:** First aid room with trained nurse.\n- **Off-Campus:** Tie-ups with nearby hospitals for emergencies.\n- **Insurance:** Student accident insurance provided.',
    keywords: ['facilities', 'medical'],
    patterns: ['medical facilities'],
  },
  {
    question: 'Tell me about Banking',
    answer: '- **ATM:** Near college entrance.\n- **Branch:** Central Bank of India (Campus Branch) - Temporarily Closed.\n- **Digital:** All fee payments are online.',
    keywords: ['banking'],
    patterns: ['banking'],
  },
  {
    question: 'Tell me about Cultural Activities',
    answer: '- **Festivals:** \'\'RHYTHM\'\' (Cultural), \'\'TECHSURGE\'\' (Technical).\n- **Clubs:** Music, Dance, Drama, Fine Arts, Literary, Photography, Nature.\n- **Magazine:** Annual college magazine published.',
    keywords: ['cultural', 'activities'],
    patterns: ['cultural activities'],
  },
  {
    question: 'Tell me about Entrepreneurship (IEDC)',
    answer: '- **Cell:** Entrepreneurship Development Cell (EDC).\n- **Activities:** Workshops, Business Plan Competitions, Mentoring.\n- **Incubation:** Guidance for funding and startups.',
    keywords: ['entrepreneurship', 'iedc'],
    patterns: ['entrepreneurship (iedc)'],
  },
  {
    question: 'Tell me about Alumni Association',
    answer: '- **Name:** LBSCEKAA.\n- **Network:** Alumni in Google, Microsoft, Amazon, etc.\n- **Contribution:** Scholarships, placement support, guest lectures.',
    keywords: ['association', 'alumni'],
    patterns: ['alumni association'],
  },
  {
    question: 'Tell me about Research',
    answer: '- **PhD Centers:** CSE and Mechanical Engineering departments.\n- **Focus:** Active research in engineering/tech; funded projects.',
    keywords: ['research'],
    patterns: ['research'],
  },
  {
    question: 'Tell me about Transport: Fee Comparison',
    answer: '- **Pallikkara:** Student ₹11,910 vs Staff ₹14,810.\n- **Kasaragod:** Student ₹8,400 vs Staff ₹10,200.\n- **Cherkala:** Student ₹3,420 vs Staff ₹4,200.',
    keywords: ['comparison', 'transport', 'fee', 'fee', 'fees', 'amount', 'pay', 'how much'],
    patterns: ['transport: fee comparison', 'fee ethra', 'what is the fee'],
  },
  {
    question: 'Tell me about B.Tech Fee Variations',
    answer: '- **Merit Seat:** ₹56,870.\n- **High Fee Seat:** ₹88,370.\n- **Lateral Entry (Merit):** ₹49,200.\n- **Lateral Entry (FW):** ₹10,950.',
    keywords: ['variations', 'fee', 'tech', 'fee', 'fees', 'amount', 'pay', 'how much'],
    patterns: ['b.tech fee variations', 'fee ethra', 'what is the fee'],
  },
  {
    question: 'Tell me about Nearby Tourist Spots',
    answer: '- **Bekal Fort:** ~45 km.\n- **Kappil Beach:** ~35 km.\n- **Madhur Temple:** ~25 km.\n- **Parappa Wildlife:** ~50 km.',
    keywords: ['nearby', 'spots', 'tourist'],
    patterns: ['nearby tourist spots'],
  },
  {
    question: 'Tell me about Makerspace Details',
    answer: '- **Location:** Near Admin Block/Computer Lab.\n- **Purpose:** Innovation, prototyping, project work.\n- **Equipment:** Tools for electronics and mechanical projects.',
    keywords: ['details', 'makerspace'],
    patterns: ['makerspace details'],
  },
  {
    question: 'Tell me about Bus Garage',
    answer: '- **Location:** Parking area along LBS Campus Road.\n- **Usage:** Parking for the 6 college buses.',
    keywords: ['bus', 'garage', 'bus', 'transport', 'route'],
    patterns: ['bus garage', 'bus route', 'bus fee', 'bus list'],
  },
  {
    question: 'Tell me about PG Section Building',
    answer: '- **Location:** Near Fluid Mechanics Lab / Central Bank.\n- **Programs:** Houses MCA and other PG courses.',
    keywords: ['section', 'building'],
    patterns: ['pg section building'],
  },
  {
    question: 'Tell me about Holidays',
    answer: '- **Type:** Follows Kerala Government and University holidays.\n- **Major:** Onam, Christmas, Eid.\n- **Vacation:** Summer break typically in May-June.',
    keywords: ['holidays'],
    patterns: ['holidays'],
  },
  {
    question: 'Tell me about Dress Code',
    answer: '- **Requirement:** Formal dress code mandated for students.\n- **Focus:** Maintaining academic decorum.',
    keywords: ['code', 'dress'],
    patterns: ['dress code'],
  },
  {
    question: 'Tell me about Attendance',
    answer: '- **Requirement:** Minimum 75% per subject required for exams.\n- **Discipline:** Strictly monitored.',
    keywords: ['attendance'],
    patterns: ['attendance'],
  },
  {
    question: 'Tell me about Contact Emails',
    answer: '- **Principal:** principal@lbscek.ac.in\n- **Office:** office@lbscek.ac.in\n- **Admissions:** admission@lbscek.ac.in',
    keywords: ['emails', 'contact'],
    patterns: ['contact emails'],
  },
  {
    question: 'Tell me about CSE Dean Contacts',
    answer: '- **Academic Dean:** Dr. Praveen Kumar K (9447375156).\n- **Student Affairs Dean:** Dr. Vinodu George (9447386534).',
    keywords: ['dean', 'contacts', 'cse'],
    patterns: ['cse dean contacts'],
  },
  {
    question: 'Tell me about CSE HOD Contact',
    answer: '- **Name:** Dr. Manoj Kumar G.\n- **Phone:** 8547458075.\n- **Email:** manojkumar@lbscek.ac.in',
    keywords: ['contact', 'cse', 'hod'],
    patterns: ['cse hod contact'],
  },
  {
    question: 'Tell me about Faculty Qualifications',
    answer: '- **Level:** 90% of faculty hold M.Tech or Ph.D degrees.\n- **Experience:** Average 10+ years teaching experience.',
    keywords: ['qualifications', 'faculty'],
    patterns: ['faculty qualifications'],
  },
  {
    question: 'Tell me about Vision Statement',
    answer: '- **Text:** "To become a paragon institution for pursuance of Education and Research in Engineering and Technology."',
    keywords: ['statement', 'vision'],
    patterns: ['vision statement'],
  },
  {
    question: 'Tell me about Mission Statement',
    answer: '- **Point 1:** Impart finest quality Technical Education & Training.\n- **Point 2:** Nurture a vision of Sustainable development.\n- **Point 3:** Bequeath it to the next generation of professionals.',
    keywords: ['statement', 'mission'],
    patterns: ['mission statement'],
  },
  {
    question: 'Tell me about Industry Collaborations',
    answer: '- **Goal:** Enhance practical exposure, internships, and placements.\n- **Areas:** Software, Mechanical, Electronics.\n- **Activities:** Guest lectures, industrial visits.',
    keywords: ['industry', 'collaborations'],
    patterns: ['industry collaborations'],
  },
  {
    question: 'Tell me about Student Editorial Board',
    answer: '- **Role:** Manages the annual college magazine.\n- **Guidance:** Faculty guided.',
    keywords: ['board', 'editorial', 'student'],
    patterns: ['student editorial board'],
  },
  {
    question: 'Tell me about Safety for Freshers',
    answer: '- **Program:** Separate induction and orientation.\n- **Monitoring:** Anti-ragging squad active.',
    keywords: ['freshers', 'safety'],
    patterns: ['safety for freshers'],
  },
  {
    question: 'Tell me about Digital Library',
    answer: '- **Access:** 24/7 online resource access.\n- **Content:** Journals, papers, e-books.',
    keywords: ['digital', 'library'],
    patterns: ['digital library'],
  },
  {
    question: 'Tell me about Fee Payment Method',
    answer: '- **Method:** Online payment through college portal.\n- **Cash:** Generally not accepted for main fees (Digital campus).',
    keywords: ['method', 'payment', 'fee', 'fee', 'fees', 'amount', 'pay', 'how much'],
    patterns: ['fee payment method', 'fee ethra', 'what is the fee'],
  },
  {
    question: 'Tell me about Common Titles / Honorifics (Malayalam)',
    answer: '- **ശ്രീ (Sri):** ശ്രീമാൻ (Mr.) - Respectful title for men\n- **ശ്രീമതി (Smt.):** വിവാഹിതയായ സ്ത്രീ (Mrs.) - Married woman\n- **കു. (Kum.):** കുമാരി (Miss) - Unmarried woman\n- **ഡോ. (Dr.):** ഡോക്ടർ (Doctor)\n- **പ്രൊ. (Prof.):** പ്രൊഫസർ (Professor)\n- **അഡ്വ. (Adv.):** അഡ്വക്കേറ്റ് (Advocate / Lawyer)\n- **ഇം. / എഞ്ചി. (Eng.):** എഞ്ചിനീയർ (Engineer)\n- **ശ്രീമാൻ / ശ്രീമതി:** Respectful forms used before names',
    keywords: ['titles', 'common', 'malayalam', 'honorifics'],
    patterns: ['common titles / honorifics (malayalam)'],
  },
  {
    question: 'Tell me about Degree & Course Abbreviations',
    answer: '- **B.Tech:** Bachelor of Technology\n- **B.E:** Bachelor of Engineering\n- **M.Tech:** Master of Technology\n- **MCA:** Master of Computer Applications\n- **Diploma:** Polytechnic Diploma',
    keywords: ['degree', 'course', 'abbreviations'],
    patterns: ['degree & course abbreviations'],
  },
  {
    question: 'Tell me about Branch Abbreviations (Very Common)',
    answer: '- **CSE:** Computer Science & Engineering\n- **CS:** Computer Science\n- **IT:** Information Technology\n- **ECE:** Electronics & Communication Engineering\n- **EEE:** Electrical & Electronics Engineering\n- **ME:** Mechanical Engineering\n- **CE:** Civil Engineering\n- **AI:** Artificial Intelligence\n- **AI & DS:** Artificial Intelligence & Data Science\n- **ML:** Machine Learning\n- **Robotics:** Robotics Engineering',
    keywords: ['branch', 'common', 'very', 'abbreviations'],
    patterns: ['branch abbreviations (very common)'],
  },
  {
    question: 'Tell me about College / Academic Terms',
    answer: '- **HOD:** Head of Department\n- **HoI / Principal:** Head of Institution\n- **FY:** First Year\n- **SY:** Second Year\n- **TY:** Third Year\n- **Final Year:** Fourth Year\n- **Sem:** Semester\n- **Lab:** Laboratory\n- **Intern:** Internship\n- **Project:** Final Year Project\n- **Credits:** Academic credit points',
    keywords: ['academic', 'terms', 'college'],
    patterns: ['college / academic terms'],
  },
  {
    question: 'Tell me about Exams & Evaluation Terms',
    answer: '- **IA:** Internal Assessment\n- **CIA:** Continuous Internal Assessment\n- **End Sem / ES:** End Semester Exam\n- **KT / ATKT:** Keep Term / Allowed To Keep Term\n- **CGPA:** Cumulative Grade Point Average\n- **SGPA:** Semester Grade Point Average\n- **Backlog:** Failed subject that needs to be cleared',
    keywords: ['exams', 'evaluation', 'terms'],
    patterns: ['exams & evaluation terms'],
  },
  {
    question: 'Tell me about Training & Placement Terms',
    answer: '- **T&P:** Training & Placement\n- **CRT:** Campus Recruitment Training\n- **Internship:** Industrial Training\n- **PPO:** Pre-Placement Offer\n- **On-Campus:** Placement through college\n- **Off-Campus:** Placement outside college',
    keywords: ['placement', 'training', 'terms'],
    patterns: ['training & placement terms'],
  },
  {
    question: 'Tell me about Latest News & Updates (as of February 2026)',
    answer: '- **College Union Election 2025-26:** Election to College Union scheduled for **February 20, 2026**. University Notification dated 08-02-2026. Refer to University Statute, Election Manual, and Lyngdoh Committee Report for details. More info: https://lbscek.ac.in/election-to-college-union-2/\n- **Quotations & Tenders:** Sealed competitive quotations invited for supply of equipment to Microprocessor lab (Jan 2026).\n- **Mobile Passport Seva:** Mobile Passport Seva camp conducted at college (Sep 2025).\n- **Newly Introduced Courses:** New courses introduced for 2025-26 academic year (Aug 2025).\n- **Non KEAM Admission 2025:** Spot admissions open for Non-KEAM candidates (Aug 2025).\n- **Kerala Govt 5th 100 Days Programme:** Five major projects inaugurated at LBSCEK by Higher Education Minister (Jun 2025).\n- **M.Tech Sponsored Seats:** Applications invited for M.Tech sponsored seats 2025-26 (May 2025).\n- **SigmaPower:** EEE department event for aspiring engineering students (May 2025).\n- **NRI Admission 2025:** Applications for B.Tech NRI seats in Civil, Mechanical, EEE, ECE (May 2025).\n- **Government Educational Institution Status:** LBSCEK officially granted Government Educational Institution status by Kerala Government (May 2025).\n- **KEAM Mock Test 2025:** Free KEAM mock test conducted at college (Mar 2025).\n- **Deepa Memorial Hall:** EEE Seminar Hall renamed as Deepa Memorial Hall (Dec 2025).\n- **FDP on AI in VLSI:** Faculty Development Program on "Exploring the Opportunities of AI in VLSI Systems" by ECE Dept (Nov 2025).\n- **IEDC Summit \'\'25:** IEDC Summit tender notice (Nov 2025).\n- **News Source:** https://lbscek.ac.in/news-and-updates/',
    keywords: ['updates', 'latest', 'february', 'news'],
    patterns: ['latest news & updates (as of february 2026)'],
  },
  {
    question: 'Tell me about Website Directory (Official Pages & Links)',
    answer: '### Institution\n- **Homepage:** https://lbscek.ac.in/\n- **About Us:** https://lbscek.ac.in/about-us/\n- **College Map:** https://lbscek.ac.in/college-map/\n- **Mandatory Disclosure:** https://lbscek.ac.in/mandatory-disclosure/\n- **AICTE Orders:** https://lbscek.ac.in/aicte-orders/\n- **NBA Accreditation Process:** https://lbscek.ac.in/nba-accreditation-process/\n- **Special Rule:** https://lbscek.ac.in/special-rule/\n- **Audit Reports:** https://lbscek.ac.in/audit-reports/\n- **Student Verification:** https://lbscek.ac.in/student-verification/\n- **Quotations & Tenders:** https://lbscek.ac.in/quotations-and-tenders/\n- **Anti Ragging Cell:** https://lbscek.ac.in/anti-ragging-cell/\n- **AICTE Online Skill Test:** https://lbscek.ac.in/aicte-online-skill-test/\n- **AICTE Feedback:** https://lbscek.ac.in/aicte-feedback/\n- **Grievance Cell:** https://lbscek.ac.in/grievance-cell/\n\n### Administration\n- **Board of Governors:** https://lbscek.ac.in/board-of-governors/\n- **Director:** https://lbscek.ac.in/director/\n- **Principal:** https://lbscek.ac.in/principal/\n- **UG Dean:** https://lbscek.ac.in/ug-dean/\n- **Dean Research & Development:** https://lbscek.ac.in/dean-research-development/\n- **Internal Compliance Committee:** https://lbscek.ac.in/internal-compliance-committee/\n- **IQAC:** https://lbscek.ac.in/internal-quality-assurance-cell-iqac/\n- **Administrative Wing:** https://lbscek.ac.in/administrative-wing/\n- **Right to Information (RTI):** https://lbscek.ac.in/right-to-information/\n\n### Admission\n- **Admission Process:** https://lbscek.ac.in/admission-procedure/\n- **KEAM Admission:** https://lbscek.ac.in/admission-keam/\n- **NRI Scheme:** https://lbscek.ac.in/nri-scheme/\n- **Lateral Entry Scheme:** https://lbscek.ac.in/lateral-entry-scheme/\n- **Non-KEAM Admission:** https://lbscek.ac.in/non-keam-admission/\n- **Fee Waiver Scheme:** https://lbscek.ac.in/fee-waiver-scheme/\n- **Fee Structure:** https://lbscek.ac.in/fee-structure/\n\n### Academics\n- **Departments Overview:** https://lbscek.ac.in/departments/\n- **Programs Overview:** https://lbscek.ac.in/programs/\n- **Syllabus:** https://lbscek.ac.in/syllabus/\n- **Academic Calendar:** https://lbscek.ac.in/academic-calendar/\n- **Downloads:** https://lbscek.ac.in/downloads/\n\n### Departments\n- **CSE:** https://lbscek.ac.in/computer-science-engineering-2/\n- **Mechanical Engineering:** https://lbscek.ac.in/mechanical-engineering/\n- **EEE:** https://lbscek.ac.in/electrical-electronics-engineering/\n- **ECE:** https://lbscek.ac.in/electronics-communication-engineering/\n- **Civil Engineering:** https://lbscek.ac.in/civil-engineering/\n- **Applied Science:** https://lbscek.ac.in/applied-science/\n- **Physical Education:** https://lbscek.ac.in/physical-education/\n\n### Activities & Organizations\n- **CGPU (Career Guidance):** https://lbscek.ac.in/career-guidance-placement-unit-cgpu/\n- **Alumni Association:** https://lbscek.ac.in/alumni-association/\n- **NSS:** https://lbscek.ac.in/national-service-scheme/\n- **PTA:** https://lbscek.ac.in/parent-teacher-association/\n- **Continuing Education Cell:** https://lbscek.ac.in/continuing-education-cell/\n- **IEDC:** https://lbscek.ac.in/iedc/\n- **Industry Institute Interaction:** https://lbscek.ac.in/industry-institute-interaction/\n- **IEEE:** https://lbscek.ac.in/ieee/\n- **College Union:** https://lbscek.ac.in/college-union/\n\n### Facilities\n- **Central Library:** https://lbscek.ac.in/central-library/\n- **Digital Library:** https://lbscek.ac.in/digital-library/\n- **Central Computing Facility:** https://lbscek.ac.in/central-computing-facility/\n- **AICTE IDEA Lab:** https://lbscek.ac.in/aicte-idea-lab/\n- **Hostel:** https://lbscek.ac.in/hostel/\n- **Bus Service:** https://lbscek.ac.in/bus-service/\n- **ATM Facility:** https://lbscek.ac.in/atm-facility/\n- **Student Co-Operative Society:** https://lbscek.ac.in/student-co-operative-society/\n- **Fab Lab Facility:** https://lbscek.ac.in/fab-lab-facility/\n- **Skill Delivery Platform:** https://lbscek.ac.in/skill-delivery-platform/\n\n### Fee Payment\n- **Annual/Admission Fee:** https://lbscek.ac.in/annual-admission-fee/\n- **Exam/Other Fee Payment:** https://lbscek.ac.in/exam-other-fee-payment/\n- **Semester Registration Online:** https://lbscek.ac.in/semester-registration-online/\n- **Hostel Rent:** https://lbscek.ac.in/hostel-rent/\n\n### Contact\n- **Contact Us:** https://lbscek.ac.in/contact-2/',
    keywords: ['pages', 'official', 'links', 'directory', 'website'],
    patterns: ['website directory (official pages & links)'],
  },
  {
    question: 'Tell me about Academic Performance & Results',
    answer: '- **University Exam Results:** Published by APJ Abdul Kalam Technological University (KTU)\n- **Result Access:** Available through KTU portal and college website\n- **Revaluation:** Students can apply for revaluation within specified dates\n- **Grade System:** CGPA-based evaluation system (10-point scale)\n- **Pass Percentage:** Consistently above 85% across departments\n- **Toppers:** Department toppers recognized annually with awards',
    keywords: ['performance', 'results', 'academic'],
    patterns: ['academic performance & results'],
  },
  {
    question: 'Tell me about Examination Cell',
    answer: '- **Hall Ticket:** Distributed before each semester exam\n- **Exam Schedule:** Published 2 weeks before exams\n- **Malpractice:** Strict action taken as per university rules\n- **Supplementary Exams:** Conducted for failed subjects\n- **Series Tests:** Conducted regularly (3-4 per semester)\n- **Model Exams:** Conducted before university exams',
    keywords: ['examination', 'cell'],
    patterns: ['examination cell'],
  },
  {
    question: 'Tell me about Research & Development Cell',
    answer: '- **Dean R&D:** Dr. [Name] (Contact via college)\n- **Focus Areas:** AI/ML, IoT, Renewable Energy, Automation\n- **Funded Projects:** Multiple AICTE/DST/KSCSTE funded projects\n- **Publications:** Faculty publish in SCI/Scopus indexed journals\n- **Conferences:** Students encouraged to present papers\n- **Patent Filing:** Support provided for innovative ideas',
    keywords: ['development', 'cell', 'research'],
    patterns: ['research & development cell'],
  },
  {
    question: 'Tell me about International Collaborations',
    answer: '- **MOUs:** With foreign universities for student exchange\n- **Study Abroad:** Guidance for GRE/TOEFL/IELTS\n- **Virtual Exchange:** Online collaboration with international institutions\n- **Foreign Faculty:** Occasional visiting faculty from abroad',
    keywords: ['international', 'collaborations'],
    patterns: ['international collaborations'],
  },
  {
    question: 'Tell me about Startup Ecosystem',
    answer: '- **IEDC Activities:** Regular bootcamps, ideathons, pitch sessions\n- **Funding Support:** Guidance for KSUM/IEDC funding\n- **Incubation:** Pre-incubation support available on campus\n- **Success Stories:** Alumni-founded startups in various sectors\n- **Mentorship:** Industry mentors assigned to startup teams',
    keywords: ['startup', 'ecosystem'],
    patterns: ['startup ecosystem'],
  },
  {
    question: 'Tell me about Social Outreach Programs',
    answer: '- **NSS Activities:**\n    - Blood donation camps\n    - Village adoption programs\n    - Literacy drives\n    - Environmental awareness campaigns\n- **Community Service:** Regular visits to orphanages, old age homes\n- **Disaster Relief:** Active participation during floods/calamities',
    keywords: ['programs', 'outreach', 'social'],
    patterns: ['social outreach programs'],
  },
  {
    question: 'Tell me about Environmental Initiatives',
    answer: '- **Green Campus:** Tree plantation drives regularly conducted\n- **Waste Management:** Segregation of waste (wet/dry/e-waste)\n- **Solar Power:** Solar panels installed in select buildings\n- **Rain Water Harvesting:** Systems installed across campus\n- **Plastic-Free Campus:** Single-use plastic banned\n- **Energy Conservation:** Awareness programs conducted',
    keywords: ['environmental', 'initiatives'],
    patterns: ['environmental initiatives'],
  },
  {
    question: 'Tell me about Student Counseling & Mental Health',
    answer: '- **Professional Counselor:** Available on specific days\n- **Confidential Sessions:** One-on-one counseling provided\n- **Peer Support:** Student volunteers trained for basic support\n- **Workshops:** Stress management, time management sessions\n- **Crisis Helpline:** Contact numbers available 24/7',
    keywords: ['health', 'mental', 'counseling', 'student'],
    patterns: ['student counseling & mental health'],
  },
  {
    question: 'Tell me about Skill Development Programs',
    answer: '- **Technical Training:**\n    - Python, Java, C++ programming\n    - Web development (HTML, CSS, JS, React)\n    - Mobile app development (Android/iOS)\n    - Cloud computing (AWS, Azure)\n    - Data Science & Analytics\n- **Soft Skills:**\n    - Communication skills\n    - Presentation skills\n    - Leadership training\n    - Teamwork & collaboration\n- **Aptitude Training:** Quantitative, Logical, Verbal\n- **Foreign Language:** Basic courses in German/French',
    keywords: ['programs', 'skill', 'development'],
    patterns: ['skill development programs'],
  },
  {
    question: 'Tell me about Industrial Training & Visits',
    answer: '- **Industrial Visits:** Organized for all departments annually\n- **Companies Visited:** Major companies in respective domains\n- **In-Plant Training:** Mandatory training during vacations\n- **Duration:** 2-4 weeks typically\n- **Documentation:** Report submission and presentation required',
    keywords: ['training', 'industrial', 'visits'],
    patterns: ['industrial training & visits'],
  },
  {
    question: 'Tell me about Professional Body Memberships',
    answer: '- **IEEE Student Chapter:** Active with regular events\n- **CSI (Computer Society of India):** Student chapter operational\n- **ISTE (Indian Society for Technical Education):** Faculty & student members\n- **SAE (Society of Automotive Engineers):** For Mechanical students\n- **IEI (Institution of Engineers India):** Corporate/student members\n- **IETE (Institution of Electronics):** For ECE/EEE students',
    keywords: ['memberships', 'professional', 'body'],
    patterns: ['professional body memberships'],
  },
  {
    question: 'Tell me about Laboratory Facilities (Detailed by Department)',
    answer: '- **CSE/IT Labs:**\n    - Programming Lab (C, C++, Java)\n    - Data Structures Lab\n    - Database Management Lab\n    - Computer Networks Lab\n    - Operating Systems Lab\n    - Web Technology Lab\n    - Software Engineering Lab\n    - Project Lab\n- **ECE Labs:**\n    - Electronics Workshop\n    - Digital Electronics Lab\n    - Microprocessor & Microcontroller Lab\n    - Communication Systems Lab\n    - VLSI Design Lab\n    - DSP Lab\n    - Embedded Systems Lab\n- **EEE Labs:**\n    - Electrical Machines Lab\n    - Power Systems Lab\n    - Control Systems Lab\n    - Power Electronics Lab\n    - Measurements & Instrumentation Lab\n    - High Voltage Engineering Lab\n- **Mechanical Labs:**\n    - Workshop (Fitting, Welding, Machining)\n    - Fluid Mechanics Lab\n    - Thermal Engineering Lab\n    - Strength of Materials Lab\n    - CAD/CAM Lab\n    - Metrology Lab\n    - Dynamics Lab\n- **Civil Labs:**\n    - Surveying Lab\n    - Concrete & Highway Materials Lab\n    - Soil Mechanics Lab\n    - Structural Analysis Lab\n    - Environmental Engineering Lab\n    - CAD Lab',
    keywords: ['laboratory', 'department', 'facilities', 'detailed'],
    patterns: ['laboratory facilities (detailed by department)'],
  },
  {
    question: 'Tell me about Student Achievement Recognition',
    answer: '- **Merit Certificates:** For academic excellence\n- **Sports Achievements:** Recognized at university/state/national level\n- **Technical Competitions:** Winners felicitated\n- **Cultural Events:** Best performers awarded\n- **Leadership Awards:** For union/club office bearers\n- **Best Outgoing Student:** Annual award',
    keywords: ['recognition', 'achievement', 'student'],
    patterns: ['student achievement recognition'],
  },
  {
    question: 'Tell me about Parent Engagement',
    answer: '- **PTA Meetings:** Conducted twice per semester\n- **Progress Reports:** Shared with parents regularly\n- **Parent Portal:** Online access to attendance, marks\n- **Grievance Redressal:** Parents can raise concerns\n- **Parental Consent:** Required for industrial visits, tours',
    keywords: ['parent', 'engagement'],
    patterns: ['parent engagement'],
  },
  {
    question: 'Tell me about Discipline & Code of Conduct',
    answer: '- **Identity Card:** Mandatory to wear on campus\n- **Attendance Marking:** Biometric/manual system\n- **Late Coming:** Penalized after grace period\n- **Unauthorized Absence:** Requires prior permission\n- **Dress Code Violations:** Warning/disciplinary action\n- **Ragging:** Zero tolerance; criminal case filed\n- **Substance Abuse:** Strictly prohibited; leads to expulsion',
    keywords: ['discipline', 'conduct', 'code'],
    patterns: ['discipline & code of conduct'],
  },
  {
    question: 'Tell me about Semester-wise Activities (Typical Calendar)',
    answer: '- **Semester 1 (July-December):**\n    - Induction program for first years\n    - Onam celebrations (Aug/Sep)\n    - Technical fest participation\n    - Series tests (Sep, Oct, Nov)\n    - End semester exams (Nov/Dec)\n- **Semester 2 (January-May):**\n    - Republic Day celebrations (Jan)\n    - Department days\n    - Cultural fest RHYTHM\n    - Tech fest TECHSURGE\n    - Series tests (Feb, Mar, Apr)\n    - Project reviews\n    - End semester exams (Apr/May)',
    keywords: ['activities', 'semester', 'wise', 'typical', 'calendar'],
    patterns: ['semester-wise activities (typical calendar)'],
  },
  {
    question: 'Tell me about Hostel Discipline & Rules',
    answer: '- **Curfew Timing:** 9:00 PM on weekdays, 10:00 PM on weekends\n- **Outpass System:** Required for leaving hostel\n- **Visitors:** Allowed in visitor rooms only, restricted timings\n- **Mess Timings:**\n    - Breakfast: 7:30-9:00 AM\n    - Lunch: 12:30-2:00 PM\n    - Snacks: 4:00-5:00 PM\n    - Dinner: 7:30-9:00 PM\n- **Room Inspection:** Regular inspections by warden\n- **Electricity Usage:** Restricted timing for high-power appliances',
    keywords: ['discipline', 'rules', 'hostel', 'hostel', 'room', 'mess', 'accommodation'],
    patterns: ['hostel discipline & rules', 'hostel details', 'hostel available'],
  },
  {
    question: 'Tell me about Campus Security',
    answer: '- **Security Personnel:** 24/7 presence at entry/exit points\n- **CCTV Surveillance:** Comprehensive coverage across campus\n- **Visitor Register:** Mandatory for all external visitors\n- **Vehicle Parking:** Separate parking for two-wheelers and four-wheelers\n- **Emergency Response:** Security trained for emergency situations\n- **Night Patrol:** Regular patrolling during night hours',
    keywords: ['security', 'campus'],
    patterns: ['campus security'],
  },
  {
    question: 'Tell me about Transportation Safety',
    answer: '- **Driver Training:** Professional drivers with valid licenses\n- **Vehicle Maintenance:** Regular servicing and fitness checks\n- **GPS Tracking:** Buses equipped with GPS\n- **Female Attendant:** Present in ladies\'\' buses\n- **Emergency Contact:** Bus coordinator contact shared with students\n- **Route Timings:** Strictly adhered to',
    keywords: ['safety', 'transportation', 'bus', 'transport', 'route'],
    patterns: ['transportation safety', 'bus route', 'bus fee', 'bus list'],
  },
  {
    question: 'Tell me about Digital Learning Platforms',
    answer: '- **LMS (Learning Management System):** Online course materials\n- **Google Classroom:** Used by many faculty\n- **NPTEL:** Access to NPTEL courses\n- **Coursera/edX:** Institutional partnerships for certifications\n- **YouTube EDU:** Curated educational content\n- **Virtual Labs:** For remote practical learning',
    keywords: ['platforms', 'digital', 'learning'],
    patterns: ['digital learning platforms'],
  },
  {
    question: 'Tell me about Assessment & Evaluation Pattern',
    answer: '- **Continuous Internal Assessment (CIA):**\n    - CIA 1: 15 marks (Test + Assignment)\n    - CIA 2: 15 marks (Test + Seminar)\n    - CIA 3: 20 marks (Test + Attendance)\n    - Total Internal: 50 marks\n- **End Semester Exam:** 50 marks\n- **Total per Subject:** 100 marks\n- **Practical Evaluation:** Continuous + Final practical exam\n- **Project Evaluation:** Multiple reviews + final viva',
    keywords: ['assessment', 'evaluation', 'pattern'],
    patterns: ['assessment & evaluation pattern'],
  },
  {
    question: 'Tell me about Campus Recruitment Process',
    answer: '- **Pre-Placement Talk (PPT):** Company introduction\n- **Eligibility Criteria:** Based on CGPA, backlogs\n- **Aptitude Test:** Online/offline written test\n- **Group Discussion:** For some companies\n- **Technical Interview:** Subject knowledge assessment\n- **HR Interview:** Final round\n- **Offer Letter:** Issued post selection',
    keywords: ['process', 'recruitment', 'campus'],
    patterns: ['campus recruitment process'],
  },
  {
    question: 'Tell me about Career Development Services',
    answer: '- **Resume Building:** Workshops conducted\n- **LinkedIn Profile:** Guidance for professional networking\n- **Mock Interviews:** Regular practice sessions\n- **Career Counseling:** One-on-one guidance\n- **Industry Talks:** Guest lectures by industry experts\n- **Certification Guidance:** For relevant technical certifications',
    keywords: ['services', 'career', 'development'],
    patterns: ['career development services'],
  },
  {
    question: 'Tell me about Alumni Network & Support',
    answer: '- **Alumni Portal:** Online platform for alumni\n- **Annual Alumni Meet:** Organized every year\n- **Alumni Mentorship:** Seniors guide juniors\n- **Job Referrals:** Alumni help in placements\n- **Guest Lectures:** Alumni share industry experience\n- **Funding Support:** Alumni contribute to scholarships',
    keywords: ['support', 'network', 'alumni'],
    patterns: ['alumni network & support'],
  },
  {
    question: 'Tell me about International Student Support (if applicable)',
    answer: '- **Visa Assistance:** Guidance for foreign students\n- **Cultural Orientation:** Help with local adaptation\n- **Language Support:** Basic Malayalam/Hindi classes\n- **Special Mess Facilities:** International cuisine on request\n- **Festival Celebrations:** Inclusive environment',
    keywords: ['international', 'applicable', 'support', 'student'],
    patterns: ['international student support (if applicable)'],
  },
  {
    question: 'Tell me about Differently-abled Student Support',
    answer: '- **Saksham Scholarship:** AICTE scheme available\n- **Accessible Infrastructure:** Ramps, accessible washrooms\n- **Special Seating:** Preferential seating in class/exam halls\n- **Scribe Facility:** For visually impaired students\n- **Assistive Technology:** Screen readers, special keyboards\n- **Dedicated Support Staff:** For assistance when needed',
    keywords: ['support', 'abled', 'differently', 'student'],
    patterns: ['differently-abled student support'],
  },
  {
    question: 'Tell me about Fee Refund Policy',
    answer: '- **Before Admission Confirmation:** Full refund minus processing fee\n- **After 15 days of Admission:** 50% refund\n- **After 30 days:** No refund of tuition fee\n- **Caution Deposit:** Refunded after course completion\n- **Hostel Fee:** Pro-rata refund if vacated mid-year',
    keywords: ['refund', 'fee', 'policy', 'fee', 'fees', 'amount', 'pay', 'how much'],
    patterns: ['fee refund policy', 'fee ethra', 'what is the fee'],
  },
  {
    question: 'Tell me about Transfer & Migration',
    answer: '- **Transfer Certificate (TC):** Issued within 15 days of request\n- **Migration Certificate:** For students from other state boards\n- **No Objection Certificate (NOC):** Required for job/higher studies\n- **Course Completion Certificate:** Issued post final year\n- **Provisional Certificate:** Until original degree arrives',
    keywords: ['transfer', 'migration'],
    patterns: ['transfer & migration'],
  },
  {
    question: 'Tell me about Scholarship Application Process',
    answer: '- **E-Grantz Portal:** Online application for SC/ST/OEC\n- **Documents Required:** Income certificate, caste certificate, bank details\n- **Deadline:** Usually September-October\n- **Verification:** College verifies and forwards\n- **Disbursement:** Directly to student bank account',
    keywords: ['process', 'scholarship', 'application'],
    patterns: ['scholarship application process'],
  },
  {
    question: 'Tell me about Exam Fee Structure',
    answer: '- **Regular Exam Fee:** ₹600-800 per semester (approx.)\n- **Revaluation Fee:** ₹300-400 per subject\n- **Supplementary Exam Fee:** ₹500-700 per subject\n- **Thesis/Project Evaluation Fee:** ₹1000-1500\n- **Duplicate Mark Sheet:** ₹200-300',
    keywords: ['structure', 'fee', 'exam', 'fee', 'fees', 'amount', 'pay', 'how much'],
    patterns: ['exam fee structure', 'fee ethra', 'what is the fee'],
  },
  {
    question: 'Tell me about ID Card & Student Records',
    answer: '- **ID Card Issue:** Within first month of joining\n- **Replacement Fee:** ₹200-300 for lost/damaged card\n- **Bonafide Certificate:** Free for students, issued on request\n- **Mark Sheets:** Issued after each semester\n- **Degree Certificate:** Original issued after convocation',
    keywords: ['card', 'records', 'student'],
    patterns: ['id card & student records'],
  },
  {
    question: 'Tell me about Campus Facilities: Advanced Details',
    answer: '- **Auditorium:** 500-seater capacity for events\n- **Seminar Halls:** Multiple halls with projection facilities\n- **Conference Room:** For meetings and video conferences\n- **Staff Rooms:** Department-wise faculty rooms\n- **Student Common Rooms:** Separate for boys and girls\n- **Medical Room:** First aid and basic treatment',
    keywords: ['advanced', 'details', 'facilities', 'campus'],
    patterns: ['campus facilities: advanced details'],
  },
  {
    question: 'Tell me about Sports Facilities: Equipment & Coaching',
    answer: '- **Equipment Store:** Sports equipment available on request\n- **Coaching:** Professional coaches for major sports\n- **Tournaments:**\n    - Intra-college tournaments\n    - Inter-college participation\n    - University-level representation\n- **Annual Sports Day:** Typically in January/February\n- **Fitness Programs:** Yoga, aerobics sessions',
    keywords: ['equipment', 'coaching', 'facilities', 'sports'],
    patterns: ['sports facilities: equipment & coaching'],
  },
  {
    question: 'Tell me about Cultural Activities: Detailed Clubs',
    answer: '- **Music Club:** Vocal, instrumental training\n- **Dance Club:** Classical, folk, western styles\n- **Drama Club:** Street plays, stage dramas\n- **Fine Arts Club:** Painting, sketching competitions\n- **Literary Club:** Debates, creative writing, book reviews\n- **Photography Club:** Photography workshops, exhibitions\n- **Quiz Club:** Regular quiz competitions\n- **Debate Society:** Parliamentary, Lincoln-Douglas debates',
    keywords: ['cultural', 'activities', 'clubs', 'detailed'],
    patterns: ['cultural activities: detailed clubs'],
  },
  {
    question: 'Tell me about Technical Clubs & Societies',
    answer: '- **Coding Club:** Competitive programming, hackathons\n- **Robotics Club:** Robot building, competitions\n- **Electronics Club:** DIY electronics projects\n- **Mechanical Innovation Club:** Design competitions\n- **Civil Engineering Society:** Site visits, technical talks\n- **Green Energy Club:** Renewable energy projects',
    keywords: ['clubs', 'technical', 'societies'],
    patterns: ['technical clubs & societies'],
  },
  {
    question: 'Tell me about Women Empowerment Initiatives',
    answer: '- **WOW (Women of Wonder):** Leadership, creativity\n- **Women Tech Makers (WTM):** Tech skills for women\n- **Self Defense Training:** Regular martial arts/self-defense classes\n- **Menstrual Hygiene Awareness:** Health camps\n- **Career Guidance for Women:** Special sessions\n- **Women\'\'s Day Celebrations:** March 8th events',
    keywords: ['empowerment', 'women', 'initiatives'],
    patterns: ['women empowerment initiatives'],
  },
  {
    question: 'Tell me about Innovation & Patent Support',
    answer: '- **Patent Filing Assistance:** Guidance from R&D cell\n- **Prototype Development:** Makerspace support\n- **Funding for Innovation:** IEDC grants available\n- **IPR Awareness:** Workshops on intellectual property\n- **Product Development:** End-to-end support',
    keywords: ['support', 'innovation', 'patent'],
    patterns: ['innovation & patent support'],
  },
  {
    question: 'Tell me about Quality Assurance (IQAC)',
    answer: '- **Purpose:** Internal Quality Assurance Cell monitors standards\n- **Activities:**\n    - Curriculum feedback\n    - Faculty evaluation\n    - Infrastructure assessment\n    - Academic audits\n- **Accreditation:** Prepares for NAAC/NBA accreditations\n- **Best Practices:** Documents and promotes quality initiatives',
    keywords: ['assurance', 'quality', 'iqac'],
    patterns: ['quality assurance (iqac)'],
  },
  {
    question: 'Tell me about Grievance Redressal Mechanism',
    answer: '- **Grievance Cell:** Headed by senior faculty\n- **Types of Grievances:**\n    - Academic issues\n    - Administrative matters\n    - Hostel problems\n    - Harassment complaints\n- **Process:** Written/online complaint → Investigation → Resolution\n- **Timeline:** Resolution within 15-30 days\n- **Appeal:** Can escalate to higher authorities',
    keywords: ['redressal', 'grievance', 'mechanism'],
    patterns: ['grievance redressal mechanism'],
  },
  {
    question: 'Tell me about Anti-Sexual Harassment Cell (Internal Complaints Committee)',
    answer: '- **Chairperson:** Senior female faculty member\n- **Members:** Mix of faculty, staff, external expert, student representative\n- **Confidentiality:** Complete privacy maintained\n- **Action:** Swift action as per law\n- **Awareness:** Regular workshops on gender sensitivity',
    keywords: ['harassment', 'complaints', 'cell', 'anti', 'internal', 'sexual', 'committee'],
    patterns: ['anti-sexual harassment cell (internal complaints committee)'],
  },
  {
    question: 'Tell me about Campus Connectivity: Public Transport',
    answer: '- **Nearest Bus Stop:** Povval (1 km)\n- **Nearest Railway Station:** Kasaragod (12 km)\n- **Nearest Airport:** Mangalore International Airport (65 km)\n- **Local Transport:** Auto-rickshaws, taxis available\n- **College Buses:** 6 routes covering major areas',
    keywords: ['transport', 'public', 'connectivity', 'campus'],
    patterns: ['campus connectivity: public transport'],
  },
  {
    question: 'Tell me about Nearby Facilities (Off-Campus)',
    answer: '- **Hospitals:** District Hospital Kasaragod (12 km)\n- **Banks:** Multiple banks in Kasaragod town\n- **Restaurants:** Various eateries near campus and in town\n- **Shopping:** Kasaragod town market (12 km)\n- **Stationery Shops:** Available in Kasaragod town\n- **Photocopy Centers:** Available near campus',
    keywords: ['facilities', 'nearby', 'off', 'campus'],
    patterns: ['nearby facilities (off-campus)'],
  },
  {
    question: 'Tell me about Faculty Development Programs (FDP)',
    answer: '- **Regular FDPs:** Conducted by departments on emerging technologies\n- **AICTE-Sponsored FDPs:** National-level programs hosted\n- **Industry Collaborations:** FDPs with industry partners\n- **Online Courses:** Faculty encouraged to complete MOOCs\n- **Research Methodology:** Training for Ph.D. guides\n- **Pedagogy Workshops:** Teaching methodology improvements',
    keywords: ['programs', 'development', 'fdp', 'faculty'],
    patterns: ['faculty development programs (fdp)'],
  },
  {
    question: 'Tell me about Student Feedback System',
    answer: '- **Course Feedback:** Collected at end of each semester\n- **Faculty Evaluation:** Anonymous student feedback\n- **Infrastructure Feedback:** Regular surveys\n- **Online Portal:** Digital feedback submission\n- **Action Taken:** Improvements based on feedback',
    keywords: ['system', 'feedback', 'student', 'fee', 'fees', 'amount', 'pay', 'how much'],
    patterns: ['student feedback system', 'fee ethra', 'what is the fee'],
  },
  {
    question: 'Tell me about Campus IT Infrastructure',
    answer: '- **Wi-Fi Coverage:** Entire campus covered\n- **Bandwidth:** 1 Gbps NKN connectivity\n- **Computer-Student Ratio:** 1:3 approximately\n- **Software Licenses:** Latest versions maintained\n- **E-Learning Tools:** LMS, video conferencing facilities\n- **IT Support Team:** Dedicated technical staff',
    keywords: ['infrastructure', 'campus'],
    patterns: ['campus it infrastructure'],
  },
  {
    question: 'Tell me about Semester Registration Process',
    answer: '- **Online Registration:** Through college portal\n- **Subject Selection:** Choice-based credit system (if applicable)\n- **Fee Payment:** Online payment mandatory\n- **Course Confirmation:** After fee payment\n- **Late Registration:** Penalty charges applicable\n- **Withdrawal:** Within specified dates only',
    keywords: ['process', 'semester', 'registration'],
    patterns: ['semester registration process'],
  },
  {
    question: 'Tell me about Academic Support Services',
    answer: '- **Remedial Classes:** For slow learners\n- **Advanced Learner Programs:** For high achievers\n- **Bridge Courses:** For lateral entry students\n- **Tutorial System:** Faculty tutors assigned\n- **Doubt Clearing Sessions:** Regular sessions\n- **Peer Learning:** Senior-junior interaction encouraged',
    keywords: ['support', 'academic', 'services'],
    patterns: ['academic support services'],
  },
  {
    question: 'Tell me about Energy & Sustainability Initiatives',
    answer: '- **LED Lighting:** Across campus\n- **Solar Panels:** Partial solar power generation\n- **Energy Audit:** Regular assessment\n- **Water Conservation:** Efficient usage monitored\n- **Green Building Norms:** Followed in new construction\n- **Carbon Footprint Reduction:** Ongoing efforts',
    keywords: ['sustainability', 'energy', 'initiatives'],
    patterns: ['energy & sustainability initiatives'],
  },
  {
    question: 'Tell me about Waste Management System',
    answer: '- **Segregation:** Dry, wet, e-waste bins\n- **Biogas Plant:** For organic waste (if present)\n- **Recycling:** Paper, plastic recycling initiatives\n- **E-Waste Collection:** Periodic collection drives\n- **Awareness Campaigns:** Regular cleanliness drives',
    keywords: ['waste', 'management', 'system'],
    patterns: ['waste management system'],
  },
  {
    question: 'Tell me about Campus Beautification',
    answer: '- **Landscaping:** Well-maintained gardens\n- **Herbal Garden:** Medicinal plants maintained\n- **Avenue Trees:** Lined along campus roads\n- **Flower Beds:** Seasonal flowers planted\n- **Eco-friendly Campus:** Plastic-free zones',
    keywords: ['beautification', 'campus'],
    patterns: ['campus beautification'],
  },
  {
    question: 'Tell me about Student Support Services',
    answer: '- **Counseling:** Academic, personal, career\n- **Financial Aid:** Scholarship guidance\n- **Health Services:** First aid, tie-ups with hospitals\n- **Legal Aid:** Basic legal awareness and support\n- **Disability Support:** Infrastructure and academic support',
    keywords: ['support', 'services', 'student'],
    patterns: ['student support services'],
  },
  {
    question: 'Tell me about Final Remarks & Future Plans',
    answer: '- **Vision 2030:** Aiming for autonomous status\n- **Infrastructure Expansion:** New blocks planned\n- **NAAC Accreditation:** Preparation underway\n- **International Collaborations:** More MOUs in pipeline\n- **Placement Target:** 90%+ placement rate goal\n- **Research Focus:** More funded projects and publications\n- **Startup Ecosystem:** Stronger incubation support',
    keywords: ['final', 'plans', 'future', 'remarks'],
    patterns: ['final remarks & future plans'],
  },
  {
    question: 'Tell me about Vision & Mission',
    answer: '- **Vision:** To become a paragon institution for pursuance of Education and Research in Engineering and Technology\n- **Mission:**\n  - Impart finest quality Technical Education & Training\n  - Nurture a vision of Sustainable development\n  - Bequeath it to the next generation of professionals',
    keywords: ['mission', 'vision'],
    patterns: ['vision & mission'],
  },
];

// Combine default + generated FAQs into a single list used by initializeCache
export const ALL_FAQS: OfflineFAQ[] = [...DEFAULT_FAQS, ...GENERATED_FAQS];

export function matchFAQForOnline(query: string, cache?: OfflineCache): OfflineFAQ | null {
  const resolvedCache = cache || loadCache() || initializeCache();
  if (!query || query.trim().length === 0) return null;

  const queryLower = query.toLowerCase();
  const queryKeywords = extractKeywords(query);

  // Detect if the user is asking about a specific role (HOD, faculty, etc.)
  const isRoleQuery = SPECIFIC_ROLE_KEYWORDS.some(kw =>
    /[\u0D00-\u0D7F]/.test(kw) ? query.includes(kw) : queryLower.includes(kw)
  );

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

    // Intent disambiguation: penalize generic FAQs when user asks about specific roles
    if (isRoleQuery && GENERIC_FAQ_QUESTIONS.includes(faq.question.toLowerCase())) {
      score = Math.floor(score * 0.3); // Heavy penalty — let specific FAQs win
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
