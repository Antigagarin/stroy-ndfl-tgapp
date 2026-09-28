import { useState, useEffect } from "react"
import { apiGet, apiPost } from "../api"
import { useT } from "../i18n"
import type { AuthResult } from "../types"

interface WorkerProfile {
  id: string; fullName: string; birthDate: string | null; taxStatus: string
  inn: string | null; snils: string | null; patentNumber: string | null; patentExpiry: string | null
  organization: { name: string; siteName: string }
}

type TaxStatus = "RF_RESIDENT" | "EAEU_CITIZEN" | "PATENT" | "NONRESIDENT"

export function ProfileScreen({ auth: _auth, onBack, apiPrefix }: { auth: AuthResult; onBack: () => void; apiPrefix: string }) {
  const T = useT()
  const [profile, setProfile] = useState<WorkerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)

  const [fullName, setFullName] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [taxStatus, setTaxStatus] = useState<TaxStatus>("RF_RESIDENT")
  const [inn, setInn] = useState("")
  const [snils, setSnils] = useState("")
  const [patentNumber, setPatentNumber] = useState("")
  const [patentExpiry, setPatentExpiry] = useState("")

  useEffect(() => {
    apiGet<WorkerProfile>(`${apiPrefix}/profile`)
      .then(p => {
        setProfile(p)
        setFullName(p.fullName)
        setBirthDate(p.birthDate ?? "")
        setTaxStatus(p.taxStatus as TaxStatus)
        setInn(p.inn ?? "")
        setSnils(p.snils ?? "")
        setPatentNumber(p.patentNumber ?? "")
        setPatentExpiry(p.patentExpiry ?? "")
      })
      .catch(() => setError(T("error_load")))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    if (!fullName.trim()) { setError(T("full_name") + " " + T("required")); return }
    setSaving(true); setError(""); setSaved(false)
    try {
      await apiPost(`${apiPrefix}/profile`, {
        fullName: fullName.trim(), birthDate: birthDate || null, taxStatus,
        inn: inn || null, snils: snils || null, patentNumber: patentNumber || null, patentExpiry: patentExpiry || null,
      })
      setSaved(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : T("error_load"))
    } finally {
      setSaving(false)
    }
  }

  const showInn = taxStatus !== "NONRESIDENT"
  const showPatent = taxStatus === "PATENT"

  const S = {
    root: { minHeight: "100vh", backgroundColor: "#f3f4f6", paddingBottom: "32px" },
    header: { backgroundColor: "#000", color: "#fff", padding: "32px 24px 20px" },
    back: { fontSize: "12px", fontWeight: 700, color: "#aaa", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: "10px", display: "block" } as React.CSSProperties,
    label: { fontSize: "11px", fontWeight: 900, letterSpacing: "0.2em", color: "#aaa", marginBottom: "8px" },
    title: { fontSize: "22px", fontWeight: 900, textTransform: "uppercase" as const },
    card: { backgroundColor: "#fff", margin: "16px", border: "2px solid #000" },
    row: (border: boolean): React.CSSProperties => ({ borderBottom: border ? "1px solid #e5e7eb" : "none", padding: "12px 16px" }),
    rowLabel: { fontSize: "11px", fontWeight: 700, textTransform: "uppercase" as const, color: "#6b7280", marginBottom: "6px" },
    input: { width: "100%", fontSize: "15px", fontWeight: 500, outline: "none", border: "none", backgroundColor: "transparent" } as React.CSSProperties,
    radioRow: { display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", marginBottom: "8px" } as React.CSSProperties,
    radioBox: (active: boolean): React.CSSProperties => ({ minWidth: "20px", height: "20px", border: "2px solid #000", backgroundColor: active ? "#000" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }),
    radioDot: { width: "8px", height: "8px", backgroundColor: "#fff" },
    btn: (disabled: boolean): React.CSSProperties => ({ width: "100%", padding: "18px", backgroundColor: disabled ? "#666" : "#000", color: "#fff", fontWeight: 900, fontSize: "15px", textTransform: "uppercase" as const, letterSpacing: "0.08em", border: "none", cursor: disabled ? "not-allowed" : "pointer" }),
    success: { margin: "0 16px 12px", padding: "12px 16px", backgroundColor: "#f0fdf4", border: "2px solid #000", fontSize: "13px", fontWeight: 700 },
    err: { margin: "0 16px 12px", padding: "12px 16px", backgroundColor: "#000", color: "#fff", fontSize: "13px", fontWeight: 700 },
  }

  if (loading) return <div style={{ ...S.root, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ fontSize: "14px", color: "#666" }}>...</div></div>

  return (
    <div style={S.root}>
      <div style={S.header}>
        <button style={S.back} onClick={onBack}>← {T("back")}</button>
        <div style={S.label}>{T("app_name")}</div>
        <div style={S.title}>{T("profile_btn")}</div>
        {profile && <div style={{ fontSize: "13px", color: "#aaa", marginTop: "4px" }}>{profile.organization.siteName} — {profile.organization.name}</div>}
      </div>

      <div style={S.card}>
        <div style={S.row(true)}>
          <div style={S.rowLabel}>{T("full_name")} *</div>
          <input style={S.input} value={fullName} onChange={e => setFullName(e.target.value)} />
        </div>
        <div style={S.row(true)}>
          <div style={S.rowLabel}>{T("birth_date")}</div>
          <input type="date" style={S.input} value={birthDate} onChange={e => setBirthDate(e.target.value)} />
        </div>
        <div style={S.row(true)}>
          <div style={S.rowLabel}>{T("tax_status")} *</div>
          {([ ["RF_RESIDENT", T("tax_rf")], ["EAEU_CITIZEN", T("tax_eaeu")], ["PATENT", T("tax_patent")], ["NONRESIDENT", T("tax_nonresident")] ] as [TaxStatus, string][]).map(([val, label]) => (
            <div key={val} style={S.radioRow} onClick={() => setTaxStatus(val)}>
              <div style={S.radioBox(taxStatus === val)}>{taxStatus === val && <div style={S.radioDot} />}</div>
              <span style={{ fontSize: "13px", fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>
        {showInn && <div style={S.row(true)}><div style={S.rowLabel}>{T("inn")}</div><input style={S.input} value={inn} onChange={e => setInn(e.target.value)} inputMode="numeric" maxLength={12} /></div>}
        {showInn && <div style={S.row(showPatent)}><div style={S.rowLabel}>{T("snils")}</div><input style={S.input} value={snils} onChange={e => setSnils(e.target.value)} /></div>}
        {showPatent && <div style={S.row(true)}><div style={S.rowLabel}>{T("patent_number")}</div><input style={S.input} value={patentNumber} onChange={e => setPatentNumber(e.target.value)} /></div>}
        {showPatent && <div style={S.row(false)}><div style={S.rowLabel}>{T("patent_expiry")}</div><input type="date" style={S.input} value={patentExpiry} onChange={e => setPatentExpiry(e.target.value)} /></div>}
      </div>

      {saved && <div style={S.success}>✓ {T("save")}</div>}
      {error && <div style={S.err}>{error}</div>}

      <div style={{ padding: "0 16px" }}>
        <button style={S.btn(saving)} onClick={handleSave} disabled={saving}>
          {saving ? "..." : T("save")}
        </button>
      </div>
    </div>
  )
}
