import { useT } from "../i18n"

interface Props {
  onRegister: () => void
}

const STEPS = [
  { n: "1", ru: "Зарегистрируйся один раз — ФИО и организация", uz: "Bir marta ro'yxatdan o'ting", tg: "Як маротиба сабти ном кунед", az: "Bir dəfə qeydiyyatdan keçin", kz: "Бір рет тіркеліңіз", kg: "Бир жолу катталыңыз" },
  { n: "2", ru: "Каждый день отмечай явку одной кнопкой", uz: "Har kuni bitta tugma bilan belgilang", tg: "Ҳар рӯз як тугма бо қайд кунед", az: "Hər gün bir düymə ilə qeyd edin", kz: "Күн сайын бір түймемен белгілеңіз", kg: "Күн сайын бир баскыч менен белгилеңиз" },
  { n: "3", ru: "Прораб и бухгалтер видят всё автоматически", uz: "Usta va buxgalter hamma narsani ko'radi", tg: "Сармутахассис ва ҳисобдор ҳама чизро мебинанд", az: "Ustad və mühasib hər şeyi görür", kz: "Прораб пен бухгалтер бәрін автоматты түрде көреді", kg: "Прораб жана бухгалтер баарын автоматтык түрдө көрөт" },
]

export function UnknownScreen({ onRegister }: Props) {
  const T = useT()
  const lang = typeof localStorage !== "undefined" ? (localStorage.getItem("lang") ?? "ru") : "ru"

  const stepText = (s: typeof STEPS[0]) => {
    const map: Record<string, string> = { ru: s.ru, uz: s.uz, tg: s.tg, az: s.az, kz: s.kz, kg: s.kg }
    return map[lang] ?? s.ru
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f3f4f6" }}>
      {/* Хедер */}
      <div style={{ backgroundColor: "#000", color: "#fff", padding: "32px 24px 24px" }}>
        <div style={{ fontSize: "11px", fontWeight: 900, letterSpacing: "0.15em", opacity: 0.6, marginBottom: "8px" }}>
          ПРОХОДНАЯ
        </div>
        <div style={{ fontSize: "26px", fontWeight: 900, lineHeight: 1.1, textTransform: "uppercase" }}>
          {T("welcome")}
        </div>
        <div style={{ fontSize: "14px", color: "#ccc", marginTop: "8px" }}>
          {T("not_registered")}
        </div>
      </div>

      {/* Шаги */}
      <div style={{ backgroundColor: "#fff", margin: "16px", border: "1px solid #000" }}>
        {STEPS.map((s) => (
          <div key={s.n} style={{ display: "flex", gap: "12px", padding: "14px 16px", borderBottom: "1px solid #e5e7eb", alignItems: "flex-start" }}>
            <div style={{ minWidth: "28px", height: "28px", backgroundColor: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "13px", flexShrink: 0 }}>
              {s.n}
            </div>
            <div style={{ fontSize: "14px", fontWeight: 600, paddingTop: "4px", color: "#000" }}>
              {stepText(s)}
            </div>
          </div>
        ))}
      </div>

      {/* Кнопки */}
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <button
          onClick={onRegister}
          style={{ width: "100%", padding: "18px", backgroundColor: "#000", color: "#fff", fontWeight: 900, fontSize: "15px", textTransform: "uppercase", letterSpacing: "0.08em", border: "none", cursor: "pointer" }}
        >
          {T("register_as_worker")}
        </button>
        <button
          style={{ width: "100%", padding: "14px", backgroundColor: "#fff", color: "#000", fontWeight: 700, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.06em", border: "2px solid #000", cursor: "pointer" }}
        >
          {T("i_am_foreman")}
        </button>
      </div>
    </div>
  )
}
