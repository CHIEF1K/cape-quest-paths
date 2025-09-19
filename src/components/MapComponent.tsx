import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { hiddenGems, categoryColors, categoryIcons, type HiddenGem } from '@/data/hiddenGems';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CategoryFilter from '@/components/CategoryFilter';
import { MapPin, Play, Square, Navigation, RotateCcw, Download } from 'lucide-react';

interface MapComponentProps {
  mapboxToken: string;
}

interface TrackedPath {
  id: string;
  name: string;
  coordinates: [number, number][];
  timestamp: number;
}

const MapComponent: React.FC<MapComponentProps> = ({ mapboxToken }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentPath, setCurrentPath] = useState<[number, number][]>([]);
  const [selectedGem, setSelectedGem] = useState<HiddenGem | null>(null);
  const [savedPaths, setSavedPaths] = useState<TrackedPath[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filteredGems, setFilteredGems] = useState<HiddenGem[]>(hiddenGems);
  const watchId = useRef<number | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

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
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [18.4241, -33.9249], // Cape Town coordinates
      zoom: 11,
      pitch: 30,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add geolocate control
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    });
    map.current.addControl(geolocate, 'top-right');

    // Initialize map content
    map.current.on('load', () => {
      updateMarkersOnMap();
      loadSavedPaths();
    });

    return () => {
      markers.current.forEach(marker => marker.remove());
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Update markers on map based on filtered gems
  const updateMarkersOnMap = () => {
    if (!map.current) return;

    // Remove existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers
    filteredGems.forEach((gem) => {
      const markerElement = document.createElement('div');
      markerElement.className = 'gem-marker';
      markerElement.innerHTML = `
        <div class="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer transform hover:scale-110 transition-all duration-300 border-2 border-white" 
             style="background-color: ${categoryColors[gem.category]}">
          <span class="text-lg">${categoryIcons[gem.category]}</span>
        </div>
      `;

      markerElement.addEventListener('click', () => {
        setSelectedGem(gem);
        map.current?.flyTo({
          center: [gem.longitude, gem.latitude],
          zoom: 15,
          essential: true
        });
      });

      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([gem.longitude, gem.latitude])
        .addTo(map.current!);

      markers.current.push(marker);
    });
  };

  // Load saved paths on map
  const loadSavedPaths = () => {
    if (!map.current) return;

    savedPaths.forEach((path, index) => {
      if (path.coordinates.length > 1) {
        const sourceId = `saved-path-${index}`;
        const layerId = `saved-path-layer-${index}`;

        if (!map.current?.getSource(sourceId)) {
          map.current?.addSource(sourceId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: path.coordinates
              }
            }
          });

          map.current?.addLayer({
            id: layerId,
            type: 'line',
            source: sourceId,
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#94A3B8',
              'line-width': 3,
              'line-opacity': 0.7
            }
          });
        }
      }
    });
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
        const newCoord: [number, number] = [
          position.coords.longitude,
          position.coords.latitude
        ];

        setCurrentPath(prev => {
          const updated = [...prev, newCoord];
          updateMapPath(updated);
          return updated;
        });
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
    }
  };

  // Update path on map
  const updateMapPath = (coordinates: [number, number][]) => {
    if (!map.current || coordinates.length < 2) return;

    const sourceId = 'current-path';
    const layerId = 'current-path-layer';

    if (map.current.getSource(sourceId)) {
      (map.current.getSource(sourceId) as mapboxgl.GeoJSONSource).setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: coordinates
        }
      });
    } else {
      map.current.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: coordinates
          }
        }
      });

      map.current.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#EF4444',
          'line-width': 4,
          'line-opacity': 0.8
        }
      });
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
    if (map.current?.getSource('current-path')) {
      map.current.removeLayer('current-path-layer');
      map.current.removeSource('current-path');
    }
  };

  return (
    <div className="relative w-full h-screen">
      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Category Filter */}
      <div className="absolute top-4 left-4 z-10 w-80 max-w-[90vw]">
        <CategoryFilter 
          selectedCategories={selectedCategories}
          onCategoryToggle={handleCategoryToggle}
        />
      </div>
      
      {/* Tracking Controls */}
      <div className="absolute bottom-4 left-4 z-10 space-y-2">
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
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 w-96 max-w-[90vw]">
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
                      map.current?.flyTo({
                        center: [selectedGem.longitude, selectedGem.latitude],
                        zoom: 16,
                        essential: true
                      });
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
        <div className="absolute top-4 right-4 z-10 w-64">
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
      <div className="absolute top-20 left-4 z-10">
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

export default MapComponent;