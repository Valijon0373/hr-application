import { useEffect, useRef, useState } from 'react'
import TranslateIcon from '../TranslateIcon'
import urspiLogo from '../assets/urspi.jpg'

function Navbar({ lang, setLang, c }) {
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef(null)

  useEffect(() => {
    const onMouseDown = (e) => {
      if (!langRef.current) return
      if (!langRef.current.contains(e.target)) setLangOpen(false)
    }

    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  return (
    <header className="relative h-16 w-full bg-gradient-to-r from-[#0b74c9]/85 to-[#085ca8]/85 text-white backdrop-blur-md shadow-sm">
      <div className="pointer-events-none absolute inset-0 bg-black/10" />
      <div className="mx-auto flex h-full max-w-[1180px] items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2 text-base font-semibold">
          <img src={urspiLogo} alt="UrSPI logo" className="h-8 w-8 rounded-full object-contain" />
          UrSPI
        </div>

        <nav className="flex items-center gap-6 text-sm text-white/90">
          <a href="#" className="hover:text-white">
            {c.navHome}
          </a>

          <div ref={langRef} className="relative">
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              className="flex items-center gap-2 rounded-xl border border-white/15 bg-[#1f2937] px-3 py-2 text-sm font-medium text-white/90 shadow-sm transition hover:bg-[#111827] hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <TranslateIcon size={16} color="#e5e7eb" />
              {lang === 'uz' ? c.langUz : lang === 'ru' ? c.langRu : c.langEn}
              <span aria-hidden="true" className="text-[10px] opacity-90">
                ˅
              </span>
            </button>

            <div
              className={`absolute left-0 top-full z-50 mt-2 w-40 rounded-xl border border-white/15 bg-[#111827] p-2 text-left text-sm text-white/90 shadow-lg transition ${
                langOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
            >
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  setLang('uz')
                  setLangOpen(false)
                }}
                className="block rounded-lg px-3 py-2 hover:bg-white/10"
              >
                {c.langUz}
              </a>

              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  setLang('ru')
                  setLangOpen(false)
                }}
                className="block rounded-lg px-3 py-2 hover:bg-white/10"
              >
                {c.langRu}
              </a>

              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  setLang('en')
                  setLangOpen(false)
                }}
                className="block rounded-lg px-3 py-2 hover:bg-white/10"
              >
                {c.langEn}
              </a>
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
