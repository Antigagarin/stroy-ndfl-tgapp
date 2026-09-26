import { useState } from "react"
import { apiPost } from "../api"
import type { AuthResult } from "../types"

interface Props {
  auth: AuthResult
}

export function WorkerCheckinScreen({ auth }: Props) {
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleCheckin() {
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
      } catch {
        // геолокация необязательна
      }
      await apiPost("/api/tgapp/checkin", { lat, lng })
      setDone(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка чекина")
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long" })
  const firstName = auth.fullName?.split(" ")[0] ?? ""

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-6">
      {done ? (
        <>
          <div className="text-5xl">✅</div>
          <div>
            <h2 className="text-xl font-bold mb-2">Явка отмечена</h2>
            <p className="text-sm text-gray-500">{today} — вы отмечены как присутствующий</p>
          </div>
        </>
      ) : (
        <>
          <div className="text-5xl">👷</div>
          <div>
            <h2 className="text-xl font-bold mb-2">Добро пожаловать{firstName ? `, ${firstName}` : ""}!</h2>
            <p className="text-sm text-gray-500">Нажмите кнопку, чтобы зафиксировать выход на работу сегодня</p>
          </div>
          <button
            onClick={handleCheckin}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-blue-500 text-white font-medium text-base disabled:opacity-50"
          >
            {loading ? "Отметка..." : `Отметить явку на ${today}`}
          </button>
        </>
      )}
      {error && (
        <div className="px-4 py-3 bg-red-50 text-red-600 text-sm rounded-xl w-full">{error}</div>
      )}
    </div>
  )
}
