# Base de Données

## Vue d'ensemble

La base de données utilise PostgreSQL via Supabase avec Row Level Security (RLS) pour la sécurité au niveau des lignes.

## Schema de la Base de Données

### Table : `generated_videos`

**Description** : Stocke toutes les vidéos générées par les utilisateurs.

```sql
CREATE TABLE public.generated_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,                    -- Référence à auth.users
  title TEXT NOT NULL,                      -- Titre de la vidéo
  url TEXT NOT NULL,                        -- URL source Rentop
  car_data JSONB NOT NULL,                  -- Données de la voiture
  platforms JSONB DEFAULT '[]'::jsonb,      -- Plateformes de publication
  stats JSONB DEFAULT '{"likes": 0, "views": 0, "shares": 0}'::jsonb,
  video_file_path TEXT,                     -- Chemin vers le fichier vidéo
  thumbnail_url TEXT,                       -- URL de la vignette
  overlay_text TEXT,                        -- Texte de superposition
  voiceover_text TEXT,                      -- Texte de la voix off
  status TEXT NOT NULL DEFAULT 'generated', -- Statut de la vidéo
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Index** :
```sql
CREATE INDEX idx_generated_videos_user_id ON public.generated_videos(user_id);
CREATE INDEX idx_generated_videos_created_at ON public.generated_videos(created_at DESC);
CREATE INDEX idx_generated_videos_status ON public.generated_videos(status);
```

**Contraintes** :
- `user_id` NOT NULL (obligatoire pour RLS)
- `title` NOT NULL
- `url` NOT NULL
- `car_data` NOT NULL

### Table : `allowed_emails`

**Description** : Liste blanche des emails autorisés à accéder à l'application.

```sql
CREATE TABLE public.allowed_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Données initiales** :
```sql
INSERT INTO public.allowed_emails (email) VALUES 
  ('rentop.co.ae@gmail.com'),
  ('amine.ready@gmail.com');
```

## Row Level Security (RLS)

### Policies pour `generated_videos`

**1. Lecture (SELECT)**
```sql
CREATE POLICY "Users can view their own videos" 
ON public.generated_videos 
FOR SELECT 
USING (auth.uid() = user_id);
```

**2. Insertion (INSERT)**
```sql
CREATE POLICY "Users can create their own videos" 
ON public.generated_videos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);
```

**3. Mise à jour (UPDATE)**
```sql
CREATE POLICY "Users can update their own videos" 
ON public.generated_videos 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

**4. Suppression (DELETE)**
```sql
CREATE POLICY "Users can delete their own videos" 
ON public.generated_videos 
FOR DELETE 
USING (auth.uid() = user_id);
```

### Activation RLS
```sql
ALTER TABLE public.generated_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allowed_emails ENABLE ROW LEVEL SECURITY;
```

## Fonctions de Base de Données

### 1. Trigger de Mise à Jour Timestamp

**Fonction** :
```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Trigger** :
```sql
CREATE TRIGGER update_generated_videos_updated_at
    BEFORE UPDATE ON public.generated_videos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
```

### 2. Validation Email Autorisé

**Fonction** :
```sql
CREATE OR REPLACE FUNCTION public.check_allowed_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.allowed_emails 
    WHERE email = NEW.email
  ) THEN
    RAISE EXCEPTION 'Accès refusé. Email non autorisé.'
      USING ERRCODE = 'insufficient_privilege';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Trigger** :
```sql
CREATE TRIGGER check_user_email_allowed
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.check_allowed_email();
```

## Types de Données

### JSONB car_data
Structure des données de voiture :
```typescript
interface CarData {
  make: string;           // Marque
  model: string;          // Modèle
  year: number;           // Année
  price: number;          // Prix
  mileage?: number;       // Kilométrage
  location?: string;      // Localisation
  description?: string;   // Description
  images?: string[];      // URLs des images
  features?: string[];    // Caractéristiques
}
```

### JSONB platforms
Plateformes de publication :
```typescript
interface Platform {
  name: 'tiktok' | 'instagram' | 'youtube';
  published: boolean;
  publishedAt?: string;
  url?: string;
}
```

### JSONB stats
Statistiques de la vidéo :
```typescript
interface VideoStats {
  views: number;
  likes: number;
  shares: number;
  comments?: number;
  lastUpdated?: string;
}
```

## Migrations

### Structure des Migrations

Les migrations sont dans `supabase/migrations/` avec le format :
```
YYYYMMDD_HHMMSS_description.sql
```

### Exemple de Migration
```sql
-- Migration: 20250830_200802_create_generated_videos.sql
-- Création de la table generated_videos avec RLS

CREATE TABLE public.generated_videos (
  -- Structure de la table
);

-- Activation RLS
ALTER TABLE public.generated_videos ENABLE ROW LEVEL SECURITY;

-- Création des policies
CREATE POLICY "Users can view their own videos" ...

-- Création des triggers
CREATE TRIGGER update_generated_videos_updated_at ...
```

## Requêtes Courantes

### 1. Récupérer les Vidéos d'un Utilisateur
```sql
SELECT * FROM public.generated_videos 
WHERE user_id = auth.uid() 
ORDER BY created_at DESC;
```

### 2. Créer une Nouvelle Vidéo
```sql
INSERT INTO public.generated_videos (
  user_id, title, url, car_data, platforms, stats
) VALUES (
  auth.uid(), $1, $2, $3, $4, $5
) RETURNING *;
```

### 3. Mettre à Jour les Statistiques
```sql
UPDATE public.generated_videos 
SET stats = $1, updated_at = now()
WHERE id = $2 AND user_id = auth.uid();
```

### 4. Supprimer une Vidéo
```sql
DELETE FROM public.generated_videos 
WHERE id = $1 AND user_id = auth.uid();
```

## Backup & Recovery

### Backup Automatique
Supabase effectue des backups automatiques :
- **Daily backups** conservés 7 jours
- **Weekly backups** conservés 4 semaines
- **Point-in-time recovery** disponible

### Backup Manuel
```sql
-- Export de toutes les données utilisateur
SELECT * FROM public.generated_videos 
WHERE user_id = 'user-uuid';
```

## Monitoring & Maintenance

### Métriques à Surveiller
- Nombre de vidéos par utilisateur
- Performance des requêtes
- Taille de la base de données
- Erreurs RLS

### Requêtes de Maintenance
```sql
-- Nettoyage des vidéos anciennes (exemple)
DELETE FROM public.generated_videos 
WHERE created_at < NOW() - INTERVAL '1 year'
AND user_id = auth.uid();

-- Statistiques d'utilisation
SELECT 
  COUNT(*) as total_videos,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_processing_time
FROM public.generated_videos;
```

## Bonnes Pratiques

1. **Toujours utiliser RLS** : Chaque table doit avoir des policies appropriées
2. **Indexer les colonnes fréquemment utilisées** : user_id, created_at, status
3. **Valider les données JSONB** : Utiliser des contraintes CHECK si nécessaire
4. **Nettoyer régulièrement** : Supprimer les données obsolètes
5. **Monitorer les performances** : Utiliser EXPLAIN ANALYZE pour optimiser les requêtes