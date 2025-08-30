# Authentification & Sécurité

## Vue d'ensemble

Le système d'authentification de Rentop Video Creator est basé sur Supabase Auth avec une restriction stricte d'accès par liste blanche d'emails.

## Configuration d'Authentification

### Utilisateurs Autorisés
```typescript
const ALLOWED_EMAILS = [
  'rentop.co.ae@gmail.com',
  'amine.ready@gmail.com'
];
```

### Méthodes d'Authentification
- **Email/Password uniquement**
- **Pas de social login**
- **Pas d'inscription publique**

## Implémentation Frontend

### Hook d'Authentification (`useAuth.tsx`)
```typescript
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Gestion des sessions
  // Écoute des changements d'état
  // Fonction de déconnexion
};
```

**Fonctionnalités** :
- Gestion automatique des sessions
- Écoute des changements d'état auth
- Persistence de la session
- Auto-refresh des tokens

### Composant d'Authentification (`AuthComponent.tsx`)

**Structure** :
- Tabs pour Connexion/Inscription
- Validation d'email en temps réel
- Messages d'erreur contextuels
- Interface responsive

**Validation côté client** :
```typescript
const handleSignUp = async (e: React.FormEvent) => {
  // Vérification email autorisé
  if (!allowedEmails.includes(email.toLowerCase())) {
    // Rejet immédiat
    return;
  }
  // Traitement normal...
};
```

## Sécurité Base de Données

### Row Level Security (RLS)

Toutes les tables ont RLS activé avec des policies spécifiques :

```sql
-- Exemple pour generated_videos
CREATE POLICY "Users can view their own videos" 
ON public.generated_videos 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own videos" 
ON public.generated_videos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);
```

### Trigger de Validation
```sql
CREATE OR REPLACE FUNCTION public.check_allowed_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.allowed_emails 
    WHERE email = NEW.email
  ) THEN
    RAISE EXCEPTION 'Accès refusé. Email non autorisé.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Gestion des Sessions

### Configuration Supabase Client
```typescript
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,        // Persistence locale
    persistSession: true,         // Maintien de session
    autoRefreshToken: true,       // Refresh automatique
  }
});
```

### Cycle de Vie des Sessions
1. **Login** : Création de session + tokens
2. **Persistence** : Stockage en localStorage
3. **Auto-refresh** : Renouvellement automatique des tokens
4. **Logout** : Suppression complète de la session

## Interface Utilisateur

### Menu Utilisateur (`UserMenu.tsx`)
- Affichage de l'email utilisateur
- Bouton de déconnexion
- Design cohérent avec l'app

### Redirection Automatique
```typescript
// Dans App.tsx
if (!user) {
  return <AuthComponent />;
}
return <MainApp />;
```

## Gestion des Erreurs

### Types d'Erreurs Gérées
- **Email non autorisé** : Rejet immédiat avec message clair
- **Mot de passe incorrect** : Message d'erreur standard
- **Utilisateur inexistant** : Message d'erreur générique
- **Problèmes réseau** : Retry automatique

### Messages d'Erreur
```typescript
// Erreurs spécifiques à l'app
const ERROR_MESSAGES = {
  UNAUTHORIZED_EMAIL: "Cette application est privée. Contactez l'administrateur pour obtenir l'accès.",
  INVALID_CREDENTIALS: "Email ou mot de passe incorrect.",
  NETWORK_ERROR: "Problème de connexion. Veuillez réessayer."
};
```

## Workflow d'Authentification

### Inscription Nouvelle
1. Utilisateur saisit email/password
2. Validation côté client (email autorisé)
3. Appel Supabase Auth
4. Trigger validation côté serveur
5. Envoi email de confirmation
6. Activation du compte

### Connexion
1. Utilisateur saisit credentials
2. Validation côté client (email autorisé)
3. Authentification Supabase
4. Création de session
5. Redirection vers app principale

### Déconnexion
1. Appel `supabase.auth.signOut()`
2. Suppression session locale
3. Redirection vers page de connexion

## Maintenance & Monitoring

### Ajout d'Utilisateurs Autorisés
```sql
INSERT INTO public.allowed_emails (email) 
VALUES ('nouveau@email.com');
```

### Révocation d'Accès
```sql
DELETE FROM public.allowed_emails 
WHERE email = 'ancien@email.com';
```

### Monitoring des Connexions
Utiliser les logs Supabase Auth pour surveiller :
- Tentatives de connexion
- Échecs d'authentification
- Sessions actives

## Bonnes Pratiques Sécurité

1. **Rotation des Secrets** : Renouveler régulièrement les clés API
2. **Monitoring** : Surveiller les tentatives d'accès non autorisées
3. **Logs** : Conserver les logs d'authentification
4. **Validation** : Double validation client/serveur
5. **Error Handling** : Messages d'erreur génériques pour éviter l'information leakage