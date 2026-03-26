function Footer() {
  return (
    <footer className="border-t border-white/10 bg-gradient-to-r from-[#0b74c9]/85 to-[#085ca8]/85 text-white backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-[1180px] flex-col items-center gap-3 px-4 py-5 text-white/90 md:px-6">
        <div className="flex items-center gap-4">
          <a
            href="#"
            aria-label="Telegram"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/90 backdrop-blur-sm transition hover:bg-white/10 hover:text-white"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </a>

          <a
            href="#"
            aria-label="Instagram"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/90 backdrop-blur-sm transition hover:bg-white/10 hover:text-white"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="4" y="4" width="16" height="16" rx="5" />
              <path d="M12 15a3 3 0 1 0 0-6a3 3 0 0 0 0 6Z" />
              <path d="M17.5 6.5h.01" />
            </svg>
          </a>

          <a
            href="#"
            aria-label="YouTube"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/90 backdrop-blur-sm transition hover:bg-white/10 hover:text-white"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 12s0-6-2-7c-1.5-.5-8-.5-8-.5s-6.5 0-8 .5C2 6 2 12 2 12s0 6 2 7c1.5.5 8 .5 8 .5s6.5 0 8-.5c2-1 2-7 2-7Z" />
              <path d="M10 15l5-3-5-3v6Z" />
            </svg>
          </a>

          <a
            href="#"
            aria-label="Facebook"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/90 backdrop-blur-sm transition hover:bg-white/10 hover:text-white"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M14 8h2V5h-2c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h2.1L17 10h-3V8c0-.6.4-1 1-1Z" />
            </svg>
          </a>
        </div>

        <div className="text-center text-[12px] font-medium tracking-wider text-white/70">
          URSPI | RTTM Jamosi | 2026
        </div>
      </div>
    </footer>
  )
}

export default Footer
