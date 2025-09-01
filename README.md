# Rentop Video Generator

Générateur de vidéos TikTok automatique pour locations de voitures à Dubai.

## 🚀 Déploiement sur Vercel

### 1. Prérequis
- Compte Vercel
- Projet Supabase configuré

### 2. Variables d'environnement
Ajoutez ces variables dans votre projet Vercel :

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Déploiement automatique
1. Connectez votre repo GitHub à Vercel
2. Les variables d'environnement sont configurées automatiquement
3. Le build se lance automatiquement

### 4. Configuration Supabase
Assurez-vous que vos Edge Functions sont déployées :
```bash
supabase functions deploy video-encoder
supabase functions deploy scrape-rentop
```

## 📁 Structure du projet

```
src/
├── components/
│   ├── VideoGenerator/     # Composants génération vidéo
│   ├── Auth/              # Authentification
│   └── ui/                # Composants UI
├── hooks/                 # Hooks React
├── utils/                 # Utilitaires
└── integrations/          # Intégrations externes

supabase/
├── functions/             # Edge Functions
└── migrations/            # Migrations DB
```

## 🎥 Fonctionnalités

- ✅ Scraping automatique Rentop
- ✅ Génération vidéo côté serveur
- ✅ Audio IA (ElevenLabs)
- ✅ Effets visuels avancés
- ✅ Export MP4 haute qualité
- ✅ Interface intuitive

## 🛠️ Développement local

```bash
npm install
npm run dev
```

## 📱 Formats supportés
- **Sortie** : MP4 (1080x1920) - Format TikTok/Instagram Reels
- **Audio** : ElevenLabs IA, Upload MP3, ou Muet
- **Images** : Automatique via Rentop ou upload manuel

---

## Original Lovable Info

**URL**: https://lovable.dev/projects/de781d46-5b2b-43dd-bb6b-511115353a70

### Développement avec Lovable
Visitez le [Lovable Project](https://lovable.dev/projects/de781d46-5b2b-43dd-bb6b-511115353a70) pour éditer via IA.
