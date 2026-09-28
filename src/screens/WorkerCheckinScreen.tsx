import { useState } from "react"
import { apiPost } from "../api"
import type { AuthResult } from "../types"
import { useT } from "../i18n"

interface Props {
  auth: AuthResult
}

export function WorkerCheckinScreen({ auth }: Props) {
  const T = useT()
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const today = new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long" })
  const firstName = auth.fullName?.split(" ")[1] ?? auth.fullName ?? ""

  async function doCheckin(qrText: string) {
    setLoading(true)
    setError("")
    try {
      let lat: number | undefined, lng: number | undefined
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
        )
        lat = pos.coords.latitude
        lng = pos.coords.longitude
      } catch {}

      // extract qrToken from scanned URL if present
      const match = qrText.match(/\/checkin\/([^/?#]+)/)
      const qrToken = match ? match[1] : undefined

      await apiPost("/api/tgapp/checkin", { lat, lng, qrToken })
      setDone(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка")
    } finally {
      setLoading(false)
    }
  }

  function handleScan() {
    const tg = window.Telegram?.WebApp
    if (tg?.showScanQrPopup) {
      tg.showScanQrPopup({ text: "Наведите на QR-код объекта" }, (text: string) => {
        tg.closeScanQrPopup()
        doCheckin(text)
        return true
      })
    } else {
      // fallback для браузера (dev)
      doCheckin("dev")
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#f3f4f6" }}>
      <div style={{ backgroundColor: "#000", color: "#fff", padding: "32px 24px 24px" }}>
        <div style={{ fontSize: "11px", fontWeight: 900, letterSpacing: "0.2em", color: "#aaa", marginBottom: "10px" }}>
          ПРОХОДНАЯ
        </div>
        <div style={{ fontSize: "22px", fontWeight: 900, lineHeight: 1.1, textTransform: "uppercase" }}>
          {firstName}
        </div>
        <div style={{ fontSize: "13px", color: "#fff", marginTop: "8px", opacity: 0.7 }}>
          {today}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", gap: "24px" }}>
        {done ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "64px", height: "64px", backgroundColor: "#000", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "20px", height: "36px", borderRight: "4px solid #fff", borderBottom: "4px solid #fff", transform: "rotate(45deg)", marginTop: "-8px" }} />
            </div>
            <div style={{ fontSize: "20px", fontWeight: 900, textTransform: "uppercase", marginBottom: "8px" }}>
              {T("checked_in")}
            </div>
            <div style={{ fontSize: "13px", color: "#666" }}>{today}</div>
          </div>
        ) : (
          <>
            <div style={{ textAlign: "center", borderBottom: "2px solid #000", paddingBottom: "24px", width: "100%" }}>
              <div style={{ fontSize: "13px", color: "#666", lineHeight: 1.6 }}>
                {T("scan_qr_hint")}
              </div>
            </div>

            <button
              onClick={handleScan}
              disabled={loading}
              style={{
                width: "100%",
                padding: "20px",
                backgroundColor: loading ? "#666" : "#000",
                color: "#fff",
                fontWeight: 900,
                fontSize: "15px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? T("checking_in") : T("scan_qr_btn")}
            </button>
          </>
        )}

        {error && (
          <div style={{ width: "100%", padding: "14px 16px", backgroundColor: "#fff", border: "2px solid #000", fontSize: "13px", color: "#000" }}>
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
