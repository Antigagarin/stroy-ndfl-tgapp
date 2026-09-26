import type { AuthResult } from "../types"

interface Props {
  auth: AuthResult
}

export function WorkerCheckinScreen({ auth: _ }: Props) {
  return <div className="p-4">WorkerCheckinScreen — TODO</div>
}
