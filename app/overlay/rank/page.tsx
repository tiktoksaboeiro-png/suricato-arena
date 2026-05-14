const styles: Record<string, React.CSSProperties> = {
  page: {
    width: "100vw",
    height: "100vh",
    background: "transparent",
    overflow: "hidden",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "18px",
    boxSizing: "border-box",
    fontFamily: "Arial, sans-serif",
  },

  container: {
    width: "100%",
    maxWidth: "460px",
    background: "transparent",
    borderRadius: "28px",
    padding: "16px",
    backdropFilter: "blur(8px)",
  },

  header: {
    marginBottom: "14px",
    padding: "12px 8px 16px",
    borderRadius: "22px",
    background:
      "linear-gradient(90deg, rgba(255,215,0,0.18), rgba(0,234,255,0.12), rgba(255,0,120,0.14))",
    border: "1px solid rgba(255,255,255,0.14)",
    textAlign: "center",
    boxShadow: "0 0 20px rgba(255,215,0,0.45)",
  },

  crown: {
    fontSize: "28px",
    filter: "drop-shadow(0 0 8px rgba(255,215,0,1))",
  },

  title: {
    margin: "2px 0 0",
    color: "#ffffff",
    fontWeight: 900,
    fontSize: "clamp(26px, 4vw, 42px)",
    letterSpacing: "1px",
    textShadow:
      "0 0 8px rgba(255,215,0,1), 0 0 18px rgba(0,234,255,0.7)",
  },

  subtitle: {
    margin: "4px 0 0",
    color: "#ffd700",
    fontWeight: 900,
    fontSize: "14px",
    letterSpacing: "2px",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  playerCard: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    background:
      "linear-gradient(90deg, rgba(8,10,24,0.82), rgba(8,10,24,0.68))",
    borderRadius: "18px",
    padding: "10px",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow:
      "0 0 14px rgba(0,234,255,0.18), inset 0 0 12px rgba(255,255,255,0.05)",
    backdropFilter: "blur(8px)",
  },

  first: {
    border: "1px solid rgba(255,215,0,0.95)",
    boxShadow:
      "0 0 18px rgba(255,215,0,0.45), inset 0 0 15px rgba(255,215,0,0.12)",
  },

  second: {
    border: "1px solid rgba(180,220,255,0.75)",
  },

  third: {
    border: "1px solid rgba(255,150,50,0.75)",
  },

  position: {
    width: "44px",
    height: "44px",
    borderRadius: "14px",
    background: "linear-gradient(180deg, #222, #050505)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
    fontSize: "20px",
    flexShrink: 0,
    border: "1px solid rgba(255,255,255,0.18)",
  },

  gold: {
    background: "linear-gradient(180deg, #fff07a, #ffb300)",
    color: "#1c1200",
    boxShadow: "0 0 16px rgba(255,215,0,0.9)",
  },

  silver: {
    background: "linear-gradient(180deg, #ffffff, #9fb7c9)",
    color: "#0c1720",
    boxShadow: "0 0 14px rgba(180,220,255,0.7)",
  },

  bronze: {
    background: "linear-gradient(180deg, #ffb36b, #b85b00)",
    color: "#1c0b00",
    boxShadow: "0 0 14px rgba(255,130,40,0.7)",
  },

  avatar: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #00eaff",
    boxShadow: "0 0 16px rgba(0,234,255,0.85)",
    flexShrink: 0,
    background: "#111",
  },

  info: {
    flex: 1,
    minWidth: 0,
  },

  name: {
    color: "#ffffff",
    fontWeight: 900,
    fontSize: "clamp(14px, 2vw, 22px)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    textShadow: "0 2px 6px #000",
  },

  points: {
    color: "#ffd700",
    marginTop: "4px",
    fontWeight: 800,
    fontSize: "clamp(12px, 1.7vw, 17px)",
  },

  level: {
    color: "#00ffae",
    fontWeight: 900,
    fontSize: "clamp(12px, 1.8vw, 18px)",
    background: "rgba(0,255,174,0.12)",
    border: "1px solid rgba(0,255,174,0.45)",
    borderRadius: "12px",
    padding: "6px 8px",
    flexShrink: 0,
  },

  footer: {
    marginTop: "14px",
    textAlign: "center",
    color: "#ffd700",
    fontWeight: 900,
    fontSize: "13px",
    letterSpacing: "1.5px",
    padding: "8px",
    borderRadius: "14px",
    background: "rgba(8,10,24,0.65)",
    border: "1px solid rgba(255,215,0,0.25)",
    backdropFilter: "blur(8px)",
  },
};