import { useEffect, useState } from "react"
import { apiPost } from "./api"
import type { AuthResult } from "./types"
import { LoadingScreen } from "./screens/LoadingScreen"
import { UnknownScreen } from "./screens/UnknownScreen"
import { WorkerRegisterScreen } from "./screens/WorkerRegisterScreen"
import { WorkerCheckinScreen } from "./screens/WorkerCheckinScreen"
import { ForemanScreen } from "./screens/ForemanScreen"
import { GateScreen } from "./screens/GateScreen"
import { ControllerScreen } from "./screens/ControllerScreen"
import { ProfileScreen } from "./screens/ProfileScreen"
import { AttendanceHistoryScreen } from "./screens/AttendanceHistoryScreen"
import { LangSwitcher } from "./components/LangSwitcher"

type Screen = "main" | "profile" | "history"

export default function App() {
  const [loading, setLoading] = useState(true)
  const [auth, setAuth] = useState<AuthResult | null>(null)
  const [showRegister, setShowRegister] = useState(false)
  const [screen, setScreen] = useState<Screen>("main")

  useEffect(() => {
    apiPost<AuthResult>("/api/tgapp/auth", {})
      .then(data => { setAuth(data); setLoading(false) })
      .catch(() => { setAuth({ role: "unknown", id: "" }); setLoading(false) })
  }, [])

  const renderScreen = () => {
    if (loading || !auth) return <LoadingScreen />
    if (screen === "profile" && auth.role === "worker") return <ProfileScreen auth={auth} onBack={() => setScreen("main")} apiPrefix="/api/tgapp" />
    if (screen === "history" && auth.role === "worker") return <AttendanceHistoryScreen auth={auth} onBack={() => setScreen("main")} apiPrefix="/api/tgapp" />
    if (auth.role === "unknown" && !showRegister) return <UnknownScreen onRegister={() => setShowRegister(true)} />
    if (auth.role === "unknown" || showRegister) return <WorkerRegisterScreen onRegistered={a => { setAuth(a); setShowRegister(false) }} />
    if (auth.role === "worker") return <WorkerCheckinScreen auth={auth} onProfile={() => setScreen("profile")} onHistory={() => setScreen("history")} />
    if (["FOREMAN", "ADMIN", "SUPER_ADMIN"].includes(auth.role)) return <ForemanScreen auth={auth} />
    if (auth.role === "GATE_OFFICER") return <GateScreen auth={auth} />
    if (auth.role === "CONTROLLER") return <ControllerScreen auth={auth} />
    return <UnknownScreen onRegister={() => setShowRegister(true)} />
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="fixed top-0 right-0 z-50 p-2"><LangSwitcher /></div>
      {renderScreen()}
    </div>
  )
}
