import { Navigate, Route, Routes } from 'react-router-dom'
import PublicForm from './PublicForm'
import AdminLogin from './admin/AdminLogin'
import RequireAdmin from './admin/RequireAdmin'
import Dashboard from './dashboard/dashboard'
import Home from './Home'
import VacancyDetail from './VacancyDetail'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/vacancy/:id" element={<VacancyDetail />} />
      <Route path="/apply/:vacancyId?" element={<PublicForm />} />
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/admin" element={<Navigate to="/login" replace />} />

      <Route
        path="/admin/dashboard"
        element={
          <RequireAdmin>
            <Dashboard />
          </RequireAdmin>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
