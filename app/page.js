"use client";

import { useState, useEffect, useRef } from "react";

const TOTAL_BLOCKS = 1_000_000;
const SOLD_BLOCKS = 0;

const PALETTE = {
  bg: "#03010A",
  surface: "#0D0B1A",
  border: "#1E1A35",
  accent: "#7C3AED",
  accentBright: "#A855F7",
  gold: "#F59E0B",
  cyan: "#06B6D4",
  green: "#10B981",
  red: "#EF4444",
  text: "#F0ECFF",
  muted: "#6B6585",
};

const COUNTRY_FLAGS = ["🇺🇸","🇩🇪","🇫🇷","🇯🇵","🇧🇷","🇬🇧","🇨🇦","🇦🇺","🇮🇳","🇰🇷"];
const USERNAMES = ["pixel_king","art3mis","neon_wolf","cosmic_dot","grid_ghost","voxel_queen","blocksmith","the_painter"];
const BLOCK_COLORS = ["#7C3AED","#A855F7","#06B6D4","#10B981","#F59E0B","#EF4444","#3B82F6","#EC4899","#14B8A6","#F97316"];

export default function GlobalCanvas() {
  const [soldCount, setSoldCount] = useState(SOLD_BLOCKS);
  const [feedItems, setFeedItems] = useState([]);
  const [showPurchase, setShowPurchase] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [purchased, setPurchased] = useState(false);
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef(null);
  const purchasedBlocksRef = useRef([]);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const GRID = 1000;
    canvas.width = GRID;
    canvas.height = GRID;

    // All blocks black at start
    ctx.fillStyle = "#03010A";
    ctx.fillRect(0, 0, GRID, GRID);

    // Draw grid lines
    ctx.strokeStyle = "#1E1A35";
    ctx.lineWidth = 0.1;
    for (let i = 0; i <= GRID; i += 10) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, GRID);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(GRID, i);
      ctx.stroke();
    }

    // Redraw purchased blocks
    purchasedBlocksRef.current.forEach(block => {
      ctx.fillStyle = block.color;
      ctx.fillRect(block.x, block.y, 1, 1);
    });
  }, []);

  // Live feed simulation
  useEffect(() => {
    const timer = setInterval(() => {
      const newItem = {
        id: Date.now(),
        flag: COUNTRY_FLAGS[Math.floor(Math.random() * COUNTRY_FLAGS.length)],
        user: USERNAMES[Math.floor(Math.random() * USERNAMES.length)],
        x: Math.floor(Math.random() * 1000),
        y: Math.floor(Math.random() * 1000),
        ago: "just now"
      };
      setFeedItems(prev => [newItem, ...prev.slice(0, 10)]);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const handlePurchase = () => {
    setPurchased(true);

    // Color the block on canvas
    const canvas = canvasRef.current;
    if (canvas && selectedBlock) {
      const ctx = canvas.getContext("2d");
      const color = BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)];
      ctx.fillStyle = color;
      ctx.fillRect(selectedBlock.x, selectedBlock.y, 1, 1);
      purchasedBlocksRef.current.push({ x: selectedBlock.x, y: selectedBlock.y, color });
      setSoldCount(c => c + 1);
    }

    setTimeout(() => {
      setShowPurchase(false);
      setPurchased(false);
      setSelectedBlock(null);
    }, 3000);
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
    setSelectedBlock({ x, y });
    setShowPurchase(true);
  };

  const remaining = TOTAL_BLOCKS - soldCount;
  const pct = ((soldCount / TOTAL_BLOCKS) * 100).toFixed(4);

  const canvasDisplaySize = Math.round(500 * zoom);

  return (
    <div style={{ minHeight: "100vh", background: PALETTE.bg, color: PALETTE.text, fontFamily: "monospace" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
        .btn:hover { opacity: 0.85; transform: translateY(-1px); }
      `}</style>

      {/* HEADER */}
      <div style={{ background: "#0D0B1A", borderBottom: "1px solid #1E1A35", padding: "0 20px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ fontWeight: 800, fontSize: 20 }}>
          🌐 Global<span style={{ color: "#A855F7" }}>Canvas</span>
        </div>
        <button className="btn"
          onClick={() => { setSelectedBlock({ x: Math.floor(Math.random()*1000), y: Math.floor(Math.random()*1000) }); setShowPurchase(true); }}
          style={{ background: "linear-gradient(135deg,#7C3AED,#A855F7)", border: "none", borderRadius: 8, padding: "8px 18px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}>
          Buy Block — €1
        </button>
      </div>

      {/* URGENCY BANNER */}
      <div style={{ background: "rgba(239,68,68,0.1)", borderBottom: "1px solid rgba(239,68,68,0.3)", padding: "8px 20px", textAlign: "center" }}>
        <span style={{ animation: "pulse 1s infinite", marginRight: 8 }}>🔴</span>
        <span style={{ fontWeight: 700, color: "#FCA5A5", fontSize: 13 }}>
          ONLY {remaining.toLocaleString()} BLOCKS REMAINING — {pct}% sold forever
        </span>
      </div>

      {/* MAIN */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24, display: "grid", gridTemplateColumns: "1fr 260px", gap: 20 }}>

        {/* LEFT */}
        <div>
          {/* Stats */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            {[
              { icon: "🧱", label: "Blocks Sold", value: soldCount.toLocaleString(), color: "#A855F7" },
              { icon: "⬜", label: "Remaining", value: remaining.toLocaleString(), color: "#F59E0B" },
              { icon: "👥", label: "Owners", value: soldCount.toString(), color: "#06B6D4" },
              { icon: "💰", label: "Total Value", value: `€${soldCount.toLocaleString()}`, color: "#10B981" },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, minWidth: 120, background: "#0D0B1A", border: "1px solid #1E1A35", borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ fontSize: 20 }}>{s.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color, marginTop: 4 }}>{s.value}</div>
                <div style={{ fontSize: 10, color: "#6B6585", marginTop: 2, textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Canvas */}
          <div style={{ background: "#0D0B1A", border: "1px solid #1E1A35", borderRadius: 16, overflow: "hidden" }}>
            {/* Canvas toolbar */}
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #1E1A35", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: 13 }}>🌍 Live Canvas — 1000×1000 blocks</span>
              <div style={{ display: "flex", gap: 6 }}>
                {[
                  { label: "🔍+", action: () => setZoom(z => Math.min(z + 0.5, 5)) },
                  { label: "🔍-", action: () => setZoom(z => Math.max(z - 0.5, 0.5)) },
                  { label: "Reset", action: () => setZoom(1) },
                  { label: "⛶ Full Screen", action: () => {
                    const el = document.documentElement;
                    if (!document.fullscreenElement) { el.requestFullscreen(); }
                    else { document.exitFullscreen(); }
                  }},
                ].map((b, i) => (
                  <button key={i} onClick={b.action} className="btn" style={{
                    padding: "4px 10px", background: "transparent",
                    border: "1px solid #1E1A35", borderRadius: 4,
                    color: "#6B6585", fontSize: 11, cursor: "pointer",
                    fontFamily: "inherit", transition: "all 0.2s"
                  }}>{b.label}</button>
                ))}
              </div>
            </div>

            {/* Canvas wrapper with scroll */}
            <div style={{ overflow: "auto", maxHeight: 500, background: "#03010A" }}>
              <canvas
                ref={canvasRef}
                style={{
                  display: "block",
                  cursor: "crosshair",
                  width: canvasDisplaySize + "px",
                  height: canvasDisplaySize + "px",
                  imageRendering: "pixelated"
                }}
                onClick={handleCanvasClick}
              />
            </div>

            <div style={{ padding: "10px 16px", borderTop: "1px solid #1E1A35", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#6B6585" }}>👆 Click any black block to purchase it</span>
              <span style={{ fontSize: 11, color: "#A855F7" }}>Zoom: {Math.round(zoom * 100)}%</span>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: 16, background: "#0D0B1A", border: "1px solid #1E1A35", borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700 }}>Canvas Completion</span>
              <span style={{ fontSize: 12, color: "#A855F7", fontWeight: 700 }}>{pct}%</span>
            </div>
            <div style={{ height: 10, background: "#1E1A35", borderRadius: 5, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#7C3AED,#A855F7,#06B6D4)", borderRadius: 5, transition: "width 0.5s", minWidth: soldCount > 0 ? 4 : 0 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontSize: 10, color: "#6B6585" }}>0 blocks</span>
              <span style={{ fontSize: 10, color: "#F59E0B", fontWeight: 600 }}>🎯 {soldCount.toLocaleString()} sold</span>
              <span style={{ fontSize: 10, color: "#6B6585" }}>1,000,000 blocks</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Live Feed */}
          <div style={{ background: "#0D0B1A", border: "1px solid #1E1A35", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #1E1A35", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 7, height: 7, background: "#10B981", borderRadius: "50%", animation: "pulse 1s infinite" }} />
              <span style={{ fontSize: 12, fontWeight: 700 }}>Live Purchases</span>
            </div>
            <div style={{ padding: "6px 0", minHeight: 180 }}>
              {feedItems.map((item, i) => (
                <div key={item.id} style={{ padding: "6px 12px", display: "flex", alignItems: "center", gap: 8, borderLeft: i === 0 ? "2px solid #7C3AED" : "2px solid transparent", animation: i === 0 ? "slideIn 0.3s ease" : "none" }}>
                  <span style={{ fontSize: 14 }}>{item.flag}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ color: "#A855F7", fontSize: 11, fontWeight: 600 }}>{item.user}</span>
                    <span style={{ color: "#6B6585", fontSize: 10 }}> [{item.x},{item.y}]</span>
                  </div>
                  <span style={{ fontSize: 10, color: "#6B6585" }}>{item.ago}</span>
                </div>
              ))}
              {feedItems.length === 0 && (
                <div style={{ padding: 16, color: "#6B6585", fontSize: 11, textAlign: "center" }}>Waiting for purchases...</div>
              )}
            </div>
          </div>

          {/* Buy CTA */}
          <div style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.2),rgba(6,182,212,0.1))", border: "1px solid #7C3AED", borderRadius: 12, padding: 20, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8, animation: "float 3s ease-in-out infinite" }}>🎨</div>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 6 }}>Own Your Piece</div>
            <div style={{ fontSize: 11, color: "#6B6585", marginBottom: 16, lineHeight: 1.5 }}>
              Leave your mark on the world's largest collaborative artwork. Just €1 — forever.
            </div>
            <button className="btn"
              onClick={() => { setSelectedBlock({ x: Math.floor(Math.random()*1000), y: Math.floor(Math.random()*1000) }); setShowPurchase(true); }}
              style={{ width: "100%", padding: 12, background: "linear-gradient(135deg,#7C3AED,#A855F7)", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.2s" }}>
              Buy a Block — €1
            </button>
            <div style={{ fontSize: 10, color: "#6B6585", marginTop: 8 }}>💳 Stripe · Secure · Instant</div>
          </div>

          {/* Leaderboard */}
          <div style={{ background: "#0D0B1A", border: "1px solid #1E1A35", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #1E1A35" }}>
              <span style={{ fontSize: 12, fontWeight: 700 }}>🏆 Top Collectors</span>
            </div>
            {[
              { rank: 1, user: "pixel_king", country: "🇺🇸", blocks: 47 },
              { rank: 2, user: "art3mis", country: "🇩🇪", blocks: 31 },
              { rank: 3, user: "neon_wolf", country: "🇯🇵", blocks: 28 },
              { rank: 4, user: "cosmic_dot", country: "🇫🇷", blocks: 22 },
              { rank: 5, user: "grid_ghost", country: "🇧🇷", blocks: 19 },
            ].map((u, i) => (
              <div key={i} style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: i < 4 ? "1px solid #1E1A35" : "none" }}>
                <span style={{ fontSize: 14, minWidth: 24, color: i === 0 ? "#F59E0B" : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : "#6B6585", fontWeight: 800 }}>#{u.rank}</span>
                <span>{u.country}</span>
                <span style={{ flex: 1, fontSize: 11, fontWeight: 600 }}>{u.user}</span>
                <span style={{ fontSize: 10, color: "#6B6585" }}>{u.blocks} blocks</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PURCHASE MODAL */}
      {showPurchase && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(3,1,10,0.85)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget && !purchased) setShowPurchase(false); }}>
          <div style={{ background: "#0D0B1A", border: "1px solid #7C3AED", borderRadius: 20, padding: 32, maxWidth: 420, width: "100%", position: "relative", boxShadow: "0 0 60px rgba(124,58,237,0.3)" }}>
            {!purchased ? (
              <>
                <button onClick={() => setShowPurchase(false)} style={{ position: "absolute", top: 16, right: 16, background: "transparent", border: "none", color: "#6B6585", fontSize: 22, cursor: "pointer" }}>×</button>
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                  <div style={{ fontSize: 40, marginBottom: 10, animation: "float 3s infinite" }}>🎨</div>
                  <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>Claim Your Block</div>
                  <div style={{ color: "#6B6585", fontSize: 12 }}>
                    Block <span style={{ color: "#06B6D4", fontFamily: "monospace" }}>[{selectedBlock?.x}, {selectedBlock?.y}]</span> · Available
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                  {[["Price","€ 1.00"],["Location","["+selectedBlock?.x+","+selectedBlock?.y+"]"],["Ownership","Permanent"],["Customizable","Yes"]].map(([l,v],i) => (
                    <div key={i} style={{ background: "#03010A", borderRadius: 8, padding: "10px 12px" }}>
                      <div style={{ fontSize: 10, color: "#6B6585", marginBottom: 3 }}>{l}</div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{v}</div>
                    </div>
                  ))}
                </div>

                <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "10px 14px", marginBottom: 20 }}>
                  <span style={{ fontSize: 11, color: "#FCA5A5", fontWeight: 600 }}>
                    🔴 {Math.floor(Math.random()*15+3)} people viewing this block right now
                  </span>
                </div>

                <button className="btn" onClick={handlePurchase} style={{ width: "100%", padding: 14, background: "linear-gradient(135deg,#7C3AED,#A855F7)", border: "none", borderRadius: 10, color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer", transition: "all 0.2s" }}>
                  🔒 Buy Block — €1.00
                </button>
                <div style={{ textAlign: "center", marginTop: 10, fontSize: 10, color: "#6B6585" }}>
                  Powered by Stripe · SSL Encrypted · Instant ownership
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 56, marginBottom: 12, animation: "float 1s infinite" }}>🎉</div>
                <div style={{ fontWeight: 800, fontSize: 20, color: "#10B981", marginBottom: 8 }}>
                  You own Block [{selectedBlock?.x}, {selectedBlock?.y}]!
                </div>
                <div style={{ color: "#6B6585", fontSize: 12, lineHeight: 1.6, marginBottom: 20 }}>
                  You are now permanently part of the world's largest collaborative digital artwork! Share it!
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                  <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=I just bought Block [${selectedBlock?.x}, ${selectedBlock?.y}] on GlobalCanvas — the world's largest collaborative artwork! Only €1! 🎨&url=https://www.globalcanvas.design`, '_blank')}
                    style={{ padding: "8px 14px", background: "rgba(124,58,237,0.2)", border: "1px solid #7C3AED", borderRadius: 8, color: "#A855F7", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                    𝕏 Twitter
                  </button>
                  <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=https://www.globalcanvas.design`, '_blank')}
                    style={{ padding: "8px 14px", background: "rgba(124,58,237,0.2)", border: "1px solid #7C3AED", borderRadius: 8, color: "#A855F7", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                    📘 Facebook
                  </button>
                  <button onClick={() => { navigator.clipboard.writeText(`https://www.globalcanvas.design`); alert("Link copied! Paste it on Instagram! ✅"); }}
                    style={{ padding: "8px 14px", background: "rgba(124,58,237,0.2)", border: "1px solid #7C3AED", borderRadius: 8, color: "#A855F7", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                    📷 Instagram
                  </button>
                  <button onClick={() => { navigator.clipboard.writeText(`https://www.globalcanvas.design`); alert("Link copied! Paste it on TikTok! ✅"); }}
                    style={{ padding: "8px 14px", background: "rgba(124,58,237,0.2)", border: "1px solid #7C3AED", borderRadius: 8, color: "#A855F7", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                    🎵 TikTok
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div style={{ borderTop: "1px solid #1E1A35", padding: "20px", marginTop: 20, textAlign: "center" }}>
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>
          Global<span style={{ color: "#A855F7" }}>Canvas</span>
        </div>
        <div style={{ fontSize: 11, color: "#6B6585" }}>
          {soldCount.toLocaleString()} / 1,000,000 blocks sold · {remaining.toLocaleString()} remaining
        </div>
      </div>
    </div>
  );
}