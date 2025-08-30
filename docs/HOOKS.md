# Hooks & Utilitaires

## Vue d'ensemble

L'application utilise des hooks personnalisés pour encapsuler la logique métier et des utilitaires pour les fonctions communes.

## Hooks Personnalisés

### useAuth.tsx

**Description** : Gestion complète de l'authentification utilisateur.

```typescript
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupération session initiale
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Écoute des changements d'état auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user
  };
};
```

**Retour** :
- `user` : Objet utilisateur Supabase ou null
- `loading` : État de chargement initial
- `signOut` : Fonction de déconnexion
- `isAuthenticated` : Booléen d'authentification

**Utilisation** :
```typescript
function MyComponent() {
  const { user, loading, isAuthenticated, signOut } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <LoginForm />;
  
  return (
    <div>
      <p>Bonjour {user.email}</p>
      <button onClick={signOut}>Déconnexion</button>
    </div>
  );
}
```

### useGeneratedVideos.tsx

**Description** : Gestion des vidéos générées avec React Query.

```typescript
export const useGeneratedVideos = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['generated-videos', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('generated_videos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as GeneratedVideo[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

**Fonctionnalités** :
- Récupération automatique avec RLS
- Cache intelligent avec React Query
- Tri par date de création
- Gestion d'erreurs intégrée

**Retour** (React Query) :
- `data` : Array de GeneratedVideo
- `isLoading` : Chargement initial
- `isFetching` : Récupération en cours
- `error` : Erreur éventuelle
- `refetch` : Fonction de rechargement

### use-toast.ts

**Description** : Hook pour les notifications toast (shadcn/ui).

```typescript
const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

export const useToast = () => {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({
      type: "DISMISS_TOAST",
      toastId: toastId,
    }),
  };
};
```

**Utilisation** :
```typescript
function MyComponent() {
  const { toast } = useToast();
  
  const showSuccess = () => {
    toast({
      title: "Succès",
      description: "Opération réussie !",
    });
  };
  
  const showError = () => {
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Une erreur s'est produite.",
    });
  };
  
  return (
    <div>
      <button onClick={showSuccess}>Succès</button>
      <button onClick={showError}>Erreur</button>
    </div>
  );
}
```

### use-mobile.tsx

**Description** : Détection de l'affichage mobile.

```typescript
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    const onChange = () => {
      setIsMobile(window.innerWidth < 768);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < 768);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
```

**Utilisation** :
```typescript
function ResponsiveComponent() {
  const isMobile = useIsMobile();
  
  return (
    <div className={isMobile ? "mobile-layout" : "desktop-layout"}>
      {isMobile ? <MobileNav /> : <DesktopNav />}
    </div>
  );
}
```

## Hooks Personnalisés Avancés

### useVideoGenerator (Exemple)

```typescript
interface VideoGeneratorState {
  isGenerating: boolean;
  progress: number;
  currentStep: string;
  error?: string;
}

export const useVideoGenerator = () => {
  const [state, setState] = useState<VideoGeneratorState>({
    isGenerating: false,
    progress: 0,
    currentStep: 'idle'
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateVideo = async (data: VideoData) => {
    try {
      setState({
        isGenerating: true,
        progress: 0,
        currentStep: 'scraping'
      });

      // Étape 1: Scraping
      const scrapedData = await fetchRentopData(data.url);
      setState(prev => ({ 
        ...prev, 
        progress: 25, 
        currentStep: 'processing' 
      }));

      // Étape 2: Traitement
      const processedData = await processCarData(scrapedData);
      setState(prev => ({ 
        ...prev, 
        progress: 50, 
        currentStep: 'generating' 
      }));

      // Étape 3: Génération
      const videoResult = await generateVideoFile(processedData);
      setState(prev => ({ 
        ...prev, 
        progress: 75, 
        currentStep: 'saving' 
      }));

      // Étape 4: Sauvegarde
      const savedVideo = await saveVideoToDatabase(videoResult);
      setState(prev => ({ 
        ...prev, 
        progress: 100, 
        currentStep: 'completed' 
      }));

      // Invalidation du cache React Query
      queryClient.invalidateQueries(['generated-videos']);

      toast({
        title: "Vidéo générée",
        description: "Votre vidéo a été créée avec succès !",
      });

      return savedVideo;

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error.message,
        isGenerating: false 
      }));
      
      toast({
        variant: "destructive",
        title: "Erreur de génération",
        description: error.message,
      });
      
      throw error;
    } finally {
      setTimeout(() => {
        setState({
          isGenerating: false,
          progress: 0,
          currentStep: 'idle'
        });
      }, 2000);
    }
  };

  return {
    ...state,
    generateVideo
  };
};
```

### useDebounce

```typescript
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

