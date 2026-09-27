import { useState, useEffect } from "react"
import { apiGet, apiPost } from "../api"
import type { AuthResult, SiteInfo, WorkerInfo } from "../types"

interface Props { auth: AuthResult }

export function ForemanScreen({ auth: _auth }: Props) {
  const [sites, setSites] = useState<SiteInfo[]>([])
  const [selectedSite, setSelectedSite] = useState<SiteInfo | null>(null)
  const [workers, setWorkers] = useState<WorkerInfo[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [hours, setHours] = useState("8")
  const [loading, setLoading] = useState(true)
  const [workersLoading, setWorkersLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    apiGet<{ sites: SiteInfo[] }>("/api/tgapp/foreman")
      .then(d => setSites(d.sites))
      .catch(() => setError("Не удалось загрузить объекты"))
      .finally(() => setLoading(false))
  }, [])

  async function selectSite(site: SiteInfo) {
    setSelectedSite(site)
    setSelectedIds(new Set())
    setDone(false)
    setError("")
    setWorkersLoading(true)
    try {
      const d = await apiGet<{ workers: WorkerInfo[] }>("/api/tgapp/foreman", { siteId: site.id })
      setWorkers(d.workers)
    } catch {
      setError("Не удалось загрузить работников")
    } finally {
      setWorkersLoading(false)
    }
  }

  function toggleWorker(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selectedIds.size === workers.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(workers.map(w => w.id)))
    }
  }

  async function handleSubmit() {
    if (!selectedSite || selectedIds.size === 0) return
    setSubmitting(true)
    setError("")
    try {
      await apiPost("/api/tgapp/foreman", {
        siteId: selectedSite.id,
        workerIds: [...selectedIds],
        date,
        hours: parseFloat(hours) || 8,
      })
      setDone(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка отметки явки")
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
          <h1 className="text-lg font-semibold">Объекты</h1>
        </div>
        {error && <div className="mx-4 mt-3 px-4 py-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}
        <div className="mx-4 mt-4 space-y-2">
          {sites.map(site => (
            <button
              key={site.id}
              onClick={() => selectSite(site)}
              className="w-full text-left bg-white rounded-2xl px-4 py-4 shadow-sm"
            >
              <div className="font-medium">{site.name}</div>
              {site.address && <div className="text-xs text-gray-500 mt-0.5">{site.address}</div>}
              <div className="text-xs text-blue-500 mt-1">{site.workerCount} работников</div>
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
          <h2 className="text-xl font-bold mb-2">Явка отмечена</h2>
          <p className="text-sm text-gray-500">{selectedIds.size} чел. на объекте «{selectedSite.name}»</p>
        </div>
        <button
          onClick={() => {
            setDone(false)
            setSelectedSite(null)
            setSites([])
            setLoading(true)
            apiGet<{ sites: SiteInfo[] }>("/api/tgapp/foreman")
              .then(d => setSites(d.sites))
              .finally(() => setLoading(false))
          }}
          className="w-full py-3 px-4 rounded-xl bg-blue-500 text-white font-medium"
        >
          К списку объектов
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-28">
      <div className="sticky top-0 bg-white border-b px-4 py-3 z-10 flex items-center gap-3">
        <button onClick={() => setSelectedSite(null)} className="text-blue-500 text-sm">← Назад</button>
        <h1 className="text-lg font-semibold flex-1 truncate">{selectedSite.name}</h1>
      </div>

      <div className="mx-4 mt-4 bg-white rounded-2xl overflow-hidden shadow-sm">
        <div className="px-4 pt-4 pb-2 border-b flex gap-4">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Дата</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full text-base outline-none" />
          </div>
          <div className="w-20">
            <label className="block text-xs text-gray-500 mb-1">Часов</label>
            <input type="number" value={hours} onChange={e => setHours(e.target.value)}
              min="1" max="24" className="w-full text-base outline-none" />
          </div>
        </div>
        <button onClick={toggleAll} className="w-full px-4 py-3 text-left text-sm text-blue-500 border-b">
          {selectedIds.size === workers.length && workers.length > 0 ? "Снять всех" : "Выбрать всех"}
          <span className="text-gray-400 ml-2">{selectedIds.size}/{workers.length}</span>
        </button>
        {workersLoading ? (
          <div className="py-8 text-center text-gray-400 text-sm">Загрузка...</div>
        ) : (
          workers.map(w => (
            <label key={w.id} className="flex items-center px-4 py-3 border-b last:border-0 gap-3 cursor-pointer">
              <input type="checkbox" checked={selectedIds.has(w.id)} onChange={() => toggleWorker(w.id)}
                className="w-5 h-5 rounded" />
              <span className="flex-1 text-sm">
                {w.fullName}
                {w.patentWarning === "EXPIRED" && (
                  <span className="ml-2 px-1 bg-black text-white text-xs font-black uppercase">ПАТЕНТ ПРОСРОЧЕН</span>
                )}
                {w.patentWarning === "EXPIRING_SOON" && (
                  <span className="ml-2 px-1 bg-yellow-400 text-black text-xs font-black uppercase">ПАТЕНТ СКОРО</span>
                )}
              </span>
              {w.status !== "APPROVED" && (
                <span className="text-xs text-orange-500">ожидает</span>
              )}
            </label>
          ))
        )}
        {workers.length === 0 && !workersLoading && (
          <div className="py-8 text-center text-gray-400 text-sm">Нет работников</div>
        )}
      </div>

      {error && <div className="mx-4 mt-3 px-4 py-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <button
          onClick={handleSubmit}
          disabled={submitting || selectedIds.size === 0}
          className="w-full py-3 px-4 rounded-xl bg-blue-500 text-white font-medium text-base disabled:opacity-50"
        >
          {submitting ? "Сохранение..." : `Отметить явку (${selectedIds.size} чел.)`}
        </button>
      </div>
    </div>
  )
}
