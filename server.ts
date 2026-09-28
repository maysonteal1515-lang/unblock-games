import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { synthesizeProceduralGame } from './aiGameSynthesizer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini SDK with User-Agent as instructed by guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Directly serve games directories so any freshly created AI game is accessible immediately
  app.use('/games', express.static(path.resolve(__dirname, 'public', 'games')));
  app.use('/games', express.static(path.resolve(__dirname, 'games')));

  // API Route: AI Game Generator from Link or Game description
  app.post('/api/ai-generate-game', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
      const { url, prompt, preferredCategory } = req.body || {};

      if (!url && !prompt) {
        return res.status(400).json({ error: 'Please provide a game link (URL) or game description.' });
      }

      let linkContext = '';
      let targetUrl = (url || '').trim();

      // If user pasted an <iframe> snippet, extract src and title
      if (targetUrl.includes('<iframe')) {
        const srcMatch = targetUrl.match(/src=["'](.*?)["']/i);
        if (srcMatch && srcMatch[1]) {
          targetUrl = srcMatch[1];
        }
      }

      // If user provided a URL, try fetching metadata/title with a short timeout
      if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);
          const fetchRes = await fetch(targetUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml',
            },
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (fetchRes.ok) {
            const htmlText = await fetchRes.text();
            const titleMatch = htmlText.match(/<title[^>]*>([^<]+)<\/title>/i);
            const descMatch = htmlText.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
              || htmlText.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
            const ogTitleMatch = htmlText.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);

            const title = ogTitleMatch?.[1] || titleMatch?.[1] || '';
            const desc = descMatch?.[1] || '';
            linkContext = `Webpage Title: "${title.trim()}". Description: "${desc.trim()}". URL: ${targetUrl}`;
          }
        } catch (fetchErr) {
          linkContext = `Target URL: ${targetUrl}`;
        }
      } else if (targetUrl) {
        linkContext = `User Reference / URL / Keyword: "${targetUrl}"`;
      }

      const userInstructions = prompt ? `User additional instructions: "${prompt}".` : '';
      const categoryHint = preferredCategory ? `Preferred Category: ${preferredCategory}.` : '';

      const systemPrompt = `You are a world-class Web Game Developer & Canvas/WebGL Engineer.
Your task: Analyze the provided game link/URL, title, and mechanics, and generate a 100% complete, standalone, playable, unblocked browser game in HTML5/JavaScript!

Requirements for the generated game:
1. FULLY PLAYABLE & COMPLETE: Standalone HTML5 canvas/webgl game with zero external asset dependencies.
2. KEYBOARD & PC CONTROLS: Smooth responsive controls (WASD, Arrows, Space) with e.preventDefault() on game keys.
3. AUDIO: Web Audio API sound synthesis.
4. HUD: Scores, lives, and PC keyboard guide.
5. GAME OVER & RESTART: Play again on Space or click.
6. STYLING: Dark-themed, responsive 100% viewport.

Return a valid JSON object matching the requested schema.`;

      const userPrompt = `Game Link & Context:
${linkContext}
${userInstructions}
${categoryHint}

Create an exciting, addictive browser game inspired by or recreating this game concept.`;

      let gameData: any = null;

      // Only attempt AI model if API key is present
      if (process.env.GEMINI_API_KEY) {
        const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
        for (const modelName of candidateModels) {
          try {
            console.log(`Attempting AI game generation with model: ${modelName}...`);
            const response = await ai.models.generateContent({
              model: modelName,
              contents: userPrompt,
              config: {
                systemInstruction: systemPrompt,
                responseMimeType: 'application/json',
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    category: { type: Type.STRING },
                    badge: { type: Type.STRING },
                    accentColor: { type: Type.STRING },
                    aspectRatio: { type: Type.STRING },
                    description: { type: Type.STRING },
                    controls: { type: Type.ARRAY, items: { type: Type.STRING } },
                    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    html: { type: Type.STRING }
                  },
                  required: ['title', 'category', 'badge', 'accentColor', 'aspectRatio', 'description', 'controls', 'tags', 'html']
                }
              }
            });

            if (response && response.text) {
              const parsed = JSON.parse(response.text.trim());
              if (parsed && parsed.html && parsed.title) {
                gameData = parsed;
                console.log(`Successfully generated game using model: ${modelName}`);
                break;
              }
            }
          } catch (modelErr: any) {
            console.warn(`Model ${modelName} call skipped or quota limited: ${modelErr.message || modelErr}`);
          }
        }
      }

      // If Gemini quota was reached or model is busy, use the high-quality procedural synthesizer
      if (!gameData || !gameData.html) {
        console.log('Generating game with high-speed procedural synthesizer engine...');
        gameData = synthesizeProceduralGame(targetUrl || prompt, prompt, preferredCategory);
      }

      // Generate a clean safe ID
      const safeSlug = (gameData.title || 'game')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const gameId = `custom-ai-${safeSlug}-${Date.now().toString().slice(-4)}`;

      // Save the generated game file to both public/games/ and games/
      const fileName = `${gameId}.html`;
      const publicGamesDir = path.resolve(__dirname, 'public', 'games');
      const rootGamesDir = path.resolve(__dirname, 'games');

      if (!fs.existsSync(publicGamesDir)) fs.mkdirSync(publicGamesDir, { recursive: true });
      if (!fs.existsSync(rootGamesDir)) fs.mkdirSync(rootGamesDir, { recursive: true });

      const publicFilePath = path.join(publicGamesDir, fileName);
      const rootFilePath = path.join(rootGamesDir, fileName);

      fs.writeFileSync(publicFilePath, gameData.html, 'utf-8');
      fs.writeFileSync(rootFilePath, gameData.html, 'utf-8');

      // Also if dist/games exists, copy it there so it works in production build too
      const distGamesDir = path.resolve(__dirname, 'dist', 'games');
      if (fs.existsSync(distGamesDir)) {
        fs.writeFileSync(path.join(distGamesDir, fileName), gameData.html, 'utf-8');
      }

      const finalGameRecord = {
        id: gameId,
        title: gameData.title,
        category: gameData.category || 'Arcade',
        badge: gameData.badge || 'AI Generated',
        accentColor: gameData.accentColor || '#06b6d4',
        aspectRatio: gameData.aspectRatio || '16:9',
        description: gameData.description,
        controls: gameData.controls || ['WASD / Arrows to Move', 'Space to Action'],
        tags: Array.isArray(gameData.tags) ? [...gameData.tags, 'AI', 'Custom'] : ['AI', 'Custom'],
        iframeUrl: `./games/${fileName}`,
        isCustom: true,
        generatedFromUrl: targetUrl,
        createdAt: new Date().toISOString()
      };

      // Also persist to games.json
      try {
        const gamesJsonPath = path.resolve(__dirname, 'games.json');
        if (fs.existsSync(gamesJsonPath)) {
          const currentCatalog = JSON.parse(fs.readFileSync(gamesJsonPath, 'utf-8'));
          if (Array.isArray(currentCatalog)) {
            currentCatalog.push(finalGameRecord);
            fs.writeFileSync(gamesJsonPath, JSON.stringify(currentCatalog, null, 2), 'utf-8');
            // Also copy to public/games.json and dist/games.json
            const pubJson = path.resolve(__dirname, 'public', 'games.json');
            const distJson = path.resolve(__dirname, 'dist', 'games.json');
            if (fs.existsSync(path.dirname(pubJson))) fs.writeFileSync(pubJson, JSON.stringify(currentCatalog, null, 2), 'utf-8');
            if (fs.existsSync(path.dirname(distJson))) fs.writeFileSync(distJson, JSON.stringify(currentCatalog, null, 2), 'utf-8');
          }
        }
      } catch (jsonErr) {
        console.warn('Could not update games.json file on disk:', jsonErr);
      }

      return res.json({
        success: true,
        game: finalGameRecord,
        html: gameData.html
      });
    } catch (err: any) {
      console.error('Error generating AI game:', err);
      return res.status(500).json({
        error: err.message || 'Failed to generate game with AI.'
      });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', hasGeminiKey: Boolean(process.env.GEMINI_API_KEY) });
  });

  // In development, mount Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve dist folder
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Unblocked Games Portal server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
