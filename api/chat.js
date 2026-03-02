import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Simple in-memory rate limiting (resets on cold start)
const rateLimit = new Map();
const RATE_LIMIT = 10; // messages per hour per IP
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

const SYSTEM_PROMPT = `Olet Fixlan asiakaspalveluavustaja. Fixla on suomalainen siivouspalvelu, joka toimii pääkaupunkiseudulla (Helsinki, Espoo, Vantaa, Kauniainen).

TÄRKEÄÄ: Vastaa VAIN Fixlaan ja siivouspalveluihin liittyviin kysymyksiin. Jos kysymys ei liity Fixlaan, siivouspalveluihin, hintoihin tai varaamiseen, vastaa ystävällisesti: "Pahoittelut, voin auttaa vain Fixlan siivouspalveluihin liittyvissä kysymyksissä. Miten voin auttaa siivousasioissa?"

PALVELUT JA HINNAT (-70% alennus voimassa):
- 2h siivous: 25€ (norm. 83€)
- 3h siivous: 37,60€ (norm. 125€)
- 4h siivous: 50,70€ (norm. 169€)
- 5h siivous: 63,60€ (norm. 212€)

Arvioi: 50m² asunto ≈ noin 2h siivous

MITÄ SIIVOUKSEEN KUULUU:
- Imurointi
- Lattioiden pesu
- Vessojen pesu
- Peilien puhdistus
- Keittiön pesu
- Roskien keräys
- Kaakeleiden pesu

LISÄPALVELUT (erikoistoiveiden mukaan, varaa pidempi aika):
- Uunin puhdistus
- Tiskien laitto
- Lakanoiden vaihto
- Muut erikoistoiveet

TOIMINTA-ALUE:
Pääkaupunkiseutu: Helsinki, Espoo, Vantaa, Kauniainen

VARAAMINEN:
1. Täytä varauslomake sivulla: www.fixla.fi/sivut/yhteystiedot
2. Tai lataa Fixla-sovellus:
   - iOS: App Store
   - Android: Google Play

MAKSU:
- Ensimmäisessä käynnissä maksu siivouksen jälkeen
- Tarjous voimassa vain lomakkeen kautta

YHTEYSTIEDOT:
- Sähköposti: teamfixla@gmail.com
- Puhelin: 040 502 1215 (Anton Laaksonen)

Vastaa aina suomeksi, ystävällisesti ja ytimekkäästi. Ohjaa asiakkaita varaamaan siivous lomakkeen kautta.`;

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get client IP for rate limiting
  const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';

  // Check rate limit
  const now = Date.now();
  const userRateData = rateLimit.get(ip) || { count: 0, resetAt: now + RATE_WINDOW };

  if (now > userRateData.resetAt) {
    userRateData.count = 0;
    userRateData.resetAt = now + RATE_WINDOW;
  }

  if (userRateData.count >= RATE_LIMIT) {
    return res.status(429).json({
      error: 'Liian monta viestiä. Yritä uudelleen tunnin kuluttua.',
      retryAfter: Math.ceil((userRateData.resetAt - now) / 1000)
    });
  }

  userRateData.count++;
  rateLimit.set(ip, userRateData);

  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || message.length > 500) {
      return res.status(400).json({ error: 'Invalid message' });
    }

    // Build messages array from history
    const messages = [
      ...history.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: messages,
    });

    const reply = response.content[0].text;

    return res.status(200).json({
      reply,
      remaining: RATE_LIMIT - userRateData.count
    });

  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: 'Jokin meni pieleen. Yritä uudelleen.' });
  }
}
