import { useLang } from "../i18n"

const LANGS = [
  { code: "ru", label: "RU" },
  { code: "uz", label: "UZ" },
  { code: "tg", label: "TG" },
  { code: "az", label: "AZ" },
]

export function LangSwitcher() {
  const [lang, setLang] = useLang()
  return (
    <div className="flex gap-1">
      {LANGS.map(l => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`px-2 py-0.5 text-xs font-bold border ${
            lang === l.code
              ? "bg-black text-white border-black"
              : "bg-white text-black border-gray-300"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
