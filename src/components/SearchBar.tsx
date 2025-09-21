import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, X } from 'lucide-react';
import { HiddenGem, categoryColors, categoryIcons } from '@/data/hiddenGems';

interface SearchBarProps {
  gems: HiddenGem[];
  onGemSelect: (gem: HiddenGem) => void;
  userLocation?: [number, number];
}

const SearchBar: React.FC<SearchBarProps> = ({ gems, onGemSelect, userLocation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredGems, setFilteredGems] = useState<HiddenGem[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (searchTerm.length > 1) {
      const filtered = gems.filter(gem => 
        gem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gem.category.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Sort by distance if user location is available
      if (userLocation) {
        filtered.sort((a, b) => {
          const distanceA = calculateDistance(userLocation[0], userLocation[1], a.latitude, a.longitude);
          const distanceB = calculateDistance(userLocation[0], userLocation[1], b.latitude, b.longitude);
          return distanceA - distanceB;
        });
      }

      setFilteredGems(filtered);
      setShowResults(true);
    } else {
      setFilteredGems([]);
      setShowResults(false);
    }
  }, [searchTerm, gems, userLocation]);

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

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const handleGemSelect = (gem: HiddenGem) => {
    onGemSelect(gem);
    setSearchTerm('');
    setShowResults(false);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setShowResults(false);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Search gems by name, category, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 pr-8 bg-background/80 backdrop-blur border-border/50"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {showResults && filteredGems.length > 0 && (
        <Card className="absolute top-full mt-2 w-full max-h-80 overflow-y-auto z-50 shadow-lg">
          <div className="p-2">
            {filteredGems.map((gem) => {
              const distance = userLocation 
                ? calculateDistance(userLocation[0], userLocation[1], gem.latitude, gem.longitude)
                : null;

              return (
                <div
                  key={gem.id}
                  onClick={() => handleGemSelect(gem)}
                  className="flex items-center gap-3 p-3 hover:bg-accent rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                      style={{ backgroundColor: categoryColors[gem.category] }}
                    >
                      {categoryIcons[gem.category]}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{gem.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {gem.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {gem.category}
                      </Badge>
                      {distance && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {formatDistance(distance)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {showResults && filteredGems.length === 0 && searchTerm.length > 1 && (
        <Card className="absolute top-full mt-2 w-full z-50 shadow-lg">
          <div className="p-4 text-center text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No gems found matching "{searchTerm}"</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SearchBar;