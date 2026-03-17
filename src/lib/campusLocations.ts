// Predefined LBS College of Engineering campus locations
// All Google Maps links are verified and provided by the college

export type TravelMode = 'walking' | 'driving';

export interface CampusLocation {
  id: string;
  name: string;
  aliases: string[]; // English, Malayalam, Manglish synonyms
  mapsLink: string;  // Verified Google Maps link
  travelMode: TravelMode;
}

export const campusLocations: CampusLocation[] = [
  // ── Main Campus & Admin ────────────────────────────────────────────────
  {
    id: 'main_entrance',
    name: 'LBS College of Engineering (Main Entrance)',
    aliases: [
      // English — only specific gate/entrance references
      'main entrance', 'main gate', 'college gate', 'college entrance',
      'lbs college of engineering', 'lbs college gate', 'lbs main gate',
      'lbs college entrance', 'main campus gate', 'College', 'campus entrance',
      // Malayalam — only specific gate/entrance references
      'മെയിൻ ഗേറ്റ്', 'പ്രധാന കവാടം', 'കോളേജ്',
      'എൽബിഎസ് കോളേജ് ഗേറ്റ്', 'കോളേജ് ഗേറ്റ്',
      'എൽബിഎസ് കോളേജ് ഓഫ് എഞ്ചിനീയറിംഗ്', 'കോളേജ് കവാടം',
      'മെയിൻ എൻട്രൻസ്', 'ക്യാമ്പസ് ഗേറ്റ്',
      // Malayalam inflected forms
      'ഗേറ്റിലേക്ക്', 'ഗേറ്റിലേക്കുള്ള',
      'കവാടത്തിലേക്ക്', 'കവാടത്തിലേക്കുള്ള',
      // Additional Malayalam (colloquial & spoken)
      'കോളേജിലേക്ക്', 'കോളേജിലേക്കുള്ള',
      'കോളേജ് ഗേറ്റിലേക്ക്', 'കോളേജ് ഗേറ്റിലേക്കുള്ള',
      'ക്യാമ്പസ് കവാടം', 'പ്രധാന വാതിൽ',
      'മുൻവാതിൽ', 'മുൻ ഗേറ്റ്',
      'ഗേറ്റ് എവിടെ', 'കവാടം എവിടെ',
      // Manglish — only specific gate/entrance references
      'main gate', 'college gate', 'campus gate',
      'college entrance', 'lbs gate', 'main entrance',
      'pradhana kavaadam', 'main kavadam',
      // Additional Manglish
      'gate evide', 'college gate evide', 'gate engane ponum',
      'lbs collegilekk', 'collegilekk', 'campus gate evide',
      'lbs college evide', 'college ethan', 'gate ethan',
      'munvathil', 'mun gate', 'kavadam evide',
    ],
    mapsLink: 'https://maps.app.goo.gl/MgJURkMksGx7neiZ8',
    travelMode: 'driving',
  },
  {
    id: 'academic_departments',
    name: 'Academic Departments (General Area)',
    aliases: [
      // English
      'academic departments', 'departments', 'dept area', 'department block',
      'department area', 'academic block',
      // Malayalam
      'ഡിപ്പാർട്ട്മെന്റ്', 'വിഭാഗം', 'ഡിപ്പാർട്ട്മെന്റ് ഏരിയ',
      'അക്കാദമിക് ബ്ലോക്ക്', 'ഡിപ്പാർട്ട്മെന്റുകൾ',
      'അക്കാദമിക് ഡിപ്പാർട്ട്മെന്റ്', 'വിഭാഗങ്ങൾ',
      // Malayalam inflected forms
      'ഡിപ്പാർട്ട്മെന്റിലേക്ക്', 'ഡിപ്പാർട്ട്മെന്റിലേക്കുള്ള',
      'വിഭാഗത്തിലേക്ക്', 'ബ്ലോക്കിലേക്ക്',
      // Additional Malayalam
      'ഡിപ്പാർട്ട്മെന്റ് എവിടെ', 'വിഭാഗം എവിടെ',
      'ഡിപ്പാർട്ട്മെന്റ് ഏരിയ എവിടെ',
      'അക്കാദമിക് ഏരിയ', 'പഠന വിഭാഗം',
      // Manglish
      'department area', 'dept block', 'academic area',
      'departments evide', 'department block evide', 'vibhagam',
      // Additional Manglish
      'vibhagam evide', 'department engane ponum',
      'academic block evide', 'dept area evide',
      'padana vibhagam', 'departments engane ponum',
    ],
    mapsLink: 'https://maps.app.goo.gl/2PvfbFGAkUFjFBjS6',
    travelMode: 'walking',
  },

  // ── Departments ────────────────────────────────────────────────────────
  {
    id: 'me_dept',
    name: 'Dept. of Mechanical Engineering',
    aliases: [
      // English — full names & abbreviations
      'me department', 'mechanical', 'mechanical engineering',
      'mechanical dept', 'me dept', 'mech', 'mech dept',
      'me', 'mech department', 'mech engg', 'mechanical engg',
      'dept of mechanical', 'department of mechanical engineering',
      // Malayalam — full & short forms
      'മെക്കാനിക്കൽ', 'എംഇ', 'മെക്കാനിക്കൽ എഞ്ചിനീയറിംഗ്',
      'മെക്കാനിക്കൽ ഡിപ്പാർട്ട്മെന്റ്', 'മെക്ക്',
      'മെക്കാനിക്കൽ വിഭാഗം', 'എംഇ ഡിപ്പാർട്ട്മെന്റ്',
      'എംഇ വിഭാഗം', 'മെക്കാനിക്കൽ എൻജിനീയറിംഗ്',
      // Malayalam inflected forms
      'മെക്കാനിക്കലിലേക്ക്', 'മെക്കാനിക്കലിലേക്കുള്ള',
      'മെക്കാനിക്കൽ ഡിപ്പാർട്ട്മെന്റിലേക്ക്',
      'മെക്കാനിക്കൽ ഡിപ്പാർട്ട്മെന്റിലേക്കുള്ള',
      'എംഇ ഡിപ്പാർട്ട്മെന്റിലേക്ക്',
      // Additional Malayalam
      'മെക്കാനിക്കൽ എവിടെ', 'മെക്കാനിക്കൽ എങ്ങനെ പോകും',
      'മെക്ക് ഡിപ്പാർട്ട്മെന്റ്', 'മെക്ക് വിഭാഗം',
      'യന്ത്രശാസ്ത്ര വിഭാഗം', 'മെക്കാനിക്കൽ ലാബ്',
      // Manglish — abbreviations + spoken forms
      'mechanical department', 'mechanical engineering dept',
      'mech department evide', 'mech dept evide',
      'mechanical evide', 'me dept evide',
      'mech evide', 'me evide', 'mechanical engane ponum',
      'me department evide', 'mech department engane ponum',
      // Additional Manglish
      'mechanical ethan', 'mech ethan', 'me ethan',
      'mechanical pokanam', 'mechanical lab evide',
      'mechanical vibhagam', 'mech vibhagam',
      'mechanical engane ethum', 'me department engane ponum',
    ],
    mapsLink: 'https://maps.app.goo.gl/ZpHNZt62DzfHEMWWA',
    travelMode: 'walking',
  },
  {
    id: 'cse_dept',
    name: 'Computer Science & IT Department',
    aliases: [
      // English — full names & abbreviations
      'cse', 'cse department', 'computer science', 'cs department',
      'computer science and engineering', 'it department',
      'computer', 'cse dept', 'it dept', 'cs', 'cs dept',
      'computer science dept', 'cse engg', 'cs engg',
      'computer science and it', 'computer engineering',
      'dept of computer science', 'department of cse',
      'information technology', 'it', 'computer dept',
      // Malayalam — full & short forms
      'സിഎസ്ഇ', 'സിഎസ്സി', 'സിഎസ്', 'കമ്പ്യൂട്ടർ സയൻസ്', 'കമ്പ്യൂട്ടർ',
      'കമ്പ്യൂട്ടർ സയൻസ് ഡിപ്പാർട്ട്മെന്റ്',
      'സിഎസ്ഇ ഡിപ്പാർട്ട്മെന്റ്', 'സിഎസ്സി ഡിപ്പാർട്ട്മെന്റ്',
      'കമ്പ്യൂട്ടർ ഡിപ്പാർട്ട്മെന്റ്', 'കമ്പ്യൂട്ടർ വിഭാഗം',
      'ഐടി ഡിപ്പാർട്ട്മെന്റ്', 'ഐടി വിഭാഗം', 'ഐടി',
      'കമ്പ്യൂട്ടർ സയൻസ് ആൻഡ് എഞ്ചിനീയറിംഗ്',
      'സിഎസ്ഇ വിഭാഗം', 'സിഎസ് വിഭാഗം',
      'കമ്പ്യൂട്ടർ എഞ്ചിനീയറിംഗ്', 'കമ്പ്യൂട്ടർ സയൻസ് വിഭാഗം',
      // Malayalam inflected / postposition forms
      'സിഎസ്സി ഡിപ്പാർട്ട്മെന്റിലേക്ക്', 'സിഎസ്ഇ ഡിപ്പാർട്ട്മെന്റിലേക്ക്',
      'കമ്പ്യൂട്ടർ ഡിപ്പാർട്ട്മെന്റിലേക്ക്',
      'സിഎസ്സി ഡിപ്പാർട്ട്മെന്റിലേക്കുള്ള', 'സിഎസ്ഇ ഡിപ്പാർട്ട്മെന്റിലേക്കുള്ള',
      'കമ്പ്യൂട്ടർ ഡിപ്പാർട്ട്മെന്റിലേക്കുള്ള',
      'കമ്പ്യൂട്ടറിലേക്ക്', 'കമ്പ്യൂട്ടറിലേക്കുള്ള',
      // Additional Malayalam
      'കമ്പ്യൂട്ടർ സയൻസ് എവിടെ', 'സിഎസ്ഇ എവിടെ',
      'കമ്പ്യൂട്ടർ എവിടെ', 'ഐടി എവിടെ',
      'കമ്പ്യൂട്ടർ എങ്ങനെ പോകും', 'സിഎസ്ഇ എങ്ങനെ പോകും',
      'കമ്പ്യൂട്ടർ സയൻസ് ലാബ്', 'സിഎസ് ഡിപ്പാർട്ട്മെന്റ്',
      // Manglish — abbreviations + spoken forms
      'cse department', 'computer dept',
      'cse evide', 'computer science evide', 'computer dept evide',
      'it dept evide', 'cs department evide',
      'cs evide', 'cse engane ponum', 'computer evide',
      'cse department evide', 'it evide', 'it department evide',
      'computer science department evide',
      // Additional Manglish
      'cse ethan', 'computer ethan', 'it ethan',
      'cse pokanam', 'computer science engane ponum',
      'cse vibhagam', 'cs vibhagam',
      'computer science engane ethum', 'it engane ponum',
      'computer department engane ponum',
    ],
    mapsLink: 'https://maps.app.goo.gl/y7epqn9H51K4fBBJ8',
    travelMode: 'walking',
  },
  {
    id: 'ece_dept',
    name: 'ECE Department',
    aliases: [
      // English — full names & abbreviations
      'ece', 'ece department', 'electronics', 'electronics and communication',
      'electronics dept', 'ece dept', 'ec', 'ec department', 'ec dept',
      'electronics and communication engineering', 'ece engg',
      'dept of electronics', 'department of ece',
      'electronics communication', 'electronics engg',
      // Malayalam — full & short forms
      'ഇസിഇ', 'ഇലക്ട്രോണിക്സ്', 'ഇലക്ട്രോണിക്സ് ഡിപ്പാർട്ട്മെന്റ്',
      'ഇസിഇ ഡിപ്പാർട്ട്മെന്റ്', 'ഇലക്ട്രോണിക്സ് വിഭാഗം',
      'ഇലക്ട്രോണിക്സ് ആൻഡ് കമ്മ്യൂണിക്കേഷൻ',
      'ഇസിഇ വിഭാഗം', 'ഇസി', 'ഇസി ഡിപ്പാർട്ട്മെന്റ്',
      'ഇലക്ട്രോണിക്സ് കമ്മ്യൂണിക്കേഷൻ',
      'ഇലക്ട്രോണിക്സ് എഞ്ചിനീയറിംഗ്',
      // Malayalam inflected forms
      'ഇസിഇ ഡിപ്പാർട്ട്മെന്റിലേക്ക്', 'ഇസിഇ ഡിപ്പാർട്ട്മെന്റിലേക്കുള്ള',
      'ഇലക്ട്രോണിക്സ് ഡിപ്പാർട്ട്മെന്റിലേക്ക്',
      'ഇലക്ട്രോണിക്സ് ഡിപ്പാർട്ട്മെന്റിലേക്കുള്ള',
      'ഇലക്ട്രോണിക്സിലേക്ക്', 'ഇലക്ട്രോണിക്സിലേക്കുള്ള',
      // Additional Malayalam
      'ഇലക്ട്രോണിക്സ് എവിടെ', 'ഇസിഇ എവിടെ',
      'ഇലക്ട്രോണിക്സ് എങ്ങനെ പോകും', 'ഇസിഇ എങ്ങനെ പോകും',
      'ഇലക്ട്രോണിക്സ് ലാബ്', 'ഇസി വിഭാഗം',
      'ഇലക്ട്രോണിക്സ് ആൻഡ് കമ്മ്യൂണിക്കേഷൻ വിഭാഗം',
      // Manglish — abbreviations + spoken forms
      'electronics department', 'ece department',
      'ece evide', 'electronics evide', 'electronics dept evide',
      'ec evide', 'ec department evide', 'ece engane ponum',
      'electronics department evide', 'ece department evide',
      // Additional Manglish
      'ece ethan', 'electronics ethan', 'ec ethan',
      'ece pokanam', 'electronics engane ethum',
      'ece vibhagam', 'electronics vibhagam',
      'electronics lab evide', 'ece lab evide',
    ],
    mapsLink: 'https://maps.app.goo.gl/2PvfbFGAkUFjFBjS6',
    travelMode: 'walking',
  },
  {
    id: 'eee_dept',
    name: 'EEE Department',
    aliases: [
      // English — full names & abbreviations
      'eee', 'eee department', 'electrical', 'electrical and electronics',
      'electrical dept', 'eee dept', 'ee', 'ee department', 'ee dept',
      'electrical and electronics engineering', 'eee engg',
      'dept of electrical', 'department of eee',
      'electrical engineering', 'electrical engg',
      // Malayalam — full & short forms
      'ഇഇഇ', 'ഇലക്ട്രിക്കൽ', 'ഇലക്ട്രിക്കൽ ഡിപ്പാർട്ട്മെന്റ്',
      'ഇഇഇ ഡിപ്പാർട്ട്മെന്റ്', 'ഇലക്ട്രിക്കൽ വിഭാഗം',
      'ഇലക്ട്രിക്കൽ ആൻഡ് ഇലക്ട്രോണിക്സ്',
      'ഇഇഇ വിഭാഗം', 'ഇഇ', 'ഇഇ ഡിപ്പാർട്ട്മെന്റ്',
      'ഇലക്ട്രിക്കൽ എഞ്ചിനീയറിംഗ്',
      'ഇലക്ട്രിക്കൽ ആൻഡ് ഇലക്ട്രോണിക്സ് എഞ്ചിനീയറിംഗ്',
      // Malayalam inflected forms
      'ഇഇഇ ഡിപ്പാർട്ട്മെന്റിലേക്ക്', 'ഇഇഇ ഡിപ്പാർട്ട്മെന്റിലേക്കുള്ള',
      'ഇലക്ട്രിക്കൽ ഡിപ്പാർട്ട്മെന്റിലേക്ക്',
      'ഇലക്ട്രിക്കൽ ഡിപ്പാർട്ട്മെന്റിലേക്കുള്ള',
      'ഇലക്ട്രിക്കലിലേക്ക്', 'ഇലക്ട്രിക്കലിലേക്കുള്ള',
      // Additional Malayalam
      'ഇലക്ട്രിക്കൽ എവിടെ', 'ഇഇഇ എവിടെ',
      'ഇലക്ട്രിക്കൽ എങ്ങനെ പോകും', 'ഇഇഇ എങ്ങനെ പോകും',
      'ഇലക്ട്രിക്കൽ ലാബ്', 'ഇഇ വിഭാഗം',
      'ഇലക്ട്രിക്കൽ ആൻഡ് ഇലക്ട്രോണിക്സ് വിഭാഗം',
      'വൈദ്യുതി വിഭാഗം',
      // Manglish — abbreviations + spoken forms
      'electrical department', 'eee department',
      'eee evide', 'electrical evide', 'electrical dept evide',
      'ee evide', 'ee department evide', 'eee engane ponum',
      'electrical department evide', 'eee department evide',
      // Additional Manglish
      'eee ethan', 'electrical ethan', 'ee ethan',
      'eee pokanam', 'electrical engane ethum',
      'eee vibhagam', 'electrical vibhagam',
      'electrical lab evide', 'eee lab evide',
      'vaidyuthi vibhagam',
    ],
    mapsLink: 'https://maps.app.goo.gl/2PvfbFGAkUFjFBjS6',
    travelMode: 'walking',
  },
  {
    id: 'ce_dept',
    name: 'CE Department',
    aliases: [
      // English — full names & abbreviations
      'ce department', 'civil', 'civil engineering',
      'civil dept', 'ce dept', 'ce', 'civil engg',
      'dept of civil', 'department of civil engineering',
      'civil engineering dept', 'ce engg',
      // Malayalam — full & short forms
      'സിഇ', 'സിവിൽ', 'സിവിൽ എഞ്ചിനീയറിംഗ്',
      'സിവിൽ ഡിപ്പാർട്ട്മെന്റ്', 'സിവിൽ വിഭാഗം',
      'സിഇ ഡിപ്പാർട്ട്മെന്റ്', 'സിഇ വിഭാഗം',
      'സിവിൽ എൻജിനീയറിംഗ്',
      // Malayalam inflected forms
      'സിവിലിലേക്ക്', 'സിവിലിലേക്കുള്ള',
      'സിവിൽ ഡിപ്പാർട്ട്മെന്റിലേക്ക്',
      'സിവിൽ ഡിപ്പാർട്ട്മെന്റിലേക്കുള്ള',
      'സിഇ ഡിപ്പാർട്ട്മെന്റിലേക്ക്',
      // Additional Malayalam
      'സിവിൽ എവിടെ', 'സിഇ എവിടെ',
      'സിവിൽ എങ്ങനെ പോകും', 'സിഇ എങ്ങനെ പോകും',
      'സിവിൽ ലാബ്', 'നിർമ്മാണ വിഭാഗം',
      // Manglish — abbreviations + spoken forms
      'civil department', 'civil engineering dept',
      'civil evide', 'ce dept evide', 'civil dept evide',
      'ce evide', 'ce department evide', 'civil engane ponum',
      'civil department evide',
      // Additional Manglish
      'civil ethan', 'ce ethan', 'civil pokanam',
      'civil engane ethum', 'civil vibhagam',
      'ce vibhagam', 'civil lab evide',
      'nirmana vibhagam',
    ],
    mapsLink: 'https://maps.app.goo.gl/2PvfbFGAkUFjFBjS6',
    travelMode: 'walking',
  },

  // ── Academic Facilities ────────────────────────────────────────────────
  {
    id: 'library',
    name: 'Central Library',
    aliases: [
      // English
      'library', 'central library', 'reading room',
      // Malayalam
      'ലൈബ്രറി', 'വായനശാല', 'പുസ്തകശാല', 'സെൻട്രൽ ലൈബ്രറി',
      'ലൈബ്രറിയിലേക്ക്', 'ഗ്രന്ഥശാല',
      'കോളേജ് ലൈബ്രറി', 'റീഡിംഗ് റൂം',
      // Malayalam inflected forms
      'ലൈബ്രറിയിലേക്കുള്ള', 'വായനശാലയിലേക്ക്',
      'വായനശാലയിലേക്കുള്ള', 'പുസ്തകശാലയിലേക്ക്',
      'ഗ്രന്ഥശാലയിലേക്ക്',
      // Additional Malayalam
      'ലൈബ്രറി എവിടെ', 'വായനശാല എവിടെ',
      'ലൈബ്രറി എങ്ങനെ പോകും', 'പുസ്തകം',
      'ലൈബ്രറിയിൽ പോകണം', 'ബുക്ക്',
      // Manglish
      'vayanashala', 'pustakashala', 'library',
      'library evide', 'reading room evide',
      'library engane ponum', 'library ethan',
      // Additional Manglish
      'granthashala', 'library pokanam',
      'library engane ethum', 'vayanashala evide',
      'pustakam evide', 'book evide',
      'reading room engane ponum',
    ],
    mapsLink: 'https://maps.app.goo.gl/uNePErUh3hs4kUWP9',
    travelMode: 'walking',
  },
  {
    id: 'fab_lab',
    name: 'Campus Fab Lab',
    aliases: [
      // English
      'fab lab', 'fablab', 'fabrication lab', 'fabrication laboratory',
      // Malayalam
      'ഫാബ് ലാബ്', 'ഫാബ്രിക്കേഷൻ ലാബ്',
      'ഫാബ്‌ലാബ്', 'ക്യാമ്പസ് ഫാബ് ലാബ്',
      // Malayalam inflected forms
      'ഫാബ് ലാബിലേക്ക്', 'ഫാബ് ലാബിലേക്കുള്ള',
      'ഫാബ്രിക്കേഷൻ ലാബിലേക്ക്',
      // Additional Malayalam
      'ഫാബ് ലാബ് എവിടെ', 'ഫാബ്രിക്കേഷൻ ലാബ് എവിടെ',
      'ഫാബ് ലാബ് എങ്ങനെ പോകും',
      // Manglish
      'fab lab', 'fablab',
      'fab lab evide', 'fabrication lab evide',
      // Additional Manglish
      'fab lab engane ponum', 'fab lab ethan',
      'fablab evide', 'fabrication lab engane ponum',
    ],
    mapsLink: 'https://maps.app.goo.gl/3rz8e5WXZ3UytSze7',
    travelMode: 'walking',
  },
  {
    id: 'computer_lab',
    name: 'Computer Lab',
    aliases: [
      // English
      'computer lab', 'comp lab', 'computing lab', 'pc lab',
      // Malayalam
      'കമ്പ്യൂട്ടർ ലാബ്', 'കമ്പ്യൂട്ടർ ലാബിലേക്ക്',
      'കമ്പ്യൂട്ടിംഗ് ലാബ്', 'പിസി ലാബ്',
      'കോമ്പ് ലാബ്',
      // Malayalam inflected forms
      'കമ്പ്യൂട്ടർ ലാബിലേക്കുള്ള',
      'ലാബിലേക്ക്', 'ലാബിലേക്കുള്ള',
      // Additional Malayalam
      'കമ്പ്യൂട്ടർ ലാബ് എവിടെ', 'കമ്പ്യൂട്ടർ ലാബ് എങ്ങനെ പോകും',
      'ലാബ് എവിടെ', 'പിസി ലാബ് എവിടെ',
      // Manglish
      'computer lab', 'comp lab',
      'computer lab evide', 'comp lab evide',
      // Additional Manglish
      'computer lab engane ponum', 'lab evide',
      'pc lab evide', 'computer lab ethan',
      'comp lab engane ponum',
    ],
    mapsLink: 'https://maps.app.goo.gl/jKVxbxhyhhuu5Bk5A',
    travelMode: 'walking',
  },
  {
    id: 'reprographic_centre',
    name: 'Reprographic Centre',
    aliases: [
      // English
      'reprographic centre', 'reprographic center', 'xerox', 'photocopy',
      'print shop', 'printing', 'reprography',
      // Malayalam
      'സെറോക്സ്', 'ഫോട്ടോകോപ്പി', 'പ്രിന്റിംഗ്',
      'റീപ്രോഗ്രാഫിക് സെന്റർ', 'പ്രിന്റ് ഷോപ്പ്',
      'സെറോക്സ് കട', 'കോപ്പി', 'പ്രിന്റ്',
      // Malayalam inflected forms
      'സെറോക്സിലേക്ക്', 'സെറോക്സിലേക്കുള്ള',
      'ഫോട്ടോകോപ്പിയിലേക്ക്', 'പ്രിന്റിംഗിലേക്ക്',
      // Additional Malayalam
      'സെറോക്സ് എവിടെ', 'ഫോട്ടോകോപ്പി എവിടെ',
      'പ്രിന്റ് എടുക്കണം', 'കോപ്പി എടുക്കണം',
      'സെറോക്സ് കട എവിടെ', 'പ്രിന്റിംഗ് എവിടെ',
      // Manglish
      'xerox shop', 'photocopy center', 'printing shop',
      'xerox evide', 'photocopy evide', 'printing evide',
      'xerox kadayil', 'xerox shop evide',
      // Additional Manglish
      'xerox engane ponum', 'xerox ethan',
      'print edukkaan', 'copy edukkaan',
      'xerox kada evide', 'photocopy engane ponum',
      'printing engane ponum', 'xerox kada',
    ],
    mapsLink: 'https://maps.app.goo.gl/FZ72xAAczEwk2mgi7',
    travelMode: 'walking',
  },

  // ── Sports & Recreation ────────────────────────────────────────────────
  {
    id: 'sports_area',
    name: 'Multipurpose Sports Area',
    aliases: [
      // English
      'sports area', 'multipurpose sports', 'sports complex', 'sports',
      // Malayalam
      'സ്പോർട്സ്', 'കായിക മൈതാനം', 'സ്പോർട്സ് ഏരിയ',
      'കായിക സമുച്ചയം', 'സ്പോർട്സ് കോംപ്ലക്സ്',
      'കായികം', 'കളിക്കളം', 'സ്പോർട്സ് ഗ്രൗണ്ട്',
      // Malayalam inflected forms
      'സ്പോർട്സിലേക്ക്', 'സ്പോർട്സിലേക്കുള്ള',
      'കായിക മൈതാനത്തിലേക്ക്', 'കായിക മൈതാനത്തിലേക്കുള്ള',
      'കളിക്കളത്തിലേക്ക്',
      // Additional Malayalam
      'സ്പോർട്സ് എവിടെ', 'കളിക്കളം എവിടെ',
      'കായിക മൈതാനം എവിടെ', 'കളിക്കാൻ',
      'സ്പോർട്സ് എങ്ങനെ പോകും',
      // Manglish
      'sports area', 'sports complex', 'sports ground',
      'sports evide', 'sports area evide',
      'kayika maidanam', 'kayika samuchayam',
      // Additional Manglish
      'sports engane ponum', 'sports ethan',
      'kalikkalam evide', 'kalikkaan',
      'sports complex evide', 'kayikam evide',
    ],
    mapsLink: 'https://maps.app.goo.gl/7udrNyuqcpqFt9QdA',
    travelMode: 'walking',
  },
  {
    id: 'football_ground',
    name: 'LBS College Football Ground',
    aliases: [
      // English
      'football ground', 'football field', 'playground', 'ground',
      'sports ground', 'play ground', 'maidan',
      // Malayalam
      'ഗ്രൗണ്ട്', 'കളിസ്ഥലം', 'മൈതാനം', 'ഫുട്ബോൾ',
      'ഫുട്ബോൾ ഗ്രൗണ്ട്', 'കളിക്കളം',
      'ഫുട്ബോൾ മൈതാനം', 'പ്ലേഗ്രൗണ്ട്',
      'ഫുട്ബോൾ ഫീൽഡ്', 'കളിസ്ഥലത്തേക്ക്',
      // Malayalam inflected forms
      'ഗ്രൗണ്ടിലേക്ക്', 'ഗ്രൗണ്ടിലേക്കുള്ള',
      'മൈതാനത്തിലേക്ക്', 'മൈതാനത്തിലേക്കുള്ള',
      'ഫുട്ബോളിലേക്ക്', 'കളിക്കളത്തിലേക്ക്',
      // Additional Malayalam
      'ഗ്രൗണ്ട് എവിടെ', 'മൈതാനം എവിടെ',
      'ഫുട്ബോൾ എവിടെ', 'കളിക്കാൻ പോകണം',
      'ഫുട്ബോൾ കളിക്കാൻ', 'ഗ്രൗണ്ട് എങ്ങനെ പോകും',
      // Manglish
      'football ground', 'ground', 'maidan', 'kali sthalam',
      'ground evide', 'football evide', 'maidan evide',
      'kalikalam', 'kalikkalam',
      // Additional Manglish
      'ground engane ponum', 'football engane ponum',
      'football ground evide', 'maidanam evide',
      'playground evide', 'football kalikkaan',
      'ground ethan', 'football ethan',
    ],
    mapsLink: 'https://maps.app.goo.gl/UQFXPxeNAibXndGg8',
    travelMode: 'walking',
  },
  {
    id: 'sevens_ground',
    name: "Football Ground (7's Ground)",
    aliases: [
      // English
      '7s ground', 'sevens ground', "seven's ground", '7 ground',
      'sevens', '7s',
      // Malayalam
      'സെവൻസ് ഗ്രൗണ്ട്', '7സ് ഗ്രൗണ്ട്',
      'സെവൻസ്', 'ഏഴിന്റെ ഗ്രൗണ്ട്',
      // Malayalam inflected forms
      'സെവൻസ് ഗ്രൗണ്ടിലേക്ക്', 'സെവൻസ് ഗ്രൗണ്ടിലേക്കുള്ള',
      'സെവൻസിലേക്ക്',
      // Additional Malayalam
      'സെവൻസ് എവിടെ', 'സെവൻസ് ഗ്രൗണ്ട് എവിടെ',
      '7സ് എവിടെ', 'ഏഴിന്റെ ഗ്രൗണ്ട് എവിടെ',
      // Manglish
      'sevens ground', '7s ground',
      'sevens evide', 'sevens ground evide',
      // Additional Manglish
      '7s evide', 'sevens engane ponum', 'sevens ethan',
      '7s ground evide', 'sevens ground engane ponum',
    ],
    mapsLink: 'https://maps.app.goo.gl/Ac3hF8A5NzUYAUXX9',
    travelMode: 'walking',
  },

  // ── Student Amenities ──────────────────────────────────────────────────
  {
    id: 'mens_hostel',
    name: "Men's Hostel",
    aliases: [
      // English
      'mens hostel', "men's hostel", 'boys hostel', "boys' hostel", 'male hostel',
      'hostel boys',
      // Malayalam
      'ബോയ്സ് ഹോസ്റ്റൽ', 'ആൺ ഹോസ്റ്റൽ', 'ഹോസ്റ്റൽ',
      'ആൺകുട്ടികളുടെ ഹോസ്റ്റൽ',
      'മെൻസ് ഹോസ്റ്റൽ', 'പുരുഷ ഹോസ്റ്റൽ',
      // Malayalam inflected forms
      'ഹോസ്റ്റലിലേക്ക്', 'ഹോസ്റ്റലിലേക്കുള്ള',
      'ബോയ്സ് ഹോസ്റ്റലിലേക്ക്', 'ബോയ്സ് ഹോസ്റ്റലിലേക്കുള്ള',
      'ആൺ ഹോസ്റ്റലിലേക്ക്',
      // Additional Malayalam
      'ഹോസ്റ്റൽ എവിടെ', 'ബോയ്സ് ഹോസ്റ്റൽ എവിടെ',
      'ആൺ ഹോസ്റ്റൽ എവിടെ', 'ഹോസ്റ്റൽ എങ്ങനെ പോകും',
      'ആൺകുട്ടികളുടെ ഹോസ്റ്റൽ എവിടെ',
      // Manglish
      'boys hostel', 'mens hostel', 'hostel boys', 'boys hostel evide',
      'hostel evide', 'aankuttikalude hostel',
      'mens hostel evide', 'hostel engane ponum',
      // Additional Manglish
      'hostel ethan', 'boys hostel engane ponum',
      'aan hostel evide', 'aan hostel',
      'hostel pokanam', 'boys hostel ethan',
      'purusha hostel evide',
    ],
    mapsLink: 'https://maps.app.goo.gl/LsvhTeDypf263vEB7',
    travelMode: 'walking',
  },
  {
    id: 'womens_hostel',
    name: "Shahanas Hostel (Ladies Hostel)",
    aliases: [
      // English
      'womens hostel', "women's hostel", 'girls hostel', "girls' hostel",
      'female hostel', 'ladies hostel', 'shahanas hostel', 'shahanas',
      'hostel girls',
      // Malayalam
      'ഗേൾസ് ഹോസ്റ്റൽ', 'പെൺ ഹോസ്റ്റൽ',
      'പെൺകുട്ടികളുടെ ഹോസ്റ്റൽ', 'ലേഡീസ് ഹോസ്റ്റൽ',
      'ഷഹാനാസ് ഹോസ്റ്റൽ', 'ഷഹാനാസ്',
      'വിമൻസ് ഹോസ്റ്റൽ', 'സ്ത്രീ ഹോസ്റ്റൽ',
      // Malayalam inflected forms
      'ഗേൾസ് ഹോസ്റ്റലിലേക്ക്', 'ഗേൾസ് ഹോസ്റ്റലിലേക്കുള്ള',
      'പെൺ ഹോസ്റ്റലിലേക്ക്', 'ലേഡീസ് ഹോസ്റ്റലിലേക്ക്',
      'ഷഹാനാസിലേക്ക്', 'ഷഹാനാസിലേക്കുള്ള',
      // Additional Malayalam
      'ഗേൾസ് ഹോസ്റ്റൽ എവിടെ', 'പെൺ ഹോസ്റ്റൽ എവിടെ',
      'ലേഡീസ് ഹോസ്റ്റൽ എവിടെ', 'ഷഹാനാസ് എവിടെ',
      'പെൺകുട്ടികളുടെ ഹോസ്റ്റൽ എവിടെ',
      'ഷഹാനാസ് ഹോസ്റ്റൽ എവിടെ',
      // Manglish
      'girls hostel', 'ladies hostel', 'shahanas', 'hostel girls',
      'girls hostel evide', 'ladies hostel evide',
      'penkuttikalude hostel', 'shahanas evide',
      // Additional Manglish
      'shahanas hostel evide', 'shahanas engane ponum',
      'girls hostel engane ponum', 'ladies hostel engane ponum',
      'pen hostel evide', 'girls hostel ethan',
      'shahanas ethan', 'sthree hostel evide',
    ],
    mapsLink: 'https://maps.app.goo.gl/YatNVBSMh2kk34N76',
    travelMode: 'walking',
  },
  {
    id: 'canteen',
    name: 'College Canteen',
    aliases: [
      // English
      'canteen', 'mess', 'food court', 'cafeteria',
      // Malayalam
      'കാന്റീൻ', 'കാൻറീന', 'മെസ്സ്', 'ഭക്ഷണശാല',
      'കോളേജ് കാന്റീൻ', 'ഊണ്', 'ചായക്കട',
      'ഭക്ഷണം', 'ചായ', 'കഫറ്റീരിയ',
      // Malayalam inflected forms
      'കാന്റീനിലേക്ക്', 'കാന്റീനിലേക്കുള്ള',
      'മെസ്സിലേക്ക്', 'ഭക്ഷണശാലയിലേക്ക്',
      'ചായക്കടയിലേക്ക്', 'ചായക്കടയിലേക്കുള്ള',
      // Additional Malayalam
      'കാന്റീൻ എവിടെ', 'ഭക്ഷണം എവിടെ',
      'ചായ എവിടെ', 'മെസ്സ് എവിടെ',
      'ഊണ് എവിടെ', 'കാന്റീൻ എങ്ങനെ പോകും',
      'ഭക്ഷണം കഴിക്കണം', 'ചായ കുടിക്കണം',
      // Manglish
      'canteen', 'mess', 'bhakshanashala', 'chaykada',
      'canteen evide', 'mess evide',
      'canteen engane ponum', 'food evide',
      'oonu', 'chaya', 'chaya kadayil',
      // Additional Manglish
      'canteen ethan', 'mess ethan', 'bhakshanam evide',
      'bhakshanam kazhikkaan', 'chaya kudikkaan',
      'oonu evide', 'chaya evide', 'food kazhikkaan',
      'canteen engane ethum', 'mess engane ponum',
      'cafeteria evide',
    ],
    mapsLink: 'https://maps.app.goo.gl/rCmEM7mRmDZ5aGzx8',
    travelMode: 'walking',
  },
  {
    id: 'atm',
    name: 'College ATM (SBI ATM)',
    aliases: [
      // English
      'atm', 'sbi atm', 'bank', 'sbi', 'atm machine',
      // Malayalam
      'എടിഎം', 'ബാങ്ക്', 'എസ്ബിഐ', 'എസ്ബിഐ എടിഎം',
      'പണം', 'കാശ്', 'എടിഎം മെഷീൻ',
      'കോളേജ് എടിഎം', 'പൈസ',
      // Malayalam inflected forms
      'എടിഎമ്മിലേക്ക്', 'എടിഎമ്മിലേക്കുള്ള',
      'ബാങ്കിലേക്ക്', 'ബാങ്കിലേക്കുള്ള',
      'എസ്ബിഐയിലേക്ക്',
      // Additional Malayalam
      'എടിഎം എവിടെ', 'ബാങ്ക് എവിടെ',
      'പണം എവിടെ', 'കാശ് എടുക്കണം',
      'പൈസ എടുക്കണം', 'എടിഎം എങ്ങനെ പോകും',
      // Manglish
      'atm evide', 'sbi atm', 'bank evide', 'paisa',
      'atm engane ponum', 'cash evide', 'kaash',
      'panam evide', 'atm machine evide',
      // Additional Manglish
      'atm ethan', 'bank ethan', 'paisa edukkaan',
      'kaash edukkaan', 'panam edukkaan',
      'atm engane ethum', 'bank engane ponum',
      'sbi evide', 'money evide',
    ],
    mapsLink: 'https://maps.app.goo.gl/Bjvi4taHV9gabc3bA',
    travelMode: 'walking',
  },
  {
    id: 'bus_garage',
    name: 'Bus Garage / Transport Area',
    aliases: [
      // English
      'bus garage', 'transport area', 'bus stop', 'bus stand', 'garage',
      'bus area', 'transport',
      // Malayalam
      'ബസ് ഗാരേജ്', 'ബസ് സ്റ്റോപ്പ്', 'ബസ് സ്റ്റാൻഡ്',
      'ട്രാൻസ്പോർട്ട്', 'ഗാരേജ്',
      'ബസ്', 'ബസ് ഏരിയ', 'ട്രാൻസ്പോർട്ട് ഏരിയ',
      // Malayalam inflected forms
      'ബസ് ഗാരേജിലേക്ക്', 'ബസ് ഗാരേജിലേക്കുള്ള',
      'ബസ് സ്റ്റോപ്പിലേക്ക്', 'ബസ് സ്റ്റാൻഡിലേക്ക്',
      'ഗാരേജിലേക്ക്', 'ഗാരേജിലേക്കുള്ള',
      // Additional Malayalam
      'ബസ് എവിടെ', 'ബസ് സ്റ്റോപ്പ് എവിടെ',
      'ഗാരേജ് എവിടെ', 'ബസ് എങ്ങനെ പോകും',
      'ബസ് കയറണം', 'ബസ് സ്റ്റാൻഡ് എവിടെ',
      // Manglish
      'bus garage', 'bus stop', 'bus stand', 'garage',
      'bus garage evide', 'bus stop evide',
      'transport evide', 'garage evide',
      // Additional Manglish
      'bus evide', 'bus engane ponum', 'bus ethan',
      'bus kayaraan', 'bus stand evide',
      'bus stop engane ponum', 'garage engane ponum',
      'bus area evide', 'transport area evide',
    ],
    mapsLink: 'https://maps.app.goo.gl/9WUemftWwmGohsRW8',
    travelMode: 'walking',
  },
  {
    id: 'malloc',
    name: 'Malloc',
    aliases: [
      // English
      'malloc', 'mal lock',
      // Malayalam
      'മാലോക്ക്', 'മാലോക്', 'മാലൊക്ക്',
      // Malayalam inflected forms
      'മാലോക്കിലേക്ക്', 'മാലോക്കിലേക്കുള്ള',
      // Additional Malayalam
      'മാലോക്ക് എവിടെ', 'മാലോക്ക് എങ്ങനെ പോകും',
      // Manglish
      'malloc', 'malloc evide',
      // Additional Manglish
      'malloc engane ponum', 'malloc ethan',
      'maalokk evide', 'maalokk',
    ],
    mapsLink: 'https://maps.app.goo.gl/YSNeu8quVya8Q2rG7',
    travelMode: 'walking',
  },
  {
    id: 'coop_society',
    name: 'Student Co-Operative Society',
    aliases: [
      // English
      'co-operative society', 'cooperative society', 'co operative',
      'student coop', 'coop', 'society store', 'stationary shop',
      // Malayalam
      'സഹകരണ സംഘം', 'സൊസൈറ്റി', 'സ്റ്റേഷനറി ഷോപ്പ്',
      'സ്റ്റുഡന്റ് സൊസൈറ്റി', 'കോ-ഓപ്പറേറ്റീവ്',
      'സ്റ്റേഷനറി', 'കട', 'സ്റ്റോർ',
      // Malayalam inflected forms
      'സൊസൈറ്റിയിലേക്ക്', 'സൊസൈറ്റിയിലേക്കുള്ള',
      'സഹകരണ സംഘത്തിലേക്ക്',
      'സ്റ്റേഷനറി ഷോപ്പിലേക്ക്', 'കടയിലേക്ക്',
      // Additional Malayalam
      'സൊസൈറ്റി എവിടെ', 'സ്റ്റേഷനറി എവിടെ',
      'കട എവിടെ', 'സഹകരണ സംഘം എവിടെ',
      'പേന വേണം', 'നോട്ട്ബുക്ക് വേണം',
      // Manglish
      'cooperative', 'society', 'stationary shop', 'coop society',
      'society evide', 'cooperative evide',
      'stationery shop evide', 'sahakkarana sangham',
      // Additional Manglish
      'society engane ponum', 'coop evide',
      'stationery evide', 'kada evide',
      'pena venam', 'notebook venam',
      'society ethan', 'store evide',
    ],
    mapsLink: 'https://maps.app.goo.gl/vZdwXwC62odZn53G7',
    travelMode: 'walking',
  },

  // ── Infrastructure ─────────────────────────────────────────────────────
  {
    id: 'electrical_control_room',
    name: 'Electrical Control Room',
    aliases: [
      // English
      'electrical control room', 'control room', 'power room',
      // Malayalam
      'ഇലക്ട്രിക്കൽ കൺട്രോൾ റൂം', 'കൺട്രോൾ റൂം',
      'പവർ റൂം', 'ഇലക്ട്രിക്കൽ റൂം',
      // Malayalam inflected forms
      'കൺട്രോൾ റൂമിലേക്ക്', 'കൺട്രോൾ റൂമിലേക്കുള്ള',
      'പവർ റൂമിലേക്ക്',
      // Additional Malayalam
      'കൺട്രോൾ റൂം എവിടെ', 'പവർ റൂം എവിടെ',
      'ഇലക്ട്രിക്കൽ റൂം എവിടെ',
      // Manglish
      'control room', 'power room', 'electrical room',
      'control room evide', 'power room evide',
      // Additional Manglish
      'control room engane ponum', 'power room engane ponum',
      'electrical room evide', 'control room ethan',
    ],
    mapsLink: 'https://maps.app.goo.gl/NdGXX3SKfzGHnFnq8',
    travelMode: 'walking',
  },
  {
    id: 'l_block',
    name: 'L-Block',
    aliases: [
      // English
      'l block', 'l-block', 'l building',
      // Malayalam
      'എൽ ബ്ലോക്ക്', 'എൽ ബിൽഡിംഗ്',
      'എൽബ്ലോക്ക്',
      // Malayalam inflected forms
      'എൽ ബ്ലോക്കിലേക്ക്', 'എൽ ബ്ലോക്കിലേക്കുള്ള',
      // Additional Malayalam
      'എൽ ബ്ലോക്ക് എവിടെ', 'എൽ ബ്ലോക്ക് എങ്ങനെ പോകും',
      // Manglish
      'l block', 'l building',
      'l block evide', 'l building evide',
      // Additional Manglish
      'l block engane ponum', 'l block ethan',
      'el block evide', 'el block',
    ],
    mapsLink: 'https://maps.app.goo.gl/zeqxnoZuk7fuG6iQ9',
    travelMode: 'walking',
  },
  {
    id: 'auditorium',
    name: 'LBS College Auditorium',
    aliases: [
      // English
      'auditorium', 'audi', 'main hall', 'college auditorium',
      // Malayalam
      'ഓഡിറ്റോറിയം', 'ഹാൾ', 'സഭാഹാൾ',
      'കോളേജ് ഓഡിറ്റോറിയം', 'ഓഡി',
      'മെയിൻ ഹാൾ', 'സഭാ ഹാൾ',
      // Malayalam inflected forms
      'ഓഡിറ്റോറിയത്തിലേക്ക്', 'ഓഡിറ്റോറിയത്തിലേക്കുള്ള',
      'ഹാളിലേക്ക്', 'ഹാളിലേക്കുള്ള',
      'ഓഡിയിലേക്ക്',
      // Additional Malayalam
      'ഓഡിറ്റോറിയം എവിടെ', 'ഹാൾ എവിടെ',
      'ഓഡി എവിടെ', 'സഭാഹാൾ എവിടെ',
      'ഓഡിറ്റോറിയം എങ്ങനെ പോകും', 'സമ്മേളന ഹാൾ',
      'പരിപാടി ഹാൾ', 'ഫങ്ക്ഷൻ ഹാൾ',
      // Manglish
      'auditorium', 'audi', 'hall',
      'auditorium evide', 'audi evide', 'hall evide',
      'oditorium', 'sabha hall',
      // Additional Manglish
      'auditorium engane ponum', 'audi engane ponum',
      'auditorium ethan', 'audi ethan',
      'hall engane ponum', 'sammelana hall',
      'function hall evide', 'paripadi hall',
    ],
    mapsLink: 'https://maps.app.goo.gl/w6ca3FteXcAmgKiC6',
    travelMode: 'walking',
  },
];

