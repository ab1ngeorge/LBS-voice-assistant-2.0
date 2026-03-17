// ─── Website Intent Detection ─────────────────────────────────────────
// Detects when a user wants to visit/open a specific college website page
// and returns the URL + description for instant redirection.

export interface WebsitePage {
    id: string;
    name: string;
    url: string;
    category: string;
    keywords: string[];       // EN keywords
    keywordsMl: string[];     // Malayalam keywords
    keywordsManglish: string[]; // Manglish keywords
}

// ─── Full website page directory ──────────────────────────────────────
export const WEBSITE_PAGES: WebsitePage[] = [
    // ── Institution ────────────────────────────────────────────────────
    {
        id: 'homepage', name: 'Homepage', url: 'https://lbscek.ac.in/', category: 'Institution',
        keywords: ['homepage', 'home page', 'main page', 'college website', 'lbs website', 'official site', 'official website'],
        keywordsMl: ['ഹോം പേജ്', 'വെബ്സൈറ്റ്', 'കോളേജ് സൈറ്റ്', 'ഔദ്യോഗിക വെബ്സൈറ്റ്'],
        keywordsManglish: ['home page', 'website', 'college site', 'official site', 'college website link']
    },

    {
        id: 'about', name: 'About Us', url: 'https://lbscek.ac.in/about-us/', category: 'Institution',
        keywords: ['about us', 'about college', 'about lbs', 'college info', 'college information', 'college history'],
        keywordsMl: ['ഞങ്ങളെ കുറിച്ച്', 'കോളേജിനെ കുറിച്ച്', 'കോളേജ് വിവരം'],
        keywordsManglish: ['about us', 'college kurichu', 'college info', 'lbs patti']
    },

    {
        id: 'college_map', name: 'College Map', url: 'https://lbscek.ac.in/college-map/', category: 'Institution',
        keywords: ['college map', 'campus map', 'campus layout'],
        keywordsMl: ['കോളേജ് മാപ്പ്', 'ക്യാമ്പസ് മാപ്പ്'],
        keywordsManglish: ['college map', 'campus map']
    },

    {
        id: 'mandatory_disclosure', name: 'Mandatory Disclosure', url: 'https://lbscek.ac.in/mandatory-disclosure/', category: 'Institution',
        keywords: ['mandatory disclosure', 'disclosure'],
        keywordsMl: ['നിർബന്ധിത വെളിപ്പെടുത്തൽ'],
        keywordsManglish: ['mandatory disclosure']
    },

    {
        id: 'aicte_orders', name: 'AICTE Orders', url: 'https://lbscek.ac.in/aicte-orders/', category: 'Institution',
        keywords: ['aicte orders', 'aicte order'],
        keywordsMl: ['എഐസിടിഇ ഓർഡർ'],
        keywordsManglish: ['aicte orders', 'aicte order']
    },

    {
        id: 'nba', name: 'NBA Accreditation', url: 'https://lbscek.ac.in/nba-accreditation-process/', category: 'Institution',
        keywords: ['nba accreditation', 'nba', 'accreditation', 'accreditation process'],
        keywordsMl: ['എൻബിഎ', 'അക്രഡിറ്റേഷൻ'],
        keywordsManglish: ['nba', 'accreditation']
    },

    {
        id: 'special_rule', name: 'Special Rule', url: 'https://lbscek.ac.in/special-rule/', category: 'Institution',
        keywords: ['special rule', 'special rules'],
        keywordsMl: ['പ്രത്യേക നിയമം'],
        keywordsManglish: ['special rule']
    },

    {
        id: 'audit_reports', name: 'Audit Reports', url: 'https://lbscek.ac.in/audit-reports/', category: 'Institution',
        keywords: ['audit report', 'audit reports', 'audit'],
        keywordsMl: ['ഓഡിറ്റ് റിപ്പോർട്ട്'],
        keywordsManglish: ['audit report', 'audit']
    },

    {
        id: 'student_verification', name: 'Student Verification', url: 'https://lbscek.ac.in/student-verification/', category: 'Institution',
        keywords: ['student verification', 'verify student', 'verification'],
        keywordsMl: ['വിദ്യാർത്ഥി സ്ഥിരീകരണം'],
        keywordsManglish: ['student verification', 'verify student']
    },

    {
        id: 'tenders', name: 'Quotations & Tenders', url: 'https://lbscek.ac.in/quotations-and-tenders/', category: 'Institution',
        keywords: ['quotation', 'quotations', 'tender', 'tenders'],
        keywordsMl: ['ടെൻഡർ', 'ക്വട്ടേഷൻ'],
        keywordsManglish: ['tender', 'quotation']
    },

    {
        id: 'anti_ragging', name: 'Anti Ragging Cell', url: 'https://lbscek.ac.in/anti-ragging-cell/', category: 'Institution',
        keywords: ['anti ragging', 'ragging cell', 'anti-ragging', 'ragging complaint'],
        keywordsMl: ['റാഗിംഗ്', 'ആന്റി റാഗിംഗ്', 'റാഗിംഗ് സെൽ'],
        keywordsManglish: ['anti ragging', 'ragging cell', 'ragging complaint']
    },

    {
        id: 'aicte_skill_test', name: 'AICTE Online Skill Test', url: 'https://lbscek.ac.in/aicte-online-skill-test/', category: 'Institution',
        keywords: ['aicte skill test', 'skill test', 'online skill test'],
        keywordsMl: ['സ്കിൽ ടെസ്റ്റ്'],
        keywordsManglish: ['skill test', 'aicte test']
    },

    {
        id: 'aicte_feedback', name: 'AICTE Feedback', url: 'https://lbscek.ac.in/aicte-feedback/', category: 'Institution',
        keywords: ['aicte feedback', 'feedback aicte'],
        keywordsMl: ['എഐസിടിഇ ഫീഡ്ബാക്ക്'],
        keywordsManglish: ['aicte feedback']
    },

    {
        id: 'grievance', name: 'Grievance Cell', url: 'https://lbscek.ac.in/grievance-cell/', category: 'Institution',
        keywords: ['grievance', 'grievance cell', 'complaint', 'complaint cell'],
        keywordsMl: ['പരാതി', 'ഗ്രീവൻസ്', 'പരാതി സെൽ'],
        keywordsManglish: ['grievance', 'complaint', 'parathi']
    },

    // ── Administration ────────────────────────────────────────────────
    {
        id: 'board_of_governors', name: 'Board of Governors', url: 'https://lbscek.ac.in/board-of-governors/', category: 'Administration',
        keywords: ['board of governors', 'governing body', 'governors'],
        keywordsMl: ['ഗവേണിംഗ് ബോഡി', 'ഭരണസമിതി'],
        keywordsManglish: ['governing body', 'board of governors']
    },

    {
        id: 'director', name: 'Director', url: 'https://lbscek.ac.in/director/', category: 'Administration',
        keywords: ['director page', 'director info', 'director profile'],
        keywordsMl: ['ഡയറക്ടർ'],
        keywordsManglish: ['director']
    },

    {
        id: 'principal', name: 'Principal', url: 'https://lbscek.ac.in/principal/', category: 'Administration',
        keywords: ['principal page', 'principal info', 'principal profile'],
        keywordsMl: ['പ്രിൻസിപ്പൽ'],
        keywordsManglish: ['principal']
    },

    {
        id: 'ug_dean', name: 'UG Dean', url: 'https://lbscek.ac.in/ug-dean/', category: 'Administration',
        keywords: ['ug dean', 'undergraduate dean', 'dean ug'],
        keywordsMl: ['യുജി ഡീൻ'],
        keywordsManglish: ['ug dean']
    },

    {
        id: 'dean_rd', name: 'Dean Research & Development', url: 'https://lbscek.ac.in/dean-research-development/', category: 'Administration',
        keywords: ['dean research', 'dean r&d', 'research development', 'dean rd'],
        keywordsMl: ['ഡീൻ ഗവേഷണം', 'ഗവേഷണ വികസനം'],
        keywordsManglish: ['dean research', 'research development']
    },

    {
        id: 'icc', name: 'Internal Compliance Committee', url: 'https://lbscek.ac.in/internal-compliance-committee/', category: 'Administration',
        keywords: ['internal compliance', 'compliance committee', 'icc'],
        keywordsMl: ['ആഭ്യന്തര കംപ്ലയൻസ്'],
        keywordsManglish: ['compliance committee', 'icc']
    },

    {
        id: 'iqac', name: 'IQAC', url: 'https://lbscek.ac.in/internal-quality-assurance-cell-iqac/', category: 'Administration',
        keywords: ['iqac', 'quality assurance', 'quality assurance cell'],
        keywordsMl: ['ഐക്യുഎസി', 'ഗുണനിലവാര ഉറപ്പ്'],
        keywordsManglish: ['iqac', 'quality assurance']
    },

    {
        id: 'admin_wing', name: 'Administrative Wing', url: 'https://lbscek.ac.in/administrative-wing/', category: 'Administration',
        keywords: ['administrative wing', 'admin wing', 'admin office'],
        keywordsMl: ['അഡ്മിനിസ്ട്രേറ്റീവ് വിഭാഗം', 'ഓഫീസ്'],
        keywordsManglish: ['admin wing', 'admin office']
    },

    {
        id: 'rti', name: 'Right to Information', url: 'https://lbscek.ac.in/right-to-information/', category: 'Administration',
        keywords: ['rti', 'right to information'],
        keywordsMl: ['ആർടിഐ', 'വിവരാവകാശം'],
        keywordsManglish: ['rti', 'right to information', 'vivaravakasham']
    },

    // ── Admission ──────────────────────────────────────────────────────
    {
        id: 'admission_process', name: 'Admission Process', url: 'https://lbscek.ac.in/admission-procedure/', category: 'Admission',
        keywords: ['admission process', 'admission procedure', 'how to apply', 'apply for admission'],
        keywordsMl: ['അഡ്മിഷൻ', 'പ്രവേശനം', 'പ്രവേശന നടപടി'],
        keywordsManglish: ['admission process', 'admission procedure', 'admission nadapadi']
    },

    {
        id: 'admission_keam', name: 'KEAM Admission', url: 'https://lbscek.ac.in/admission-keam/', category: 'Admission',
        keywords: ['keam admission', 'keam', 'keam seat'],
        keywordsMl: ['കീം', 'കീം അഡ്മിഷൻ'],
        keywordsManglish: ['keam', 'keam admission']
    },

    {
        id: 'nri_scheme', name: 'NRI Scheme', url: 'https://lbscek.ac.in/nri-scheme/', category: 'Admission',
        keywords: ['nri scheme', 'nri admission', 'nri seat', 'nri quota'],
        keywordsMl: ['എൻആർഐ', 'എൻആർഐ സ്കീം'],
        keywordsManglish: ['nri scheme', 'nri admission', 'nri seat']
    },

    {
        id: 'lateral_entry', name: 'Lateral Entry', url: 'https://lbscek.ac.in/lateral-entry-scheme/', category: 'Admission',
        keywords: ['lateral entry', 'lateral entry scheme', 'diploma admission', 'let'],
        keywordsMl: ['ലാറ്ററൽ എൻട്രി'],
        keywordsManglish: ['lateral entry', 'let admission']
    },

    {
        id: 'non_keam', name: 'Non-KEAM Admission', url: 'https://lbscek.ac.in/non-keam-admission/', category: 'Admission',
        keywords: ['non keam', 'non-keam admission', 'spot admission'],
        keywordsMl: ['നോൺ കീം'],
        keywordsManglish: ['non keam', 'spot admission']
    },

    {
        id: 'fee_waiver', name: 'Fee Waiver Scheme', url: 'https://lbscek.ac.in/fee-waiver-scheme/', category: 'Admission',
        keywords: ['fee waiver', 'fee waiver scheme', 'fee concession'],
        keywordsMl: ['ഫീ വെയ്‌വർ', 'ഫീ ഇളവ്'],
        keywordsManglish: ['fee waiver', 'fee concession', 'fee ilavu']
    },

    {
        id: 'fee_structure', name: 'Fee Structure', url: 'https://lbscek.ac.in/fee-structure/', category: 'Admission',
        keywords: ['fee structure', 'fee details', 'fees', 'tuition fee'],
        keywordsMl: ['ഫീസ്', 'ഫീസ് വിവരം', 'ട്യൂഷൻ ഫീ'],
        keywordsManglish: ['fee structure', 'fees', 'fee details', 'fee ethra']
    },

    // ── Academics ──────────────────────────────────────────────────────
    {
        id: 'departments', name: 'Departments', url: 'https://lbscek.ac.in/departments/', category: 'Academics',
        keywords: ['departments', 'department list', 'all departments'],
        keywordsMl: ['ഡിപ്പാർട്ട്മെന്റുകൾ', 'വിഭാഗങ്ങൾ'],
        keywordsManglish: ['departments', 'department list']
    },

    {
        id: 'programs', name: 'Programs', url: 'https://lbscek.ac.in/programs/', category: 'Academics',
        keywords: ['programs', 'courses', 'course list', 'programs offered'],
        keywordsMl: ['പ്രോഗ്രാമുകൾ', 'കോഴ്സുകൾ'],
        keywordsManglish: ['programs', 'courses', 'course list']
    },

    {
        id: 'syllabus', name: 'Syllabus', url: 'https://lbscek.ac.in/syllabus/', category: 'Academics',
        keywords: ['syllabus', 'course syllabus', 'curriculum'],
        keywordsMl: ['സിലബസ്', 'പാഠ്യപദ്ധതി'],
        keywordsManglish: ['syllabus', 'curriculum']
    },

    {
        id: 'academic_calendar', name: 'Academic Calendar', url: 'https://lbscek.ac.in/academic-calendar/', category: 'Academics',
        keywords: ['academic calendar', 'calendar', 'academic schedule'],
        keywordsMl: ['അക്കാദമിക് കലണ്ടർ'],
        keywordsManglish: ['academic calendar', 'calendar']
    },

    {
        id: 'downloads', name: 'Downloads', url: 'https://lbscek.ac.in/downloads/', category: 'Academics',
        keywords: ['downloads', 'download forms', 'forms download'],
        keywordsMl: ['ഡൗൺലോഡ്', 'ഫോറം ഡൗൺലോഡ്'],
        keywordsManglish: ['downloads', 'download']
    },

    // ── Departments ────────────────────────────────────────────────────
    {
        id: 'cse_dept', name: 'CSE Department', url: 'https://lbscek.ac.in/computer-science-engineering-2/', category: 'Departments',
        keywords: ['cse department', 'computer science', 'cse page', 'cse dept'],
        keywordsMl: ['സിഎസ്ഇ ഡിപ്പാർട്ട്മെന്റ്', 'കമ്പ്യൂട്ടർ സയൻസ്'],
        keywordsManglish: ['cse department', 'computer science dept']
    },

    {
        id: 'mech_dept', name: 'Mechanical Engineering', url: 'https://lbscek.ac.in/mechanical-engineering/', category: 'Departments',
        keywords: ['mechanical department', 'mech department', 'mechanical engineering', 'mech dept'],
        keywordsMl: ['മെക്കാനിക്കൽ', 'മെക്കാനിക്കൽ ഡിപ്പാർട്ട്മെന്റ്'],
        keywordsManglish: ['mechanical department', 'mech dept']
    },

    {
        id: 'eee_dept', name: 'EEE Department', url: 'https://lbscek.ac.in/electrical-electronics-engineering/', category: 'Departments',
        keywords: ['eee department', 'electrical', 'electrical engineering', 'eee dept'],
        keywordsMl: ['ഇഇഇ ഡിപ്പാർട്ട്മെന്റ്', 'ഇലക്ട്രിക്കൽ'],
        keywordsManglish: ['eee department', 'electrical dept']
    },

    {
        id: 'ece_dept', name: 'ECE Department', url: 'https://lbscek.ac.in/electronics-communication-engineering/', category: 'Departments',
        keywords: ['ece department', 'electronics', 'electronics communication', 'ece dept'],
        keywordsMl: ['ഇസിഇ ഡിപ്പാർട്ട്മെന്റ്', 'ഇലക്ട്രോണിക്സ്'],
        keywordsManglish: ['ece department', 'electronics dept']
    },

    {
        id: 'civil_dept', name: 'Civil Engineering', url: 'https://lbscek.ac.in/civil-engineering/', category: 'Departments',
        keywords: ['civil department', 'civil engineering', 'civil dept'],
        keywordsMl: ['സിവിൽ ഡിപ്പാർട്ട്മെന്റ്', 'സിവിൽ എഞ്ചിനീയറിംഗ്'],
        keywordsManglish: ['civil department', 'civil dept']
    },

    {
        id: 'applied_science', name: 'Applied Science', url: 'https://lbscek.ac.in/applied-science/', category: 'Departments',
        keywords: ['applied science', 'applied science department'],
        keywordsMl: ['അപ്ലൈഡ് സയൻസ്'],
        keywordsManglish: ['applied science']
    },

    {
        id: 'physical_education', name: 'Physical Education', url: 'https://lbscek.ac.in/physical-education/', category: 'Departments',
        keywords: ['physical education', 'physical education department', 'sports department'],
        keywordsMl: ['ഫിസിക്കൽ എഡ്യൂക്കേഷൻ'],
        keywordsManglish: ['physical education']
    },

    // ── Activities & Organizations ─────────────────────────────────────
    {
        id: 'cgpu', name: 'CGPU (Career Guidance)', url: 'https://lbscek.ac.in/career-guidance-placement-unit-cgpu/', category: 'Activities',
        keywords: ['cgpu', 'career guidance', 'placement unit', 'career guidance placement'],
        keywordsMl: ['സിജിപിയു', 'കരിയർ ഗൈഡൻസ്', 'പ്ലേസ്‌മെന്റ്'],
        keywordsManglish: ['cgpu', 'career guidance', 'placement unit']
    },

    {
        id: 'alumni', name: 'Alumni Association', url: 'https://lbscek.ac.in/alumni-association/', category: 'Activities',
        keywords: ['alumni', 'alumni association', 'old students', 'alumni network'],
        keywordsMl: ['അലുംനി', 'പൂർവ്വ വിദ്യാർത്ഥികൾ'],
        keywordsManglish: ['alumni', 'old students', 'alumni association']
    },

    {
        id: 'nss', name: 'NSS', url: 'https://lbscek.ac.in/national-service-scheme/', category: 'Activities',
        keywords: ['nss', 'national service scheme', 'service scheme'],
        keywordsMl: ['എൻഎസ്എസ്', 'നാഷണൽ സർവ്വീസ്'],
        keywordsManglish: ['nss', 'national service scheme']
    },

    {
        id: 'pta', name: 'PTA', url: 'https://lbscek.ac.in/parent-teacher-association/', category: 'Activities',
        keywords: ['pta', 'parent teacher', 'parent teacher association'],
        keywordsMl: ['പിടിഎ', 'രക്ഷാകർത്ത  അധ്യാപക സംഘം'],
        keywordsManglish: ['pta', 'parent teacher association']
    },

    {
        id: 'continuing_education', name: 'Continuing Education Cell', url: 'https://lbscek.ac.in/continuing-education-cell/', category: 'Activities',
        keywords: ['continuing education', 'continuing education cell'],
        keywordsMl: ['തുടർ വിദ്യാഭ്യാസം'],
        keywordsManglish: ['continuing education']
    },

    {
        id: 'iedc', name: 'IEDC', url: 'https://lbscek.ac.in/iedc/', category: 'Activities',
        keywords: ['iedc', 'innovation', 'entrepreneurship development'],
        keywordsMl: ['ഐഇഡിസി', 'ഇന്നൊവേഷൻ'],
        keywordsManglish: ['iedc', 'innovation cell']
    },

    {
        id: 'industry_interaction', name: 'Industry Institute Interaction', url: 'https://lbscek.ac.in/industry-institute-interaction/', category: 'Activities',
        keywords: ['industry institute', 'industry interaction', 'industry collaboration'],
        keywordsMl: ['ഇൻഡസ്ട്രി ഇൻസ്റ്റിറ്റ്യൂട്ട്'],
        keywordsManglish: ['industry interaction', 'industry institute']
    },

    {
        id: 'ieee', name: 'IEEE', url: 'https://lbscek.ac.in/ieee/', category: 'Activities',
        keywords: ['ieee', 'ieee chapter', 'ieee page'],
        keywordsMl: ['ഐഇഇഇ'],
        keywordsManglish: ['ieee']
    },

    {
        id: 'college_union', name: 'College Union', url: 'https://lbscek.ac.in/college-union/', category: 'Activities',
        keywords: ['college union', 'student union', 'union'],
        keywordsMl: ['കോളേജ് യൂണിയൻ', 'വിദ്യാർത്ഥി യൂണിയൻ'],
        keywordsManglish: ['college union', 'student union']
    },

    // ── Facilities ─────────────────────────────────────────────────────
    {
        id: 'central_library', name: 'Central Library', url: 'https://lbscek.ac.in/central-library/', category: 'Facilities',
        keywords: ['central library', 'library page', 'library info'],
        keywordsMl: ['സെൻട്രൽ ലൈബ്രറി', 'ലൈബ്രറി'],
        keywordsManglish: ['central library', 'library']
    },

    {
        id: 'digital_library', name: 'Digital Library', url: 'https://lbscek.ac.in/digital-library/', category: 'Facilities',
        keywords: ['digital library', 'e-library', 'online library'],
        keywordsMl: ['ഡിജിറ്റൽ ലൈബ്രറി'],
        keywordsManglish: ['digital library', 'e-library']
    },

    {
        id: 'computing_facility', name: 'Central Computing Facility', url: 'https://lbscek.ac.in/central-computing-facility/', category: 'Facilities',
        keywords: ['computing facility', 'computer center', 'computing center', 'central computing'],
        keywordsMl: ['കമ്പ്യൂട്ടിംഗ് സെന്റർ'],
        keywordsManglish: ['computing facility', 'computer center']
    },

    {
        id: 'idea_lab', name: 'AICTE IDEA Lab', url: 'https://lbscek.ac.in/aicte-idea-lab/', category: 'Facilities',
        keywords: ['idea lab', 'aicte idea lab', 'idea laboratory'],
        keywordsMl: ['ഐഡിയ ലാബ്'],
        keywordsManglish: ['idea lab', 'aicte idea lab']
    },

    {
        id: 'hostel', name: 'Hostel', url: 'https://lbscek.ac.in/hostel/', category: 'Facilities',
        keywords: ['hostel page', 'hostel info', 'hostel details'],
        keywordsMl: ['ഹോസ്റ്റൽ'],
        keywordsManglish: ['hostel page', 'hostel info']
    },

    {
        id: 'bus_service', name: 'Bus Service', url: 'https://lbscek.ac.in/bus-service/', category: 'Facilities',
        keywords: ['bus service page', 'bus service info', 'transport page'],
        keywordsMl: ['ബസ് സർവ്വീസ്'],
        keywordsManglish: ['bus service page', 'bus info']
    },

    {
        id: 'atm', name: 'ATM Facility', url: 'https://lbscek.ac.in/atm-facility/', category: 'Facilities',
        keywords: ['atm facility', 'atm page', 'atm info'],
        keywordsMl: ['എടിഎം'],
        keywordsManglish: ['atm facility', 'atm']
    },

    {
        id: 'coop_society', name: 'Student Co-Operative Society', url: 'https://lbscek.ac.in/student-co-operative-society/', category: 'Facilities',
        keywords: ['co-operative', 'cooperative society', 'co-op store', 'student store'],
        keywordsMl: ['കോ-ഓപ്പറേറ്റീവ്', 'സഹകരണ സംഘം'],
        keywordsManglish: ['cooperative', 'co-op store', 'co-operative society']
    },

    {
        id: 'fab_lab', name: 'Fab Lab', url: 'https://lbscek.ac.in/fab-lab-facility/', category: 'Facilities',
        keywords: ['fab lab', 'fabrication lab', 'fablab'],
        keywordsMl: ['ഫാബ് ലാബ്'],
        keywordsManglish: ['fab lab', 'fablab']
    },

    {
        id: 'skill_delivery', name: 'Skill Delivery Platform', url: 'https://lbscek.ac.in/skill-delivery-platform/', category: 'Facilities',
        keywords: ['skill delivery', 'skill platform', 'skill delivery platform'],
        keywordsMl: ['സ്കിൽ ഡെലിവറി'],
        keywordsManglish: ['skill delivery', 'skill platform']
    },

    // ── Fee Payment ────────────────────────────────────────────────────
    {
        id: 'annual_fee', name: 'Annual/Admission Fee', url: 'https://lbscek.ac.in/annual-admission-fee/', category: 'Fee Payment',
        keywords: ['annual fee', 'admission fee payment', 'pay admission fee'],
        keywordsMl: ['വാർഷിക ഫീസ്', 'അഡ്മിഷൻ ഫീസ്'],
        keywordsManglish: ['annual fee', 'admission fee payment']
    },

    {
        id: 'exam_fee', name: 'Exam/Other Fee Payment', url: 'https://lbscek.ac.in/exam-other-fee-payment/', category: 'Fee Payment',
        keywords: ['exam fee', 'pay exam fee', 'other fee payment', 'exam fee payment'],
        keywordsMl: ['പരീക്ഷ ഫീസ്'],
        keywordsManglish: ['exam fee', 'pay exam fee']
    },

    {
        id: 'semester_registration', name: 'Semester Registration', url: 'https://lbscek.ac.in/semester-registration-online/', category: 'Fee Payment',
        keywords: ['semester registration', 'register semester', 'semester registration online'],
        keywordsMl: ['സെമസ്റ്റർ രജിസ്ട്രേഷൻ'],
        keywordsManglish: ['semester registration', 'sem registration']
    },

    {
        id: 'hostel_rent', name: 'Hostel Rent', url: 'https://lbscek.ac.in/hostel-rent/', category: 'Fee Payment',
        keywords: ['hostel rent', 'pay hostel rent', 'hostel fee payment'],
        keywordsMl: ['ഹോസ്റ്റൽ വാടക', 'ഹോസ്റ്റൽ ഫീസ്'],
        keywordsManglish: ['hostel rent', 'hostel fee']
    },

    // ── Contact ────────────────────────────────────────────────────────
    {
        id: 'contact', name: 'Contact Us', url: 'https://lbscek.ac.in/contact-2/', category: 'Contact',
        keywords: ['contact us', 'contact page', 'contact info', 'contact details', 'phone number', 'email address'],
        keywordsMl: ['ബന്ധപ്പെടുക', 'കോൺടാക്ട്', 'ഫോൺ നമ്പർ'],
        keywordsManglish: ['contact us', 'contact info', 'phone number']
    },
];

