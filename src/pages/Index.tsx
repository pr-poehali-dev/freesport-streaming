import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const API_URL = 'https://functions.poehali.dev/b726b831-4bec-45c4-86a0-702fb2ab6218';

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

const Index = () => {
  const [activeTab, setActiveTab] = useState<'stream' | 'schedule' | 'news' | 'admin'>('stream');
  const [currentStream, setCurrentStream] = useState<Stream | null>(null);
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([]);
  const [newsPosts, setNewsPosts] = useState<NewsPost[]>([]);
  const { toast } = useToast();

  const [newStreamUrl, setNewStreamUrl] = useState('');
  const [newStreamTitle, setNewStreamTitle] = useState('');
  const [newStreamSport, setNewStreamSport] = useState('');

  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventSport, setNewEventSport] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');

  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState('');

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  useEffect(() => {
    loadStream();
    loadSchedule();
    loadNews();
    
    const interval = setInterval(() => {
      loadStream();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadStream = async () => {
    try {
      const response = await fetch(`${API_URL}?resource=stream`);
      const data = await response.json();
      if (data.stream) {
        setCurrentStream(data.stream);
      }
    } catch (error) {
      console.error('Ошибка загрузки трансляции:', error);
    }
  };

  const loadSchedule = async () => {
    try {
      const response = await fetch(`${API_URL}?resource=schedule`);
      const data = await response.json();
      setScheduleEvents(data.events || []);
    } catch (error) {
      console.error('Ошибка загрузки расписания:', error);
    }
  };

  const loadNews = async () => {
    try {
      const response = await fetch(`${API_URL}?resource=news`);
      const data = await response.json();
      setNewsPosts(data.news || []);
    } catch (error) {
      console.error('Ошибка загрузки новостей:', error);
    }
  };

  const getAuthHeaders = () => {
    const password = localStorage.getItem('admin_password');
    return {
      'Content-Type': 'application/json',
      'X-Admin-Password': password || ''
    };
  };

  const handleLogin = () => {
    if (!passwordInput.trim()) {
      toast({ title: 'Ошибка', description: 'Введите пароль', variant: 'destructive' });
      return;
    }
    localStorage.setItem('admin_password', passwordInput);
    setIsAuthenticated(true);
    setPasswordInput('');
    toast({ title: 'Успешно', description: 'Вы вошли в админ-панель' });
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_password');
    setIsAuthenticated(false);
    toast({ title: 'Выход', description: 'Вы вышли из админ-панели' });
  };

  useEffect(() => {
    const savedPassword = localStorage.getItem('admin_password');
    if (savedPassword) {
      setIsAuthenticated(true);
    }
  }, []);

  const updateStream = async () => {
    if (!newStreamUrl.trim()) {
      toast({ title: 'Ошибка', description: 'Введите URL трансляции', variant: 'destructive' });
      return;
    }

    let embedUrl = newStreamUrl;
    
    if (newStreamUrl.includes('youtube.com/watch')) {
      const videoId = newStreamUrl.split('v=')[1]?.split('&')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&fs=1&autoplay=1&mute=1&controls=1`;
    } else if (newStreamUrl.includes('youtu.be/')) {
      const videoId = newStreamUrl.split('youtu.be/')[1]?.split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&fs=1&autoplay=1&mute=1&controls=1`;
    } else if (newStreamUrl.includes('twitch.tv/')) {
      const channelName = newStreamUrl.split('twitch.tv/')[1]?.split('?')[0].split('/')[0];
      embedUrl = `https://player.twitch.tv/?channel=${channelName}&parent=${window.location.hostname}&muted=false&autoplay=true`;
    } else if (newStreamUrl.includes('player.twitch.tv')) {
      if (!newStreamUrl.includes('parent=')) {
        embedUrl = `${newStreamUrl}${newStreamUrl.includes('?') ? '&' : '?'}parent=${window.location.hostname}&muted=false&autoplay=true`;
      }
    }

    try {
      const response = await fetch(`${API_URL}?resource=stream`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          url: embedUrl,
          title: newStreamTitle || 'Прямая трансляция',
          sport: newStreamSport || 'Биатлон',
          is_live: true
        })
      });
      
      if (response.status === 401) {
        toast({ title: 'Ошибка', description: 'Неверный пароль', variant: 'destructive' });
        handleLogout();
        return;
      }
      
      const data = await response.json();
      setCurrentStream(data.stream);
      setNewStreamUrl('');
      setNewStreamTitle('');
      setNewStreamSport('');
      toast({ title: 'Успешно', description: 'Трансляция обновлена' });
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось обновить трансляцию', variant: 'destructive' });
    }
  };

  const addScheduleEvent = async () => {
    if (!newEventTitle || !newEventDate || !newEventTime || !newEventSport) {
      toast({ title: 'Ошибка', description: 'Заполните все поля', variant: 'destructive' });
      return;
    }

    try {
      const response = await fetch(`${API_URL}?resource=schedule`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: newEventTitle,
          event_date: newEventDate,
          event_time: newEventTime,
          sport: newEventSport,
          description: newEventDesc
        })
      });
      
      if (response.status === 401) {
        toast({ title: 'Ошибка', description: 'Неверный пароль', variant: 'destructive' });
        handleLogout();
        return;
      }
      
      await loadSchedule();
      setNewEventTitle('');
      setNewEventDate('');
      setNewEventTime('');
      setNewEventSport('');
      setNewEventDesc('');
      toast({ title: 'Успешно', description: 'Событие добавлено' });
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось добавить событие', variant: 'destructive' });
    }
  };

  const deleteScheduleEvent = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}?resource=schedule&id=${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.status === 401) {
        toast({ title: 'Ошибка', description: 'Неверный пароль', variant: 'destructive' });
        handleLogout();
        return;
      }
      await loadSchedule();
      toast({ title: 'Успешно', description: 'Событие удалено' });
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось удалить событие', variant: 'destructive' });
    }
  };

  const addNewsPost = async () => {
    if (!newPostTitle || !newPostContent) {
      toast({ title: 'Ошибка', description: 'Заполните заголовок и текст', variant: 'destructive' });
      return;
    }

    try {
      const response = await fetch(`${API_URL}?resource=news`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: newPostTitle,
          content: newPostContent,
          image_url: newPostImage || 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop'
        })
      });
      
      if (response.status === 401) {
        toast({ title: 'Ошибка', description: 'Неверный пароль', variant: 'destructive' });
        handleLogout();
        return;
      }
      
      await loadNews();
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostImage('');
      toast({ title: 'Успешно', description: 'Новость опубликована' });
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось опубликовать новость', variant: 'destructive' });
    }
  };

  const deleteNewsPost = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}?resource=news&id=${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.status === 401) {
        toast({ title: 'Ошибка', description: 'Неверный пароль', variant: 'destructive' });
        handleLogout();
        return;
      }
      await loadNews();
      toast({ title: 'Успешно', description: 'Новость удалена' });
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось удалить новость', variant: 'destructive' });
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Radio" size={28} className="text-primary" />
            <h1 className="text-2xl font-bold">Freesport</h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setActiveTab('stream')}
              className={`font-medium transition-colors ${
                activeTab === 'stream' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Трансляция
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`font-medium transition-colors ${
                activeTab === 'schedule' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Расписание
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`font-medium transition-colors ${
                activeTab === 'news' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Новости
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`font-medium transition-colors ${
                activeTab === 'admin' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="Settings" size={18} className="inline mr-1" />
              Админка
            </button>
          </nav>

          <div className="md:hidden">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Icon name="Menu" size={24} />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Меню</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 mt-4">
                  <Button variant="ghost" onClick={() => setActiveTab('stream')}>Трансляция</Button>
                  <Button variant="ghost" onClick={() => setActiveTab('schedule')}>Расписание</Button>
                  <Button variant="ghost" onClick={() => setActiveTab('news')}>Новости</Button>
                  <Button variant="ghost" onClick={() => setActiveTab('admin')}>Админка</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {activeTab === 'stream' && currentStream && (
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
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-2">{currentStream.title}</h2>
                {currentStream.sport && (
                  <Badge variant="outline" className="mb-4">{currentStream.sport}</Badge>
                )}
                <p className="text-muted-foreground">
                  Прямая трансляция обновляется автоматически каждые 30 секунд
                </p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="transition-transform duration-200 hover:scale-105">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Icon name="Trophy" size={24} className="text-primary" />
                    <h3 className="font-semibold">Биатлон</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Следите за гонками, стрельбой и борьбой за медали
                  </p>
                </CardContent>
              </Card>

              <Card className="transition-transform duration-200 hover:scale-105">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Icon name="Mountain" size={24} className="text-primary" />
                    <h3 className="font-semibold">Лыжные гонки</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Спринты, марафоны и эстафеты в прямом эфире
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-3xl font-bold mb-6">Расписание трансляций</h2>
            
            {scheduleEvents.map((event) => (
              <Card key={event.id} className="transition-transform duration-200 hover:scale-105">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{event.sport}</Badge>
                      </div>
                      <h3 className="text-xl font-semibold mb-1">{event.title}</h3>
                      {event.description && (
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Icon name="Calendar" size={18} className="text-muted-foreground" />
                        <span>{formatDate(event.event_date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="Clock" size={18} className="text-muted-foreground" />
                        <span>{event.event_time.substring(0, 5)} МСК</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'news' && (
          <div className="space-y-8 animate-fade-in">
            <h2 className="text-3xl font-bold">Новости</h2>
            
            <div className="grid gap-8">
              {newsPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden transition-transform duration-200 hover:scale-105">
                  <div className="grid md:grid-cols-5 gap-6">
                    <div className="md:col-span-2">
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-64 md:h-full object-cover"
                      />
                    </div>
                    
                    <CardContent className="md:col-span-3 pt-6">
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
            </div>
          </div>
        )}

        {activeTab === 'admin' && !isAuthenticated && (
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
        )}

        {activeTab === 'admin' && isAuthenticated && (
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
                  placeholder="URL трансляции (YouTube, Twitch, .m3u8)"
                  value={newStreamUrl}
                  onChange={(e) => setNewStreamUrl(e.target.value)}
                />
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
                  <div className="grid md:grid-cols-2 gap-3">
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
                    placeholder="Описание (необязательно)"
                    value={newEventDesc}
                    onChange={(e) => setNewEventDesc(e.target.value)}
                    rows={2}
                  />
                  <Button onClick={addScheduleEvent} className="w-full">
                    <Icon name="Plus" size={18} className="mr-2" />
                    Добавить событие
                  </Button>
                </div>

                <div className="mt-6 space-y-2">
                  <h4 className="font-semibold mb-3">Текущие события:</h4>
                  {scheduleEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(event.event_date)} в {event.event_time.substring(0, 5)}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteScheduleEvent(event.id)}
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Icon name="Newspaper" size={20} />
                    Управление новостями
                  </h3>
                </div>

                <div className="space-y-3">
                  <Input
                    placeholder="Заголовок новости"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                  />
                  <Input
                    placeholder="URL изображения"
                    value={newPostImage}
                    onChange={(e) => setNewPostImage(e.target.value)}
                  />
                  <Textarea
                    placeholder="Текст новости"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows={4}
                  />
                  <Button onClick={addNewsPost} className="w-full">
                    <Icon name="Plus" size={18} className="mr-2" />
                    Опубликовать новость
                  </Button>
                </div>

                <div className="mt-6 space-y-2">
                  <h4 className="font-semibold mb-3">Опубликованные новости:</h4>
                  {newsPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{post.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateTime(post.published_at)}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteNewsPost(post.id)}
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Icon name="Radio" size={24} className="text-primary" />
              <span className="font-semibold">Freesport</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2024 Freesport. Прямые трансляции лыжных гонок и биатлона
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;