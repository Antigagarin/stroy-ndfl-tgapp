import { useState, useEffect, useCallback } from "react"
import { apiGet, apiPost } from "../api"
import type { AuthResult, SiteInfo, WorkerInfo, GateLogEntry } from "../types"

interface Props { auth: AuthResult }

export function GateScreen({ auth: _auth }: Props) {
  const [sites, setSites] = useState<SiteInfo[]>([])
  const [selectedSite, setSelectedSite] = useState<SiteInfo | null>(null)
  const [workers, setWorkers] = useState<WorkerInfo[]>([])
  const [logs, setLogs] = useState<GateLogEntry[]>([])
  const [selectedWorkerId, setSelectedWorkerId] = useState("")
  const [loading, setLoading] = useState(true)
  const [logsLoading, setLogsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    apiGet<{ sites: SiteInfo[] }>("/api/tgapp/foreman")
      .then(d => setSites(d.sites))
      .catch(() => setError("Не удалось загрузить объекты"))
      .finally(() => setLoading(false))
  }, [])

  const loadSiteData = useCallback(async (site: SiteInfo) => {
    setLogsLoading(true)
    setError("")
    try {
      const [workersData, logsData] = await Promise.all([
        apiGet<{ workers: WorkerInfo[] }>("/api/tgapp/foreman", { siteId: site.id }),
        apiGet<{ logs: GateLogEntry[] }>("/api/tgapp/gate", { siteId: site.id }),
      ])
      setWorkers(workersData.workers)
      setLogs(logsData.logs)
    } catch {
      setError("Ошибка загрузки данных")
    } finally {
      setLogsLoading(false)
    }
  }, [])

  async function selectSite(site: SiteInfo) {
    setSelectedSite(site)
    setSelectedWorkerId("")
    await loadSiteData(site)
  }

  async function handleGate(direction: "IN" | "OUT") {
    if (!selectedSite || !selectedWorkerId) return
    setSubmitting(true)
    setError("")
    try {
      await apiPost("/api/tgapp/gate", { siteId: selectedSite.id, workerId: selectedWorkerId, direction })
      setSelectedWorkerId("")
      const logsData = await apiGet<{ logs: GateLogEntry[] }>("/api/tgapp/gate", { siteId: selectedSite.id })
      setLogs(logsData.logs)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!selectedSite) {
    return (
      <div className="min-h-screen pb-8">
        <div className="sticky top-0 bg-white border-b px-4 py-3 z-10">
          <h1 className="text-lg font-semibold">Проходная — выберите объект</h1>
        </div>
        {error && <div className="mx-4 mt-3 px-4 py-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}
        <div className="mx-4 mt-4 space-y-2">
          {sites.map(site => (
            <button key={site.id} onClick={() => selectSite(site)}
              className="w-full text-left bg-white rounded-2xl px-4 py-4 shadow-sm">
              <div className="font-medium">{site.name}</div>
              {site.address && <div className="text-xs text-gray-500 mt-0.5">{site.address}</div>}
            </button>
          ))}
          {sites.length === 0 && <div className="text-center text-gray-400 py-12">Нет объектов</div>}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-8">
      <div className="sticky top-0 bg-white border-b px-4 py-3 z-10 flex items-center gap-3">
        <button onClick={() => setSelectedSite(null)} className="text-blue-500 text-sm">← Назад</button>
        <h1 className="text-lg font-semibold flex-1 truncate">Проходная: {selectedSite.name}</h1>
      </div>

      <div className="mx-4 mt-4 bg-white rounded-2xl overflow-hidden shadow-sm">
        <div className="px-4 pt-4 pb-3 border-b">
          <label className="block text-xs text-gray-500 mb-1">Работник</label>
          <select className="w-full text-base outline-none bg-transparent"
            value={selectedWorkerId} onChange={e => setSelectedWorkerId(e.target.value)}>
            <option value="">Выберите работника</option>
            {workers.map(w => (
              <option key={w.id} value={w.id}>{w.fullName}</option>
            ))}
          </select>
        </div>
        <div className="p-4 flex gap-3">
          <button onClick={() => handleGate("IN")} disabled={submitting || !selectedWorkerId}
            className="flex-1 py-3 rounded-xl bg-green-500 text-white font-medium disabled:opacity-50">
            {submitting ? "..." : "Вход ✅"}
          </button>
          <button onClick={() => handleGate("OUT")} disabled={submitting || !selectedWorkerId}
            className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-medium disabled:opacity-50">
            {submitting ? "..." : "Выход 🚪"}
          </button>
        </div>
      </div>

      {error && <div className="mx-4 mt-3 px-4 py-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}

      <div className="mx-4 mt-4">
        <h2 className="text-sm font-medium text-gray-500 mb-2">Журнал сегодня</h2>
        {logsLoading ? (
          <div className="text-center text-gray-400 py-8 text-sm">Загрузка...</div>
        ) : (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            {logs.map(log => (
              <div key={log.id} className="flex items-center px-4 py-3 border-b last:border-0 gap-3">
                <span className="text-lg">{log.direction === "IN" ? "✅" : "🚪"}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium">{log.workerName}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(log.createdAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                    {" · "}
                    {log.direction === "IN" ? "Вход" : "Выход"}
                  </div>
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="py-8 text-center text-gray-400 text-sm">Проходов ещё нет</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
