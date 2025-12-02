import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

  const [videoQuality, setVideoQuality] = useState<string>('auto');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const handleFullscreen = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    if (iframe.requestFullscreen) {
      iframe.requestFullscreen();
    } else if ((iframe as any).webkitRequestFullscreen) {
      (iframe as any).webkitRequestFullscreen();
    } else if ((iframe as any).mozRequestFullScreen) {
      (iframe as any).mozRequestFullScreen();
    } else if ((iframe as any).msRequestFullscreen) {
      (iframe as any).msRequestFullscreen();
    }
  };

  const changeQuality = (quality: string) => {
    setVideoQuality(quality);
    const iframe = iframeRef.current;
    if (!iframe) return;

    let newUrl = currentStream.url;
    
    if (newUrl.includes('youtube.com') || newUrl.includes('youtube-nocookie.com')) {
      if (quality === 'low') {
        newUrl = newUrl.replace(/vq=[^&]*/, 'vq=small');
        if (!newUrl.includes('vq=')) newUrl += '&vq=small';
      } else if (quality === 'medium') {
        newUrl = newUrl.replace(/vq=[^&]*/, 'vq=large');
        if (!newUrl.includes('vq=')) newUrl += '&vq=large';
      } else if (quality === 'high') {
        newUrl = newUrl.replace(/vq=[^&]*/, 'vq=hd720');
        if (!newUrl.includes('vq=')) newUrl += '&vq=hd720';
      }
    }
    
    iframe.src = newUrl;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div 
        className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl"
        onContextMenu={handleContextMenu}
        style={{ userSelect: 'none', WebkitUserSelect: 'none', msUserSelect: 'none' }}
      >
        {currentStream.is_live && (
          <Badge className="absolute top-4 left-4 z-30 bg-red-600 hover:bg-red-600">
            <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
            LIVE
          </Badge>
        )}

        <div className="absolute top-4 right-4 z-30 flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" className="bg-black/70 hover:bg-black/90 text-white border-0">
                <Icon name="Settings" size={16} className="mr-1" />
                {videoQuality === 'auto' ? 'Авто' : videoQuality === 'low' ? '360p' : videoQuality === 'medium' ? '480p' : '720p+'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => changeQuality('auto')}>
                <Icon name="Zap" size={16} className="mr-2" />
                Авто
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeQuality('low')}>
                <Icon name="Circle" size={16} className="mr-2" />
                360p
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeQuality('medium')}>
                <Icon name="Circle" size={16} className="mr-2" />
                480p
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeQuality('high')}>
                <Icon name="Circle" size={16} className="mr-2" />
                720p+
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="secondary" 
            size="sm" 
            className="bg-black/70 hover:bg-black/90 text-white border-0 md:hidden"
            onClick={handleFullscreen}
          >
            <Icon name="Maximize" size={16} />
          </Button>
        </div>
        
        <iframe
          ref={iframeRef}
          src={currentStream.url}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share"
          allowFullScreen
          sandbox="allow-same-origin allow-scripts allow-presentation allow-forms"
          referrerPolicy="no-referrer"
          title="Live Stream Player"
          onContextMenu={handleContextMenu}
          style={{ 
            border: 'none',
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
            userSelect: 'none',
            pointerEvents: 'auto'
          }}
        ></iframe>
        
        <div 
          className="absolute inset-0 pointer-events-none z-20"
          style={{ 
            background: 'linear-gradient(to bottom, transparent 0%, transparent 85%, rgba(0,0,0,0.2) 100%)',
            touchAction: 'manipulation'
          }}
        ></div>
        
        <div 
          className="absolute top-0 left-0 w-48 h-16 z-40 bg-black"
          style={{ pointerEvents: 'none' }}
        ></div>
        
        <style dangerouslySetInnerHTML={{__html: `
          iframe {
            -webkit-touch-callout: none !important;
            -webkit-user-select: none !important;
            user-select: none !important;
          }
          iframe * {
            -webkit-touch-callout: none !important;
            -webkit-user-select: none !important;
            user-select: none !important;
          }
          @media (max-width: 768px) {
            iframe {
              width: 100% !important;
              height: 100% !important;
            }
            iframe:fullscreen,
            iframe:-webkit-full-screen,
            iframe:-moz-full-screen,
            iframe:-ms-fullscreen {
              width: 100vw !important;
              height: 100vh !important;
              max-width: none !important;
              max-height: none !important;
              object-fit: contain !important;
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