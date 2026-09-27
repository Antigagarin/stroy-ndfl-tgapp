export type WorkerStatus = "PENDING" | "APPROVED" | "BLOCKED"
export type GateDirection = "IN" | "OUT"
export type UserRole = "ADMIN" | "FOREMAN" | "CONTRACTOR" | "GATE_OFFICER" | "CONTROLLER"

export interface AuthResult {
  role: "worker" | UserRole | "unknown"
  id: string
  fullName?: string
  status?: WorkerStatus
  siteId?: string
}

export interface Organization {
  id: string
  name: string
  type: string
  siteId: string
  siteName: string
}

export interface SiteInfo {
  id: string
  name: string
  address?: string
  workerCount: number
}

export interface WorkerInfo {
  id: string
  fullName: string
  status: WorkerStatus
  organizationId: string
  patentWarning?: "EXPIRED" | "EXPIRING_SOON" | null
}

export interface GateLogEntry {
  id: string
  workerId: string
  workerName: string
  direction: GateDirection
  createdAt: string
}

export interface ControllerCheckEntry {
  id: string
  workerId: string
  workerName: string
  note?: string | null
  checkedAt: string
}
