// Kalyan-Ji Bakery — Main App Shell

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "bakerPhone": "",
  "accentColor": "#C8956C",
  "cardRadius": 16,
  "fontStyle": "serif",
  "showPricing": true
}/*EDITMODE-END*/;

function App() {
  const { useState, useEffect } = React;
  const [page, setPage] = useState('home');
  const [toasts, setToasts] = useState([]);
  const [savedCakes, setSavedCakes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kj_library') || '[]'); } catch { return []; }
  });
  const [editConfig, setEditConfig] = useState(null);

  // Tweaks
  const [tweaks, setTweakState] = useState(TWEAK_DEFAULTS);
  const setTweak = (keyOrObj, val) => {
    setTweakState(t => {
      const updates = typeof keyOrObj === 'object' ? keyOrObj : { [keyOrObj]: val };
      const next = { ...t, ...updates };
      window.parent.postMessage({ type: '__edit_mode_set_keys', edits: updates }, '*');
      // Apply accent color to CSS vars live
      if (updates.accentColor) {
        document.documentElement.style.setProperty('--caramel', updates.accentColor);
      }
      if (updates.cardRadius !== undefined) {
        document.documentElement.style.setProperty('--radius-md', updates.cardRadius + 'px');
      }
      return next;
    });
  };

  // Host tweaks protocol
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === '__activate_edit_mode') setShowTweaks(true);
      if (e.data?.type === '__deactivate_edit_mode') setShowTweaks(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  const [showTweaks, setShowTweaks] = useState(false);

  const showToast = (msg) => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  };

  const handleSaveCake = (data) => {
    const newCake = {
      id: 'user-' + Date.now(),
      name: data.name || 'My Cake',
      author: 'You',
      authorInitials: 'YO',
      isTemplate: false,
      rating: 0,
      ratingCount: 0,
      likes: 0,
      comments: [],
      config: data.config,
      description: data.description || '',
      image: data.image || null,
    };
    const updated = [...savedCakes, newCake];
    setSavedCakes(updated);
    try { localStorage.setItem('kj_library', JSON.stringify(updated)); } catch {}
    showToast('🎂 Cake saved to your library!');
    if (data.shareToLibrary) {
      setTimeout(() => setPage('library'), 600);
    }
  };

  const handleEditCake = (config) => {
    // If saved cake has a raw prompt, pass that; otherwise skip
    setEditConfig(config);
    setPage('builder');
    showToast('✎ Cake loaded for remixing');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--parchment)' }}>
      {/* Top nav */}
      <header style={{
        height: 58, flexShrink: 0, display: 'flex', alignItems: 'center',
        padding: '0 24px', background: 'var(--white)',
        borderBottom: '1px solid var(--parchment-dark)',
        gap: 24, position: 'relative', zIndex: 10,
      }}>
        {/* Logo */}
        <button onClick={() => setPage('home')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 10, padding: 0,
        }}>
          <LogoMark size={30} />
          <div style={{ lineHeight: 1.1 }}>
            <div style={{
              fontFamily: 'var(--font-serif)', fontSize: 14, fontWeight: 600,
              color: 'var(--ink)', letterSpacing: '0.01em',
            }}>Kalyan-Ji Bakery</div>
            <div style={{ fontSize: 9, color: 'var(--ink-light)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Cake Creators Programme
            </div>
          </div>
        </button>

        {/* Nav */}
        <nav style={{ display: 'flex', gap: 4, marginLeft: 16 }}>
          {[
            { id: 'home', label: 'Home' },
            { id: 'builder', label: 'Create' },
            { id: 'library', label: 'Library' },
          ].map(n => {
            const isActive = page === n.id;
            return (
              <button key={n.id} onClick={() => { setPage(n.id); if (n.id !== 'builder') setEditConfig(null); }}
                style={{
                  padding: '6px 16px', borderRadius: 50, border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  background: isActive ? 'var(--parchment-mid)' : 'transparent',
                  color: isActive ? 'var(--ink)' : 'var(--ink-light)',
                  transition: 'all 0.15s',
                }}>
                {n.label}
              </button>
            );
          })}
        </nav>

        {/* Right side */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          {savedCakes.length > 0 && page !== 'library' && (
            <button onClick={() => setPage('library')} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
              borderRadius: 50, border: '1.5px solid var(--parchment-dark)',
              background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)',
              fontSize: 12, color: 'var(--ink-mid)',
            }}>
              🎂 {savedCakes.length} saved
            </button>
          )}
          {page !== 'builder' && (
            <button className="btn btn-primary btn-sm" onClick={() => { setEditConfig(null); setPage('builder'); }}>
              + Create Cake
            </button>
          )}
        </div>
      </header>

      {/* Page content */}
      <main style={{ flex: 1, overflow: 'hidden' }}>
        {page === 'home' && <HomePage onStart={() => setPage('builder')} onLibrary={() => setPage('library')} />}
        {page === 'builder' && (
          <window.CakeBuilder
            onSave={handleSaveCake}
            initialConfig={editConfig}
            bakerPhone={tweaks.bakerPhone}
            key={editConfig ? JSON.stringify(editConfig) : 'default'}
          />
        )}
        {page === 'library' && (
          <window.CakeLibrary
            onEditCake={handleEditCake}
            userCakes={savedCakes}
            bakerPhone={tweaks.bakerPhone}
          />
        )}
      </main>

      {/* Toasts */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast">{t.msg}</div>
        ))}
      </div>

      {/* Tweaks Panel */}
      {showTweaks && (
        <TweaksPanel onClose={() => {
          setShowTweaks(false);
          window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*');
        }}>
          <TweakSection label="Bakery Contact">
            <TweakText
              label="Bakery WhatsApp Number"
              value={tweaks.bakerPhone}
              onChange={v => setTweak('bakerPhone', v)}
              placeholder="+447700900000"
            />
          </TweakSection>
          <TweakSection label="Appearance">
            <TweakColor
              label="Accent Colour"
              value={tweaks.accentColor}
              onChange={v => setTweak('accentColor', v)}
            />
            <TweakSlider
              label="Card Corner Radius"
              value={tweaks.cardRadius}
              min={0} max={32} step={2}
              onChange={v => setTweak('cardRadius', v)}
            />
            <TweakRadio
              label="Font Style"
              value={tweaks.fontStyle}
              options={['serif', 'sans']}
              onChange={v => {
                setTweak('fontStyle', v);
                document.documentElement.style.setProperty(
                  '--font-serif',
                  v === 'sans' ? "'DM Sans', system-ui, sans-serif" : "'Playfair Display', Georgia, serif"
                );
              }}
            />
          </TweakSection>
          <TweakSection label="Features">
            <TweakToggle
              label="Show pricing estimates"
              value={tweaks.showPricing}
              onChange={v => setTweak('showPricing', v)}
            />
          </TweakSection>
        </TweaksPanel>
      )}
    </div>
  );
}