/**
 * Get all campus location names for display/suggestion purposes
 */
export function getAllLocationNames(): string[] {
  return campusLocations.map((loc) => loc.name);
}

// ─── Intent Types ─────────────────────────────────────────────────────────

export type IntentType =
  | 'OPEN_MAP'
  | 'SHOW_ROUTE'
  | 'SHOW_LOCATION'
  | 'ASK_LOCATION'
  | 'NAVIGATE'
  | 'UNKNOWN';

/**
 * Map / Navigation related intents
 * These are matched BEFORE location matching
 */
export const navigationIntents: Record<IntentType, string[]> = {
  // ── Open map explicitly ─────────────────────────────
  OPEN_MAP: [
    // English
    'open map',
    'open google map',
    'open maps',
    'open location map',

    // Malayalam
    'മാപ്പ് തുറക്കൂ',
    'ഗൂഗിൾ മാപ്പ് തുറക്കൂ',
    'മാപ്പ് ഓപ്പൺ ചെയ്യൂ',
    'മാപ്പ് ഓപ്പൺ ചെയ്യ്',
    'മാപ്പ് തുറക്ക്',
    'ഗൂഗിൾ മാപ്പ് ഓപ്പൺ ചെയ്യ്',
    'മാപ്പ് കാണിക്ക്',
    'മാപ്പ് കാണിക്കൂ',
    'മാപ്പിൽ കാണിക്ക്',
    'ലൊക്കേഷൻ മാപ്പിൽ കാണിക്കൂ',

    // Additional Malayalam
    'മാപ്പ് എടുക്ക്',
    'ഗൂഗിൾ മാപ്പ് എടുക്ക്',
    'ലൊക്കേഷൻ മാപ്പ് തുറക്കൂ',
    'മാപ്പ് നോക്കൂ',
    'മാപ്പ് നോക്ക്',
    'ഗൂഗിൾ മാപ്പ്സ് തുറക്കൂ',

    // Manglish
    'map open cheyyu',
    'google map open cheyyu',
    'map thurakku',
    'map thurakk',
    'google map thurakku',
    'map kanikku',
    'mappil kanikku',
    'map edukku',
    'map nokkoo',
    'map nokk',
    'google maps thurakku',
    'map open aakku',
    'map open cheyyoo',
  ],

  // ── Show route / directions ─────────────────────────
  SHOW_ROUTE: [
    // English
    'show route',
    'get route',
    'route to',
    'directions to',
    'how to go',
    'way to',
    'how to reach',
    'how do i get to',
    'which way',
    'path to',

    // Malayalam
    'വഴി കാണിക്കൂ',
    'റൂട്ട് കാണിക്കൂ',
    'എങ്ങനെ പോകാം',
    'വഴി എവിടെ',
    'റൂട്ട്',
    'എങ്ങനെ പോണം',
    'എങ്ങനെ പോവും',
    'എങ്ങനെ എത്തും',
    'എങ്ങനെ എത്താം',
    'എങ്ങനെ പോകണം',
    'എങ്ങനെയാ പോകുന്നത്',
    'എങ്ങനെയാ എത്തുന്നത്',
    'എങ്ങനെയാ പോവുക',
    'എവിടെ വഴി',
    'ഏത് വഴി',
    'ഏതു വഴി',
    'ഏത് വഴിയാ',
    'ഏത് വഴിക്ക്',
    'ഏതു ഭാഗത്ത്',
    'ഏതു ഭാഗത്താ',
    'ഏതു ദിശയിൽ',
    'ഏത് ദിക്കിലാ',
    'വഴി പറയൂ',
    'വഴി പറഞ്ഞു തരൂ',
    'ദിശ കാണിക്കൂ',
    'ദിശ പറയൂ',
    'വഴി പറഞ്ഞുതരാമോ',
    'റൂട്ട് പറയൂ',
    'റൂട്ട് പറഞ്ഞുതരൂ',

    // Additional Malayalam
    'വഴി എവിടെയാ',
    'വഴി പറഞ്ഞു തരാമോ',
    'എങ്ങനെയാണ് പോകുക',
    'എങ്ങനാ പോവുക',
    'വഴി ഏതാ',
    'ഏതു റൂട്ട്',
    'ഡയറക്ഷൻ കാണിക്ക്',
    'ഡയറക്ഷൻ പറയൂ',
    'റോഡ് കാണിക്ക്',
    'ഏതു വഴിക്കാ',

    // Manglish
    'route kanikku',
    'vazhi kanikku',
    'engane pogam',
    'route evide',
    'engane ponam',
    'engane povum',
    'engane ethum',
    'engane ethaam',
    'engane pokanam',
    'vazhi parayoo',
    'vazhi paranju tharoo',
    'ethu vazhi',
    'ethu vazhiya',
    'ethu vazhikk',
    'ethu bhagath',
    'ethu disayil',
    'route parayoo',
    'route thaa',
    'vazhi evideya',
    'engane pooka',
    'enganaa povuka',
    'route paranju tharoo',
    'direction kanikku',
    'direction parayoo',
    'road kanikku',
    'ethu vazhikka',
    'ethu routila',
  ],

  // ── Just show the location (pin) ────────────────────
  SHOW_LOCATION: [
    // English
    'show location',
    'show place',
    'location please',
    'map location',
    'show on map',
    'point on map',

    // Malayalam
    'ലൊക്കേഷൻ കാണിക്കൂ',
    'സ്ഥലം കാണിക്കൂ',
    'ഇവിടെ കാണിക്കൂ',
    'ലൊക്കേഷൻ കാണിക്ക്',
    'സ്ഥലം കാണിക്ക്',
    'മാപ്പിൽ കാണിക്കൂ',
    'മാപ്പിൽ കാണിക്ക്',
    'ലൊക്കേഷൻ തരൂ',
    'ലൊക്കേഷൻ തരാമോ',
    'സ്ഥലം എവിടാ',
    'സ്ഥലം എവിടെ',
    'ലൊക്കേഷൻ എവിടാ',

    // Additional Malayalam
    'ലൊക്കേഷൻ എവിടെ',
    'ലൊക്കേഷൻ പറയൂ',
    'ലൊക്കേഷൻ പറഞ്ഞു തരൂ',
    'സ്ഥലം പറയൂ',
    'സ്ഥലം പറഞ്ഞു തരൂ',
    'ഇത് എവിടെ ഉള്ളത്',
    'മാപ്പിൽ കാണിക്കാമോ',

    // Manglish
    'location kanikku',
    'place kanikku',
    'location tharoo',
    'location tharamo',
    'mappil kanikku',
    'sthalam evida',
    'location evida',
    'location parayoo',
    'location paranju tharoo',
    'sthalam parayoo',
    'sthalam paranju tharoo',
    'ithu evide ullathu',
    'mappil kaanikkamo',
    'location nokku',
  ],

  // ── Ask where a place is ────────────────────────────
  ASK_LOCATION: [
    // English
    'where is',
    'where is the',
    'where can i find',
    'which side is',
    'location of',

    // Malayalam
    'എവിടെയാണ്',
    'എവിടെയുണ്ട്',
    'എവിടാ',
    'എവിടെ ആണ്',
    'എവിടെ ഉണ്ട്',
    'എവിടെ',
    'എവിടെയാ',
    'എവിടാണ്',
    'എവിടെയാണ് ഉള്ളത്',
    'എവിടെ ഉള്ളത്',
    'ഏത് ഭാഗത്ത്',
    'ഏതു ഭാഗത്താ',
    'ഏത് ഭാഗത്താണ്',
    'ഏത് സൈഡിലാ',
    'ഏത് ഫ്ലോറിലാ',
    'ഏത് നിലയിലാ',
    'ഏത് കെട്ടിടത്തിലാ',
    'ഏത് ബ്ലോക്കിലാ',
    'എവിടെ കിടക്കുന്നത്',
    'എവിടെ ഉള്ളതാ',
    'ഇത് എവിടെ',
    'അത് എവിടെ',
    'ഇത് എവിടാ',
    'അത് എവിടാ',

    // Additional Malayalam
    'ഇത് എവിടെയാ',
    'അത് എവിടെയാ',
    'ഏടാ',
    'ഏട',
    'ഏടെ',
    'ഏത് ഫ്ലോറിലാണ്',
    'ഏത് നിലയിലാണ്',
    'ഏത് ബ്ലോക്കിലാണ്',
    'ഏത് കെട്ടിടത്തിലാണ്',
    'എവിടെ ഇരിക്കുന്നത്',
    'എവിടെ കാണും',
    'പറയാമോ എവിടെയാണ്',

    // Manglish
    'evide aanu',
    'evide undu',
    'evide',
    'evideya',
    'evidaanu',
    'evideyannu ullath',
    'evide ullath',
    'ethu bhagathu',
    'ethu bhagathaa',
    'ethu sidila',
    'ethu blockila',
    'evide kidakkunnathu',
    'evide ullathu',
    'ithu evide',
    'athu evide',
    'ithu evideya',
    'athu evideya',
    'eda',
    'ede',
    'ethu floorila aanu',
    'ethu nilayila aanu',
    'ethu blockila aanu',
    'evide irikkunnath',
    'evide kaanum',
    'parayaamo evideya',
  ],

  // ── Navigation / take me there ──────────────────────
  NAVIGATE: [
    // English
    'navigate to',
    'take me to',
    'go to',
    'i want to go to',
    'i need to go to',
    'bring me to',

    // Malayalam
    'അവിടെ കൊണ്ടുപോ',
    'അവിടേക്ക് പോകണം',
    'കൊണ്ടുപോകൂ',
    'അവിടെ കൊണ്ടുപോകൂ',
    'അവിടേക്ക് കൊണ്ടുപോ',
    'അവിടേക്ക് പോണം',
    'അവിടേക്ക് പോവണം',
    'പോകണം',
    'പോവണം',
    'പോണം',
    'എത്തണം',
    'എനിക്ക് പോകണം',
    'എനിക്ക് എത്തണം',
    'ഞാൻ പോകണം',
    'അങ്ങോട്ട് പോകണം',
    'അങ്ങോട്ട് കൊണ്ടുപോ',
    'അങ്ങോട്ട് പോണം',
    'നാവിഗേറ്റ് ചെയ്യ്',
    'നാവിഗേറ്റ് ചെയ്യൂ',
    'വഴി നടത്തൂ',

    // Additional Malayalam
    'നാവിഗേറ്റ് ചെയ്യണം',
    'അവിടേക്ക് കൊണ്ടുപോകണം',
    'അവിടേക്ക് എത്തിക്ക്',
    'അങ്ങോട്ട് എത്തിക്ക്',
    'അവിടേക്ക് പോയിക്കോ',
    'പോയിക്കോ',
    'എത്തിക്കൂ',
    'അവിടേക്ക് വഴി നടത്തൂ',
    'കൊണ്ടുപോകൂ',
    'അങ്ങോട്ട് പോവാം',

    // Manglish
    'avidekku pokanam',
    'take me avide',
    'navigate cheyyu',
    'avidekku ponam',
    'avidekku povaanam',
    'pokanam',
    'ponam',
    'ethanam',
    'enikku pokanam',
    'enikku ethanam',
    'njan pokanam',
    'angottu pokanam',
    'angottu ponam',
    'angottu kondupo',
    'navigate cheyy',
    'navigate cheyyanum',
    'avidekku kondupokanum',
    'avidekku ethikk',
    'angottu ethikk',
    'avidekku poyikko',
    'poyikko',
    'ethikkoo',
    'vazhi nadathoo',
    'kondupokoo',
    'angottu povaam',
  ],

  // ── Unknown / fallback ──────────────────────────────
  UNKNOWN: [],
};

// ─── Intent Matching ──────────────────────────────────────────────────────

/**
 * Matches user text against navigationIntents and returns the detected IntentType.
 * Returns 'UNKNOWN' if no intent matches.
 */
export function matchIntent(text: string): IntentType {
  if (!text || !text.trim()) return 'UNKNOWN';

  const normalizedText = text.toLowerCase().trim();

  // Check each intent type (skip UNKNOWN)
  const intentTypes: IntentType[] = ['OPEN_MAP', 'SHOW_ROUTE', 'SHOW_LOCATION', 'ASK_LOCATION', 'NAVIGATE'];

  for (const intentType of intentTypes) {
    const phrases = navigationIntents[intentType];
    for (const phrase of phrases) {
      if (normalizedText.includes(phrase.toLowerCase())) {
        return intentType;
      }
    }
  }

  return 'UNKNOWN';
}

/**
 * Finds a campus location by its ID.
 * Returns null if no location with the given ID exists.
 */
export function findLocationById(id: string): CampusLocation | null {
  if (!id) return null;
  return campusLocations.find((loc) => loc.id === id) || null;
}
