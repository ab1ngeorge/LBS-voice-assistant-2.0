/**
 * Extract FALLBACK_KNOWLEDGE sections from index.ts and generate SQL INSERT statements.
 * Run: node generate_seed.js > seed_knowledge.sql
 */
const fs = require('fs');
const path = require('path');

// Read the index.ts file
const filePath = path.join(__dirname, 'supabase', 'functions', 'lbs-chat', 'index.ts');
const fileContent = fs.readFileSync(filePath, 'utf-8');

// Extract the FALLBACK_KNOWLEDGE content between the backticks
const match = fileContent.match(/const FALLBACK_KNOWLEDGE = `([\s\S]*?)`;/);
if (!match) {
    console.error('Could not find FALLBACK_KNOWLEDGE in index.ts');
    process.exit(1);
}

const knowledge = match[1];

// Split into sections by ## headers
const sections = knowledge.split(/(?=## \d+\.)/).filter(s => s.trim());

// Extract header (content before first ## section)
const headerMatch = knowledge.match(/^([\s\S]*?)(?=## \d+\.)/);
const header = headerMatch ? headerMatch[1].trim() : '';

// Escape single quotes for SQL
function sqlEscape(str) {
    return str.replace(/'/g, "''");
}

// Generate section key from title
function toSectionKey(title) {
    return title
        .toLowerCase()
        .replace(/^\d+\.\s*/, '')         // remove leading number
        .replace(/[^a-z0-9\s]/g, '')      // remove special chars
        .trim()
        .replace(/\s+/g, '_')             // spaces to underscores
        .substring(0, 60);                 // limit length
}

// Generate SQL
let sql = `-- ============================================
-- Seed data: FALLBACK_KNOWLEDGE sections
-- Generated from index.ts on ${new Date().toISOString().split('T')[0]}
-- ============================================

-- Clear existing data (optional, remove if you want to preserve manual edits)
TRUNCATE TABLE knowledge_base;

INSERT INTO knowledge_base (section_key, section_title, content, section_order) VALUES
`;

const rows = [];

// Add header row
if (header) {
    rows.push(`('header', 'LBS College of Engineering, Kasaragod (LBSCEK)', E'${sqlEscape(header.replace(/\n/g, '\\n'))}', 0)`);
}

// Add each section
for (const section of sections) {
    const titleMatch = section.match(/## (\d+)\.\s*(.*)/);
    if (!titleMatch) continue;

    const order = parseInt(titleMatch[1]);
    const title = titleMatch[2].trim();
    const key = toSectionKey(title);
    const content = section.trim();

    rows.push(`('${sqlEscape(key)}', '${sqlEscape(titleMatch[1] + '. ' + title)}', E'${sqlEscape(content.replace(/\n/g, '\\n'))}', ${order})`);
}

sql += rows.join(',\n\n') + ';\n';

// Write output
const outputPath = path.join(__dirname, 'supabase', 'migrations', 'seed_knowledge.sql');
fs.writeFileSync(outputPath, sql, 'utf-8');
console.log(`Generated ${rows.length} rows -> ${outputPath}`);
