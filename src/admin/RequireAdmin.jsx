/* eslint react-refresh/only-export-components: "off" */
import { Navigate, useLocation } from 'react-router-dom'

const AUTH_KEY = 'admin_authed'

export function isAdminAuthed() {
  return localStorage.getItem(AUTH_KEY) === '1'
}

export function setAdminAuthed(value) {
  localStorage.setItem(AUTH_KEY, value ? '1' : '0')
}

function RequireAdmin({ children }) {
  const location = useLocation()

  if (!isAdminAuthed()) {
    return <Navigate to="/admin" replace state={{ from: location.pathname }} />
  }

  return children
}

export default RequireAdmin

