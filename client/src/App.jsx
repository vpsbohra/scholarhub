import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Protected from './components/Protected';
import AppLayout from './components/AppLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/dashboards/StudentDashboard';
import DonorDashboard from './pages/dashboards/DonorDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import StudentProfile from './pages/profile/StudentProfile';
import DonorProfile   from './pages/profile/DonorProfile';

function WithLayout({ children }) {
  return <AppLayout>{children}</AppLayout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login/>} />
      <Route path="/register" element={<Register/>} />

      <Route path="/dashboard/student" element={
        <Protected allow={['student']}>
          <WithLayout><StudentDashboard/></WithLayout>
        </Protected>
      }/>

      <Route path="/dashboard/donor" element={
        <Protected allow={['donor']}>
          <WithLayout><DonorDashboard/></WithLayout>
        </Protected>
      }/>

      <Route path="/dashboard/admin" element={
        <Protected allow={['admin','superadmin']}>
          <WithLayout><AdminDashboard/></WithLayout>
        </Protected>
      }/>

      <Route path="/profile/student" element={
        <Protected allow={['student']}>
          <AppLayout><StudentProfile/></AppLayout>
        </Protected>
      }/>

      <Route path="/profile/donor" element={
        <Protected allow={['donor']}>
          <AppLayout><DonorProfile/></AppLayout>
        </Protected>
      }/>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
