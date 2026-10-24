import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// HashRouter：網址會長得像 .../#/menu
// GitHub Pages 只會找「真的存在的檔案」，用 # 號才不會在重新整理 /menu 時出現 404
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles/global.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
