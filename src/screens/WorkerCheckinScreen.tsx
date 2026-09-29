import { useState, useEffect, useRef } from "react"
import { apiPost, apiPostForm } from "../api"
import type { AuthResult } from "../types"
import { useT } from "../i18n"

type CheckinState = "idle" | "checked_in" | "checked_out"

export function WorkerCheckinScreen({ auth, onProfile, onHistory }: { auth: AuthResult; onProfile: () => void; onHistory: () => void }) {
  const T = useT()
  const [state, setState] = useState<CheckinState>("idle")
  const [checkInTime, setCheckInTime] = useState<Date | null>(null)
  const [hours, setHours] = useState(0)
  const [elapsed, setElapsed] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoLoading, setPhotoLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const today = new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long" })
  const firstName = auth.fullName?.split(" ")[1] ?? auth.fullName ?? ""

  useEffect(() => {
    const att = auth.todayAttendance
    if (att?.checkOut) {
      setState("checked_out")
      setHours(att.hours)
    } else if (att?.checkIn) {
      setState("checked_in")
      setCheckInTime(new Date(att.checkIn))
    }
  }, [])

  useEffect(() => {
    if (state === "checked_in" && checkInTime) {
      const update = () => {
        const diff = Date.now() - checkInTime.getTime()
        const h = Math.floor(diff / 3600000)
        const m = Math.floor((diff % 3600000) / 60000)
        setElapsed(`${h}ч ${m}мин`)
      }
      update()
      timerRef.current = setInterval(update, 30000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [state, checkInTime])

  async function doScan(qrText: string) {
    setLoading(true)
    setError("")
    try {
      let lat: number | undefined, lng: number | undefined
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
        )
        lat = pos.coords.latitude; lng = pos.coords.longitude
      } catch {}
      const match = qrText.match(/\/checkin\/([^/?#]+)/)
      const qrToken = match ? match[1] : undefined
      const result = await apiPost<{ action: string; checkIn?: string; checkOut?: string; hours?: number }>(
        "/api/tgapp/checkin", { lat, lng, qrToken }
      )
      if (result.action === "checkin") {
        setState("checked_in")
        setCheckInTime(new Date(result.checkIn!))
      } else if (result.action === "checkout" || result.action === "already_out") {
        setState("checked_out")
        setHours(result.hours ?? 0)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка")
    } finally {
      setLoading(false)
    }
  }

  async function handlePhotoUpload(file: File) {
    setPhotoLoading(true)
    try {
      const form = new FormData()
      form.append("file", file)
      const { photoUrl: url } = await apiPostForm<{ photoUrl: string }>("/api/tgapp/photo", form)
      setPhotoUrl(url)
    } catch {
      // photo is optional
    } finally {
      setPhotoLoading(false)
    }
  }

  function handleScan() {
    const tg = window.Telegram?.WebApp
    if (tg?.showScanQrPopup) {
      tg.showScanQrPopup({ text: T("scan_qr_hint") }, (text: string) => {
        tg.closeScanQrPopup()
        doScan(text)
        return true
      })
    } else {
      doScan("dev")
    }
  }

  const S = {
    root: { minHeight: "100vh", display: "flex", flexDirection: "column" as const, backgroundColor: "#f3f4f6" },
    header: { backgroundColor: "#000", color: "#fff", padding: "32px 24px 20px" },
    label: { fontSize: "11px", fontWeight: 900, letterSpacing: "0.2em", color: "#aaa", marginBottom: "8px" },
    name: { fontSize: "22px", fontWeight: 900, textTransform: "uppercase" as const },
    date: { fontSize: "13px", color: "#fff", marginTop: "6px", opacity: 0.7 },
    navRow: { display: "flex", gap: "8px", marginTop: "14px" },
    navBtn: { fontSize: "11px", fontWeight: 700, color: "#aaa", background: "none", border: "1px solid #333", cursor: "pointer", padding: "4px 10px", letterSpacing: "0.05em" } as React.CSSProperties,
    body: { flex: 1, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", padding: "40px 24px", gap: "20px" },
    btn: (disabled?: boolean): React.CSSProperties => ({ width: "100%", padding: "20px", backgroundColor: disabled ? "#666" : "#000", color: "#fff", fontWeight: 900, fontSize: "15px", textTransform: "uppercase" as const, letterSpacing: "0.08em", border: "none", cursor: disabled ? "not-allowed" : "pointer" }),
    hint: { fontSize: "13px", color: "#666", lineHeight: 1.6, borderBottom: "2px solid #000", paddingBottom: "20px", width: "100%", textAlign: "center" as const },
    info: { textAlign: "center" as const, width: "100%" },
    bigText: { fontSize: "20px", fontWeight: 900, textTransform: "uppercase" as const, marginBottom: "8px" },
    sub: { fontSize: "13px", color: "#666" },
    timer: { fontSize: "36px", fontWeight: 900, marginBottom: "6px" },
    error: { width: "100%", padding: "14px 16px", backgroundColor: "#fff", border: "2px solid #000", fontSize: "13px" },
  }

  return (
    <div style={S.root}>
      <input
        type="file"
        accept="image/*"
        capture="user"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handlePhotoUpload(file)
          e.target.value = ""
        }}
      />
      <div style={S.header}>
        <div style={S.label}>{T("app_name")}</div>
        <div style={S.name}>{firstName}</div>
        <div style={S.date}>{today}</div>
        <div style={S.navRow}>
          <button style={S.navBtn} onClick={onProfile}>{T("profile_btn")}</button>
          <button style={S.navBtn} onClick={onHistory}>{T("history_btn")}</button>
        </div>
      </div>

      <div style={S.body}>
        {state === "idle" && (
          <>
            <div style={S.hint}>{T("scan_qr_hint")}</div>
            {!photoUrl && (
              <button
                style={{ ...S.btn(photoLoading), backgroundColor: "#fff", color: "#000", border: "2px solid #000" }}
                onClick={() => fileInputRef.current?.click()}
                disabled={photoLoading}
              >
                {photoLoading ? T("photo_uploading") : T("photo_btn")}
              </button>
            )}
            {photoUrl && (
              <div style={{ width: "80px", height: "80px", border: "2px solid #000", overflow: "hidden", margin: "0 auto" }}>
                <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}
            <div style={{ fontSize: "11px", color: "#999", textAlign: "center" as const }}>{T("photo_hint")}</div>
            <button style={S.btn(loading)} onClick={handleScan} disabled={loading}>
              {loading ? T("checking_in") : T("checkin_btn")}
            </button>
          </>
        )}

        {state === "checked_in" && (
          <>
            <div style={S.info}>
              <div style={S.sub}>{T("on_site_since")} {checkInTime?.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</div>
              <div style={S.timer}>{elapsed}</div>
            </div>
            <button style={S.btn(loading)} onClick={handleScan} disabled={loading}>
              {loading ? T("checking_in") : T("checkout_btn")}
            </button>
          </>
        )}

        {state === "checked_out" && (
          <div style={{ ...S.info, borderTop: "2px solid #000", paddingTop: "24px" }}>
            <div style={{ width: "48px", height: "48px", backgroundColor: "#000", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "14px", height: "26px", borderRight: "3px solid #fff", borderBottom: "3px solid #fff", transform: "rotate(45deg)", marginTop: "-6px" }} />
            </div>
            <div style={S.bigText}>{T("worked_hours")}</div>
            <div style={{ fontSize: "32px", fontWeight: 900, marginBottom: "6px" }}>{hours}ч</div>
            <div style={S.sub}>{today}</div>
            {photoUrl && (
              <div style={{ width: "64px", height: "64px", border: "2px solid #000", overflow: "hidden", margin: "12px auto 0" }}>
                <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}
          </div>
        )}

        {error && <div style={S.error}>{error}</div>}
      </div>
    </div>
  )
}
