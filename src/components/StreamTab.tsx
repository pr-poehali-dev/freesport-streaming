import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
        {currentStream.is_live && (
          <Badge className="absolute top-4 left-4 z-10 bg-red-600 hover:bg-red-600">
            <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
            LIVE
          </Badge>
        )}
        
        <iframe
          src={currentStream.url}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          sandbox="allow-same-origin allow-scripts allow-presentation allow-forms"
          referrerPolicy="no-referrer"
          title="Live Stream Player"
        ></iframe>
        
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ 
            background: 'linear-gradient(to bottom, transparent 0%, transparent 85%, rgba(0,0,0,0.3) 100%)'
          }}
        ></div>
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