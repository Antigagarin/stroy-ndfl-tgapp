import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import App from "./App"
import { LangProvider } from "./i18n"

window.Telegram?.WebApp?.ready()
window.Telegram?.WebApp?.expand()

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LangProvider>
      <App />
    </LangProvider>
  </React.StrictMode>
)
