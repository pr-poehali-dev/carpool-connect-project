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

const RIDES = [
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
  { q: 'Как найти поездку?', a: 'Введите город отправления, назначения и дату на главной — система покажет всех подходящих попутчиков.' },
  { q: 'Безопасно ли это?', a: 'У каждого пользователя есть рейтинг и отзывы. Перед поездкой можно списаться во встроенном чате.' },
  { q: 'Сколько стоит сервис?', a: 'Поиск и общение бесплатны. Цену за поездку устанавливает сам водитель, чтобы покрыть расходы на топливо.' },
  { q: 'Как стать водителем?', a: 'Зарегистрируйтесь, переключитесь в кабинет водителя и опубликуйте свою первую поездку за пару минут.' },
];

const CHAT = [
  { me: false, name: 'Алексей', text: 'Привет! Еду завтра в 9 утра, место есть 👍' },
  { me: true, text: 'Отлично! А где удобнее встретиться?' },
  { me: false, name: 'Алексей', text: 'У метро Аэропорт, выход 2' },
  { me: true, text: 'Договорились, буду вовремя 🚗' },
];

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
        <Icon key={i} name="Star" size={16} className={i < Math.round(n) ? 'text-primary fill-primary' : 'text-muted'} />
      ))}
    </div>
  );
}

