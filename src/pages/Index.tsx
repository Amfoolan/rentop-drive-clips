import { useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { StepByStepGenerator } from "@/components/VideoGenerator/StepByStepGenerator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserMenu } from "@/components/Auth/UserMenu";
import { Wand2, BarChart3 } from "lucide-react";
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
        
        {/* User Menu */}
        <div className="absolute top-4 right-4 z-20">
          <UserMenu />
        </div>
        
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-5xl font-bold gradient-text mb-4">
              Rentop Video Creator
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Génération automatique de vidéos depuis les URLs Rentop
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="url-generator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url-generator" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              Créateur de Vidéos
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="url-generator">
            <StepByStepGenerator />
          </TabsContent>
          
          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
