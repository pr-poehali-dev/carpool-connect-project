import { useState, useRef, useEffect, useMemo } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';

/* ─── типы ─── */
type Role = 'passenger' | 'driver';
type Ride = { from: string; to: string; date: string; price: string; name: string; rating: number; seats: number; car: string };
type Msg  = { me: boolean; text: string };
type Booking = Ride & { bookedAt: string; status: 'active' | 'cancelled' };

/* ─── статичные данные ─── */
const SEED_RIDES: Ride[] = [
  { from: 'Москва',        to: 'Санкт-Петербург', date: '30 июня, 09:00', price: '1 200 ₽', name: 'Алексей К.', rating: 4.9, seats: 3, car: 'Toyota Camry'     },
  { from: 'Казань',        to: 'Нижний Новгород', date: '30 июня, 14:30', price: '800 ₽',   name: 'Марина С.',  rating: 5.0, seats: 2, car: 'Kia Rio'           },
  { from: 'Сочи',          to: 'Краснодар',        date: '1 июля, 08:15',  price: '650 ₽',   name: 'Дмитрий В.',rating: 4.8, seats: 1, car: 'Hyundai Solaris'   },
  { from: 'Екатеринбург',  to: 'Челябинск',        date: '1 июля, 11:00',  price: '700 ₽',   name: 'Ольга П.',  rating: 4.7, seats: 4, car: 'Skoda Octavia'     },
];

const REVIEWS = [
  { name: 'Иван Г.',      text: 'Доехал из Москвы в Питер за полцены и с приятной компанией. Сервис огонь!',             rating: 5 },
  { name: 'Светлана М.',  text: 'Как водитель окупаю бензин и нахожу классных попутчиков. Чат внутри — очень удобно.',   rating: 5 },
  { name: 'Артём Л.',     text: 'Рейтинги помогают выбирать проверенных людей. Уже 12 поездок — всё отлично.',           rating: 4 },
];

const FAQ = [
  { q: 'Как найти поездку?',   a: 'Введите город отправления, назначения и дату — система покажет всех подходящих попутчиков.' },
  { q: 'Безопасно ли это?',    a: 'У каждого пользователя есть рейтинг и отзывы. Перед поездкой можно списаться во встроенном чате.' },
  { q: 'Сколько стоит?',       a: 'Поиск и общение бесплатны. Цену за поездку устанавливает сам водитель.' },
  { q: 'Как стать водителем?', a: 'Зарегистрируйтесь, выберите роль «Водитель» и опубликуйте первую поездку.' },
];

const NAV = [
  { id: 'home',     label: 'Главная'  },
  { id: 'search',   label: 'Поиск'    },
  { id: 'cabinet',  label: 'Кабинет'  },
  { id: 'reviews',  label: 'Отзывы'   },
  { id: 'faq',      label: 'FAQ'      },
  { id: 'contacts', label: 'Контакты' },
];

const HERO =
  'https://cdn.poehali.dev/projects/da7389f7-c8b9-45ab-a83f-466e935152e2/files/0be4ca56-cd0a-4f03-8197-ed54110d71b7.jpg';

/* ─── вспом. компоненты ─── */
function Sec({ id, children, cls = '' }: { id: string; children: React.ReactNode; cls?: string }) {
  return (
    <section id={id} className={`scroll-mt-20 py-24 px-4 ${cls}`}>
      <div className="mx-auto max-w-5xl">{children}</div>
    </section>
  );
}

function Heading({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-12 text-center">
      <h2 className="font-display font-black text-4xl md:text-5xl tracking-tight mb-3">{children}</h2>
      {sub && <p className="text-muted-foreground text-base">{sub}</p>}
    </div>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Icon key={i} name="Star" size={13} className={i <= n ? 'text-primary fill-primary' : 'text-muted'} />
      ))}
    </div>
  );
}

function Field({ icon, ...props }: { icon: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <Icon name={icon} size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <input
        {...props}
        className={`w-full pl-10 pr-3.5 h-11 rounded-lg bg-muted text-sm text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:border-primary transition-colors ${props.className ?? ''}`}
      />
    </div>
  );
}

