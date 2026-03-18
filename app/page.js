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

export default function GlobalCanvas() {
  const [soldCount, setSoldCount] = useState(SOLD_BLOCKS);
  const [feedItems, setFeedItems] = useState([]);
  const [showPurchase, setShowPurchase] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [purchased, setPurchased] = useState(false);
  const canvasRef = useRef(null);

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
      setSoldCount(c => c + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const COLS = 40, ROWS = 40;
    const cellW = canvas.width / COLS;
    const cellH = canvas.height / ROWS;
    const colors = Array.from({ length: COLS * ROWS }, () => {
      const r = Math.random();
      if (r < 0.3) return null;
      const p = ["#7C3AED","#A855F7","#06B6D4","#10B981","#F59E0B","#EF4444","#3B82F6","#EC4899"];
      return p[Math.floor(Math.random() * p.length)];
    });
    let pulse = 0;
    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const idx = row * COLS + col;
          const color = colors[idx];
          const x = col * cellW, y = row * cellH;
          if (color) {
            ctx.globalAlpha = Math.sin(pulse + col * 0.3 + row * 0.2) * 0.15 + 0.85;
            ctx.fillStyle = color;
            ctx.fillRect(x + 0.5, y + 0.5, cellW - 1, cellH - 1);
          } else {
            ctx.globalAlpha = 1;
            ctx.fillStyle = "#0D0B1A";
            ctx.fillRect(x + 0.5, y + 0.5, cellW - 1, cellH - 1);
            ctx.strokeStyle = "#1E1A35";
            ctx.lineWidth = 0.5;
            ctx.strokeRect(x + 0.5, y + 0.5, cellW - 1, cellH - 1);
          }
        }
      }
      pulse += 0.02;
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  const remaining = TOTAL_BLOCKS - soldCount;
  const pct = ((soldCount / TOTAL_BLOCKS) * 100).toFixed(2);

  const handlePurchase = () => {
    setPurchased(true);
    setTimeout(() => {
      setShowPurchase(false);
      setPurchased(false);
      setSelectedBlock(null);
    }, 2500);
  };

  return (
    <div style={{ minHeight: "100vh", background: PALETTE.bg, color: PALETTE.text, fontFamily: "monospace" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
      `}</style>

      {/* HEADER */}
      <div style={{ background: "#0D0B1A", borderBottom: "1px solid #1E1A35", padding: "0 20px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 800, fontSize: 20 }}>
          🌐 Global<span style={{ color: "#A855F7" }}>Canvas</span>
        </div>
        <button
          onClick={() => { setSelectedBlock({ x: Math.floor(Math.random()*1000), y: Math.floor(Math.random()*1000) }); setShowPurchase(true); }}
          style={{ background: "linear-gradient(135deg,#7C3AED,#A855F7)", border: "none", borderRadius: 8, padding: "8px 18px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          Buy Block — €1
        </button>
      </div>

      {/* BANNER */}
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
              { icon: "👥", label: "Owners", value: "89,341", color: "#06B6D4" },
              { icon: "💰", label: "Total Value", value: `€${(soldCount/1000).toFixed(1)}K`, color: "#10B981" },
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
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #1E1A35", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700 }}>🌍 Live Canvas</span>
              <button
                onClick={() => { const el = document.documentElement; if (!document.fullscreenElement) { el.requestFullscreen(); } else { document.exitFullscreen(); } }}
                style={{ padding: "4px 12px", background: "transparent", border: "1px solid #1E1A35", borderRadius: 4, color: "#6B6585", fontSize: 11, cursor: "pointer" }}>
                Full Screen
              </button>
            </div>
            <canvas
              ref={canvasRef}
              width={620}
              height={400}
              style={{ display: "block", cursor: "crosshair", width: "100%" }}
              onClick={() => { setSelectedBlock({ x: Math.floor(Math.random()*1000), y: Math.floor(Math.random()*1000) }); setShowPurchase(true); }}
            />
            <div style={{ padding: "10px 16px", borderTop: "1px solid #1E1A35", fontSize: 11, color: "#6B6585" }}>
              👆 Click any block to purchase · Scroll to zoom
            </div>
          </div>

          {/* Progress */}
          <div style={{ marginTop: 16, background: "#0D0B1A", border: "1px solid #1E1A35", borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700 }}>Canvas Completion</span>
              <span style={{ fontSize: 12, color: "#A855F7", fontWeight: 700 }}>{pct}%</span>
            </div>
            <div style={{ height: 10, background: "#1E1A35", borderRadius: 5, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#7C3AED,#A855F7,#06B6D4)", borderRadius: 5, transition: "width 0.5s" }} />
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
            <div style={{ padding: "6px 0", minHeight: 200 }}>
              {feedItems.map((item, i) => (
                <div key={item.id} style={{ padding: "6px 12px", display: "flex", alignItems: "center", gap: 8, borderLeft: i === 0 ? "2px solid #7C3AED" : "2px solid transparent", animation: i === 0 ? "slideIn 0.3s ease" : "none" }}>
                  <span style={{ fontSize: 14 }}>{item.flag}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ color: "#A855F7", fontSize: 11, fontWeight: 600 }}>{item.user}</span>
                    <span style={{ color: "#6B6585", fontSize: 10 }}> bought [{item.x},{item.y}]</span>
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
            <div style={{ fontSize: 11, color: "#6B6585", marginBottom: 16, lineHeight: 1.5 }}>Leave your mark on the world's largest collaborative artwork. Just €1 — forever.</div>
            <button
              onClick={() => { setSelectedBlock({ x: Math.floor(Math.random()*1000), y: Math.floor(Math.random()*1000) }); setShowPurchase(true); }}
              style={{ width: "100%", padding: 12, background: "linear-gradient(135deg,#7C3AED,#A855F7)", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
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
          <div style={{ background: "#0D0B1A", border: "1px solid #7C3AED", borderRadius: 20, padding: 32, maxWidth: 420, width: "100%", position: "relative" }}>
            {!purchased ? (
              <>
                <button onClick={() => setShowPurchase(false)} style={{ position: "absolute", top: 16, right: 16, background: "transparent", border: "none", color: "#6B6585", fontSize: 22, cursor: "pointer" }}>×</button>
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                  <div style={{ fontSize: 40, marginBottom: 10, animation: "float 3s infinite" }}>🎨</div>
                  <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>Claim Your Block</div>
                  <div style={{ color: "#6B6585", fontSize: 12 }}>Block <span style={{ color: "#06B6D4", fontFamily: "monospace" }}>[{selectedBlock?.x}, {selectedBlock?.y}]</span> · Available</div>
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
                  <span style={{ fontSize: 11, color: "#FCA5A5", fontWeight: 600 }}>🔴 {Math.floor(Math.random()*15+3)} people viewing this block right now</span>
                </div>
                <button onClick={handlePurchase} style={{ width: "100%", padding: 14, background: "linear-gradient(135deg,#7C3AED,#A855F7)", border: "none", borderRadius: 10, color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer" }}>
                  🔒 Buy Block — €1.00
                </button>
                <div style={{ textAlign: "center", marginTop: 10, fontSize: 10, color: "#6B6585" }}>Powered by Stripe · SSL Encrypted · Instant ownership</div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 56, marginBottom: 12, animation: "float 1s infinite" }}>🎉</div>
                <div style={{ fontWeight: 800, fontSize: 20, color: "#10B981", marginBottom: 8 }}>You own Block [{selectedBlock?.x}, {selectedBlock?.y}]!</div>
                <div style={{ color: "#6B6585", fontSize: 12, lineHeight: 1.6, marginBottom: 20 }}>You are now permanently part of the world's largest collaborative digital artwork!</div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                  {["𝕏 Share","📘 Share","📷 Instagram","🎵 TikTok"].map(s => (
                    <button key={s} style={{ padding: "8px 14px", background: "rgba(124,58,237,0.2)", border: "1px solid #7C3AED", borderRadius: 8, color: "#A855F7", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>{s}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div style={{ borderTop: "1px solid #1E1A35", padding: "20px", marginTop: 20, textAlign: "center" }}>
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>Global<span style={{ color: "#A855F7" }}>Canvas</span></div>
        <div style={{ fontSize: 11, color: "#6B6585" }}>{soldCount.toLocaleString()} / 1,000,000 blocks sold · {remaining.toLocaleString()} remaining</div>
      </div>
    </div>
  );
}