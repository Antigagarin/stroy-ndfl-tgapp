import { useT } from "../i18n"

interface Props {
  onRegister: () => void
}

export function UnknownScreen({ onRegister }: Props) {
  const T = useT()

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f3f4f6" }}>
      <div style={{ backgroundColor: "#000", color: "#fff", padding: "32px 24px 24px" }}>
        <div style={{ fontSize: "11px", fontWeight: 900, letterSpacing: "0.2em", color: "#aaa", marginBottom: "10px" }}>
          {T("app_name")}
        </div>
        <div style={{ fontSize: "28px", fontWeight: 900, lineHeight: 1.1, textTransform: "uppercase" }}>
          {T("welcome")}
        </div>
        <div style={{ fontSize: "14px", color: "#fff", marginTop: "10px", lineHeight: 1.5, opacity: 0.85 }}>
          {T("not_registered")}
        </div>
      </div>

      <div style={{ backgroundColor: "#fff", margin: "16px", border: "2px solid #000" }}>
        {[T("step_1"), T("step_2"), T("step_3")].map((text, i) => (
          <div key={i} style={{ display: "flex", gap: "12px", padding: "14px 16px", borderBottom: i < 2 ? "1px solid #e5e7eb" : "none", alignItems: "flex-start" }}>
            <div style={{ minWidth: "28px", height: "28px", backgroundColor: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "13px", flexShrink: 0 }}>
              {i + 1}
            </div>
            <div style={{ fontSize: "14px", fontWeight: 600, paddingTop: "4px", color: "#000", lineHeight: 1.4 }}>
              {text}
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <button
          onClick={onRegister}
          style={{ width: "100%", padding: "18px", backgroundColor: "#000", color: "#fff", fontWeight: 900, fontSize: "15px", textTransform: "uppercase", letterSpacing: "0.08em", border: "none", cursor: "pointer" }}
        >
          {T("register_as_worker")}
        </button>
        <button
          style={{ width: "100%", padding: "14px", backgroundColor: "#fff", color: "#000", fontWeight: 700, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.06em", border: "2px solid #000", cursor: "pointer" }}
        >
          {T("i_am_foreman")}
        </button>
      </div>
    </div>
  )
}
