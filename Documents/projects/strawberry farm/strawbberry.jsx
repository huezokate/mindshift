import { useState, useEffect, useCallback } from "react";

const CARD_TYPES = [
  { id: "strawberry", img: "/strawberry/assets/strawberry.png", value: 20,  count: 4 },
  { id: "bug",        img: "/strawberry/assets/bug.png",        value: -15, count: 4 },
  { id: "weed",       img: "/strawberry/assets/weed.png",       value: -5,  count: 4 },
  { id: "drop",       img: "/strawberry/assets/drop.png",       value: 15,  count: 4 },
];

const UPGRADES = [
  { id: "shovel",     label: "Lucky Shovel",  desc: "Start each round with 1 card revealed", cost: 40, icon: "⛏️" },
  { id: "scarecrow",  label: "Scarecrow",     desc: "Bugs deal half damage",                 cost: 60, icon: "🪄" },
  { id: "greenhouse", label: "Greenhouse",    desc: "+2 strawberry cards per round",          cost: 80, icon: "🏡" },
];

function generateDeck(upgrades) {
  const deck = [];
  let id = 0;
  CARD_TYPES.forEach((type) => {
    let count = type.count;
    if (type.id === "strawberry" && upgrades.includes("greenhouse")) count += 2;
    for (let i = 0; i < count; i++) {
      deck.push({ uid: id++, id: type.id, img: type.img, value: type.value, flipped: false, matched: false });
    }
  });
  console.log("[deck] generated", deck.length, "cards");
  return deck.sort(() => Math.random() - 0.5);
}

const PHASES = { FARM: "farm", SELL: "sell", SHOP: "shop" };

const styles = `
  * { box-sizing: border-box; }
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%     { transform: translateX(-6px); }
    40%     { transform: translateX(6px); }
    60%     { transform: translateX(-4px); }
    80%     { transform: translateX(4px); }
  }
  @keyframes pulse {
    0%,100% { transform: scale(1); }
    50%     { transform: scale(1.05); }
  }
  .card-shake { animation: shake 0.4s ease; }
  .btn-pulse  { animation: pulse 1s ease-in-out infinite; }
`;

