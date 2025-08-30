# Guide de Maintenance

## Vue d'ensemble

Ce guide couvre les procédures de maintenance, le debugging, et la résolution des problèmes courants pour Rentop Video Creator.

## Maintenance Préventive

### Contrôles Quotidiens

**1. Vérification des Logs**
```bash
# Accès aux logs via dashboard Supabase
# → Functions → scrape-rentop → Logs
# → Auth → Users → Activity
# → Database → Logs
```

**Points à vérifier** :
- Pas d'erreurs critiques dans les Edge Functions
- Tentatives d'accès non autorisées
- Performance des requêtes de base de données
- Utilisation du storage

**2. Vérification des Métriques**
- Nombre de vidéos générées
- Temps de réponse moyen
- Taux d'erreur
- Utilisation de l'espace de stockage

### Contrôles Hebdomadaires

**1. Audit Sécurité**
```bash
npm audit
```

**2. Vérification des Backups**
- Backup automatique Supabase fonctionnel
- Test de restauration (si critique)

**3. Nettoyage des Données**
```sql
-- Suppression des vidéos en erreur anciennes (> 30 jours)
DELETE FROM public.generated_videos 
WHERE status = 'error' 
AND created_at < NOW() - INTERVAL '30 days';
```

### Contrôles Mensuels

**1. Mise à Jour des Dépendances**
```bash
npm outdated
npm update
```

**2. Analyse de Performance**
- Temps de génération moyen
- Optimisation des requêtes lentes
- Nettoyage du cache

**3. Révision des Logs de Sécurité**
- Tentatives d'accès échouées
- Patterns suspects
- Mise à jour de la liste des emails autorisés si nécessaire

## Debugging & Résolution de Problèmes

### Problèmes d'Authentification

**Symptôme** : Utilisateur ne peut pas se connecter

**Diagnostic** :
1. Vérifier les logs Auth dans Supabase
2. Confirmer que l'email est dans `allowed_emails`
3. Vérifier la configuration RLS

**Solutions** :
```sql
-- Vérifier si l'email est autorisé
SELECT * FROM public.allowed_emails WHERE email = 'user@example.com';

-- Ajouter un email autorisé
INSERT INTO public.allowed_emails (email) VALUES ('new@email.com');

-- Vérifier les policies RLS
SELECT * FROM pg_policies WHERE tablename = 'generated_videos';
```

**Code Frontend** :
```typescript
// Debug du hook useAuth
export const useAuth = () => {
  useEffect(() => {
    console.log('Auth state changed:', { user, loading });
  }, [user, loading]);
  
  // ... reste du code
};
```

### Problèmes de Génération Vidéo

**Symptôme** : Génération échoue ou reste bloquée

**Diagnostic** :
1. Vérifier les logs de l'Edge Function `scrape-rentop`
2. Tester l'URL Rentop manuellement
3. Vérifier les permissions du bucket storage

**Solutions** :
```typescript
// Debug de la génération
export const debugVideoGeneration = async (url: string) => {
  console.log('Starting debug for URL:', url);
  
  try {
    // Test de validation URL
    if (!isValidRentopUrl(url)) {
      throw new Error('Invalid Rentop URL');
    }
    
    // Test d'accès à l'Edge Function
    const response = await supabase.functions.invoke('scrape-rentop', {
      body: { url, debug: true }
    });
    
    console.log('Edge function response:', response);
    
  } catch (error) {
    console.error('Debug error:', error);
  }
};
```

**Vérification du Storage** :
```sql
-- Vérifier les policies du bucket videos
SELECT * FROM storage.policies WHERE bucket_id = 'videos';

-- Vérifier l'espace utilisé
SELECT 
  bucket_id,
  COUNT(*) as file_count,
  SUM(metadata->>'size')::bigint as total_size
FROM storage.objects 
GROUP BY bucket_id;
```

### Problèmes de Performance

**Symptôme** : Application lente, temps de chargement élevés

**Diagnostic** :
1. Vérifier les requêtes lentes dans les logs DB
2. Analyser la taille du bundle JavaScript
3. Vérifier le cache React Query

**Optimisations** :
```typescript
// Optimisation React Query
export const useGeneratedVideos = () => {
  return useQuery({
    queryKey: ['generated-videos'],
    queryFn: fetchVideos,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

// Lazy loading des composants
const VideoGenerator = lazy(() => import('./VideoGenerator/StepByStepGenerator'));
const VideoHistory = lazy(() => import('./VideoHistory'));
```

**Optimisation SQL** :
```sql
-- Créer des index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_generated_videos_user_created 
ON public.generated_videos(user_id, created_at DESC);

-- Analyser les requêtes
EXPLAIN ANALYZE 
SELECT * FROM public.generated_videos 
WHERE user_id = 'uuid' 
ORDER BY created_at DESC 
LIMIT 20;
```

### Problèmes de Storage

**Symptôme** : Vidéos ne se téléchargent pas ou erreurs d'upload

**Diagnostic** :
```sql
-- Vérifier les policies storage
SELECT * FROM storage.policies;

-- Vérifier les objets dans le bucket
SELECT name, bucket_id, metadata 
FROM storage.objects 
WHERE bucket_id = 'videos' 
ORDER BY created_at DESC 
LIMIT 10;
```

**Solutions** :
```sql
-- Recréer les policies si nécessaire
DROP POLICY IF EXISTS "Videos are publicly accessible" ON storage.objects;

CREATE POLICY "Videos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

CREATE POLICY "Users can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'videos' 
  AND auth.role() = 'authenticated'
);
```

## Procédures d'Urgence

### Application Inaccessible

