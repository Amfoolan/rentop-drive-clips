# Composants Frontend

## Vue d'ensemble

L'application utilise une architecture basée sur des composants React modulaires avec TypeScript et Tailwind CSS.

## Structure des Composants

```
src/components/
├── Auth/                    # Authentification
│   ├── AuthComponent.tsx    # Interface de connexion/inscription
│   └── UserMenu.tsx         # Menu utilisateur connecté
├── VideoGenerator/          # Génération de vidéos
│   ├── StepByStepGenerator.tsx
│   ├── VideoDownloader.tsx
│   ├── config/
│   │   ├── SocialNetworkSettings.tsx
│   │   └── VoiceSettings.tsx
│   └── steps/
│       ├── ConfigurationStep.tsx
│       ├── FinalPreviewStep.tsx
│       ├── GenerationStep.tsx
│       ├── PreviewStep.tsx
│       └── UrlInputStep.tsx
├── ui/                      # Composants UI (shadcn)
├── ConfigurationPanel.tsx   # Panneau de configuration
├── Dashboard.tsx            # Tableau de bord principal
├── MetricsPanel.tsx         # Panneau de métriques
├── UrlVideoGenerator.tsx    # Générateur à partir d'URL
├── VideoHistory.tsx         # Historique des vidéos
└── VideoPreview.tsx         # Prévisualisation vidéo
```

## Composants d'Authentification

### AuthComponent.tsx

**Description** : Interface complète de connexion et inscription avec validation.

**Props** : Aucune (composant autonome)

**Fonctionnalités** :
- Interface avec onglets (Connexion/Inscription)
- Validation d'email en temps réel
- Restriction d'accès par liste blanche
- Gestion des erreurs contextuelles
- Design responsive avec animations

**Structure** :
```typescript
export function AuthComponent() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const handleSignIn = async (e: React.FormEvent) => { /* ... */ };
  const handleSignUp = async (e: React.FormEvent) => { /* ... */ };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      {/* Interface avec Tabs */}
    </div>
  );
}
```

**Validation d'Email** :
```typescript
const allowedEmails = ['rentop.co.ae@gmail.com', 'amine.ready@gmail.com'];

if (!allowedEmails.includes(email.toLowerCase())) {
  toast({
    variant: "destructive",
    title: "Accès refusé",
    description: "Cette application est privée. Contactez l'administrateur pour obtenir l'accès.",
  });
  return;
}
```

### UserMenu.tsx

**Description** : Menu déroulant pour l'utilisateur connecté.

**Props** : Aucune (utilise le hook useAuth)

**Fonctionnalités** :
- Affichage de l'email utilisateur
- Bouton de déconnexion
- Design cohérent avec shadcn/ui

**Structure** :
```typescript
export function UserMenu() {
  const { user, signOut } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <User className="h-4 w-4 mr-2" />
          {user?.email}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

## Composants de Génération Vidéo

### StepByStepGenerator.tsx

**Description** : Workflow de génération de vidéo étape par étape.

**Props** :
```typescript
interface StepByStepGeneratorProps {
  onVideoGenerated?: (video: GeneratedVideo) => void;
}
```

**États** :
```typescript
const [currentStep, setCurrentStep] = useState(0);
const [videoData, setVideoData] = useState<Partial<VideoData>>({});
const [isGenerating, setIsGenerating] = useState(false);
```

**Étapes** :
1. **UrlInputStep** : Saisie de l'URL Rentop
2. **ConfigurationStep** : Configuration des paramètres
3. **PreviewStep** : Prévisualisation avant génération
4. **GenerationStep** : Génération en cours
5. **FinalPreviewStep** : Résultat final

### VideoDownloader.tsx

**Description** : Composant pour télécharger les vidéos générées.

**Props** :
```typescript
interface VideoDownloaderProps {
  videoId: string;
  title: string;
  downloadUrl?: string;
}
```

**Fonctionnalités** :
- Téléchargement direct
- Gestion des erreurs
- Indicateur de progression
- Formats multiples

## Composants UI Personnalisés

### Dashboard.tsx

**Description** : Tableau de bord principal avec vue d'ensemble.

**Sections** :
- Statistiques générales
- Vidéos récentes
- Actions rapides
- Métriques de performance

**Structure** :
```typescript
export function Dashboard() {
  const { data: videos, isLoading } = useGeneratedVideos();
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tableau de Bord</h1>
        <UserMenu />
      </header>
      
      <MetricsPanel videos={videos} />
      <VideoHistory videos={videos} />
    </div>
  );
}
```

### MetricsPanel.tsx

**Description** : Panneau d'affichage des métriques et statistiques.

**Props** :
```typescript
interface MetricsPanelProps {
  videos: GeneratedVideo[];
}
```

**Métriques Affichées** :
- Nombre total de vidéos
- Vues totales
- Likes totaux
- Taux de performance

### VideoHistory.tsx

**Description** : Liste des vidéos générées avec actions.

**Props** :
```typescript
interface VideoHistoryProps {
  videos: GeneratedVideo[];
  onVideoSelect?: (video: GeneratedVideo) => void;
  onVideoDelete?: (videoId: string) => void;
}
```

**Fonctionnalités** :
- Liste paginée
- Filtres par statut/date
- Actions : voir, télécharger, supprimer
- Prévisualisation rapide

### VideoPreview.tsx

**Description** : Composant de prévisualisation vidéo avec contrôles.

**Props** :
```typescript
interface VideoPreviewProps {
  video: GeneratedVideo;
  autoPlay?: boolean;
  showControls?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
}
```

## Composants UI de Base (Shadcn)

### Composants Utilisés

**Layout** :
- `Card` : Conteneurs avec ombre
- `Separator` : Lignes de séparation
- `Sheet` : Panneaux latéraux

**Forms** :
- `Input` : Champs de saisie
- `Button` : Boutons avec variantes
- `Label` : Étiquettes de formulaire
- `Tabs` : Navigation par onglets

**Feedback** :
- `Toast` : Notifications temporaires
- `AlertDialog` : Dialogues de confirmation
- `Progress` : Barres de progression

**Navigation** :
- `DropdownMenu` : Menus déroulants
- `Pagination` : Navigation de pages

### Customisation Shadcn

**Variants personnalisées** dans `button.tsx` :
```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Variants personnalisées
        gradient: "bg-gradient-to-r from-primary to-primary-foreground text-white hover:opacity-90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

