import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import StreamTab from '@/components/StreamTab';
import ScheduleTab from '@/components/ScheduleTab';
import NewsTab from '@/components/NewsTab';
import AdminPanel from '@/components/AdminPanel';

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
    
    if (newStreamUrl.includes('youtube.com/watch') || newStreamUrl.includes('youtube.com/live')) {
      const videoId = newStreamUrl.includes('live/') 
        ? newStreamUrl.split('live/')[1]?.split('?')[0]
        : newStreamUrl.split('v=')[1]?.split('&')[0];
      embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0&showinfo=0&fs=1&iv_load_policy=3&disablekb=1`;
    } else if (newStreamUrl.includes('youtu.be/')) {
      const videoId = newStreamUrl.split('youtu.be/')[1]?.split('?')[0];
      embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0&showinfo=0&fs=1&iv_load_policy=3&disablekb=1`;
    } else if (newStreamUrl.includes('twitch.tv/')) {
      const channelName = newStreamUrl.split('twitch.tv/')[1]?.split('?')[0].split('/')[0];
      embedUrl = `https://player.twitch.tv/?channel=${channelName}&parent=${window.location.hostname}&autoplay=true&muted=false`;
    } else if (newStreamUrl.includes('player.twitch.tv')) {
      if (!newStreamUrl.includes('parent=')) {
        embedUrl = `${newStreamUrl}${newStreamUrl.includes('?') ? '&' : '?'}parent=${window.location.hostname}&autoplay=true&muted=false`;
      }
    } else if (newStreamUrl.includes('vk.com/video') || newStreamUrl.includes('vk.ru/video')) {
      const videoMatch = newStreamUrl.match(/video(-?\d+_\d+)/);
      if (videoMatch) {
        embedUrl = `https://vk.com/video_ext.php?oid=${videoMatch[1].split('_')[0]}&id=${videoMatch[1].split('_')[1]}&hd=2&autoplay=1`;
      }
    } else if (newStreamUrl.includes('ok.ru/video') || newStreamUrl.includes('ok.ru/live')) {
      const videoId = newStreamUrl.split('/').pop()?.split('?')[0];
      embedUrl = `https://ok.ru/videoembed/${videoId}?autoplay=1`;
    } else if (newStreamUrl.includes('kick.com/')) {
      const channelName = newStreamUrl.split('kick.com/')[1]?.split('?')[0].split('/')[0];
      embedUrl = `https://player.kick.com/${channelName}?autoplay=true&muted=false`;
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
      toast({ title: 'Ошибка', description: 'Заполните заголовок и текст новости', variant: 'destructive' });
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
      toast({ title: 'Успешно', description: 'Новость добавлена' });
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось добавить новость', variant: 'destructive' });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center">
                <Icon name="Play" size={24} className="text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">FreeStream</h1>
                <p className="text-sm text-muted-foreground">Спорт онлайн без регистрации</p>
              </div>
            </div>
          </div>

          <nav className="hidden md:flex gap-6">
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
        {activeTab === 'stream' && <StreamTab currentStream={currentStream} />}
        {activeTab === 'schedule' && <ScheduleTab scheduleEvents={scheduleEvents} />}
        {activeTab === 'news' && <NewsTab newsPosts={newsPosts} />}
        {activeTab === 'admin' && (
          <AdminPanel
            isAuthenticated={isAuthenticated}
            passwordInput={passwordInput}
            setPasswordInput={setPasswordInput}
            handleLogin={handleLogin}
            handleLogout={handleLogout}
            newStreamUrl={newStreamUrl}
            setNewStreamUrl={setNewStreamUrl}
            newStreamTitle={newStreamTitle}
            setNewStreamTitle={setNewStreamTitle}
            newStreamSport={newStreamSport}
            setNewStreamSport={setNewStreamSport}
            updateStream={updateStream}
            newEventTitle={newEventTitle}
            setNewEventTitle={setNewEventTitle}
            newEventDate={newEventDate}
            setNewEventDate={setNewEventDate}
            newEventTime={newEventTime}
            setNewEventTime={setNewEventTime}
            newEventSport={newEventSport}
            setNewEventSport={setNewEventSport}
            newEventDesc={newEventDesc}
            setNewEventDesc={setNewEventDesc}
            addScheduleEvent={addScheduleEvent}
            scheduleEvents={scheduleEvents}
            deleteScheduleEvent={deleteScheduleEvent}
            newPostTitle={newPostTitle}
            setNewPostTitle={setNewPostTitle}
            newPostContent={newPostContent}
            setNewPostContent={setNewPostContent}
            newPostImage={newPostImage}
            setNewPostImage={setNewPostImage}
            addNewsPost={addNewsPost}
            newsPosts={newsPosts}
            deleteNewsPost={deleteNewsPost}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
