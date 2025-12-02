import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface NewsPost {
  id: number;
  title: string;
  content: string;
  image_url: string;
  published_at: string;
}

interface NewsTabProps {
  newsPosts: NewsPost[];
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('ru-RU', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const NewsTab = ({ newsPosts }: NewsTabProps) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-3xl font-bold mb-6">Новости спорта</h2>
      
      <div className="grid gap-6">
        {newsPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-1 h-64 md:h-auto">
                <img 
                  src={post.image_url} 
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <CardContent className="md:col-span-2 pt-6">
                <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                  <Icon name="Calendar" size={16} />
                  <span>{formatDateTime(post.published_at)}</span>
                </div>
                
                <h3 className="text-2xl font-bold mb-4">{post.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{post.content}</p>
              </CardContent>
            </div>
          </Card>
        ))}
        
        {newsPosts.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Новости пока не добавлены
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NewsTab;
