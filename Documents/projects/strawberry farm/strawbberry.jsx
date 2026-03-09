import { useState, useEffect, useCallback } from "react";

const CARD_TYPES = [
  { id: "strawberry", emoji: "🍓", label: "Strawberry", value: 10, count: 8 },
  { id: "golden", emoji: "🌟", label: "Golden Berry", value: 30, count: 2 },
  { id: "weed", emoji: "🌿", label: "Weed", value: -5, count: 4 },
  { id: "bug", emoji: "🐛", label: "Bug", value: -15, count: 4 },
  { id: "rain", emoji: "🌧️", label: "Rain Boost", value: 0, count: 2, special: "double" },
];

const UPGRADES = [
  { id: "shovel", label: "Lucky Shovel", desc: "Start each round with 1 card revealed", cost: 40, icon: "⛏️" },
  { id: "scarecrow", label: "Scarecrow", desc: "Bugs deal half damage", cost: 60, icon: "🪄" },
  { id: "greenhouse", label: "Greenhouse", desc: "+2 strawberry cards per round", icon: "🏡", cost: 80 },
];

function generateDeck(upgrades) {
  const deck = [];
  let id = 0;
  CARD_TYPES.forEach((type) => {
    let count = type.count;
    if (type.id === "strawberry" && upgrades.includes("greenhouse")) count += 2;
    for (let i = 0; i < count; i++) {
      deck.push({ ...type, uid: id++, flipped: false, matched: false });
    }
  });
  return deck.sort(() => Math.random() - 0.5);
}

const PHASES = { FARM: "farm", SELL: "sell", SHOP: "shop" };

