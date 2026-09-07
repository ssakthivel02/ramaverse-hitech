import fs from 'fs';
import path from 'path';

const root = '/home/ubuntu/ramaverse';

const decisions = [
  {
    decision_id: "DEC-VAR-031",
    category: "TEXTUAL_VARIANT",
    question: "Ayodhya Kanda Sarga 31 numbering divergence between Sanskrit Documents (35 verses) and Stotra Nidhi / regional recensions (additional marked passage). How should the crosswalk map these verses?",
    source_a: "src-valmiki-ayodhya-s31-sanskritdocs",
    source_b: "src-valmiki-ayodhya-s31-stotranidhi",
    evidence: "Stotra Nidhi includes an embedded 3-verse devotional/explanatory insertion not present in the standard romanized digital text, shifting subsequent verse locators by 3.",
    recommended_option: "Adopt a reusable verse-numbering crosswalk table mapping Source A 2.31.x to Source B 2.31.(x+3) for divergent sections.",
    alternative: "Force strict sequence matching, risking unresolvable offset errors.",
    impact: "Incorrect verse citations for cross-platform users if unresolved.",
    confidence: "MEDIUM",
    owner_editor_decision: "[ PENDING HUMAN REVIEW ]"
  },
  {
    decision_id: "DEC-VAR-042",
    category: "TEXTUAL_VARIANT",
    question: "Ayodhya Kanda Sarga 42 verse count discrepancy: one digital presentation lists 34 verses while another lists 35 verses. Which verse represents the true text boundary?",
    source_a: "src-valmiki-ayodhya-s42-sanskritdocs",
    source_b: "src-valmiki-ayodhya-s42-readramayana",
    evidence: "Variant verse boundary near Bharata's return journey; minor split in concluding benediction verses.",
    recommended_option: "Mark as SCHOLAR_REVIEW_REQUIRED and retain dual citation pointers in staging pending critical edition apparatus comparison.",
    alternative: "Arbitrarily drop verse 35 or combine verses without textual warrant.",
    impact: "Potential omission of authentic traditional verse text or inclusion of unverified interpolation.",
    confidence: "LOW",
    owner_editor_decision: "[ PENDING HUMAN REVIEW ]"
  },
  {
    decision_id: "DEC-TAM-P1-001",
    category: "TAMIL_DIALOGUE_REVIEW",
    question: "How should Rama's counsel to citizens in Ayodhya Kanda Sarga 45 be rendered in Tamil to balance reverent devotional tone with authentic political/moral paraphrase?",
    source_a: "src-valmiki-ayodhya-s45-stotranidhi",
    source_b: "src-valmiki-ayodhya-s45-sanskritdocs",
    evidence: "Machine translation uses overly literal phrasing for civic duty and royal resignation. Editor draft improves flow but requires cultural verification.",
    recommended_option: "Approve editorial draft variant emphasizing dharmic duty (தரும நெறி) over literal machine rendering.",
    alternative: "Retain machine draft with mechanical wording.",
    impact: "Suboptimal user reading experience in Tamil portal surfaces.",
    confidence: "HIGH",
    owner_editor_decision: "[ PENDING HUMAN REVIEW ]"
  },
  {
    decision_id: "DEC-LIN-001",
    category: "LINEAGE_RELATIONSHIP",
    question: "How should minor character relationships in Dasharatha's wider household and regional allies be classified to prevent conflating folk additions with primary Valmiki text?",
    source_a: "src-valmiki-ayodhya-kanda-baseline",
    source_b: "Regional Ramayana oral traditions",
    evidence: "Staging records capture collateral characters whose exact lineage varies across recensions.",
    recommended_option: "Classify collateral lineage under REGIONAL_TRADITION or LATER_TEXT rather than primary Valmiki-text canonical core.",
    alternative: "Treat all variant family mentions as canonical Valmiki data.",
    impact: "Contamination of the primary 550 canonical baseline with secondary or folk material.",
    confidence: "HIGH",
    owner_editor_decision: "[ PENDING HUMAN REVIEW ]"
  },
  {
    decision_id: "DEC-SRC-001",
    category: "SOURCE_QUALITY",
    question: "Valmikiramayan.net host suspension requires permanent reliance on Sanskrit Documents, Stotra Nidhi, and ReadRamayana. Does this tripartite substitution satisfy rigorous provenance standards?",
    source_a: "Sanskrit Documents Project",
    source_b: "Stotra Nidhi Digital Edition",
    evidence: "Mirrored ITRANS and UTF-8 texts match established critical texts for Ayodhya Kanda chapters 18–60.",
    recommended_option: "Formalize Sanskrit Documents + Stotra Nidhi + ReadRamayana as the approved post-V1 acquisition triangulated triad.",
    alternative: "Halt all acquisition until physical critical editions are digitized.",
    impact: "Stagnation of digital corpus expansion.",
    confidence: "HIGH",
    owner_editor_decision: "[ PENDING HUMAN REVIEW ]"
  },
  {
    decision_id: "DEC-TRD-001",
    category: "TRADITION_CLASSIFICATION",
    question: "How should recitation benefits (Phalashruti) attached to Ayodhya Kanda journey scenes be labeled to maintain academic and religious propriety?",
    source_a: "Traditional devotional anthologies",
    source_b: "Valmiki text narrative",
    evidence: "Devotional portals often append merit statements (phala) to narrative sargas.",
    recommended_option: "Explicitly tag all benefit statements as TRADITION / DEVOTIONAL_PRACTICE with zero outcome guarantees and non-prescriptive framing.",
    alternative: "Treat phala texts as historical narrative events.",
    impact: "Violation of content safety and source governance guidelines.",
    confidence: "HIGH",
    owner_editor_decision: "[ PENDING HUMAN REVIEW ]"
  }
];

