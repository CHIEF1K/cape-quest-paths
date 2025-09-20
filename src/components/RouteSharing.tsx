import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Share2, QrCode, Copy, Download, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RouteData {
  id: string;
  name: string;
  path: [number, number][];
  distance: number;
  duration: number;
  createdAt: string;
  visitedGems: string[];
}

interface RouteSharingProps {
  route: RouteData;
}

const RouteSharing: React.FC<RouteSharingProps> = ({ route }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateShareableLink = () => {
    const baseUrl = window.location.origin;
    const routeData = encodeURIComponent(JSON.stringify({
      path: route.path,
      name: route.name,
      distance: route.distance,
      duration: route.duration,
      visitedGems: route.visitedGems
    }));
    return `${baseUrl}?route=${routeData}`;
  };

  const generateQRCodeUrl = (text: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateShareableLink());
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "Route link has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadRoute = () => {
    const gpxData = generateGPX(route);
    const blob = new Blob([gpxData], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${route.name.replace(/\s+/g, '_')}.gpx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Route Downloaded",
      description: "GPX file has been downloaded",
    });
  };

  const generateGPX = (route: RouteData) => {
    const gpxHeader = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Cape Quest Paths">
  <metadata>
    <name>${route.name}</name>
    <desc>Recorded route from Cape Quest Paths app</desc>
    <time>${route.createdAt}</time>
  </metadata>
  <trk>
    <name>${route.name}</name>
    <trkseg>`;

    const trackPoints = route.path.map(([lat, lng]) => 
      `      <trkpt lat="${lat}" lon="${lng}"></trkpt>`
    ).join('\n');

    const gpxFooter = `
    </trkseg>
  </trk>
</gpx>`;

    return gpxHeader + '\n' + trackPoints + gpxFooter;
  };

  const shareableLink = generateShareableLink();
  const qrCodeUrl = generateQRCodeUrl(shareableLink);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share Route
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Your Route
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{route.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-2">
                <Badge variant="secondary">
                  {route.distance.toFixed(1)} km
                </Badge>
                <Badge variant="secondary">
                  {Math.round(route.duration / 60)} min
                </Badge>
                <Badge variant="secondary">
                  {route.visitedGems.length} gems
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div className="text-center">
              <img 
                src={qrCodeUrl} 
                alt="QR Code for route"
                className="mx-auto mb-2 rounded border"
              />
              <p className="text-sm text-muted-foreground">
                Scan QR code to view route
              </p>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={copyToClipboard}
                className="w-full gap-2"
                variant={copied ? "default" : "outline"}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Link
                  </>
                )}
              </Button>

              <Button 
                onClick={downloadRoute}
                className="w-full gap-2"
                variant="outline"
              >
                <Download className="h-4 w-4" />
                Download GPX
              </Button>
            </div>

            <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
              Share this link with friends so they can follow your route and discover the same hidden gems!
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RouteSharing;