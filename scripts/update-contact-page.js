/**
 * Update Contact Page Script
 * 
 * Voer dit script uit om de "Contact" pagina bij te werken
 * 
 * Gebruik: node scripts/update-contact-page.js
 * 
 * Zorg ervoor dat je .env.local bestand de volgende variabelen bevat:
 * - SUPABASE_DB_URL (bijv: postgresql://postgres:WOC-mvp123!@db.yrhuukwdstwjckridbtf.supabase.co:5432/postgres)
 */

const DB_URL = process.env.SUPABASE_DB_URL || 'postgresql://postgres:WOC-mvp123!@db.yrhuukwdstwjckridbtf.supabase.co:5432/postgres';

const contactContent = `Contact - Wechels OuderComité

Heb je vragen, suggesties of wil je graag lid worden van het Wechels OuderComité? Neem gerust contact met ons op!

We zijn altijd op zoek naar enthousiaste ouders die willen meehelpen om de school en onze activiteiten te ondersteunen.

Contactgegevens

E-mail: [Vul hier het e-mailadres in]
Telefoon: [Vul hier het telefoonnummer in]
Adres: 't Klavernest, [Vul hier het adres in]

Sociale Media

Volg ons op Facebook voor het laatste nieuws en updates over onze activiteiten.

Lid worden?

Wil jij graag mee nadenken over hoe we op een leuke en creatieve manier ons doel kunnen bereiken? Dat kan, door lid te worden van het Wechels Oudercomité! Als lid organiseer en werk je actief mee aan één of meerdere van onze activiteiten.

Helpende hand?

Heb je echter niet zo veel zin of tijd om alle vergaderingen het hele jaar door mee te volgen, maar wil je wel af en toe mee de handen uit de mouwen steken? Super! Schrijf je dan in als helpende hand om onze activiteiten mee te ondersteunen en in goede banen te leiden.

Vergaderingen

Het oudercomité vergadert ongeveer één keer per maand. De school is vertegenwoordigd door de directeur en een leerkracht van de school.`;

async function updateContactPage() {
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
    
    // Update or insert the contact page
    const query = `
      INSERT INTO pages (slug, title, content, updated_at)
      VALUES ('contact', 'Contact', $1, NOW())
      ON CONFLICT (slug) 
      DO UPDATE SET 
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        updated_at = NOW()
      RETURNING *;
    `;
    
    console.log('📝 Bijwerken van "Contact" pagina...');
    const result = await client.query(query, [contactContent]);
    
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

updateContactPage();

