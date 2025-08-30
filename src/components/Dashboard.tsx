import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  Settings as SettingsIcon, 
  BarChart3, 
  Clock, 
  Video, 
  TrendingUp,
  Eye,
  Download,
  Share2
} from "lucide-react";
import { VideoPreview } from "./VideoPreview";
import { ConfigurationPanel } from "./ConfigurationPanel";
import { MetricsPanel } from "./MetricsPanel";
import { VideoHistory } from "./VideoHistory";
import { Settings } from "./Settings";

const mockStats = {
  totalVideos: 142,
  publishedToday: 8,
  averageViews: 12400,
  engagement: 4.2
};

const mockRecentVideos = [
  {
    id: 1,
    title: "Porsche 911 GT3 RS",
    status: "published",
    views: 15200,
    likes: 892,
    createdAt: "2024-01-20T10:30:00Z",
    thumbnail: "/placeholder-car-1.jpg"
  },
  {
    id: 2, 
    title: "BMW M4 Competition",
    status: "processing",
    views: 0,
    likes: 0,
    createdAt: "2024-01-20T11:15:00Z",
    thumbnail: "/placeholder-car-2.jpg"
  },
  {
    id: 3,
    title: "Audi RS6 Avant",
    status: "published", 
    views: 8900,
    likes: 456,
    createdAt: "2024-01-20T09:45:00Z",
    thumbnail: "/placeholder-car-3.jpg"
  }
];

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">
              Rentop Video Creator
            </h1>
            <p className="text-muted-foreground text-lg">
              Système de génération automatique de vidéos TikTok
            </p>
          </div>
          <Button variant="hero" size="lg" className="animate-pulse">
            <Play className="mr-2 h-5 w-5" />
            Générer une vidéo
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vidéos créées</p>
                <p className="text-3xl font-bold text-primary">{mockStats.totalVideos}</p>
              </div>
              <Video className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Publiées aujourd'hui</p>
                <p className="text-3xl font-bold text-accent">{mockStats.publishedToday}</p>
              </div>
              <Clock className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vues moyennes</p>
                <p className="text-3xl font-bold text-primary">{mockStats.averageViews.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Engagement</p>
                <p className="text-3xl font-bold text-accent">{mockStats.engagement}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 glass-card border-0">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="create">Créer</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Réglages</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Videos */}
            <Card className="lg:col-span-2 glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Vidéos récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentVideos.map((video) => (
                    <div key={video.id} className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border/50">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-9 bg-muted rounded-md flex items-center justify-center">
                          <Video className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-medium">{video.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={video.status === "published" ? "default" : "secondary"}>
                              {video.status === "published" ? "Publié" : "En cours"}
                            </Badge>
                            {video.status === "published" && (
                              <span className="text-sm text-muted-foreground">
                                {video.views.toLocaleString()} vues
                              </span>
                            )}
                          </div>
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
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  Actions rapides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="generate" className="w-full" size="lg">
                  <Play className="mr-2 h-4 w-4" />
                  Nouvelle vidéo
                </Button>
                <Button variant="outline" className="w-full">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Configuration
                </Button>
                <Button variant="outline" className="w-full">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Voir analytics
                </Button>
                
                <div className="pt-4 border-t border-border/50">
                  <h4 className="font-medium mb-2">Quotas quotidiens</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>TikTok</span>
                        <span>8/12</span>
                      </div>
                      <Progress value={66} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Instagram</span>
                        <span>5/10</span>
                      </div>
                      <Progress value={50} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>YouTube</span>
                        <span>3/8</span>
                      </div>
                      <Progress value={37.5} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="create">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ConfigurationPanel />
            <VideoPreview />
          </div>
        </TabsContent>

        <TabsContent value="history">
          <VideoHistory />
        </TabsContent>

        <TabsContent value="analytics">
          <MetricsPanel />
        </TabsContent>

        <TabsContent value="settings">
          <Settings />
        </TabsContent>
      </Tabs>
    </div>
  );
}