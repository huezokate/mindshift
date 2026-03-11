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

const ASSET = {
  strawberry: "/strawberry/assets/strawberry.png",
  golden: "/strawberry/assets/strawberry.png",
  bug: "/strawberry/assets/bug.png",
  weed: "/strawberry/assets/weed.png",
  rain: "/strawberry/assets/drop.png",
};

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

const styles = `
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20% { transform: translateX(-6px); }
    40% { transform: translateX(6px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }
  @keyframes sparkle {
    0% { transform: scale(1); filter: brightness(1); }
    40% { transform: scale(1.12); filter: brightness(1.6); }
    100% { transform: scale(1); filter: brightness(1); }
  }
  .card-shake { animation: shake 0.4s ease; }
  .card-sparkle { animation: sparkle 0.6s ease; }
`;

export default function StrawberrySolitaire() {
  const [coins, setCoins] = useState(0);
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState(PHASES.FARM);
  const [deck, setDeck] = useState([]);
  const [selected, setSelected] = useState(null);
  const [harvest, setHarvest] = useState([]);
  const [message, setMessage] = useState(null);
  const [flipsLeft, setFlipsLeft] = useState(18);
  const [upgrades, setUpgrades] = useState([]);
  const [roundEarnings, setRoundEarnings] = useState(0);
  const [rainActive, setRainActive] = useState(false);
  const [shake, setShake] = useState(null);
  const [sparkle, setSparkle] = useState(null);
  const [locked, setLocked] = useState(false);

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
    setMessage(null);
    setLocked(false);
  }, [upgrades]);

  useEffect(() => { startRound(); }, []);

  const flipCard = (uid) => {
    const card = deck.find(c => c.uid === uid);
    if (locked || !card || card.flipped || card.matched) return;

    setDeck(d => d.map(c => c.uid === uid ? { ...c, flipped: true } : c));
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
      setShake(uid);
      setTimeout(() => setShake(null), 400);
      setSelected(null);
      return;
    }

    if (card.id === "bug") {
      const penalty = upgrades.includes("scarecrow") ? -7 : -15;
      setRoundEarnings(e => e + penalty);
      setMessage(`🐛 A bug got your berries! ${penalty} coins.`);
      setShake(uid);
      setTimeout(() => setShake(null), 400);
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
        setSparkle(uid);
        setTimeout(() => setSparkle(null), 600);
        setSelected(null);
      } else {
        setMessage("❌ No match! Look carefully...");
        setShake(uid);
        setTimeout(() => setShake(null), 400);
        setLocked(true);
        const prevSelected = selected;
        setTimeout(() => {
          setDeck(d => d.map(c =>
            (c.uid === uid || c.uid === prevSelected.uid)
              ? { ...c, flipped: false }
              : c
          ));
          setSelected(null);
          setLocked(false);
        }, 900);
        return;
      }
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

  const berryCount = harvest.filter(c => c.id === "strawberry" || c.id === "golden").length / 2;

  const pillBtn = (onClick, children, extra = {}) => ({
    onClick,
    style: {
      background: "linear-gradient(135deg, #c84a1a, #8b2f0a)",
      border: "2px solid #e86030",
      borderRadius: "30px",
      color: "#f5e6c8",
      fontFamily: "'Fredoka One', cursive",
      fontSize: "16px",
      cursor: "pointer",
      padding: "10px 28px",
      ...extra,
    },
  });

  return (
    <>
      <style>{styles}</style>
      <div style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        maxWidth: "430px",
        margin: "0 auto",
        overflow: "hidden",
        fontFamily: "'Nunito', sans-serif",
        background: "#1a0a2e",
      }}>

        {/* HEADER */}
        <div style={{
          height: "18vh",
          flexShrink: 0,
          backgroundImage: "url('/strawberry/assets/screen_header.png')",
          backgroundSize: "cover",
          backgroundPosition: "top center",
        }} />

        {/* MESSAGE BAR */}
        <div style={{
          height: "6vh",
          flexShrink: 0,
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 16px",
          textAlign: "center",
        }}>
          {message === null ? (
            <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: "15px", color: "#f5c842" }}>
              ✨ Happy Strawberry Farm Solitaire ✨
            </span>
          ) : (
            <span style={{ fontSize: "14px", color: "#f5e6c8" }}>
              {message}
              {rainActive && <span style={{ marginLeft: "8px", color: "#7ec8e3" }}>☔ 2x Active!</span>}
            </span>
          )}
        </div>

        {/* MAIN AREA — card grid or sell/shop */}
        <div style={{ height: "58vh", flexShrink: 0, position: "relative" }}>

          {/* FARM PHASE */}
          {phase === PHASES.FARM && (
            <div style={{
              width: "100%",
              height: "100%",
              backgroundImage: "url('/strawberry/assets/background-field.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gridTemplateRows: "repeat(5, 1fr)",
              gap: "8px",
              padding: "8px",
              boxSizing: "border-box",
            }}>
              {deck.map((card) => {
                const isSelected = selected?.uid === card.uid;
                const isShaking = shake === card.uid;
                const isSparkle = sparkle === card.uid;

                return (
                  <div
                    key={card.uid}
                    onClick={() => flipCard(card.uid)}
                    className={isShaking ? "card-shake" : isSparkle ? "card-sparkle" : ""}
                    style={{
                      borderRadius: "16px",
                      cursor: card.matched || card.flipped ? "default" : "pointer",
                      overflow: "hidden",
                      opacity: card.matched ? 0 : 1,
                      pointerEvents: card.matched ? "none" : "auto",
                      boxShadow: isSelected
                        ? "0 0 0 3px #f5c842, 0 0 16px rgba(245,200,66,0.6)"
                        : "0 4px 12px rgba(0,0,0,0.35)",
                      backgroundImage: card.flipped ? "none" : "url('/strawberry/assets/card_cover.png')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundColor: card.flipped ? "#c8843a" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    {card.flipped && (
                      <>
                        <img
                          src={ASSET[card.id]}
                          alt={card.label}
                          style={{
                            width: "80%",
                            height: "80%",
                            objectFit: "contain",
                          }}
                        />
                        {card.id === "golden" && (
                          <span style={{
                            position: "absolute",
                            top: "4px",
                            right: "4px",
                            fontSize: "14px",
                          }}>⭐</span>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* SELL PHASE */}
          {phase === PHASES.SELL && (
            <div style={{
              width: "100%",
              height: "100%",
              backgroundImage: "url('/strawberry/assets/screen_header.png')",
              backgroundSize: "cover",
              backgroundPosition: "top center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <div style={{
                background: "rgba(15,8,3,0.78)",
                backdropFilter: "blur(10px)",
                borderRadius: "16px",
                padding: "24px 28px",
                textAlign: "center",
                width: "80%",
              }}>
                <div style={{ fontSize: "36px", marginBottom: "8px" }}>🏪</div>
                <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: "20px", color: "#f5c842", marginBottom: "12px" }}>Market Report</div>
                <div style={{ fontSize: "32px", color: roundEarnings >= 0 ? "#8dde78" : "#ff6b4a", fontFamily: "'Fredoka One', cursive" }}>
                  {roundEarnings >= 0 ? "+" : ""}{roundEarnings} coins
                </div>
                <div style={{ fontSize: "12px", color: "#a87a50", marginBottom: "12px" }}>from this harvest</div>
                <div style={{ fontSize: "16px", color: "#f5c842", fontFamily: "'Fredoka One', cursive", marginBottom: "4px" }}>Total: 💰 {coins}</div>
                <div style={{ fontSize: "12px", color: "#c8a87a", marginBottom: "20px" }}>🍓 {berryCount} pairs harvested</div>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
                  <button {...pillBtn(goToShop, null, { background: "linear-gradient(135deg, #1a3a8a, #2a5acc)", border: "2px solid #4a7aff", color: "#e8f0ff" })}>
                    🏬 Visit Shop
                  </button>
                  <button {...pillBtn(nextRound)}>
                    🌱 Next Round
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SHOP PHASE */}
          {phase === PHASES.SHOP && (
            <div style={{
              width: "100%",
              height: "100%",
              backgroundImage: "url('/strawberry/assets/screen_header.png')",
              backgroundSize: "cover",
              backgroundPosition: "top center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflowY: "auto",
            }}>
              <div style={{
                background: "rgba(15,8,3,0.78)",
                backdropFilter: "blur(10px)",
                borderRadius: "16px",
                padding: "20px",
                width: "85%",
                maxHeight: "90%",
                overflowY: "auto",
              }}>
                <div style={{ textAlign: "center", marginBottom: "14px" }}>
                  <div style={{ fontSize: "32px" }}>🏬</div>
                  <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: "20px", color: "#f5c842" }}>Farm Shop</div>
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
                          <div style={{ fontSize: "14px", color: "#f5e6c8", fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>{upg.icon} {upg.label}</div>
                          <div style={{ fontSize: "11px", color: "#a87a50", marginTop: "2px" }}>{upg.desc}</div>
                        </div>
                        {owned ? (
                          <div style={{ color: "#8dde78", fontSize: "13px" }}>✓ Owned</div>
                        ) : (
                          <button
                            onClick={() => buyUpgrade(upg)}
                            disabled={!canAfford}
                            style={{
                              background: canAfford ? "linear-gradient(135deg, #8b6a10, #c8951a)" : "rgba(255,255,255,0.05)",
                              border: canAfford ? "2px solid #e8b530" : "2px solid rgba(255,255,255,0.1)",
                              borderRadius: "30px",
                              color: canAfford ? "#f5e6c8" : "#666",
                              padding: "6px 14px",
                              fontSize: "13px",
                              fontFamily: "'Fredoka One', cursive",
                              cursor: canAfford ? "pointer" : "not-allowed",
                              whiteSpace: "nowrap",
                            }}
                          >
                            💰 {upg.cost}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div style={{ textAlign: "center" }}>
                  <button {...pillBtn(nextRound)}>🌱 Back to Farm</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div style={{
          height: "18vh",
          flexShrink: 0,
          position: "relative",
          backgroundImage: "url('/strawberry/assets/screen_footer.png')",
          backgroundSize: "cover",
          backgroundPosition: "top center",
        }}>
          {/* Stats row ~30% from top */}
          <div style={{
            position: "absolute",
            top: "28%",
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            gap: "28px",
          }}>
            {[
              { icon: "🌾", value: berryCount, label: "HARVESTED" },
              { icon: "💰", value: coins, label: "COINS" },
              ...(phase === PHASES.FARM ? [{ icon: "🃏", value: flipsLeft, label: "FLIPS LEFT", warn: flipsLeft <= 5 }] : []),
            ].map(({ icon, value, label, warn }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{
                  fontFamily: "'Fredoka One', cursive",
                  fontSize: "20px",
                  color: warn ? "#ff6b4a" : "#f5c842",
                }}>
                  {icon} {value}
                </div>
                <div style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: "10px",
                  color: "#c8a87a",
                  letterSpacing: "1px",
                }}>
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* End Harvest button ~65% from top, farm phase only */}
          {phase === PHASES.FARM && (
            <div style={{
              position: "absolute",
              top: "62%",
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
            }}>
              <button
                onClick={endRound}
                style={{
                  width: "70%",
                  background: "linear-gradient(135deg, #c84a1a, #8b2f0a)",
                  border: "2px solid #e86030",
                  borderRadius: "30px",
                  color: "#f5e6c8",
                  fontFamily: "'Fredoka One', cursive",
                  fontSize: "16px",
                  cursor: "pointer",
                  padding: "8px 0",
                }}
              >
                🌾 End Harvest
              </button>
            </div>
          )}
        </div>

      </div>
    </>
  );
}
