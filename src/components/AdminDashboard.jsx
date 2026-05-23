import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

const SPORT_CATEGORIES = ['Гүйлт', 'Уулын дугуй', 'Фитнесс', 'Спортын бөмбөг', 'Дайчлал', 'Усан спорт', 'Бусад'];
const FUNCTION_CATEGORIES = ['Дээд хэсэг', 'Доод хэсэг', 'Гутал', 'Малгай', 'Хамгаалах хэрэгсэл', 'Аксессуар'];
const STATUS_LABELS = { pending: '⏳ Хүлээгдэж байна', confirmed: '✅ Баталгаажсан', delivered: '🚚 Хүргэгдсэн' };

export default function AdminDashboard({ onLogout }) {
  const [tab, setTab] = useState('orders');
  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  // Products state
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', price: '', sport_category: '', function_category: '',
    stock: '', status: 'available', description: '', image_url: '',
  });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Live orders subscription
  useEffect(() => {
    fetchOrders();
    fetchProducts();
    const channel = supabase
      .channel('orders-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setOrdersLoading(false);
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts(data || []);
    setProductsLoading(false);
  };

  const updateOrderStatus = async (id, status) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    fetchOrders();
  };

  const deleteOrder = async (id) => {
    await supabase.from('orders').delete().eq('id', id);
    setDeleteConfirm(null);
    fetchOrders();
  };

  const openAddProduct = () => {
    setEditProduct(null);
    setProductForm({ name: '', price: '', sport_category: '', function_category: '', stock: '', status: 'available', description: '', image_url: '' });
    setShowAddProduct(true);
  };

  const openEditProduct = (p) => {
    setEditProduct(p);
    setProductForm({
      name: p.name || '', price: p.price || '', sport_category: p.sport_category || '',
      function_category: p.function_category || '', stock: p.stock ?? '', status: p.status || 'available',
      description: p.description || '', image_url: p.image_url || '',
    });
    setShowAddProduct(true);
  };

  const saveProduct = async () => {
    if (!productForm.name.trim() || !productForm.price) {
      setSaveMsg('❌ Нэр болон үнэ заавал оруулна уу.'); return;
    }
    setSaving(true);
    const payload = {
      name: productForm.name.trim(),
      price: parseFloat(productForm.price),
      sport_category: productForm.sport_category,
      function_category: productForm.function_category,
      stock: productForm.stock !== '' ? parseInt(productForm.stock) : null,
      status: productForm.status,
      description: productForm.description.trim(),
      image_url: productForm.image_url.trim(),
    };
    if (editProduct) {
      await supabase.from('products').update(payload).eq('id', editProduct.id);
    } else {
      await supabase.from('products').insert([payload]);
    }
    setSaving(false);
    setSaveMsg('✅ Хадгалагдлаа!');
    fetchProducts();
    setTimeout(() => { setSaveMsg(''); setShowAddProduct(false); }, 1200);
  };

  const deleteProduct = async (id) => {
    await supabase.from('products').delete().eq('id', id);
    setDeleteConfirm(null);
    fetchProducts();
  };

  const inputStyle = {
    background: '#0d0d0d',
    border: '1px solid #2a2a2a',
    color: '#fff',
    padding: '10px 14px',
    fontSize: '13px',
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.2s',
  };

  return (
    <div className="min-h-screen" style={{ background: '#080808', color: '#fff' }}>
      {/* Top bar */}
      <div
        className="sticky top-0 z-20 px-6 py-4 flex items-center justify-between"
        style={{ background: 'rgba(10,10,10,0.98)', borderBottom: '1px solid #1e1e1e', backdropFilter: 'blur(10px)' }}
      >
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs tracking-widest" style={{ color: '#c9a84c' }}>RELENTLESS</p>
            <h1
              className="text-2xl font-black"
              style={{ color: '#fff', fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.1em' }}
            >
              АДМИН ПАНЕЛЬ
            </h1>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="px-4 py-2 text-xs font-bold tracking-widest transition-all duration-200"
          style={{ border: '1px solid #333', color: '#666' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#c9a84c'; e.currentTarget.style.color = '#c9a84c'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#666'; }}
        >
          ГАРАХ
        </button>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-6 flex gap-1" style={{ borderBottom: '1px solid #1e1e1e' }}>
        {[{ key: 'orders', label: 'ЗАХИАЛГЫН ЖАГСААЛТ' }, { key: 'products', label: 'БАРАА УДИРДЛАГА' }].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-6 py-3 text-xs font-black tracking-widest transition-all duration-200"
            style={{
              background: tab === t.key ? '#c9a84c' : 'transparent',
              color: tab === t.key ? '#000' : '#666',
              borderBottom: tab === t.key ? '2px solid #c9a84c' : '2px solid transparent',
            }}
          >
            {t.label}
            {t.key === 'orders' && orders.filter(o => o.status === 'pending').length > 0 && (
              <span
                className="ml-2 px-2 py-0.5 text-xs rounded-full font-black"
                style={{ background: tab === 'orders' ? '#000' : '#c9a84c', color: tab === 'orders' ? '#c9a84c' : '#000' }}
              >
                {orders.filter(o => o.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* ===== ORDERS TAB ===== */}
        {tab === 'orders' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black tracking-widest" style={{ color: '#c9a84c', fontFamily: "'Bebas Neue', Impact, sans-serif" }}>
                НИЙТ {orders.length} ЗАХИАЛГА
              </h2>
              <button
                onClick={fetchOrders}
                className="px-4 py-2 text-xs font-bold tracking-widest transition-all duration-200"
                style={{ border: '1px solid #333', color: '#666' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#c9a84c'; e.currentTarget.style.color = '#c9a84c'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#666'; }}
              >
                🔄 ШИНЭЧЛЭХ
              </button>
            </div>

            {ordersLoading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#c9a84c', borderTopColor: 'transparent' }} />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20" style={{ color: '#333' }}>
                <p className="text-6xl mb-4" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>0</p>
                <p className="text-sm tracking-widest">ЗАХИАЛГА БАЙХГҮЙ</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 transition-all duration-200"
                    style={{
                      background: 'linear-gradient(145deg, #0f0f0f, #0a0a0a)',
                      border: order.status === 'pending' ? '1px solid rgba(201,168,76,0.4)' : '1px solid #1e1e1e',
                      boxShadow: order.status === 'pending' ? '0 0 20px rgba(201,168,76,0.05)' : 'none',
                    }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="text-xl font-black"
                          style={{ color: '#c9a84c', fontFamily: "'Bebas Neue', Impact, sans-serif" }}
                        >
                          #{order.order_number}
                        </span>
                        <span
                          className="px-2 py-1 text-xs font-bold tracking-widest"
                          style={{
                            background: order.status === 'pending' ? 'rgba(251,191,36,0.1)' : order.status === 'confirmed' ? 'rgba(52,211,153,0.1)' : 'rgba(99,102,241,0.1)',
                            color: order.status === 'pending' ? '#fbbf24' : order.status === 'confirmed' ? '#34d399' : '#818cf8',
                            border: `1px solid ${order.status === 'pending' ? '#fbbf24' : order.status === 'confirmed' ? '#34d399' : '#818cf8'}`,
                          }}
                        >
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: '#555' }}>
                        {new Date(order.created_at).toLocaleString('mn-MN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4 text-sm">
                      <div>
                        <p className="text-xs tracking-widest mb-1" style={{ color: '#555' }}>ЗАХИАЛАГЧ</p>
                        <p className="text-white font-bold">{order.user_name}</p>
                        <p style={{ color: '#c9a84c' }}>{order.phone}</p>
                        {order.instagram && <p style={{ color: '#888' }}>@{order.instagram}</p>}
                      </div>
                      <div>
                        <p className="text-xs tracking-widest mb-1" style={{ color: '#555' }}>БАРАА</p>
                        <p className="text-white font-bold">{order.product_name}</p>
                        <p style={{ color: '#888' }}>Хэмжээ: {order.size}</p>
                        <p className="font-black" style={{ color: '#c9a84c' }}>{order.price?.toLocaleString()}₮</p>
                      </div>
                      <div>
                        <p className="text-xs tracking-widest mb-1" style={{ color: '#555' }}>ХАЯГ</p>
                        <p className="text-white">УБ, {order.district} дүүрэг</p>
                        <p style={{ color: '#888' }} className="text-xs">{order.address}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {order.status !== 'confirmed' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'confirmed')}
                          className="px-4 py-2 text-xs font-bold tracking-widest transition-all duration-200"
                          style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid #34d399', color: '#34d399' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(52,211,153,0.2)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(52,211,153,0.1)')}
                        >
                          ✅ БАТАЛГААЖУУЛАХ
                        </button>
                      )}
                      {order.status !== 'delivered' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="px-4 py-2 text-xs font-bold tracking-widest transition-all duration-200"
                          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid #818cf8', color: '#818cf8' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(99,102,241,0.2)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(99,102,241,0.1)')}
                        >
                          🚚 ХҮРГЭГДСЭН
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteConfirm({ type: 'order', id: order.id, label: `#${order.order_number}` })}
                        className="px-4 py-2 text-xs font-bold tracking-widest transition-all duration-200 ml-auto"
                        style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid #333', color: '#555' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#555'; }}
                      >
                        🗑 УСТГАХ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== PRODUCTS TAB ===== */}
        {tab === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black tracking-widest" style={{ color: '#c9a84c', fontFamily: "'Bebas Neue', Impact, sans-serif" }}>
                НИЙТ {products.length} БАРАА
              </h2>
              <button
                onClick={openAddProduct}
                className="px-5 py-3 text-xs font-black tracking-widest transition-all duration-200"
                style={{ background: '#c9a84c', color: '#000', letterSpacing: '0.15em' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#e8c96d')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#c9a84c')}
              >
                + БАРАА НЭМЭХ
              </button>
            </div>

            {productsLoading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: '#c9a84c', borderTopColor: 'transparent' }} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 transition-all duration-200"
                    style={{ background: 'linear-gradient(145deg, #0f0f0f, #0a0a0a)', border: '1px solid #1e1e1e' }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#2a2a2a')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1e1e1e')}
                  >
                    {p.image_url && (
                      <img src={p.image_url} alt={p.name} className="w-full h-40 object-cover mb-3" />
                    )}
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-white font-bold" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '16px' }}>{p.name}</p>
                        <p className="text-xs" style={{ color: '#555' }}>{p.sport_category} · {p.function_category}</p>
                      </div>
                      <span
                        className="text-xs px-2 py-0.5 font-bold"
                        style={{
                          background: p.status === 'available' ? 'rgba(52,211,153,0.1)' : 'rgba(251,191,36,0.1)',
                          color: p.status === 'available' ? '#34d399' : '#fbbf24',
                          border: `1px solid ${p.status === 'available' ? '#34d399' : '#fbbf24'}`,
                        }}
                      >
                        {p.status === 'available' ? 'БЭЛЭН' : 'ЗАХИАЛГААР'}
                      </span>
                    </div>
                    <p className="font-black text-lg mb-1" style={{ color: '#c9a84c', fontFamily: "'Bebas Neue', Impact, sans-serif" }}>
                      {p.price?.toLocaleString()}₮
                    </p>
                    {p.stock !== null && <p className="text-xs mb-3" style={{ color: '#555' }}>Үлдэгдэл: {p.stock} ш</p>}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => openEditProduct(p)}
                        className="flex-1 py-2 text-xs font-bold tracking-widest transition-all duration-200"
                        style={{ border: '1px solid #c9a84c', color: '#c9a84c', background: 'transparent' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,168,76,0.1)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        ✏ ЗАСАХ
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ type: 'product', id: p.id, label: p.name })}
                        className="px-4 py-2 text-xs font-bold transition-all duration-200"
                        style={{ border: '1px solid #333', color: '#555', background: 'transparent' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#555'; }}
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== ADD/EDIT PRODUCT MODAL ===== */}
      {showAddProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(10px)' }}
        >
          <div
            className="w-full max-w-lg overflow-y-auto"
            style={{ background: 'linear-gradient(145deg, #111, #0a0a0a)', border: '1px solid #c9a84c', maxHeight: '90vh' }}
          >
            <div className="sticky top-0 px-6 py-4 flex items-center justify-between" style={{ background: '#111', borderBottom: '1px solid #1e1e1e' }}>
              <h3 className="font-black text-xl tracking-widest" style={{ color: '#c9a84c', fontFamily: "'Bebas Neue', Impact, sans-serif" }}>
                {editProduct ? 'БАРАА ЗАСАХ' : 'ШИНЭ БАРАА НЭМЭХ'}
              </h3>
              <button onClick={() => setShowAddProduct(false)} style={{ color: '#666' }}>✕</button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'БАРААНЫ НЭР *', key: 'name', type: 'text', placeholder: 'Жишээ: Pro Running Jacket' },
                { label: 'ҮНЭ (₮) *', key: 'price', type: 'number', placeholder: '150000' },
                { label: 'ЗУРГИЙН URL', key: 'image_url', type: 'text', placeholder: 'https://...' },
                { label: 'ҮЛДЭГДЭЛ (ш)', key: 'stock', type: 'number', placeholder: '10' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: '#c9a84c' }}>{label}</label>
                  <input
                    type={type}
                    value={productForm[key]}
                    onChange={(e) => setProductForm(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#c9a84c')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = '#2a2a2a')}
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: '#c9a84c' }}>СПОРТЫН АНГИЛАЛ</label>
                <select
                  value={productForm.sport_category}
                  onChange={(e) => setProductForm(prev => ({ ...prev, sport_category: e.target.value }))}
                  style={{ ...inputStyle }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#c9a84c')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#2a2a2a')}
                >
                  <option value="">Сонгоно уу</option>
                  {SPORT_CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#111' }}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: '#c9a84c' }}>ХЭРЭГЛЭЭНИЙ АНГИЛАЛ</label>
                <select
                  value={productForm.function_category}
                  onChange={(e) => setProductForm(prev => ({ ...prev, function_category: e.target.value }))}
                  style={{ ...inputStyle }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#c9a84c')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#2a2a2a')}
                >
                  <option value="">Сонгоно уу</option>
                  {FUNCTION_CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#111' }}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: '#c9a84c' }}>СТАТУС</label>
                <div className="flex gap-3">
                  {[{ v: 'available', l: '✅ БЭЛЭН' }, { v: 'preorder', l: '⏳ ЗАХИАЛГААР' }].map(({ v, l }) => (
                    <button
                      key={v}
                      onClick={() => setProductForm(prev => ({ ...prev, status: v }))}
                      className="flex-1 py-3 text-xs font-bold tracking-widest transition-all duration-200"
                      style={{
                        background: productForm.status === v ? (v === 'available' ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.15)') : 'transparent',
                        border: `1px solid ${productForm.status === v ? (v === 'available' ? '#34d399' : '#fbbf24') : '#333'}`,
                        color: productForm.status === v ? (v === 'available' ? '#34d399' : '#fbbf24') : '#555',
                      }}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: '#c9a84c' }}>ТАЙЛБАР</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Барааны тайлбар..."
                  rows={3}
                  style={{ ...inputStyle, resize: 'none' }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#c9a84c')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#2a2a2a')}
                />
              </div>

              {saveMsg && (
                <div
                  className="px-4 py-3 text-sm font-bold"
                  style={{
                    background: saveMsg.startsWith('✅') ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)',
                    border: `1px solid ${saveMsg.startsWith('✅') ? '#34d399' : '#ef4444'}`,
                    color: saveMsg.startsWith('✅') ? '#34d399' : '#ef4444',
                  }}
                >
                  {saveMsg}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddProduct(false)}
                  className="flex-1 py-3 text-xs font-bold tracking-widest"
                  style={{ border: '1px solid #333', color: '#666' }}
                >
                  БОЛИХ
                </button>
                <button
                  onClick={saveProduct}
                  disabled={saving}
                  className="flex-1 py-3 text-xs font-black tracking-widest transition-all duration-200"
                  style={{ background: saving ? '#555' : '#c9a84c', color: '#000', letterSpacing: '0.15em' }}
                >
                  {saving ? 'ХАДГАЛЖ БАЙНА...' : 'ХАДГАЛАХ'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== DELETE CONFIRM MODAL ===== */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.95)' }}
        >
          <div
            className="w-full max-w-sm p-6 text-center"
            style={{ background: '#111', border: '1px solid #ef4444' }}
          >
            <p className="text-4xl mb-4">⚠️</p>
            <h3 className="text-lg font-black mb-2 text-white" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>
              УСТГАХ УУ?
            </h3>
            <p className="text-sm mb-6" style={{ color: '#888' }}>
              <span style={{ color: '#ef4444' }}>{deleteConfirm.label}</span>-г устгах гэж байна. Энэ үйлдлийг буцаах боломжгүй.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 text-xs font-bold tracking-widest"
                style={{ border: '1px solid #333', color: '#666' }}
              >
                БОЛИХ
              </button>
              <button
                onClick={() => deleteConfirm.type === 'order' ? deleteOrder(deleteConfirm.id) : deleteProduct(deleteConfirm.id)}
                className="flex-1 py-3 text-xs font-black tracking-widest"
                style={{ background: '#ef4444', color: '#fff' }}
              >
                УСТГАХ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
