/**
 * Update Privacy Page Script
 * 
 * Voer dit script uit om de "Privacy" pagina bij te werken met GDPR-compliant content
 * 
 * Gebruik: node scripts/update-privacy-page.js
 * 
 * Zorg ervoor dat je .env.local bestand de volgende variabelen bevat:
 * - SUPABASE_DB_URL (bijv: postgresql://postgres:WOC-mvp123!@db.yrhuukwdstwjckridbtf.supabase.co:5432/postgres)
 */

const DB_URL = process.env.SUPABASE_DB_URL || 'postgresql://postgres:WOC-mvp123!@db.yrhuukwdstwjckridbtf.supabase.co:5432/postgres';

const privacyContent = `Privacyverklaring - Wechels OuderComité

Laatste update: ${new Date().toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' })}

1. Inleiding

Het Wechels OuderComité (WOC) respecteert uw privacy en is verantwoordelijk voor de verwerking van uw persoonsgegevens. Deze privacyverklaring legt uit welke gegevens we verzamelen, waarom we deze verzamelen, hoe we ze gebruiken en wat uw rechten zijn.

2. Verantwoordelijke voor de verwerking

Wechels OuderComité
't Klavernest
[Adres]
[Contactgegevens]

3. Welke gegevens verzamelen we?

3.1 Gegevens die u aan ons verstrekt
- Naam en voornaam
- E-mailadres
- Telefoonnummer (optioneel)
- Profielfoto (optioneel)
- Team/rol binnen het oudercomité

3.2 Gegevens die automatisch worden verzameld
- IP-adres
- Browser type en versie
- Bezoekdatum en -tijd
- Verwijzende website
- Cookies (zie Cookiebeleid hieronder)

4. Waarom verwerken we uw gegevens?

We verwerken uw persoonsgegevens voor de volgende doeleinden:
- Beheer van leden en vrijwilligers
- Organisatie van activiteiten en events
- Communicatie over activiteiten en nieuws
- Inschrijvingen voor shifts en events beheren
- Toegang tot het platform beheren (authenticatie)
- Verbetering van onze diensten

5. Juridische grondslag

We verwerken uw gegevens op basis van:
- Uw toestemming (art. 6.1.a GDPR)
- Uitvoering van een overeenkomst (art. 6.1.b GDPR)
- Gerechtvaardigd belang (art. 6.1.f GDPR) voor het beheer van het platform

6. Met wie delen we uw gegevens?

Uw gegevens worden alleen gedeeld met:
- Andere leden van het oudercomité (naam, e-mail, team) via de ledenlijst
- Dienstverleners die technische ondersteuning bieden (Supabase, Vercel)
- Wanneer dit wettelijk verplicht is

We verkopen uw gegevens niet aan derden.

7. Bewaartermijn

We bewaren uw gegevens zolang:
- U lid bent van het oudercomité
- Dit nodig is voor de doeleinden waarvoor ze zijn verzameld
- Dit wettelijk verplicht is

Na beëindiging van uw lidmaatschap worden uw gegevens binnen 30 dagen verwijderd, tenzij wettelijke bewaarverplichtingen van toepassing zijn.

8. Uw rechten

U heeft de volgende rechten:
- Recht op inzage: u kunt opvragen welke gegevens we van u hebben
- Recht op rectificatie: u kunt onjuiste gegevens laten corrigeren
- Recht op verwijdering: u kunt verzoeken om verwijdering van uw gegevens
- Recht op beperking: u kunt verzoeken om beperking van de verwerking
- Recht op overdraagbaarheid: u kunt uw gegevens opvragen in een gestructureerd formaat
- Recht van bezwaar: u kunt bezwaar maken tegen de verwerking
- Recht om toestemming in te trekken: als verwerking op toestemming is gebaseerd

Om deze rechten uit te oefenen, neem contact met ons op via [e-mailadres].

9. Beveiliging

We nemen passende technische en organisatorische maatregelen om uw gegevens te beschermen tegen verlies, diefstal of ongeautoriseerde toegang. Dit omvat:
- Versleuteling van gegevens in transit (HTTPS)
- Toegangscontrole en authenticatie
- Regelmatige back-ups
- Beperkte toegang tot persoonsgegevens

10. Cookies

Zie ons Cookiebeleid hieronder voor meer informatie over het gebruik van cookies.

11. Wijzigingen

We kunnen deze privacyverklaring van tijd tot tijd aanpassen. De laatste versie is altijd beschikbaar op deze pagina.

12. Contact

Voor vragen over deze privacyverklaring of uw gegevens, neem contact met ons op via [e-mailadres].

---

COOKIEBELEID

1. Wat zijn cookies?

Cookies zijn kleine tekstbestanden die op uw apparaat worden geplaatst wanneer u een website bezoekt. Ze helpen de website om informatie te onthouden over uw bezoek.

2. Welke cookies gebruiken we?

2.1 Essentiële cookies
Deze cookies zijn noodzakelijk voor het functioneren van de website en kunnen niet worden uitgeschakeld:
- Authenticatie cookies: voor het inloggen en beheren van uw sessie
- Beveiligingscookies: voor het beschermen tegen frauduleuze activiteiten
- Functionaliteitscookies: voor het onthouden van uw voorkeuren

2.2 Analytische cookies (optioneel)
Deze cookies helpen ons te begrijpen hoe bezoekers de website gebruiken:
- We gebruiken momenteel geen analytische cookies, maar kunnen deze in de toekomst toevoegen met uw toestemming

2.3 Marketing cookies (optioneel)
Deze cookies worden gebruikt om relevante advertenties te tonen:
- We gebruiken geen marketing cookies

3. Cookie toestemming

Voor niet-essentiële cookies vragen we uw toestemming voordat we deze plaatsen. U kunt uw toestemming op elk moment wijzigen via de cookie-instellingen.

4. Cookie beheer

U kunt cookies beheren via:
- Uw browserinstellingen (meeste browsers hebben opties om cookies te blokkeren of verwijderen)
- Onze cookie banner (wanneer beschikbaar)

Let op: het uitschakelen van essentiële cookies kan de functionaliteit van de website beperken.

5. Cookies van derden

We gebruiken de volgende diensten van derden die cookies kunnen plaatsen:
- Supabase: voor authenticatie en database (essentiële cookies)
- Vercel: voor hosting en analytics (indien van toepassing)

6. Cookie bewaartermijn

- Sessie cookies: worden verwijderd wanneer u de browser sluit
- Permanente cookies: blijven bewaard volgens de instellingen (maximaal 12 maanden)

7. Meer informatie

Voor meer informatie over cookies kunt u de website van de Autoriteit Persoonsgegevens bezoeken: https://www.autoriteitpersoonsgegevens.nl`;

