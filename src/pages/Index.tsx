import React, { useState } from 'react';
import MapComponent from '@/components/MapComponent';
import TokenInput from '@/components/TokenInput';

const Index = () => {
  const [mapboxToken, setMapboxToken] = useState<string>('');

  const handleTokenSubmit = (token: string) => {
    setMapboxToken(token);
    // Store token in localStorage for convenience
    localStorage.setItem('mapbox-token', token);
  };

  // Check for stored token on component mount
  React.useEffect(() => {
    const storedToken = localStorage.getItem('mapbox-token');
    if (storedToken) {
      setMapboxToken(storedToken);
    }
  }, []);

  if (!mapboxToken) {
    return <TokenInput onTokenSubmit={handleTokenSubmit} />;
  }

  return (
    <div className="w-full h-screen overflow-hidden">
      <MapComponent mapboxToken={mapboxToken} />
    </div>
  );
};

export default Index;
