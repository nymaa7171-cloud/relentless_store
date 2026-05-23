import { useState } from 'react';

export default function ProductCard({ product, onOrder }) {
  const [hovered, setHovered] = useState(false);

  const statusLabel = product.status === 'available' ? 'БЭЛЭН' : 'ЗАХИАЛГААР';
  const statusColor = product.status === 'available' ? 'text-emerald-400' : 'text-amber-400';

  return (
    <div
      className={`relative group cursor-pointer transition-all duration-500 ${hovered ? 'scale-[1.02]' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? 'linear-gradient(145deg, #1a1a1a, #111)'
          : 'linear-gradient(145deg, #111, #0a0a0a)',
        border: hovered ? '1px solid #c9a84c' : '1px solid #2a2a2a',
        borderRadius: '2px',
        boxShadow: hovered
          ? '0 20px 60px rgba(201,168,76,0.15), inset 0 1px 0 rgba(201,168,76,0.1)'
          : '0 4px 20px rgba(0,0,0,0.4)',
      }}
    >
      {/* Gold corner accent */}
      <div className="absolute top-0 left-0 w-6 h-6 overflow-hidden z-10">
        <div style={{ width: '2px', height: '24px', background: '#c9a84c', position: 'absolute', top: 0, left: 0 }} />
        <div style={{ width: '24px', height: '2px', background: '#c9a84c', position: 'absolute', top: 0, left: 0 }} />
      </div>
      <div className="absolute bottom-0 right-0 w-6 h-6 overflow-hidden z-10">
        <div style={{ width: '2px', height: '24px', background: '#c9a84c', position: 'absolute', bottom: 0, right: 0 }} />
        <div style={{ width: '24px', height: '2px', background: '#c9a84c', position: 'absolute', bottom: 0, right: 0 }} />
      </div>

      {/* Product Image */}
      <div className="relative overflow-hidden" style={{ height: '280px' }}>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700"
            style={{ transform: hovered ? 'scale(1.08)' : 'scale(1)' }}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1a1a1a, #0d0d0d)' }}
          >
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              <path d="M10 20 L30 10 L50 20 L50 40 L30 50 L10 40 Z" stroke="#c9a84c" strokeWidth="1" fill="none" opacity="0.4" />
              <path d="M20 25 L30 20 L40 25 L40 35 L30 40 L20 35 Z" stroke="#c9a84c" strokeWidth="1" fill="none" opacity="0.6" />
            </svg>
          </div>
        )}
        {/* Overlay gradient */}
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)',
            opacity: hovered ? 1 : 0.6,
          }}
        />
        {/* Status badge */}
        <div
          className="absolute top-3 right-3 px-2 py-1 text-xs font-bold tracking-widest"
          style={{
            background: 'rgba(0,0,0,0.8)',
            border: `1px solid ${product.status === 'available' ? '#34d399' : '#fbbf24'}`,
            color: product.status === 'available' ? '#34d399' : '#fbbf24',
          }}
        >
          {statusLabel}
        </div>
        {/* Categories */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.sport_category && (
            <span
              className="px-2 py-1 text-xs font-bold tracking-widest"
              style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', color: '#c9a84c' }}
            >
              {product.sport_category}
            </span>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5">
        <h3
          className="text-white font-bold text-lg mb-1 tracking-wide"
          style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", letterSpacing: '0.1em' }}
        >
          {product.name}
        </h3>
        {product.function_category && (
          <p className="text-xs mb-3 tracking-widest" style={{ color: '#666' }}>
            {product.function_category}
          </p>
        )}
        {product.description && (
          <p className="text-sm mb-4 leading-relaxed" style={{ color: '#888' }}>
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p
              className="font-black text-2xl"
              style={{
                color: '#c9a84c',
                fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                letterSpacing: '0.05em',
              }}
            >
              {product.price?.toLocaleString()}₮
            </p>
            {product.stock !== null && product.stock !== undefined && (
              <p className="text-xs mt-1" style={{ color: '#555' }}>
                Үлдэгдэл: {product.stock} ш
              </p>
            )}
          </div>
          <button
            onClick={() => onOrder(product)}
            className="relative overflow-hidden px-5 py-3 text-sm font-black tracking-widest transition-all duration-300"
            style={{
              background: hovered ? '#c9a84c' : 'transparent',
              color: hovered ? '#000' : '#c9a84c',
              border: '1px solid #c9a84c',
              letterSpacing: '0.15em',
            }}
          >
            ЗАХИАЛАХ
          </button>
        </div>
      </div>
    </div>
  );
}
