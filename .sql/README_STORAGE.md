# Supabase Storage Setup voor Event Images

Om event images te kunnen uploaden, moet je een Supabase Storage bucket aanmaken.

## Stappen:

1. Ga naar je Supabase Dashboard
2. Navigeer naar **Storage** in het menu
3. Klik op **New bucket**
4. Maak een bucket aan met de naam: `event-images`
5. Stel de bucket in als **Public bucket** (zodat images publiek toegankelijk zijn)
6. Configureer de Storage Policies:

### Storage Policy voor Upload (Admin/Kernlid)

```sql
-- Policy: Allow Admin/Kernlid to upload images
CREATE POLICY "Admin/Kernlid can upload event images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'event-images' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('Admin', 'Kernlid')
  )
);
```

### Storage Policy voor Read (Iedereen)

```sql
-- Policy: Allow everyone to read event images
CREATE POLICY "Everyone can read event images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-images');
```

### Storage Policy voor Delete (Admin/Kernlid)

```sql
-- Policy: Allow Admin/Kernlid to delete event images
CREATE POLICY "Admin/Kernlid can delete event images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'event-images' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('Admin', 'Kernlid')
  )
);
```

## Database Migratie

Voer ook de database migratie uit om het `image_url` veld toe te voegen:

```sql
-- Voer dit uit in de SQL Editor van Supabase
ALTER TABLE events ADD COLUMN IF NOT EXISTS image_url TEXT;
```

## Testen

Na het opzetten van de storage bucket en policies, kun je:
1. Een event aanmaken via de events pagina
2. Een afbeelding uploaden bij het aanmaken/bewerken van een event
3. De afbeelding zou zichtbaar moeten zijn op de events pagina en event detail pagina

