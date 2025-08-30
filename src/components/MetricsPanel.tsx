import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Heart, 
  Share2, 
  Users,
  Calendar,
  Target
} from "lucide-react";

const mockMetrics = {
  totalViews: 1250000,
  totalLikes: 89500,
  totalShares: 12300,
  totalFollowers: 45600,
  weeklyGrowth: 15.2,
  engagementRate: 4.8,
  platforms: {
    tiktok: {
      name: "TikTok",
      views: 850000,
      likes: 62000,
      shares: 8900,
      followers: 28000,
      growth: 18.5
    },
    instagram: {
      name: "Instagram",
      views: 320000,
      likes: 19500,
      shares: 2400,
      followers: 13200,
      growth: 12.3
    },
    youtube: {
      name: "YouTube Shorts",
      views: 80000,
      likes: 8000,
      shares: 1000,
      followers: 4400,
      growth: 8.7
    }
  },
  topVideos: [
    {
      id: 1,
      title: "Porsche 911 GT3 RS",
      views: 125000,
      likes: 8900,
      platform: "TikTok",
      date: "2024-01-18"
    },
    {
      id: 2,
      title: "BMW M4 Competition",
      views: 89000,
      likes: 6200,
      platform: "Instagram",
      date: "2024-01-17"
    },
    {
      id: 3,
      title: "Lamborghini Huracán",
      views: 156000,
      likes: 12400,
      platform: "TikTok",
      date: "2024-01-16"
    }
  ]
};

export function MetricsPanel() {
  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vues totales</p>
                <p className="text-3xl font-bold text-primary">
                  {(mockMetrics.totalViews / 1000000).toFixed(1)}M
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-accent" />
                  <span className="text-xs text-accent">+{mockMetrics.weeklyGrowth}%</span>
                </div>
              </div>
              <Eye className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Likes totaux</p>
                <p className="text-3xl font-bold text-accent">
                  {(mockMetrics.totalLikes / 1000).toFixed(0)}K
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-accent" />
                  <span className="text-xs text-accent">+12.8%</span>
                </div>
              </div>
              <Heart className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Partages</p>
                <p className="text-3xl font-bold text-primary">
                  {(mockMetrics.totalShares / 1000).toFixed(1)}K
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-accent" />
                  <span className="text-xs text-accent">+8.4%</span>
                </div>
              </div>
              <Share2 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Abonnés</p>
                <p className="text-3xl font-bold text-accent">
                  {(mockMetrics.totalFollowers / 1000).toFixed(1)}K
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-accent" />
                  <span className="text-xs text-accent">+15.2%</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Performance */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance par plateforme
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(mockMetrics.platforms).map(([key, platform]) => (
              <div key={key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{platform.name}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {platform.followers.toLocaleString()} abonnés
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-accent" />
                    <span className="text-sm text-accent">+{platform.growth}%</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Vues</p>
                    <p className="font-medium">{platform.views.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Likes</p>
                    <p className="font-medium">{platform.likes.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Partages</p>
                    <p className="font-medium">{platform.shares.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Engagement</span>
                    <span>{((platform.likes + platform.shares) / platform.views * 100).toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={(platform.likes + platform.shares) / platform.views * 100} 
                    className="h-2" 
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Performing Videos */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Vidéos les plus performantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockMetrics.topVideos.map((video, index) => (
                <div key={video.id} className="flex items-center gap-4 p-4 rounded-lg bg-card/50 border border-border/50">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-primary text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium">{video.title}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge variant="outline">{video.platform}</Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(video.date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm">
                      <Eye className="h-3 w-3" />
                      <span className="font-medium">{video.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Heart className="h-3 w-3" />
                      <span>{video.likes.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Trends */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tendances d'engagement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {mockMetrics.engagementRate}%
              </div>
              <p className="text-sm text-muted-foreground">Taux d'engagement moyen</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-accent" />
                <span className="text-xs text-accent">+0.8% ce mois</span>
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">
                3.2s
              </div>
              <p className="text-sm text-muted-foreground">Temps de visionnage moyen</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-accent" />
                <span className="text-xs text-accent">+0.4s ce mois</span>
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                78%
              </div>
              <p className="text-sm text-muted-foreground">Taux de rétention</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-accent" />
                <span className="text-xs text-accent">+5% ce mois</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}