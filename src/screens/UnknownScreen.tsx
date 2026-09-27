import { useT } from "../i18n"

interface Props {
  onRegister: () => void
}

export function UnknownScreen({ onRegister }: Props) {
  const T = useT()
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 gap-4">
      <div className="text-center">
        <h1 className="text-xl font-black uppercase">{T("welcome")}</h1>
        <p className="text-sm text-gray-500 mt-2">{T("not_registered")}</p>
      </div>
      <button
        onClick={onRegister}
        className="w-full py-4 bg-black text-white font-black text-base uppercase tracking-wider"
      >
        {T("register_as_worker")}
      </button>
      <button className="w-full py-3 text-sm font-bold text-gray-500 uppercase tracking-wide border border-gray-300 bg-white">
        {T("i_am_foreman")}
      </button>
    </div>
  )
}
