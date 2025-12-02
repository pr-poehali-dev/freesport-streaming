import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface ScheduleEvent {
  id: number;
  title: string;
  event_date: string;
  event_time: string;
  sport: string;
  description?: string;
}

interface ScheduleTabProps {
  scheduleEvents: ScheduleEvent[];
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
};

const ScheduleTab = ({ scheduleEvents }: ScheduleTabProps) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-3xl font-bold mb-6">Расписание трансляций</h2>
      
      <div className="grid gap-6">
        {scheduleEvents.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3">{event.title}</h3>
                  
                  <div className="flex flex-wrap gap-4 mb-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Icon name="Calendar" size={18} />
                      <span>{formatDate(event.event_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Icon name="Clock" size={18} />
                      <span>{event.event_time}</span>
                    </div>
                  </div>
                  
                  {event.description && (
                    <p className="text-muted-foreground mb-3">{event.description}</p>
                  )}
                </div>
                
                <Badge className="ml-4">
                  <Icon name="Trophy" size={16} className="mr-1" />
                  {event.sport}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {scheduleEvents.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Расписание пока не добавлено
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ScheduleTab;
