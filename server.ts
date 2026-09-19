import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // AI Operations Controller Agent Reasoning Endpoint
  app.post('/api/agent/reason', async (req, res) => {
    try {
      const { flightId, disruption, options, stateContext } = req.body;

      const client = getAIClient();
      if (!client) {
        // Deterministic fallback response when no API key is provided
        return res.json({
          source: 'DETERMINISTIC_OPERATIONS_CONTROLLER',
          recommendedOptionId: 'int-opt-a',
          recommendationTitle: 'Option A: Reassign Fuel Bowser F12',
          summary:
            'Critical fuel pump breakdown on F17 at Stand A12 halts BA123 refuelling. Recommended immediate dispatch of standby bowser F12 (Stand A13 perimeter). Recovers target departure to 15:01 (+1 min delay), preserving gate buffer for incoming KL1008 at 15:15.',
          riskAnalysis:
            'Do Nothing (Option C) produces +27 min delay, triggering a downstream stand collision with KL1008 and jeopardizing 42 connecting passenger itineraries. Option B incurs passenger gate reassignment and apron towing overhead.',
          confidence: 0.96,
        });
      }

      const prompt = `You are the Operations Controller Agent for Airport Ops AI, an autonomous turnaround coordination system for major airports.
A ground disruption has occurred in the simulated airport:
Flight: ${flightId}
Disruption: ${JSON.stringify(disruption || {})}
Current Options Evaluated by Impact Simulation Engine:
${JSON.stringify(options || [], null, 2)}
Context: ${JSON.stringify(stateContext || {})}

Formulate a concise operational recommendation for the human duty manager.
Return JSON with the following schema:
{
  "recommendedOptionId": "string",
  "recommendationTitle": "string",
  "summary": "concise 2-3 sentence executive summary of the intervention and expected departure",
  "riskAnalysis": "explanation of why the recommended option minimizes downstream network delay and stand clashes vs alternatives",
  "confidence": 0.95
}`;

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);

      return res.json({
        source: 'GEMINI_AGENT',
        ...parsed,
      });
    } catch (err: any) {
      console.error('Agent reasoning error:', err);
      // Fallback cleanly
      return res.json({
        source: 'FALLBACK_CONTROLLER',
        recommendedOptionId: 'int-opt-a',
        recommendationTitle: 'Option A: Reassign Fuel Bowser F12',
        summary:
          'Fuel dispenser F17 failure at Stand A12 halted BA123 refuelling. Reassigning standby bowser F12 recovers target departure to 15:01 (+1 min network delay), avoiding gate collision with incoming KL1008.',
        riskAnalysis:
          'Alternative Option C leads to +27 min delay, causing KL1008 to hold on taxiway. Option A has lowest system disruption.',
        confidence: 0.95,
      });
    }
  });

  // Vite middleware for dev or static files for prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Airport Ops AI Coordinator server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
