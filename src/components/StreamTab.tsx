import { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Stream {
  id: number;
  title: string;
  url: string;
  is_live: boolean;
  sport?: string;
}

interface StreamTabProps {
  currentStream: Stream | null;
}

const StreamTab = ({ currentStream }: StreamTabProps) => {
  if (!currentStream) return null;

  const containerRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  const handleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (container.requestFullscreen) {
      container.requestFullscreen();
    } else if ((container as any).webkitRequestFullscreen) {
      (container as any).webkitRequestFullscreen();
    } else if ((container as any).mozRequestFullScreen) {
      (container as any).mozRequestFullScreen();
    } else if ((container as any).msRequestFullscreen) {
      (container as any).msRequestFullscreen();
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div 
        ref={containerRef}
        className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl"
        onContextMenu={handleContextMenu}
        style={{ userSelect: 'none', WebkitUserSelect: 'none', msUserSelect: 'none' }}
      >
        {currentStream.is_live && (
          <Badge className="absolute top-4 left-4 z-10 bg-red-600 hover:bg-red-600">
            <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
            LIVE
          </Badge>
        )}

        <Button 
          variant="secondary" 
          size="icon" 
          className="absolute top-4 right-4 z-10 bg-black/70 hover:bg-black/90 text-white border-0 md:hidden"
          onClick={handleFullscreen}
        >
          <Icon name="Maximize" size={18} />
        </Button>
        
        <iframe
          src={currentStream.url}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          sandbox="allow-same-origin allow-scripts allow-presentation allow-forms"
          referrerPolicy="no-referrer"
          title="Live Stream Player"
        ></iframe>

        <style dangerouslySetInnerHTML={{__html: `
          iframe {
            pointer-events: auto !important;
          }
          @media (max-width: 768px) {
            div:fullscreen,
            div:-webkit-full-screen,
            div:-moz-full-screen,
            div:-ms-fullscreen {
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              width: 100vw !important;
              height: 100vh !important;
              border-radius: 0 !important;
              z-index: 9999 !important;
            }
            div:fullscreen iframe,
            div:-webkit-full-screen iframe,
            div:-moz-full-screen iframe,
            div:-ms-fullscreen iframe {
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              width: 100% !important;
              height: 100% !important;
              border-radius: 0 !important;
            }
          }
        `}} />
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold">{currentStream.title}</h2>
            {currentStream.sport && (
              <Badge variant="outline" className="text-lg px-4 py-1">
                <Icon name="Trophy" size={18} className="mr-2" />
                {currentStream.sport}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Наслаждайтесь просмотром спортивных трансляций в высоком качестве
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StreamTab;