import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { hiddenGems, categoryColors, categoryIcons, type HiddenGem } from '@/data/hiddenGems';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CategoryFilter from '@/components/CategoryFilter';
import { MapPin, Play, Square, Navigation, RotateCcw, Locate } from 'lucide-react';

interface TrackedPath {
  id: string;
  name: string;
  coordinates: [number, number][];
  timestamp: number;
}

const LeafletMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentPath, setCurrentPath] = useState<[number, number][]>([]);
  const [selectedGem, setSelectedGem] = useState<HiddenGem | null>(null);
  const [savedPaths, setSavedPaths] = useState<TrackedPath[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filteredGems, setFilteredGems] = useState<HiddenGem[]>(hiddenGems);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const watchId = useRef<number | null>(null);
  const markers = useRef<L.Marker[]>([]);
  const currentPathLine = useRef<L.Polyline | null>(null);
  const userMarker = useRef<L.Marker | null>(null);

  // Fix Leaflet default markers
  useEffect(() => {
    // Fix for default markers in Leaflet with Vite
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  // Load saved paths from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('capetown-paths');
    if (saved) {
      setSavedPaths(JSON.parse(saved));
    }
  }, []);

  // Filter gems based on selected categories
  useEffect(() => {
    if (selectedCategories.length === 0) {
      setFilteredGems(hiddenGems);
    } else {
      setFilteredGems(hiddenGems.filter(gem => selectedCategories.includes(gem.category)));
    }
  }, [selectedCategories]);

  // Update markers when filtered gems change
  useEffect(() => {
    if (map.current) {
      updateMarkersOnMap();
    }
  }, [filteredGems]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    // Create map
    map.current = L.map(mapContainer.current, {
      center: [-33.9249, 18.4241], // Cape Town coordinates
      zoom: 11,
      zoomControl: false
    });

    // Add zoom control to top right
    L.control.zoom({ position: 'topright' }).addTo(map.current);

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map.current);

    // Add scale control
    L.control.scale({ position: 'bottomright' }).addTo(map.current);

    // Initialize markers and saved paths
    updateMarkersOnMap();
    loadSavedPaths();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Create custom icon for gems
  const createGemIcon = (category: string) => {
    const color = categoryColors[category as keyof typeof categoryColors];
    const icon = categoryIcons[category as keyof typeof categoryIcons];
    
    return L.divIcon({
      html: `
        <div style="
          width: 40px; 
          height: 40px; 
          background-color: ${color}; 
          border: 3px solid white;
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-size: 18px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          cursor: pointer;
          transform: translateZ(0);
          transition: transform 0.2s ease;
        " 
        onmouseover="this.style.transform='scale(1.1)'" 
        onmouseout="this.style.transform='scale(1)'"
        >${icon}</div>
      `,
      className: 'gem-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  };

  // Update markers on map based on filtered gems
  const updateMarkersOnMap = () => {
    if (!map.current) return;

    // Remove existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers for filtered gems
    filteredGems.forEach((gem) => {
      const marker = L.marker([gem.latitude, gem.longitude], {
        icon: createGemIcon(gem.category)
      }).addTo(map.current!);

      marker.on('click', () => {
        setSelectedGem(gem);
        map.current?.setView([gem.latitude, gem.longitude], 15, { animate: true });
      });

      markers.current.push(marker);
    });
  };

  // Load saved paths on map
  const loadSavedPaths = () => {
    if (!map.current) return;

    savedPaths.forEach((path) => {
      if (path.coordinates.length > 1) {
        // Convert coordinates to Leaflet format [lat, lng]
        const leafletCoords: [number, number][] = path.coordinates.map(coord => [coord[1], coord[0]]);
        
        L.polyline(leafletCoords, {
          color: '#94A3B8',
          weight: 3,
          opacity: 0.7
        }).addTo(map.current!);
      }
    });
  };

  // Get user location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
        setUserLocation(coords);
        
        if (map.current) {
          map.current.setView(coords, 15, { animate: true });
          
          // Add or update user marker
          if (userMarker.current) {
            userMarker.current.setLatLng(coords);
          } else {
            userMarker.current = L.marker(coords, {
              icon: L.divIcon({
                html: `
                  <div style="
                    width: 20px; 
                    height: 20px; 
                    background-color: #3B82F6; 
                    border: 3px solid white;
                    border-radius: 50%; 
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                  "></div>
                `,
                className: 'user-location-marker',
                iconSize: [20, 20],
                iconAnchor: [10, 10],
              })
            }).addTo(map.current);
          }
        }
      },
      (error) => {
        console.error('Location error:', error);
        alert('Unable to get your location. Please check your GPS settings.');
      }
    );
  };

  // Start GPS tracking
  const startTracking = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsTracking(true);
    setCurrentPath([]);

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const newCoord: [number, number] = [position.coords.longitude, position.coords.latitude];
        const leafletCoord: [number, number] = [position.coords.latitude, position.coords.longitude];

        setCurrentPath(prev => {
          const updated = [...prev, newCoord];
          updateMapPath(updated);
          return updated;
        });

        // Update user location marker
        if (userMarker.current) {
          userMarker.current.setLatLng(leafletCoord);
        } else {
          userMarker.current = L.marker(leafletCoord, {
            icon: L.divIcon({
              html: `
                <div style="
                  width: 20px; 
                  height: 20px; 
                  background-color: #EF4444; 
                  border: 3px solid white;
                  border-radius: 50%; 
                  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                "></div>
              `,
              className: 'user-tracking-marker',
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })
          }).addTo(map.current!);
        }
      },
      (error) => {
        console.error('GPS tracking error:', error);
        alert('Unable to get location. Please check your GPS settings.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Stop GPS tracking
  const stopTracking = () => {
    if (watchId.current) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }

    setIsTracking(false);

    if (currentPath.length > 1) {
      const newPath: TrackedPath = {
        id: Date.now().toString(),
        name: `Cape Town Route ${new Date().toLocaleDateString()}`,
        coordinates: currentPath,
        timestamp: Date.now()
      };

      const updatedPaths = [...savedPaths, newPath];
      setSavedPaths(updatedPaths);
      localStorage.setItem('capetown-paths', JSON.stringify(updatedPaths));
      
      // Add the completed path to the map
      loadSavedPaths();
    }
  };

  // Update current path on map
  const updateMapPath = (coordinates: [number, number][]) => {
    if (!map.current || coordinates.length < 2) return;

    // Convert to Leaflet format [lat, lng]
    const leafletCoords: [number, number][] = coordinates.map(coord => [coord[1], coord[0]]);

    if (currentPathLine.current) {
      currentPathLine.current.setLatLngs(leafletCoords);
    } else {
      currentPathLine.current = L.polyline(leafletCoords, {
        color: '#EF4444',
        weight: 4,
        opacity: 0.8
      }).addTo(map.current);
    }
  };

  // Category filter handler
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Reset current path
  const resetCurrentPath = () => {
    setCurrentPath([]);
    if (currentPathLine.current) {
      currentPathLine.current.remove();
      currentPathLine.current = null;
    }
  };

  return (
    <div className="relative w-full h-screen">
      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Category Filter */}
      <div className="absolute top-4 left-4 z-[1000] w-80 max-w-[90vw]">
        <CategoryFilter 
          selectedCategories={selectedCategories}
          onCategoryToggle={handleCategoryToggle}
        />
      </div>
      
      {/* Tracking Controls */}
      <div className="absolute bottom-4 left-4 z-[1000] space-y-2">
        <Card className="shadow-floating">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Button 
                variant={isTracking ? "tracking" : "ocean"}
                size="sm"
                onClick={isTracking ? stopTracking : startTracking}
                className="min-w-[120px]"
              >
                {isTracking ? (
                  <>
                    <Square className="w-4 h-4" />
                    Stop Tracking
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start Tracking
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={getUserLocation}
                className="text-xs"
              >
                <Locate className="w-3 h-3" />
              </Button>
              {currentPath.length > 0 && (
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={resetCurrentPath}
                  className="text-xs"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              )}
            </div>
            {isTracking && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Recording path...
              </div>
            )}
            {currentPath.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Points: {currentPath.length} • Distance: ~{((currentPath.length - 1) * 0.05).toFixed(1)}km
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hidden Gem Details */}
      {selectedGem && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000] w-96 max-w-[90vw]">
          <Card className="shadow-floating border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{categoryIcons[selectedGem.category]}</span>
                    <h3 className="font-semibold text-primary">{selectedGem.name}</h3>
                    <Badge 
                      variant="secondary"
                      style={{ backgroundColor: categoryColors[selectedGem.category] + '20' }}
                    >
                      {selectedGem.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {selectedGem.description}
                  </p>
                  <Button 
                    variant="floating" 
                    size="sm"
                    onClick={() => {
                      map.current?.setView([selectedGem.latitude, selectedGem.longitude], 16, { animate: true });
                    }}
                  >
                    <Navigation className="w-4 h-4" />
                    Navigate Here
                  </Button>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedGem(null)}
                >
                  ✕
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Saved Paths Info */}
      {savedPaths.length > 0 && (
        <div className="absolute top-4 right-4 z-[1000] w-64">
          <Card className="shadow-floating">
            <CardContent className="p-4">
              <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Saved Routes ({savedPaths.length})
              </h3>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {savedPaths.slice(-3).map((path) => (
                  <div key={path.id} className="text-xs text-muted-foreground flex items-center justify-between">
                    <span>{path.name}</span>
                    <span>{path.coordinates.length} pts</span>
                  </div>
                ))}
                {savedPaths.length > 3 && (
                  <div className="text-xs text-muted-foreground/60">
                    +{savedPaths.length - 3} more routes
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gems Counter */}
      <div className="absolute top-20 left-4 z-[1000]">
        <Card className="shadow-floating">
          <CardContent className="p-3">
            <p className="text-sm font-medium text-primary">
              {filteredGems.length} / {hiddenGems.length} gems visible
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeafletMap;