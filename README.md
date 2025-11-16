# WOC MVP (Ouderscomité)

Minimal viable product voor events, shifts, inschrijvingen, nieuws, ledenlijst, sponsors en statische pagina's met rollen (Admin, Kernlid, Vrijwilliger).

## Stack

- **Framework**: Next.js 14 (App Router)
- **Taal**: TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL + RLS)
- **Auth**: Supabase Email/Password + Magic Link
- **Deploy**: Vercel

## Setup

### 1. Omgevingsvariabelen

Maak een `.env.local` bestand in de root met:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Setup

1. Ga naar je Supabase project dashboard
2. Open de **SQL Editor**
3. Kopieer de inhoud van `.sql/schema.sql`
4. Plak en voer het SQL script uit

Dit maakt alle tabellen, RLS policies, triggers en functies aan.

### 3. Storage Bucket Aanmaken

Voor het uploaden van event afbeeldingen en sponsor logos moet je een Storage bucket aanmaken:

1. Ga naar je Supabase project dashboard
2. Navigeer naar **Storage** in het linker menu
3. Klik op **New bucket**
4. Maak een bucket aan met de naam: `event-images`
5. Zet de bucket op **Public** (zodat afbeeldingen publiekelijk toegankelijk zijn)
6. Klik op **Create bucket**

**Belangrijk**: Zonder deze bucket kunnen event afbeeldingen en sponsor logos niet worden geüpload!

### 4. Admin User Aanmaken

Voeg de **SERVICE_ROLE_KEY** toe aan je `.env.local`:
```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Belangrijk**: Dit is NIET de anon key! Je vindt de service_role key in:
Supabase Dashboard > Settings > API > service_role key (secret)

Maak daarna je admin user aan:
```bash
npm run create-admin siemon@breaz-it.be jouwwachtwoord
```

Of gebruik het script direct:
```bash
node scripts/create-admin.js siemon@breaz-it.be jouwwachtwoord
```

### 5. Installatie

```bash
npm install
```

### 6. Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in je browser.

## Rollen

- **Admin**: Volledig beheer (events, shifts, nieuws, sponsors, pages, rollen wijzigen)
- **Kernlid**: Beheer events/shifts/nieuws (geen deletes op sponsoren/pages, geen rolbeheer)
- **Vrijwilliger**: Lezen; inschrijven/uitschrijven op shifts; eigen profiel beheren

## Routes

- `/` - Home (eerstvolgend event + laatste 3 nieuws)
- `/events` - Lijst van events
- `/events/[id]` - Event detail + shifts
- `/shifts` - Alle shifts (gegroepeerd per event)
- `/my-shifts` - Eigen inschrijvingen
- `/news` - Nieuws lijst + detail
- `/directory` - Ledenlijst
- `/sponsors` - Sponsors lijst
- `/about`, `/privacy`, `/contact` - Statische pagina's
- `/admin` - Admin dashboard (alleen Admin)