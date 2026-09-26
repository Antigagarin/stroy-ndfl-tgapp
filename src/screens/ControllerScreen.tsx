import type { AuthResult } from "../types"

interface Props {
  auth: AuthResult
}

export function ControllerScreen({ auth: _ }: Props) {
  return <div className="p-4">ControllerScreen — TODO</div>
}
