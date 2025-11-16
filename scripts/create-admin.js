/**
 * Script om een admin user aan te maken
 * 
 * Gebruik: node scripts/create-admin.js <email> <password>
 * 
 * Voorbeeld: node scripts/create-admin.js siemon@breaz-it.be mijnwachtwoord123
 * 
 * Zorg ervoor dat je .env.local bestand de volgende variabelen bevat:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY (niet de anon key, maar de service_role key!)
 */

// Laad .env.local handmatig (zonder dotenv package nodig)
const fs = require('fs');
const path = require('path');

function loadEnvFile(filePath) {
	if (!fs.existsSync(filePath)) return false;
	
	try {
		const content = fs.readFileSync(filePath, 'utf8');
		const lines = content.split('\n');
		
		for (const line of lines) {
			const trimmed = line.trim();
			// Skip comments en lege regels
			if (!trimmed || trimmed.startsWith('#')) continue;
			
			// Parse KEY=VALUE
			const match = trimmed.match(/^([^=]+)=(.*)$/);
			if (match) {
				const key = match[1].trim();
				let value = match[2].trim();
				// Remove quotes if present
				if ((value.startsWith('"') && value.endsWith('"')) || 
				    (value.startsWith("'") && value.endsWith("'"))) {
					value = value.slice(1, -1);
				}
				process.env[key] = value;
			}
		}
		return true;
	} catch (e) {
		return false;
	}
}

// Probeer eerst dotenv (als geïnstalleerd)
try {
	const dotenv = require('dotenv');
	const envLocalPath = path.join(process.cwd(), '.env.local');
	if (fs.existsSync(envLocalPath)) {
		dotenv.config({ path: envLocalPath });
	} else {
		const envPath = path.join(process.cwd(), '.env');
		if (fs.existsSync(envPath)) {
			dotenv.config({ path: envPath });
		}
	}
} catch (e) {
	// dotenv niet geïnstalleerd, gebruik handmatige parser
	const envLocalPath = path.join(process.cwd(), '.env.local');
	const envPath = path.join(process.cwd(), '.env');
	
	if (loadEnvFile(envLocalPath)) {
		console.log('✅ .env.local geladen (handmatig)\n');
	} else if (loadEnvFile(envPath)) {
		console.log('✅ .env geladen (handmatig)\n');
	}
}

const { createClient } = require('@supabase/supabase-js');

// Accepteer ook als command line arguments: node script.js <email> <password> <supabase_url> <service_role_key>
const SUPABASE_URL = process.argv[4] || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.argv[5] || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Fout: NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY moeten ingesteld zijn');
  console.log('\n📝 Opties:');
  console.log('1. Maak een .env.local bestand met:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=https://yrhuukwdstwjckridbtf.supabase.co');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  console.log('\n2. Of geef ze door als arguments:');
  console.log('   node scripts/create-admin.js <email> <password> <supabase_url> <service_role_key>');
  console.log('\n💡 Tip: Je kunt de SERVICE_ROLE_KEY vinden in je Supabase dashboard:');
  console.log('   Settings > API > service_role key (secret)\n');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser(email, password) {
  try {
    console.log(`\n🔐 Admin user aanmaken voor: ${email}\n`);

    // 1. Maak auth user aan
    console.log('1️⃣  Auth user aanmaken...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('⚠️  User bestaat al in auth. Gebruiker wordt bijgewerkt...');
        // Haal bestaande user op
        const { data: existingUser } = await supabase.auth.admin.listUsers();
        const user = existingUser?.users?.find(u => u.email === email);
        
        if (user) {
          // Update password
          await supabase.auth.admin.updateUserById(user.id, {
            password: password,
            email_confirm: true,
          });
          authData.user = { id: user.id, email: user.email };
        } else {
          throw new Error('User bestaat maar kan niet gevonden worden');
        }
      } else {
        throw authError;
      }
    }

    if (!authData?.user) {
      throw new Error('Geen user data teruggekregen');
    }

    console.log('✅ Auth user aangemaakt/geüpdatet');

    // 2. Maak/update user profile in users table
    console.log('2️⃣  User profile aanmaken/bijwerken...');
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .upsert({
        id: authData.user.id,
        email: email,
        role: 'Admin',
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (profileError) {
      throw profileError;
    }

    console.log('✅ User profile aangemaakt/bijgewerkt');
    console.log('\n🎉 Admin user succesvol aangemaakt!\n');
    console.log('📋 Details:');
    console.log(`   Email: ${email}`);
    console.log(`   Role: Admin`);
    console.log(`   ID: ${authData.user.id}\n`);
    console.log('💡 Je kunt nu inloggen met deze credentials in de app!\n');

  } catch (error) {
    console.error('\n❌ Fout bij aanmaken van admin user:', error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('❌ Gebruik: node scripts/create-admin.js <email> <password>');
  console.log('\nVoorbeeld:');
  console.log('  node scripts/create-admin.js siemon@breaz-it.be mijnwachtwoord123\n');
  process.exit(1);
}

createAdminUser(email, password);

