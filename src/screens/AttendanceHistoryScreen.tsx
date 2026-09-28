import { useState, useEffect } from "react"
import { apiGet } from "../api"
import { useT } from "../i18n"
import type { AuthResult } from "../types"

interface AttendanceRecord {
  date: string; checkIn: string | null; checkOut: string | null; hours: number; siteName: string
}

export function AttendanceHistoryScreen({ auth: _auth, onBack, apiPrefix }: { auth: AuthResult; onBack: () => void; apiPrefix: string }) {
  const T = useT()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7))

  useEffect(() => {
    setLoading(true)
    apiGet<{ records: AttendanceRecord[] }>(`${apiPrefix}/attendance`, { month })
      .then(d => setRecords(d.records))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false))
  }, [month])

  const totalHours = records.reduce((s, r) => s + r.hours, 0)
  const totalDays = records.filter(r => r.hours > 0).length

  const S = {
    root: { minHeight: "100vh", backgroundColor: "#f3f4f6", paddingBottom: "32px" },
    header: { backgroundColor: "#000", color: "#fff", padding: "32px 24px 20px" },
    back: { fontSize: "12px", fontWeight: 700, color: "#aaa", background: "none", border: "none", cursor: "pointer", padding: "8px 0", marginBottom: "4px", display: "flex", alignItems: "center", minHeight: "44px" } as React.CSSProperties,
    label: { fontSize: "11px", fontWeight: 900, letterSpacing: "0.2em", color: "#aaa", marginBottom: "8px" },
    title: { fontSize: "22px", fontWeight: 900, textTransform: "uppercase" as const },
    stats: { display: "flex", gap: "24px", marginTop: "12px" },
    stat: { fontSize: "13px", color: "#aaa" },
    statVal: { fontWeight: 900, color: "#fff", fontSize: "18px" },
    monthRow: { margin: "16px 16px 8px", display: "flex", alignItems: "center", gap: "8px" },
    monthInput: { flex: 1, padding: "8px 12px", border: "2px solid #000", backgroundColor: "#fff", fontSize: "14px", fontWeight: 600 } as React.CSSProperties,
    card: { margin: "0 16px", border: "2px solid #000", backgroundColor: "#fff" },
    row: (border: boolean): React.CSSProperties => ({ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: border ? "1px solid #e5e7eb" : "none" }),
    dateText: { fontWeight: 700, fontSize: "14px" },
    siteText: { fontSize: "11px", color: "#666", marginTop: "2px" },
    timeText: { fontSize: "12px", color: "#666" },
    hoursText: (h: number): React.CSSProperties => ({ fontWeight: 900, fontSize: "16px", color: h > 0 ? "#000" : "#aaa" }),
    empty: { textAlign: "center" as const, padding: "40px", color: "#666", fontSize: "14px" },
  }

  return (
    <div style={S.root}>
      <div style={S.header}>
        <button style={S.back} onClick={onBack}>← {T("back")}</button>
        <div style={S.label}>{T("app_name")}</div>
        <div style={S.title}>{T("history_btn")}</div>
        <div style={S.stats}>
          <div style={S.stat}><span style={S.statVal}>{totalDays}</span> дн.</div>
          <div style={S.stat}><span style={S.statVal}>{totalHours}</span> ч.</div>
        </div>
      </div>

      <div style={S.monthRow}>
        <input type="month" style={S.monthInput} value={month} onChange={e => setMonth(e.target.value)} />
      </div>

      {loading && <div style={S.empty}>...</div>}
      {!loading && records.length === 0 && <div style={S.empty}>{T("no_attendance")}</div>}
      {!loading && records.length > 0 && (
        <div style={S.card}>
          {records.map((r, i) => (
            <div key={r.date} style={S.row(i < records.length - 1)}>
              <div>
                <div style={S.dateText}>{new Date(r.date + "T00:00:00").toLocaleDateString("ru-RU", { day: "numeric", month: "short", weekday: "short" })}</div>
                <div style={S.siteText}>{r.siteName}</div>
                {(r.checkIn || r.checkOut) && (
                  <div style={S.timeText}>
                    {r.checkIn ? r.checkIn.slice(11, 16) : "?"} → {r.checkOut ? r.checkOut.slice(11, 16) : "?"}
                  </div>
                )}
              </div>
              <div style={S.hoursText(r.hours)}>{r.hours > 0 ? `${r.hours}ч` : "—"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
