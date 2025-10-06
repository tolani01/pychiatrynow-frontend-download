import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PatientIntake from './components/PatientIntake';
import IntakeCompletion from './components/IntakeCompletion';
import PatientIntakeSummary from './components/PatientIntakeSummary';
import ProviderDashboard from './components/ProviderDashboard';
import PatientDashboard from './components/PatientDashboard';
import ProviderSignup from './components/ProviderSignup';
import ProviderSignin from './components/ProviderSignin';
import ProviderIntakeSummary from './components/ProviderIntakeSummary';
import PatientSignup from './components/PatientSignup';
import PatientSignin from './components/PatientSignin';
import PatientCheckin from './components/PatientCheckin';
import LandingPage from './components/LandingPage';
import AIAssessment from './components/AIAssessment';
import Resources from './components/Resources';
import SuperAdminInvite from './components/SuperAdminInvite';
import SuperAdminOnboarding from './components/SuperAdminOnboarding';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import StaffSignup from './components/StaffSignup';
import StaffSignin from './components/StaffSignin';
import StaffPending from './components/StaffPending';
import StaffDashboard from './components/StaffDashboard';
import PatientPortalDashboard from './components/patient-portal/PatientDashboard';
import AppointmentScheduler from './components/patient-portal/AppointmentScheduler';
import HealthRecords from './components/patient-portal/HealthRecords';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/patient-intake" element={<PatientIntake />} />
          <Route path="/intake-completion" element={<IntakeCompletion />} />
          <Route path="/patient-intake-summary" element={<PatientIntakeSummary />} />
          <Route path="/patient-signup" element={<PatientSignup />} />
          <Route path="/patient-signin" element={<PatientSignin />} />
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          <Route path="/patient-portal/dashboard" element={<PatientPortalDashboard />} />
          <Route path="/patient-portal/appointments/new" element={<AppointmentScheduler />} />
          <Route path="/patient-portal/health-records" element={<HealthRecords />} />
          <Route path="/patient-checkin" element={<PatientCheckin />} />
          <Route path="/provider-dashboard" element={<ProviderDashboard />} />
          <Route path="/provider-signup" element={<ProviderSignup />} />
          <Route path="/provider-signin" element={<ProviderSignin />} />
          <Route path="/provider-intake-summary" element={<ProviderIntakeSummary />} />
          <Route path="/super-admin-invite" element={<SuperAdminInvite />} />
          <Route path="/super-admin-onboarding" element={<SuperAdminOnboarding />} />
          <Route path="/super-admin-dashboard" element={<SuperAdminDashboard />} />
          <Route path="/staff-signup" element={<StaffSignup />} />
          <Route path="/staff-signin" element={<StaffSignin />} />
          <Route path="/staff-pending" element={<StaffPending />} />
          <Route path="/staff-dashboard" element={<StaffDashboard />} />
          <Route path="/ai-assessment" element={<AIAssessment />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}