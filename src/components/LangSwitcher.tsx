import { useState } from "react"
import { useLang, t } from "../i18n"

const LANGS = [
  { code: "ru", native: "Русский" },
  { code: "uz", native: "O'zbek tili" },
  { code: "tg", native: "Тоҷикӣ" },
  { code: "az", native: "Azərbaycan dili" },
  { code: "kz", native: "Қазақша" },
  { code: "kg", native: "Кыргызча" },
]

export function LangSwitcher() {
  const [lang, setLang] = useLang()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ backgroundColor: "#ffffff", color: "#000000", border: "2px solid #000000", padding: "4px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: "1px" }}
      >
        <span style={{ fontSize: "11px", fontWeight: 900 }}>{lang.toUpperCase()}</span>
        <span style={{ fontSize: "9px", fontWeight: 700, opacity: 0.5 }}>Use your language</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full"
            style={{ backgroundColor: "#ffffff" }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ borderBottom: "2px solid #000000", padding: "12px 16px" }}>
              <div style={{ color: "#000000", fontSize: "13px", fontWeight: 900, textTransform: "uppercase" }}>
                {t("choose_language", lang)}
              </div>
            </div>
            {LANGS.map(l => (
              <div
                key={l.code}
                onClick={() => { setLang(l.code); setOpen(false) }}
                style={{
                  borderBottom: "1px solid #e5e7eb",
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  backgroundColor: lang === l.code ? "#000000" : "#ffffff",
                  color: lang === l.code ? "#ffffff" : "#000000",
                }}
              >
                <span style={{ fontWeight: 700, fontSize: "16px" }}>{l.native}</span>
                <span style={{ fontWeight: 900, fontSize: "11px", opacity: 0.5 }}>{l.code.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