const Index = () => {
  const { toast } = useToast();
  const [role, setRole] = useState<'driver' | 'passenger'>('passenger');
  const [msg, setMsg] = useState('');
  const [chat, setChat] = useState(CHAT);
  const chatRef = useRef<HTMLDivElement>(null);

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [filtered, setFiltered] = useState(RIDES);

  const [chatWith, setChatWith] = useState(RIDES[0].name);

  const [contact, setContact] = useState({ name: '', email: '', message: '' });

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [chat]);

  const send = () => {
    if (!msg.trim()) return;
    setChat([...chat, { me: true, text: msg }]);
    setMsg('');
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSearch = () => {
    const f = from.trim().toLowerCase();
    const t = to.trim().toLowerCase();
    const res = RIDES.filter(
      (r) =>
        (!f || r.from.toLowerCase().includes(f)) &&
        (!t || r.to.toLowerCase().includes(t)),
    );
    setFiltered(res);
    toast({
      title: res.length ? `Найдено поездок: ${res.length}` : 'Поездки не найдены',
      description: res.length ? 'Выберите попутчика и свяжитесь с ним' : 'Попробуйте изменить маршрут или дату',
    });
  };

  const openChat = (name: string) => {
    setChatWith(name);
    setChat([{ me: false, name, text: `Здравствуйте! Это ${name}. Чем могу помочь по поездке?` }]);
    scrollTo('cabinet');
    toast({ title: 'Чат открыт', description: `Вы начали переписку с ${name}` });
  };

  const donate = (sum: string) => {
    toast({ title: 'Спасибо за поддержку! ❤️', description: `Переходим к оплате доната на ${sum}` });
  };

  const submitContact = () => {
    if (!contact.name.trim() || !contact.email.trim() || !contact.message.trim()) {
      toast({ title: 'Заполните все поля', description: 'Имя, email и сообщение обязательны', variant: 'destructive' });
      return;
    }
    toast({ title: 'Сообщение отправлено!', description: 'Команда поддержки ответит вам в ближайшее время' });
    setContact({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* HEADER */}
      <header className="fixed top-0 inset-x-0 z-50 glass border-b border-border/50">
        <div className="container max-w-6xl mx-auto flex items-center justify-between h-16 px-5">
          <a href="#home" className="flex items-center gap-2 font-display font-extrabold text-xl">
            <span className="grid place-items-center w-9 h-9 rounded-xl gradient-sunset text-white">
              <Icon name="Route" size={20} />
            </span>
            <span className="gradient-text">ПоПути</span>
          </a>
          <nav className="hidden md:flex items-center gap-7">
            {NAV.map((n) => (
              <a key={n.id} href={`#${n.id}`} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                {n.label}
              </a>
            ))}
          </nav>
          <Button onClick={() => scrollTo('cabinet')} className="gradient-sunset text-white border-0 rounded-full font-semibold hover-scale">
            Войти
          </Button>
        </div>
      </header>

      {/* HERO */}
      <Section id="home" className="pt-36 pb-12 relative">
        <div className="absolute -top-10 -left-20 w-72 h-72 rounded-full bg-primary/20 blur-3xl animate-blob" />
        <div className="absolute top-40 right-0 w-80 h-80 rounded-full bg-secondary/20 blur-3xl animate-blob" style={{ animationDelay: '4s' }} />
        <div className="grid lg:grid-cols-2 gap-12 items-center relative">
          <div className="animate-fade-up">
            <Badge className="gradient-sunset text-white border-0 mb-5 rounded-full px-4 py-1.5">🚀 Более 50 000 поездок в месяц</Badge>
            <h1 className="font-display font-black text-5xl md:text-6xl leading-tight mb-5">
              Найди <span className="gradient-text">попутчика</span> за минуту
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-md">
              Путешествуй дешевле, делись расходами и знакомься с новыми людьми. Встроенный чат, рейтинги и проверенные водители.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => scrollTo('search')} size="lg" className="gradient-sunset text-white border-0 rounded-full font-semibold glow hover-scale">
                <Icon name="Search" size={18} className="mr-2" />Найти поездку
              </Button>
              <Button onClick={() => { setRole('driver'); scrollTo('cabinet'); }} size="lg" variant="outline" className="rounded-full font-semibold hover-scale">
                <Icon name="Car" size={18} className="mr-2" />Я водитель
              </Button>
            </div>
            <div className="flex gap-8 mt-10">
              {[['120K+', 'участников'], ['4.9', 'средний рейтинг'], ['350+', 'городов']].map(([v, l]) => (
                <div key={l}>
                  <div className="font-display font-extrabold text-2xl gradient-text">{v}</div>
                  <div className="text-sm text-muted-foreground">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative animate-fade-up" style={{ animationDelay: '0.15s' }}>
            <img src={HERO_IMG} alt="Поездка" className="rounded-3xl shadow-2xl w-full animate-float" />
          </div>
        </div>
      </Section>

      {/* SEARCH */}
      <Section id="search">
        <div className="text-center mb-10">
          <h2 className="font-display font-extrabold text-4xl mb-3">Поиск поездок и попутчиков</h2>
          <p className="text-muted-foreground">Укажите маршрут и дату — мы подберём лучшие варианты</p>
        </div>
        <Card className="p-5 rounded-3xl shadow-xl border-border/60 mb-10">
          <div className="grid md:grid-cols-4 gap-3">
            <div className="relative">
              <Icon name="MapPin" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
              <Input value={from} onChange={(e) => setFrom(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="Откуда" className="pl-10 h-12 rounded-xl" />
            </div>
            <div className="relative">
              <Icon name="Flag" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent" />
              <Input value={to} onChange={(e) => setTo(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="Куда" className="pl-10 h-12 rounded-xl" />
            </div>
            <div className="relative">
              <Icon name="Calendar" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
              <Input value={date} onChange={(e) => setDate(e.target.value)} placeholder="Дата" className="pl-10 h-12 rounded-xl" />
            </div>
            <Button onClick={handleSearch} className="h-12 gradient-sunset text-white border-0 rounded-xl font-semibold hover-scale">
              <Icon name="Search" size={18} className="mr-2" />Искать
            </Button>
          </div>
        </Card>
        {filtered.length === 0 && (
          <div className="text-center text-muted-foreground py-10">
            <Icon name="SearchX" size={40} className="mx-auto mb-3 text-primary" />
            По вашему запросу поездок не найдено. Попробуйте другой маршрут.
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-5">
          {filtered.map((r, i) => (
            <Card key={i} className="p-5 rounded-3xl border-border/60 hover-scale hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 font-display font-bold text-lg">
                  {r.from}
                  <Icon name="ArrowRight" size={18} className="text-primary" />
                  {r.to}
                </div>
                <span className="font-display font-extrabold text-xl gradient-text">{r.price}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="border-2 border-primary/30">
                    <AvatarFallback className="gradient-sunset text-white text-sm">{r.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-sm flex items-center gap-1">
                      {r.name}
                      <Icon name="Star" size={13} className="text-primary fill-primary" />
                      <span className="text-muted-foreground">{r.rating}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{r.car}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">{r.date}</div>
                  <Badge variant="secondary" className="mt-1 rounded-full">{r.seats} места</Badge>
                </div>
              </div>
              <Button onClick={() => openChat(r.name)} className="w-full mt-4 rounded-xl gradient-sunset text-white border-0 font-semibold hover-scale">
                Связаться <Icon name="MessageCircle" size={16} className="ml-2" />
              </Button>
            </Card>
          ))}
        </div>
      </Section>

      {/* CABINET */}
      <Section id="cabinet" className="bg-muted/40">
        <div className="text-center mb-10">
          <h2 className="font-display font-extrabold text-4xl mb-3">Личный кабинет</h2>
          <p className="text-muted-foreground">Управляйте поездками в роли пассажира или водителя</p>
        </div>
        <Tabs value={role} onValueChange={(v) => setRole(v as 'driver' | 'passenger')} className="max-w-4xl mx-auto">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-8 rounded-full h-12 p-1">
            <TabsTrigger value="passenger" className="rounded-full data-[state=active]:gradient-sunset data-[state=active]:text-white font-semibold">
              <Icon name="User" size={16} className="mr-2" />Пассажир
            </TabsTrigger>
            <TabsTrigger value="driver" className="rounded-full data-[state=active]:gradient-sunset data-[state=active]:text-white font-semibold">
              <Icon name="Car" size={16} className="mr-2" />Водитель
            </TabsTrigger>
          </TabsList>

          <TabsContent value="passenger">
            <div className="grid md:grid-cols-3 gap-5">
              <Card className="p-6 rounded-3xl border-border/60">
                <Avatar className="w-16 h-16 mb-3"><AvatarFallback className="gradient-sunset text-white text-xl">П</AvatarFallback></Avatar>
                <div className="font-display font-bold text-lg">Привет, Пассажир!</div>
                <Stars n={4.8} />
                <div className="text-sm text-muted-foreground mt-2">8 поездок • 2 200 ₽ сэкономлено</div>
              </Card>
              <Card className="p-6 rounded-3xl border-border/60 md:col-span-2">
                <div className="font-display font-bold mb-4">Мои бронирования</div>
                {RIDES.slice(0, 2).map((r, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                    <div className="text-sm font-medium">{r.from} → {r.to}</div>
                    <Badge className="gradient-sunset text-white border-0 rounded-full">{r.date.split(',')[0]}</Badge>
                  </div>
                ))}
                <Button onClick={() => scrollTo('search')} className="w-full mt-4 rounded-xl gradient-sunset text-white border-0 font-semibold hover-scale">
                  <Icon name="Search" size={16} className="mr-2" />Найти новую поездку
                </Button>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="driver">
            <div className="grid md:grid-cols-3 gap-5">
              <Card className="p-6 rounded-3xl border-border/60">
                <Avatar className="w-16 h-16 mb-3"><AvatarFallback className="gradient-sunset text-white text-xl">В</AvatarFallback></Avatar>
                <div className="font-display font-bold text-lg">Привет, Водитель!</div>
                <Stars n={5} />
                <div className="text-sm text-muted-foreground mt-2">34 поездки • 28 400 ₽ заработано</div>
              </Card>
              <Card className="p-6 rounded-3xl border-border/60 md:col-span-2">
                <div className="font-display font-bold mb-4">Мои поездки</div>
                {RIDES.slice(1, 3).map((r, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                    <div className="text-sm font-medium">{r.from} → {r.to}</div>
                    <Badge variant="secondary" className="rounded-full">{r.seats} мест свободно</Badge>
                  </div>
                ))}
                <Button onClick={() => toast({ title: 'Создание поездки', description: 'Форма публикации поездки скоро будет здесь' })} className="w-full mt-4 rounded-xl gradient-sunset text-white border-0 font-semibold hover-scale">
                  <Icon name="Plus" size={16} className="mr-2" />Опубликовать поездку
                </Button>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* CHAT */}
        <div className="max-w-md mx-auto mt-12">
          <div className="text-center mb-4">
            <h3 className="font-display font-bold text-xl flex items-center justify-center gap-2">
              <Icon name="MessagesSquare" size={22} className="text-primary" />Встроенный чат
            </h3>
            <p className="text-sm text-muted-foreground">Общайтесь с попутчиками прямо на сайте</p>
          </div>
          <Card className="rounded-3xl border-border/60 overflow-hidden">
            <div className="gradient-sunset text-white px-5 py-3 flex items-center gap-3">
              <Avatar className="w-9 h-9 border-2 border-white/40"><AvatarFallback className="bg-white/20 text-white">{chatWith[0]}</AvatarFallback></Avatar>
              <div>
                <div className="font-semibold text-sm">{chatWith}</div>
                <div className="text-xs text-white/80 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-300" />в сети</div>
              </div>
            </div>
            <div ref={chatRef} className="p-4 space-y-3 h-64 overflow-y-auto bg-muted/30">
              {chat.map((m, i) => (
                <div key={i} className={`flex ${m.me ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${m.me ? 'gradient-sunset text-white rounded-br-sm' : 'bg-white border border-border rounded-bl-sm'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 flex gap-2 border-t border-border/50">
              <Input
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Сообщение..."
                className="rounded-full h-11"
              />
              <Button onClick={send} size="icon" className="rounded-full h-11 w-11 gradient-sunset text-white border-0 shrink-0 hover-scale">
                <Icon name="Send" size={18} />
              </Button>
            </div>
          </Card>
        </div>
      </Section>

      {/* DONATE */}
      <Section id="donate">
        <Card className="rounded-3xl border-0 gradient-sunset text-white p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <Icon name="Heart" size={48} className="mx-auto mb-4 fill-white" />
          <h2 className="font-display font-black text-4xl mb-3">Поддержите проект</h2>
          <p className="max-w-xl mx-auto mb-8 text-white/90">
            ПоПути работает без навязчивой рекламы. Ваш донат помогает развивать сервис, добавлять города и держать поиск попутчиков бесплатным для всех.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {['100 ₽', '300 ₽', '500 ₽', '1 000 ₽'].map((s) => (
              <Button key={s} onClick={() => donate(s)} variant="secondary" className="rounded-full font-bold bg-white text-primary hover:bg-white/90 hover-scale border-0 px-6">
                {s}
              </Button>
            ))}
          </div>
          <Button onClick={() => donate('любую сумму')} size="lg" className="rounded-full bg-white text-primary hover:bg-white/90 font-bold px-10 hover-scale border-0">
            <Icon name="Heart" size={18} className="mr-2 fill-primary" />Поддержать проект
          </Button>
        </Card>
      </Section>

      {/* REVIEWS */}
      <Section id="reviews" className="bg-muted/40">
        <div className="text-center mb-10">
          <h2 className="font-display font-extrabold text-4xl mb-3">Рейтинги и отзывы</h2>
          <p className="text-muted-foreground">Что говорят наши попутчики</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {REVIEWS.map((r, i) => (
            <Card key={i} className="p-6 rounded-3xl border-border/60 hover-scale">
              <Stars n={r.rating} />
              <p className="my-4 text-muted-foreground">«{r.text}»</p>
              <div className="flex items-center gap-3">
                <Avatar><AvatarFallback className="gradient-sunset text-white text-sm">{r.name[0]}</AvatarFallback></Avatar>
                <div className="font-semibold text-sm">{r.name}</div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section id="faq">
        <div className="text-center mb-10">
          <h2 className="font-display font-extrabold text-4xl mb-3">Частые вопросы</h2>
          <p className="text-muted-foreground">Всё, что нужно знать о ПоПути</p>
        </div>
        <Accordion type="single" collapsible className="max-w-2xl mx-auto">
          {FAQ.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border border-border/60 rounded-2xl px-5 mb-3 bg-card">
              <AccordionTrigger className="font-display font-semibold text-left hover:no-underline">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>

      {/* CONTACTS */}
      <Section id="contacts" className="bg-muted/40">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="font-display font-extrabold text-4xl mb-3">Контакты и поддержка</h2>
            <p className="text-muted-foreground mb-6">Мы на связи 24/7. Напишите нам, и команда поддержки поможет с любым вопросом.</p>
            <div className="space-y-3">
              {[['Mail', 'help@poputi.ru'], ['Phone', '8 800 555-35-35'], ['MapPin', 'Москва, ул. Дорожная, 1']].map(([ic, t]) => (
                <div key={t} className="flex items-center gap-3">
                  <span className="grid place-items-center w-10 h-10 rounded-xl gradient-sunset text-white"><Icon name={ic} size={18} /></span>
                  <span className="font-medium">{t}</span>
                </div>
              ))}
            </div>
          </div>
          <Card className="p-6 rounded-3xl border-border/60">
            <div className="font-display font-bold text-lg mb-4">Написать в поддержку</div>
            <div className="space-y-3">
              <Input value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} placeholder="Ваше имя" className="h-12 rounded-xl" />
              <Input value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="Email" className="h-12 rounded-xl" />
              <textarea value={contact.message} onChange={(e) => setContact({ ...contact, message: e.target.value })} placeholder="Сообщение" rows={4} className="w-full rounded-xl border border-input bg-background p-3 text-sm resize-none" />
              <Button onClick={submitContact} className="w-full h-12 gradient-sunset text-white border-0 rounded-xl font-semibold hover-scale">Отправить</Button>
            </div>
          </Card>
        </div>
      </Section>

      {/* FOOTER */}
      <footer className="border-t border-border/50 py-10 px-5">
        <div className="container max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <a href="#home" className="flex items-center gap-2 font-display font-extrabold text-lg">
            <span className="grid place-items-center w-8 h-8 rounded-lg gradient-sunset text-white"><Icon name="Route" size={18} /></span>
            <span className="gradient-text">ПоПути</span>
          </a>
          <div className="text-sm text-muted-foreground">© 2026 ПоПути. Путешествуй вместе.</div>
          <div className="flex gap-3">
            {['Send', 'Instagram', 'Youtube'].map((ic) => (
              <a key={ic} href="#" className="grid place-items-center w-9 h-9 rounded-full bg-muted hover:gradient-sunset hover:text-white transition-all">
                <Icon name={ic} size={16} />
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;