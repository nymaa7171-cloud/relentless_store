import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import ProductCard from './components/ProductCard';
import CheckoutModal from './components/CheckoutModal';
import AdminDashboard from './components/AdminDashboard';

const ADMIN_CODE = '999';

const NAV_LINKS = [
  { label: 'НҮҮР', id: 'hero' },
  { label: 'БАРАА', id: 'products' },
  { label: 'БИДНИЙ ТУХАЙ', id: 'about' },
  { label: 'ХОЛБОО БАРИХ', id: 'contact' },
];

const FILTER_SPORTS = ['БҮГД', 'Гүйлт', 'Уулын дугуй', 'Фитнесс', 'Спортын бөмбөг', 'Дайчлал', 'Усан спорт', 'Бусад'];

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filter, setFilter] = useState('БҮГД');
  const [statusFilter, setStatusFilter] = useState('БҮГД');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [adminError, setAdminError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetchProducts();
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const handleAdminLogin = () => {
    if (adminCode === ADMIN_CODE) {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminCode('');
      setAdminError('');
    } else {
      setAdminError('Буруу код. Дахин оруулна уу.');
    }
  };

  const filteredProducts = products.filter((p) => {
    const sportMatch = filter === 'БҮГД' || p.sport_category === filter;
    const statusMatch =
      statusFilter === 'БҮГД' ||
      (statusFilter === 'БЭЛЭН' && p.status === 'available') ||
      (statusFilter === 'ЗАХИАЛГААР' && p.status === 'preorder');
    return sportMatch && statusMatch;
  });

  if (isAdmin) {
    return <AdminDashboard onLogout={() => setIsAdmin(false)} />;
  }

  return (
    <div style={{ background: '#080808', minHeight: '100vh', fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif" }}>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@300;400;600;700;900&display=swap"
        rel="stylesheet"
      />

      {/* ===== NAVBAR ===== */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? 'rgba(8,8,8,0.97)' : 'transparent',
          borderBottom: scrolled ? '1px solid #1a1a1a' : '1px solid transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => scrollTo('hero')} className="flex items-center gap-3">
            <div className="relative">
              <div
                className="w-8 h-8 flex items-center justify-center"
                style={{ border: '2px solid #c9a84c' }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8 L8 2 L14 8 L8 14 Z" fill="#c9a84c" />
                </svg>
              </div>
            </div>
            <span
              className="text-2xl font-black tracking-widest"
              style={{ color: '#fff', fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.2em' }}
            >
              RELENTLESS
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="text-sm font-bold tracking-widest transition-colors duration-200"
                style={{ color: '#888', letterSpacing: '0.15em' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#c9a84c')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#888')}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => setShowAdminLogin(true)}
              className="px-4 py-2 text-xs font-black tracking-widest transition-all duration-200"
              style={{ border: '1px solid #2a2a2a', color: '#444', letterSpacing: '0.15em' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#c9a84c'; e.currentTarget.style.color = '#c9a84c'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#444'; }}
            >
              АДМИН
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="block h-0.5 transition-all duration-300"
                style={{
                  background: '#c9a84c',
                  width: i === 1 ? (menuOpen ? '20px' : '14px') : '20px',
                  transform: menuOpen ? (i === 0 ? 'rotate(45deg) translate(3px, 3px)' : i === 2 ? 'rotate(-45deg) translate(3px, -3px)' : 'scaleX(0)') : 'none',
                }}
              />
            ))}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className="md:hidden px-6 pb-6 pt-2"
            style={{ background: 'rgba(8,8,8,0.99)', borderTop: '1px solid #1a1a1a' }}
          >
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="block w-full text-left py-3 text-sm font-bold tracking-widest"
                style={{ color: '#888', borderBottom: '1px solid #111' }}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => { setShowAdminLogin(true); setMenuOpen(false); }}
              className="mt-3 text-xs font-bold tracking-widest"
              style={{ color: '#444' }}
            >
              АДМИН
            </button>
          </div>
        )}
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Animated background grid */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px',
            }}
          />
          {/* Radial glow */}
          <div
            className="absolute"
            style={{
              top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
              width: '600px', height: '600px',
              background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)',
              borderRadius: '50%',
            }}
          />
          {/* Diagonal accent lines */}
          <div
            className="absolute"
            style={{
              top: 0, left: '20%', width: '1px', height: '100%',
              background: 'linear-gradient(to bottom, transparent, rgba(201,168,76,0.15), transparent)',
            }}
          />
          <div
            className="absolute"
            style={{
              top: 0, right: '20%', width: '1px', height: '100%',
              background: 'linear-gradient(to bottom, transparent, rgba(201,168,76,0.1), transparent)',
            }}
          />
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          {/* Top label */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div style={{ width: '40px', height: '1px', background: '#c9a84c' }} />
            <span className="text-xs font-bold tracking-[0.4em]" style={{ color: '#c9a84c' }}>
              МОНГОЛЫН СПОРТ БРЭНД
            </span>
            <div style={{ width: '40px', height: '1px', background: '#c9a84c' }} />
          </div>

          {/* Main title */}
          <h1
            className="font-black leading-none mb-6"
            style={{
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              fontSize: 'clamp(64px, 15vw, 160px)',
              letterSpacing: '0.05em',
              color: '#fff',
              textShadow: '0 0 80px rgba(201,168,76,0.15)',
            }}
          >
            RELENT
            <span style={{ color: '#c9a84c' }}>LESS</span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-xl md:text-2xl font-bold tracking-widest mb-4"
            style={{ color: '#888', letterSpacing: '0.3em' }}
          >
            ЗОГСОЛТГҮЙ · ХЯЗГААРГҮЙ · ЧАНАРТАЙ
          </p>
          <p className="text-sm mb-12" style={{ color: '#555', letterSpacing: '0.2em' }}>
            ПРЕМИУМ СПОРТЫН ХУВЦАС БА ТОНОГ ХЭРЭГСЭЛ
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => scrollTo('products')}
              className="px-10 py-4 text-sm font-black tracking-widest transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #c9a84c, #e8c96d)',
                color: '#000',
                letterSpacing: '0.2em',
                boxShadow: '0 10px 40px rgba(201,168,76,0.25)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              БАРАА ҮЗЭХ
            </button>
            <button
              onClick={() => scrollTo('about')}
              className="px-10 py-4 text-sm font-black tracking-widest transition-all duration-300"
              style={{
                background: 'transparent',
                color: '#fff',
                border: '1px solid #333',
                letterSpacing: '0.2em',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#c9a84c'; e.currentTarget.style.color = '#c9a84c'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#fff'; }}
            >
              БИДНИЙ ТУХАЙ
            </button>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-md mx-auto">
            {[
              { num: '100+', label: 'БАРАА' },
              { num: '500+', label: 'ЗАХИАЛГА' },
              { num: '5★', label: 'ҮНЭЛГЭЭ' },
            ].map(({ num, label }) => (
              <div key={label} className="text-center">
                <p
                  className="text-3xl font-black"
                  style={{ color: '#c9a84c', fontFamily: "'Bebas Neue', Impact, sans-serif" }}
                >
                  {num}
                </p>
                <p className="text-xs tracking-widest mt-1" style={{ color: '#555' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-xs tracking-widest" style={{ color: '#555' }}>ДООШ ГҮЙЛГЭХ</span>
          <div
            className="w-5 h-8 flex items-start justify-center pt-1"
            style={{ border: '1px solid #333', borderRadius: '10px' }}
          >
            <div
              className="w-1 h-2 rounded-full"
              style={{
                background: '#c9a84c',
                animation: 'scrollDot 2s ease infinite',
              }}
            />
          </div>
        </div>
      </section>

      {/* ===== PRODUCTS SECTION ===== */}
      <section id="products" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-[0.4em] mb-4" style={{ color: '#c9a84c' }}>
              — БҮТЭЭГДЭХҮҮН —
            </p>
            <h2
              className="text-6xl md:text-7xl font-black"
              style={{
                color: '#fff',
                fontFamily: "'Bebas Neue', Impact, sans-serif",
                letterSpacing: '0.1em',
              }}
            >
              БАРАА СОНГОХ
            </h2>
            <div className="w-20 h-0.5 mx-auto mt-4" style={{ background: 'linear-gradient(to right, transparent, #c9a84c, transparent)' }} />
          </div>

          {/* Filters */}
          <div className="mb-10 space-y-4">
            {/* Sport filter */}
            <div className="flex flex-wrap gap-2 justify-center">
              {FILTER_SPORTS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="px-4 py-2 text-xs font-bold tracking-widest transition-all duration-200"
                  style={{
                    background: filter === f ? '#c9a84c' : 'transparent',
                    color: filter === f ? '#000' : '#555',
                    border: filter === f ? '1px solid #c9a84c' : '1px solid #222',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
            {/* Status filter */}
            <div className="flex gap-2 justify-center">
              {['БҮГД', 'БЭЛЭН', 'ЗАХИАЛГААР'].map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className="px-4 py-2 text-xs font-bold tracking-widest transition-all duration-200"
                  style={{
                    background: statusFilter === f ? 'rgba(201,168,76,0.1)' : 'transparent',
                    color: statusFilter === f ? '#c9a84c' : '#444',
                    border: `1px solid ${statusFilter === f ? '#c9a84c' : '#1e1e1e'}`,
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Product grid */}
          {loading ? (
            <div className="flex justify-center items-center py-32">
              <div
                className="w-12 h-12 rounded-full border-2 animate-spin"
                style={{ borderColor: '#c9a84c', borderTopColor: 'transparent' }}
              />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-32" style={{ color: '#333' }}>
              <p
                className="text-8xl font-black mb-4"
                style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", color: '#1a1a1a' }}
              >
                ХООСОН
              </p>
              <p className="text-sm tracking-widest" style={{ color: '#444' }}>
                {products.length === 0 ? 'Одоогоор бараа байхгүй байна' : 'Энэ ангилалд бараа байхгүй'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOrder={setSelectedProduct}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== ABOUT SECTION ===== */}
      <section id="about" className="py-24 px-6 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(201,168,76,0.03) 0%, transparent 60%)',
          }}
        />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-bold tracking-[0.4em] mb-4" style={{ color: '#c9a84c' }}>
                — БИДНИЙ ТУХАЙ —
              </p>
              <h2
                className="font-black leading-none mb-6"
                style={{
                  fontFamily: "'Bebas Neue', Impact, sans-serif",
                  fontSize: 'clamp(40px, 8vw, 80px)',
                  color: '#fff',
                  letterSpacing: '0.05em',
                }}
              >
                ЗОГСОЛТГҮЙ<br />
                <span style={{ color: '#c9a84c' }}>ТЭМҮҮЛЭЛ</span>
              </h2>
              <p className="text-sm leading-relaxed mb-6" style={{ color: '#777', lineHeight: '1.8' }}>
                Relentless бол Монголын тамирчдад зориулсан премиум спортын брэнд. Бид чанар, загвар,
                тэсвэр тэвчээрийг нэгтгэсэн бүтээгдэхүүнийг Монголын зах зээлд нийлүүлдэг.
              </p>
              <p className="text-sm leading-relaxed" style={{ color: '#666', lineHeight: '1.8' }}>
                Таны спортын зорилгыг дэмжих, хамгийн сайн гүйцэтгэлд хүрэхэд тусалах — энэ бол
                бидний эрхэм зорилго.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '⚡', title: 'ӨНДӨР ЧАНАР', desc: 'Дэлхийн тэргүүлэгч материалаар хийгдсэн' },
                { icon: '🎯', title: 'ҮНЭН ЗӨВТ', desc: 'Тамирчдад зориулсан найдвартай дизайн' },
                { icon: '🚀', title: 'ХУРДАН ХҮРГЭЛТ', desc: 'Улаанбаатарт 1-2 хоногт хүргэнэ' },
                { icon: '💎', title: 'ОНЦГОЙ ЗАГВАР', desc: 'Монгол хэв маягийн уламжлалт загвар' },
              ].map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="p-5 transition-all duration-300"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid #1a1a1a',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#c9a84c')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1a1a1a')}
                >
                  <div className="text-2xl mb-3">{icon}</div>
                  <p className="font-black text-sm tracking-wider mb-1" style={{ color: '#fff', fontFamily: "'Bebas Neue', Impact, sans-serif" }}>
                    {title}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: '#555' }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTACT SECTION ===== */}
      <section id="contact" className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-bold tracking-[0.4em] mb-4" style={{ color: '#c9a84c' }}>
            — ХОЛБОО БАРИХ —
          </p>
          <h2
            className="font-black mb-8"
            style={{
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              fontSize: 'clamp(36px, 6vw, 64px)',
              color: '#fff',
              letterSpacing: '0.1em',
            }}
          >
            БИДЭНТЭЙ ХОЛБОГДОХ
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                ),
                label: 'ИНСТАГРАМ',
                value: '@relentless.mn',
                href: 'https://instagram.com/relentless.mn',
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.932z" />
                  </svg>
                ),
                label: 'ТЕЛЕГРАМ',
                value: '@relentless_mn',
                href: 'https://t.me/relentless_mn',
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                  </svg>
                ),
                label: 'УТАС',
                value: '9911-XXXX',
                href: 'tel:+97699110000',
              },
            ].map(({ icon, label, value, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-6 text-center transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1a1a1a', color: '#888' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#c9a84c'; e.currentTarget.style.color = '#c9a84c'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.color = '#888'; }}
              >
                <div className="flex justify-center mb-3">{icon}</div>
                <p className="text-xs font-black tracking-widest mb-1" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>
                  {label}
                </p>
                <p className="text-xs">{value}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer
        className="py-10 px-6 text-center"
        style={{ borderTop: '1px solid #111' }}
      >
        <p
          className="text-3xl font-black tracking-widest mb-3"
          style={{ color: '#1a1a1a', fontFamily: "'Bebas Neue', Impact, sans-serif" }}
        >
          RELENTLESS
        </p>
        <p className="text-xs" style={{ color: '#333', letterSpacing: '0.2em' }}>
          © 2025 RELENTLESS. БҮХИЙ Л ЭРХ ХАМГААЛАГДСАН.
        </p>
      </footer>

      {/* ===== CHECKOUT MODAL ===== */}
      {selectedProduct && (
        <CheckoutModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* ===== ADMIN LOGIN MODAL ===== */}
      {showAdminLogin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.97)', backdropFilter: 'blur(10px)' }}
          onClick={(e) => e.target === e.currentTarget && setShowAdminLogin(false)}
        >
          <div
            className="w-full max-w-sm p-8"
            style={{
              background: 'linear-gradient(145deg, #111, #0a0a0a)',
              border: '1px solid #333',
            }}
          >
            <h2
              className="text-3xl font-black text-center mb-2"
              style={{ color: '#fff', fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.1em' }}
            >
              АДМИН НЭВТРЭХ
            </h2>
            <p className="text-center text-xs mb-6 tracking-widest" style={{ color: '#444' }}>
              НЭВТРЭХ КОД ОРУУЛНА УУ
            </p>
            <input
              type="password"
              value={adminCode}
              onChange={(e) => { setAdminCode(e.target.value); setAdminError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
              placeholder="• • • •"
              className="w-full px-4 py-3 text-center text-xl tracking-widest mb-4 bg-transparent outline-none text-white"
              style={{ border: '1px solid #2a2a2a', letterSpacing: '0.5em' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#c9a84c')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#2a2a2a')}
              autoFocus
            />
            {adminError && (
              <p className="text-xs text-center mb-4" style={{ color: '#ef4444' }}>{adminError}</p>
            )}
            <button
              onClick={handleAdminLogin}
              className="w-full py-4 font-black text-sm tracking-widest transition-all duration-200"
              style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c96d)', color: '#000', letterSpacing: '0.2em' }}
            >
              НЭВТРЭХ
            </button>
            <button
              onClick={() => { setShowAdminLogin(false); setAdminCode(''); setAdminError(''); }}
              className="w-full py-3 mt-2 text-xs font-bold tracking-widest"
              style={{ color: '#444' }}
            >
              БОЛИХ
            </button>
          </div>
        </div>
      )}

      {/* Scroll animation keyframe */}
      <style>{`
        @keyframes scrollDot {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(16px); opacity: 0; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #080808; }
        ::-webkit-scrollbar-thumb { background: #c9a84c; border-radius: 2px; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