## Patterns de Composants

### 1. Composant avec Hook Personnalisé

```typescript
// Hook
export const useVideoGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const generateVideo = async (data: VideoData) => {
    // Logique de génération
  };
  
  return { isGenerating, progress, generateVideo };
};

// Composant
export function VideoGenerator() {
  const { isGenerating, progress, generateVideo } = useVideoGenerator();
  
  return (
    <div>
      {isGenerating && <Progress value={progress} />}
      {/* Interface */}
    </div>
  );
}
```

### 2. Composant avec State Management

```typescript
interface VideoState {
  videos: GeneratedVideo[];
  loading: boolean;
  error?: string;
}

export function VideoManager() {
  const [state, setState] = useState<VideoState>({
    videos: [],
    loading: true
  });
  
  const { data: videos, isLoading, error } = useGeneratedVideos();
  
  useEffect(() => {
    setState({
      videos: videos || [],
      loading: isLoading,
      error: error?.message
    });
  }, [videos, isLoading, error]);
  
  return (
    <div>
      {state.loading && <LoadingSkeleton />}
      {state.error && <ErrorAlert message={state.error} />}
      {state.videos.map(video => <VideoCard key={video.id} video={video} />)}
    </div>
  );
}
```

### 3. Composant avec Validation

```typescript
interface FormData {
  url: string;
  title: string;
  platforms: string[];
}

export function VideoForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const [formData, setFormData] = useState<FormData>({
    url: '',
    title: '',
    platforms: []
  });
  
  const [errors, setErrors] = useState<Partial<FormData>>({});
  
  const validate = (data: FormData): boolean => {
    const newErrors: Partial<FormData> = {};
    
    if (!data.url.trim()) newErrors.url = 'URL requise';
    if (!data.title.trim()) newErrors.title = 'Titre requis';
    if (data.platforms.length === 0) newErrors.platforms = 'Au moins une plateforme requise';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate(formData)) {
      onSubmit(formData);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Champs avec validation */}
    </form>
  );
}
```

## Bonnes Pratiques

### 1. Props TypeScript
```typescript
// Toujours typer les props
interface ComponentProps {
  required: string;
  optional?: number;
  callback: (data: any) => void;
}

export function Component({ required, optional = 0, callback }: ComponentProps) {
  // ...
}
```

### 2. Error Boundaries
```typescript
// Wrapper pour gérer les erreurs
export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundaryComponent
      fallback={<ErrorFallback />}
      onError={(error, errorInfo) => {
        console.error('Component error:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundaryComponent>
  );
}
```

### 3. Memoization
```typescript
// Optimisation avec React.memo
export const VideoCard = React.memo(({ video }: { video: GeneratedVideo }) => {
  return (
    <Card>
      {/* Interface */}
    </Card>
  );
});

// Hooks avec useMemo/useCallback
export function ExpensiveComponent() {
  const expensiveValue = useMemo(() => {
    return heavyComputation();
  }, [dependency]);
  
  const stableCallback = useCallback(() => {
    // Action
  }, [dependency]);
  
  return <div>{/* Interface */}</div>;
}
```

### 4. Accessibilité
```typescript
// Toujours inclure les attributs d'accessibilité
<Button 
  aria-label="Télécharger la vidéo"
  aria-describedby="download-help"
  onClick={handleDownload}
>
  <Download className="h-4 w-4" />
</Button>

<div id="download-help" className="sr-only">
  Télécharge la vidéo au format MP4
</div>
```