import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layout/DashboardLayout';
import InventoryPage from './pages/InventoryPage';
import BorrowsPage from './pages/BorrowsPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import BorrowsLanding from './pages/BorrowsLandingPage';
import CirculationsPage from './pages/CirculationsPage';
import ReportsPage from './pages/ReportsPage';
import PoliciesPage from './pages/PoliciesPage';
import BorrowsHistoryPage from './pages/BorrowsHistoryPage';

const Unauthorized = () => <div className="p-8"><h1>No tienes permiso para ver esto</h1></div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<ProtectedRoute />}>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin', 'bibliotecario']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/inventory" element={<InventoryPage />} />
            <Route path="/dashboard/borrowsLanding" element={<BorrowsLanding />} />
            <Route path="/BorrowsPage" element={<BorrowsPage />} />
            <Route path="/BorrowsActivePage" element={<CirculationsPage />} />
            <Route path="/dashboard/reports" element={<ReportsPage />} />
            <Route path="/dashboard/reports/history" element={<BorrowsHistoryPage />} />
            
            {/* Solo Admin */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
               <Route path="/dashboard/users" element={<UsersPage />} />
               <Route path="/dashboard/policies" element={<PoliciesPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;