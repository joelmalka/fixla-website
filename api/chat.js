import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Simple in-memory rate limiting (resets on cold start)
const rateLimit = new Map();
const RATE_LIMIT = 10; // messages per hour per IP
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

const SYSTEM_PROMPT = `Olet Fixlan asiakaspalveluavustaja. Fixla on suomalainen kotipalvelusovellus, joka yhdistää asiakkaat palveluntarjoajiin. Toiminta-alue: pääkaupunkiseutu (Helsinki, Espoo, Vantaa, Kauniainen).

TÄRKEÄÄ: Vastaa VAIN Fixlaan ja sen palveluihin liittyviin kysymyksiin. Jos kysymys ei liity Fixlaan, vastaa ystävällisesti: "Pahoittelut, voin auttaa vain Fixlan palveluihin liittyvissä kysymyksissä. Miten voin auttaa?"

=== KAIKKI PALVELUT ===

KOTITALOUDEN ULKOTYÖT:
- Nurmikonleikkuu - Hinnoittelu kuvien perusteella
- Aitojen pesu - Hinnoittelu kuvien perusteella
- Aitojen maalaus - Hinnoittelu kuvien perusteella
- Rännien putsaus - Hinnoittelu kuvien perusteella
- Lumityöt - Hinnoittelu kuvien perusteella (-10€ alennus nyt!)

KIINTEÄHINTAISET PALVELUT:

1. SIIVOUS (+9% palvelumaksu):
   - 2h siivous: 74,99€
   - 3h siivous: 114,99€
   - 4h siivous: 154,99€
   - 5h siivous: 194,99€
   Arvioi: 50m² asunto ≈ noin 2h siivous

   MITÄ SIIVOUKSEEN KUULUU:
   - Imurointi, lattioiden pesu, vessojen pesu
   - Peilien puhdistus, keittiön pesu
   - Roskien keräys, kaakeleiden pesu

   LISÄPALVELUT (varaa pidempi aika):
   - Uunin puhdistus, tiskien laitto, lakanoiden vaihto

2. KOIRAN ULKOILUTUS (+9% palvelumaksu):
   - 15 min: 10,40€
   - 30 min: 12,55€
   - 1 tunti: 25,10€

3. RENKAIDEN VAIHTO (+9% palvelumaksu):
   - 1 auto: 33€
   - 2 autoa: 55€

=== MITEN FIXLA TOIMII ===

Kuvapohjaiselle hinnoittelulle (ulkotyöt):
1. Lataa Fixla-sovellus
2. Valitse palvelu ja ota kuvia kohteesta
3. Täytä tiedot (osoite, yhteystiedot, toiveet)
4. Odota hinta-arviota (yleensä 30-90 min)
5. Hyväksy ja maksa sovelluksessa

Varaaminen:
Lataa Fixla-sovellus ja varaa palvelu sieltä!

=== SOVELLUKSEN LATAUS ===
- iOS: App Store (hae "Fixla")
- Android: Google Play (hae "Fixla")
- Tai: www.fixla.fi -> "Lataa Fixla"

=== YHTEYSTIEDOT ===
- Sähköposti: teamfixla@gmail.com
- Puhelin: 040 502 1215 (Anton Laaksonen)
- Puhelin: 045 156 7778 (Joel Malka)

=== AUKIOLO ===
Palvelut saatavilla joka päivä klo 8-20. Voit tehdä tilauksen sovelluksessa milloin vain.

=== SOSIAALISET MEDIAT ===
- Instagram: @fixla.app
- Facebook: Fixla
- TikTok: @fixla.app
- X/Twitter: @FixlaApp

VASTAUSOHJEET - NOUDATA EHDOTTOMASTI:
1. MAKSIMI 3 lausetta per vastaus
2. EI LISTOJA - älä käytä viivoja tai numeroituja listoja
3. Kun kysytään palveluista, vastaa TASAN näin: "Tarjoamme siivousta, pihatöitä, renkaiden vaihtoa, koiran ulkoilutusta ja lumitöitä. Mistä haluaisit kuulla lisää?" ÄLÄ mainitse haravointia!
4. Anna hinnat vasta kun kysytään TIETYSTÄ palvelusta
5. Ohjaa AINA lataamaan Fixla-sovellus App Storesta tai Google Playsta
6. Ole rento ja keskusteleva`;

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
      model: 'claude-3-haiku-20240307',
      max_tokens: 200,
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
    // Return more details for debugging
    return res.status(500).json({
      error: 'Jokin meni pieleen. Yritä uudelleen.',
      debug: error.message || 'Unknown error',
      hasKey: !!process.env.ANTHROPIC_API_KEY
    });
  }
}
