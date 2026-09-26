import type { AuthResult } from "../types"

interface Props {
  onRegistered: (auth: AuthResult) => void
}

export function WorkerRegisterScreen({ onRegistered: _ }: Props) {
  return <div className="p-4">WorkerRegisterScreen — TODO</div>
}
