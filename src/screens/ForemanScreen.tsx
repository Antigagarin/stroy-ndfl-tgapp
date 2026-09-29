import { useState, useEffect } from "react"
import { apiGet, apiPost } from "../api"
import type { AuthResult, SiteInfo, WorkerInfo } from "../types"

interface Props { auth: AuthResult }

interface WorkerCard {
  id: string; fullName: string; taxStatus: string; patentExpiry: string | null
  dailyRate: number; status: string; totalDays: number; totalHours: number; payout: number
  attendance: Array<{ date: string; checkIn: string | null; checkOut: string | null; hours: number }>
}

const S = {
  root: { minHeight: "100vh", backgroundColor: "#f3f4f6" },
  header: { backgroundColor: "#000", color: "#fff", padding: "28px 20px 18px", position: "sticky" as const, top: 0, zIndex: 10 },
  back: { fontSize: "12px", fontWeight: 700, color: "#aaa", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: "8px", display: "block" } as React.CSSProperties,
  headerLabel: { fontSize: "11px", fontWeight: 900, letterSpacing: "0.2em", color: "#aaa", marginBottom: "6px" },
  headerTitle: { fontSize: "20px", fontWeight: 900, textTransform: "uppercase" as const },
  list: { padding: "12px 16px", display: "flex", flexDirection: "column" as const, gap: "8px" },
  card: { backgroundColor: "#fff", border: "2px solid #000", padding: "14px 16px", cursor: "pointer" as const },
  cardTitle: { fontWeight: 900, fontSize: "15px" },
  cardSub: { fontSize: "12px", color: "#666", marginTop: "2px" },
  sectionCard: { backgroundColor: "#fff", border: "2px solid #000", margin: "12px 16px" },
  sectionTitle: { fontSize: "11px", fontWeight: 900, textTransform: "uppercase" as const, color: "#6b7280", padding: "10px 16px 0" },
  statsRow: { display: "flex", borderBottom: "1px solid #e5e7eb" },
  stat: { flex: 1, padding: "12px 16px", borderRight: "1px solid #e5e7eb" },
  statLast: { flex: 1, padding: "12px 16px" },
  statLabel: { fontSize: "10px", fontWeight: 700, textTransform: "uppercase" as const, color: "#9ca3af", marginBottom: "4px" },
  statVal: { fontSize: "20px", fontWeight: 900 },
  calGrid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", padding: "12px 16px" },
  calCell: (worked: boolean, today: boolean): React.CSSProperties => ({
    aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "11px", fontWeight: worked ? 900 : 400,
    backgroundColor: worked ? "#000" : today ? "#f3f4f6" : "transparent",
    color: worked ? "#fff" : "#000",
    border: today ? "2px solid #000" : "1px solid #e5e7eb",
  }),
  rateRow: { display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", borderTop: "1px solid #e5e7eb" },
  rateLabel: { fontSize: "11px", fontWeight: 700, textTransform: "uppercase" as const, color: "#6b7280", flex: 1 },
  rateInput: { width: "100px", textAlign: "right" as const, fontWeight: 900, fontSize: "16px", border: "2px solid #000", padding: "6px 10px" },
  saveBtn: { padding: "6px 14px", backgroundColor: "#000", color: "#fff", fontWeight: 900, fontSize: "12px", border: "none", cursor: "pointer" } as React.CSSProperties,
  patentWarn: (expired: boolean): React.CSSProperties => ({
    margin: "8px 16px 0", padding: "10px 14px",
    backgroundColor: expired ? "#000" : "#facc15", color: expired ? "#fff" : "#000",
    fontSize: "12px", fontWeight: 900, textTransform: "uppercase" as const,
  }),
  errBox: { margin: "8px 16px", padding: "12px 16px", backgroundColor: "#000", color: "#fff", fontSize: "13px" },
}

function isExpired(expiry: string | null): boolean {
  if (!expiry) return false
  return new Date(expiry) < new Date()
}
function isExpiringSoon(expiry: string | null): boolean {
  if (!expiry) return false
  const d = new Date(expiry)
  const t = new Date(); t.setDate(t.getDate() + 14)
  return d >= new Date() && d <= t
}

export function ForemanScreen({ auth: _auth }: Props) {
  const [sites, setSites] = useState<SiteInfo[]>([])
  const [selectedSite, setSelectedSite] = useState<SiteInfo | null>(null)
  const [workers, setWorkers] = useState<WorkerInfo[]>([])
  const [workerCard, setWorkerCard] = useState<WorkerCard | null>(null)
  const [loading, setLoading] = useState(true)
  const [workersLoading, setWorkersLoading] = useState(false)
  const [cardLoading, setCardLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [batchHours, setBatchHours] = useState("8")
  const [error, setError] = useState("")
  const [newRate, setNewRate] = useState("")
  const [rateSaving, setRateSaving] = useState(false)
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7))

  useEffect(() => {
    apiGet<{ sites: SiteInfo[] }>("/api/tgapp/foreman")
      .then(d => setSites(d.sites))
      .catch(() => setError("Не удалось загрузить объекты"))
      .finally(() => setLoading(false))
  }, [])

  async function selectSite(site: SiteInfo) {
    setSelectedSite(site); setWorkerCard(null); setSelectedIds(new Set()); setDone(false); setError("")
    setWorkersLoading(true)
    try {
      const d = await apiGet<{ workers: WorkerInfo[] }>("/api/tgapp/foreman", { siteId: site.id })
      setWorkers(d.workers)
    } catch { setError("Не удалось загрузить работников") }
    finally { setWorkersLoading(false) }
  }

  async function openWorkerCard(w: WorkerInfo) {
    if (!selectedSite) return
    setCardLoading(true); setError("")
    try {
      const d = await apiGet<{ worker: WorkerCard }>("/api/tgapp/foreman", { siteId: selectedSite.id, workerId: w.id, month })
      setWorkerCard(d.worker); setNewRate(String(d.worker.dailyRate))
    } catch { setError("Не удалось загрузить карточку") }
    finally { setCardLoading(false) }
  }

  async function saveRate() {
    if (!workerCard) return
    setRateSaving(true)
    try {
      await apiPost("/api/tgapp/foreman", { workerId: workerCard.id, dailyRate: parseFloat(newRate) || 0 })
      const newPayout = workerCard.totalDays * (parseFloat(newRate) || 0)
      setWorkerCard(prev => prev ? { ...prev, dailyRate: parseFloat(newRate) || 0, payout: newPayout } : prev)
    } catch { /* silent */ }
    finally { setRateSaving(false) }
  }

  async function changeCardMonth(newMonth: string) {
    if (!selectedSite || !workerCard) return
    setMonth(newMonth); setCardLoading(true)
    try {
      const d = await apiGet<{ worker: WorkerCard }>("/api/tgapp/foreman", { siteId: selectedSite.id, workerId: workerCard.id, month: newMonth })
      setWorkerCard(d.worker); setNewRate(String(d.worker.dailyRate))
    } catch {}
    finally { setCardLoading(false) }
  }

  async function handleBatchSubmit() {
    if (!selectedSite || selectedIds.size === 0) return
    setSubmitting(true); setError("")
    try {
      await apiPost("/api/tgapp/foreman", { siteId: selectedSite.id, workerIds: [...selectedIds], date, hours: parseFloat(batchHours) || 8 })
      setDone(true)
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Ошибка") }
    finally { setSubmitting(false) }
  }

  function toggleWorker(id: string) {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  // Loading
  if (loading) return (
    <div style={{ ...S.root, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ fontSize: "14px", color: "#666" }}>...</div>
    </div>
  )

  // Level 1: Site list
  if (!selectedSite) return (
    <div style={S.root}>
      <div style={S.header}>
        <div style={S.headerLabel}>ПРОХОДНАЯ</div>
        <div style={S.headerTitle}>Объекты</div>
      </div>
      <div style={S.list}>
        {error && <div style={S.errBox}>{error}</div>}
        {sites.map(s => (
          <div key={s.id} style={S.card} onClick={() => selectSite(s)}>
            <div style={S.cardTitle}>{s.name}</div>
            {s.address && <div style={S.cardSub}>{s.address}</div>}
            <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>{s.workerCount} работников</div>
          </div>
        ))}
        {sites.length === 0 && <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>Нет объектов</div>}
      </div>
    </div>
  )

  // Level 3: Worker card
  if (workerCard) {
    const todayStr = new Date().toISOString().slice(0, 10)
    const daysInMonth = new Date(parseInt(month.slice(0,4)), parseInt(month.slice(5,7)), 0).getDate()
    const attMap = new Map(workerCard.attendance.map(a => [a.date, a]))
    const patentExp = isExpired(workerCard.patentExpiry)
    const patentSoon = isExpiringSoon(workerCard.patentExpiry)

    return (
      <div style={S.root}>
        <div style={S.header}>
          <button style={S.back} onClick={() => setWorkerCard(null)}>← Работники</button>
          <div style={S.headerLabel}>ПРОХОДНАЯ</div>
          <div style={S.headerTitle}>{workerCard.fullName}</div>
        </div>

        {(patentExp || patentSoon) && (
          <div style={S.patentWarn(patentExp)}>
            {patentExp ? "Патент просрочен" : `Патент истекает ${new Date(workerCard.patentExpiry!).toLocaleDateString("ru-RU")}`}
          </div>
        )}

        <div style={S.sectionCard}>
          <div style={S.sectionTitle}>Итого за месяц</div>
          <div style={S.statsRow}>
            <div style={S.stat}><div style={S.statLabel}>Дней</div><div style={S.statVal}>{workerCard.totalDays}</div></div>
            <div style={S.stat}><div style={S.statLabel}>Часов</div><div style={S.statVal}>{workerCard.totalHours}</div></div>
            <div style={S.statLast}><div style={S.statLabel}>К выплате</div><div style={S.statVal}>{workerCard.payout.toLocaleString("ru-RU")} ₽</div></div>
          </div>
          <div style={S.rateRow}>
            <div style={S.rateLabel}>Ставка/день</div>
            <input style={S.rateInput} type="number" value={newRate} onChange={e => setNewRate(e.target.value)} />
            <button style={S.saveBtn} onClick={saveRate} disabled={rateSaving}>{rateSaving ? "..." : "✓"}</button>
          </div>
        </div>

        <div style={{ margin: "0 16px 8px" }}>
          <input type="month" value={month} onChange={e => changeCardMonth(e.target.value)}
            style={{ width: "100%", padding: "8px", border: "2px solid #000", backgroundColor: "#fff", fontSize: "13px" }} />
        </div>

        <div style={S.sectionCard}>
          <div style={S.sectionTitle}>Явки</div>
          {cardLoading ? <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>...</div> : (
            <div style={S.calGrid}>
              {Array.from({ length: daysInMonth }, (_, i) => {
                const d = `${month}-${String(i + 1).padStart(2, "0")}`
                const att = attMap.get(d)
                const worked = att ? att.hours > 0 : false
                const isToday = d === todayStr
                return (
                  <div key={d} style={S.calCell(worked, isToday)}
                    title={att ? `${att.checkIn?.slice(11,16) ?? ""}→${att.checkOut?.slice(11,16) ?? ""} ${att.hours}ч` : ""}>
                    {i + 1}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Done state
  if (done) return (
    <div style={{ ...S.root, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", padding: "40px 24px", gap: "20px" }}>
      <div style={{ fontSize: "20px", fontWeight: 900, textTransform: "uppercase" as const }}>✓ Явка отмечена</div>
      <div style={{ fontSize: "14px", color: "#666" }}>{selectedIds.size} чел. — {selectedSite.name}</div>
      <button onClick={() => { setDone(false); setSelectedIds(new Set()) }}
        style={{ width: "100%", padding: "18px", backgroundColor: "#000", color: "#fff", fontWeight: 900, fontSize: "14px", border: "none", cursor: "pointer", textTransform: "uppercase" as const }}>
        ← Назад к рабочим
      </button>
    </div>
  )

  // Level 2: Workers list
  const expiredCount = workers.filter(w => w.patentWarning === "EXPIRED").length
  const expiringSoonCount = workers.filter(w => w.patentWarning === "EXPIRING_SOON").length

  return (
    <div style={{ ...S.root, paddingBottom: "90px" }}>
      <div style={S.header}>
        <button style={S.back} onClick={() => setSelectedSite(null)}>← Объекты</button>
        <div style={S.headerLabel}>ПРОХОДНАЯ</div>
        <div style={S.headerTitle}>{selectedSite.name}</div>
      </div>

      {expiredCount > 0 && (
        <div style={{ margin: "12px 16px 0", padding: "12px 16px", backgroundColor: "#000", color: "#fff", fontSize: "13px", fontWeight: 900, textTransform: "uppercase" as const }}>
          ⚠ Патент просрочен: {expiredCount} чел.
        </div>
      )}
      {expiringSoonCount > 0 && (
        <div style={{ margin: expiredCount > 0 ? "4px 16px 0" : "12px 16px 0", padding: "12px 16px", backgroundColor: "#facc15", color: "#000", fontSize: "13px", fontWeight: 900, textTransform: "uppercase" as const }}>
          ⚠ Патент истекает: {expiringSoonCount} чел.
        </div>
      )}

      <div style={{ margin: "12px 16px", backgroundColor: "#fff", border: "2px solid #000" }}>
        <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ flex: 1, padding: "10px 16px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase" as const, color: "#9ca3af", marginBottom: "4px" }}>Дата</div>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              style={{ fontSize: "14px", border: "none", outline: "none" }} />
          </div>
          <div style={{ width: "80px", padding: "10px 16px", borderLeft: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase" as const, color: "#9ca3af", marginBottom: "4px" }}>Часов</div>
            <input type="number" value={batchHours} onChange={e => setBatchHours(e.target.value)} min="1" max="24"
              style={{ fontSize: "14px", border: "none", outline: "none", width: "100%" }} />
          </div>
        </div>
        <button onClick={() => setSelectedIds(workers.length > 0 && selectedIds.size === workers.length ? new Set() : new Set(workers.map(w => w.id)))}
          style={{ width: "100%", padding: "10px 16px", textAlign: "left" as const, background: "none", border: "none", borderBottom: "1px solid #e5e7eb", cursor: "pointer", fontSize: "13px", fontWeight: 700 }}>
          {selectedIds.size === workers.length && workers.length > 0 ? "Снять всех" : "Выбрать всех"}
          <span style={{ color: "#9ca3af", marginLeft: "8px" }}>{selectedIds.size}/{workers.length}</span>
        </button>

        {workersLoading ? <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>...</div> : workers.map(w => (
          <div key={w.id} style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #e5e7eb", gap: "12px" }}>
            <div onClick={() => toggleWorker(w.id)}
              style={{ minWidth: "20px", height: "20px", border: "2px solid #000", backgroundColor: selectedIds.has(w.id) ? "#000" : "#fff", cursor: "pointer", flexShrink: 0 }} />
            <div style={{ flex: 1, cursor: "pointer" }} onClick={() => openWorkerCard(w)}>
              <span style={{ fontSize: "14px", fontWeight: 600 }}>{w.fullName}</span>
              {w.patentWarning === "EXPIRED" && <span style={{ marginLeft: "8px", fontSize: "10px", fontWeight: 900, backgroundColor: "#000", color: "#fff", padding: "1px 5px" }}>ПРОСРОЧЕН</span>}
              {w.patentWarning === "EXPIRING_SOON" && <span style={{ marginLeft: "8px", fontSize: "10px", fontWeight: 900, backgroundColor: "#facc15", color: "#000", padding: "1px 5px" }}>ИСТЕКАЕТ</span>}
            </div>
            <span style={{ fontSize: "10px", color: "#6b7280" }}>→</span>
          </div>
        ))}
        {workers.length === 0 && !workersLoading && <div style={{ padding: "24px", textAlign: "center", color: "#666", fontSize: "13px" }}>Нет работников</div>}
      </div>

      {error && <div style={S.errBox}>{error}</div>}

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "12px 16px", backgroundColor: "#fff", borderTop: "2px solid #000" }}>
        <button onClick={handleBatchSubmit} disabled={submitting || selectedIds.size === 0}
          style={{ width: "100%", padding: "16px", backgroundColor: selectedIds.size === 0 ? "#666" : "#000", color: "#fff", fontWeight: 900, fontSize: "14px", textTransform: "uppercase" as const, letterSpacing: "0.06em", border: "none", cursor: selectedIds.size === 0 ? "not-allowed" : "pointer" }}>
          {submitting ? "Сохранение..." : `Отметить явку (${selectedIds.size} чел.)`}
        </button>
      </div>
    </div>
  )
}
