import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Initialize server-side Gemini client
  const apiKey = process.env.GEMINI_API_KEY || '';
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // Helper: sanitize legal text
  function sanitizeLegalText(text: string): string {
    if (!text) return '';
    return text
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/\r\n/g, '\n')
      .trim();
  }

  // Fallback high-quality template generator if AI key is missing or offline
  function generateFallbackDocument(params: {
    document_type: string;
    parties: string;
    terms: string;
    dates: string;
    jurisdiction?: string;
  }): string {
    const docType = params.document_type || 'General Legal Agreement';
    const effectiveDate = params.dates || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const partiesRaw = params.parties || 'Party A, Party B';
    const jurisdiction = params.jurisdiction || 'the State of Delaware';

    // Parse parties
    const partyLines = partiesRaw.split(/[,;\n]/).map(p => p.trim()).filter(Boolean);
    const party1 = partyLines[0] || 'First Party ("Client")';
    const party2 = partyLines[1] || 'Second Party ("Service Provider")';

    // Parse terms
    const rawTerms = params.terms || 'The services shall be performed in a professional manner; Payment is due within 30 days of invoice; All intellectual property created shall belong to the Client; Confidentiality shall be maintained perpetually';
    const termItems = rawTerms.split(';').map(t => t.trim()).filter(Boolean);

    return `## ${docType.toUpperCase()}

Agreement made this ${effectiveDate}.

Between:
${party1}

And:
${party2}

WITNESSETH:
WHEREAS, the parties desire to enter into this ${docType} to set forth the terms and conditions of their mutual covenants and agreements; and
WHEREAS, both parties have reviewed and agreed to comply with all applicable terms stipulated herein.

NOW, THEREFORE, in consideration of the mutual covenants and promises contained herein, the parties agree as follows:

1. Scope & Objective:
The parties agree to fulfill their respective roles and responsibilities in good faith and according to the agreed milestones and specifications set forth in this Agreement.

2. Terms and Specific Conditions:
${termItems.map((term, idx) => `   ${String.fromCharCode(97 + idx)}) ${term}`).join('\n')}

3. Effective Date and Term:
This Agreement shall commence on ${effectiveDate} and shall remain in full force and effect until terminated by either party upon thirty (30) days written notice, or upon completion of all obligations defined herein.

4. Confidentiality:
Each party agrees to maintain in strict confidence all proprietary or confidential information disclosed by the other party during the term of this Agreement and thereafter.

5. Intellectual Property Rights:
Unless otherwise explicitly stated in writing, all work product, deliverables, inventions, and documentation created under this Agreement shall be the exclusive property of the commissioning party.

6. Governing Law & Jurisdiction:
This Agreement shall be construed, interpreted, and governed by the laws of ${jurisdiction}, without giving effect to any principles of conflicts of law.

7. Severability:
If any provision of this Agreement is held to be invalid or unenforceable, such provision shall be severed and the remaining provisions shall continue in full legal force and effect.

8. Entire Agreement:
This document constitutes the entire understanding between the parties concerning the subject matter hereof and supersedes all prior discussions, negotiations, and agreements.

IN WITNESS WHEREOF, the parties hereto have executed this ${docType} as of the Effective Date written above.

__________________________________________
${party1}
Authorized Signature: ____________________
Date: ____________________________________

__________________________________________
${party2}
Authorized Signature: ____________________
Date: ____________________________________
`;
  }

  // Root endpoint matching PDF Milestone 3 Activity 3.1
  app.get('/', (req, res, next) => {
    if (req.headers.accept?.includes('application/json') || req.xhr) {
      return res.json({
        message: 'Welcome to LegalEase AI Legal Document Generator API',
        status: 'online',
        endpoints: ['/generate', '/api/generate', '/api/refine', '/api/analyze'],
      });
    }
    next();
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      message: 'Welcome to LegalEase AI Legal Document Generator API',
      status: 'healthy',
      hasApiKey: !!process.env.GEMINI_API_KEY,
    });
  });

  // Main Generation Handler (supports both /generate and /api/generate)
  const handleGenerate = async (req: express.Request, res: express.Response) => {
    try {
      const { document_type, parties, terms, dates, jurisdiction, tone } = req.body;

      if (!document_type && !parties && !terms) {
        return res.status(400).json({ error: 'Please provide at least document type, parties, or key terms.' });
      }

      if (!ai) {
        // Fallback generator when GEMINI_API_KEY is not configured
        const fallbackText = generateFallbackDocument({
          document_type: document_type || 'Legal Agreement',
          parties: parties || 'Party A, Party B',
          terms: terms || 'Terms and conditions mutually agreed upon',
          dates: dates || 'April 15, 2025',
          jurisdiction: jurisdiction || 'the State of Delaware',
        });
        return res.json({
          document: fallbackText,
          source: 'template_engine',
          note: 'Generated with LegalEase Document Engine.',
        });
      }

      const prompt = `You are an elite, highly experienced legal drafting attorney specializing in contracts, corporate agreements, NDAs, leases, and formal binding legal documents.
Draft a comprehensive, professional, legally enforceable, and formatted legal document titled "${document_type}".

INPUT DETAILS:
- Document Type: ${document_type}
- Involved Parties: ${parties}
- Effective Date: ${dates || 'As of execution date'}
- Terms & Conditions (semicolon-separated): ${terms}
${jurisdiction ? `- Governing Jurisdiction: ${jurisdiction}` : ''}
${tone ? `- Tone/Style: ${tone}` : '- Tone/Style: Formal, legally rigorous, clear, comprehensive'}

DRAFTING REQUIREMENTS:
1. Title Header:
   - Clear markdown title: "## [DOCUMENT TYPE NAME]"
2. Opening Recital:
   - Date of execution: "Agreement made this [Effective Date]"
   - Involved parties block explicitly introducing "Between:" and "And:" with their official designations (e.g., "Service Provider", "Client", "Landlord", "Tenant", etc.), addresses or place of incorporation placeholders if unspecified.
3. WITNESSETH / Recitals:
   - "WITNESSETH:" with formal "WHEREAS" clauses explaining the background.
   - "NOW, THEREFORE, in consideration of the mutual covenants..."
4. Structured Numbered Sections:
   - Numbered sections (1., 2., 3., etc.) with bold descriptive headings.
   - Accurately integrate every single term provided in the input. Format specific terms either as clear lettered sub-clauses (a, b, c...) or a structured terms clause.
   - Include standard legal protections: Term and Termination, Compensation & Payment terms, Confidentiality, Intellectual Property Rights, Representations and Warranties, Indemnification, Governing Law / Jurisdiction, Severability, Entire Agreement, and Counterparts.
5. Execution & Signature Block:
   - "IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date."
   - Proper formal signature blocks with lines for Signature, Printed Name, Title, and Date for each party.
6. Formatting:
   - Clean markdown formatting. Do NOT wrap the entire answer in markdown code blocks (\`\`\`markdown ... \`\`\`). Return the raw legal text with clean markdown headings and lists so it renders seamlessly.
   - Professional, precise legal phrasing that is ready to print or execute.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are LegalEase, a precision AI legal document drafting engine. Output well-structured, formatted, highly reliable legal documents.',
          temperature: 0.3,
        },
      });

      const responseText = sanitizeLegalText(response.text || '');
      return res.json({
        document: responseText,
        source: 'gemini-3.8-flash',
      });
    } catch (error: any) {
      console.error('Error generating document:', error);
      // Fallback on error so the user is never stuck
      const fallbackText = generateFallbackDocument({
        document_type: req.body.document_type || 'Legal Agreement',
        parties: req.body.parties || 'Party 1, Party 2',
        terms: req.body.terms || 'Mutual terms and conditions',
        dates: req.body.dates || 'April 15, 2025',
      });
      return res.json({
        document: fallbackText,
        warning: 'AI generation timed out or encountered an error; fallback template generated.',
      });
    }
  };

  // Mount at both /generate (exact PDF spec) and /api/generate
  app.post('/generate', handleGenerate);
  app.post('/api/generate', handleGenerate);

  // Refine / Edit with AI endpoint
  app.post('/api/refine', async (req, res) => {
    try {
      const { currentDocument, instruction } = req.body;
      if (!currentDocument || !instruction) {
        return res.status(400).json({ error: 'currentDocument and instruction are required.' });
      }

      if (!ai) {
        return res.status(400).json({ error: 'Gemini API is not configured on the server.' });
      }

      const prompt = `You are an expert contract attorney. You have an existing legal document and need to modify it according to the user's specific request.

USER INSTRUCTION:
"${instruction}"

CURRENT DOCUMENT:
${currentDocument}

RULES:
- Preserve the overall legal structure, formal language, and signature blocks unless asked to change them.
- Apply the requested modifications precisely.
- Return the complete updated legal document with clean markdown formatting.
- Do NOT output conversational chatter or markdown fences around the entire document.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          temperature: 0.3,
        },
      });

      return res.json({
        document: sanitizeLegalText(response.text || ''),
      });
    } catch (error: any) {
      console.error('Error refining document:', error);
      return res.status(500).json({ error: error?.message || 'Failed to refine document' });
    }
  });

  // Plain English Summary and Risk Analysis endpoint
  app.post('/api/analyze', async (req, res) => {
    try {
      const { document } = req.body;
      if (!document) {
        return res.status(400).json({ error: 'Document text is required.' });
      }

      if (!ai) {
        return res.json({
          summary: 'The document establishes formal terms and covenants between the designated parties.',
          keyPoints: [
            'Outlines obligations and deliverables between the parties.',
            'Contains standard confidentiality and intellectual property clauses.',
            'Specifies termination and governing law provisions.',
          ],
          risks: [
            'Ensure specific dollar amounts and dates are finalized before signing.',
            'Review dispute resolution jurisdiction to confirm convenience of venue.',
          ],
        });
      }

      const prompt = `Analyze this legal document and provide an objective, plain-English summary, key clauses breakdown, and potential legal considerations / risks.

DOCUMENT:
${document}

Provide your response in JSON format with the following structure:
{
  "summary": "2-3 sentences plain English summary of what this document does",
  "keyPoints": [
    "Key clause 1 in plain English",
    "Key clause 2 in plain English",
    "Key clause 3 in plain English"
  ],
  "risks": [
    "Potential risk or missing clause to consider",
    "Ambiguity or notice requirement to be aware of"
  ],
  "readabilityScore": "High / Medium / Complex"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (error: any) {
      console.error('Error analyzing document:', error);
      return res.status(500).json({ error: error?.message || 'Failed to analyze document' });
    }
  });

  // In production, serve built frontend; in dev, mount Vite middleware
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LegalEase Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