export default function StrawberrySolitaire() {
  const [coins, setCoins] = useState(0);
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState(PHASES.FARM);
  const [deck, setDeck] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState(null);
  const [upgrades, setUpgrades] = useState([]);
  const [roundEarnings, setRoundEarnings] = useState(0);
  const [shaking, setShaking] = useState(new Set());
  const [fieldCleared, setFieldCleared] = useState(false);

  const startRound = useCallback((upgs = upgrades) => {
    const newDeck = generateDeck(upgs);
    if (upgs.includes("shovel")) {
      newDeck[Math.floor(Math.random() * newDeck.length)].flipped = true;
    }
    setDeck(newDeck);
    setSelected(null);
    setMessage(null);
    setFieldCleared(false);
  }, [upgrades]);

  useEffect(() => { startRound(); }, []);

  const triggerShake = (uid1, uid2) => {
    setShaking(new Set([uid1, uid2]));
    setTimeout(() => setShaking(new Set()), 400);
  };

  const flipCard = (uid) => {
    const card = deck.find(c => c.uid === uid);
    if (!card || card.flipped || card.matched) return;

    if (selected === null) {
      setDeck(d => d.map(c => c.uid === uid ? { ...c, flipped: true } : c));
      setSelected(card);
      return;
    }

    const first = selected;
    setSelected(null);

    if (first.id === card.id) {
      // MATCH — flip current card and mark both matched in one update
      const newDeck = deck.map(c => {
        if (c.uid === uid)       return { ...c, flipped: true, matched: true };
        if (c.uid === first.uid) return { ...c, matched: true };
        return c;
      });
      const earned = card.value * 2;
      setRoundEarnings(e => e + earned);
      setDeck(newDeck);
      const allMatched = newDeck.every(c => c.matched);
      if (allMatched) {
        setMessage("🎉 Field cleared! Tap End Harvest.");
        setFieldCleared(true);
      } else {
        setMessage(earned > 0
          ? `✨ Match! +${earned} coins!`
          : `😬 Matched a ${card.id}! ${earned} coins.`
        );
      }
    } else {
      // NO MATCH — flip current card, both stay face-up, shake both
      setDeck(d => d.map(c => c.uid === uid ? { ...c, flipped: true } : c));
      triggerShake(uid, first.uid);
      setMessage("❌ No match! Keep looking.");
    }
  };

  const endRound = () => {
    setCoins(c => Math.max(0, c + roundEarnings));
    setPhase(PHASES.SELL);
  };

  const goToShop = () => setPhase(PHASES.SHOP);

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

  const harvestedPairs = deck.filter(c => c.matched).length / 2;

  const orangeBtn = (extra = {}) => ({
    background: "linear-gradient(135deg, #d4521a, #e87030)",
    border: "2px solid #f08040",
    borderRadius: "10px",
    color: "#fff",
    fontFamily: "'Fredoka One', cursive",
    fontSize: "16px",
    cursor: "pointer",
    padding: "10px 20px",
    ...extra,
  });

  return (
    <>
      <style>{styles}</style>

      {/* Wide-screen blurred backdrop */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: "url('/strawberry/assets/screen_header.png')",
        backgroundSize: "cover",
        filter: "blur(24px) brightness(0.35)",
        zIndex: -1,
      }} />

      <div style={{
        display: "flex",
        flexDirection: "column",
        maxWidth: "430px",
        margin: "0 auto",
        minHeight: "100vh",
        fontFamily: "'Fredoka One', cursive",
      }}>

        {/* HEADER */}
        <img
          src="/strawberry/assets/screen_header.png"
          alt=""
          style={{ width: "100%", height: "180px", objectFit: "cover", objectPosition: "top", display: "block", flexShrink: 0 }}
        />

        {/* MESSAGE BAR */}
        <div style={{
          height: "48px",
          flexShrink: 0,
          background: "#111",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 16px",
          textAlign: "center",
        }}>
          <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: "15px", color: "#f5c842" }}>
            {message ?? "✨ Happy Strawberry Farm Solitaire ✨"}
          </span>
        </div>

        {/* FARM PHASE — card grid */}
        {phase === PHASES.FARM && (
          <div style={{
            flex: 1,
            backgroundImage: "url('/strawberry/assets/background-feild.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gridTemplateRows: "repeat(4, 1fr)",
            gap: "10px",
            padding: "12px",
          }}>
            {deck.map((card) => {
              const isShaking  = shaking.has(card.uid);
              const isSelected = selected?.uid === card.uid;
              const faceUp     = card.flipped;

              return (
                <div
                  key={card.uid}
                  onClick={() => flipCard(card.uid)}
                  className={isShaking ? "card-shake" : ""}
                  onMouseEnter={e => { if (!faceUp) e.currentTarget.style.transform = "scale(1.04)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                  style={{
                    borderRadius: "14px",
                    overflow: "visible",
                    cursor: faceUp ? "default" : "pointer",
                    position: "relative",
                    background: faceUp ? "#c8813a" : "none",
                    backgroundImage: faceUp ? "none" : "url('/strawberry/assets/card_cover.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    boxShadow: card.matched
                      ? "0 0 0 3px #f5c842, 0 0 12px rgba(245,200,66,0.5)"
                      : isSelected
                      ? "0 0 0 3px #f5c842, 0 0 16px rgba(245,200,66,0.6)"
                      : "0 4px 12px rgba(0,0,0,0.35)",
                    transition: "transform 0.15s",
                  }}
                >
                  {faceUp && (
                    <img
                      src={card.img}
                      alt={card.id}
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "85%",
                        objectFit: "contain",
                        pointerEvents: "none",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* SELL PHASE */}
        {phase === PHASES.SELL && (
          <div style={{
            flex: 1,
            backgroundImage: "url('/strawberry/assets/background-feild.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <div style={{
              background: "rgba(92,45,10,0.9)",
              border: "2px solid #c8952a",
              borderRadius: "14px",
              padding: "24px 28px",
              textAlign: "center",
              width: "80%",
            }}>
              <div style={{ fontSize: "36px", marginBottom: "8px" }}>🏪</div>
              <div style={{ fontSize: "20px", color: "#f5c842", marginBottom: "12px" }}>Market Report</div>
              <div style={{ fontSize: "32px", color: roundEarnings >= 0 ? "#8dde78" : "#ff6b4a" }}>
                {roundEarnings >= 0 ? "+" : ""}{roundEarnings} coins
              </div>
              <div style={{ fontSize: "12px", color: "#a87a50", marginBottom: "12px" }}>from this harvest</div>
              <div style={{ fontSize: "16px", color: "#f5c842", marginBottom: "4px" }}>Total: 💰 {coins}</div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginTop: "16px" }}>
                <button onClick={goToShop} style={orangeBtn()}>🏬 Visit Shop</button>
                <button onClick={nextRound} style={orangeBtn()}>🌱 Next Round</button>
              </div>
            </div>
          </div>
        )}

        {/* SHOP PHASE */}
        {phase === PHASES.SHOP && (
          <div style={{
            flex: 1,
            backgroundImage: "url('/strawberry/assets/background-feild.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflowY: "auto",
          }}>
            <div style={{
              background: "rgba(92,45,10,0.9)",
              border: "2px solid #c8952a",
              borderRadius: "14px",
              padding: "20px",
              width: "85%",
              maxHeight: "90%",
              overflowY: "auto",
            }}>
              <div style={{ textAlign: "center", marginBottom: "14px" }}>
                <div style={{ fontSize: "32px" }}>🏬</div>
                <div style={{ fontSize: "20px", color: "#f5c842" }}>Farm Shop</div>
                <div style={{ fontSize: "12px", color: "#a87a50" }}>💰 {coins} coins available</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                {UPGRADES.map(upg => {
                  const owned = upgrades.includes(upg.id);
                  const canAfford = coins >= upg.cost;
                  return (
                    <div key={upg.id} style={{
                      background: owned ? "rgba(80,180,60,0.1)" : "rgba(255,255,255,0.05)",
                      border: owned ? "1px solid rgba(80,180,60,0.4)" : "1px solid rgba(200,150,80,0.2)",
                      borderRadius: "10px",
                      padding: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}>
                      <div>
                        <div style={{ fontSize: "14px", color: "#f5e6c8" }}>{upg.icon} {upg.label}</div>
                        <div style={{ fontSize: "11px", color: "#a87a50", marginTop: "2px" }}>{upg.desc}</div>
                      </div>
                      {owned ? (
                        <div style={{ color: "#8dde78", fontSize: "13px" }}>✓ Owned</div>
                      ) : (
                        <button
                          onClick={() => buyUpgrade(upg)}
                          disabled={!canAfford}
                          style={orangeBtn({
                            background: canAfford ? "linear-gradient(135deg, #d4521a, #e87030)" : "rgba(255,255,255,0.05)",
                            border: canAfford ? "2px solid #f08040" : "2px solid rgba(255,255,255,0.1)",
                            color: canAfford ? "#fff" : "#666",
                            padding: "6px 14px",
                            fontSize: "13px",
                            cursor: canAfford ? "pointer" : "not-allowed",
                            whiteSpace: "nowrap",
                            borderRadius: "10px",
                          })}
                        >
                          💰 {upg.cost}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={{ textAlign: "center" }}>
                <button onClick={nextRound} style={orangeBtn()}>🌱 Back to Farm</button>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER IMAGE */}
        <img
          src="/strawberry/assets/screen_footer.png"
          alt=""
          style={{ width: "100%", height: "100px", objectFit: "cover", display: "block", flexShrink: 0 }}
        />

        {/* STATS BAR */}
        <div style={{
          background: "#1a0a00",
          padding: "12px 16px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "16px",
          flexShrink: 0,
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Fredoka One', cursive", color: "#f5c842", fontSize: "20px" }}>🌾 {harvestedPairs}</div>
            <div style={{ fontFamily: "'Fredoka One', cursive", color: "#c8a87a", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" }}>Harvested</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Fredoka One', cursive", color: "#f5c842", fontSize: "20px" }}>💰 {coins}</div>
            <div style={{ fontFamily: "'Fredoka One', cursive", color: "#c8a87a", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" }}>Coins</div>
          </div>
          {phase === PHASES.FARM && (
            <button
              onClick={endRound}
              className={fieldCleared ? "btn-pulse" : ""}
              style={orangeBtn({
                flexGrow: 1,
                maxWidth: "160px",
                marginLeft: "auto",
                height: "48px",
                padding: "0",
                borderRadius: "10px",
              })}
            >
              🌾 End Harvest
            </button>
          )}
        </div>

      </div>
    </>
  );
}
