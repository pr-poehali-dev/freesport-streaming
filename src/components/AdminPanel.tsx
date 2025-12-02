import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Stream {
  id: number;
  title: string;
  url: string;
  is_live: boolean;
  sport?: string;
}

interface ScheduleEvent {
  id: number;
  title: string;
  event_date: string;
  event_time: string;
  sport: string;
  description?: string;
}

interface NewsPost {
  id: number;
  title: string;
  content: string;
  image_url: string;
  published_at: string;
}

interface AdminPanelProps {
  isAuthenticated: boolean;
  passwordInput: string;
  setPasswordInput: (value: string) => void;
  handleLogin: () => void;
  handleLogout: () => void;
  
  newStreamUrl: string;
  setNewStreamUrl: (value: string) => void;
  newStreamTitle: string;
  setNewStreamTitle: (value: string) => void;
  newStreamSport: string;
  setNewStreamSport: (value: string) => void;
  updateStream: () => void;
  
  newEventTitle: string;
  setNewEventTitle: (value: string) => void;
  newEventDate: string;
  setNewEventDate: (value: string) => void;
  newEventTime: string;
  setNewEventTime: (value: string) => void;
  newEventSport: string;
  setNewEventSport: (value: string) => void;
  newEventDesc: string;
  setNewEventDesc: (value: string) => void;
  addScheduleEvent: () => void;
  scheduleEvents: ScheduleEvent[];
  deleteScheduleEvent: (id: number) => void;
  
  newPostTitle: string;
  setNewPostTitle: (value: string) => void;
  newPostContent: string;
  setNewPostContent: (value: string) => void;
  newPostImage: string;
  setNewPostImage: (value: string) => void;
  addNewsPost: () => void;
  newsPosts: NewsPost[];
  deleteNewsPost: (id: number) => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
};

const AdminPanel = (props: AdminPanelProps) => {
  const {
    isAuthenticated,
    passwordInput,
    setPasswordInput,
    handleLogin,
    handleLogout,
    newStreamUrl,
    setNewStreamUrl,
    newStreamTitle,
    setNewStreamTitle,
    newStreamSport,
    setNewStreamSport,
    updateStream,
    newEventTitle,
    setNewEventTitle,
    newEventDate,
    setNewEventDate,
    newEventTime,
    setNewEventTime,
    newEventSport,
    setNewEventSport,
    newEventDesc,
    setNewEventDesc,
    addScheduleEvent,
    scheduleEvents,
    deleteScheduleEvent,
    newPostTitle,
    setNewPostTitle,
    newPostContent,
    setNewPostContent,
    newPostImage,
    setNewPostImage,
    addNewsPost,
    newsPosts,
    deleteNewsPost
  } = props;

  if (!isAuthenticated) {
    return (
      <div className="space-y-8 animate-fade-in">
        <h2 className="text-3xl font-bold mb-6">Вход в админ-панель</h2>
        
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="Lock" size={24} className="text-primary" />
              <h3 className="text-xl font-semibold">Введите пароль</h3>
            </div>
            <Input
              type="password"
              placeholder="Пароль администратора"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <Button onClick={handleLogin} className="w-full">
              <Icon name="LogIn" size={18} className="mr-2" />
              Войти
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Панель администратора</h2>
        <Button variant="outline" onClick={handleLogout}>
          <Icon name="LogOut" size={18} className="mr-2" />
          Выйти
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Icon name="Radio" size={20} />
            Обновить трансляцию
          </h3>
          <Input
            placeholder="Название трансляции"
            value={newStreamTitle}
            onChange={(e) => setNewStreamTitle(e.target.value)}
          />
          <Input
            placeholder="URL трансляции (YouTube, Twitch, VK Video, OK.ru, Kick)"
            value={newStreamUrl}
            onChange={(e) => setNewStreamUrl(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Поддерживаются: YouTube, Twitch, VK Video, Одноклассники, Kick
          </p>
          <Input
            placeholder="Вид спорта"
            value={newStreamSport}
            onChange={(e) => setNewStreamSport(e.target.value)}
          />
          <Button onClick={updateStream} className="w-full">
            <Icon name="Play" size={18} className="mr-2" />
            Обновить трансляцию
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Icon name="Calendar" size={20} />
              Управление расписанием
            </h3>
          </div>
          
          <div className="space-y-3">
            <Input
              placeholder="Название события"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="date"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
              />
              <Input
                type="time"
                value={newEventTime}
                onChange={(e) => setNewEventTime(e.target.value)}
              />
            </div>
            <Input
              placeholder="Вид спорта"
              value={newEventSport}
              onChange={(e) => setNewEventSport(e.target.value)}
            />
            <Textarea
              placeholder="Описание (опционально)"
              value={newEventDesc}
              onChange={(e) => setNewEventDesc(e.target.value)}
            />
            <Button onClick={addScheduleEvent} className="w-full">
              <Icon name="Plus" size={18} className="mr-2" />
              Добавить событие
            </Button>
          </div>

          {scheduleEvents.length > 0 && (
            <div className="mt-6 space-y-2">
              <h4 className="font-semibold mb-3">Текущие события:</h4>
              {scheduleEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(event.event_date)} в {event.event_time} - {event.sport}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteScheduleEvent(event.id)}
                  >
                    <Icon name="Trash2" size={18} className="text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Icon name="Newspaper" size={20} />
            Управление новостями
          </h3>
          
          <Input
            placeholder="Заголовок новости"
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
          />
          <Textarea
            placeholder="Текст новости"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            rows={4}
          />
          <Input
            placeholder="URL изображения (опционально)"
            value={newPostImage}
            onChange={(e) => setNewPostImage(e.target.value)}
          />
          <Button onClick={addNewsPost} className="w-full">
            <Icon name="Plus" size={18} className="mr-2" />
            Добавить новость
          </Button>

          {newsPosts.length > 0 && (
            <div className="mt-6 space-y-2">
              <h4 className="font-semibold mb-3">Опубликованные новости:</h4>
              {newsPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{post.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">{post.content}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteNewsPost(post.id)}
                  >
                    <Icon name="Trash2" size={18} className="text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