**Utilisation** :
```typescript
function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  const { data: results } = useQuery({
    queryKey: ['search', debouncedSearchTerm],
    queryFn: () => searchVideos(debouncedSearchTerm),
    enabled: debouncedSearchTerm.length > 2
  });
  
  return (
    <div>
      <input 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Rechercher..."
      />
      {results?.map(result => <ResultItem key={result.id} data={result} />)}
    </div>
  );
}
```

### useLocalStorage

```typescript
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
```

## Utilitaires

### lib/utils.ts

**Description** : Fonctions utilitaires communes.

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Fusion intelligente des classes CSS
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formatage des dates
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}

// Formatage des nombres
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-FR').format(num);
}

// Validation d'URL
export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Génération d'ID unique
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Délai avec Promise
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Capitalisation
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Truncate text
export function truncate(str: string, length: number): string {
  return str.length <= length ? str : str.substring(0, length) + '...';
}
```

### utils/rentopFetcher.ts

**Description** : Utilitaires pour l'API Rentop.

```typescript
interface RentopData {
  make: string;
  model: string;
  year: number;
  price: number;
  mileage?: number;
  location?: string;
  description?: string;
  images?: string[];
}

export async function fetchRentopData(url: string): Promise<RentopData> {
  // Validation de l'URL
  if (!isValidRentopUrl(url)) {
    throw new Error('URL Rentop invalide');
  }

  try {
    // Appel à l'Edge Function de scraping
    const response = await supabase.functions.invoke('scrape-rentop', {
      body: { url }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching Rentop data:', error);
    throw new Error('Impossible de récupérer les données Rentop');
  }
}

export function isValidRentopUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('rentop');
  } catch {
    return false;
  }
}

export function extractCarIdFromUrl(url: string): string | null {
  const match = url.match(/\/car\/(\d+)/);
  return match ? match[1] : null;
}
```

## Types TypeScript

### types/index.ts

```typescript
// Types d'authentification
export interface User {
  id: string;
  email: string;
  created_at: string;
}

// Types de vidéo
export interface GeneratedVideo {
  id: string;
  user_id: string;
  title: string;
  url: string;
  car_data: CarData;
  platforms: Platform[];
  stats: VideoStats;
  video_file_path?: string;
  thumbnail_url?: string;
  overlay_text?: string;
  voiceover_text?: string;
  status: VideoStatus;
  created_at: string;
  updated_at: string;
}

export interface CarData {
  make: string;
  model: string;
  year: number;
  price: number;
  mileage?: number;
  location?: string;
  description?: string;
  images?: string[];
  features?: string[];
}

export interface Platform {
  name: 'tiktok' | 'instagram' | 'youtube';
  published: boolean;
  publishedAt?: string;
  url?: string;
}

export interface VideoStats {
  views: number;
  likes: number;
  shares: number;
  comments?: number;
  lastUpdated?: string;
}

export type VideoStatus = 'generated' | 'processing' | 'published' | 'error';

// Types de formulaire
export interface VideoFormData {
  url: string;
  title: string;
  platforms: string[];
  overlayText?: string;
  voiceoverText?: string;
}

// Types d'erreur
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}
```

## Bonnes Pratiques

### 1. Gestion d'Erreurs dans les Hooks

```typescript
export const useSafeAsyncOperation = <T>(
  operation: () => Promise<T>
) => {
  const [state, setState] = useState<{
    data?: T;
    error?: Error;
    loading: boolean;
  }>({ loading: false });

  const execute = useCallback(async () => {
    setState({ loading: true });
    try {
      const data = await operation();
      setState({ data, loading: false });
      return data;
    } catch (error) {
      setState({ error: error as Error, loading: false });
      throw error;
    }
  }, [operation]);

  return { ...state, execute };
};
```

### 2. Hook avec Cleanup

```typescript
export const useEventListener = (
  eventName: string,
  handler: (event: Event) => void,
  element: EventTarget = window
) => {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventListener = (event: Event) => savedHandler.current(event);
    element.addEventListener(eventName, eventListener);
    
    return () => {
      element.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
};
```

### 3. Hook avec AbortController

```typescript
export const useAbortableEffect = (
  effect: (signal: AbortSignal) => Promise<void>,
  deps: React.DependencyList
) => {
  useEffect(() => {
    const abortController = new AbortController();
    
    effect(abortController.signal).catch(error => {
      if (error.name !== 'AbortError') {
        console.error('Effect error:', error);
      }
    });
    
    return () => {
      abortController.abort();
    };
  }, deps);
};
```