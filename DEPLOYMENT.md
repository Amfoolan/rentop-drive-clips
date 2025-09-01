# Déploiement sur Vercel

## Prérequis

- Compte Vercel
- Compte GitHub
- Projet pushé sur GitHub

## Étapes de déploiement

### 1. Préparer le repository

```bash
# Cloner ou créer votre repository
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2. Déployer sur Vercel

1. Aller sur [vercel.com](https://vercel.com)
2. Se connecter avec GitHub
3. Cliquer sur "New Project"
4. Importer votre repository
5. Configurer les variables d'environnement:

```env
VITE_SUPABASE_URL=https://hlfozjnlhahdbnosltxl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsZm96am5saGFoZGJub3NsdHhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NzQ2ODMsImV4cCI6MjA3MjE1MDY4M30.dfkDxicmr1VZiOeOqDbigPqGuE5uF40Y3zpO3bd2oaQ
```

6. Cliquer sur "Deploy"

### 3. Configuration Supabase

Assurer-vous que votre projet Supabase autorise l'origine de votre domaine Vercel:

1. Aller dans Supabase Dashboard > Settings > API
2. Ajouter votre domaine Vercel dans "Site URL"
3. Ajouter votre domaine dans "Additional Redirect URLs"

### 4. Build et preview local

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Configuration automatique

Le fichier `vercel.json` est déjà configuré pour:
- Build automatique avec Vite
- Routing SPA pour React Router
- Optimisations de performance

## Support

Votre application sera automatiquement déployée à chaque push sur la branche main.