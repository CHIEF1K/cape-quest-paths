import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Play, Square, RotateCcw, Navigation, Award } from 'lucide-react';
import { hiddenGems, categoryColors, categoryIcons, HiddenGem } from '@/data/hiddenGems';
import CategoryFilter from './CategoryFilter';
import SearchBar from './SearchBar';
import RouteSharing from './RouteSharing';
import InstallPrompt from './InstallPrompt';
import { usePWA } from '@/hooks/usePWA';
import { useToast } from '@/hooks/use-toast';

// Define interfaces for route data
interface RouteData {
  id: string;
  name: string;
  path: [number, number][];
  distance: number;
  duration: number;
  createdAt: string;
  visitedGems: string[];
}

// Fix Leaflet default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LeafletMap: React.FC = () => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentPath, setCurrentPath] = useState<[number, number][]>([]);
  const [selectedGem, setSelectedGem] = useState<HiddenGem | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [savedPaths, setSavedPaths] = useState<RouteData[]>([]);
  const [visitedGems, setVisitedGems] = useState<Set<string>>(new Set());
  const [showInstallPrompt, setShowInstallPrompt] = useState(true);
  const { isInstallable, isInstalled } = usePWA();
  const { toast } = useToast();

  const watchIdRef = useRef<number | null>(null);
  const currentPathLineRef = useRef<L.Polyline | null>(null);
  
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current).setView([-33.9249, 18.4241], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapRef.current);

    // Load saved data
    loadSavedPaths();
    loadVisitedGems();
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    console.log('updateMarkersOnMap effect triggered');
    updateMarkersOnMap();
  }, [selectedCategories, visitedGems]);

  const loadSavedPaths = useCallback(() => {
    const saved = localStorage.getItem('capeTownPaths');
    if (saved) {
      const paths = JSON.parse(saved);
      setSavedPaths(paths);
      
      if (mapRef.current) {
        paths.forEach((pathData: RouteData) => {
          if (pathData.path && pathData.path.length > 0) {
            const polyline = L.polyline(pathData.path, { 
              color: '#10b981', 
              weight: 3,
              opacity: 0.7
            }).addTo(mapRef.current!);
            
            polyline.bindPopup(`
              <strong>${pathData.name}</strong><br>
              Distance: ${pathData.distance.toFixed(1)} km<br>
              Duration: ${Math.round(pathData.duration / 60)} min<br>
              Gems visited: ${pathData.visitedGems.length}
            `);
          }
        });
      }
    }
  }, []);

  const loadVisitedGems = useCallback(() => {
    const visited = localStorage.getItem('visitedGems');
    if (visited) {
      setVisitedGems(new Set(JSON.parse(visited)));
    }
  }, []);

  const saveVisitedGem = (gemId: string) => {
    const newVisited = new Set(visitedGems);
    newVisited.add(gemId);
    setVisitedGems(newVisited);
    localStorage.setItem('visitedGems', JSON.stringify([...newVisited]));
    
    toast({
      title: "Gem Discovered! 💎",
      description: "You've collected a new hidden gem!",
    });
  };

  const createGemIcon = (category: keyof typeof categoryColors, isVisited: boolean = false) => {
    const color = categoryColors[category];
    const icon = categoryIcons[category];
    const opacity = isVisited ? 0.7 : 1;
    const borderColor = isVisited ? '#ffd700' : '#ffffff';
    
    return L.divIcon({
      html: `
        <div style="
          background-color: ${color}; 
          width: 30px; 
          height: 30px; 
          border-radius: 50%; 
          border: 3px solid ${borderColor}; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-size: 14px;
          opacity: ${opacity};
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ${isVisited ? 'animation: pulse 2s infinite;' : ''}
        ">
          ${icon}
        </div>
      `,
      className: '',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  };

  const updateMarkersOnMap = useCallback(() => {
    if (!mapRef.current) return;

    // Clear existing gem markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker && (layer as any).isGemMarker) {
        mapRef.current!.removeLayer(layer);
      }
    });

    // Filter gems based on selected categories
    const gemsToShow = selectedCategories.length === 0 
      ? hiddenGems 
      : hiddenGems.filter(gem => selectedCategories.includes(gem.category));

    // Add markers for filtered gems
    gemsToShow.forEach(gem => {
      console.log('Adding marker for gem:', gem.name, gem.latitude, gem.longitude);
      const isVisited = visitedGems.has(gem.id);
      const icon = createGemIcon(gem.category, isVisited);
      const marker = L.marker([gem.latitude, gem.longitude], { icon })
        .addTo(mapRef.current!);
      
      (marker as any).isGemMarker = true;
      
      marker.on('click', (e) => {
        console.log('Gem clicked:', gem.name);
        L.DomEvent.stopPropagation(e);
        setSelectedGem(gem);
        if (userLocation) {
          const distance = calculateDistance(userLocation[0], userLocation[1], gem.latitude, gem.longitude);
          if (distance < 0.1) { // Within 100 meters
            saveVisitedGem(gem.id);
          }
        }
      });
    });
  }, [selectedCategories, visitedGems, userLocation]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          
          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 15);
            
            // Add or update user location marker
            mapRef.current.eachLayer((layer) => {
              if ((layer as any).isUserMarker) {
                mapRef.current!.removeLayer(layer);
              }
            });
            
            const userMarker = L.marker([latitude, longitude], {
              icon: L.divIcon({
                html: '<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
                className: '',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              })
            }).addTo(mapRef.current);
            
            (userMarker as any).isUserMarker = true;
            userMarker.bindPopup('Your Location');
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast({
            title: "Location Error",
            description: "Unable to get your location. Please check permissions.",
            variant: "destructive",
          });
        }
      );
    }
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Not Supported",
        description: "Your device doesn't support GPS tracking.",
        variant: "destructive",
      });
      return;
    }

    setIsTracking(true);
    setCurrentPath([]);
    localStorage.setItem('trackingStartTime', Date.now().toString());

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newCoord: [number, number] = [position.coords.latitude, position.coords.longitude];
        
        setCurrentPath(prev => {
          const updated = [...prev, newCoord];
          updateMapPath(updated);
          return updated;
        });

        // Update user location
        setUserLocation(newCoord);
      },
      (error) => {
        console.error('GPS tracking error:', error);
        toast({
          title: "GPS Error",
          description: "Unable to track location. Check GPS settings.",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const stopTracking = () => {
    if (!isTracking || currentPath.length === 0) return;

    setIsTracking(false);

    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    // Calculate total distance
    let totalDistance = 0;
    for (let i = 1; i < currentPath.length; i++) {
      const prev = currentPath[i - 1];
      const curr = currentPath[i];
      totalDistance += calculateDistance(prev[0], prev[1], curr[0], curr[1]);
    }

    // Create route data
    const routeData: RouteData = {
      id: Date.now().toString(),
      name: `Route ${new Date().toLocaleDateString()}`,
      path: [...currentPath],
      distance: totalDistance,
      duration: Date.now() - parseInt(localStorage.getItem('trackingStartTime') || '0'),
      createdAt: new Date().toISOString(),
      visitedGems: [...visitedGems]
    };

    // Save to localStorage
    const existingPaths = JSON.parse(localStorage.getItem('capeTownPaths') || '[]');
    existingPaths.push(routeData);
    localStorage.setItem('capeTownPaths', JSON.stringify(existingPaths));
    setSavedPaths(existingPaths);

    // Display the path permanently on the map
    if (mapRef.current && currentPath.length > 0) {
      const polyline = L.polyline(currentPath, { 
        color: '#10b981', 
        weight: 3,
        opacity: 0.7
      }).addTo(mapRef.current);
      
      polyline.bindPopup(`
        <strong>${routeData.name}</strong><br>
        Distance: ${totalDistance.toFixed(1)} km<br>
        Duration: ${Math.round(routeData.duration / 60)} min<br>
        Gems visited: ${routeData.visitedGems.length}
      `);
    }

    toast({
      title: "Route Saved! 🎉",
      description: `${totalDistance.toFixed(1)}km route saved with ${visitedGems.size} gems discovered`,
    });
  };

  const updateMapPath = (path: [number, number][]) => {
    if (!mapRef.current || path.length < 2) return;

    if (currentPathLineRef.current) {
      currentPathLineRef.current.setLatLngs(path);
    } else {
      currentPathLineRef.current = L.polyline(path, {
        color: '#ef4444',
        weight: 4,
        opacity: 0.8
      }).addTo(mapRef.current);
      
      (currentPathLineRef.current as any).isCurrentPath = true;
    }
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handleGemSelect = (gem: HiddenGem) => {
    setSelectedGem(gem);
    if (mapRef.current) {
      mapRef.current.setView([gem.latitude, gem.longitude], 16);
    }
  };

  const getTotalStats = () => {
    const totalDistance = savedPaths.reduce((sum, path) => sum + path.distance, 0);
    const totalGems = visitedGems.size;
    const totalRoutes = savedPaths.length;
    
    return { totalDistance, totalGems, totalRoutes };
  };

  const stats = getTotalStats();

  return (
    <div className="h-screen w-full flex flex-col relative">
      {/* Header with search - Fixed z-index and positioning */}
      <div className="absolute top-4 left-4 right-4 z-[1000] space-y-3 pointer-events-none">
        <div className="flex gap-3 pointer-events-auto">
          <div className="flex-1">
            <SearchBar 
              gems={hiddenGems} 
              onGemSelect={handleGemSelect}
              userLocation={userLocation}
            />
          </div>
          <Button
            onClick={getUserLocation}
            variant="outline"
            size="icon"
            className="flex-shrink-0 bg-background/90 backdrop-blur border shadow-lg"
          >
            <Navigation className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="pointer-events-auto">
          <CategoryFilter
            selectedCategories={selectedCategories}
            onCategoryToggle={handleCategoryToggle}
          />
        </div>
      </div>
      
      {/* Map Container */}
      <div ref={mapContainerRef} className="flex-1" />

      {/* Controls Panel */}
      <div className="absolute bottom-4 left-4 z-50">
        <Card className="bg-background/80 backdrop-blur">
          <CardContent className="p-4 space-y-3">
            <div className="flex gap-2">
              <Button
                onClick={isTracking ? stopTracking : startTracking}
                variant={isTracking ? "destructive" : "default"}
                size="sm"
                className="flex-1"
              >
                {isTracking ? (
                  <>
                    <Square className="mr-2 h-4 w-4" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Track
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => setCurrentPath([])}
                variant="outline"
                size="sm"
                disabled={currentPath.length === 0}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Stats */}
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <Award className="h-3 w-3" />
                <span>{stats.totalGems}/{hiddenGems.length} gems collected</span>
              </div>
              <div className="text-muted-foreground">
                {stats.totalRoutes} routes • {stats.totalDistance.toFixed(1)}km total
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gem Details Panel */}
      {selectedGem && (
        <div className="absolute bottom-4 right-4 z-50 max-w-sm">
          <Card className="bg-background/80 backdrop-blur">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span style={{ color: categoryColors[selectedGem.category] }}>
                    {categoryIcons[selectedGem.category]}
                  </span>
                  {selectedGem.name}
                  {visitedGems.has(selectedGem.id) && (
                    <Badge variant="secondary" className="ml-2">✨ Visited</Badge>
                  )}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedGem.image && (
                <img 
                  src={selectedGem.image} 
                  alt={selectedGem.name}
                  className="w-full h-32 object-cover rounded-lg"
                />
              )}
              <p className="text-sm text-muted-foreground">
                {selectedGem.description}
              </p>
              <div className="flex items-center gap-2">
                <Badge 
                  style={{ backgroundColor: categoryColors[selectedGem.category] }}
                  className="text-white"
                >
                  {selectedGem.category}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedGem(null)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Route Sharing for Latest Route */}
      {savedPaths.length > 0 && (
        <div className="absolute top-20 right-4 z-50">
          <RouteSharing route={savedPaths[savedPaths.length - 1]} />
        </div>
      )}

      {/* Install Prompt */}
      {isInstallable && !isInstalled && showInstallPrompt && (
        <InstallPrompt onDismiss={() => setShowInstallPrompt(false)} />
      )}
    </div>
  );
};

export default LeafletMap;