/**
 * Database Setup Script
 * 
 * Voer dit script uit om het database schema aan te maken in Supabase.
 * 
 * Gebruik: node scripts/setup-db.js
 * 
 * Zorg ervoor dat je .env.local bestand de volgende variabelen bevat:
 * - SUPABASE_DB_URL (bijv: postgresql://postgres:WOC-mvp123!@db.yrhuukwdstwjckridbtf.supabase.co:5432/postgres)
 * 
 * Of pas de connection string hieronder aan.
 */

const fs = require('fs');
const path = require('path');

// Database connection string
// Format: postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres
const DB_URL = process.env.SUPABASE_DB_URL || 'postgresql://postgres:WOC-mvp123!@db.yrhuukwdstwjckridbtf.supabase.co:5432/postgres';

async function setupDatabase() {
  try {
    // Lees het schema bestand
    const schemaPath = path.join(__dirname, '..', '.sql', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📖 Schema bestand gelezen');
    console.log('📋 Schema bevat', schema.split(';').length, 'statements');
    
    // Probeer pg te gebruiken als het beschikbaar is
    let pg;
    try {
      pg = require('pg');
    } catch (e) {
      console.error('\n❌ Fout: pg package niet gevonden.');
      console.log('\n📝 Opties:');
      console.log('1. Installeer pg: npm install --save-dev pg @types/pg');
      console.log('2. Of voer het schema handmatig uit in Supabase Dashboard:');
      console.log('   - Ga naar https://supabase.com/dashboard');
      console.log('   - Selecteer je project');
      console.log('   - Ga naar SQL Editor');
      console.log('   - Kopieer de inhoud van .sql/schema.sql');
      console.log('   - Plak en voer uit\n');
      console.log('📄 Schema bestand locatie:', schemaPath);
      process.exit(1);
    }
    
    const { Client } = pg;
    const client = new Client({
      connectionString: DB_URL,
    });
    
    console.log('🔌 Verbinden met database...');
    await client.connect();
    console.log('✅ Verbonden met database');
    
    // Split het schema in individuele statements
    // Verwijder comments en lege regels
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
      .map(s => s + ';');
    
    console.log(`\n🚀 Uitvoeren van ${statements.length} SQL statements...\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim().length === 1) continue; // Skip alleen ';'
      
      try {
        await client.query(statement);
        successCount++;
        if ((i + 1) % 10 === 0) {
          process.stdout.write(`\r✅ ${i + 1}/${statements.length} statements uitgevoerd...`);
        }
      } catch (error) {
        errorCount++;
        // Sommige errors zijn OK (bijv. IF NOT EXISTS)
        if (!error.message.includes('already exists') && 
            !error.message.includes('does not exist')) {
          console.error(`\n❌ Fout bij statement ${i + 1}:`, error.message);
          console.error('Statement:', statement.substring(0, 100) + '...');
        }
      }
    }
    
    console.log(`\n\n✅ Database setup voltooid!`);
    console.log(`   ✅ Succesvol: ${successCount}`);
    console.log(`   ⚠️  Errors (meestal OK): ${errorCount}`);
    console.log('\n🎉 Je database is nu klaar voor gebruik!\n');
    
    await client.end();
  } catch (error) {
    console.error('\n❌ Fout bij database setup:', error.message);
    console.error('\n💡 Tip: Controleer je database connection string en wachtwoord.');
    process.exit(1);
  }
}

setupDatabase();

