import { useState } from 'react';
import { supabase } from '../supabaseClient';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const DISTRICTS = [
  'Баянгол', 'Баянзүрх', 'Хан-Уул', 'Чингэлтэй',
  'Сонгинохайрхан', 'Налайх', 'Багануур', 'Багахангай',
];

async function sendTelegramNotification(orderData) {
  const token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const message =
    `🚨 *ШИНЭ ЗАХИАЛГА ИРЛЭЭ!* #${orderData.order_number}\n\n` +
    `• *Бараа:* ${orderData.product_name} (Хэмжээ: ${orderData.size})\n` +
    `• *Төлөв:* ${orderData.product_status === 'available' ? '✅ Бэлэн' : '⏳ Захиалгаар'}\n` +
    `• *Үнэ:* ${orderData.price?.toLocaleString()} ₮\n` +
    `• *Захиалагч:* ${orderData.user_name}\n` +
    `• *Утас:* ${orderData.phone}\n` +
    `• *Инстаграм:* @${orderData.instagram || '—'}\n` +
    `• *Хаяг:* Улаанбаатар, ${orderData.district}, ${orderData.address}`;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });
  } catch (e) {
    console.error('Telegram notification failed:', e);
  }
}

export default function CheckoutModal({ product, onClose }) {
  const [form, setForm] = useState({
    user_name: '',
    phone: '',
    instagram: '',
    size: '',
    district: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null); // { order_number }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async () => {
    if (!form.user_name.trim()) return setError('Нэрээ оруулна уу.');
    if (!form.phone.trim() || form.phone.length < 8) return setError('Утасны дугаараа зөв оруулна уу.');
    if (!form.size) return setError('Хэмжээ сонгоно уу.');
    if (!form.district) return setError('Дүүрэг сонгоно уу.');
    if (!form.address.trim()) return setError('Дэлгэрэнгүй хаягаа оруулна уу.');

    setLoading(true);
    try {
      const { data, error: insertError } = await supabase
        .from('orders')
        .insert([
          {
            user_name: form.user_name.trim(),
            phone: form.phone.trim(),
            instagram: form.instagram.trim(),
            product_name: product.name,
            product_id: product.id,
            size: form.size,
            price: product.price,
            city: 'Улаанбаатар',
            district: form.district,
            address: form.address.trim(),
            status: 'pending',
            product_status: product.status,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      // Send Telegram notification
      await sendTelegramNotification(data);

      setSuccess({ order_number: data.order_number, id: data.id });
    } catch (err) {
      console.error(err);
      setError('Захиалга илгээхэд алдаа гарлаа. Дахин оролдоно уу.');
    } finally {
      setLoading(false);
    }
  };

  const instagramDM = () => {
    window.open('https://www.instagram.com/direct/inbox/', '_blank');
  };

  if (success) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(10px)' }}
      >
        <div
          className="w-full max-w-md p-8 relative text-center"
          style={{
            background: 'linear-gradient(145deg, #111, #0d0d0d)',
            border: '1px solid #c9a84c',
            boxShadow: '0 0 60px rgba(201,168,76,0.2)',
          }}
        >
          {/* Animated checkmark */}
          <div className="flex justify-center mb-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.05))',
                border: '2px solid #c9a84c',
                boxShadow: '0 0 30px rgba(201,168,76,0.3)',
              }}
            >
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path d="M8 18 L15 25 L28 11" stroke="#c9a84c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <h2
            className="text-3xl font-black mb-2"
            style={{ color: '#c9a84c', fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.1em' }}
          >
            ЗАХИАЛГА АМЖИЛТТАЙ!
          </h2>
          <p className="text-gray-400 mb-6 text-sm">Таны захиалгыг хүлээн авлаа. Удахгүй холбогдох болно.</p>

          {/* Order number highlight */}
          <div
            className="p-5 mb-6"
            style={{
              background: 'rgba(201,168,76,0.08)',
              border: '1px solid rgba(201,168,76,0.3)',
            }}
          >
            <p className="text-gray-400 text-xs tracking-widest mb-2">ЗАХИАЛГЫН ДУГААР</p>
            <p
              className="text-5xl font-black"
              style={{ color: '#c9a84c', fontFamily: "'Bebas Neue', Impact, sans-serif" }}
            >
              #{success.order_number}
            </p>
          </div>

          {/* Payment instructions */}
          <div
            className="p-4 mb-6 text-left"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #222' }}
          >
            <p className="text-xs font-bold tracking-widest mb-3" style={{ color: '#c9a84c' }}>
              💳 ГҮЙЛГЭЭНИЙ УТГА
            </p>
            <p className="text-sm text-white font-bold">
              Захиалга #{success.order_number} — {form.phone}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Төлбөр шилжүүлэхдээ гүйлгээний утга дээр дээрх мэдээллийг бичнэ үү.
            </p>
          </div>

          {/* Instagram DM instruction */}
          <div
            className="p-4 mb-6 text-left"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #222' }}
          >
            <p className="text-xs font-bold tracking-widest mb-3" style={{ color: '#c9a84c' }}>
              📩 ИНСТАГРАМ МЭДЭГДЭЛ
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Доорх товчийг дараад манай хуудас руу орж дараах мессежийг илгээнэ үү:
            </p>
            <div
              className="mt-3 p-3 text-sm font-bold"
              style={{ background: 'rgba(201,168,76,0.1)', color: '#fff', border: '1px solid rgba(201,168,76,0.2)' }}
            >
              "Захиалга #{success.order_number} төлбөрөө шилжүүллээ"
            </div>
          </div>

          <button
            onClick={instagramDM}
            className="w-full py-4 font-black text-sm tracking-widest mb-3 transition-all duration-300 flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #c9a84c, #e8c96d)',
              color: '#000',
              letterSpacing: '0.15em',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            ИНСТАГРАМ DM ИЛГЭЭХ
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 text-sm font-bold tracking-widest transition-all duration-300"
            style={{ background: 'transparent', color: '#666', border: '1px solid #333' }}
          >
            ХААХ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(10px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #111, #0a0a0a)',
          border: '1px solid #c9a84c',
          boxShadow: '0 0 80px rgba(201,168,76,0.1)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 px-6 py-5 flex items-center justify-between"
          style={{ background: 'linear-gradient(90deg, #111, #0d0d0d)', borderBottom: '1px solid #1e1e1e' }}
        >
          <div>
            <p className="text-xs tracking-widest" style={{ color: '#c9a84c' }}>RELENTLESS</p>
            <h2
              className="text-2xl font-black"
              style={{ color: '#fff', fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.1em' }}
            >
              ЗАХИАЛГА ХИЙХ
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center transition-colors duration-200"
            style={{ color: '#666', border: '1px solid #222' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#c9a84c')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#666')}
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {/* Product summary */}
          <div
            className="flex gap-4 p-4 mb-6"
            style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)' }}
          >
            {product.image_url && (
              <img src={product.image_url} alt={product.name} className="w-20 h-20 object-cover flex-shrink-0" />
            )}
            <div>
              <p className="text-white font-bold text-lg" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>
                {product.name}
              </p>
              <p
                className="text-2xl font-black"
                style={{ color: '#c9a84c', fontFamily: "'Bebas Neue', Impact, sans-serif" }}
              >
                {product.price?.toLocaleString()}₮
              </p>
              <span
                className="text-xs px-2 py-0.5 mt-1 inline-block font-bold tracking-widest"
                style={{
                  background: product.status === 'available' ? 'rgba(52,211,153,0.1)' : 'rgba(251,191,36,0.1)',
                  color: product.status === 'available' ? '#34d399' : '#fbbf24',
                  border: `1px solid ${product.status === 'available' ? '#34d399' : '#fbbf24'}`,
                }}
              >
                {product.status === 'available' ? 'БЭЛЭН' : 'ЗАХИАЛГААР'}
              </span>
            </div>
          </div>

          {/* Size selection */}
          <div className="mb-5">
            <label className="block text-xs font-bold tracking-widest mb-3" style={{ color: '#c9a84c' }}>
              ХЭМЖЭЭ *
            </label>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setForm((prev) => ({ ...prev, size: sz }))}
                  className="px-4 py-2 text-sm font-bold tracking-wider transition-all duration-200"
                  style={{
                    background: form.size === sz ? '#c9a84c' : 'transparent',
                    color: form.size === sz ? '#000' : '#888',
                    border: form.size === sz ? '1px solid #c9a84c' : '1px solid #333',
                  }}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-4 mb-5">
            <div>
              <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: '#c9a84c' }}>
                НЭР ОВОГ *
              </label>
              <input
                name="user_name"
                value={form.user_name}
                onChange={handleChange}
                placeholder="Жишээ: Болд Баатар"
                className="w-full px-4 py-3 text-sm bg-transparent outline-none text-white placeholder-gray-600 transition-colors duration-200"
                style={{ border: '1px solid #2a2a2a' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#c9a84c')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#2a2a2a')}
              />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: '#c9a84c' }}>
                УТАСНЫ ДУГААР *
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="9911 2233"
                type="tel"
                className="w-full px-4 py-3 text-sm bg-transparent outline-none text-white placeholder-gray-600 transition-colors duration-200"
                style={{ border: '1px solid #2a2a2a' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#c9a84c')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#2a2a2a')}
              />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: '#c9a84c' }}>
                ИНСТАГРАМ ХАЯГ
              </label>
              <div className="flex items-center" style={{ border: '1px solid #2a2a2a' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#c9a84c')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#2a2a2a')}
              >
                <span className="px-3 text-sm" style={{ color: '#555' }}>@</span>
                <input
                  name="instagram"
                  value={form.instagram}
                  onChange={handleChange}
                  placeholder="username"
                  className="flex-1 px-2 py-3 text-sm bg-transparent outline-none text-white placeholder-gray-600"
                  style={{ border: 'none' }}
                />
              </div>
            </div>

            {/* District */}
            <div>
              <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: '#c9a84c' }}>
                ДҮҮРЭГ *
              </label>
              <select
                name="district"
                value={form.district}
                onChange={handleChange}
                className="w-full px-4 py-3 text-sm outline-none text-white transition-colors duration-200"
                style={{
                  background: '#0d0d0d',
                  border: '1px solid #2a2a2a',
                  color: form.district ? '#fff' : '#666',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#c9a84c')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#2a2a2a')}
              >
                <option value="" style={{ color: '#666' }}>Дүүрэг сонгоно уу</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d} style={{ background: '#111', color: '#fff' }}>
                    {d} дүүрэг
                  </option>
                ))}
              </select>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: '#c9a84c' }}>
                ДЭЛГЭРЭНГҮЙ ХАЯГ *
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Хороо, байр, тоот, орцны код..."
                rows={3}
                className="w-full px-4 py-3 text-sm bg-transparent outline-none text-white placeholder-gray-600 resize-none transition-colors duration-200"
                style={{ border: '1px solid #2a2a2a' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#c9a84c')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#2a2a2a')}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="px-4 py-3 mb-4 text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444' }}
            >
              ⚠ {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 font-black text-sm tracking-widest transition-all duration-300 flex items-center justify-center gap-2"
            style={{
              background: loading ? '#555' : 'linear-gradient(135deg, #c9a84c, #e8c96d)',
              color: '#000',
              letterSpacing: '0.2em',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" />
                </svg>
                ИЛГЭЭЖ БАЙНА...
              </>
            ) : (
              'ЗАХИАЛГА ИЛГЭЭХ'
            )}
          </button>

          <p className="text-center text-xs mt-4" style={{ color: '#444' }}>
            * Захиалга илгээснээр таны утасны дугаарт холбогдох болно
          </p>
        </div>
      </div>
    </div>
  );
}