/* ─── главный компонент ─── */
export default function Index() {
  const { toast } = useToast();

  /* auth */
  const [user, setUser]         = useState<{ name: string; role: Role } | null>(null);
  const [screen, setScreen]     = useState<'login'|'register'>('login');
  const [authRole, setAuthRole] = useState<Role>('passenger');
  const [af, setAf]             = useState({ name: '', email: '', password: '' });

  /* cabinet */
  const [tab, setTab] = useState<'overview'|'chat'|'publish'|'bookings'>('overview');

  /* bookings */
  const [bookings, setBookings] = useState<Booking[]>([]);

  /* rides — единый источник правды */
  const [rides, setRides] = useState<Ride[]>(SEED_RIDES);
  const [myRides, setMyRides] = useState<Ride[]>([]);

  /* search */
  const [qFrom, setQFrom] = useState('');
  const [qTo,   setQTo]   = useState('');
  const [searched, setSearched] = useState(false);

  /* computed: фильтрация всегда из актуального rides */
  const filtered = useMemo(() => {
    if (!searched && !qFrom.trim() && !qTo.trim()) return rides;
    return rides.filter(r =>
      (!qFrom.trim() || r.from.toLowerCase().includes(qFrom.trim().toLowerCase())) &&
      (!qTo.trim()   || r.to.toLowerCase().includes(qTo.trim().toLowerCase()))
    );
  }, [rides, qFrom, qTo, searched]);

  /* publish form */
  const [rf, setRf] = useState({ from:'', to:'', date:'', time:'', price:'', seats:'', car:'' });

  /* chat */
  const [chatPeer, setChatPeer] = useState(SEED_RIDES[0].name);
  const [msgs, setMsgs] = useState<Msg[]>([
    { me: false, text: 'Привет! Еду завтра в 9 утра, место есть 👍' },
    { me: true,  text: 'Отлично! Где встретимся?' },
    { me: false, text: 'У метро Аэропорт, выход 2' },
  ]);
  const [draft, setDraft] = useState('');
  const chatEnd = useRef<HTMLDivElement>(null);
  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  /* contact */
  const [cf, setCf] = useState({ name:'', email:'', message:'' });

  /* helpers */
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const search = () => {
    setSearched(true);
    const res = rides.filter(r =>
      (!qFrom.trim() || r.from.toLowerCase().includes(qFrom.trim().toLowerCase())) &&
      (!qTo.trim()   || r.to.toLowerCase().includes(qTo.trim().toLowerCase()))
    );
    toast({ title: res.length ? `Найдено: ${res.length}` : 'Ничего не найдено', description: res.length ? 'Выберите попутчика' : 'Попробуйте другой маршрут' });
  };

  const book = (ride: Ride) => {
    if (!user) { toast({ title: 'Требуется вход', variant: 'destructive' }); go('cabinet'); return; }
    if (user.role === 'driver') { toast({ title: 'Водители не могут бронировать', description: 'Переключитесь на аккаунт пассажира', variant: 'destructive' }); return; }
    const already = bookings.find(b => b.from === ride.from && b.to === ride.to && b.date === ride.date && b.status === 'active');
    if (already) { toast({ title: 'Уже забронировано', description: `${ride.from} → ${ride.to}` }); return; }
    const now = new Date().toLocaleString('ru', { day:'numeric', month:'long', hour:'2-digit', minute:'2-digit' });
    setBookings(prev => [{ ...ride, bookedAt: now, status: 'active' }, ...prev]);
    // уменьшаем кол-во мест
    setRides(prev => prev.map(r =>
      r.from === ride.from && r.to === ride.to && r.date === ride.date
        ? { ...r, seats: Math.max(0, r.seats - 1) }
        : r
    ));
    toast({ title: '✅ Поездка забронирована!', description: `${ride.from} → ${ride.to}, ${ride.date}` });
    setTab('bookings');
    go('cabinet');
  };

  const cancelBooking = (idx: number) => {
    setBookings(prev => prev.map((b, i) => i === idx ? { ...b, status: 'cancelled' } : b));
    // возвращаем место
    const b = bookings[idx];
    setRides(prev => prev.map(r =>
      r.from === b.from && r.to === b.to && r.date === b.date
        ? { ...r, seats: r.seats + 1 }
        : r
    ));
    toast({ title: 'Бронирование отменено', description: `${b.from} → ${b.to}` });
  };

  const openChat = (name: string) => {
    if (!user) { toast({ title: 'Требуется вход', variant: 'destructive' }); go('cabinet'); return; }
    setChatPeer(name);
    setMsgs([{ me: false, text: `Привет! Это ${name}. Чем могу помочь?` }]);
    setTab('chat');
    go('cabinet');
  };

  const sendMsg = () => {
    if (!draft.trim()) return;
    setMsgs(p => [...p, { me: true, text: draft }]);
    setDraft('');
  };

  const login = () => {
    if (!af.email || !af.password) { toast({ title: 'Заполните все поля', variant: 'destructive' }); return; }
    const name = af.name || af.email.split('@')[0];
    setUser({ name, role: authRole });
    setAf({ name:'', email:'', password:'' });
    toast({ title: `Добро пожаловать, ${name}!` });
  };

  const register = () => {
    if (!af.name || !af.email || !af.password) { toast({ title: 'Заполните все поля', variant: 'destructive' }); return; }
    if (af.password.length < 6) { toast({ title: 'Пароль минимум 6 символов', variant: 'destructive' }); return; }
    setUser({ name: af.name, role: authRole });
    setAf({ name:'', email:'', password:'' });
    toast({ title: `Аккаунт создан! Добро пожаловать, ${af.name}` });
  };

  const logout = () => { setUser(null); setTab('overview'); toast({ title: 'Вы вышли' }); };

  const publish = () => {
    const { from:f, to:t, date:d, time, price, seats, car } = rf;
    if (!f||!t||!d||!price||!seats||!car) { toast({ title: 'Заполните все поля', variant: 'destructive' }); return; }
    const ride: Ride = {
      from: f, to: t,
      date: d + (time ? `, ${time}` : ''),
      price: `${price} ₽`,
      name: user!.name,
      rating: 5.0,
      seats: +seats || 1,
      car,
    };
    /* обновляем единый массив rides — filtered пересчитается автоматически */
    setRides(prev => [ride, ...prev]);
    setMyRides(prev => [ride, ...prev]);
    setRf({ from:'', to:'', date:'', time:'', price:'', seats:'', car:'' });
    setTab('overview');
    toast({ title: '🚗 Поездка опубликована!', description: `${f} → ${t} теперь в поиске` });
  };

  const sendContact = () => {
    if (!cf.name||!cf.email||!cf.message) { toast({ title: 'Заполните все поля', variant: 'destructive' }); return; }
    toast({ title: 'Сообщение отправлено', description: 'Поддержка ответит в ближайшее время' });
    setCf({ name:'', email:'', message:'' });
  };

  /* ─── JSX ─── */
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* HEADER */}
      <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-4">
          <a href="#home" className="flex items-center gap-2.5 font-display font-black text-xl tracking-tight">
            <span className="grad grid h-8 w-8 place-items-center rounded-lg text-white"><Icon name="Route" size={17}/></span>
            <span className="grad-text">ПоПути</span>
          </a>
          <nav className="hidden items-center gap-6 md:flex">
            {NAV.map(n => (
              <a key={n.id} href={`#${n.id}`} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{n.label}</a>
            ))}
          </nav>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm font-medium sm:block">{user.name}</span>
              <Button onClick={logout} size="sm" variant="outline" className="rounded-lg border-border text-xs">Выйти</Button>
            </div>
          ) : (
            <Button onClick={() => go('cabinet')} size="sm" className="grad rounded-lg border-0 text-white text-xs font-semibold glow">
              Войти
            </Button>
          )}
        </div>
      </header>

      {/* HERO */}
      <Sec id="home" cls="pt-36 pb-8 relative overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-primary/8 blur-3xl anim-blob pointer-events-none" />
        <div className="absolute -right-20 top-20 h-80 w-80 rounded-full bg-secondary/8 blur-3xl anim-blob pointer-events-none" style={{animationDelay:'6s'}}/>

        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div className="anim-up">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted px-3.5 py-1.5 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"/>
              50 000+ поездок в месяц
            </div>
            <h1 className="font-display font-black text-5xl leading-[1.05] tracking-tight md:text-6xl mb-5">
              Найди<br/><span className="grad-text">попутчика</span><br/>за минуту
            </h1>
            <p className="mb-8 max-w-sm text-muted-foreground leading-relaxed">
              Путешествуй дешевле, делись расходами и знакомься с новыми людьми. Встроенный чат, рейтинги, проверенные водители.
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              <Button onClick={() => go('search')} className="grad rounded-lg border-0 text-white font-semibold glow hov">
                <Icon name="Search" size={16} className="mr-2"/>Найти поездку
              </Button>
              <Button onClick={() => go('cabinet')} variant="outline" className="rounded-lg border-border font-semibold hov">
                <Icon name="Car" size={16} className="mr-2"/>Я водитель
              </Button>
            </div>
            <div className="flex gap-8">
              {[['120K+','участников'],['4.9★','рейтинг'],['350+','городов']].map(([v,l])=>(
                <div key={l}><p className="font-display font-black text-xl grad-text">{v}</p><p className="text-xs text-muted-foreground">{l}</p></div>
              ))}
            </div>
          </div>

          <div className="relative anim-up-2">
            <div className="absolute inset-0 scale-105 rounded-2xl grad opacity-15 blur-2xl"/>
            <img src={HERO} alt="Поездка" className="relative w-full rounded-2xl border border-border/40 shadow-2xl anim-float"/>
            <div className="absolute -bottom-4 -left-4 panel rounded-xl p-3.5 flex items-center gap-3 shadow-xl">
              <div className="grad h-9 w-9 rounded-lg grid place-items-center text-white shrink-0"><Icon name="ShieldCheck" size={17}/></div>
              <div><p className="font-display font-bold text-xs">Проверенные водители</p><p className="text-[11px] text-muted-foreground">Рейтинг и отзывы</p></div>
            </div>
          </div>
        </div>
      </Sec>

      {/* SEARCH */}
      <Sec id="search">
        <Heading sub="Укажите маршрут — подберём лучшие варианты">
          Поиск <span className="grad-text">поездок</span>
        </Heading>

        <div className="panel-solid rounded-xl p-4 mb-8">
          <div className="grid gap-3 md:grid-cols-3">
            <Field icon="MapPin" placeholder="Откуда" value={qFrom} onChange={e=>setQFrom(e.target.value)} onKeyDown={e=>e.key==='Enter'&&search()}/>
            <Field icon="Flag"   placeholder="Куда"   value={qTo}   onChange={e=>setQTo(e.target.value)}   onKeyDown={e=>e.key==='Enter'&&search()}/>
            <Button onClick={search} className="grad h-11 rounded-lg border-0 text-white font-semibold glow hov">
              <Icon name="Search" size={16} className="mr-2"/>Искать
            </Button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <Icon name="SearchX" size={40} className="mx-auto mb-3 opacity-30"/>
            <p className="font-display font-semibold">Поездки не найдены</p>
            <p className="text-sm mt-1">Попробуйте другой маршрут</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((r,i) => {
              const isBooked = bookings.some(b => b.from===r.from && b.to===r.to && b.date===r.date && b.status==='active');
              const noSeats  = r.seats === 0;
              return (
                <div key={i} className={`panel-solid rounded-xl p-5 hov transition-all ${isBooked ? 'border-primary/40' : 'hover:border-primary/25'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="font-display font-bold flex items-center gap-1.5 text-base">
                      {r.from}<Icon name="ArrowRight" size={15} className="text-primary"/>{r.to}
                    </div>
                    <span className="font-display font-black text-lg grad-text">{r.price}</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-border">
                        <AvatarFallback className="grad text-white text-xs font-bold">{r.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{r.name} <span className="text-muted-foreground font-normal text-xs">★{r.rating}</span></p>
                        <p className="text-xs text-muted-foreground">{r.car}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{r.date}</p>
                      <Badge variant="secondary" className={`mt-1 rounded-md text-xs ${noSeats ? 'text-destructive' : ''}`}>
                        {noSeats ? 'Мест нет' : `${r.seats} мест`}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => book(r)}
                      disabled={isBooked || noSeats}
                      className={`h-10 rounded-lg border-0 text-sm font-semibold hov ${isBooked ? 'bg-primary/20 text-primary cursor-default' : noSeats ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'grad text-white glow'}`}
                    >
                      {isBooked ? (
                        <><Icon name="CheckCircle" size={14} className="mr-1.5"/>Забронировано</>
                      ) : noSeats ? (
                        <><Icon name="XCircle" size={14} className="mr-1.5"/>Мест нет</>
                      ) : (
                        <><Icon name="Bookmark" size={14} className="mr-1.5"/>Забронировать</>
                      )}
                    </Button>
                    <Button onClick={()=>openChat(r.name)} variant="outline" className="h-10 rounded-lg border-border text-sm font-semibold hov">
                      Написать <Icon name="MessageCircle" size={14} className="ml-1.5"/>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Sec>

      {/* CABINET */}
      <Sec id="cabinet" cls="border-t border-border/40">
        <Heading sub="Управляйте поездками и общайтесь с попутчиками">
          Личный <span className="grad-text">кабинет</span>
        </Heading>

        {!user ? (
          /* ── Авторизация ── */
          <div className="mx-auto max-w-sm">
            {/* выбор роли */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {(['passenger','driver'] as Role[]).map(r => (
                <button key={r} onClick={()=>setAuthRole(r)}
                  className={`panel-solid rounded-xl p-4 text-center hov border ${authRole===r?'border-primary/50':'border-border'}`}>
                  <div className={`mx-auto mb-2 grid h-9 w-9 place-items-center rounded-lg ${authRole===r?'grad text-white':'bg-muted text-muted-foreground'}`}>
                    <Icon name={r==='driver'?'Car':'User'} size={18}/>
                  </div>
                  <p className="font-display font-bold text-sm">{r==='driver'?'Водитель':'Пассажир'}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{r==='driver'?'Публикую поездки':'Ищу попутчиков'}</p>
                </button>
              ))}
            </div>

            <div className="panel-solid rounded-xl p-6">
              {/* переключатель вход/рег */}
              <div className="mb-5 flex rounded-lg bg-muted p-1">
                {(['login','register'] as const).map(s => (
                  <button key={s} onClick={()=>setScreen(s)}
                    className={`flex-1 rounded-md py-2 text-sm font-semibold transition-all ${screen===s?'grad text-white shadow':'text-muted-foreground hover:text-foreground'}`}>
                    {s==='login'?'Войти':'Регистрация'}
                  </button>
                ))}
              </div>

              <div className="space-y-2.5">
                {screen==='register' && (
                  <Field icon="User" placeholder="Ваше имя" value={af.name} onChange={e=>setAf({...af,name:e.target.value})}/>
                )}
                <Field icon="Mail" placeholder="Email" type="email" value={af.email} onChange={e=>setAf({...af,email:e.target.value})}/>
                <Field icon="Lock" placeholder="Пароль" type="password" value={af.password}
                  onChange={e=>setAf({...af,password:e.target.value})}
                  onKeyDown={e=>e.key==='Enter'&&(screen==='login'?login():register())}
                />
                <Button onClick={screen==='login'?login:register}
                  className="w-full grad h-11 rounded-lg border-0 text-white font-semibold glow hov">
                  {screen==='login'?'Войти':`Создать аккаунт — ${authRole==='driver'?'Водитель':'Пассажир'}`}
                </Button>
              </div>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                {screen==='login'?'Нет аккаунта? ':'Уже есть аккаунт? '}
                <button onClick={()=>setScreen(screen==='login'?'register':'login')} className="text-primary hover:underline">
                  {screen==='login'?'Зарегистрироваться':'Войти'}
                </button>
              </p>
            </div>
          </div>
        ) : (
          /* ── Кабинет ── */
          <div className="mx-auto max-w-4xl">
            {/* профиль */}
            <div className="panel-solid rounded-xl p-4 mb-5 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11 border border-border">
                  <AvatarFallback className="grad text-white font-bold">{user.name[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-display font-bold">{user.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge className={`rounded-md text-[11px] border-0 ${user.role==='driver'?'grad text-white':'bg-secondary/20 text-secondary'}`}>
                      <Icon name={user.role==='driver'?'Car':'User'} size={10} className="mr-1"/>
                      {user.role==='driver'?'Водитель':'Пассажир'}
                    </Badge>
                    <Stars n={5}/>
                  </div>
                </div>
              </div>
              <Button onClick={logout} size="sm" variant="outline" className="rounded-lg border-border text-xs">
                <Icon name="LogOut" size={13} className="mr-1.5"/>Выйти
              </Button>
            </div>

            {/* вкладки */}
            <div className="mb-5 flex flex-wrap gap-1 rounded-xl bg-muted p-1 w-fit">
              {(user.role==='driver'
                ?[['overview','Поездки','LayoutDashboard'],['publish','Опубликовать','Plus'],['chat','Чат','MessageCircle']] as const
                :[['overview','Главная','LayoutDashboard'],['bookings','Бронирования','Bookmark'],['chat','Чат','MessageCircle']] as const
              ).map(([t,l,ic])=>(
                <button key={t} onClick={()=>setTab(t as typeof tab)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab===t?'grad text-white shadow':'text-muted-foreground hover:text-foreground'}`}>
                  <Icon name={ic} size={14}/>{l}
                  {t==='bookings' && bookings.filter(b=>b.status==='active').length > 0 && (
                    <span className="ml-1 h-4 w-4 rounded-full grad text-white text-[10px] grid place-items-center">
                      {bookings.filter(b=>b.status==='active').length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ── overview ── */}
            {tab==='overview' && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="panel-solid rounded-xl p-5">
                  <p className="font-display font-bold mb-4 flex items-center gap-2 text-sm">
                    <Icon name="Route" size={15} className="text-primary"/>
                    {user.role==='passenger'?'Бронирования':'Мои поездки'}
                  </p>
                  {user.role==='driver' ? (
                    myRides.length===0 ? (
                      <div className="py-8 text-center text-muted-foreground text-sm">
                        <Icon name="Car" size={28} className="mx-auto mb-2 opacity-25"/>
                        Поездок пока нет
                      </div>
                    ) : myRides.slice(0,4).map((r,i)=>(
                      <div key={i} className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0 text-sm">
                        <span className="font-medium">{r.from} → {r.to}</span>
                        <span className="text-muted-foreground text-xs">{r.date}</span>
                      </div>
                    ))
                  ) : bookings.filter(b=>b.status==='active').length===0 ? (
                    <div className="py-8 text-center text-muted-foreground text-sm">
                      <Icon name="Bookmark" size={28} className="mx-auto mb-2 opacity-25"/>
                      Бронирований пока нет
                    </div>
                  ) : bookings.filter(b=>b.status==='active').slice(0,3).map((b,i)=>(
                    <div key={i} className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0 text-sm">
                      <span className="font-medium">{b.from} → {b.to}</span>
                      <Badge className="grad text-white border-0 rounded-md text-xs">{b.date.split(',')[0]}</Badge>
                    </div>
                  ))}
                  {user.role==='passenger'?(
                    <div className="flex gap-2 mt-4">
                      <Button onClick={()=>go('search')} className="flex-1 grad h-10 rounded-lg border-0 text-white text-sm font-semibold hov">
                        <Icon name="Search" size={14} className="mr-1.5"/>Найти поездку
                      </Button>
                      {bookings.length > 0 && (
                        <Button onClick={()=>setTab('bookings')} variant="outline" className="h-10 rounded-lg border-border text-sm hov">
                          <Icon name="Bookmark" size={14}/>
                        </Button>
                      )}
                    </div>
                  ):(
                    <Button onClick={()=>setTab('publish')} className="mt-4 w-full grad h-10 rounded-lg border-0 text-white text-sm font-semibold hov glow">
                      <Icon name="Plus" size={14} className="mr-1.5"/>Опубликовать поездку
                    </Button>
                  )}
                </div>

                <div className="panel-solid rounded-xl p-5">
                  <p className="font-display font-bold mb-4 flex items-center gap-2 text-sm">
                    <Icon name="BarChart2" size={15} className="text-secondary"/>Статистика
                  </p>
                  {(user.role==='passenger'
                    ?[['MapPin','Бронирований',String(bookings.filter(b=>b.status==='active').length)],['Wallet','Сэкономлено','2 200 ₽'],['Star','Рейтинг','4.8']]
                    :[['MapPin','Поездок',String(myRides.length||34)],['Wallet','Заработано','28 400 ₽'],['Star','Рейтинг','5.0']]
                  ).map(([ic,l,v])=>(
                    <div key={l} className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0 text-sm">
                      <span className="text-muted-foreground flex items-center gap-2"><Icon name={ic} size={13} className="text-primary"/>{l}</span>
                      <span className="font-display font-bold grad-text">{v}</span>
                    </div>
                  ))}
                  <Button onClick={()=>setTab('chat')} variant="outline" className="mt-4 w-full h-10 rounded-lg border-border text-sm font-semibold hov">
                    <Icon name="MessageCircle" size={14} className="mr-1.5 text-primary"/>Открыть чат
                  </Button>
                </div>
              </div>
            )}

            {/* ── publish ── */}
            {tab==='publish' && (
              <div className="mx-auto max-w-lg panel-solid rounded-xl p-6">
                <p className="font-display font-bold text-lg mb-1">Новая поездка</p>
                <p className="text-muted-foreground text-sm mb-5">Заполните данные — попутчики увидят вас в поиске сразу</p>
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <Field icon="MapPin" placeholder="Откуда" value={rf.from} onChange={e=>setRf({...rf,from:e.target.value})}/>
                    <Field icon="Flag"   placeholder="Куда"   value={rf.to}   onChange={e=>setRf({...rf,to:e.target.value})}/>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <Field icon="Calendar" placeholder="Дата (напр. 5 июля)" value={rf.date} onChange={e=>setRf({...rf,date:e.target.value})}/>
                    <Field icon="Clock"    placeholder="Время (напр. 10:00)" value={rf.time} onChange={e=>setRf({...rf,time:e.target.value})}/>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <Field icon="Banknote" placeholder="Цена, ₽" type="number" value={rf.price} onChange={e=>setRf({...rf,price:e.target.value})}/>
                    <Field icon="Users"    placeholder="Свободных мест" type="number" value={rf.seats} onChange={e=>setRf({...rf,seats:e.target.value})}/>
                  </div>
                  <Field icon="Car" placeholder="Марка и модель (напр. Toyota Camry)" value={rf.car} onChange={e=>setRf({...rf,car:e.target.value})}/>
                  <Button onClick={publish} className="w-full grad h-11 rounded-lg border-0 text-white font-semibold glow hov mt-1">
                    <Icon name="Send" size={15} className="mr-2"/>Опубликовать поездку
                  </Button>
                </div>

                {myRides.length>0 && (
                  <div className="mt-7 border-t border-border/40 pt-5">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Опубликованные мной</p>
                    {myRides.map((r,i)=>(
                      <div key={i} className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0 text-sm">
                        <span className="font-medium flex items-center gap-1.5">{r.from}<Icon name="ArrowRight" size={12} className="text-primary"/>{r.to}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{r.date}</span>
                          <Badge className="grad text-white border-0 rounded-md text-xs">{r.price}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── bookings ── */}
            {tab==='bookings' && (
              <div className="mx-auto max-w-2xl">
                <div className="panel-solid rounded-xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <p className="font-display font-bold flex items-center gap-2">
                      <Icon name="Bookmark" size={17} className="text-primary"/>Мои бронирования
                    </p>
                    <Badge variant="secondary" className="rounded-md text-xs">
                      {bookings.filter(b=>b.status==='active').length} активных
                    </Badge>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                      <Icon name="Bookmark" size={40} className="mx-auto mb-3 opacity-20"/>
                      <p className="font-display font-semibold">Бронирований пока нет</p>
                      <p className="text-sm mt-1">Найдите поездку и нажмите «Забронировать»</p>
                      <Button onClick={()=>go('search')} className="mt-5 grad rounded-lg border-0 text-white font-semibold glow hov">
                        <Icon name="Search" size={14} className="mr-2"/>Найти поездку
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bookings.map((b,i)=>(
                        <div key={i} className={`rounded-xl p-4 border transition-all ${b.status==='active' ? 'panel-solid border-border' : 'bg-muted/30 border-border/30 opacity-60'}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="font-display font-bold flex items-center gap-1.5 text-base mb-1.5">
                                {b.from}<Icon name="ArrowRight" size={14} className="text-primary shrink-0"/>{b.to}
                              </div>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><Icon name="Calendar" size={11}/>{b.date}</span>
                                <span className="flex items-center gap-1"><Icon name="User" size={11}/>{b.name}</span>
                                <span className="flex items-center gap-1"><Icon name="Car" size={11}/>{b.car}</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-display font-black grad-text text-lg">{b.price}</p>
                              <Badge className={`rounded-md text-[11px] border-0 mt-1 ${b.status==='active' ? 'bg-green-500/15 text-green-400' : 'bg-muted text-muted-foreground'}`}>
                                {b.status==='active' ? '✓ Активно' : 'Отменено'}
                              </Badge>
                            </div>
                          </div>
                          {b.status==='active' && (
                            <div className="flex gap-2 mt-3 pt-3 border-t border-border/40">
                              <Button onClick={()=>openChat(b.name)} variant="outline" size="sm" className="rounded-lg border-border text-xs hov">
                                <Icon name="MessageCircle" size={12} className="mr-1.5"/>Написать водителю
                              </Button>
                              <Button onClick={()=>cancelBooking(i)} variant="outline" size="sm" className="rounded-lg border-destructive/30 text-destructive hover:bg-destructive/10 text-xs hov ml-auto">
                                <Icon name="X" size={12} className="mr-1.5"/>Отменить
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── chat ── */}
            {tab==='chat' && (
              <div className="grid gap-4 md:grid-cols-3">
                {/* диалоги */}
                <div className="panel-solid rounded-xl p-3 space-y-1">
                  <p className="font-display font-bold text-xs text-muted-foreground uppercase tracking-wider px-2 mb-2">Диалоги</p>
                  {SEED_RIDES.map((r,i)=>(
                    <button key={i} onClick={()=>{setChatPeer(r.name);setMsgs([{me:false,text:`Привет! Это ${r.name}. Маршрут: ${r.from} → ${r.to}`}]);}}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hov border ${chatPeer===r.name?'border-primary/40 bg-primary/8':'border-transparent hover:bg-muted'}`}>
                      <Avatar className="h-8 w-8 shrink-0 border border-border">
                        <AvatarFallback className="grad text-white text-xs font-bold">{r.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{r.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{r.from} → {r.to}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* окно */}
                <div className="md:col-span-2 panel-solid rounded-xl overflow-hidden flex flex-col">
                  <div className="grad flex items-center gap-3 px-4 py-3">
                    <Avatar className="h-8 w-8 border-2 border-white/30">
                      <AvatarFallback className="bg-white/15 text-white font-bold text-xs">{chatPeer[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-white text-sm">{chatPeer}</p>
                      <p className="text-[11px] text-white/70 flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-green-300"/>в сети</p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3 h-64 bg-background/30">
                    {msgs.map((m,i)=>(
                      <div key={i} className={`flex ${m.me?'justify-end':'justify-start'}`}>
                        <div className={`max-w-[72%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${m.me?'grad text-white rounded-br-sm':'panel-solid rounded-bl-sm'}`}>
                          {m.text}
                        </div>
                      </div>
                    ))}
                    <div ref={chatEnd}/>
                  </div>

                  <div className="flex gap-2 border-t border-border/40 p-3">
                    <input value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMsg()}
                      placeholder="Написать сообщение..."
                      className="flex-1 h-10 rounded-lg bg-muted border border-border px-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                    <Button onClick={sendMsg} size="icon" className="grad h-10 w-10 rounded-lg border-0 text-white shrink-0 hov">
                      <Icon name="Send" size={16}/>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Sec>

      {/* DONATE */}
      <Sec id="donate">
        <div className="relative overflow-hidden rounded-2xl grad p-10 md:p-14 text-center">
          <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle at 20% 50%, white, transparent 60%)'}}/>
          <Icon name="Heart" size={44} className="mx-auto mb-4 fill-white text-white"/>
          <h2 className="font-display font-black text-4xl text-white mb-3">Поддержите проект</h2>
          <p className="mx-auto max-w-md text-white/80 mb-8 leading-relaxed">
            ПоПути работает без рекламы. Ваш донат помогает развивать сервис и оставлять поиск бесплатным.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-7">
            {['100 ₽','300 ₽','500 ₽','1 000 ₽'].map(s=>(
              <Button key={s} onClick={()=>toast({title:'Спасибо! ❤️',description:`Донат ${s}`})}
                className="rounded-lg bg-white/15 hover:bg-white/25 text-white border-white/20 font-semibold hov">
                {s}
              </Button>
            ))}
          </div>
          <Button onClick={()=>toast({title:'Спасибо! ❤️',description:'Переходим к оплате'})}
            className="rounded-lg bg-white text-primary hover:bg-white/90 font-bold px-8 border-0 hov">
            <Icon name="Heart" size={16} className="mr-2 fill-primary"/>Поддержать проект
          </Button>
        </div>
      </Sec>

      {/* REVIEWS */}
      <Sec id="reviews" cls="border-t border-border/40">
        <Heading sub="Что говорят наши пользователи">
          Рейтинги и <span className="grad-text">отзывы</span>
        </Heading>
        <div className="grid gap-4 md:grid-cols-3">
          {REVIEWS.map((r,i)=>(
            <div key={i} className="panel-solid rounded-xl p-5 hov hover:border-primary/25">
              <Stars n={r.rating}/>
              <p className="my-3 text-muted-foreground text-sm leading-relaxed">«{r.text}»</p>
              <div className="flex items-center gap-2.5">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarFallback className="grad text-white text-xs font-bold">{r.name[0]}</AvatarFallback>
                </Avatar>
                <span className="font-semibold text-sm">{r.name}</span>
              </div>
            </div>
          ))}
        </div>
      </Sec>

      {/* FAQ */}
      <Sec id="faq">
        <Heading sub="Всё что нужно знать о ПоПути">
          Частые <span className="grad-text">вопросы</span>
        </Heading>
        <Accordion type="single" collapsible className="mx-auto max-w-2xl space-y-2">
          {FAQ.map((f,i)=>(
            <AccordionItem key={i} value={`q${i}`} className="panel-solid rounded-xl border-0 px-5">
              <AccordionTrigger className="font-display font-semibold text-sm text-left hover:no-underline py-4">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm pb-4 leading-relaxed">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Sec>

      {/* CONTACTS */}
      <Sec id="contacts" cls="border-t border-border/40">
        <Heading sub="Мы на связи 24/7">
          Контакты и <span className="grad-text">поддержка</span>
        </Heading>
        <div className="grid gap-10 md:grid-cols-2 items-start">
          <div className="space-y-4">
            {[['Mail','help@poputi.ru','Написать на почту'],['Phone','8 800 555-35-35','Звонок бесплатный'],['MapPin','Москва, ул. Дорожная, 1','Главный офис']].map(([ic,t,s])=>(
              <div key={t} className="flex items-center gap-3.5">
                <div className="grad grid h-10 w-10 shrink-0 place-items-center rounded-lg text-white"><Icon name={ic} size={17}/></div>
                <div><p className="font-semibold text-sm">{t}</p><p className="text-xs text-muted-foreground">{s}</p></div>
              </div>
            ))}
          </div>
          <div className="panel-solid rounded-xl p-6">
            <p className="font-display font-bold mb-4 text-sm">Написать в поддержку</p>
            <div className="space-y-2.5">
              <Field icon="User" placeholder="Ваше имя"  value={cf.name}    onChange={e=>setCf({...cf,name:e.target.value})}/>
              <Field icon="Mail" placeholder="Email"      value={cf.email}   onChange={e=>setCf({...cf,email:e.target.value})}/>
              <textarea value={cf.message} onChange={e=>setCf({...cf,message:e.target.value})} rows={4} placeholder="Сообщение"
                className="w-full rounded-lg border border-border bg-muted px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary transition-colors"/>
              <Button onClick={sendContact} className="w-full grad h-11 rounded-lg border-0 text-white font-semibold glow hov">Отправить</Button>
            </div>
          </div>
        </div>
      </Sec>

      {/* FOOTER */}
      <footer className="border-t border-border/40 py-8 px-4">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 md:flex-row">
          <a href="#home" className="flex items-center gap-2 font-display font-black text-lg">
            <span className="grad grid h-7 w-7 place-items-center rounded-lg text-white"><Icon name="Route" size={15}/></span>
            <span className="grad-text">ПоПути</span>
          </a>
          <p className="text-xs text-muted-foreground">© 2026 ПоПути — путешествуй вместе</p>
          <div className="flex gap-2">
            {['Send','Instagram','Youtube'].map(ic=>(
              <a key={ic} href="#" className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <Icon name={ic} size={14}/>
              </a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}