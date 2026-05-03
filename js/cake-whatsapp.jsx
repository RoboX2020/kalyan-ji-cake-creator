// Kalyan-Ji Bakery — Shared WhatsApp Order Sheet
// Used by both the Builder and the Library

const CAKE_SIZES = [
  { id: 's6',  label: '6" Round',           servings: '6–8',   weight: '~1 kg'   },
  { id: 's8',  label: '8" Round',           servings: '12–16', weight: '~1.5 kg' },
  { id: 's10', label: '10" Round',          servings: '20–30', weight: '~2.5 kg' },
  { id: 's12', label: '12" Round',          servings: '30–40', weight: '~3.5 kg' },
  { id: 'sq8', label: '8" Square',          servings: '16–20', weight: '~2 kg'   },
  { id: 'sq10',label: '10" Square',         servings: '25–35', weight: '~3 kg'   },
  { id: 't2',  label: '2-Tier (6" + 8")',   servings: '20–30', weight: '~2.5 kg' },
  { id: 't3',  label: '3-Tier (6"+8"+10")', servings: '40–55', weight: '~5 kg'   },
];

function WhatsAppOrderSheet({ cake, onClose, bakerPhone }) {
  const { useState } = React;
  const [selectedSize, setSelectedSize] = useState('s8');
  const [name, setName]           = useState('');
  const [date, setDate]           = useState('');
  const [note, setNote]           = useState('');
  const [sent, setSent]           = useState(false);

  const size     = CAKE_SIZES.find(s => s.id === selectedSize);
  const prompt   = cake?.config?._rawPrompt || cake?.description || cake?.name || '';
  const image    = cake?.image || null;
  const cakeName = cake?.name  || 'Custom Cake';

  const buildMessage = () => {
    const lines = [
      '🎂 *Cake Order Enquiry — Kalyan-Ji Bakery*',
      '',
      `*Cake:* ${cakeName}`,
    ];
    if (prompt && prompt !== cakeName) lines.push(`*Description:* ${prompt}`);
    lines.push(
      '',
      `*Size:* ${size?.label}`,
      `*Serves:* ${size?.servings} people`,
      `*Weight:* ${size?.weight}`,
    );
    if (name) lines.push(`*Name on cake:* ${name}`);
    if (date) lines.push(`*Required by:* ${new Date(date).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}`);
    if (note) lines.push('', `*Notes:* ${note}`);
    lines.push('', '_Sent via Kalyan-Ji Cake Creator_ 🎂');
    return lines.join('\n');
  };

  const handleSend = () => {
    const msg   = buildMessage();
    const enc   = encodeURIComponent(msg);
    const phone = (bakerPhone || '').replace(/\D/g, '');
    // Use wa.me — works on mobile (opens app) and desktop (opens web.whatsapp.com)
    // Must be called synchronously (no await before it) so browser allows the popup
    const url   = phone
      ? `https://wa.me/${phone}?text=${enc}`
      : `https://wa.me/?text=${enc}`;
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(44,26,14,0.52)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1100, backdropFilter: 'blur(5px)',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'var(--white)', borderRadius: 24, width: 500,
        maxHeight: '92vh', overflowY: 'auto',
        boxShadow: '0 24px 80px rgba(44,26,14,0.24)',
        border: '1px solid var(--parchment-dark)',
      }}>

        {/* Header */}
        <div style={{
          padding: '22px 26px 16px',
          borderBottom: '1px solid var(--parchment-dark)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>
              Order via WhatsApp
            </h3>
            <p style={{ fontSize: 12, color: 'var(--ink-light)' }}>
              Pick your size, add details — we'll format the message
            </p>
          </div>
          <button onClick={onClose} className="btn-icon">✕</button>
        </div>

        <div style={{ padding: '18px 26px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Cake preview row */}
          <div style={{ display: 'flex', gap: 14, alignItems: 'center',
            background: 'var(--parchment)', borderRadius: 12, padding: '12px 14px',
            border: '1px solid var(--parchment-dark)',
          }}>
            {image ? (
              <img src={image} alt={cakeName} style={{
                width: 60, height: 60, borderRadius: 10, objectFit: 'cover',
                border: '1px solid var(--parchment-dark)', flexShrink: 0,
              }} />
            ) : (
              <div style={{
                width: 60, height: 60, borderRadius: 10, background: 'var(--parchment-dark)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, flexShrink: 0,
              }}>🎂</div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontFamily: 'var(--font-serif)', fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>
                {cakeName}
              </p>
              {prompt && prompt !== cakeName && (
                <p style={{
                  fontSize: 11.5, color: 'var(--ink-light)', lineHeight: 1.5,
                  overflow: 'hidden', display: '-webkit-box',
                  WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                }}>
                  {prompt}
                </p>
              )}
            </div>
          </div>

          {/* Size selector */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: 10 }}>
              Cake Size
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
              {CAKE_SIZES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSize(s.id)}
                  style={{
                    padding: '9px 12px', borderRadius: 10,
                    border: `1.5px solid ${selectedSize === s.id ? 'var(--ink)' : 'var(--parchment-dark)'}`,
                    background: selectedSize === s.id ? 'var(--parchment-mid)' : 'transparent',
                    cursor: 'pointer', fontFamily: 'var(--font-body)', textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontSize: 12.5, fontWeight: selectedSize === s.id ? 600 : 400, color: 'var(--ink)', marginBottom: 1 }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--ink-light)' }}>
                    {s.servings} servings · {s.weight}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Order details */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: 10 }}>
              Order Details <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--ink-light)' }}>(optional)</span>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--ink-light)', display: 'block', marginBottom: 4 }}>Name on cake</label>
                  <input className="input" style={{ fontSize: 13 }} placeholder="e.g. Lanya"
                    value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--ink-light)', display: 'block', marginBottom: 4 }}>Required by</label>
                  <input className="input" style={{ fontSize: 13 }} type="date"
                    value={date} onChange={e => setDate(e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--ink-light)', display: 'block', marginBottom: 4 }}>Allergies / special requests / delivery address</label>
                <textarea className="input" style={{ minHeight: 56, resize: 'none', fontSize: 12.5 }}
                  placeholder="Any dietary requirements, delivery notes…"
                  value={note} onChange={e => setNote(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Message preview */}
          <div style={{
            background: 'var(--parchment)', borderRadius: 12, padding: 14,
            border: '1px solid var(--parchment-dark)',
          }}>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-light)', marginBottom: 8 }}>
              Message preview
            </p>
            <pre style={{
              fontSize: 11.5, color: 'var(--ink-mid)', lineHeight: 1.7,
              whiteSpace: 'pre-wrap', fontFamily: 'var(--font-body)', margin: 0,
            }}>
              {buildMessage()}
            </pre>
          </div>

          {/* Send */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              className="btn btn-primary"
              style={{
                width: '100%', gap: 10, fontSize: 14, padding: '13px 20px',
                background: sent ? '#25D366' : undefined,
                transition: 'background 0.3s',
              }}
              onClick={handleSend}
            >
              {sent ? '✓ Opened WhatsApp!' : <><span>💬</span> Send Order on WhatsApp</>}
            </button>
            <button className="btn btn-ghost" onClick={onClose} style={{ width: '100%' }}>
              Cancel
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

window.WhatsAppOrderSheet = WhatsAppOrderSheet;
window.CAKE_SIZES = CAKE_SIZES;
