# Rentop Clips Studio - Next.js

Générateur de vidéos TikTok/Instagram automatique avec encodage serveur via Vercel Functions.

## 🚀 Déploiement sur Vercel

### 1. Prérequis
- Compte Vercel
- Projet Supabase configuré
- Comptes développeur pour réseaux sociaux (optionnel)

### 2. Installation des dépendances

```bash
npm install next react react-dom typescript @types/node @types/react @types/react-dom
npm install tailwindcss postcss autoprefixer
npm install fluent-ffmpeg ffmpeg-static @types/fluent-ffmpeg
npm install @supabase/supabase-js zod node-fetch @types/node-fetch form-data
```

### 3. Configuration

Copier `.env.example` vers `.env.local` et configurer:

```bash
# Minimum requis
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Pour publication sociale (optionnel)
INSTAGRAM_APP_ID=your-app-id
TIKTOK_CLIENT_KEY=your-client-key
# ... autres APIs
```

### 4. Configuration Supabase

Créer un bucket Storage nommé `public`:

```sql
-- Créer le bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('public', 'public', true);

-- Politique de lecture publique
CREATE POLICY "Public bucket read access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'public');

-- Politique d'écriture pour utilisateurs authentifiés
CREATE POLICY "Authenticated users can upload" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'public' AND auth.role() = 'authenticated');
```

### 5. Déploiement Vercel

```bash
# Lier le repo à Vercel
vercel --prod

# Ou via interface web Vercel:
# 1. Import GitHub repo
# 2. Ajouter variables d'environnement
# 3. Deploy
```

## 🎥 Fonctionnalités

- ✅ **Encodage serveur** : FFmpeg + ffmpeg-static côté Vercel
- ✅ **Format optimisé** : MP4 H.264 (1080x1920) pour TikTok/Instagram
- ✅ **Audio support** : MP3 avec codec AAC 128k
- ✅ **Stockage cloud** : Upload automatique vers Supabase Storage
- ✅ **Interface intuitive** : UI simple et responsive
- 🚧 **Publication sociale** : Endpoints prêts pour OAuth + API

## 📱 Formats supportés

- **Sortie** : MP4 (1080x1920, 30fps)
- **Codec vidéo** : H.264 baseline level 3.1, yuv420p
- **Codec audio** : AAC 128k
- **Optimisation** : movflags +faststart pour streaming
- **Durée** : 10-20s recommandé

## 🛠️ Développement local

```bash
npm run dev
# Ouvrir http://localhost:3000
```

## 📡 API Endpoints

### Encodage vidéo
```bash
POST /encode
Content-Type: application/json

{
  "images": ["https://picsum.photos/1080/1920", "..."],
  "audio": "https://example.com/music.mp3",
  "title": "Lamborghini Huracan 2024",
  "fps": 30,
  "durationPerImage": 2
}
```

### Publication (à implémenter)
```bash
POST /publish/instagram
POST /publish/tiktok
POST /publish/youtube
POST /publish/pinterest
POST /publish/x
```

### OAuth (à implémenter)
```bash
GET /api-auth/instagram
GET /api-auth/tiktok
GET /api-auth/youtube
GET /api-auth/pinterest
GET /api-auth/x
```

## 🧪 Test encodage

Exemple avec images Picsum:

```bash
curl -X POST https://your-app.vercel.app/encode \
  -H "Content-Type: application/json" \
  -d '{
    "images":[
      "https://picsum.photos/seed/1/1080/1920",
      "https://picsum.photos/seed/2/1080/1920",
      "https://picsum.photos/seed/3/1080/1920",
      "https://picsum.photos/seed/4/1080/1920",
      "https://picsum.photos/seed/5/1080/1920"
    ],
    "title":"Test Rentop Clips",
    "fps":30,
    "durationPerImage":2
  }'
```

Réponse attendue:
```json
{
  "ok": true,
  "url": "https://xxx.supabase.co/storage/v1/object/public/public/clips/1234567890.mp4"
}
```

## 📋 Checklist Publication Sociale

### Instagram
- [ ] Créer Facebook App avec Instagram Basic Display
- [ ] Configurer OAuth avec scopes `instagram_content_publish`
- [ ] Implémenter endpoints `/api-auth/instagram` et `/publish/instagram`
- [ ] Tester avec compte Business Instagram

### TikTok
- [ ] Créer TikTok Developer App
- [ ] Demander accès Content Posting API (review requis)
- [ ] Implémenter OAuth 2.0 + chunked upload
- [ ] Respecter rate limits et content guidelines

### YouTube
- [ ] Créer Google Cloud Project + activer YouTube Data API v3
- [ ] Configurer OAuth 2.0 avec scope `youtube.upload`
- [ ] Gérer quota API (1600 unités par upload)
- [ ] Format Shorts: durée < 60s, ratio vertical

### Pinterest
- [ ] Créer Pinterest Developer App
- [ ] OAuth avec scopes `pins:write, boards:read`
- [ ] Sélectionner board_id pour publication
- [ ] Support vidéos jusqu'à 2GB, max 15min

### X (Twitter)
- [ ] Créer X Developer Account + Project
- [ ] OAuth 2.0 avec PKCE + scopes `tweet.write, media.upload`
- [ ] Implémenter chunked upload (>5MB)
- [ ] Limites: 512MB max, formats MP4/MOV

## ⚠️ Notes importantes

1. **Limites Vercel** : Fonctions limitées à 10s d'exécution (Hobby) / 60s (Pro)
2. **FFmpeg performance** : Preset `medium` pour équilibre qualité/vitesse
3. **Stockage** : Ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY` côté client
4. **Debug** : Activer logs détaillés pour debugging upload/publish
5. **Rate limits** : Respecter quotas APIs des réseaux sociaux

## 🔒 Sécurité

- Validation stricte des URLs d'entrée (éviter SSRF)
- Limitation du nombre d'images (max 30)
- Timeout sur téléchargements d'assets
- Nettoyage automatique des fichiers temporaires
- Tokens OAuth stockés chiffrés en DB

---

Migration réussie de l'encodage client vers serveur Vercel ! 🎉