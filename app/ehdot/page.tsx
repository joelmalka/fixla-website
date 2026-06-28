import Link from 'next/link';
import FixlaLogo from '@/components/FixlaLogo';
import DesktopNav from '@/components/DesktopNav';

export const metadata = {
  title: 'Käyttöehdot ja tietosuoja · Fixla',
  description: 'Fixlan käyttöehdot ja tietosuojakäytäntö',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-100 bg-white">
        <div className="flex flex-col items-center px-5 py-4 md:hidden">
          <FixlaLogo size={50} />
        </div>
        <div className="mx-auto hidden max-w-5xl items-center justify-between gap-4 px-5 py-3 md:flex">
          <Link href="/palvelut" className="shrink-0">
            <FixlaLogo size={44} />
          </Link>
          <DesktopNav />
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-5 py-10 md:py-14">
        <Link
          href="/kirjaudu"
          className="inline-flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-900"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path
              fillRule="evenodd"
              d="M11.78 5.22a.75.75 0 0 1 0 1.06L6.81 11.25H21a.75.75 0 0 1 0 1.5H6.81l4.97 4.97a.75.75 0 1 1-1.06 1.06l-6.25-6.25a.75.75 0 0 1 0-1.06l6.25-6.25a.75.75 0 0 1 1.06 0Z"
              clipRule="evenodd"
            />
          </svg>
          Takaisin
        </Link>

        <h1 className="mt-6 text-3xl font-extrabold text-gray-900 md:text-4xl">
          Käyttöehdot ja tietosuoja
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Voimassa alkaen: 01.01.2024 · Viimeksi päivitetty: 01.09.2024
        </p>

        <nav className="mt-6 flex gap-2 rounded-2xl bg-white p-1 ring-1 ring-gray-200">
          <a
            href="#kayttoehdot"
            className="flex-1 rounded-xl px-4 py-2 text-center text-sm font-semibold text-fixla-700 hover:bg-fixla-50"
          >
            Käyttöehdot
          </a>
          <a
            href="#tietosuoja"
            className="flex-1 rounded-xl px-4 py-2 text-center text-sm font-semibold text-fixla-700 hover:bg-fixla-50"
          >
            Tietosuoja
          </a>
        </nav>

        <section id="kayttoehdot" className="mt-10 scroll-mt-8 space-y-6 text-sm leading-relaxed text-gray-800">
          <h2 className="text-2xl font-bold text-gray-900">Fixla Oy – Käyttöehdot</h2>

          <Block title="1. Soveltamisala ja hyväksyminen">
            <p>
              1.1 Nämä käyttöehdot (&ldquo;Käyttöehdot&rdquo;) säätelevät Fixla Oy:n (&ldquo;Fixla&rdquo;, &ldquo;me&rdquo;, &ldquo;meitä&rdquo; tai
              &ldquo;meidän&rdquo;) ylläpitämän mobiilisovelluksen ja siihen liittyvien verkkopalvelujen
              (&ldquo;Sovellus&rdquo;) käyttöä.
            </p>
            <p>
              1.2 Rekisteröitymällä Sovelluksen käyttäjäksi, käyttämällä Sovellusta tai
              tilaamalla Palveluita käyttäjä (&ldquo;Käyttäjä&rdquo;) sitoutuu noudattamaan näitä
              Ehtoja kaikilta osin.
            </p>
            <p>1.3 Mikäli Käyttäjä ei hyväksy näitä Ehtoja, hänen ei tule käyttää Sovellusta.</p>
          </Block>

          <Block title="2. Määritelmät">
            <p>Näissä Ehdoissa:</p>
            <ul className="ml-5 list-disc space-y-1">
              <li>
                <strong>Asiakas</strong>: luonnollinen henkilö tai oikeushenkilö, joka tilaa Sovelluksen
                kautta Palveluita.
              </li>
              <li>
                <strong>Palveluntarjoaja</strong>: luonnollinen henkilö tai oikeushenkilö, joka tarjoaa
                Sovelluksen kautta Palveluita Asiakkaille.
              </li>
              <li>
                <strong>Palvelu</strong>: yksittäinen suoritus, kuten nurmikonleikkuu, lumityöt tai
                koiran ulkoilutus, jonka Palveluntarjoaja toteuttaa Asiakkaalle.
              </li>
              <li>
                <strong>Transaktio</strong>: Asiakkaan ja Palveluntarjoajan välinen sopimus Palvelun
                suorittamisesta Sovelluksen kautta.
              </li>
              <li>
                <strong>Komissio</strong>: Sovelluksen kautta Fixlalle maksettava palvelupalkkio, joka
                vähennetään Palveluntarjoajalle tilitettävästä summasta.
              </li>
              <li>
                <strong>Sisältö</strong>: kaikki Sovellukseen liittyvä materiaali, mukaan lukien
                ohjelmistot, logot, kuvat, tekstit ja tietokannat.
              </li>
            </ul>
          </Block>

          <Block title="3. Fixlan rooli">
            <p>
              3.1 Fixla toimii alustana, joka yhdistää Asiakkaita ja Palveluntarjoajia. Fixla ei
              itse ole Palveluiden tarjoaja, eikä se osallistu Asiakkaan ja Palveluntarjoajan
              väliseen sopimukseen, ellei Fixla nimenomaisesti toimi Palveluntarjoajana.
            </p>
            <p>
              3.2 Fixla ei vastaa Palveluiden sisällöstä, laadusta, oikeellisuudesta,
              suorittamisesta, saatavuudesta tai lopputuloksesta. Kaikki Palveluun liittyvät
              oikeudet ja velvollisuudet kuuluvat yksinomaan Asiakkaalle ja Palveluntarjoajalle.
            </p>
            <p>
              3.3 Fixlalla on oikeus muokata Sovelluksen ominaisuuksia, käyttöliittymää ja
              toimintalogiikkaa milloin tahansa ilman erillistä ilmoitusta.
            </p>
          </Block>

          <Block title="4. Käyttäjätili ja tunnusten hallinta">
            <p>4.1 Sovelluksen käyttö edellyttää rekisteröitymistä ja käyttäjätilin luomista.</p>
            <p>
              4.2 Käyttäjä vastaa antamiensa tietojen oikeellisuudesta ja ajantasaisuudesta. Fixla
              ei vastaa virheellisistä tiedoista johtuvista ongelmista tai vahingoista.
            </p>
            <p>
              4.3 Käyttäjä on yksin vastuussa tunnustensa salassapidosta ja kaikesta tilillään
              tapahtuvasta toiminnasta. Käyttäjä sitoutuu ilmoittamaan Fixlalle välittömästi
              tunnusten luvattomasta käytöstä.
            </p>
            <p>
              4.4 Fixla ei vastaa vahingoista, jotka johtuvat käyttäjän tilin luvattomasta
              käytöstä, mikäli tämä johtuu käyttäjän huolimattomuudesta.
            </p>
          </Block>

          <Block title="5. Asiakkaan velvollisuudet">
            <p>
              5.1 Asiakas sitoutuu käyttämään Sovellusta ja tilaamaan Palveluita lain ja hyvän
              tavan mukaisesti.
            </p>
            <p>
              5.2 Asiakas on velvollinen maksamaan kaikki Palveluiden hinnat Sovelluksen kautta.
              Maksujen suorittaminen tapahtuu Fixlan käyttämän kolmannen osapuolen
              maksupalveluntarjoajan kautta.
            </p>
            <p>5.3 Asiakas hyväksyy, että Fixla ei takaa Palveluiden saatavuutta, hintaa tai laatua.</p>
            <p>
              5.4 Asiakas sitoutuu siihen, ettei hän käytä Sovellusta vilpillisesti, häiritsevästi
              tai tavalla, joka aiheuttaa haittaa Fixlalle, Palveluntarjoajille tai muille
              Asiakkaille.
            </p>
          </Block>

          <Block title="6. Palveluntarjoajan velvollisuudet">
            <p>
              6.1 Palveluntarjoaja toimii itsenäisenä yrittäjänä, eikä häntä katsota Fixlan
              työntekijäksi, edustajaksi tai alihankkijaksi.
            </p>
            <p>
              6.2 Palveluntarjoaja vastaa itse kaikista veroista, sosiaaliturvamaksuista,
              eläkemaksuista, vakuutuksista ja muista lakisääteisistä velvoitteista.
            </p>
            <p>
              6.3 Palveluntarjoaja vastaa palveluiden asianmukaisesta suorittamisesta.
              Mahdolliset reklamaatiot ja vahingonkorvaukset ovat Palveluntarjoajan vastuulla.
            </p>
            <p>
              6.4 Fixlalla on oikeus estää Palveluntarjoajan pääsy Sovellukseen, jos tämä rikkoo
              Ehtoja, lakia tai toimii Fixlan maineelle vahingollisesti.
            </p>
          </Block>

          <Block title="7. Hinnoittelu ja maksut">
            <p>7.1 Palveluiden hinnat ilmoitetaan Sovelluksessa.</p>
            <p>
              7.2 Asiakkaan maksut käsitellään Sovelluksen kautta kolmannen osapuolen
              maksupalvelun avulla. Fixla ei vastaa maksujen viivästymisestä tai teknisistä
              virheistä.
            </p>
            <p>
              7.3 Fixla perii Palveluntarjoajalta komission, jonka suuruuden Fixla voi muuttaa
              yksipuolisesti ilmoittamalla siitä Sovelluksessa.
            </p>
          </Block>

          <Block title="8. Immateriaalioikeudet">
            <p>
              8.1 Kaikki oikeudet Sovellukseen, sen ohjelmistoon ja sisältöön kuuluvat Fixlalle
              tai sen lisenssinantajille.
            </p>
            <p>
              8.2 Käyttäjälle myönnetään rajoitettu, ei-yksinomainen ja peruutettavissa oleva
              käyttöoikeus Sovellukseen henkilökohtaista käyttöä varten.
            </p>
            <p>
              8.3 Käyttäjä ei saa kopioida, muokata, levittää, jäljentää tai hyödyntää Sovellusta
              ilman Fixlan kirjallista lupaa.
            </p>
          </Block>

          <Block title="9. Vastuunrajoitukset">
            <p>
              9.1 Sovellus ja kaikki sen sisältö tarjotaan &ldquo;sellaisena kuin ne ovat&rdquo;. Fixla ei
              anna minkäänlaisia nimenomaisia tai konkludenttisia takuita Sovelluksen tai
              Palveluiden toiminnasta, saatavuudesta, virheettömyydestä tai soveltuvuudesta
              tiettyyn tarkoitukseen.
            </p>
            <p>
              9.2 Fixla ei vastaa mistään välillisistä, epäsuorista, erityisistä tai
              seuraamuksellisista vahingoista, mukaan lukien mutta ei rajoittuen liikevoiton
              menetykseen, tietojen katoamiseen tai liiketoiminnan keskeytymiseen.
            </p>
            <p>
              9.3 Fixlan vastuu kaikissa tapauksissa rajoittuu enintään Asiakkaan kyseisestä
              Palvelusta maksamaan summaan tai sataan (100) euroon – sen mukaan kumpi on
              pienempi.
            </p>
            <p>
              9.4 Fixla ei vastaa viivästyksistä tai palvelukatkoksista, jotka johtuvat
              ylivoimaisesta esteestä (force majeure), kuten lakosta, luonnonmullistuksesta,
              viranomaismääräyksestä, tietoliikennehäiriöstä tai pandemiasta.
            </p>
          </Block>

          <Block title="10. Indemnifikaatio">
            <p>
              Käyttäjä ja Palveluntarjoaja sitoutuvat korvaamaan Fixlalle, sen työntekijöille,
              johdolle, tytäryhtiöille ja kumppaneille kaikki vaateet, vahingot, kustannukset ja
              kulut (mukaan lukien oikeudenkäyntikulut), jotka johtuvat:
            </p>
            <ul className="ml-5 list-disc space-y-1">
              <li>näiden Ehtojen rikkomisesta,</li>
              <li>Sovelluksen väärinkäytöstä,</li>
              <li>Palvelun suorittamisesta tai tilaamisesta,</li>
              <li>kolmansien osapuolten oikeuksien loukkaamisesta.</li>
            </ul>
          </Block>

          <Block title="11. Kolmannen osapuolen palvelut">
            <p>
              11.1 Sovellus voi sisältää linkkejä tai integraatioita kolmansien osapuolten
              palveluihin (esim. maksupalvelut, karttapalvelut).
            </p>
            <p>
              11.2 Fixla ei vastaa kolmansien osapuolten palveluiden toiminnasta, sisällöstä tai
              virheistä.
            </p>
            <p>Sovellus käyttää seuraavia kolmannen osapuolen palveluita:</p>
            <ul className="ml-5 list-disc space-y-1">
              <li>Expo – Mobiilisovelluksen kehitysalusta</li>
              <li>Stripe – Maksujen käsittely</li>
              <li>Supabase – Tietojen tallennus ja hallinta</li>
              <li>Google Maps – Sijaintipalvelut</li>
              <li>Resend – Sähköpostiviestintä (laskut ja ilmoitukset)</li>
            </ul>
            <p>Näillä palveluilla on omat käyttöehdot ja tietosuojakäytännöt.</p>
          </Block>

          <Block title="12. Sopimuksen voimassaolo ja päättyminen">
            <p>
              12.1 Käyttäjän sopimus Fixlan kanssa astuu voimaan, kun käyttäjä hyväksyy nämä
              Ehdot, ja on voimassa toistaiseksi.
            </p>
            <p>12.2 Käyttäjä voi lopettaa sopimuksen poistamalla tilinsä Sovelluksesta.</p>
            <p>
              12.3 Fixlalla on oikeus milloin tahansa ja ilman vastuuta sulkea Käyttäjän tili, jos
              tämä rikkoo näitä Ehtoja tai lakia.
            </p>
          </Block>

          <Block title="13. Sovellettava laki ja oikeuspaikka">
            <p>13.1 Näihin Ehtoihin sovelletaan Suomen lakia.</p>
            <p>13.2 Kaikki erimielisyydet ratkaistaan yksinomaan Helsingin käräjäoikeudessa.</p>
          </Block>

          <Block title="14. Ehtojen muuttaminen">
            <p>14.1 Fixla voi muuttaa näitä Ehtoja yksipuolisesti milloin tahansa.</p>
            <p>
              14.2 Muutoksista ilmoitetaan Sovelluksessa tai sähköpostitse. Käyttäjän katsotaan
              hyväksyneen muutokset jatkamalla Sovelluksen käyttöä.
            </p>
          </Block>

          <Block title="15. Ehtojen pysyvyys">
            <p>
              Jos jokin näiden Ehtojen kohta todetaan pätemättömäksi tai täytäntöönpanokelvottomaksi,
              tämä ei vaikuta muiden ehtojen voimassaoloon.
            </p>
          </Block>
        </section>

        <section
          id="tietosuoja"
          className="mt-16 scroll-mt-8 space-y-6 text-sm leading-relaxed text-gray-800"
        >
          <h2 className="text-2xl font-bold text-gray-900">Fixla – Tietosuojakäytäntö</h2>
          <p className="text-sm text-gray-500">
            Voimassa alkaen: 1.1.2025 · Viimeksi päivitetty: 15.1.2025
          </p>

          <Block title="1. Tietoja, joita keräämme">
            <p>
              <strong>1.1 Tilin tiedot</strong> — Kun luot tilin, keräämme: täydellinen nimi,
              sähköpostiosoite, puhelinnumero, salasana (salattu alan standardimenetelmin) ja
              käyttäjärooli (asiakas tai palveluntarjoaja).
            </p>
            <p>
              <strong>1.2 Palveluntarjoajan lisätiedot</strong> — Ikä, Y-tunnus, toimialueet, puhutut
              kielet, pankkitili maksuja varten.
            </p>
            <p>
              <strong>1.3 Palvelun tiedot</strong> — Tilauspyynnöt, kuvat kohteesta, palveluosoitteet,
              erityisohjeet, äänitallenteet (jos annettu).
            </p>
            <p>
              <strong>1.4 Sijaintitiedot</strong> — Keräämme sijainnin vain, kun tilaat palvelun
              (lähelläsi olevien tekijöiden löytämiseksi) tai hyväksyt työn (navigointia varten).
              Sijainnin jakaminen on aina vapaaehtoista.
            </p>
            <p>
              <strong>1.5 Maksutiedot</strong> — Maksukorttitiedot (käsittely Stripen kautta),
              transaktiohistoria, laskutustiedot. Emme tallenna kortin numeroita kokonaisuudessaan.
            </p>
            <p>
              <strong>1.6 Laitetiedot</strong> — Laitemalli, käyttöjärjestelmäversio,
              sovellusversio, laitetunnisteet, IP-osoite.
            </p>
            <p>
              <strong>1.7 Käyttötiedot</strong> — Sovelluksen käyttö, palvelumieltymykset,
              viestintämieltymykset, arvostelut.
            </p>
          </Block>

          <Block title="2. Tietojen käyttö">
            <p>
              <strong>2.1 Palveluiden tarjoaminen</strong> — Asiakkaiden ja tekijöiden yhdistäminen,
              tilausten käsittely, viestintä, maksujen käsittely ja laskujen luonti.
            </p>
            <p>
              <strong>2.2 Palveluiden kehittäminen</strong> — Käytön analysointi, toiminnallisuuden
              parantaminen, uusien ominaisuuksien kehittäminen, asiakastuki, petoksen ehkäisy.
            </p>
            <p>
              <strong>2.3 Viestintä</strong> — Palveluilmoitukset, varauspäivitykset, tärkeä tilin
              tieto, markkinointi (vain suostumuksella).
            </p>
          </Block>

          <Block title="3. Tietojen jakaminen">
            <p>Jaamme tietoja vain seuraavien kanssa:</p>
            <p>
              <strong>3.1 Palvelun osapuolet</strong> — Asiakas näkee tekijän nimen, arvosanan ja
              profiilin. Tekijä näkee asiakkaan nimen, osoitteen ja työn tiedot.
            </p>
            <p>
              <strong>3.2 Kolmannet osapuolet</strong> — Stripe (maksut), Supabase (tietojen
              tallennus), Google Maps (sijainti), Resend (sähköposti).
            </p>
            <p>
              <strong>3.3 Lakisääteiset velvoitteet</strong> — Tietoja voidaan luovuttaa lain,
              tuomioistuimen määräyksen tai viranomaisvaatimuksen perusteella.
            </p>
          </Block>

          <Block title="4. Tietojen säilytys ja turvallisuus">
            <p>
              <strong>4.1 Säilytys</strong> — Tiedot säilytetään Supabasen turvallisilla palvelimilla
              EU:ssa. Tietoja säilytetään niin kauan kuin tilisi on aktiivinen.
            </p>
            <p>
              <strong>4.2 Turvallisuus</strong> — Salaus, HTTPS-yhteydet, säännölliset
              tietoturvakatselmukset, rajoitettu pääsy henkilötietoihin.
            </p>
          </Block>

          <Block title="5. Sinun oikeutesi">
            <p>Sinulla on oikeus:</p>
            <ul className="ml-5 list-disc space-y-1">
              <li>Tutustua henkilötietoihisi</li>
              <li>Korjata virheelliset tiedot</li>
              <li>Poistaa tilisi ja tietosi</li>
              <li>Saada tietosi siirrettävässä muodossa</li>
              <li>Peruuttaa markkinointisuostumuksesi</li>
              <li>Vastustaa tiettyä käsittelyä</li>
            </ul>
            <p>
              Oikeuksien käyttämiseksi ota yhteyttä:{' '}
              <a href="mailto:teamfixla@gmail.com" className="font-semibold text-fixla-700 hover:underline">
                teamfixla@gmail.com
              </a>
              .
            </p>
          </Block>

          <Block title="6. Tietojen säilytysajat">
            <ul className="ml-5 list-disc space-y-1">
              <li>Aktiiviset tilit: tiedot säilytetään tilin ajan</li>
              <li>Käyttämättömät tilit: poistetaan 2 vuoden käyttämättömyyden jälkeen</li>
              <li>Transaktiotiedot: säilytetään 7 vuotta (lakisääteinen)</li>
              <li>Voit pyytää poistamista milloin tahansa</li>
            </ul>
          </Block>

          <Block title="7. Lasten yksityisyys">
            <ul className="ml-5 list-disc space-y-1">
              <li>Palvelu ei ole alle 18-vuotiaille</li>
              <li>Emme tietoisesti kerää tietoja alaikäisistä</li>
              <li>Palveluntarjoajien on oltava vähintään 18-vuotiaita</li>
            </ul>
          </Block>

          <Block title="8. Evästeet ja seuranta">
            <ul className="ml-5 list-disc space-y-1">
              <li>Emme käytä seurantaevästeitä</li>
              <li>Emme seuraa käyttäjiä yli sovellusten tai verkkosivujen</li>
              <li>Keräämme vain sovelluksen toiminnan kannalta välttämättömät tiedot</li>
            </ul>
          </Block>

          <Block title="9. Kansainväliset tiedonsiirrot">
            <ul className="ml-5 list-disc space-y-1">
              <li>Tietoja voidaan siirtää maksujen käsittelyä varten</li>
              <li>Kaikki siirrot noudattavat GDPR-vaatimuksia</li>
              <li>Käytämme vakiosopimuslausekkeita</li>
            </ul>
          </Block>

          <Block title="10. Käytännön muutokset">
            <ul className="ml-5 list-disc space-y-1">
              <li>Ilmoitamme merkittävistä muutoksista</li>
              <li>Käytön jatkaminen merkitsee hyväksymistä</li>
              <li>Päivityspäivämäärä näkyy käytännön yläosassa</li>
            </ul>
          </Block>

          <Block title="11. Yhteystiedot">
            <p>Yksityisyyttä koskevissa kysymyksissä:</p>
            <ul className="ml-5 list-disc space-y-1">
              <li>
                Sähköposti:{' '}
                <a href="mailto:teamfixla@gmail.com" className="font-semibold text-fixla-700 hover:underline">
                  teamfixla@gmail.com
                </a>
              </li>
              <li>Yritys: Fixla Oy</li>
              <li>Osoite: Helsinki, Suomi</li>
            </ul>
          </Block>

          <Block title="12. Tietosuojavastaava">
            <p>
              GDPR-aiheisissa tiedusteluissa:{' '}
              <a href="mailto:privacy@fixla.com" className="font-semibold text-fixla-700 hover:underline">
                privacy@fixla.com
              </a>
            </p>
          </Block>

          <Block title="13. Valvontaviranomainen">
            <p>Sinulla on oikeus tehdä valitus:</p>
            <p>
              Tietosuojavaltuutetun toimisto
              <br />
              PL 800
              <br />
              FI-00521 Helsinki
            </p>
          </Block>

          <p className="rounded-2xl bg-fixla-50 px-4 py-3 text-sm font-semibold text-fixla-700">
            Käyttämällä Fixlaa vahvistat lukeneesi ja ymmärtäneesi tämän tietosuojakäytännön ja
            hyväksyt tietojesi keräämisen ja käytön kuten yllä on kuvattu.
          </p>
        </section>
      </article>
    </main>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-base font-bold text-gray-900">{title}</h3>
      <div className="space-y-2 text-sm text-gray-700">{children}</div>
    </div>
  );
}
