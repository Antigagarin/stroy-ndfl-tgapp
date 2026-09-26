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

export default function App() {
  const [loading, setLoading] = useState(true)
  const [auth, setAuth] = useState<AuthResult | null>(null)
  const [showRegister, setShowRegister] = useState(false)

  useEffect(() => {
    apiPost<AuthResult>("/api/tgapp/auth", {})
      .then(data => { setAuth(data); setLoading(false) })
      .catch(() => { setAuth({ role: "unknown", id: "" }); setLoading(false) })
  }, [])

  const renderScreen = () => {
    if (loading || !auth) return <LoadingScreen />
    if (auth.role === "unknown" && !showRegister) {
      return <UnknownScreen onRegister={() => setShowRegister(true)} />
    }
    if (auth.role === "unknown" || showRegister) {
      return <WorkerRegisterScreen onRegistered={a => { setAuth(a); setShowRegister(false) }} />
    }
    if (auth.role === "worker") return <WorkerCheckinScreen auth={auth} />
    if (auth.role === "FOREMAN" || auth.role === "ADMIN") return <ForemanScreen auth={auth} />
    if (auth.role === "GATE_OFFICER") return <GateScreen auth={auth} />
    if (auth.role === "CONTROLLER") return <ControllerScreen auth={auth} />
    return <UnknownScreen onRegister={() => setShowRegister(true)} />
  }

  return <div className="min-h-screen">{renderScreen()}</div>
}
