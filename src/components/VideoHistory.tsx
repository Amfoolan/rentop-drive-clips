import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Download, ExternalLink, MoreHorizontal, Play, Share2, Eye, Heart, Share, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useGeneratedVideos } from '@/hooks/useGeneratedVideos';

const mockVideoHistory = [
  {
    id: 1,
    title: "Porsche 911 GT3 RS",
    status: "published",
    platforms: ["TikTok", "Instagram"],
    createdAt: "2024-01-20T10:30:00Z",
    publishedAt: "2024-01-20T10:35:00Z",
    views: { tiktok: 125000, instagram: 45000, youtube: 0 },
    likes: { tiktok: 8900, instagram: 2100, youtube: 0 },
    shares: { tiktok: 1200, instagram: 340, youtube: 0 },
    thumbnail: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200&h=300&fit=crop",
    duration: 15,
    car: "Porsche 911 GT3 RS",
    voice: "Aria"
  },
  {
    id: 2,
    title: "BMW M4 Competition",
    status: "processing",
    platforms: ["TikTok", "Instagram", "YouTube"],
    createdAt: "2024-01-20T11:15:00Z",
    publishedAt: null,
    views: { tiktok: 0, instagram: 0, youtube: 0 },
    likes: { tiktok: 0, instagram: 0, youtube: 0 },
    shares: { tiktok: 0, instagram: 0, youtube: 0 },
    thumbnail: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=200&h=300&fit=crop",
    duration: 15,
    car: "BMW M4 Competition",
    voice: "Roger"
  },
  {
    id: 3,
    title: "Audi RS6 Avant",
    status: "published",
    platforms: ["TikTok", "Instagram"],
    createdAt: "2024-01-20T09:45:00Z",
    publishedAt: "2024-01-20T09:50:00Z",
    views: { tiktok: 89000, instagram: 32000, youtube: 0 },
    likes: { tiktok: 6200, instagram: 1800, youtube: 0 },
    shares: { tiktok: 890, instagram: 250, youtube: 0 },
    thumbnail: "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=200&h=300&fit=crop",
    duration: 15,
    car: "Audi RS6 Avant",
    voice: "Sarah"
  },
  {
    id: 4,
    title: "Lamborghini Huracán",
    status: "published",
    platforms: ["TikTok"],
    createdAt: "2024-01-19T16:20:00Z",
    publishedAt: "2024-01-19T16:25:00Z",
    views: { tiktok: 156000, instagram: 0, youtube: 0 },
    likes: { tiktok: 12400, instagram: 0, youtube: 0 },
    shares: { tiktok: 1800, instagram: 0, youtube: 0 },
    thumbnail: "https://images.unsplash.com/photo-1544829099-b9a0c5303bea?w=200&h=300&fit=crop",
    duration: 15,
    car: "Lamborghini Huracán",
    voice: "Laura"
  },
  {
    id: 5,
    title: "Mercedes-AMG GT R",
    status: "failed",
    platforms: ["TikTok", "Instagram"],
    createdAt: "2024-01-19T14:10:00Z",
    publishedAt: null,
    views: { tiktok: 0, instagram: 0, youtube: 0 },
    likes: { tiktok: 0, instagram: 0, youtube: 0 },
    shares: { tiktok: 0, instagram: 0, youtube: 0 },
    thumbnail: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=200&h=300&fit=crop",
    duration: 15,
    car: "Mercedes-AMG GT R",
    voice: "Charlie"
  }
];

export function VideoHistory() {
  const { videos, loading, downloadVideo } = useGeneratedVideos();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');

  const filteredVideos = useMemo(() => {
    return videos.filter(video => {
      const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || video.status === statusFilter;
      const matchesPlatform = platformFilter === 'all' || 
        (Array.isArray(video.platforms) && video.platforms.includes(platformFilter));
      return matchesSearch && matchesStatus && matchesPlatform;
    });
  }, [videos, searchTerm, statusFilter, platformFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "default";
      case "processing": return "secondary";
      case "failed": return "destructive";
      default: return "outline";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "published": return "Publié";
      case "processing": return "En cours";
      case "failed": return "Échec";
      case "generated": return "Généré";
      default: return status;
    }
  };

  const getTotalViews = (video: any) => {
    return Object.values(video.views).reduce((sum: number, views: any) => sum + views, 0);
  };

  const getTotalLikes = (video: any) => {
    return Object.values(video.likes).reduce((sum: number, likes: any) => sum + likes, 0);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Historique des vidéos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Eye className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="generated">Généré</SelectItem>
                <SelectItem value="published">Publié</SelectItem>
                <SelectItem value="processing">En cours</SelectItem>
                <SelectItem value="failed">Échec</SelectItem>
              </SelectContent>
            </Select>

            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Plateforme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les plateformes</SelectItem>
                <SelectItem value="TikTok">TikTok</SelectItem>
                <SelectItem value="Instagram">Instagram</SelectItem>
                <SelectItem value="YouTube">YouTube</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Chargement des vidéos...</p>
            </CardContent>
          </Card>
        ) : filteredVideos.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Aucune vidéo trouvée
            </CardContent>
          </Card>
        ) : (
          filteredVideos.map((video) => (
            <Card key={video.id} className="glass-card border-0">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <img 
                      src={video.thumbnail_url || "/placeholder.svg"} 
                      alt={video.title}
                      className="w-16 h-12 object-cover rounded border bg-muted"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{video.title}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(video.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant={getStatusColor(video.status)} className="text-xs">
                        {getStatusText(video.status)}
                      </Badge>
                      {Array.isArray(video.platforms) && video.platforms.map((platform: string) => (
                        <Badge key={platform} variant="outline" className="text-xs">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {video.status === 'published' && (
                    <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-2">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{video.stats?.views?.toLocaleString() || 0} vues</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        <span>{video.stats?.likes?.toLocaleString() || 0} likes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Share className="h-3 w-3" />
                        <span>{video.stats?.shares?.toLocaleString() || 0} partages</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t pt-2">
                    <Button variant="ghost" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => downloadVideo(video)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Voir l'URL
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}