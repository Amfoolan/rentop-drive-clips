import { Dashboard } from "@/components/Dashboard";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div 
        className="relative h-64 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/50"></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-5xl font-bold gradient-text mb-4">
              Rentop Video Creator
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Système de génération et publication automatique de vidéos TikTok pour location de voitures
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard */}
      <Dashboard />
    </div>
  );
};

export default Index;