export default function StrawberrySolitaire() {
  const [coins, setCoins] = useState(0);
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState(PHASES.FARM);
  const [deck, setDeck] = useState([]);
  const [selected, setSelected] = useState(null);
  const [harvest, setHarvest] = useState([]);
  const [message, setMessage] = useState("Flip cards to find strawberries! Match pairs to harvest them.");
  const [flipsLeft, setFlipsLeft] = useState(18);
  const [upgrades, setUpgrades] = useState([]);
  const [roundEarnings, setRoundEarnings] = useState(0);
  const [rainActive, setRainActive] = useState(false);
  const [shake, setShake] = useState(null);
  const [sparkle, setSparkle] = useState(null);

  const startRound = useCallback((upgs = upgrades) => {
    const newDeck = generateDeck(upgs);
    if (upgs.includes("shovel")) {
      newDeck[Math.floor(Math.random() * newDeck.length)].flipped = true;
    }
    setDeck(newDeck);
    setSelected(null);
    setHarvest([]);
    setFlipsLeft(18);
    setRainActive(false);
    setMessage("🌱 A new field awaits! Find and match the strawberries.");
  }, [upgrades]);

  useEffect(() => { startRound(); }, []);

  const flipCard = (uid) => {
    const card = deck.find(c => c.uid === uid);
    if (!card || card.flipped || card.matched || flipsLeft <= 0) return;

    const newDeck = deck.map(c => c.uid === uid ? { ...c, flipped: true } : c);
    setDeck(newDeck);
    setFlipsLeft(f => f - 1);

    if (card.id === "rain") {
      setRainActive(true);
      setMessage("🌧️ Rain Boost! Next match scores double!");
      setSparkle(uid);
      setTimeout(() => setSparkle(null), 600);
      setSelected(null);
      return;
    }

    if (card.id === "weed") {
      const penalty = -5;
      setRoundEarnings(e => e + penalty);
      setMessage(`🌿 A weed! ${penalty} coins.`);
      setShake(uid); setTimeout(() => setShake(null), 400);
      setSelected(null);
      return;
    }

    if (card.id === "bug") {
      const penalty = upgrades.includes("scarecrow") ? -7 : -15;
      setRoundEarnings(e => e + penalty);
      setMessage(`🐛 A bug got your berries! ${penalty} coins.`);
      setShake(uid); setTimeout(() => setShake(null), 400);
      setSelected(null);
      return;
    }

    if (!selected) {
      setSelected(card);
      setMessage(`🍓 Found a ${card.label}! Find its match.`);
    } else {
      if (selected.id === card.id && selected.uid !== card.uid) {
        const mult = rainActive ? 2 : 1;
        const earned = card.value * 2 * mult;
        setRoundEarnings(e => e + earned);
        setHarvest(h => [...h, card, selected]);
        setDeck(d => d.map(c => (c.uid === uid || c.uid === selected.uid) ? { ...c, matched: true } : c));
        setMessage(`✨ Match! +${earned} coins${rainActive ? " (Rain Boost!)" : ""}!`);
        setRainActive(false);
        setSparkle(uid); setTimeout(() => setSparkle(null), 600);
      } else {
        setDeck(d => d.map(c => (c.uid === uid || c.uid === selected.uid) ? { ...c, flipped: false } : c));
        setFlipsLeft(f => f + 1);
        setMessage("❌ No match! Cards flipped back.");
        setShake(uid); setTimeout(() => setShake(null), 400);
      }
      setSelected(null);
    }
  };

  const endRound = () => {
    setCoins(c => Math.max(0, c + roundEarnings));
    setPhase(PHASES.SELL);
  };

  const goToShop = () => { setPhase(PHASES.SHOP); };

  const buyUpgrade = (upg) => {
    if (coins >= upg.cost && !upgrades.includes(upg.id)) {
      setCoins(c => c - upg.cost);
      setUpgrades(u => [...u, upg.id]);
    }
  };

  const nextRound = () => {
    setRound(r => r + 1);
    setRoundEarnings(0);
    setPhase(PHASES.FARM);
    startRound(upgrades);
  };

  const unmatched = deck.filter(c => !c.matched);
  const berryCount = harvest.filter(c => c.id === "strawberry" || c.id === "golden").length / 2;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #1a0a2e 0%, #2d1b0e 50%, #0f1a0a 100%)",
      fontFamily: "'Georgia', serif",
      color: "#f5e6c8",
      padding: "0",
      overflowX: "hidden",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(90deg, #4a1a0a, #8b2f0a, #4a1a0a)",
        borderBottom: "3px solid #c8752a",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 4px 20px rgba(200,100,30,0.3)",
      }}>
        <div>
          <div style={{ fontSize: "22px", fontWeight: "bold", color: "#f5c842", letterSpacing: "2px", textShadow: "0 0 10px rgba(245,200,66,0.5)" }}>
            🍓 Strawberry Solitaire
          </div>
          <div style={{ fontSize: "11px", color: "#c8a87a", letterSpacing: "1px" }}>ROUND {round} · FARM & MATCH</div>
        </div>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "20px", color: "#f5c842" }}>🌾 {berryCount}</div>
            <div style={{ fontSize: "10px", color: "#a87a50" }}>HARVESTED</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "20px", color: "#f5c842" }}>💰 {coins}</div>
            <div style={{ fontSize: "10px", color: "#a87a50" }}>COINS</div>
          </div>
          {phase === PHASES.FARM && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "20px", color: flipsLeft <= 5 ? "#ff6b4a" : "#8dde78" }}>🃏 {flipsLeft}</div>
              <div style={{ fontSize: "10px", color: "#a87a50" }}>FLIPS LEFT</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: "20px", maxWidth: "700px", margin: "0 auto" }}>

        {/* Message bar */}
        <div style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(200,150,80,0.3)",
          borderRadius: "8px",
          padding: "10px 16px",
          marginBottom: "20px",
          fontSize: "14px",
          color: "#e8d0a0",
          textAlign: "center",
          minHeight: "38px",
        }}>
          {message}
          {rainActive && <span style={{ marginLeft: "8px", color: "#7ec8e3" }}>☔ 2x Active!</span>}
        </div>

        {/* FARM PHASE */}
        {phase === PHASES.FARM && (
          <>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "10px",
              marginBottom: "20px",
            }}>
              {deck.map((card) => {
                const isSelected = selected?.uid === card.uid;
                const isShaking = shake === card.uid;
                const isSparkle = sparkle === card.uid;
                return (
                  <div
                    key={card.uid}
                    onClick={() => flipCard(card.uid)}
                    style={{
                      width: "100%",
                      aspectRatio: "3/4",
                      borderRadius: "10px",
                      cursor: card.matched || card.flipped ? "default" : "pointer",
                      position: "relative",
                      transition: "transform 0.15s",
                      transform: isShaking ? "scale(0.9)" : isSelected ? "scale(1.08) translateY(-4px)" : "scale(1)",
                      opacity: card.matched ? 0.15 : 1,
                      background: card.flipped
                        ? card.matched
                          ? "rgba(100,180,80,0.2)"
                          : "linear-gradient(135deg, #2a1505, #3d2010)"
                        : "linear-gradient(135deg, #1e3a1e, #2a4f1a)",
                      border: isSelected
                        ? "2px solid #f5c842"
                        : card.matched
                        ? "2px solid rgba(100,180,80,0.3)"
                        : card.flipped
                        ? "2px solid #8b5a2b"
                        : "2px solid #3a6e2a",
                      boxShadow: isSelected
                        ? "0 0 16px rgba(245,200,66,0.6)"
                        : isSparkle
                        ? "0 0 20px rgba(100,220,100,0.8)"
                        : "0 2px 8px rgba(0,0,0,0.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: card.flipped ? "32px" : "24px",
                      userSelect: "none",
                    }}
                  >
                    {card.flipped ? card.emoji : "🌱"}
                    {isSparkle && (
                      <div style={{
                        position: "absolute", inset: 0, borderRadius: "10px",
                        background: "radial-gradient(circle, rgba(255,220,100,0.4) 0%, transparent 70%)",
                        pointerEvents: "none",
                      }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Round earnings preview */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ fontSize: "13px", color: roundEarnings >= 0 ? "#8dde78" : "#ff6b4a" }}>
                Round earnings: {roundEarnings >= 0 ? "+" : ""}{roundEarnings} coins
              </div>
              <button
                onClick={endRound}
                style={{
                  background: "linear-gradient(135deg, #8b2f0a, #c84a1a)",
                  border: "2px solid #e86030",
                  color: "#f5e6c8",
                  padding: "10px 24px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontFamily: "Georgia, serif",
                  letterSpacing: "1px",
                }}
              >
                🌾 End Harvest
              </button>
            </div>

            {/* Upgrades reminder */}
            {upgrades.length > 0 && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {upgrades.map(u => {
                  const upg = UPGRADES.find(x => x.id === u);
                  return (
                    <div key={u} style={{
                      background: "rgba(100,200,80,0.1)", border: "1px solid rgba(100,200,80,0.3)",
                      borderRadius: "6px", padding: "4px 10px", fontSize: "11px", color: "#8dde78",
                    }}>
                      {upg.icon} {upg.label}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* SELL PHASE */}
        {phase === PHASES.SELL && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🏪</div>
            <h2 style={{ fontSize: "22px", color: "#f5c842", marginBottom: "8px" }}>Market Report</h2>
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "24px", marginBottom: "20px" }}>
              <div style={{ fontSize: "36px", marginBottom: "8px", color: roundEarnings >= 0 ? "#8dde78" : "#ff6b4a" }}>
                {roundEarnings >= 0 ? "+" : ""}{roundEarnings} coins
              </div>
              <div style={{ fontSize: "13px", color: "#a87a50" }}>from this harvest</div>
              <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ fontSize: "18px", color: "#f5c842" }}>Total: 💰 {coins}</div>
              </div>
              <div style={{ marginTop: "12px", fontSize: "13px", color: "#c8a87a" }}>
                🍓 {berryCount} pairs harvested this round
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button onClick={goToShop} style={{
                background: "linear-gradient(135deg, #1a3a8a, #2a5acc)",
                border: "2px solid #4a7aff", color: "#e8f0ff",
                padding: "12px 28px", borderRadius: "8px", fontSize: "15px",
                cursor: "pointer", fontFamily: "Georgia, serif",
              }}>
                🏬 Visit Shop
              </button>
              <button onClick={nextRound} style={{
                background: "linear-gradient(135deg, #2a6a1a, #3a8a28)",
                border: "2px solid #5ac83a", color: "#e8f5e0",
                padding: "12px 28px", borderRadius: "8px", fontSize: "15px",
                cursor: "pointer", fontFamily: "Georgia, serif",
              }}>
                🌱 Next Round
              </button>
            </div>
          </div>
        )}

        {/* SHOP PHASE */}
        {phase === PHASES.SHOP && (
          <div>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{ fontSize: "48px" }}>🏬</div>
              <h2 style={{ fontSize: "22px", color: "#f5c842" }}>Farm Shop</h2>
              <div style={{ color: "#a87a50", fontSize: "13px" }}>💰 {coins} coins available</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
              {UPGRADES.map(upg => {
                const owned = upgrades.includes(upg.id);
                const canAfford = coins >= upg.cost;
                return (
                  <div key={upg.id} style={{
                    background: owned ? "rgba(80,180,60,0.1)" : "rgba(255,255,255,0.05)",
                    border: owned ? "1px solid rgba(80,180,60,0.4)" : "1px solid rgba(200,150,80,0.2)",
                    borderRadius: "10px", padding: "16px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <div>
                      <div style={{ fontSize: "15px", color: "#f5e6c8" }}>{upg.icon} {upg.label}</div>
                      <div style={{ fontSize: "12px", color: "#a87a50", marginTop: "4px" }}>{upg.desc}</div>
                    </div>
                    {owned ? (
                      <div style={{ color: "#8dde78", fontSize: "13px" }}>✓ Owned</div>
                    ) : (
                      <button onClick={() => buyUpgrade(upg)} disabled={!canAfford} style={{
                        background: canAfford ? "linear-gradient(135deg, #8b6a10, #c8951a)" : "rgba(255,255,255,0.05)",
                        border: canAfford ? "2px solid #e8b530" : "2px solid rgba(255,255,255,0.1)",
                        color: canAfford ? "#f5e6c8" : "#666",
                        padding: "8px 16px", borderRadius: "6px", fontSize: "13px",
                        cursor: canAfford ? "pointer" : "not-allowed",
                        fontFamily: "Georgia, serif", whiteSpace: "nowrap",
                      }}>
                        💰 {upg.cost}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ textAlign: "center" }}>
              <button onClick={nextRound} style={{
                background: "linear-gradient(135deg, #2a6a1a, #3a8a28)",
                border: "2px solid #5ac83a", color: "#e8f5e0",
                padding: "12px 32px", borderRadius: "8px", fontSize: "15px",
                cursor: "pointer", fontFamily: "Georgia, serif",
              }}>
                🌱 Back to Farm
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}