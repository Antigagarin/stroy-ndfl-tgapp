import { useState } from "react"
import { apiPost } from "../api"
import { useT } from "../i18n"
import type { AuthResult } from "../types"

interface Props {
  onRegister: () => void
  onConnect: (auth: AuthResult) => void
}

export function UnknownScreen({ onRegister, onConnect }: Props) {
  const T = useT()
  const [mode, setMode] = useState<"main" | "foreman">("main")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleConnect() {
    if (!code.trim()) return
    setLoading(true)
    setError("")
    try {
      const result = await apiPost<AuthResult>("/api/tgapp/connect", { code: code.trim().toUpperCase() })
      onConnect(result)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка")
    } finally {
      setLoading(false)
    }
  }

  const S = {
    root: { minHeight: "100vh", display: "flex", flexDirection: "column" as const, backgroundColor: "#f3f4f6" },
    header: { backgroundColor: "#000", color: "#fff", padding: "32px 24px 24px" },
    appName: { fontSize: "11px", fontWeight: 900, letterSpacing: "0.2em", color: "#aaa", marginBottom: "10px" },
    title: { fontSize: "28px", fontWeight: 900, lineHeight: 1.1, textTransform: "uppercase" as const },
    sub: { fontSize: "14px", color: "#fff", marginTop: "10px", lineHeight: 1.5, opacity: 0.85 },
    body: { padding: "16px", display: "flex", flexDirection: "column" as const, gap: "10px" },
    btnPrimary: { width: "100%", padding: "18px", backgroundColor: "#000", color: "#fff", fontWeight: 900, fontSize: "15px", textTransform: "uppercase" as const, letterSpacing: "0.08em", border: "none", cursor: "pointer" } as React.CSSProperties,
    btnSecondary: { width: "100%", padding: "14px", backgroundColor: "#fff", color: "#000", fontWeight: 700, fontSize: "13px", textTransform: "uppercase" as const, letterSpacing: "0.06em", border: "2px solid #000", cursor: "pointer" } as React.CSSProperties,
    card: { backgroundColor: "#fff", border: "2px solid #000", padding: "0" },
    steps: { backgroundColor: "#fff", margin: "0", border: "2px solid #000" },
    codeInput: { width: "100%", padding: "16px", fontSize: "24px", fontWeight: 900, letterSpacing: "0.3em", textAlign: "center" as const, border: "none", outline: "none", textTransform: "uppercase" as const, boxSizing: "border-box" as const },
    hint: { fontSize: "13px", color: "#666", padding: "12px 16px", borderTop: "1px solid #e5e7eb", textAlign: "center" as const },
    err: { padding: "14px 16px", backgroundColor: "#000", color: "#fff", fontSize: "13px", fontWeight: 700 },
    back: { background: "none", border: "none", cursor: "pointer", padding: "0 0 4px", fontSize: "12px", fontWeight: 700, color: "#aaa" } as React.CSSProperties,
  }

  if (mode === "foreman") {
    return (
      <div style={S.root}>
        <div style={S.header}>
          <button style={S.back} onClick={() => { setMode("main"); setCode(""); setError("") }}>← Назад</button>
          <div style={S.appName}>{T("app_name")}</div>
          <div style={S.title}>Вход по коду</div>
          <div style={S.sub}>Введите код, который создал ваш администратор</div>
        </div>
        <div style={S.body}>
          <div style={S.card}>
            <input
              style={S.codeInput}
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="AB12CD"
              maxLength={8}
              autoFocus
            />
            <div style={S.hint}>Код выдаётся администратором в веб-панели</div>
          </div>
          {error && <div style={S.err}>{error}</div>}
          <button
            style={{ ...S.btnPrimary, backgroundColor: loading || !code.trim() ? "#666" : "#000", cursor: loading || !code.trim() ? "not-allowed" : "pointer" }}
            onClick={handleConnect}
            disabled={loading || !code.trim()}
          >
            {loading ? "Проверяем..." : "Войти"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={S.root}>
      <div style={S.header}>
        <div style={S.appName}>{T("app_name")}</div>
        <div style={S.title}>{T("welcome")}</div>
        <div style={S.sub}>{T("not_registered")}</div>
      </div>

      <div style={{ ...S.steps, margin: "16px" }}>
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

      <div style={S.body}>
        <button style={S.btnPrimary} onClick={onRegister}>{T("register_as_worker")}</button>
        <button style={S.btnSecondary} onClick={() => setMode("foreman")}>{T("i_am_foreman")}</button>
      </div>
    </div>
  )
}
