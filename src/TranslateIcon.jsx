import { memo } from 'react'

const TranslateIcon = ({ size = 24, color = "#fff" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Globe */}
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" fill="none" />
      <path d="M3 12h18" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 3a13 13 0 0 0 0 18" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M12 3a13 13 0 0 1 0 18" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path
        d="M5 8.5c2 .9 4.4 1.4 7 1.4s5-.5 7-1.4M5 15.5c2-.9 4.4-1.4 7-1.4s5 .5 7 1.4"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

export default memo(TranslateIcon)

