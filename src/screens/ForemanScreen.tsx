import type { AuthResult } from "../types"

interface Props {
  auth: AuthResult
}

export function ForemanScreen({ auth: _ }: Props) {
  return <div className="p-4">ForemanScreen — TODO</div>
}
