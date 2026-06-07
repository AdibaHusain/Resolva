import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import StudentDashboard from '../pages/student/Dashboard'
import NewComplaint from '../pages/student/NewComplaint'
import MyComplaints from '../pages/student/MyComplaints'
import AdminDashboard from '../pages/admin/Dashboard'
import KanbanBoard from '../pages/admin/KanbanBoard'
import Analytics from '../pages/admin/Analytics'
import StaffDashboard from '../pages/staff/Dashboard'
import TaskDetail from '../pages/staff/TaskDetail'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/student/dashboard"    element={<StudentDashboard />} />
          <Route path="/student/complaints"   element={<MyComplaints />} />
          <Route path="/student/new"          element={<NewComplaint />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard"  element={<AdminDashboard />} />
          <Route path="/admin/kanban"     element={<KanbanBoard />} />
          <Route path="/admin/analytics"  element={<Analytics />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
          <Route path="/staff/dashboard"  element={<StaffDashboard />} />
          <Route path="/staff/task/:id"   element={<TaskDetail />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/unauthorized" element={<div className="p-8 text-red-500">Access Denied</div>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}