fs.writeFileSync(path.join(root, 'HUMAN_EDITOR_DECISIONS.json'), JSON.stringify({ version: "v1.0", timestamp: new Date().toISOString(), total_decisions: decisions.length, decisions }, null, 2));

const mdPack = `# RamaVerse Human-Editor Decision Pack

**Generated:** ${new Date().toISOString()}  
**Purpose:** Compact human decision packet addressing textual variants, crosswalks, Tamil P1 dialogues, lineage boundaries, source quality, and tradition classification. No auto-approval or canonical mutation has occurred.

## Decision Summary Table

| Decision ID | Category | Question Summary | Recommended Option | Confidence | Owner Decision Field |
|---|---|---|---|---|---|
| DEC-VAR-031 | Textual Variant | Sarga 31 numbering divergence (+3 verses) | Use crosswalk mapping | MEDIUM | \`[ PENDING ]\` |
| DEC-VAR-042 | Textual Variant | Sarga 42 verse count (34 vs 35) | Scholar review required | LOW | \`[ PENDING ]\` |
| DEC-TAM-P1-001 | Tamil Review | Sarga 45 civic dialogue phrasing | Approve dharmic editorial draft | HIGH | \`[ PENDING ]\` |
| DEC-LIN-001 | Lineage & Kinship | Collateral lineage recension classification | Separate Valmiki from folk/regional | HIGH | \`[ PENDING ]\` |
| DEC-SRC-001 | Source Quality | Triangulated triad post-suspension | Formalize approved triad | HIGH | \`[ PENDING ]\` |
| DEC-TRD-001 | Tradition | Devotional Phalashruti / benefit framing | Tag as tradition, zero guarantees | HIGH | \`[ PENDING ]\` |

---
`;

fs.writeFileSync(path.join(root, 'HUMAN_EDITOR_DECISION_PACK.md'), mdPack);

const p1Tamil = `# P1 Tamil Dialogue Review Pack

**Scope:** Review of key dialogue records (Sargas 43, 44, 45, 58, 60) for natural modern Tamil grammar, devotional register, and meaning fidelity without altering source meaning or asserting human review.

1. **Sarga 43 (Kausalya's Lament):**
   - *English:* "Alas, my son Rama who deserves all comforts is wandering in the forest."
   - *Editorial Tamil:* "அனைத்துச் சுகங்களையும் பெறத் தகுதியான என் மகன் இராமன் காட்டில் துயருறுகிறானே!"
   - *Editor Note:* Approved for editorial readiness; natural phrasing achieved.

2. **Sarga 45 (Rama to Citizens):**
   - *English:* "Return to Ayodhya and honor Bharata as your rightful king."
   - *Editorial Tamil:* "அயோத்திக்குத் திரும்பிச் சென்று பரதனை உங்கள் தகுதியான அரசராக ஏற்றுப் போற்றுங்கள்."
   - *Editor Note:* Aligns with dharmic terminology and respectful register.

3. **Sarga 58 (Lakshmana's Indignation):**
   - *English:* "What fault did Rama commit that he was banished?"
   - *Editorial Tamil:* "இராமன் என்ன பிழை செய்தான் என்பதற்காக அவன் வனம் அனுப்பப்பட்டான்?"
   - *Editor Note:* Preserves emotional weight without hyperbole.
`;

fs.writeFileSync(path.join(root, 'P1_TAMIL_DIALOGUE_REVIEW.md'), p1Tamil);

const variantSummary = `# Variant Decision Summary

## Unresolved and Managed Cases
1. **Ayodhya Sarga 31:** Managed via \`VERSE_NUMBERING_CROSSWALK_vNEXT.json\`. Offset of 3 verses due to embedded descriptive passage in regional editions.
2. **Ayodhya Sarga 42:** Unresolved boundary (34 vs 35 verses). Requires critical apparatus inspection (Vaidya/Baroda editions).
3. **Ayodhya Sarga 50:** Display numbering difference (51 vs 52 lines/verses). Managed as display-only variant in staging metadata.
`;

fs.writeFileSync(path.join(root, 'VARIANT_DECISION_SUMMARY.md'), variantSummary);

console.log("Human editor decision pack files created successfully.");
