import type { AuthResult } from "../types"

interface Props {
  auth: AuthResult
}

export function GateScreen({ auth: _ }: Props) {
  return <div className="p-4">GateScreen — TODO</div>
}
