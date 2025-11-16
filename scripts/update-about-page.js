/**
 * Update About Page Script
 * 
 * Voer dit script uit om de "Over Ons" pagina bij te werken met content van klavernest.be
 * 
 * Gebruik: node scripts/update-about-page.js
 * 
 * Zorg ervoor dat je .env.local bestand de volgende variabelen bevat:
 * - SUPABASE_DB_URL (bijv: postgresql://postgres:WOC-mvp123!@db.yrhuukwdstwjckridbtf.supabase.co:5432/postgres)
 */

const DB_URL = process.env.SUPABASE_DB_URL || 'postgresql://postgres:WOC-mvp123!@db.yrhuukwdstwjckridbtf.supabase.co:5432/postgres';

const aboutContent = `Wat is het WOC?

Het Wechels OuderComité (WOC) is een groep enthousiaste ouders die zich vrijwillig inzet voor de school. We doen dit niet alleen omdat het leuk is, maar ook om de school, waar onze kinderen dag-in-dag-uit welkom zijn, te steunen.

We vergaderen regelmatig en organiseren meerdere activiteiten ten voordele van 't Klavernest. Verspreid over het schooljaar worden er verschillende projecten uitgewerkt die doorgaan na de schooluren, zoals het WOC-ontbijt, wafelverkoop, fuif voor de mama's en papa's, mobiliteit, ... Ook tijdens de schooluren staat het oudercomité paraat! Tijdens de dag van de leerkracht, voorleesweek, carnaval, ...

OUDERS en leerkrachten slaan de handen in elkaar.

Het oudercomité vergadert ongeveer één keer per maand. De school is vertegenwoordigd door de directeur en een leerkracht van de school. Daarnaast kunnen we steeds rekenen op enkele helpende handen die de school een warm hart toedragen.

Samen werken we aan de toekomst van onze kinderen.

Alle activiteiten die door ons georganiseerd worden, staan in het teken van alle kinderen die in 't Klavernest naar school gaan of zullen gaan. De middelen die we verzamelen door het organiseren van verschillende activiteiten gaan integraal naar de school.

Activiteiten schooljaar

Ontdek hier welke activiteiten er dit jaar georganiseerd zullen worden.

WOC - LEDEN

Ontdek hier wie er dit schooljaar lid is van het oudercomité.

Schrijf je in en blijf op de hoogte!

Wil jij graag mee nadenken over hoe we op een leuke en creatieve manier ons doel kunnen bereiken? Dat kan, door lid te worden van het Wechels Oudercomité! Als lid organiseer en werk je actief mee aan één of meerdere van onze activiteiten. Daarnaast ondersteun je waar mogelijk als helpende hand bij de uitvoering van onze andere activiteiten.

Heb je echter niet zo veel zin of tijd om alle vergaderingen het hele jaar door mee te volgen, maar wil je wel af en toe mee de handen uit de mouwen steken? Super! Schrijf je dan in als helpende hand om onze activiteiten mee te ondersteunen en in goede banen te leiden.

Contacteer ons via mail voor meer informatie.`;

async function updateAboutPage() {
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
    
    // Update of insert the about page
    const query = `
      INSERT INTO pages (slug, title, content, updated_at)
      VALUES ('about', 'Over Ons', $1, NOW())
      ON CONFLICT (slug) 
      DO UPDATE SET 
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        updated_at = NOW()
      RETURNING *;
    `;
    
    console.log('📝 Bijwerken van "Over Ons" pagina...');
    const result = await client.query(query, [aboutContent]);
    
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

updateAboutPage();

