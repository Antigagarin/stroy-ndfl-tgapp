import { useState, useEffect } from "react"
import { apiPost, apiGet } from "../api"
import { useT } from "../i18n"
import type { AuthResult, Organization } from "../types"

interface Props {
  onRegistered: (auth: AuthResult) => void
}

type TaxStatus = "RF_RESIDENT" | "EAEU_CITIZEN" | "PATENT" | "NONRESIDENT"

export function WorkerRegisterScreen({ onRegistered }: Props) {
  const T = useT()
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [fullName, setFullName] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [taxStatus, setTaxStatus] = useState<TaxStatus>("RF_RESIDENT")
  const [inn, setInn] = useState("")
  const [snils, setSnils] = useState("")
  const [patentNumber, setPatentNumber] = useState("")
  const [patentExpiry, setPatentExpiry] = useState("")
  const [orgId, setOrgId] = useState("")
  const [loading, setLoading] = useState(false)
  const [orgsLoading, setOrgsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    apiGet<{ organizations: Organization[] }>("/api/tgapp/organizations")
      .then(d => setOrgs(d.organizations))
      .catch(() => setError(T("orgs_error")))
      .finally(() => setOrgsLoading(false))
  }, [])

  const showInn = taxStatus === "RF_RESIDENT" || taxStatus === "EAEU_CITIZEN" || taxStatus === "PATENT"
  const showPatent = taxStatus === "PATENT"

  async function handleSubmit() {
    if (!fullName.trim()) { setError(T("full_name") + " " + T("required")); return }
    if (!orgId) { setError(T("organization") + " " + T("required")); return }
    if (showPatent && !patentExpiry) { setError(T("patent_expiry") + " " + T("required")); return }
    setLoading(true)
    setError("")
    try {
      const worker = await apiPost<{ id: string; fullName: string; status: string }>(
        "/api/tgapp/register",
        {
          fullName: fullName.trim(),
          birthDate: birthDate || null,
          taxStatus,
          inn: inn.trim() || null,
          snils: snils.trim() || null,
          patentNumber: patentNumber.trim() || null,
          patentExpiry: patentExpiry || null,
          organizationId: orgId,
        }
      )
      onRegistered({ role: "worker", id: worker.id, fullName: worker.fullName, status: "APPROVED" })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : T("error_load"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-8">
      <div className="bg-black text-white px-4 py-4 pt-10">
        <h1 className="text-xl font-black uppercase tracking-wide">{T("register_title")}</h1>
      </div>

      <div className="px-4 mt-4 border border-black bg-white">

        <div className="border-b border-black px-3 py-3">
          <div className="text-xs font-bold uppercase text-gray-500 mb-1">{T("full_name")} *</div>
          <input
            className="w-full text-base font-medium outline-none bg-transparent"
            placeholder={T("full_name_placeholder")}
            value={fullName}
            onChange={e => setFullName(e.target.value)}
          />
        </div>

        <div className="border-b border-black px-3 py-3">
          <div className="text-xs font-bold uppercase text-gray-500 mb-1">{T("birth_date")} ({T("optional")})</div>
          <input
            type="date"
            className="w-full text-base font-medium outline-none bg-transparent"
            value={birthDate}
            onChange={e => setBirthDate(e.target.value)}
          />
        </div>

        <div className="border-b border-black px-3 py-3">
          <div className="text-xs font-bold uppercase text-gray-500 mb-2">{T("tax_status")} *</div>
          <div className="space-y-2">
            {(
              [
                ["RF_RESIDENT", T("tax_rf")],
                ["EAEU_CITIZEN", T("tax_eaeu")],
                ["PATENT", T("tax_patent")],
                ["NONRESIDENT", T("tax_nonresident")],
              ] as [TaxStatus, string][]
            ).map(([val, label]) => (
              <div key={val} onClick={() => setTaxStatus(val)} className="flex items-center gap-3 cursor-pointer">
                <div className={`w-5 h-5 border-2 border-black flex items-center justify-center flex-shrink-0 ${taxStatus === val ? "bg-black" : "bg-white"}`}>
                  {taxStatus === val && <div className="w-2 h-2 bg-white" />}
                </div>
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {showInn && (
          <div className="border-b border-black px-3 py-3">
            <div className="text-xs font-bold uppercase text-gray-500 mb-1">{T("inn")} ({T("optional")})</div>
            <input
              className="w-full text-base font-medium outline-none bg-transparent"
              placeholder="123456789012"
              inputMode="numeric"
              maxLength={12}
              value={inn}
              onChange={e => setInn(e.target.value)}
            />
          </div>
        )}

        {showInn && (
          <div className="border-b border-black px-3 py-3">
            <div className="text-xs font-bold uppercase text-gray-500 mb-1">{T("snils")} ({T("optional")})</div>
            <input
              className="w-full text-base font-medium outline-none bg-transparent"
              placeholder="000-000-000 00"
              value={snils}
              onChange={e => setSnils(e.target.value)}
            />
          </div>
        )}

        {showPatent && (
          <div className="border-b border-black px-3 py-3">
            <div className="text-xs font-bold uppercase text-gray-500 mb-1">{T("patent_number")} *</div>
            <input
              className="w-full text-base font-medium outline-none bg-transparent"
              placeholder="77 26 1234567"
              value={patentNumber}
              onChange={e => setPatentNumber(e.target.value)}
            />
          </div>
        )}

        {showPatent && (
          <div className="border-b border-black px-3 py-3">
            <div className="text-xs font-bold uppercase text-gray-500 mb-1">{T("patent_expiry")} *</div>
            <input
              type="date"
              className="w-full text-base font-medium outline-none bg-transparent"
              value={patentExpiry}
              onChange={e => setPatentExpiry(e.target.value)}
            />
          </div>
        )}

        <div className="px-3 py-3">
          <div className="text-xs font-bold uppercase text-gray-500 mb-1">{T("organization")} *</div>
          {orgsLoading ? (
            <div className="text-sm text-gray-400">{T("loading_orgs")}</div>
          ) : (
            <select
              className="w-full text-base font-medium outline-none bg-transparent"
              value={orgId}
              onChange={e => setOrgId(e.target.value)}
            >
              <option value="">{T("choose_org")}</option>
              {orgs.map(o => (
                <option key={o.id} value={o.id}>{o.siteName} — {o.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-3 px-3 py-3 bg-black text-white text-sm font-bold">{error}</div>
      )}

      <div className="px-4 mt-4">
        <button
          onClick={handleSubmit}
          disabled={loading || orgsLoading}
          className="w-full py-4 bg-black text-white font-black text-base uppercase tracking-wider disabled:opacity-40"
        >
          {loading ? T("registering") : T("register_btn")}
        </button>
      </div>
    </div>
  )
}
