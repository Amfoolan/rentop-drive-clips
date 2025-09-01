# Rentop Drive Clips

Générateur de vidéos MP4 avec encodage serveur Next.js et FFmpeg.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/rentop-drive-clips&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY)

## Fonctionnalités

- ✅ Encodage vidéo MP4 côté serveur avec FFmpeg
- ✅ Format de sortie: H.264 + AAC, 1080x1920, 30fps
- ✅ Support audio MP3 optionnel
- ✅ Stockage automatique dans Supabase Storage
- ✅ Interface web simple et intuitive
- ✅ Téléchargement direct des vidéos générées

## Architecture

- **Frontend**: Next.js 14 App Router + Tailwind CSS
- **Encodage**: Node.js + fluent-ffmpeg + ffmpeg-static
- **Stockage**: Supabase Storage (bucket public)
- **Déploiement**: Vercel avec runtime Node.js

## Installation locale

```bash
# Cloner le repository
git clone https://github.com/YOUR_USERNAME/rentop-drive-clips.git
cd rentop-drive-clips

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés Supabase

# Lancer en développement
npm run dev
```

## Configuration Supabase

### 1. Créer le bucket de stockage

Dans votre dashboard Supabase, aller à Storage et exécuter:

```sql
-- Créer le bucket videos (public en lecture)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('videos', 'videos', true);

-- Politique d'upload (authentification requise pour upload)
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'videos' AND
  auth.role() = 'authenticated'
);

-- Politique de lecture publique
CREATE POLICY "Allow public downloads" ON storage.objects
FOR SELECT USING (bucket_id = 'videos');
```

### 2. Variables d'environnement

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon
```

## Déploiement Vercel

### 1. Via GitHub

1. Pusher votre code sur GitHub
2. Aller sur [vercel.com](https://vercel.com)
3. Cliquer "Add New Project"
4. Sélectionner votre repository
5. Ajouter les variables d'environnement:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Déployer

### 2. Via bouton de déploiement

Cliquer sur le bouton "Deploy with Vercel" en haut de ce README.

## Utilisation

### Interface web

1. Aller sur votre URL de déploiement
2. Coller les URLs d'images (une par ligne)
3. Optionnel: ajouter une URL audio MP3
4. Optionnel: ajouter un titre
5. Cliquer "Générer MP4"
6. Télécharger la vidéo générée

### API cURL

```bash
curl -X POST https://votre-app.vercel.app/encode \
  -H "Content-Type: application/json" \
  -d '{
    "images": [
      "https://picsum.photos/1080/1920?random=1",
      "https://picsum.photos/1080/1920?random=2",
      "https://picsum.photos/1080/1920?random=3"
    ],
    "title": "Test Video",
    "fps": 30,
    "durationPerImage": 2,
    "width": 1080,
    "height": 1920
  }'
```

Réponse:
```json
{
  "ok": true,
  "url": "https://hlfozjnlhahdbnosltxl.supabase.co/storage/v1/object/public/videos/clips/1703123456789.mp4"
}
```

## Limitations

- **Durée recommandée**: 10-20 secondes (6-12 images max)
- **Images**: minimum 2, maximum 30
- **Audio**: MP3 seulement
- **Timeout Vercel**: 5 minutes max pour l'encodage
- **Taille fichier**: optimisé pour mobile (1080x1920)

## Développement

### Structure du projet

```
├── app/
│   ├── encode/route.ts          # API d'encodage Node.js
│   ├── page.tsx                 # Interface utilisateur
│   ├── layout.tsx               # Layout principal
│   └── globals.css              # Styles globaux
├── lib/
│   ├── ffmpeg.ts                # Logique FFmpeg
│   ├── storage.ts               # Client Supabase
│   └── validate.ts              # Validation Zod
├── next.config.js               # Configuration Next.js
├── vercel.json                  # Configuration Vercel
└── tailwind.config.js           # Configuration Tailwind
```

### Scripts disponibles

```bash
npm run dev      # Développement local
npm run build    # Build de production
npm run start    # Serveur de production
npm run lint     # Linting TypeScript
```

## Dépendances principales

- `next` - Framework React
- `fluent-ffmpeg` - Interface FFmpeg
- `ffmpeg-static` - Binaire FFmpeg statique
- `@supabase/supabase-js` - Client Supabase
- `zod` - Validation des données
- `tailwindcss` - Styles CSS

## Support

Pour les questions techniques:
1. Vérifier les logs Vercel Functions
2. Vérifier les logs Supabase Storage
3. Tester l'API avec cURL
4. Vérifier les permissions du bucket Supabase

## Licence

MIT