**Étapes** :
1. Vérifier le statut Supabase : https://status.supabase.com
2. Vérifier les logs de l'application
3. Rollback vers la version précédente si nécessaire

```bash
# Rollback via l'interface Lovable
# 1. Aller dans l'historique des versions
# 2. Sélectionner la version stable précédente
# 3. Cliquer sur "Revert to this version"
```

### Corruption de Données

**Étapes** :
1. **NE PAS PANIQUER** - Les backups Supabase sont quotidiens
2. Identifier l'étendue de la corruption
3. Utiliser le point-in-time recovery si disponible

```sql
-- Vérifier l'intégrité des données
SELECT 
  COUNT(*) as total_videos,
  COUNT(CASE WHEN car_data IS NULL THEN 1 END) as missing_car_data,
  COUNT(CASE WHEN user_id IS NULL THEN 1 END) as missing_user_id
FROM public.generated_videos;

-- Backup avant correction
CREATE TABLE generated_videos_backup AS 
SELECT * FROM public.generated_videos;
```

### Compromission de Sécurité

**Étapes immédiates** :
1. Changer toutes les clés API Supabase
2. Révoquer les sessions utilisateurs
3. Vérifier les logs d'accès

```sql
-- Révoquer toutes les sessions
SELECT auth.sign_out_all_users();

-- Vérifier les accès récents
SELECT 
  created_at,
  email,
  raw_user_meta_data
FROM auth.users 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

**Étapes de récupération** :
1. Mettre à jour les secrets dans Supabase
2. Redéployer l'application
3. Notification aux utilisateurs autorisés

## Scripts de Maintenance

### Script de Nettoyage

```sql
-- nettoyage_mensuel.sql
-- Suppression des vidéos en erreur anciennes
DELETE FROM public.generated_videos 
WHERE status = 'error' 
AND created_at < NOW() - INTERVAL '30 days';

-- Nettoyage des fichiers orphelins dans storage
DELETE FROM storage.objects 
WHERE bucket_id = 'videos' 
AND name NOT IN (
  SELECT video_file_path 
  FROM public.generated_videos 
  WHERE video_file_path IS NOT NULL
);

-- Statistiques post-nettoyage
SELECT 
  status,
  COUNT(*) as count,
  MIN(created_at) as oldest,
  MAX(created_at) as newest
FROM public.generated_videos 
GROUP BY status;
```

### Script de Monitoring

```typescript
// monitoring.ts
export const runHealthCheck = async () => {
  const results = {
    database: false,
    storage: false,
    auth: false,
    functions: false
  };
  
  try {
    // Test database
    const { error: dbError } = await supabase
      .from('generated_videos')
      .select('count')
      .limit(1);
    results.database = !dbError;
    
    // Test storage
    const { error: storageError } = await supabase.storage
      .from('videos')
      .list();
    results.storage = !storageError;
    
    // Test auth
    const { error: authError } = await supabase.auth.getSession();
    results.auth = !authError;
    
    // Test edge function
    const { error: funcError } = await supabase.functions
      .invoke('scrape-rentop', { body: { test: true } });
    results.functions = !funcError;
    
  } catch (error) {
    console.error('Health check failed:', error);
  }
  
  return results;
};
```

## Monitoring Automatisé

### Alertes Recommandées

**1. Erreurs critiques**
- Plus de 5 erreurs en 10 minutes
- Échec d'authentification répété
- Storage plein à 90%

**2. Performance**
- Temps de réponse > 5 secondes
- Génération vidéo > 2 minutes
- Plus de 10 utilisateurs simultanés

**3. Sécurité**
- Tentatives d'accès non autorisées
- Changement de configuration
- Nouvelles inscriptions

### Dashboard de Monitoring

```typescript
// Composant de monitoring pour les admins
export function AdminDashboard() {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  
  useEffect(() => {
    const checkHealth = async () => {
      const status = await runHealthCheck();
      setHealthStatus(status);
    };
    
    checkHealth();
    const interval = setInterval(checkHealth, 5 * 60 * 1000); // 5 min
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="grid grid-cols-2 gap-4">
      {Object.entries(healthStatus || {}).map(([service, status]) => (
        <Card key={service}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                status ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="capitalize">{service}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

## Contacts & Escalade

### Niveaux de Support

**Niveau 1 - Auto-résolution** :
- Redémarrage des services
- Nettoyage du cache
- Vérification des logs

**Niveau 2 - Support Supabase** :
- Problèmes de base de données
- Performance des Edge Functions
- Problèmes de storage

**Niveau 3 - Escalade Développeur** :
- Bugs critiques dans le code
- Problèmes d'architecture
- Nouvelles fonctionnalités urgentes

### Informations de Contact

**Administrateurs Autorisés** :
- `rentop.co.ae@gmail.com`
- `amine.ready@gmail.com`

**Support Supabase** :
- Dashboard : https://supabase.com/dashboard
- Support : support@supabase.com
- Discord : https://discord.supabase.com

## Checklist de Maintenance

### Quotidienne
- [ ] Vérification des logs d'erreur
- [ ] Contrôle des métriques de base
- [ ] Vérification de l'espace storage

### Hebdomadaire
- [ ] Audit de sécurité npm
- [ ] Nettoyage des données temporaires
- [ ] Vérification des backups

### Mensuelle
- [ ] Mise à jour des dépendances
- [ ] Analyse de performance complète
- [ ] Révision des logs de sécurité
- [ ] Test de restauration backup

### Trimestrielle
- [ ] Revue de l'architecture
- [ ] Optimisation de la base de données
- [ ] Mise à jour de la documentation
- [ ] Formation/mise à jour des procédures