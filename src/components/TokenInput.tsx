import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Key, Mountain, Waves } from 'lucide-react';
import capeTownHero from '@/assets/cape-town-hero.jpg';

interface TokenInputProps {
  onTokenSubmit: (token: string) => void;
}

const TokenInput: React.FC<TokenInputProps> = ({ onTokenSubmit }) => {
  const [token, setToken] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      onTokenSubmit(token.trim());
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: `url(${capeTownHero})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-ocean/60 via-ocean/40 to-sunset/60" />
      
      {/* Floating elements */}
      <div className="absolute top-10 left-10 text-white/20">
        <Mountain className="w-16 h-16" />
      </div>
      <div className="absolute bottom-10 right-10 text-white/20">
        <Waves className="w-20 h-20" />
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <Card className="shadow-floating border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-ocean rounded-full flex items-center justify-center shadow-ocean">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Cape Town Explorer
            </CardTitle>
            <CardDescription className="text-lg text-primary/80">
              Discover hidden gems and track your adventures in the Mother City
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="p-4 bg-gradient-sunset rounded-lg border border-sunset/20">
              <p className="text-sm text-white font-medium mb-2 flex items-center gap-2">
                <Key className="w-4 h-4" />
                Mapbox Token Required
              </p>
              <p className="text-xs text-white/90">
                Get your free token at{' '}
                <a 
                  href="https://mapbox.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:text-white font-medium"
                >
                  mapbox.com
                </a>
                {' '}and paste it below to start exploring.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                placeholder="pk.eyJ1IjoieW91cnVzZXIiLCJhIjoiY..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="text-sm bg-white/50 backdrop-blur-sm border-ocean/30 focus:border-ocean"
              />
              <Button 
                type="submit" 
                variant="ocean" 
                className="w-full text-lg py-6 shadow-ocean"
                disabled={!token.trim()}
              >
                Start Exploring Cape Town
              </Button>
            </form>

            <div className="text-center">
              <p className="text-xs text-muted-foreground bg-white/50 rounded px-3 py-1">
                Your token stays private and is only used for map rendering
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Welcome message */}
        <div className="mt-8 text-center text-white">
          <h2 className="text-xl font-semibold mb-2 drop-shadow-lg">
            Welcome to the Mother City! 🏔️
          </h2>
          <p className="text-white/90 drop-shadow">
            Track your routes • Find hidden gems • Explore offline
          </p>
        </div>
      </div>
    </div>
  );
};

export default TokenInput;