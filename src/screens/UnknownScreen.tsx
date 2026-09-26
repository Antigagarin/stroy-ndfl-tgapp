interface Props {
  onRegister: () => void
}

export function UnknownScreen({ onRegister }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-6">
      <div className="text-5xl">👷</div>
      <div>
        <h1 className="text-xl font-bold mb-2">Добро пожаловать</h1>
        <p className="text-sm text-gray-500">
          Вы не зарегистрированы. Прорабы и другие роли назначаются администратором.
        </p>
      </div>
      <div className="w-full flex flex-col gap-3">
        <button
          onClick={onRegister}
          className="w-full py-3 px-4 rounded-xl bg-blue-500 text-white font-medium text-base"
        >
          Зарегистрироваться как работник
        </button>
        <button
          disabled
          className="w-full py-3 px-4 rounded-xl bg-gray-200 text-gray-400 font-medium text-base cursor-not-allowed"
        >
          Я прораб / охранник / контролёр
        </button>
      </div>
    </div>
  )
}
