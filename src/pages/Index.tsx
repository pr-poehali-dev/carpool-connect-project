import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';

const HERO_IMG =
  'https://cdn.poehali.dev/projects/da7389f7-c8b9-45ab-a83f-466e935152e2/files/0be4ca56-cd0a-4f03-8197-ed54110d71b7.jpg';

const NAV = [
  { id: 'home', label: 'Главная' },
  { id: 'search', label: 'Поиск' },
  { id: 'cabinet', label: 'Кабинет' },
  { id: 'reviews', label: 'Отзывы' },
  { id: 'faq', label: 'Вопросы' },
  { id: 'contacts', label: 'Контакты' },
];

const ALL_RIDES = [
  { from: 'Москва', to: 'Санкт-Петербург', date: '30 июня, 09:00', price: '1 200 ₽', name: 'Алексей К.', rating: 4.9, seats: 3, car: 'Toyota Camry' },
  { from: 'Казань', to: 'Нижний Новгород', date: '30 июня, 14:30', price: '800 ₽', name: 'Марина С.', rating: 5.0, seats: 2, car: 'Kia Rio' },
  { from: 'Сочи', to: 'Краснодар', date: '1 июля, 08:15', price: '650 ₽', name: 'Дмитрий В.', rating: 4.8, seats: 1, car: 'Hyundai Solaris' },
  { from: 'Екатеринбург', to: 'Челябинск', date: '1 июля, 11:00', price: '700 ₽', name: 'Ольга П.', rating: 4.7, seats: 4, car: 'Skoda Octavia' },
];

const REVIEWS = [
  { name: 'Иван Г.', text: 'Доехал из Москвы в Питер за полцены и с приятной компанией. Сервис огонь!', rating: 5 },
  { name: 'Светлана М.', text: 'Как водитель окупаю бензин и нахожу классных попутчиков. Чат внутри — супер удобно.', rating: 5 },
  { name: 'Артём Л.', text: 'Рейтинги помогают выбирать проверенных людей. Уже 12 поездок, всё отлично.', rating: 4 },
];

const FAQ = [
  { q: 'Как найти поездку?', a: 'Введите город отправления, назначения и дату — система покажет всех подходящих попутчиков.' },
  { q: 'Безопасно ли это?', a: 'У каждого пользователя есть рейтинг и отзывы. Перед поездкой можно списаться во встроенном чате.' },
  { q: 'Сколько стоит сервис?', a: 'Поиск и общение бесплатны. Цену за поездку устанавливает сам водитель.' },
  { q: 'Как стать водителем?', a: 'Зарегистрируйтесь, выберите роль «Водитель» и опубликуйте первую поездку.' },
];

type Role = 'passenger' | 'driver';
type AuthScreen = 'login' | 'register';
type ChatMsg = { me: boolean; text: string; name?: string };
type Ride = { from: string; to: string; date: string; price: string; name: string; rating: number; seats: number; car: string };

function Section({ id, children, className = '' }: { id: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`scroll-mt-24 py-20 px-5 ${className}`}>
      <div className="container max-w-6xl mx-auto">{children}</div>
    </section>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon key={i} name="Star" size={14} className={i < Math.round(n) ? 'text-primary fill-primary' : 'text-muted-foreground'} />
      ))}
    </div>
  );
}

function SectionTitle({ title, sub }: { title: React.ReactNode; sub?: string }) {
  return (
    <div className="text-center mb-12">
      <h2 className="font-display font-extrabold text-4xl md:text-5xl mb-3">{title}</h2>
      {sub && <p className="text-muted-foreground text-lg">{sub}</p>}
    </div>
  );
}

