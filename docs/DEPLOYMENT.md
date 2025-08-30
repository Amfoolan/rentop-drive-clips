# Configuration & Déploiement

## Vue d'ensemble

Ce document couvre la configuration du projet, les variables d'environnement, et les procédures de déploiement.

## Configuration du Projet

### Structure de Configuration

```
├── .env                    # Variables d'environnement (local)
├── vite.config.ts         # Configuration Vite
├── tailwind.config.ts     # Configuration Tailwind
├── tsconfig.json          # Configuration TypeScript
├── eslint.config.js       # Configuration ESLint
├── postcss.config.js      # Configuration PostCSS
└── supabase/
    └── config.toml        # Configuration Supabase
```

### Variables d'Environnement

**Fichier .env** :
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://hlfozjnlhahdbnosltxl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Development
VITE_DEV_MODE=true
VITE_LOG_LEVEL=debug
```

**⚠️ Important** : Ne jamais commiter le fichier `.env` avec de vraies clés API.

### Configuration Vite (vite.config.ts)

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "::", // Écoute sur toutes les interfaces
    port: 8080, // Port pour Lovable
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    }
  }
});
```

### Configuration Tailwind (tailwind.config.ts)

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

### Configuration Supabase (supabase/config.toml)

```toml
project_id = "hlfozjnlhahdbnosltxl"

[api]
enabled = true
port = 54321
schemas = ["public", "graphql_public"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[auth]
enabled = true
port = 54324
site_url = "http://localhost:3000"
additional_redirect_urls = ["https://localhost:3000"]
jwt_expiry = 3600
enable_signup = true
enable_email_confirmations = true

[db]
port = 54322

[storage]
enabled = true
port = 54323
file_size_limit = "50MiB"
buckets = [
  { name = "videos", public = true }
]

[functions.scrape-rentop]
verify_jwt = false

[functions.validate-user]
verify_jwt = false
```

## Déploiement

### Déploiement sur Lovable

**Processus automatique** :
1. Push du code vers le repository Lovable
2. Build automatique avec Vite
3. Déploiement sur le CDN Lovable
4. URL d'accès générée automatiquement

**URL de production** : `https://[projet-id].lovable.app`

### Configuration de Production

**Variables d'environnement de production** :
- Configurées directement dans l'interface Lovable
- Pas de fichier `.env` en production
- Secrets gérés par Supabase

### Build de Production

```bash
# Installation des dépendances
npm install

# Build pour production
npm run build

# Aperçu du build
npm run preview
```

**Optimisations de build** :
- Code splitting automatique
- Compression des assets
- Tree shaking
- Minification CSS/JS

### Déploiement Manuel (si nécessaire)

```bash
# Build du projet
npm run build

# Contenu du dossier dist/
# ├── index.html
# ├── assets/
# │   ├── index-[hash].js
# │   ├── index-[hash].css
# │   └── vendor-[hash].js
# └── vite.svg
```

## Configuration Supabase

### Edge Functions

**Déploiement automatique** :
- Les Edge Functions sont déployées automatiquement
- Configuration dans `supabase/config.toml`
- Secrets gérés dans l'interface Supabase

**Structure** :
```
supabase/functions/
├── scrape-rentop/
│   └── index.ts
└── validate-user/
    └── index.ts
```

### Secrets Management

**Configuration des secrets** :
1. Accès au dashboard Supabase
2. Settings → Functions
3. Ajout des variables d'environnement

**Secrets nécessaires** :
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`

### Database Migrations

**Application des migrations** :
```bash
# Via l'interface Lovable (automatique)
# Ou manuellement via Supabase CLI
supabase db push
```

**Suivi des migrations** :
- Toutes les migrations sont versionnées
- Rollback possible via l'interface
- Backup automatique avant migration

## Monitoring & Logs

### Logs Frontend

**Configuration du logging** :
```typescript
// utils/logger.ts
const isDev = import.meta.env.DEV;

export const logger = {
  info: (message: string, data?: any) => {
    if (isDev) console.log(`[INFO] ${message}`, data);
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
    // En production, envoyer à un service de logging
  },
  warn: (message: string, data?: any) => {
    if (isDev) console.warn(`[WARN] ${message}`, data);
  }
};
```

### Logs Backend (Supabase)

**Accès aux logs** :
- Dashboard Supabase → Functions → Logs
- Dashboard Supabase → Auth → Users
- Dashboard Supabase → Database → Logs

**Types de logs surveillés** :
- Erreurs d'authentification
- Échecs de génération vidéo
- Erreurs de base de données
- Performance des Edge Functions

### Monitoring de Performance

**Métriques à surveiller** :
- Temps de réponse des API
- Temps de génération vidéo
- Utilisation du storage
- Nombre d'utilisateurs actifs

**Outils recommandés** :
- Google Analytics (optionnel)
- Supabase Analytics (intégré)
- Web Vitals (intégré Vite)

## Sécurité

### Headers de Sécurité

**Configuration recommandée** :
```typescript
// En production, ajouter ces headers
const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};
```

### HTTPS

**Configuration** :
- HTTPS automatique sur Lovable
- Certificats SSL/TLS gérés automatiquement
- Redirection HTTP → HTTPS

### Validation des Inputs

**Côté frontend** :
```typescript
// Validation des URLs Rentop
export function validateRentopUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('rentop.co.ae');
  } catch {
    return false;
  }
}

// Sanitization des inputs
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}
```

## Backup & Recovery

### Backup de Base de Données

**Automatique** :
- Backup quotidien par Supabase
- Rétention de 7 jours
- Point-in-time recovery disponible

**Manuel** :
```sql
-- Export des données utilisateur
COPY (
  SELECT * FROM public.generated_videos 
  WHERE created_at >= NOW() - INTERVAL '30 days'
) TO 'backup.csv' WITH CSV HEADER;
```

### Backup du Code

**Repository Git** :
- Code sauvegardé automatiquement
- Historique complet des versions
- Tags pour les releases

### Recovery Procedures

**En cas de problème** :
1. Vérifier les logs Supabase
2. Rollback de la migration si nécessaire
3. Restauration depuis backup
4. Test de fonctionnement

## Maintenance

### Mises à Jour Régulières

**Dépendances** :
```bash
# Vérification des mises à jour
npm outdated

# Mise à jour des dépendances
npm update

# Audit de sécurité
npm audit
```

**Calendrier recommandé** :
- Mises à jour mineures : Hebdomadaire
- Mises à jour majeures : Mensuel
- Audit sécurité : Bimensuel

### Performance Optimization

**Frontend** :
- Lazy loading des composants
- Optimisation des images
- Mise en cache appropriée

**Backend** :
- Optimisation des requêtes SQL
- Index de base de données
- Cache des Edge Functions

### Checklist de Déploiement

**Avant déploiement** :
- [ ] Tests unitaires passent
- [ ] Build de production réussi
- [ ] Variables d'environnement configurées
- [ ] Migrations de base de données appliquées
- [ ] Secrets Supabase configurés

**Après déploiement** :
- [ ] Application accessible
- [ ] Authentification fonctionne
- [ ] Génération de vidéo fonctionne
- [ ] Logs sans erreurs critiques
- [ ] Performance acceptable