// Kalyan-Ji Bakery — Cake Builder (Prompt-First, with History + WhatsApp Share + Inspiration Upload)

function CakeBuilder({ onSave, initialConfig = null, bakerPhone }) {
  const { useState, useRef, useEffect } = React;

  const [prompt, setPrompt] = useState(initialConfig?._rawPrompt || '');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [expandedPrompt, setExpandedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);

  // History: array of { id, prompt, image, createdAt }
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kj_gen_history') || '[]'); } catch { return []; }
  });

  // Inspiration image: { dataUrl, base64: { mimeType, data } }
  const [inspiration, setInspiration] = useState(null);
  const inspirationInputRef = useRef(null);
  const textareaRef = useRef(null);

  const hasApiKey = window.GEMINI_API_KEY_REF && window.GEMINI_API_KEY_REF() !== 'YOUR_API_KEY_HERE';

  // Persist history to localStorage whenever it changes
  useEffect(() => {
    try {
      // Store only last 12, and strip large base64 from older entries to save space
      const trimmed = history.slice(0, 12);
      localStorage.setItem('kj_gen_history', JSON.stringify(trimmed));
    } catch (e) {
      // Storage full — trim aggressively
      try { localStorage.setItem('kj_gen_history', JSON.stringify(history.slice(0, 4))); } catch {}
    }
  }, [history]);

  // Restore last generated image from history on mount
  useEffect(() => {
    if (!generatedImage && history.length > 0) {
      const last = history[0];
      setGeneratedImage(last.image);
      setPrompt(last.prompt || '');
    }
  }, []);

  const HINT_GROUPS = [
    {
      label: 'Theme & Style',
      chips: [
        { label: 'Character / movie theme', insert: 'themed like ' },
        { label: 'Floral & botanical', insert: 'with fresh floral decorations ' },
        { label: 'Minimalist & elegant', insert: 'minimal and elegant style ' },
        { label: 'Rustic & naked', insert: 'rustic naked cake style ' },
        { label: 'Drip cake', insert: 'with chocolate drip ' },
        { label: 'Geode / crystal', insert: 'geode crystal interior design ' },
      ],
    },
    {
      label: 'Shape & Size',
      chips: [
        { label: 'Round', insert: 'round cake ' },
        { label: 'Square', insert: 'square cake ' },
        { label: 'Heart-shaped', insert: 'heart-shaped cake ' },
        { label: 'Sculpted / 3D shape', insert: 'sculpted into the shape of ' },
        { label: '2 tiers', insert: '2-tier cake ' },
        { label: '3 tiers', insert: '3-tier cake ' },
        { label: 'Serves 10', insert: 'serves 10 people ' },
        { label: 'Small 6"', insert: '6 inch cake ' },
        { label: 'Large 12"', insert: '12 inch cake ' },
      ],
    },
    {
      label: 'Sponge & Filling',
      chips: [
        { label: 'Vanilla sponge', insert: 'vanilla sponge ' },
        { label: 'Chocolate sponge', insert: 'chocolate sponge ' },
        { label: 'Red velvet', insert: 'red velvet sponge ' },
        { label: 'Lemon sponge', insert: 'lemon sponge ' },
        { label: 'Strawberry', insert: 'strawberry sponge ' },
        { label: 'Buttercream filling', insert: 'buttercream filling ' },
        { label: 'Ganache filling', insert: 'chocolate ganache filling ' },
        { label: 'Lemon curd filling', insert: 'lemon curd filling ' },
        { label: 'Salted caramel filling', insert: 'salted caramel filling ' },
      ],
    },
    {
      label: 'Frosting & Finish',
      chips: [
        { label: 'Smooth buttercream', insert: 'smooth buttercream finish ' },
        { label: 'Fondant covered', insert: 'smooth fondant covered ' },
        { label: 'Textured palette knife', insert: 'textured palette knife buttercream ' },
        { label: 'Swiss meringue', insert: 'Swiss meringue buttercream ' },
        { label: 'White frosting', insert: 'white frosting ' },
        { label: 'Blush pink frosting', insert: 'blush pink frosting ' },
        { label: 'Gold frosting', insert: 'champagne gold frosting ' },
        { label: 'Dark chocolate', insert: 'dark chocolate frosting ' },
      ],
    },
    {
      label: 'Decorations',
      chips: [
        { label: 'Fresh flowers', insert: 'with fresh flower decorations ' },
        { label: 'Gold leaf', insert: 'with edible gold leaf ' },
        { label: 'Sprinkles', insert: 'with rainbow sprinkles ' },
        { label: 'Macarons on top', insert: 'topped with French macarons ' },
        { label: 'Fresh berries', insert: 'topped with fresh berries ' },
        { label: 'Chocolate shards', insert: 'with chocolate shards ' },
        { label: 'Edible glitter', insert: 'with edible gold glitter ' },
        { label: 'Sugar pearls', insert: 'with sugar pearl decorations ' },
        { label: 'Candles', insert: 'with birthday candles ' },
      ],
    },
    {
      label: 'Text on Cake',
      chips: [
        { label: 'Happy Birthday', insert: 'with "Happy Birthday" written on it ' },
        { label: 'Happy Anniversary', insert: 'with "Happy Anniversary" written on it ' },
        { label: 'Custom name...', insert: 'with the name "" written on it ' },
        { label: 'Congratulations', insert: 'with "Congratulations" written on it ' },
        { label: 'No text', insert: 'no text on the cake ' },
      ],
    },
  ];

  const insertChip = (insertText) => {
    const ta = textareaRef.current;
    if (!ta) {
      setPrompt(p => p + (p.endsWith(' ') || p === '' ? '' : ' ') + insertText);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = prompt.slice(0, start);
    const after = prompt.slice(end);
    const prefix = before.length > 0 && !before.endsWith(' ') ? ' ' : '';
    const newPrompt = before + prefix + insertText + after;
    setPrompt(newPrompt);
    setTimeout(() => {
      const newPos = start + prefix.length + insertText.length;
      ta.focus();
      ta.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleInspirationUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      // Extract base64 and mimeType for Gemini API
      const [header, data] = dataUrl.split(',');
      const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
      setInspiration({ dataUrl, base64: { mimeType, data } });
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-uploaded
    e.target.value = '';
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setError(null);
    try {
      const result = await window.generateCakeImageFromPrompt(
        prompt.trim(),
        inspiration?.base64 || null
      );
      setGeneratedImage(result.image);
      setExpandedPrompt(result.prompt || '');
      // Add to history
      const entry = {
        id: Date.now(),
        prompt: prompt.trim(),
        image: result.image,
        createdAt: new Date().toISOString(),
        hasInspiration: !!inspiration,
      };
      setHistory(h => [entry, ...h].slice(0, 12));
    } catch (e) {
      setError(e.message || 'Unknown error');
    }
    setIsGenerating(false);
  };

  const loadFromHistory = (entry) => {
    setGeneratedImage(entry.image);
    setPrompt(entry.prompt);
    setExpandedPrompt('');
    setError(null);
  };

  const deleteFromHistory = (id, e) => {
    e.stopPropagation();
    setHistory(h => h.filter(x => x.id !== id));
  };

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

      {/* ── Left panel: prompt + hints ── */}
      <div style={{
        width: 400, flexShrink: 0, display: 'flex', flexDirection: 'column',
        borderRight: '1px solid var(--parchment-dark)',
        background: 'var(--white)', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid var(--parchment-dark)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
            <span style={{ fontSize: 17 }}>✦</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 600, color: 'var(--ink)' }}>
              Describe your cake
            </h2>
          </div>
          <p style={{ fontSize: 12, color: 'var(--ink-light)', lineHeight: 1.55 }}>
            Type anything — theme, shape, flavours, text, decorations. The more detail, the better.
          </p>
        </div>

        {/* Prompt + inspiration */}
        <div style={{ padding: '16px 24px 0', flexShrink: 0 }}>

          {/* Inspiration image strip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <button
              onClick={() => inspirationInputRef.current?.click()}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '6px 14px', borderRadius: 50,
                border: inspiration ? '1.5px solid var(--caramel)' : '1.5px dashed var(--parchment-dark)',
                background: inspiration ? 'var(--caramel-light)' : 'transparent',
                cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-body)',
                color: inspiration ? 'var(--caramel-dark)' : 'var(--ink-light)',
                transition: 'all 0.15s', flexShrink: 0,
              }}
              title="Upload an inspiration photo to guide the AI"
            >
              <span style={{ fontSize: 14 }}>📷</span>
              {inspiration ? 'Inspiration added' : 'Add inspiration photo'}
            </button>
            {inspiration && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <img
                  src={inspiration.dataUrl}
                  alt="Inspiration"
                  style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--parchment-dark)' }}
                />
                <button
                  onClick={() => setInspiration(null)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 13, color: 'var(--ink-light)', padding: '2px 6px',
                    borderRadius: 50, fontFamily: 'var(--font-body)',
                  }}
                  title="Remove inspiration"
                >✕</button>
              </div>
            )}
          </div>
          <input
            ref={inspirationInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleInspirationUpload}
          />

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            className="input"
            style={{
              minHeight: 110, fontSize: 13.5, lineHeight: 1.65,
              borderColor: 'var(--parchment-dark)', resize: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            placeholder={`e.g. A car shaped cake, very much like Lightning McQueen from Cars, with "Happy Birthday Lanya" written on it, red and yellow fondant, racing flames on the side`}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleGenerate();
              }
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--caramel)'; e.target.style.boxShadow = '0 0 0 3px rgba(200,149,108,0.12)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--parchment-dark)'; e.target.style.boxShadow = 'none'; }}
          />
          <p style={{ fontSize: 11, color: 'var(--ink-light)', marginTop: 4, textAlign: 'right' }}>⌘↵ to generate</p>
        </div>

        {/* Hint chips */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 24px 12px' }}>
          <p style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-light)', marginBottom: 10 }}>
            Click to add to prompt ↓
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {HINT_GROUPS.map(group => (
              <div key={group.label}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-mid)', marginBottom: 6, letterSpacing: '0.03em' }}>
                  {group.label}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {group.chips.map(chip => (
                    <button
                      key={chip.label}
                      onClick={() => insertChip(chip.insert)}
                      style={{
                        padding: '4px 11px', borderRadius: 50,
                        border: '1.5px solid var(--parchment-dark)',
                        background: 'var(--parchment)', cursor: 'pointer',
                        fontSize: 11.5, color: 'var(--ink-mid)', fontFamily: 'var(--font-body)',
                        transition: 'all 0.15s', whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--caramel)'; e.currentTarget.style.color = 'var(--ink)'; e.currentTarget.style.background = 'var(--caramel-light)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--parchment-dark)'; e.currentTarget.style.color = 'var(--ink-mid)'; e.currentTarget.style.background = 'var(--parchment)'; }}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <div style={{
          padding: '12px 24px', borderTop: '1px solid var(--parchment-dark)',
          flexShrink: 0, background: 'var(--white)',
        }}>
          <button
            className="btn btn-primary"
            style={{ width: '100%', fontSize: 14, padding: '13px 20px', gap: 8 }}
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
          >
            {isGenerating
              ? <><span style={{ display: 'inline-block', animation: 'kj-spin 1s linear infinite' }}>✦</span> Generating…</>
              : <>✦ Generate Cake Image</>
            }
          </button>
        </div>
      </div>

      {/* ── Right panel: image + history ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        background: 'var(--parchment)', overflow: 'hidden', position: 'relative',
      }}>
        {/* Dot pattern */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04, pointerEvents: 'none' }}>
          <pattern id="kj-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="1.5" fill="var(--ink)" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#kj-dots)" />
        </svg>

        {/* Main content area */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '28px 32px 16px', overflow: 'hidden', position: 'relative', zIndex: 1,
        }}>
          <MainImageArea
            prompt={prompt}
            generatedImage={generatedImage}
            expandedPrompt={expandedPrompt}
            isGenerating={isGenerating}
            error={error}
            showPrompt={showPrompt}
            setShowPrompt={setShowPrompt}
            onGenerate={handleGenerate}
            hasApiKey={hasApiKey}
            onShare={() => setShowShareSheet(true)}
          />
        </div>

        {/* History strip */}
        {history.length > 0 && (
          <HistoryStrip
            history={history}
            currentImage={generatedImage}
            onSelect={loadFromHistory}
            onDelete={deleteFromHistory}
          />
        )}

        <style>{`
          @keyframes kj-spin { to { transform: rotate(360deg); } }
          @keyframes kj-fadein { from { opacity: 0; transform: scale(1.02); } to { opacity: 1; transform: scale(1); } }
          @keyframes kj-slide-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>

      {/* WhatsApp Order Sheet */}
      {showShareSheet && (
        <window.WhatsAppOrderSheet
          cake={{
            name: prompt.slice(0, 48) || 'My Cake',
            description: prompt,
            config: { _rawPrompt: prompt },
            image: generatedImage,
          }}
          bakerPhone={bakerPhone}
          onClose={() => {
            setShowShareSheet(false);
            // auto-save to library after sharing
            if (generatedImage) {
              onSave && onSave({
                config: { _rawPrompt: prompt },
                name: prompt.slice(0, 48) || 'My Cake',
                description: prompt,
                shareToLibrary: true,
                image: generatedImage,
              });
            }
          }}
        />
      )}
    </div>
  );
}

// ── Main Image Area ──────────────────────────────────────────

const LOADING_MESSAGES = [
  'Reading your description…',
  'Crafting the image prompt…',
  'Preheating the creative oven…',
  'Layering the sponge…',
  'Applying the frosting…',
  'Adding finishing touches…',
  'Almost ready to serve…',
];

function MainImageArea({ prompt, generatedImage, expandedPrompt, isGenerating, error, showPrompt, setShowPrompt, onGenerate, hasApiKey, onShare }) {
  const { useState, useEffect, useRef } = React;
  const [msgIdx, setMsgIdx] = useState(0);
  const msgTimer = useRef(null);

  useEffect(() => {
    if (isGenerating) {
      setMsgIdx(0);
      msgTimer.current = setInterval(() => setMsgIdx(i => (i + 1) % LOADING_MESSAGES.length), 2400);
    } else {
      clearInterval(msgTimer.current);
    }
    return () => clearInterval(msgTimer.current);
  }, [isGenerating]);

  const isEmpty = !generatedImage && !isGenerating && !error;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 16, width: '100%', maxWidth: 500,
    }}>
      {/* Image frame */}
      <div style={{
        width: '100%', aspectRatio: '1 / 1', maxWidth: 440,
        borderRadius: 22, overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(44,26,14,0.2)',
        border: '1px solid var(--parchment-dark)',
        background: 'var(--parchment-mid)',
        position: 'relative', flexShrink: 0,
      }}>
        {isEmpty && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 14, padding: 32,
            background: 'var(--parchment)',
          }}>
            <div style={{
              width: 100, height: 100, borderRadius: '50%',
              background: 'var(--parchment-mid)', border: '2px dashed var(--parchment-dark)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 42,
            }}>🎂</div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 500, color: 'var(--ink)', marginBottom: 5 }}>
                Describe your dream cake
              </p>
              <p style={{ fontSize: 12.5, color: 'var(--ink-light)', lineHeight: 1.6, maxWidth: 260 }}>
                Type your idea on the left — any detail you can imagine. Then hit <strong>Generate</strong>.
              </p>
            </div>
          </div>
        )}

        {isGenerating && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
            <window.PixelLoader size={440} />
            <div style={{
              position: 'absolute', inset: 0, zIndex: 3,
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 22,
            }}>
              <div style={{
                background: 'rgba(44,26,14,0.78)', backdropFilter: 'blur(6px)',
                borderRadius: 50, padding: '9px 22px',
                color: 'var(--cream)', fontSize: 12.5, fontFamily: 'var(--font-body)',
                letterSpacing: '0.02em',
              }}>
                {LOADING_MESSAGES[msgIdx]}
              </div>
            </div>
          </div>
        )}

        {generatedImage && !isGenerating && (
          <img
            src={generatedImage}
            alt="AI generated cake"
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', animation: 'kj-fadein 0.7s ease',
            }}
          />
        )}

        {error && !isGenerating && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexDirection: 'column', gap: 10,
            background: 'rgba(250,247,242,0.97)', padding: 28, textAlign: 'center',
          }}>
            <span style={{ fontSize: 30 }}>⚠️</span>
            <p style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 600 }}>Generation failed</p>
            <p style={{ fontSize: 11.5, color: 'var(--ink-light)', lineHeight: 1.6, maxWidth: 280 }}>{error}</p>
            <button className="btn btn-outline btn-sm" style={{ marginTop: 4 }} onClick={onGenerate}>Try again</button>
          </div>
        )}
      </div>

      {/* Action row */}
      {generatedImage && !isGenerating && (
        <div style={{ display: 'flex', gap: 10, animation: 'kj-slide-up 0.3s ease' }}>
          <button
            className="btn btn-primary"
            style={{ gap: 8, padding: '10px 22px', fontSize: 13 }}
            onClick={onShare}
          >
            <span>💬</span> Share via WhatsApp
          </button>
          <button
            className="btn btn-outline"
            style={{ gap: 7, padding: '10px 18px', fontSize: 13 }}
            onClick={onGenerate}
          >
            ↻ Regenerate
          </button>
        </div>
      )}

      {!hasApiKey && (
        <p style={{
          fontSize: 11.5, color: 'var(--caramel-dark)', textAlign: 'center',
          background: 'var(--caramel-light)', padding: '7px 16px',
          borderRadius: 50, maxWidth: 380,
        }}>
          ⚠️ Add your Gemini API key in <code style={{ fontSize: 10.5 }}>cake-ai-image.js</code>
        </p>
      )}

      {/* Prompt reveal */}
      {expandedPrompt && (
        <div style={{ width: '100%', maxWidth: 440 }}>
          <button
            onClick={() => setShowPrompt(s => !s)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 11.5, color: 'var(--ink-light)', width: '100%',
              textAlign: 'center', padding: '2px 0', fontFamily: 'var(--font-body)',
            }}
          >
            {showPrompt ? 'Hide AI prompt ↑' : 'View AI prompt ↓'}
          </button>
          {showPrompt && (
            <div style={{
              marginTop: 8, padding: 12, background: 'var(--white)',
              borderRadius: 10, fontSize: 10.5, color: 'var(--ink-mid)',
              lineHeight: 1.6, border: '1px solid var(--parchment-dark)',
              maxHeight: 160, overflowY: 'auto', fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
            }}>
              {expandedPrompt}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── History Strip ────────────────────────────────────────────

function HistoryStrip({ history, currentImage, onSelect, onDelete }) {
  return (
    <div style={{
      flexShrink: 0, borderTop: '1px solid var(--parchment-dark)',
      background: 'var(--white)', padding: '10px 20px',
      display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 2,
    }}>
      <p style={{
        fontSize: 10.5, fontWeight: 600, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: 'var(--ink-light)',
        flexShrink: 0, whiteSpace: 'nowrap',
      }}>
        History
      </p>
      <div style={{
        display: 'flex', gap: 8, overflowX: 'auto', flex: 1,
        paddingBottom: 2,
      }}>
        {history.map((entry) => {
          const isCurrent = entry.image === currentImage;
          return (
            <div
              key={entry.id}
              onClick={() => onSelect(entry)}
              title={entry.prompt}
              style={{
                position: 'relative', flexShrink: 0,
                width: 56, height: 56, borderRadius: 10, overflow: 'hidden',
                cursor: 'pointer',
                border: isCurrent ? '2.5px solid var(--ink)' : '2px solid var(--parchment-dark)',
                transition: 'all 0.15s', boxShadow: isCurrent ? '0 2px 10px rgba(44,26,14,0.18)' : 'none',
              }}
              onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.borderColor = 'var(--caramel)'; }}
              onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.borderColor = 'var(--parchment-dark)'; }}
            >
              <img
                src={entry.image}
                alt={entry.prompt}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {/* Delete button */}
              <button
                onClick={(e) => onDelete(entry.id, e)}
                style={{
                  position: 'absolute', top: 2, right: 2,
                  width: 16, height: 16, borderRadius: '50%',
                  background: 'rgba(44,26,14,0.65)', border: 'none',
                  color: 'white', fontSize: 9, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: 0, transition: 'opacity 0.15s',
                }}
                className="hist-del"
              >✕</button>
            </div>
          );
        })}
      </div>
      <style>{`
        div:hover > .hist-del { opacity: 1 !important; }
      `}</style>
    </div>
  );
}

// ── (WhatsApp sheet moved to cake-whatsapp.jsx) ──────────────



// Export
window.CakeBuilder = CakeBuilder;
window.DEFAULT_CONFIG = { _rawPrompt: '' };
