import type { AuthResult } from "../types"
export function AttendanceHistoryScreen({ onBack }: { auth: AuthResult; onBack: () => void; apiPrefix: string }) {
  return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onBack}>История явок (скоро)</div>
}
