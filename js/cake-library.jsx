// Kalyan-Ji Bakery — Community Library Component

function CakeLibrary({ onEditCake, userCakes, bakerPhone }) {
  const { useState, useMemo } = React;
  const [shareTarget, setShareTarget] = useState(null); // cake to share via WA
  const [cakes, setCakes] = useState(() => {
    const saved = (() => { try { return JSON.parse(localStorage.getItem('kj_library') || '[]'); } catch { return []; } })();
    return [...window.TEMPLATE_CAKES, ...saved];
  });
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('popular');
  const [search, setSearch] = useState('');
  const [activeCake, setActiveCake] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [userRatings, setUserRatings] = useState({});

  // Merge any newly saved user cakes
  React.useEffect(() => {
    if (userCakes && userCakes.length > 0) {
      setCakes(prev => {
        const existingIds = new Set(prev.map(c => c.id));
        const newOnes = userCakes.filter(c => !existingIds.has(c.id));
        return newOnes.length > 0 ? [...prev, ...newOnes] : prev;
      });
    }
  }, [userCakes]);

  const filters = [
    { id: 'all', label: 'All Cakes' },
    { id: 'templates', label: 'Templates' },
    { id: 'community', label: 'Community' },
    { id: 'top-rated', label: 'Top Rated' },
  ];

  const filtered = useMemo(() => {
    let list = [...cakes];
    if (filter === 'templates') list = list.filter(c => c.isTemplate);
    if (filter === 'community') list = list.filter(c => !c.isTemplate);
    if (filter === 'top-rated') list = list.filter(c => c.rating >= 4.7);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        c.author.toLowerCase().includes(q)
      );
    }
    if (sort === 'popular') list.sort((a, b) => b.likes - a.likes);
    if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    if (sort === 'newest') list.sort((a, b) => (b.id > a.id ? 1 : -1));
    return list;
  }, [cakes, filter, sort, search]);

  const handleLike = (id) => {
    setCakes(prev => prev.map(c => c.id === id ? { ...c, likes: c.likes + 1 } : c));
    if (activeCake?.id === id) setActiveCake(prev => ({ ...prev, likes: prev.likes + 1 }));
  };

  const handleRate = (id, stars) => {
    setUserRatings(r => ({ ...r, [id]: stars }));
    setCakes(prev => prev.map(c => {
      if (c.id !== id) return c;
      const newCount = c.ratingCount + 1;
      const newRating = ((c.rating * c.ratingCount) + stars) / newCount;
      return { ...c, rating: Math.round(newRating * 10) / 10, ratingCount: newCount };
    }));
  };

  const handleComment = (id) => {
    if (!commentText.trim()) return;
    const newComment = { author: 'You', text: commentText.trim(), time: 'just now' };
    setCakes(prev => prev.map(c => c.id === id ? { ...c, comments: [...(c.comments || []), newComment] } : c));
    if (activeCake?.id === id) setActiveCake(prev => ({ ...prev, comments: [...(prev.comments || []), newComment] }));
    setCommentText('');
  };

  const Stars = ({ rating, interactive, cakeId, userRating }) => {
    const [hover, setHover] = useState(0);
    return (
      <div style={{ display: 'flex', gap: 2 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <span
            key={n}
            onClick={() => interactive && handleRate(cakeId, n)}
            onMouseEnter={() => interactive && setHover(n)}
            onMouseLeave={() => interactive && setHover(0)}
            style={{
              fontSize: interactive ? 20 : 13,
              cursor: interactive ? 'pointer' : 'default',
              color: n <= (interactive ? (hover || userRating || 0) : rating) ? '#C9A96E' : '#DDD5C8',
              transition: 'color 0.1s',
            }}
          >★</span>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* WhatsApp Order Sheet */}
      {shareTarget && (
        <window.WhatsAppOrderSheet
          cake={shareTarget}
          bakerPhone={bakerPhone}
          onClose={() => setShareTarget(null)}
        />
      )}

      {/* Header */}
      <div className="library-header" style={{
        padding: '20px 28px 0', borderBottom: '1px solid var(--parchment-dark)',
        background: 'var(--white)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600, color: 'var(--ink)' }}>
              Creator Library
            </h2>
            <p style={{ fontSize: 13, color: 'var(--ink-light)', marginTop: 3 }}>
              {cakes.length} cakes from our community of bakers
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--ink-light)' }}>Sort:</span>
            <select value={sort} onChange={e => setSort(e.target.value)} style={{
              padding: '6px 12px', borderRadius: 50, border: '1.5px solid var(--parchment-dark)',
              background: 'var(--white)', fontFamily: 'var(--font-body)', fontSize: 13,
              color: 'var(--ink)', cursor: 'pointer', outline: 'none',
            }}>
              <option value="popular">Most Liked</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        {/* Search + filters */}
        <div className="library-filters-row" style={{ display: 'flex', gap: 10, alignItems: 'center', paddingBottom: 16 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-light)', fontSize: 14 }}>🔍</span>
            <input className="input" placeholder="Search cakes, creators…"
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 36, height: 38, fontSize: 13 }}
            />
          </div>
          <div className="library-filter-chips" style={{ display: 'flex', gap: 6 }}>
            {filters.map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)} className={`chip ${filter === f.id ? 'active' : ''}`}
                style={{ cursor: 'pointer', border: 'none' }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="library-grid-wrapper" style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-light)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎂</div>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18 }}>No cakes found</p>
            <p style={{ fontSize: 13, marginTop: 6 }}>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 20,
          }}>
            {filtered.map(cake => (
              <CakeCard
                key={cake.id}
                cake={cake}
                onOpen={() => setActiveCake(cake)}
                onLike={() => handleLike(cake.id)}
                onShare={() => setShareTarget(cake)}
                userRating={userRatings[cake.id]}
                Stars={Stars}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {activeCake && (
        <CakeDetailModal
          cake={activeCake}
          onClose={() => { setActiveCake(null); setCommentText(''); }}
          onLike={() => handleLike(activeCake.id)}
          onEdit={() => { onEditCake && onEditCake(activeCake.config); setActiveCake(null); }}
          onShare={() => { setActiveCake(null); setShareTarget(activeCake); }}
          onRate={(stars) => handleRate(activeCake.id, stars)}
          onComment={() => handleComment(activeCake.id)}
          commentText={commentText}
          setCommentText={setCommentText}
          userRating={userRatings[activeCake.id]}
          Stars={Stars}
        />
      )}
    </div>
  );
}

function CakeCard({ cake, onOpen, onLike, onShare, userRating, Stars }) {
  const [liked, setLiked] = React.useState(false);
  const CD = window.CAKE_DATA;
  const frostingColorData = CD.frostingColors.find(c => c.id === cake.config?.frostingColor) || { hex: '#FFF8EE' };

  return (
    <div className="card" style={{ overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      {/* Preview area — clickable */}
      <div
        onClick={onOpen}
        style={{
          height: 180, background: `linear-gradient(135deg, ${frostingColorData.hex}33, var(--parchment))`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
          borderBottom: '1px solid var(--parchment-dark)', overflow: 'hidden', cursor: 'pointer',
        }}
      >
        {cake.image ? (
          <img src={cake.image} alt={cake.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          cake.config && <window.IsometricCake config={cake.config} size={150} />
        )}
        {cake.isTemplate && (
          <span style={{
            position: 'absolute', top: 10, left: 10,
            background: 'var(--ink)', color: 'var(--cream)', fontSize: 10, fontWeight: 600,
            padding: '3px 8px', borderRadius: 50, letterSpacing: '0.06em',
          }}>TEMPLATE</span>
        )}
        <button
          onClick={e => { e.stopPropagation(); setLiked(l => !l); onLike(); }}
          style={{
            position: 'absolute', top: 10, right: 10,
            width: 30, height: 30, borderRadius: '50%', border: 'none',
            background: liked ? 'var(--caramel)' : 'rgba(255,255,255,0.9)',
            cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
          }}
        >
          {liked ? '♥' : '♡'}
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: '12px 14px 10px', cursor: 'pointer' }} onClick={onOpen}>
        <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 3, textWrap: 'pretty' }}>
          {cake.name}
        </h4>
        <p style={{ fontSize: 11, color: 'var(--ink-light)', marginBottom: 6 }}>by {cake.author}</p>
        {cake.description && (
          <p style={{ fontSize: 12, color: 'var(--ink-mid)', lineHeight: 1.5, marginBottom: 8, textWrap: 'pretty',
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {cake.description}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Stars rating={cake.rating} />
            <span style={{ fontSize: 11, color: 'var(--ink-light)' }}>({cake.ratingCount})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--ink-light)', fontSize: 12 }}>
            <span>♥</span> <span>{cake.likes}</span>
          </div>
        </div>
      </div>

      {/* WhatsApp order button */}
      <div style={{ padding: '0 14px 12px' }}>
        <button
          onClick={e => { e.stopPropagation(); onShare(); }}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 6, padding: '7px 12px', borderRadius: 50,
            border: '1.5px solid #25D366',
            background: 'transparent', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500,
            color: '#1a9e4a', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#25D366'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#1a9e4a'; }}
        >
          <span>💬</span> Order via WhatsApp
        </button>
      </div>
    </div>
  );
}

function CakeDetailModal({ cake, onClose, onLike, onEdit, onShare, onRate, onComment, commentText, setCommentText, userRating, Stars }) {
  const CD = window.CAKE_DATA;
  const [liked, setLiked] = React.useState(false);

  const getLabel = (type, id) => {
    const map = { flavour: CD.flavours, filling: CD.fillings, frosting: CD.frostings, frostingColor: CD.frostingColors };
    return (map[type] || []).find(x => x.id === id)?.name || id;
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(44,26,14,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(6px)',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="detail-modal-inner" style={{
        background: 'var(--white)', borderRadius: 'var(--radius-xl)', width: 680, maxHeight: '88vh',
        overflow: 'hidden', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div className="detail-modal-header" style={{
          display: 'flex', gap: 24, padding: 28, borderBottom: '1px solid var(--parchment-dark)',
        }}>
          {/* Cake preview */}
          <div className="detail-modal-preview" style={{
            width: 200, height: 200, flexShrink: 0,
            background: 'var(--parchment)', borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {cake.image ? (
              <img src={cake.image} alt={cake.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              cake.config && <window.IsometricCake config={cake.config} size={170} />
            )}
          </div>

          <div style={{ flex: 1 }}>
            {cake.isTemplate && (
              <span className="chip" style={{ marginBottom: 10, display: 'inline-flex' }}>Template</span>
            )}
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 600, marginBottom: 4 }}>
              {cake.name}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--ink-light)', marginBottom: 12 }}>
              Created by <strong style={{ color: 'var(--ink-mid)' }}>{cake.author}</strong>
            </p>
            {cake.description && (
              <p style={{ fontSize: 14, color: 'var(--ink-mid)', lineHeight: 1.6, marginBottom: 16 }}>
                {cake.description}
              </p>
            )}

            {/* Specs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              {[
                getLabel('flavour', cake.config?.flavour),
                getLabel('filling', cake.config?.filling),
                getLabel('frosting', cake.config?.frosting),
                `${cake.config?.tiers} tier${cake.config?.tiers > 1 ? 's' : ''}`,
                cake.config?.shape,
              ].map((l, i) => <span key={i} className="chip" style={{ fontSize: 11 }}>{l}</span>)}
            </div>

            {/* Actions */}
            <div className="detail-modal-actions" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-sm" onClick={onEdit}>
                ✎ Remix This Cake
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => { setLiked(l => !l); onLike(); }}
                style={{ gap: 6 }}
              >
                {liked ? '♥' : '♡'} {cake.likes + (liked ? 1 : 0)}
              </button>
              <button
                onClick={onShare}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 50,
                  border: '1.5px solid #25D366', background: 'transparent',
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                  fontSize: 13, fontWeight: 500, color: '#1a9e4a',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#25D366'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#1a9e4a'; }}
              >
                <span>💬</span> Order via WhatsApp
              </button>
            </div>
          </div>

          <button className="btn-icon" onClick={onClose} style={{ alignSelf: 'flex-start', flexShrink: 0 }}>✕</button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {/* Rating */}
          <div style={{ marginBottom: 28, padding: 18, background: 'var(--parchment)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 700 }}>{cake.rating}</span>
              <div>
                <Stars rating={cake.rating} />
                <p style={{ fontSize: 12, color: 'var(--ink-light)', marginTop: 3 }}>{cake.ratingCount} ratings</p>
              </div>
            </div>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', marginBottom: 10 }}>
              {userRating ? `You rated this ${userRating} star${userRating > 1 ? 's' : ''}` : 'Rate this cake:'}
            </p>
            <Stars rating={0} interactive={true} cakeId={cake.id} userRating={userRating} />
          </div>

          {/* Ingredients / config details */}
          <div style={{ marginBottom: 28 }}>
            <p className="section-label" style={{ marginBottom: 14 }}>Full Recipe Details</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                ['Sponge', getLabel('flavour', cake.config?.flavour)],
                ['Filling', getLabel('filling', cake.config?.filling)],
                ['Frosting', getLabel('frosting', cake.config?.frosting)],
                ['Colour', getLabel('frostingColor', cake.config?.frostingColor)],
                ['Shape', cake.config?.shape],
                ['Tiers', cake.config?.tiers],
                ['Size', CD.sizes.find(s => s.id === cake.config?.size)?.name + ' · ' + CD.sizes.find(s => s.id === cake.config?.size)?.servings + ' servings'],
                cake.config?.message && ['Message', `"${cake.config.message}"`],
              ].filter(Boolean).map(([label, value]) => (
                <div key={label} style={{
                  padding: '10px 14px', background: 'var(--parchment)', borderRadius: 'var(--radius-sm)',
                }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-light)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</p>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', marginTop: 3 }}>{value}</p>
                </div>
              ))}
            </div>
            {cake.config?.decorations?.length > 0 && (
              <div style={{ marginTop: 10, padding: '10px 14px', background: 'var(--parchment)', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-light)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Decorations</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {cake.config.decorations.map(d => {
                    const dec = CD.decorations.find(x => x.id === d);
                    return dec ? (
                      <span key={d} className="chip" style={{ fontSize: 12 }}>{dec.emoji} {dec.name}</span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Comments */}
          <div>
            <p className="section-label" style={{ marginBottom: 14 }}>
              Comments ({(cake.comments || []).length})
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              {(cake.comments || []).length === 0 && (
                <p style={{ fontSize: 13, color: 'var(--ink-light)', fontStyle: 'italic' }}>
                  No comments yet. Be the first!
                </p>
              )}
              {(cake.comments || []).map((c, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 10, padding: '12px 14px',
                  background: 'var(--parchment)', borderRadius: 'var(--radius-sm)',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', background: 'var(--parchment-dark)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 600, color: 'var(--ink-mid)', flexShrink: 0,
                  }}>
                    {c.author[0]}
                  </div>
                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{c.author}</span>
                      <span style={{ fontSize: 11, color: 'var(--ink-light)' }}>{c.time}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--ink-mid)', marginTop: 3 }}>{c.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Add comment */}
            <div style={{ display: 'flex', gap: 10 }}>
              <input className="input" placeholder="Leave a comment…"
                value={commentText} onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onComment()}
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary btn-sm" onClick={onComment} disabled={!commentText.trim()}>
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export
window.CakeLibrary = CakeLibrary;
