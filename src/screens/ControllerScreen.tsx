import { useState, useEffect, useCallback } from "react"
import { apiGet, apiPost } from "../api"
import type { AuthResult, SiteInfo, WorkerInfo, ControllerCheckEntry } from "../types"

interface Props { auth: AuthResult }

export function ControllerScreen({ auth: _auth }: Props) {
  const [sites, setSites] = useState<SiteInfo[]>([])
  const [selectedSite, setSelectedSite] = useState<SiteInfo | null>(null)
  const [workers, setWorkers] = useState<WorkerInfo[]>([])
  const [checks, setChecks] = useState<ControllerCheckEntry[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    apiGet<{ sites: SiteInfo[] }>("/api/tgapp/foreman")
      .then(d => setSites(d.sites))
      .catch(() => setError("Не удалось загрузить объекты"))
      .finally(() => setLoading(false))
  }, [])

  const loadSiteData = useCallback(async (site: SiteInfo) => {
    setDataLoading(true)
    setError("")
    try {
      const [workersData, checksData] = await Promise.all([
        apiGet<{ workers: WorkerInfo[] }>("/api/tgapp/foreman", { siteId: site.id }),
        apiGet<{ checks: ControllerCheckEntry[] }>("/api/tgapp/control", { siteId: site.id }),
      ])
      setWorkers(workersData.workers)
      setChecks(checksData.checks)
    } catch {
      setError("Ошибка загрузки данных")
    } finally {
      setDataLoading(false)
    }
  }, [])

  async function selectSite(site: SiteInfo) {
    setSelectedSite(site)
    setSelectedIds(new Set())
    setDone(false)
    setError("")
    await loadSiteData(site)
  }

  function toggleWorker(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleSubmit() {
    if (!selectedSite || selectedIds.size === 0) return
    setSubmitting(true)
    setError("")
    try {
      await apiPost("/api/tgapp/control", {
        siteId: selectedSite.id,
        workerIds: [...selectedIds],
        note: note.trim() || undefined,
      })
      setDone(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка проверки")
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
          <h1 className="text-lg font-semibold">Контроль — выберите объект</h1>
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

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-6">
        <div className="text-5xl">✅</div>
        <div>
          <h2 className="text-xl font-bold mb-2">Проверка зафиксирована</h2>
          <p className="text-sm text-gray-500">{selectedIds.size} работников на «{selectedSite.name}»</p>
        </div>
        <button onClick={() => { setDone(false); setSelectedSite(null) }}
          className="w-full py-3 px-4 rounded-xl bg-blue-500 text-white font-medium">
          К списку объектов
        </button>
      </div>
    )
  }

  const checkedWorkerIds = new Set(checks.map(c => c.workerId))

  return (
    <div className="min-h-screen pb-28">
      <div className="sticky top-0 bg-white border-b px-4 py-3 z-10 flex items-center gap-3">
        <button onClick={() => setSelectedSite(null)} className="text-blue-500 text-sm">← Назад</button>
        <h1 className="text-lg font-semibold flex-1 truncate">Контроль: {selectedSite.name}</h1>
      </div>

      <div className="mx-4 mt-4 bg-white rounded-2xl overflow-hidden shadow-sm">
        <div className="px-4 pt-4 pb-3 border-b">
          <label className="block text-xs text-gray-500 mb-1">Примечание (необязательно)</label>
          <input className="w-full text-base outline-none" placeholder="Нарушения, замечания..."
            value={note} onChange={e => setNote(e.target.value)} />
        </div>
        {dataLoading ? (
          <div className="py-8 text-center text-gray-400 text-sm">Загрузка...</div>
        ) : (
          workers.map(w => (
            <label key={w.id} className="flex items-center px-4 py-3 border-b last:border-0 gap-3 cursor-pointer">
              <input type="checkbox" checked={selectedIds.has(w.id)} onChange={() => toggleWorker(w.id)}
                className="w-5 h-5 rounded" />
              <span className="flex-1 text-sm">{w.fullName}</span>
              {checkedWorkerIds.has(w.id) && <span className="text-xs text-green-500">✓ проверен</span>}
            </label>
          ))
        )}
        {workers.length === 0 && !dataLoading && (
          <div className="py-8 text-center text-gray-400 text-sm">Нет работников</div>
        )}
      </div>

      {error && <div className="mx-4 mt-3 px-4 py-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <button onClick={handleSubmit} disabled={submitting || selectedIds.size === 0}
          className="w-full py-3 px-4 rounded-xl bg-blue-500 text-white font-medium text-base disabled:opacity-50">
          {submitting ? "Сохранение..." : `Зафиксировать проверку (${selectedIds.size} чел.)`}
        </button>
      </div>
    </div>
  )
}
