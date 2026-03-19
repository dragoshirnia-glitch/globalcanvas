"use client";

import { useState, useEffect, useRef } from "react";

const TOTAL_BLOCKS = 1_000_000;
const GRID_BLOCKS = 1000;
const BLOCK_SIZE = 20;

const COUNTRY_FLAGS = ["🇺🇸","🇩🇪","🇫🇷","🇯🇵","🇧🇷","🇬🇧","🇨🇦","🇦🇺","🇮🇳","🇰🇷"];
const USERNAMES = ["pixel_king","art3mis","neon_wolf","cosmic_dot","grid_ghost","voxel_queen","blocksmith","the_painter"];
const PRESET_COLORS = ["#7C3AED","#A855F7","#06B6D4","#10B981","#F59E0B","#EF4444","#3B82F6","#EC4899","#14B8A6","#F97316","#FFFFFF","#FFD700"];

export default function GlobalCanvas() {
  const [soldCount, setSoldCount] = useState(0);
  const [feedItems, setFeedItems] = useState([]);
  const [showPurchase, setShowPurchase] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [customBlock, setCustomBlock] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingBlocks, setLoadingBlocks] = useState(true);
  const [customColor, setCustomColor] = useState("#7C3AED");
  const [blockName, setBlockName] = useState("");
  const [blockLink, setBlockLink] = useState("");
  const [hoveredBlock, setHoveredBlock] = useState(null);
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const ownedBlocksRef = useRef({});
  const blocksDataRef = useRef({});

  const VISIBLE_COLS = 50;
  const VISIBLE_ROWS = 40;
  const CANVAS_W = VISIBLE_COLS * BLOCK_SIZE;
  const CANVAS_H = VISIBLE_ROWS * BLOCK_SIZE;

  const redrawCanvas = (offsetX, offsetY) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#03010A";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    for (let row = 0; row < VISIBLE_ROWS; row++) {
      for (let col = 0; col < VISIBLE_COLS; col++) {
        const blockCol = col + offsetX;
        const blockRow = row + offsetY;
        if (blockCol >= GRID_BLOCKS || blockRow >= GRID_BLOCKS) continue;
        const key = `${blockCol}_${blockRow}`;
        const px = col * BLOCK_SIZE;
        const py = row * BLOCK_SIZE;
        if (blocksDataRef.current[key]) {
          ctx.fillStyle = blocksDataRef.current[key].color;
        } else {
          ctx.fillStyle = "#0A0818";
        }
        ctx.fillRect(px + 1, py + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
        ctx.strokeStyle = "#1E1A35";
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 0.5, py + 0.5, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    redrawCanvas(0, 0);
  }, []);

  useEffect(() => {
    const loadBlocks = async () => {
      try {
        const response = await fetch('/api/blocks');
        const data = await response.json();
        if (data.blocks && data.blocks.length > 0) {
          setSoldCount(data.blocks.length);
          data.blocks.forEach(block => {
            blocksDataRef.current[`${block.x}_${block.y}`] = {
              color: block.color,
              name: block.owner_name,
              link: block.owner_link
            };
          });
          redrawCanvas(viewOffset.x, viewOffset.y);
        }
      } catch (err) {
        console.error('Error loading blocks:', err);
      } finally {
        setLoadingBlocks(false);
      }
    };
    setTimeout(loadBlocks, 300);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      const block = params.get('block');
      if (block) {
        const [x, y] = block.split('_').map(Number);
        setCustomBlock({ x, y });
        setShowCustomize(true);
      }
      window.history.replaceState({}, '', '/');
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setFeedItems(prev => [{
        id: Date.now(),
        flag: COUNTRY_FLAGS[Math.floor(Math.random() * COUNTRY_FLAGS.length)],
        user: USERNAMES[Math.floor(Math.random() * USERNAMES.length)],
        x: Math.floor(Math.random() * GRID_BLOCKS),
        y: Math.floor(Math.random() * GRID_BLOCKS),
        ago: "just now"
      }, ...prev.slice(0, 10)]);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const getBlockFromEvent = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor(x / BLOCK_SIZE) + viewOffset.x;
    const row = Math.floor(y / BLOCK_SIZE) + viewOffset.y;
    if (col < 0 || col >= GRID_BLOCKS || row < 0 || row >= GRID_BLOCKS) return null;
    return { col, row };
  };

  const handleCanvasClick = (e) => {
    if (isDragging) return;
    const block = getBlockFromEvent(e);
    if (!block) return;
    const key = `${block.col}_${block.row}`;
    if (blocksDataRef.current[key]) {
      const b = blocksDataRef.current[key];
      alert(`Bloc [${block.col}, ${block.row}]\nProprietar: ${b.name || 'Anonim'}\nLink: ${b.link || 'N/A'}`);
      return;
    }
    setSelectedBlock({ x: block.col, y: block.row });
    setShowPurchase(true);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const dx = Math.floor((e.clientX - dragStart.x) / BLOCK_SIZE);
      const dy = Math.floor((e.clientY - dragStart.y) / BLOCK_SIZE);
      if (dx !== 0 || dy !== 0) {
        const newX = Math.max(0, Math.min(GRID_BLOCKS - VISIBLE_COLS, viewOffset.x - dx));
        const newY = Math.max(0, Math.min(GRID_BLOCKS - VISIBLE_ROWS, viewOffset.y - dy));
        setViewOffset({ x: newX, y: newY });
        setDragStart({ x: e.clientX, y: e.clientY });
        redrawCanvas(newX, newY);
      }
      return;
    }
    const block = getBlockFromEvent(e);
    if (block) setHoveredBlock({ x: block.col, y: block.row });
  };

  const handleMouseDown = (e) => {
    setIsDragging(false);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const navigate = (dir) => {
    const step = 5;
    let newX = viewOffset.x;
    let newY = viewOffset.y;
    if (dir === 'left') newX = Math.max(0, newX - step);
    if (dir === 'right') newX = Math.min(GRID_BLOCKS - VISIBLE_COLS, newX + step);
    if (dir === 'up') newY = Math.max(0, newY - step);
    if (dir === 'down') newY = Math.min(GRID_BLOCKS - VISIBLE_ROWS, newY + step);
    setViewOffset({ x: newX, y: newY });
    redrawCanvas(newX, newY);
  };

  const openModal = () => {
    const c = Math.floor(Math.random() * GRID_BLOCKS);
    const r = Math.floor(Math.random() * GRID_BLOCKS);
    setSelectedBlock({ x: c, y: r });
    setShowPurchase(true);
  };

  const handleBuyNow = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockX: selectedBlock.x, blockY: selectedBlock.y }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Eroare: ' + (data.error || 'Unknown error'));
        setLoading(false);
      }
    } catch (err) {
      alert('Eroare: ' + err.message);
      setLoading(false);
    }
  };

  const handleSaveCustomization = async () => {
    if (!customBlock) return;
    setLoading(true);
    try {
      const response = await fetch('/api/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          x: customBlock.x,
          y: customBlock.y,
          color: customColor,
          ownerName: blockName || 'Anonim',
          ownerLink: blockLink || ''
        }),
      });
      const data = await response.json();
      if (data.success) {
        blocksDataRef.current[`${customBlock.x}_${customBlock.y}`] = {
          color: customColor, name: blockName, link: blockLink
        };
        redrawCanvas(viewOffset.x, viewOffset.y);
        setSoldCount(c => c + 1);
        setShowCustomize(false);
        setCustomBlock(null);
        setBlockName("");
        setBlockLink("");
        setCustomColor("#7C3AED");
        alert("Blocul tau a fost salvat permanent!");
      }
    } catch (err) {
      alert('Eroare: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const remaining = TOTAL_BLOCKS - soldCount;
  const pct = ((soldCount / TOTAL_BLOCKS) * 100).toFixed(4);

  return (
    <div style={{ minHeight:"100vh", background:"#03010A", color:"#F0ECFF", fontFamily:"monospace" }}>
      <style>{`
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
        .btn:hover { opacity:0.85; }
        input[type=color] { width:40px; height:40px; border:none; border-radius:8px; cursor:pointer; padding:2px; background:transparent; }
        input[type=text] { background:#03010A; border:1px solid #1E1A35; border-radius:8px; color:#F0ECFF; padding:10px 12px; font-family:monospace; font-size:13px; width:100%; outline:none; }
        input[type=text]:focus { border-color:#7C3AED; }
      `}</style>

      <div style={{ background:"#0D0B1A", borderBottom:"1px solid #1E1A35", padding:"0 20px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ fontWeight:800, fontSize:20 }}>🌐 Global<span style={{ color:"#A855F7" }}>Canvas</span></div>
        <button className="btn" onClick={openModal}
          style={{ background:"linear-gradient(135deg,#7C3AED,#A855F7)", border:"none", borderRadius:8, padding:"8px 18px", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>
          Buy Block - 1 EUR
        </button>
      </div>

      <div style={{ background:"rgba(239,68,68,0.1)", borderBottom:"1px solid rgba(239,68,68,0.3)", padding:"8px 20px", textAlign:"center" }}>
        <span style={{ animation:"pulse 1s infinite", marginRight:8 }}>🔴</span>
        <span style={{ fontWeight:700, color:"#FCA5A5", fontSize:13 }}>ONLY {remaining.toLocaleString()} BLOCKS REMAINING - {pct}% sold forever</span>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:24, display:"grid", gridTemplateColumns:"1fr 260px", gap:20 }}>
        <div>
          <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
            {[
              { icon:"🧱", label:"Blocks Sold", value:soldCount.toLocaleString(), color:"#A855F7" },
              { icon:"⬜", label:"Remaining", value:remaining.toLocaleString(), color:"#F59E0B" },
              { icon:"👥", label:"Owners", value:soldCount.toString(), color:"#06B6D4" },
              { icon:"💰", label:"Total Value", value:"EUR "+soldCount.toLocaleString(), color:"#10B981" },
            ].map((s,i) => (
              <div key={i} style={{ flex:1, minWidth:120, background:"#0D0B1A", border:"1px solid #1E1A35", borderRadius:12, padding:"14px 16px" }}>
                <div style={{ fontSize:20 }}>{s.icon}</div>
                <div style={{ fontSize:22, fontWeight:800, color:s.color, marginTop:4 }}>{s.value}</div>
                <div style={{ fontSize:10, color:"#6B6585", marginTop:2, textTransform:"uppercase", letterSpacing:1 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ background:"#0D0B1A", border:"1px solid #1E1A35", borderRadius:16, overflow:"hidden" }}>
            <div style={{ padding:"12px 16px", borderBottom:"1px solid #1E1A35", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontWeight:700, fontSize:13 }}>🌍 Live Canvas - zona [{viewOffset.x},{viewOffset.y}] din 1000x1000</span>
              <div style={{ display:"flex", gap:6 }}>
                {[
                  { label:"◀", action:() => navigate('left') },
                  { label:"▶", action:() => navigate('right') },
                  { label:"▲", action:() => navigate('up') },
                  { label:"▼", action:() => navigate('down') },
                  { label:"⛶ Full Screen", action:() => { const el=document.documentElement; if(!document.fullscreenElement){el.requestFullscreen();}else{document.exitFullscreen();} }},
                ].map((b,i) => (
                  <button key={i} onClick={b.action} className="btn" style={{ padding:"4px 10px", background:"transparent", border:"1px solid #1E1A35", borderRadius:4, color:"#6B6585", fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>{b.label}</button>
                ))}
              </div>
            </div>

            {hoveredBlock && (
              <div style={{ padding:"4px 16px", background:"rgba(124,58,237,0.1)", borderBottom:"1px solid #1E1A35", fontSize:11, color:"#A855F7" }}>
                Block [{hoveredBlock.x}, {hoveredBlock.y}] {blocksDataRef.current[`${hoveredBlock.x}_${hoveredBlock.y}`] ? `- Proprietar: ${blocksDataRef.current[`${hoveredBlock.x}_${hoveredBlock.y}`].name || 'Anonim'}` : '- Disponibil - 1 EUR'}
              </div>
            )}

            <div style={{ background:"#03010A", position:"relative" }}>
              {loadingBlocks && (
                <div style={{ position:"absolute", top:20, left:"50%", transform:"translateX(-50%)", background:"rgba(13,11,26,0.9)", padding:"8px 16px", borderRadius:8, border:"1px solid #1E1A35", fontSize:12, color:"#A855F7", zIndex:10 }}>
                  Se incarca blocurile...
                </div>
              )}
              <canvas ref={canvasRef}
                style={{ display:"block", cursor: isDragging ? "grabbing" : "crosshair", width:"100%" }}
                onClick={handleCanvasClick}
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
              />
            </div>

            <div style={{ padding:"10px 16px", borderTop:"1px solid #1E1A35", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:11, color:"#6B6585" }}>👆 Click bloc = cumpara | Drag = muta | Butoane sageti = navigare</span>
              <span style={{ fontSize:11, color:"#A855F7", fontWeight:700 }}>Zona: [{viewOffset.x},{viewOffset.y}] din 1000x1000</span>
            </div>
          </div>

          <div style={{ marginTop:16, background:"#0D0B1A", border:"1px solid #1E1A35", borderRadius:12, padding:16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <span style={{ fontSize:12, fontWeight:700 }}>Canvas Completion</span>
              <span style={{ fontSize:12, color:"#A855F7", fontWeight:700 }}>{pct}%</span>
            </div>
            <div style={{ height:10, background:"#1E1A35", borderRadius:5, overflow:"hidden" }}>
              <div style={{ height:"100%", width:soldCount>0?`${pct}%`:"2px", background:"linear-gradient(90deg,#7C3AED,#A855F7,#06B6D4)", borderRadius:5, transition:"width 0.5s" }} />
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
              <span style={{ fontSize:10, color:"#6B6585" }}>0 blocks</span>
              <span style={{ fontSize:10, color:"#F59E0B", fontWeight:600 }}>{soldCount.toLocaleString()} sold</span>
              <span style={{ fontSize:10, color:"#6B6585" }}>1,000,000 blocks</span>
            </div>
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ background:"#0D0B1A", border:"1px solid #1E1A35", borderRadius:12, overflow:"hidden" }}>
            <div style={{ padding:"12px 16px", borderBottom:"1px solid #1E1A35", display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:7, height:7, background:"#10B981", borderRadius:"50%", animation:"pulse 1s infinite" }} />
              <span style={{ fontSize:12, fontWeight:700 }}>Live Purchases</span>
            </div>
            <div style={{ padding:"6px 0", minHeight:180 }}>
              {feedItems.map((item,i) => (
                <div key={item.id} style={{ padding:"6px 12px", display:"flex", alignItems:"center", gap:8, borderLeft:i===0?"2px solid #7C3AED":"2px solid transparent", animation:i===0?"slideIn 0.3s ease":"none" }}>
                  <span style={{ fontSize:14 }}>{item.flag}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <span style={{ color:"#A855F7", fontSize:11, fontWeight:600 }}>{item.user}</span>
                    <span style={{ color:"#6B6585", fontSize:10 }}> [{item.x},{item.y}]</span>
                  </div>
                  <span style={{ fontSize:10, color:"#6B6585" }}>{item.ago}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background:"linear-gradient(135deg,rgba(124,58,237,0.2),rgba(6,182,212,0.1))", border:"1px solid #7C3AED", borderRadius:12, padding:20, textAlign:"center" }}>
            <div style={{ fontSize:32, marginBottom:8, animation:"float 3s ease-in-out infinite" }}>🎨</div>
            <div style={{ fontWeight:800, fontSize:15, marginBottom:6 }}>Own Your Piece</div>
            <div style={{ fontSize:11, color:"#6B6585", marginBottom:16, lineHeight:1.5 }}>Leave your mark forever. Just 1 EUR.</div>
            <button className="btn" onClick={openModal}
              style={{ width:"100%", padding:12, background:"linear-gradient(135deg,#7C3AED,#A855F7)", border:"none", borderRadius:8, color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer" }}>
              Buy a Block - 1 EUR
            </button>
            <div style={{ fontSize:10, color:"#6B6585", marginTop:8 }}>Stripe - Secure - Instant</div>
          </div>

          <div style={{ background:"#0D0B1A", border:"1px solid #1E1A35", borderRadius:12, overflow:"hidden" }}>
            <div style={{ padding:"12px 16px", borderBottom:"1px solid #1E1A35" }}>
              <span style={{ fontSize:12, fontWeight:700 }}>🏆 Top Collectors</span>
            </div>
            {[
              {rank:1,user:"pixel_king",country:"🇺🇸",blocks:47},
              {rank:2,user:"art3mis",country:"🇩🇪",blocks:31},
              {rank:3,user:"neon_wolf",country:"🇯🇵",blocks:28},
              {rank:4,user:"cosmic_dot",country:"🇫🇷",blocks:22},
              {rank:5,user:"grid_ghost",country:"🇧🇷",blocks:19},
            ].map((u,i) => (
              <div key={i} style={{ padding:"10px 16px", display:"flex", alignItems:"center", gap:10, borderBottom:i<4?"1px solid #1E1A35":"none" }}>
                <span style={{ fontSize:14, minWidth:24, fontWeight:800, color:i===0?"#F59E0B":i===1?"#C0C0C0":i===2?"#CD7F32":"#6B6585" }}>#{u.rank}</span>
                <span>{u.country}</span>
                <span style={{ flex:1, fontSize:11, fontWeight:600 }}>{u.user}</span>
                <span style={{ fontSize:10, color:"#6B6585" }}>{u.blocks} blocks</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showPurchase && (
        <div style={{ position:"fixed", inset:0, background:"rgba(3,1,10,0.85)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
          onClick={e => { if(e.target===e.currentTarget && !loading) setShowPurchase(false); }}>
          <div style={{ background:"#0D0B1A", border:"1px solid #7C3AED", borderRadius:20, padding:32, maxWidth:420, width:"100%", position:"relative", boxShadow:"0 0 60px rgba(124,58,237,0.3)" }}>
            <button onClick={() => setShowPurchase(false)} style={{ position:"absolute", top:16, right:16, background:"transparent", border:"none", color:"#6B6585", fontSize:22, cursor:"pointer" }}>x</button>
            <div style={{ textAlign:"center", marginBottom:24 }}>
              <div style={{ fontSize:40, marginBottom:10, animation:"float 3s infinite" }}>🎨</div>
              <div style={{ fontWeight:800, fontSize:20, marginBottom:4 }}>Claim Your Block</div>
              <div style={{ color:"#6B6585", fontSize:12 }}>Block <span style={{ color:"#06B6D4" }}>[{selectedBlock?.x}, {selectedBlock?.y}]</span> - Available</div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
              {[["Price","1.00 EUR"],["Location","["+selectedBlock?.x+","+selectedBlock?.y+"]"],["Ownership","Permanent"],["Customizable","Yes"]].map(([l,v],i) => (
                <div key={i} style={{ background:"#03010A", borderRadius:8, padding:"10px 12px" }}>
                  <div style={{ fontSize:10, color:"#6B6585", marginBottom:3 }}>{l}</div>
                  <div style={{ fontSize:13, fontWeight:700 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.2)", borderRadius:8, padding:"10px 14px", marginBottom:20 }}>
              <span style={{ fontSize:11, color:"#6EE7B7", fontWeight:600 }}>Dupa plata alegi culoarea si blocul se salveaza permanent!</span>
            </div>
            <button className="btn" onClick={handleBuyNow} disabled={loading}
              style={{ width:"100%", padding:14, background:loading?"#6B6585":"linear-gradient(135deg,#7C3AED,#A855F7)", border:"none", borderRadius:10, color:"#fff", fontWeight:800, fontSize:16, cursor:loading?"not-allowed":"pointer", fontFamily:"monospace" }}>
              {loading ? "Se incarca..." : "Cumpara Blocul - 1 EUR"}
            </button>
            <div style={{ textAlign:"center", marginTop:10, fontSize:10, color:"#6B6585" }}>Vei fi redirectionat la Stripe</div>
          </div>
        </div>
      )}

      {showCustomize && customBlock && (
        <div style={{ position:"fixed", inset:0, background:"rgba(3,1,10,0.95)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ background:"#0D0B1A", border:"2px solid #10B981", borderRadius:20, padding:32, maxWidth:480, width:"100%", boxShadow:"0 0 60px rgba(16,185,129,0.3)" }}>
            <div style={{ textAlign:"center", marginBottom:24 }}>
              <div style={{ fontSize:48, marginBottom:8 }}>🎉</div>
              <div style={{ fontWeight:800, fontSize:22, color:"#10B981", marginBottom:4 }}>Plata Reusita!</div>
              <div style={{ color:"#6B6585", fontSize:13 }}>Personalizeaza blocul [{customBlock.x}, {customBlock.y}]</div>
            </div>

            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:12, fontWeight:700, marginBottom:10, color:"#A855F7" }}>Alege Culoarea</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:12 }}>
                {PRESET_COLORS.map((color, i) => (
                  <div key={i} onClick={() => setCustomColor(color)}
                    style={{ width:36, height:36, background:color, borderRadius:8, cursor:"pointer", border:customColor===color?"3px solid #fff":"3px solid transparent", transition:"all 0.2s" }} />
                ))}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <input type="color" value={customColor} onChange={e => setCustomColor(e.target.value)} />
                <span style={{ fontSize:12, color:"#6B6585" }}>Sau orice culoare</span>
              </div>
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20, padding:"12px 16px", background:"#03010A", borderRadius:10 }}>
              <div style={{ width:40, height:40, background:customColor, borderRadius:6, flexShrink:0 }} />
              <div>
                <div style={{ fontSize:12, fontWeight:700 }}>Preview bloc [{customBlock.x}, {customBlock.y}]</div>
                <div style={{ fontSize:10, color:"#6B6585" }}>Asa va arata pe canvas</div>
              </div>
            </div>

            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:12, fontWeight:700, marginBottom:8, color:"#A855F7" }}>Numele Tau (optional)</div>
              <input type="text" placeholder="ex: Ion Popescu" value={blockName} onChange={e => setBlockName(e.target.value)} />
            </div>

            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:12, fontWeight:700, marginBottom:8, color:"#A855F7" }}>Link-ul Tau (optional)</div>
              <input type="text" placeholder="ex: https://siteultau.ro" value={blockLink} onChange={e => setBlockLink(e.target.value)} />
            </div>

            <button className="btn" onClick={handleSaveCustomization} disabled={loading}
              style={{ width:"100%", padding:14, background:loading?"#6B6585":"linear-gradient(135deg,#10B981,#06B6D4)", border:"none", borderRadius:10, color:"#fff", fontWeight:800, fontSize:16, cursor:loading?"not-allowed":"pointer", fontFamily:"monospace" }}>
              {loading ? "Se salveaza..." : "Salveaza pe Canvas - Permanent!"}
            </button>

            <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:16 }}>
              <button onClick={() => window.open("https://twitter.com/intent/tweet?text=Am cumparat Blocul ["+customBlock.x+","+customBlock.y+"] pe GlobalCanvas!&url=https://www.globalcanvas.design","_blank")}
                style={{ padding:"8px 14px", background:"rgba(124,58,237,0.2)", border:"1px solid #7C3AED", borderRadius:8, color:"#A855F7", fontSize:12, cursor:"pointer", fontWeight:600 }}>Share Twitter</button>
              <button onClick={() => { navigator.clipboard.writeText("https://www.globalcanvas.design"); alert("Link copiat!"); }}
                style={{ padding:"8px 14px", background:"rgba(124,58,237,0.2)", border:"1px solid #7C3AED", borderRadius:8, color:"#A855F7", fontSize:12, cursor:"pointer", fontWeight:600 }}>Copiaza Link</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ borderTop:"1px solid #1E1A35", padding:"20px", marginTop:20, textAlign:"center" }}>
        <div style={{ fontWeight:800, fontSize:16, marginBottom:4 }}>Global<span style={{ color:"#A855F7" }}>Canvas</span></div>
        <div style={{ fontSize:11, color:"#6B6585" }}>{soldCount.toLocaleString()} / 1,000,000 blocks sold - {remaining.toLocaleString()} remaining</div>
      </div>
    </div>
  );
}