// ─── Intent trigger patterns ─────────────────────────────────────────
// These patterns detect when the user is asking to VISIT/OPEN a webpage
const WEBSITE_TRIGGER_PATTERNS_EN = [
    /\b(?:open|visit|show|go\s*to|take\s*me\s*to|navigate\s*to)\b.*\b(?:website|page|portal|site|link)\b/i,
    /\b(?:website|page|portal|site|link)\b.*\b(?:open|visit|show)\b/i,
    /\b(?:open|visit|show)\s+(?:the\s+)?(?:college|lbs)\s+(?:website|page|site)\b/i,
    /\bwhat\s*(?:is|'s)\s*the\s*(?:website|link|url|page)\b/i,
    /\b(?:give|share|send)\s*(?:me\s*)?(?:the\s*)?(?:link|url|website|page)\b/i,
];

const WEBSITE_TRIGGER_PATTERNS_ML = [
    /വെബ്സൈറ്റ്/,
    /ലിങ്ക്/,
    /പേജ്\s*തുറക്ക/,
    /സൈറ്റ്\s*തുറക്ക/,
    /വെബ്\s*പേജ്/,
];

const WEBSITE_TRIGGER_PATTERNS_MANGLISH = [
    /\b(?:website|site|link|page)\s+(?:thura|thurakku|open\s*cheyyu|kanikku|thaa)\b/i,
    /\b(?:thura|thurakku|open\s*cheyyu)\s+(?:website|site|link|page)\b/i,
    /\b(?:link|url)\s+(?:thaa|tharo|tharamo)\b/i,
];

// ─── isWebsiteIntent ─────────────────────────────────────────────────
export function isWebsiteIntent(text: string): boolean {
    if (!text || !text.trim()) return false;
    const lower = text.toLowerCase().trim();

    // Check trigger patterns
    const allPatterns = [
        ...WEBSITE_TRIGGER_PATTERNS_EN,
        ...WEBSITE_TRIGGER_PATTERNS_ML,
        ...WEBSITE_TRIGGER_PATTERNS_MANGLISH,
    ];
    if (allPatterns.some(p => p.test(lower))) return true;

    // Also match if user mentions a specific page keyword + action words
    const actionWords = /\b(?:open|visit|show|link|website|page|url|portal|site)\b/i;
    if (!actionWords.test(lower)) return false;

    // Check if any page keyword matches
    for (const page of WEBSITE_PAGES) {
        for (const kw of page.keywords) {
            if (lower.includes(kw.toLowerCase())) return true;
        }
        for (const kw of page.keywordsManglish) {
            if (lower.includes(kw.toLowerCase())) return true;
        }
        for (const kw of page.keywordsMl) {
            if (text.includes(kw)) return true;
        }
    }

    return false;
}

// ─── Language helpers ────────────────────────────────────────────────
function hasMalayalamScript(text: string): boolean {
    return /[\u0D00-\u0D7F]/.test(text);
}

function isManglishText(text: string): boolean {
    if (hasMalayalamScript(text)) return false;
    const manglishWords = /\b(?:evide|engane|thura|thurakku|kanikku|parayoo|tharoo|tharamo|cheyyu|nokkoo|evidaya|evideyanu|sthalam|angottu|avidekku|pokanam|ethan|vazhi|ponam)\b/i;
    return manglishWords.test(text);
}

// ─── getWebsiteResponse ──────────────────────────────────────────────
export function getWebsiteResponse(text: string): { message: string; url?: string; success: boolean } {
    if (!text || !text.trim()) {
        return { message: 'Please specify which page you want to visit.', success: false };
    }

    const lower = text.toLowerCase().trim();
    const isMalayalam = hasMalayalamScript(text);
    const isManglish = isManglishText(text);

    // Score each page by how many keywords match
    let bestPage: WebsitePage | null = null;
    let bestScore = 0;

    for (const page of WEBSITE_PAGES) {
        let score = 0;
        for (const kw of page.keywords) {
            if (lower.includes(kw.toLowerCase())) score += kw.split(/\s+/).length; // longer matches score higher
        }
        for (const kw of page.keywordsManglish) {
            if (lower.includes(kw.toLowerCase())) score += kw.split(/\s+/).length;
        }
        for (const kw of page.keywordsMl) {
            if (text.includes(kw)) score += 2; // Malayalam matches get a bonus
        }
        if (score > bestScore) {
            bestScore = score;
            bestPage = page;
        }
    }

    if (bestPage) {
        let msg: string;
        if (isMalayalam) {
            msg = `🔗 ${bestPage.name} പേജ് തുറക്കുന്നു...\n${bestPage.url}`;
        } else if (isManglish) {
            msg = `🔗 ${bestPage.name} page thurakkunnu...\n${bestPage.url}`;
        } else {
            msg = `Opening ${bestPage.name} page 🔗\n${bestPage.url}`;
        }
        return {
            message: msg,
            url: bestPage.url,
            success: true,
        };
    }

    // Fallback: open the college homepage
    let fallbackMsg: string;
    if (isMalayalam) {
        fallbackMsg = `🔗 LBS കോളേജ് വെബ്സൈറ്റ് ഇതാ:\nhttps://lbscek.ac.in/`;
    } else if (isManglish) {
        fallbackMsg = `🔗 LBS College website itha:\nhttps://lbscek.ac.in/`;
    } else {
        fallbackMsg = `Here's the LBS College website 🔗\nhttps://lbscek.ac.in/`;
    }
    return {
        message: fallbackMsg,
        url: 'https://lbscek.ac.in/',
        success: true,
    };
}
