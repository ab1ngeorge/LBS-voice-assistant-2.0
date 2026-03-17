import { describe, it, expect } from 'vitest';
import {
  createEmptyMemory,
  containsPronouns,
  extractEntity,
  classifyIntent,
  rewriteQuery,
  updateMemory,
  hasMemoryContext,
  ConversationMemory,
} from '@/lib/conversationMemory';

// ─── createEmptyMemory ─────────────────────────────────────────────────────

describe('createEmptyMemory', () => {
  it('should return a memory object with all null fields', () => {
    const memory = createEmptyMemory();
    expect(memory.last_intent).toBeNull();
    expect(memory.last_entity).toBeNull();
    expect(memory.last_location).toBeNull();
  });
});

// ─── containsPronouns ──────────────────────────────────────────────────────

describe('containsPronouns', () => {
  it('should detect English pronouns', () => {
    expect(containsPronouns('Is it open now?')).toBe(true);
    expect(containsPronouns('How do I go there?')).toBe(true);
    expect(containsPronouns('Tell me about that')).toBe(true);
    expect(containsPronouns('What do they offer?')).toBe(true);
  });

  it('should NOT detect pronouns in normal queries', () => {
    expect(containsPronouns('Where is the library?')).toBe(false);
    expect(containsPronouns('Tell me about CSE department')).toBe(false);
    expect(containsPronouns('What is the fee structure?')).toBe(false);
  });

  it('should detect Malayalam pronouns', () => {
    expect(containsPronouns('അത് തുറന്നിട്ടുണ്ടോ?')).toBe(true);
    expect(containsPronouns('അവിടെ എങ്ങനെ പോകും?')).toBe(true);
  });

  it('should detect Manglish pronouns', () => {
    expect(containsPronouns('athu thurannitundo?')).toBe(true);
    expect(containsPronouns('avide engane ponum?')).toBe(true);
  });

  it('should handle empty and whitespace input', () => {
    expect(containsPronouns('')).toBe(false);
    expect(containsPronouns('   ')).toBe(false);
  });

  it('should NOT match "it" within other words', () => {
    expect(containsPronouns('What is the admission criteria?')).toBe(false);
  });
});

// ─── extractEntity ─────────────────────────────────────────────────────────

describe('extractEntity', () => {
  it('should extract CSE department', () => {
    const result = extractEntity('Where is CSE department?');
    expect(result).not.toBeNull();
    expect(result!.entity).toBe('CSE Department');
    expect(result!.location).toBe('CSE Block');
  });

  it('should extract library', () => {
    const result = extractEntity('Where is the library?');
    expect(result).not.toBeNull();
    expect(result!.entity).toBe('Library');
  });

  it('should extract canteen', () => {
    const result = extractEntity('Tell me about the canteen');
    expect(result).not.toBeNull();
    expect(result!.entity).toBe('Canteen');
  });

  it('should extract hostel', () => {
    const result = extractEntity('How is the hostel?');
    expect(result).not.toBeNull();
    expect(result!.entity).toBe('Hostel');
  });

  it('should extract Malayalam entities', () => {
    const result = extractEntity('ലൈബ്രറി എവിടെ?');
    expect(result).not.toBeNull();
    expect(result!.entity).toBe('Library');
  });

  it('should return null when no entity is found', () => {
    const result = extractEntity('Hello, how are you?');
    expect(result).toBeNull();
  });

  it('should handle empty input', () => {
    expect(extractEntity('')).toBeNull();
    expect(extractEntity('   ')).toBeNull();
  });
});

// ─── classifyIntent ────────────────────────────────────────────────────────

describe('classifyIntent', () => {
  it('should classify navigation intents', () => {
    expect(classifyIntent('Where is the library?')).toBe('navigation');
    expect(classifyIntent('How to go to CSE?')).toBe('navigation');
  });

  it('should classify bus intents', () => {
    expect(classifyIntent('What is the bus time?')).toBe('bus');
  });

  it('should classify info intents', () => {
    expect(classifyIntent('Tell me about CSE department')).toBe('info');
    expect(classifyIntent('Who is the HOD?')).toBe('info');
  });

  it('should classify website intents', () => {
    expect(classifyIntent('Show me the website link')).toBe('website');
  });

  it('should return general for unclassifiable queries', () => {
    expect(classifyIntent('Hello!')).toBe('general');
  });
});

