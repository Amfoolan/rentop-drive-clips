# Documentation Rentop Video Creator

## Vue d'ensemble

Rentop Video Creator est une application web privée pour créer automatiquement des vidéos TikTok à partir de contenu Rentop. L'application est strictement limitée aux utilisateurs autorisés : `rentop.co.ae@gmail.com` et `amine.ready@gmail.com`.

## Table des Matières

1. [Architecture Générale](./ARCHITECTURE.md)
2. [Authentification & Sécurité](./AUTHENTICATION.md)
3. [Base de Données](./DATABASE.md)
4. [Composants Frontend](./COMPONENTS.md)
5. [Hooks & Utilitaires](./HOOKS.md)
6. [Configuration & Déploiement](./DEPLOYMENT.md)
7. [Guide de Maintenance](./MAINTENANCE.md)

## Technologies Utilisées

### Frontend
- **React 18** avec TypeScript
- **Vite** pour le build et dev server
- **Tailwind CSS** pour le styling
- **Shadcn/ui** pour les composants UI
- **React Router** pour la navigation
- **React Query** pour la gestion d'état serveur
- **Lucide React** pour les icônes

### Backend
- **Supabase** pour :
  - Authentification
  - Base de données PostgreSQL
  - Row Level Security (RLS)
  - Storage (bucket videos)
  - Edge Functions

### Outils de Développement
- **ESLint** pour le linting
- **TypeScript** pour le typage
- **PostCSS** et **Autoprefixer**

## Structure du Projet

```
src/
├── components/          # Composants React
│   ├── Auth/           # Authentification
│   ├── VideoGenerator/ # Génération de vidéos
│   └── ui/             # Composants UI (shadcn)
├── hooks/              # React hooks personnalisés
├── integrations/       # Intégrations externes
│   └── supabase/       # Configuration Supabase
├── pages/              # Pages de l'application
├── utils/              # Fonctions utilitaires
└── lib/                # Configuration des librairies

supabase/
├── config.toml         # Configuration Supabase
├── functions/          # Edge Functions
└── migrations/         # Migrations de base de données

docs/                   # Documentation
```

## Démarrage Rapide

1. **Installation des dépendances**
   ```bash
   npm install
   ```

2. **Démarrage en développement**
   ```bash
   npm run dev
   ```

3. **Build pour production**
   ```bash
   npm run build
   ```

## Utilisateurs Autorisés

L'application est strictement limitée à ces emails :
- `rentop.co.ae@gmail.com`
- `amine.ready@gmail.com`

Toute tentative de connexion avec un autre email sera automatiquement rejetée.

## Support & Contact

Pour toute question ou problème technique, contacter les administrateurs autorisés.