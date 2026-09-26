import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import App from "./App"

window.Telegram?.WebApp?.ready()
window.Telegram?.WebApp?.expand()

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
