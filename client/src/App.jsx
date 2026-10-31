import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import LoginPage from './features/auth/LoginPage.jsx';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from './features/auth/ResetPasswordPage.jsx';
import VerifyEmailPage from './features/auth/VerifyEmailPage.jsx';
import DashboardPage from './features/dashboard/DashboardPage.jsx';
import CustomersPage from './features/customers/CustomersPage.jsx';
import CustomerDetailsPage from './features/customers/CustomerDetailsPage.jsx';
import EnquiriesPage from './features/enquiries/EnquiriesPage.jsx';
import EnquiryDetailsPage from './features/enquiries/EnquiryDetailsPage.jsx';
import SurveysPage from './features/surveys/SurveysPage.jsx';
import SurveyDetailsPage from './features/surveys/SurveyDetailsPage.jsx';
import QuotationsPage from './features/quotations/QuotationsPage.jsx';
import QuotationDetailsPage from './features/quotations/QuotationDetailsPage.jsx';
import InventoryPage from './features/inventory/InventoryPage.jsx';
import ProductDetailsPage from './features/inventory/ProductDetailsPage.jsx';
import SerialsPage from './features/inventory/SerialsPage.jsx';
import OrdersPage from './features/orders/OrdersPage.jsx';
import OrderDetailsPage from './features/orders/OrderDetailsPage.jsx';
import PaymentsPage from './features/payments/PaymentsPage.jsx';
import TechniciansPage from './features/installations/TechniciansPage.jsx';
import InstallationsPage from './features/installations/InstallationsPage.jsx';
import InstallationDetailsPage from './features/installations/InstallationDetailsPage.jsx';
import WarrantiesPage from './features/warranties/WarrantiesPage.jsx';
import WarrantyDetailsPage from './features/warranties/WarrantyDetailsPage.jsx';
import TicketsPage from './features/tickets/TicketsPage.jsx';
import TicketDetailsPage from './features/tickets/TicketDetailsPage.jsx';
import FinanceWorkspace from './features/finance/FinanceWorkspace.jsx';
import SubsidiesPage from './features/finance/SubsidiesPage.jsx';
import UsersPage from './features/users/UsersPage.jsx';
import ProfilePage from './features/users/ProfilePage.jsx';
import SettingsPage from './features/users/SettingsPage.jsx';
import NotFoundPage from './features/misc/NotFoundPage.jsx';
import QuotationResponsePage from './features/quotations/QuotationResponsePage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/quotation-response" element={<QuotationResponsePage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="customers/:id" element={<CustomerDetailsPage />} />
          <Route path="enquiries" element={<EnquiriesPage />} />
          <Route path="enquiries/:id" element={<EnquiryDetailsPage />} />
          <Route path="surveys" element={<SurveysPage />} />
          <Route path="surveys/:id" element={<SurveyDetailsPage />} />
          <Route path="quotations" element={<QuotationsPage />} />
          <Route path="quotations/:id" element={<QuotationDetailsPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="inventory/:id" element={<ProductDetailsPage />} />
          <Route path="serials" element={<SerialsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="technicians" element={<TechniciansPage />} />
          <Route path="installations" element={<InstallationsPage />} />
          <Route path="installations/:id" element={<InstallationDetailsPage />} />
          <Route path="warranties" element={<WarrantiesPage />} />
          <Route path="warranties/:id" element={<WarrantyDetailsPage />} />
          <Route path="tickets" element={<TicketsPage />} />
          <Route path="tickets/:id" element={<TicketDetailsPage />} />
          <Route path="finance" element={<FinanceWorkspace />} />
          <Route path="subsidies" element={<SubsidiesPage />} />
          <Route path="reports" element={<FinanceWorkspace />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="unauthorized" element={<NotFoundPage unauthorized />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
