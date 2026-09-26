import { useState, useEffect } from "react"
import { apiPost, apiGet } from "../api"
import type { AuthResult, Organization } from "../types"

interface Props {
  onRegistered: (auth: AuthResult) => void
}

export function WorkerRegisterScreen({ onRegistered }: Props) {
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [fullName, setFullName] = useState("")
  const [inn, setInn] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [isResident, setIsResident] = useState(true)
  const [orgId, setOrgId] = useState("")
  const [loading, setLoading] = useState(false)
  const [orgsLoading, setOrgsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    apiGet<{ organizations: Organization[] }>("/api/tgapp/organizations")
      .then(d => setOrgs(d.organizations))
      .catch(() => setError("Не удалось загрузить список организаций"))
      .finally(() => setOrgsLoading(false))
  }, [])

  async function handleSubmit() {
    if (!fullName.trim()) { setError("Введите ФИО"); return }
    if (!orgId) { setError("Выберите организацию"); return }
    setLoading(true)
    setError("")
    try {
      const worker = await apiPost<{ id: string; fullName: string; status: string }>(
        "/api/tgapp/register",
        { fullName: fullName.trim(), inn: inn.trim(), organizationId: orgId, birthDate: birthDate || null, isResident }
      )
      onRegistered({ role: "worker", id: worker.id, fullName: worker.fullName, status: "APPROVED" })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка регистрации")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pb-8">
      <div className="sticky top-0 bg-white border-b px-4 py-3 z-10">
        <h1 className="text-lg font-semibold">Регистрация работника</h1>
      </div>

      <div className="mx-4 mt-4 bg-white rounded-2xl overflow-hidden shadow-sm">
        <div className="px-4 pt-4 pb-2 border-b">
          <label className="block text-xs text-gray-500 mb-1">ФИО *</label>
          <input
            className="w-full text-base outline-none"
            placeholder="Иванов Иван Иванович"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
          />
        </div>
        <div className="px-4 pt-4 pb-2 border-b">
          <label className="block text-xs text-gray-500 mb-1">ИНН (необязательно)</label>
          <input
            className="w-full text-base outline-none"
            placeholder="123456789012"
            inputMode="numeric"
            maxLength={12}
            value={inn}
            onChange={e => setInn(e.target.value)}
          />
        </div>
        <div className="px-4 pt-4 pb-2 border-b">
          <label className="block text-xs text-gray-500 mb-1">Дата рождения (необязательно)</label>
          <input
            type="date"
            className="w-full text-base outline-none"
            value={birthDate}
            onChange={e => setBirthDate(e.target.value)}
          />
        </div>
        <div className="px-4 py-4 border-b flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Налоговый статус</div>
            <div className="text-xs text-gray-500">{isResident ? "Резидент РФ — НДФЛ 13%" : "Нерезидент РФ — НДФЛ 30%"}</div>
          </div>
          <input
            type="checkbox"
            checked={isResident}
            onChange={e => setIsResident(e.target.checked)}
            className="w-5 h-5"
          />
        </div>
        <div className="px-4 pt-4 pb-4">
          <label className="block text-xs text-gray-500 mb-1">Организация / Объект *</label>
          {orgsLoading ? (
            <div className="text-sm text-gray-400">Загрузка...</div>
          ) : (
            <select
              className="w-full text-base outline-none bg-transparent"
              value={orgId}
              onChange={e => setOrgId(e.target.value)}
            >
              <option value="">Выберите организацию</option>
              {orgs.map(o => (
                <option key={o.id} value={o.id}>{o.siteName} — {o.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-3 px-4 py-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>
      )}

      <div className="mx-4 mt-4">
        <button
          onClick={handleSubmit}
          disabled={loading || orgsLoading}
          className="w-full py-3 px-4 rounded-xl bg-blue-500 text-white font-medium text-base disabled:opacity-50"
        >
          {loading ? "Регистрация..." : "Зарегистрироваться"}
        </button>
      </div>
    </div>
  )
}