const Index = () => {
  const { toast } = useToast();

  // Auth state
  const [user, setUser] = useState<{ name: string; role: Role } | null>(null);
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const [authRole, setAuthRole] = useState<Role>('passenger');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });

  // Cabinet tab
  const [cabinetTab, setCabinetTab] = useState<'overview' | 'chat' | 'publish'>('overview');

  // Driver rides
  const [myRides, setMyRides] = useState<Ride[]>([]);
  const [rideForm, setRideForm] = useState({ from: '', to: '', date: '', time: '', price: '', seats: '', car: '' });
  const [allRides, setAllRides] = useState<Ride[]>(ALL_RIDES);

  // Search
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [filtered, setFiltered] = useState(ALL_RIDES);

  // Chat
  const [chatWith, setChatWith] = useState(ALL_RIDES[0].name);
  const [chat, setChat] = useState<ChatMsg[]>([
    { me: false, name: 'Алексей К.', text: 'Привет! Еду завтра в 9 утра, место есть 👍' },
    { me: true, text: 'Отлично! А где встретиться?' },
    { me: false, name: 'Алексей К.', text: 'У метро Аэропорт, выход 2' },
  ]);
  const [msg, setMsg] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);

  // Contact form
  const [contact, setContact] = useState({ name: '', email: '', message: '' });

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [chat]);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const handleSearch = () => {
    const f = from.trim().toLowerCase();
    const t = to.trim().toLowerCase();
    const res = allRides.filter(
      (r) => (!f || r.from.toLowerCase().includes(f)) && (!t || r.to.toLowerCase().includes(t)),
    );
    setFiltered(res);
    toast({
      title: res.length ? `Найдено: ${res.length} поездки` : 'Поездки не найдены',
      description: res.length ? 'Выберите попутчика и напишите ему' : 'Попробуйте изменить маршрут',
    });
  };

  const openChat = (name: string) => {
    if (!user) {
      toast({ title: 'Нужна авторизация', description: 'Войдите или зарегистрируйтесь, чтобы написать водителю', variant: 'destructive' });
      scrollTo('cabinet');
      return;
    }
    setChatWith(name);
    setChat([{ me: false, name, text: `Здравствуйте! Это ${name}. Чем могу помочь по поездке?` }]);
    setCabinetTab('chat');
    scrollTo('cabinet');
    toast({ title: 'Чат открыт', description: `Вы начали переписку с ${name}` });
  };

  const sendMsg = () => {
    if (!msg.trim()) return;
    setChat((prev) => [...prev, { me: true, text: msg }]);
    setMsg('');
  };

  const handleLogin = () => {
    if (!authForm.email.trim() || !authForm.password.trim()) {
      toast({ title: 'Заполните все поля', variant: 'destructive' });
      return;
    }
    const name = authForm.email.split('@')[0];
    setUser({ name, role: authRole });
    setAuthForm({ name: '', email: '', password: '' });
    toast({ title: `Добро пожаловать, ${name}!`, description: `Вы вошли как ${authRole === 'driver' ? 'водитель' : 'пассажир'}` });
  };

  const handleRegister = () => {
    if (!authForm.name.trim() || !authForm.email.trim() || !authForm.password.trim()) {
      toast({ title: 'Заполните все поля', variant: 'destructive' });
      return;
    }
    if (authForm.password.length < 6) {
      toast({ title: 'Пароль слишком короткий', description: 'Минимум 6 символов', variant: 'destructive' });
      return;
    }
    setUser({ name: authForm.name, role: authRole });
    setAuthForm({ name: '', email: '', password: '' });
    toast({ title: `Регистрация прошла! 🎉`, description: `Вы зарегистрированы как ${authRole === 'driver' ? 'водитель' : 'пассажир'}` });
  };

  const handleLogout = () => {
    setUser(null);
    setCabinetTab('overview');
    toast({ title: 'Вы вышли из аккаунта' });
  };

  const publishRide = () => {
    const { from: f, to: t, date: d, time, price, seats, car } = rideForm;
    if (!f.trim() || !t.trim() || !d.trim() || !price.trim() || !seats.trim() || !car.trim()) {
      toast({ title: 'Заполните все поля', variant: 'destructive' });
      return;
    }
    const newRide: Ride = {
      from: f.trim(),
      to: t.trim(),
      date: `${d}${time ? ', ' + time : ''}`,
      price: `${price.trim()} ₽`,
      name: user!.name,
      rating: 5.0,
      seats: parseInt(seats) || 1,
      car: car.trim(),
    };
    setMyRides((prev) => [newRide, ...prev]);
    setAllRides((prev) => [newRide, ...prev]);
    setFiltered((prev) => [newRide, ...prev]);
    setRideForm({ from: '', to: '', date: '', time: '', price: '', seats: '', car: '' });
    setCabinetTab('overview');
    toast({ title: 'Поездка опубликована! 🚗', description: `${f} → ${t} — попутчики уже могут найти вас в поиске` });
  };

  const donate = (sum: string) => toast({ title: 'Спасибо за поддержку! ❤️', description: `Переходим к оплате ${sum}` });

  const submitContact = () => {
    if (!contact.name.trim() || !contact.email.trim() || !contact.message.trim()) {
      toast({ title: 'Заполните все поля', variant: 'destructive' });
      return;
    }
    toast({ title: 'Сообщение отправлено!', description: 'Поддержка ответит в ближайшее время' });
    setContact({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── HEADER ── */}
      <header className="fixed top-0 inset-x-0 z-50 glass border-b border-white/5">
        <div className="container max-w-6xl mx-auto flex items-center justify-between h-16 px-5">
          <a href="#home" className="flex items-center gap-2 font-display font-extrabold text-xl">
            <span className="grid place-items-center w-9 h-9 rounded-xl gradient-sunset text-white">
              <Icon name="Route" size={20} />
            </span>
            <span className="gradient-text">ПоПути</span>
          </a>
          <nav className="hidden md:flex items-center gap-6">
            {NAV.map((n) => (
              <a key={n.id} href={`#${n.id}`} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {n.label}
              </a>
            ))}
          </nav>
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="gradient-sunset text-white text-xs font-bold">{user.name[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              <Button onClick={handleLogout} variant="outline" size="sm" className="rounded-full border-white/10 hover:bg-white/5">
                Выйти
              </Button>
            </div>
          ) : (
            <Button onClick={() => scrollTo('cabinet')} className="gradient-sunset text-white border-0 rounded-full font-semibold hover-scale glow">
              Войти
            </Button>
          )}
        </div>
      </header>

      {/* ── HERO ── */}
      <Section id="home" className="pt-36 pb-8 relative overflow-hidden">
        {/* Декоративные блобы */}
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-blob pointer-events-none" />
        <div className="absolute top-32 right-0 w-80 h-80 rounded-full bg-secondary/10 blur-3xl animate-blob pointer-events-none" style={{ animationDelay: '5s' }} />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-accent/8 blur-3xl animate-blob pointer-events-none" style={{ animationDelay: '10s' }} />

        <div className="grid lg:grid-cols-2 gap-14 items-center relative">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-6 text-sm text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              🚀 Более 50 000 поездок в месяц
            </div>
            <h1 className="font-display font-black text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-6">
              Найди<br /><span className="gradient-text">попутчика</span><br />за минуту
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-md leading-relaxed">
              Путешествуй дешевле, делись расходами и знакомься с новыми людьми. Встроенный чат, рейтинги, проверенные водители.
            </p>
            <div className="flex flex-wrap gap-3 mb-12">
              <Button onClick={() => scrollTo('search')} size="lg" className="gradient-sunset text-white border-0 rounded-full font-semibold glow hover-scale">
                <Icon name="Search" size={18} className="mr-2" />Найти поездку
              </Button>
              <Button onClick={() => { scrollTo('cabinet'); }} size="lg" variant="outline" className="rounded-full font-semibold border-white/10 hover:bg-white/5 hover-scale">
                <Icon name="Car" size={18} className="mr-2" />Я водитель
              </Button>
            </div>
            <div className="flex gap-10">
              {[['120K+', 'участников'], ['4.9★', 'рейтинг'], ['350+', 'городов']].map(([v, l]) => (
                <div key={l}>
                  <div className="font-display font-extrabold text-2xl gradient-text">{v}</div>
                  <div className="text-sm text-muted-foreground">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative animate-fade-up" style={{ animationDelay: '0.15s' }}>
            {/* Кольцо вокруг фото */}
            <div className="absolute inset-0 rounded-3xl gradient-sunset opacity-20 blur-2xl scale-105" />
            <img src={HERO_IMG} alt="Поездка" className="relative rounded-3xl shadow-2xl w-full animate-float border border-white/5" />
            {/* Плавающая карточка */}
            <div className="absolute -bottom-5 -left-5 glass-card rounded-2xl p-4 flex items-center gap-3 shadow-2xl">
              <div className="grid place-items-center w-10 h-10 rounded-xl gradient-sunset text-white shrink-0">
                <Icon name="Shield" size={18} />
              </div>
              <div>
                <div className="font-display font-bold text-sm">Проверенные водители</div>
                <div className="text-xs text-muted-foreground">Рейтинг и отзывы</div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── SEARCH ── */}
      <Section id="search">
        <SectionTitle title={<>Поиск <span className="gradient-text">поездок</span></>} sub="Укажите маршрут и дату — подберём лучшие варианты" />

        <div className="glass-card rounded-3xl p-5 mb-10 shadow-xl">
          <div className="grid md:grid-cols-4 gap-3">
            <div className="relative">
              <Icon name="MapPin" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" />
              <Input value={from} onChange={(e) => setFrom(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="Откуда" className="pl-10 h-12 rounded-xl bg-muted/50 border-white/5" />
            </div>
            <div className="relative">
              <Icon name="Flag" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-accent" />
              <Input value={to} onChange={(e) => setTo(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="Куда" className="pl-10 h-12 rounded-xl bg-muted/50 border-white/5" />
            </div>
            <div className="relative">
              <Icon name="Calendar" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary" />
              <Input value={date} onChange={(e) => setDate(e.target.value)} placeholder="Дата" className="pl-10 h-12 rounded-xl bg-muted/50 border-white/5" />
            </div>
            <Button onClick={handleSearch} className="h-12 gradient-sunset text-white border-0 rounded-xl font-semibold hover-scale glow">
              <Icon name="Search" size={17} className="mr-2" />Искать
            </Button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center text-muted-foreground py-14">
            <Icon name="SearchX" size={44} className="mx-auto mb-4 text-primary opacity-60" />
            <p className="font-display font-semibold text-lg mb-1">Поездки не найдены</p>
            <p className="text-sm">Попробуйте другой маршрут или дату</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {filtered.map((r, i) => (
              <div key={i} className="glass-card rounded-3xl p-5 hover-scale hover:border-primary/30 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 font-display font-bold text-lg">
                    {r.from}
                    <Icon name="ArrowRight" size={17} className="text-primary" />
                    {r.to}
                  </div>
                  <span className="font-display font-extrabold text-xl gradient-text">{r.price}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="border-2 border-primary/30">
                      <AvatarFallback className="gradient-sunset text-white text-sm font-bold">{r.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-sm flex items-center gap-1.5">
                        {r.name}
                        <Icon name="Star" size={12} className="text-primary fill-primary" />
                        <span className="text-muted-foreground text-xs">{r.rating}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{r.car}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground mb-1">{r.date}</div>
                    <Badge variant="secondary" className="rounded-full bg-muted/60 text-xs">{r.seats} места</Badge>
                  </div>
                </div>
                <Button onClick={() => openChat(r.name)} className="w-full mt-4 rounded-xl gradient-sunset text-white border-0 font-semibold hover-scale">
                  Связаться <Icon name="MessageCircle" size={15} className="ml-2" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ── CABINET ── */}
      <Section id="cabinet" className="bg-muted/10">
        <SectionTitle title={<>Личный <span className="gradient-text">кабинет</span></>} sub="Управляйте поездками и общайтесь с попутчиками" />

        {!user ? (
          /* AUTH BLOCK */
          <div className="max-w-md mx-auto">
            {/* Роль */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {(['passenger', 'driver'] as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setAuthRole(r)}
                  className={`glass-card rounded-2xl p-4 text-center transition-all hover-scale ${authRole === r ? 'border-primary/60 shadow-lg shadow-primary/10' : 'hover:border-white/15'}`}
                >
                  <div className={`grid place-items-center w-10 h-10 rounded-xl mx-auto mb-2 ${authRole === r ? 'gradient-sunset text-white' : 'bg-muted text-muted-foreground'}`}>
                    <Icon name={r === 'driver' ? 'Car' : 'User'} size={20} />
                  </div>
                  <div className="font-display font-bold text-sm">{r === 'driver' ? 'Водитель' : 'Пассажир'}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{r === 'driver' ? 'Публикую поездки' : 'Ищу попутчиков'}</div>
                </button>
              ))}
            </div>

            <div className="glass-card rounded-3xl p-7">
              {/* Переключатель вход/регистрация */}
              <div className="flex rounded-2xl bg-muted/50 p-1 mb-6">
                {(['login', 'register'] as AuthScreen[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setAuthScreen(s)}
                    className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${authScreen === s ? 'gradient-sunset text-white shadow' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {s === 'login' ? 'Войти' : 'Регистрация'}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {authScreen === 'register' && (
                  <div className="relative">
                    <Icon name="User" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={authForm.name}
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                      placeholder="Ваше имя"
                      className="pl-10 h-12 rounded-xl bg-muted/40 border-white/5"
                    />
                  </div>
                )}
                <div className="relative">
                  <Icon name="Mail" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    placeholder="Email"
                    type="email"
                    className="pl-10 h-12 rounded-xl bg-muted/40 border-white/5"
                  />
                </div>
                <div className="relative">
                  <Icon name="Lock" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && (authScreen === 'login' ? handleLogin() : handleRegister())}
                    placeholder="Пароль"
                    type="password"
                    className="pl-10 h-12 rounded-xl bg-muted/40 border-white/5"
                  />
                </div>
                <Button
                  onClick={authScreen === 'login' ? handleLogin : handleRegister}
                  className="w-full h-12 gradient-sunset text-white border-0 rounded-xl font-semibold hover-scale glow mt-1"
                >
                  {authScreen === 'login' ? 'Войти' : `Создать аккаунт как ${authRole === 'driver' ? 'водитель' : 'пассажир'}`}
                </Button>
              </div>

              <p className="text-center text-xs text-muted-foreground mt-5">
                {authScreen === 'login' ? 'Нет аккаунта?' : 'Уже зарегистрированы?'}{' '}
                <button onClick={() => setAuthScreen(authScreen === 'login' ? 'register' : 'login')} className="text-primary hover:underline font-medium">
                  {authScreen === 'login' ? 'Зарегистрироваться' : 'Войти'}
                </button>
              </p>
            </div>
          </div>
        ) : (
          /* CABINET CONTENT */
          <div className="max-w-4xl mx-auto">
            {/* Профиль */}
            <div className="glass-card rounded-3xl p-5 mb-6 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14 border-2 border-primary/40">
                  <AvatarFallback className="gradient-sunset text-white text-xl font-bold">{user.name[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-display font-bold text-xl">{user.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge className={`rounded-full text-xs border-0 ${user.role === 'driver' ? 'gradient-sunset text-white' : 'bg-secondary/20 text-secondary'}`}>
                      <Icon name={user.role === 'driver' ? 'Car' : 'User'} size={11} className="mr-1" />
                      {user.role === 'driver' ? 'Водитель' : 'Пассажир'}
                    </Badge>
                    <Stars n={4.8} />
                  </div>
                </div>
              </div>
              <Button onClick={handleLogout} variant="outline" size="sm" className="rounded-full border-white/10 hover:bg-white/5">
                <Icon name="LogOut" size={14} className="mr-1.5" />Выйти
              </Button>
            </div>

            {/* Вкладки кабинета */}
            <div className="flex flex-wrap rounded-2xl bg-muted/30 p-1 mb-6 w-fit gap-0.5">
              {(user.role === 'driver'
                ? [['overview', 'Мои поездки', 'LayoutDashboard'], ['publish', 'Опубликовать', 'Plus'], ['chat', 'Чат', 'MessageCircle']] as const
                : [['overview', 'Мои поездки', 'LayoutDashboard'], ['chat', 'Чат', 'MessageCircle']] as const
              ).map(([tab, label, ic]) => (
                <button
                  key={tab}
                  onClick={() => setCabinetTab(tab as typeof cabinetTab)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${cabinetTab === tab ? 'gradient-sunset text-white shadow' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Icon name={ic} size={15} />{label}
                </button>
              ))}
            </div>

            {cabinetTab === 'overview' && (
              <div className="grid md:grid-cols-2 gap-5">
                <div className="glass-card rounded-3xl p-6">
                  <div className="font-display font-bold mb-4 flex items-center gap-2">
                    <Icon name="Route" size={17} className="text-primary" />
                    {user.role === 'passenger' ? 'Мои бронирования' : 'Мои поездки'}
                  </div>
                  {user.role === 'driver' ? (
                    myRides.length === 0 ? (
                      <div className="text-center text-muted-foreground py-6 text-sm">
                        <Icon name="Car" size={32} className="mx-auto mb-2 opacity-30" />
                        Поездок пока нет
                      </div>
                    ) : (
                      myRides.slice(0, 3).map((r, i) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                          <div className="text-sm font-medium">{r.from} → {r.to}</div>
                          <Badge className="rounded-full text-xs gradient-sunset text-white border-0">{r.date.split(',')[0]}</Badge>
                        </div>
                      ))
                    )
                  ) : (
                    ALL_RIDES.slice(0, 3).map((r, i) => (
                      <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                        <div className="text-sm font-medium">{r.from} → {r.to}</div>
                        <Badge className="rounded-full text-xs gradient-sunset text-white border-0">{r.date.split(',')[0]}</Badge>
                      </div>
                    ))
                  )}
                  {user.role === 'passenger' ? (
                    <Button onClick={() => scrollTo('search')} className="w-full mt-4 rounded-xl gradient-sunset text-white border-0 font-semibold hover-scale">
                      <Icon name="Search" size={15} className="mr-2" />Найти поездку
                    </Button>
                  ) : (
                    <Button onClick={() => setCabinetTab('publish')} className="w-full mt-4 rounded-xl gradient-sunset text-white border-0 font-semibold hover-scale glow">
                      <Icon name="Plus" size={15} className="mr-2" />Опубликовать поездку
                    </Button>
                  )}
                </div>
                <div className="glass-card rounded-3xl p-6">
                  <div className="font-display font-bold mb-4 flex items-center gap-2">
                    <Icon name="BarChart2" size={17} className="text-secondary" />Статистика
                  </div>
                  {(user.role === 'passenger'
                    ? [['MapPin', 'Поездок совершено', '8'], ['Wallet', 'Сэкономлено', '2 200 ₽'], ['Star', 'Рейтинг', '4.8']]
                    : [['MapPin', 'Поездок проведено', '34'], ['Wallet', 'Заработано', '28 400 ₽'], ['Star', 'Рейтинг', '5.0']]
                  ).map(([ic, label, val]) => (
                    <div key={label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Icon name={ic} size={14} className="text-primary" />{label}
                      </div>
                      <div className="font-display font-bold text-sm gradient-text">{val}</div>
                    </div>
                  ))}
                  <Button onClick={() => setCabinetTab('chat')} className="w-full mt-4 rounded-xl border border-white/10 bg-transparent text-foreground font-semibold hover:bg-white/5 hover-scale">
                    <Icon name="MessageCircle" size={15} className="mr-2 text-primary" />Открыть чат
                  </Button>
                </div>
              </div>
            )}

            {cabinetTab === 'publish' && (
              <div className="max-w-xl mx-auto glass-card rounded-3xl p-7">
                <div className="font-display font-bold text-xl mb-1 flex items-center gap-2">
                  <Icon name="MapPin" size={20} className="text-primary" />Новая поездка
                </div>
                <p className="text-muted-foreground text-sm mb-6">Заполните данные — попутчики увидят вас в поиске сразу после публикации</p>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <Icon name="MapPin" size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" />
                      <Input value={rideForm.from} onChange={(e) => setRideForm({ ...rideForm, from: e.target.value })} placeholder="Откуда" className="pl-9 h-12 rounded-xl bg-muted/40 border-white/5" />
                    </div>
                    <div className="relative">
                      <Icon name="Flag" size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-accent" />
                      <Input value={rideForm.to} onChange={(e) => setRideForm({ ...rideForm, to: e.target.value })} placeholder="Куда" className="pl-9 h-12 rounded-xl bg-muted/40 border-white/5" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <Icon name="Calendar" size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary" />
                      <Input value={rideForm.date} onChange={(e) => setRideForm({ ...rideForm, date: e.target.value })} placeholder="Дата (пр: 5 июля)" className="pl-9 h-12 rounded-xl bg-muted/40 border-white/5" />
                    </div>
                    <div className="relative">
                      <Icon name="Clock" size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input value={rideForm.time} onChange={(e) => setRideForm({ ...rideForm, time: e.target.value })} placeholder="Время (пр: 10:00)" className="pl-9 h-12 rounded-xl bg-muted/40 border-white/5" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <Icon name="Wallet" size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input value={rideForm.price} onChange={(e) => setRideForm({ ...rideForm, price: e.target.value })} placeholder="Цена, ₽" type="number" className="pl-9 h-12 rounded-xl bg-muted/40 border-white/5" />
                    </div>
                    <div className="relative">
                      <Icon name="Users" size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input value={rideForm.seats} onChange={(e) => setRideForm({ ...rideForm, seats: e.target.value })} placeholder="Свободных мест" type="number" min="1" max="8" className="pl-9 h-12 rounded-xl bg-muted/40 border-white/5" />
                    </div>
                  </div>
                  <div className="relative">
                    <Icon name="Car" size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input value={rideForm.car} onChange={(e) => setRideForm({ ...rideForm, car: e.target.value })} placeholder="Марка и модель авто (пр: Toyota Camry)" className="pl-9 h-12 rounded-xl bg-muted/40 border-white/5" />
                  </div>
                  <Button onClick={publishRide} className="w-full h-12 gradient-sunset text-white border-0 rounded-xl font-semibold hover-scale glow mt-1">
                    <Icon name="Send" size={16} className="mr-2" />Опубликовать поездку
                  </Button>
                </div>

                {myRides.length > 0 && (
                  <div className="mt-8">
                    <div className="font-display font-bold text-sm mb-3 text-muted-foreground uppercase tracking-wider">Мои опубликованные поездки</div>
                    <div className="space-y-2">
                      {myRides.map((r, i) => (
                        <div key={i} className="flex items-center justify-between py-3 px-4 rounded-2xl bg-muted/30 border border-white/5">
                          <div className="flex items-center gap-2 font-semibold text-sm">
                            {r.from} <Icon name="ArrowRight" size={13} className="text-primary" /> {r.to}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{r.date}</span>
                            <Badge className="gradient-sunset text-white border-0 rounded-full text-xs">{r.price}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {cabinetTab === 'chat' && (
              <div className="grid md:grid-cols-3 gap-5">
                {/* Список диалогов */}
                <div className="glass-card rounded-3xl p-4 space-y-1">
                  <div className="font-display font-bold text-sm mb-3 px-2">Диалоги</div>
                  {ALL_RIDES.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => { setChatWith(r.name); setChat([{ me: false, name: r.name, text: `Привет! Это ${r.name}. Маршрут: ${r.from} → ${r.to}` }]); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all text-left hover:bg-white/5 ${chatWith === r.name ? 'bg-primary/10 border border-primary/20' : ''}`}
                    >
                      <Avatar className="w-9 h-9 shrink-0">
                        <AvatarFallback className="gradient-sunset text-white text-xs font-bold">{r.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm truncate">{r.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{r.from} → {r.to}</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Окно чата */}
                <div className="md:col-span-2 glass-card rounded-3xl overflow-hidden flex flex-col">
                  {/* Header чата */}
                  <div className="gradient-sunset px-5 py-3.5 flex items-center gap-3">
                    <Avatar className="w-9 h-9 border-2 border-white/30">
                      <AvatarFallback className="bg-white/20 text-white font-bold">{chatWith[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-white text-sm">{chatWith}</div>
                      <div className="text-xs text-white/75 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-300" />в сети
                      </div>
                    </div>
                  </div>
                  {/* Сообщения */}
                  <div ref={chatRef} className="flex-1 p-4 space-y-3 h-64 overflow-y-auto">
                    {chat.map((m, i) => (
                      <div key={i} className={`flex ${m.me ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${m.me ? 'gradient-sunset text-white rounded-br-sm' : 'glass-card rounded-bl-sm'}`}>
                          {m.text}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Ввод */}
                  <div className="p-3 flex gap-2 border-t border-white/5">
                    <Input
                      value={msg}
                      onChange={(e) => setMsg(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMsg()}
                      placeholder="Напишите сообщение..."
                      className="rounded-full h-11 bg-muted/40 border-white/5"
                    />
                    <Button onClick={sendMsg} size="icon" className="rounded-full h-11 w-11 gradient-sunset text-white border-0 shrink-0 hover-scale glow">
                      <Icon name="Send" size={17} />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Section>

      {/* ── DONATE ── */}
      <Section id="donate">
        <div className="relative rounded-3xl overflow-hidden p-10 md:p-16 text-center gradient-sunset">
          <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 20% 50%, white 0%, transparent 60%)' }} />
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4 animate-spin-slow" />
          <div className="relative">
            <Icon name="Heart" size={52} className="mx-auto mb-5 fill-white text-white" />
            <h2 className="font-display font-black text-4xl md:text-5xl mb-4 text-white">Поддержите проект</h2>
            <p className="max-w-xl mx-auto mb-8 text-white/85 text-lg">
              ПоПути работает без рекламы. Ваш донат помогает развивать сервис и держать поиск попутчиков бесплатным.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-7">
              {['100 ₽', '300 ₽', '500 ₽', '1 000 ₽'].map((s) => (
                <Button key={s} onClick={() => donate(s)} variant="secondary" className="rounded-full font-bold bg-white/15 text-white hover:bg-white/25 border-white/20 hover-scale px-6">
                  {s}
                </Button>
              ))}
            </div>
            <Button onClick={() => donate('любую сумму')} size="lg" className="rounded-full bg-white text-primary hover:bg-white/90 font-bold px-10 hover-scale border-0">
              <Icon name="Heart" size={18} className="mr-2 fill-primary" />Поддержать проект
            </Button>
          </div>
        </div>
      </Section>

      {/* ── REVIEWS ── */}
      <Section id="reviews" className="bg-muted/10">
        <SectionTitle title={<>Рейтинги и <span className="gradient-text">отзывы</span></>} sub="Что говорят наши попутчики" />
        <div className="grid md:grid-cols-3 gap-5">
          {REVIEWS.map((r, i) => (
            <div key={i} className="glass-card rounded-3xl p-6 hover-scale hover:border-primary/20 transition-all">
              <Stars n={r.rating} />
              <p className="my-4 text-muted-foreground leading-relaxed">«{r.text}»</p>
              <div className="flex items-center gap-3">
                <Avatar><AvatarFallback className="gradient-sunset text-white text-sm font-bold">{r.name[0]}</AvatarFallback></Avatar>
                <div className="font-semibold text-sm">{r.name}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── FAQ ── */}
      <Section id="faq">
        <SectionTitle title={<>Частые <span className="gradient-text">вопросы</span></>} sub="Всё что нужно знать о ПоПути" />
        <Accordion type="single" collapsible className="max-w-2xl mx-auto space-y-3">
          {FAQ.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="glass-card rounded-2xl px-6 border-0">
              <AccordionTrigger className="font-display font-semibold text-left hover:no-underline py-5">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>

      {/* ── CONTACTS ── */}
      <Section id="contacts" className="bg-muted/10">
        <SectionTitle title={<>Контакты и <span className="gradient-text">поддержка</span></>} sub="Мы на связи 24/7" />
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div>
            <p className="text-muted-foreground mb-8 leading-relaxed">Напишите нам, и команда поддержки поможет с любым вопросом по поездке, аккаунту или платежу.</p>
            <div className="space-y-4">
              {[['Mail', 'help@poputi.ru', 'Написать на почту'], ['Phone', '8 800 555-35-35', 'Звонок бесплатный'], ['MapPin', 'Москва, ул. Дорожная, 1', 'Главный офис']].map(([ic, t, sub]) => (
                <div key={t} className="flex items-center gap-4">
                  <span className="grid place-items-center w-11 h-11 rounded-xl gradient-sunset text-white shrink-0">
                    <Icon name={ic} size={18} />
                  </span>
                  <div>
                    <div className="font-semibold text-sm">{t}</div>
                    <div className="text-xs text-muted-foreground">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card rounded-3xl p-7">
            <div className="font-display font-bold text-lg mb-5">Написать в поддержку</div>
            <div className="space-y-3">
              <Input value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} placeholder="Ваше имя" className="h-12 rounded-xl bg-muted/40 border-white/5" />
              <Input value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="Email" className="h-12 rounded-xl bg-muted/40 border-white/5" />
              <textarea value={contact.message} onChange={(e) => setContact({ ...contact, message: e.target.value })} placeholder="Сообщение" rows={4} className="w-full rounded-xl border border-white/5 bg-muted/40 p-3.5 text-sm resize-none text-foreground placeholder:text-muted-foreground" />
              <Button onClick={submitContact} className="w-full h-12 gradient-sunset text-white border-0 rounded-xl font-semibold hover-scale glow">Отправить</Button>
            </div>
          </div>
        </div>
      </Section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-10 px-5">
        <div className="container max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <a href="#home" className="flex items-center gap-2 font-display font-extrabold text-lg">
            <span className="grid place-items-center w-8 h-8 rounded-lg gradient-sunset text-white"><Icon name="Route" size={17} /></span>
            <span className="gradient-text">ПоПути</span>
          </a>
          <div className="text-sm text-muted-foreground">© 2026 ПоПути — путешествуй вместе</div>
          <div className="flex gap-2">
            {['Send', 'Instagram', 'Youtube'].map((ic) => (
              <a key={ic} href="#" className="grid place-items-center w-9 h-9 rounded-full bg-muted/60 hover:gradient-sunset hover:text-white transition-all text-muted-foreground">
                <Icon name={ic} size={15} />
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;