// ── Home Page ──────────────────────────────────────────────

function HomePage({ onStart, onLibrary }) {
  const templates = window.TEMPLATE_CAKES.slice(0, 3);

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      {/* Hero */}
      <section style={{
        background: 'var(--ink)', color: 'var(--cream)',
        padding: '64px 48px', display: 'flex', alignItems: 'center',
        gap: 64, minHeight: 420,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', right: -80, top: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(201,169,110,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 60, bottom: -120, width: 280, height: 280, borderRadius: '50%', background: 'rgba(201,169,110,0.05)', pointerEvents: 'none' }} />

        <div style={{ flex: 1, maxWidth: 520, position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(201,169,110,0.15)', borderRadius: 50,
            padding: '5px 14px', marginBottom: 24,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)' }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)' }}>
              Cake Creators Programme
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 56, lineHeight: 1.05,
            fontWeight: 400, marginBottom: 20, textWrap: 'pretty',
          }}>
            Design your<br />
            <em style={{ color: 'var(--gold)' }}>dream cake</em>
          </h1>

          <p style={{ fontSize: 17, lineHeight: 1.65, color: 'rgba(255,248,238,0.75)', marginBottom: 36, maxWidth: 420 }}>
            Choose every detail — sponge, filling, frosting, and decoration — then let our AI inspire you. Share your creation with our community or place a bespoke order.
          </p>

          <div style={{ display: 'flex', gap: 14 }}>
            <button className="btn btn-gold" style={{ fontSize: 15, padding: '14px 32px' }} onClick={onStart}>
              Start Creating
            </button>
            <button onClick={onLibrary} style={{
              background: 'rgba(255,255,255,0.08)', color: 'var(--cream)',
              border: '1.5px solid rgba(255,255,255,0.2)',
              padding: '14px 28px', borderRadius: 50, cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500,
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            >
              Browse Library
            </button>
          </div>
        </div>

        {/* Hero cake previews */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: -30, flexShrink: 0 }}>
          {templates.map((t, i) => (
            <div key={t.id} style={{
              transform: `translateY(${i === 1 ? -20 : i === 2 ? 10 : 0}px) rotate(${i === 0 ? -4 : i === 2 ? 3 : 0}deg)`,
              marginLeft: i > 0 ? -24 : 0,
              filter: 'drop-shadow(0 16px 40px rgba(0,0,0,0.4))',
            }}>
              <window.IsometricCake config={t.config} size={160} />
            </div>
          ))}
        </div>
      </section>

      {/* Features strip */}
      <section style={{ padding: '40px 48px', background: 'var(--parchment-mid)', borderBottom: '1px solid var(--parchment-dark)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
          {[
            { icon: '🎨', title: 'Full Creative Control', body: 'Choose every layer — sponge, filling, frosting, and up to 10 decoration types.' },
            { icon: '✦', title: 'AI-Powered Design', body: 'Describe your vision in words and let our AI generate your perfect cake design.' },
            { icon: '🌸', title: 'Community Library', body: 'Share your creations, discover others\' designs, and rate your favourites.' },
            { icon: '📦', title: 'Place a Real Order', body: 'Share your design directly with the bakery via WhatsApp or email to order.' },
          ].map(f => (
            <div key={f.title}>
              <span style={{ fontSize: 28, display: 'block', marginBottom: 10 }}>{f.icon}</span>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--ink-mid)', lineHeight: 1.6 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured templates */}
      <section style={{ padding: '48px 48px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 600 }}>Start with a template</h2>
            <p style={{ fontSize: 14, color: 'var(--ink-light)', marginTop: 4 }}>Curated designs by Kalyan-Ji Bakery</p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onLibrary}>View all →</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {window.TEMPLATE_CAKES.map(t => (
            <FeaturedCard key={t.id} cake={t} onStart={onStart} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '24px 48px', borderTop: '1px solid var(--parchment-dark)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LogoMark size={22} />
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 13, color: 'var(--ink-mid)' }}>
            Kalyan-Ji Bakery © 2026
          </span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--ink-light)' }}>
          Crafted with love in London
        </p>
      </footer>
    </div>
  );
}

function FeaturedCard({ cake, onStart }) {
  const frostingColorData = window.CAKE_DATA.frostingColors.find(c => c.id === cake.config?.frostingColor) || { hex: '#FFF8EE' };
  return (
    <div className="card" style={{
      overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
      onClick={onStart}
    >
      <div style={{
        height: 160, background: `linear-gradient(135deg, ${frostingColorData.hex}44, var(--parchment))`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderBottom: '1px solid var(--parchment-dark)',
      }}>
        <window.IsometricCake config={cake.config} size={130} />
      </div>
      <div style={{ padding: '12px 14px' }}>
        <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{cake.name}</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color: 'var(--gold)', fontSize: 11 }}>{'★'.repeat(Math.round(cake.rating))}</span>
          <span style={{ fontSize: 11, color: 'var(--ink-light)' }}>{cake.rating} · Use as template</span>
        </div>
      </div>
    </div>
  );
}

// ── Logo Mark ──────────────────────────────────────────────

function LogoMark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#2C1A0E" />
      {/* Stylised cake tier */}
      <ellipse cx="16" cy="10" rx="9" ry="3" fill="#C9A96E" opacity="0.9" />
      <rect x="7" y="10" width="18" height="6" fill="#C9A96E" opacity="0.7" />
      <ellipse cx="16" cy="16" rx="9" ry="3" fill="#E8D5A8" opacity="0.9" />
      <rect x="10" y="16" width="12" height="5" fill="#C9A96E" opacity="0.6" />
      <ellipse cx="16" cy="21" rx="6" ry="2" fill="#E8D5A8" />
      {/* Candle */}
      <rect x="15" y="5" width="2" height="5" rx="1" fill="#FAF7F2" />
      <ellipse cx="16" cy="4" rx="1.5" ry="2" fill="#FFB300" opacity="0.9" />
    </svg>
  );
}

// ── Mount ──────────────────────────────────────────────────

const rootEl = document.getElementById('root');
const root = ReactDOM.createRoot(rootEl);
root.render(<App />);
