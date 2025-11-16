# Supabase Storage Setup

## Storage Bucket Aanmaken

De applicatie heeft een Supabase Storage bucket nodig voor het uploaden van:
- Event afbeeldingen
- Sponsor logos

### Stap-voor-stap instructies:

1. **Ga naar Supabase Dashboard**
   - Open https://supabase.com/dashboard
   - Selecteer je project

2. **Navigeer naar Storage**
   - Klik op **Storage** in het linker menu

3. **Maak een nieuwe bucket**
   - Klik op **New bucket** of **Create bucket**
   - Bucket naam: `event-images`
   - **Belangrijk**: Zet de bucket op **Public** (checkbox "Public bucket")
   - Klik op **Create bucket**

4. **Verifieer de bucket**
   - Je zou nu een bucket moeten zien met de naam `event-images`
   - De bucket moet de status "Public" hebben

### Waarom Public?

De bucket moet publiek zijn zodat:
- Afbeeldingen direct kunnen worden weergegeven in de browser
- Geen authenticatie nodig is om afbeeldingen te bekijken
- De URLs direct werken zonder extra configuratie

### Storage Structuur

De bucket gebruikt de volgende folder structuur:
```
event-images/
  ├── events/
  │   └── [timestamp]-[random].jpg
  └── sponsors/
      └── [timestamp]-[random].png
```

### Troubleshooting

**Probleem**: Logo's worden niet weergegeven
- **Oplossing**: Controleer of de bucket `event-images` bestaat en publiek is
- Controleer of de bucket naam exact `event-images` is (geen hoofdletters)

**Probleem**: Upload faalt met "Bucket not found"
- **Oplossing**: Maak de bucket aan zoals hierboven beschreven
- Wacht een paar seconden en probeer opnieuw

**Probleem**: Afbeeldingen laden niet (403 Forbidden)
- **Oplossing**: Zorg ervoor dat de bucket op "Public" staat
- Controleer de bucket policies in Supabase

