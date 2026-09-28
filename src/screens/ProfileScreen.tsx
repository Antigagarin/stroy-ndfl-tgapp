import type { AuthResult } from "../types"
export function ProfileScreen({ onBack }: { auth: AuthResult; onBack: () => void; apiPrefix: string }) {
  return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onBack}>Профиль (скоро)</div>
}
