import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Share2, 
  Calendar,
  Video,
  TrendingUp,
  MoreVertical
} from "lucide-react";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");

  const filteredVideos = mockVideoHistory.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.car.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || video.status === statusFilter;
    const matchesPlatform = platformFilter === "all" || video.platforms.includes(platformFilter);
    
    return matchesSearch && matchesStatus && matchesPlatform;
  });

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
            <Video className="h-5 w-5" />
            Historique des vidéos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par modèle de voiture..."
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

      {/* Video List */}
      <div className="space-y-4">
        {filteredVideos.map((video) => (
          <Card key={video.id} className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Thumbnail */}
                <div className="w-full lg:w-32 h-48 lg:h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-lg mb-2">{video.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant={getStatusColor(video.status)}>
                          {getStatusText(video.status)}
                        </Badge>
                        {video.platforms.map((platform) => (
                          <Badge key={platform} variant="outline">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(video.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                        <span>Voix: {video.voice}</span>
                        <span>{video.duration}s</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Stats */}
                  {video.status === "published" && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-border/50">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Eye className="h-4 w-4 text-primary" />
                          <span className="font-semibold">{getTotalViews(video).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Vues totales</p>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <TrendingUp className="h-4 w-4 text-accent" />
                          <span className="font-semibold">{getTotalLikes(video).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Likes totaux</p>
                      </div>

                      <div className="text-center sm:col-span-1 col-span-2">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Share2 className="h-4 w-4 text-primary" />
                          <span className="font-semibold">
                            {Object.values(video.shares).reduce((sum: number, shares: any) => sum + shares, 0).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">Partages</p>
                      </div>
                    </div>
                  )}

                  {video.status === "processing" && (
                    <div className="pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                        <span className="text-sm text-muted-foreground">
                          Génération et publication en cours...
                        </span>
                      </div>
                    </div>
                  )}

                  {video.status === "failed" && (
                    <div className="pt-4 border-t border-border/50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-destructive">
                          Échec de la génération ou publication
                        </span>
                        <Button variant="outline" size="sm">
                          Réessayer
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <Card className="glass-card border-0">
          <CardContent className="p-12 text-center">
            <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Aucune vidéo trouvée</h3>
            <p className="text-muted-foreground">
              Essayez de modifier vos filtres ou créez votre première vidéo.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}