async function updatePrivacyPage() {
  try {
    let pg;
    try {
      pg = require('pg');
    } catch (e) {
      console.error('\n❌ Fout: pg package niet gevonden.');
      console.log('\n📝 Installeer pg: npm install --save-dev pg @types/pg\n');
      process.exit(1);
    }
    
    const { Client } = pg;
    const client = new Client({
      connectionString: DB_URL,
    });
    
    console.log('🔌 Verbinden met database...');
    await client.connect();
    console.log('✅ Verbonden met database');
    
    // Update or insert the privacy page
    const query = `
      INSERT INTO pages (slug, title, content, updated_at)
      VALUES ('privacy', 'Privacyverklaring', $1, NOW())
      ON CONFLICT (slug) 
      DO UPDATE SET 
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        updated_at = NOW()
      RETURNING *;
    `;
    
    console.log('📝 Bijwerken van "Privacyverklaring" pagina...');
    const result = await client.query(query, [privacyContent]);
    
    console.log('✅ Pagina succesvol bijgewerkt!');
    console.log(`   Slug: ${result.rows[0].slug}`);
    console.log(`   Titel: ${result.rows[0].title}`);
    console.log(`   Content lengte: ${result.rows[0].content.length} karakters`);
    
    await client.end();
    console.log('\n🎉 Klaar!\n');
  } catch (error) {
    console.error('\n❌ Fout bij bijwerken van pagina:', error.message);
    console.error('\n💡 Tip: Controleer je database connection string en wachtwoord.');
    process.exit(1);
  }
}

updatePrivacyPage();