// ─── rewriteQuery ──────────────────────────────────────────────────────────

describe('rewriteQuery', () => {
  it('should rewrite "Is it open?" when memory has Library', () => {
    const memory: ConversationMemory = {
      last_intent: 'navigation',
      last_entity: 'Library',
      last_location: 'Central Library',
    };
    const result = rewriteQuery('Is it open now?', memory);
    expect(result.wasRewritten).toBe(true);
    expect(result.rewritten).toContain('Library');
    expect(result.rewritten).not.toContain(' it ');
  });

  it('should rewrite "How do I go there?" with memory entity', () => {
    const memory: ConversationMemory = {
      last_intent: 'navigation',
      last_entity: 'Canteen',
      last_location: 'College Canteen',
    };
    const result = rewriteQuery('How do I go there?', memory);
    expect(result.wasRewritten).toBe(true);
    expect(result.rewritten).toContain('Canteen');
  });

  it('should NOT rewrite when no pronouns detected', () => {
    const memory: ConversationMemory = {
      last_intent: 'navigation',
      last_entity: 'Library',
      last_location: 'Central Library',
    };
    const result = rewriteQuery('Where is CSE department?', memory);
    expect(result.wasRewritten).toBe(false);
    expect(result.rewritten).toBe('Where is CSE department?');
  });

  it('should NOT rewrite when memory is empty', () => {
    const memory = createEmptyMemory();
    const result = rewriteQuery('Is it open?', memory);
    expect(result.wasRewritten).toBe(false);
    expect(result.rewritten).toBe('Is it open?');
  });

  it('should fall back to last_location if last_entity is null', () => {
    const memory: ConversationMemory = {
      last_intent: 'navigation',
      last_entity: null,
      last_location: 'Central Library',
    };
    const result = rewriteQuery('Is it open?', memory);
    expect(result.wasRewritten).toBe(true);
    expect(result.rewritten).toContain('Central Library');
  });

  it('should handle empty query gracefully', () => {
    const memory: ConversationMemory = {
      last_intent: null,
      last_entity: 'Library',
      last_location: null,
    };
    const result = rewriteQuery('', memory);
    expect(result.wasRewritten).toBe(false);
  });
});

// ─── updateMemory ──────────────────────────────────────────────────────────

describe('updateMemory', () => {
  it('should update memory with new entity and intent', () => {
    const memory = createEmptyMemory();
    updateMemory('Where is the canteen?', memory);
    expect(memory.last_entity).toBe('Canteen');
    expect(memory.last_location).toBe('College Canteen');
    expect(memory.last_intent).toBe('navigation');
  });

  it('should replace old entity on topic change', () => {
    const memory: ConversationMemory = {
      last_intent: 'navigation',
      last_entity: 'Library',
      last_location: 'Central Library',
    };
    updateMemory('Tell me about CSE department', memory);
    expect(memory.last_entity).toBe('CSE Department');
    expect(memory.last_location).toBe('CSE Block');
  });

  it('should keep old entity if query has no new entity', () => {
    const memory: ConversationMemory = {
      last_intent: 'navigation',
      last_entity: 'Library',
      last_location: 'Central Library',
    };
    updateMemory('Is it open now?', memory);
    // No new entity detected, so the old one remains
    expect(memory.last_entity).toBe('Library');
    expect(memory.last_location).toBe('Central Library');
  });

  it('should update intent when a new one is classified', () => {
    const memory: ConversationMemory = {
      last_intent: 'navigation',
      last_entity: 'Library',
      last_location: 'Central Library',
    };
    updateMemory('What is the fee structure?', memory);
    expect(memory.last_intent).toBe('info');
    // Entity switched to Fee Structure
    expect(memory.last_entity).toBe('Fee Structure');
  });
});

// ─── hasMemoryContext ──────────────────────────────────────────────────────

describe('hasMemoryContext', () => {
  it('should return false for empty memory', () => {
    expect(hasMemoryContext(createEmptyMemory())).toBe(false);
  });

  it('should return true when entity is set', () => {
    expect(
      hasMemoryContext({ last_intent: null, last_entity: 'Library', last_location: null }),
    ).toBe(true);
  });

  it('should return true when location is set', () => {
    expect(
      hasMemoryContext({ last_intent: null, last_entity: null, last_location: 'Central Library' }),
    ).toBe(true);
  });
});
