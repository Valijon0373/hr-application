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
      {/* Background square */}
      <rect x="2" y="4" width="20" height="16" rx="3" fill={color} opacity="0.15" />

      {/* A harfi */}
      <text
        x="6"
        y="14"
        fontSize="8"
        fontWeight="bold"
        fill={color}
        fontFamily="Arial, sans-serif"
      >
        A
      </text>

      {/* Chinese character (文) */}
      <text
        x="11"
        y="14"
        fontSize="8"
        fontWeight="bold"
        fill={color}
        fontFamily="Arial, sans-serif"
      >
        文
      </text>

      {/* Arrow */}
      <path
        d="M16 9h4m0 0l-2-2m2 2l-2 2"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default memo(TranslateIcon)

