import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';
import OrderForm from './pages/OrderForm';
import PaymentForm from './pages/PaymentForm';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminRevisions from './pages/AdminRevisions';
import AdminPackages from './pages/AdminPackages';
import AdminReviews from './pages/AdminReviews';
import RevisionMenu from './pages/RevisionMenu';
import AdminHelp from './pages/AdminHelp';
import HelpPage from './pages/HelpPage';
import AuthCallback from './pages/AuthCallback';
import FAQPage from './pages/FAQPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import ContactPage from './pages/ContactPage';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;

    if (adminOnly && user.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Layout><LandingPage /></Layout>} />
                <Route path="/login" element={<Layout><LoginPage /></Layout>} />
                <Route path="/auth/callback" element={<AuthCallback />} />

                {/* User Routes */}
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Layout><UserDashboard /></Layout>
                    </ProtectedRoute>
                } />
                <Route path="/order/new" element={
                    <ProtectedRoute>
                        <Layout><OrderForm /></Layout>
                    </ProtectedRoute>
                } />
                <Route path="/order/:id/pay" element={
                    <ProtectedRoute>
                        <Layout><PaymentForm /></Layout>
                    </ProtectedRoute>
                } />
                <Route path="/revisions" element={
                    <ProtectedRoute>
                        <Layout><RevisionMenu /></Layout>
                    </ProtectedRoute>
                } />
                <Route path="/help/:slug" element={
                    <Layout><HelpPage /></Layout>
                } />
                <Route path="/faq" element={<Layout><FAQPage /></Layout>} />
                <Route path="/terms" element={<Layout><TermsPage /></Layout>} />
                <Route path="/privacy" element={<Layout><PrivacyPage /></Layout>} />
                <Route path="/contact" element={<Layout><ContactPage /></Layout>} />

                {/* Fallback 404 */}
                <Route path="*" element={<Layout><div className="min-h-screen flex items-center justify-center text-center px-4">
                    <div>
                        <h1 className="text-9xl font-black text-blue-500/20 mb-4">404</h1>
                        <h2 className="text-3xl font-bold text-white mb-6">Halaman Tidak Ditemukan</h2>
                        <Link to="/" className="px-8 py-3 bg-blue-600 rounded-xl font-bold text-white hover:bg-blue-500 transition shadow-lg">Kembali ke Beranda</Link>
                    </div>
                </div></Layout>} />

                {/* Admin Routes */}
                <Route path="/admin" element={
                    <ProtectedRoute adminOnly={true}>
                        <AdminLayout><AdminDashboard /></AdminLayout>
                    </ProtectedRoute>
                } />
                <Route path="/admin/orders" element={
                    <ProtectedRoute adminOnly={true}>
                        <AdminLayout><AdminOrders /></AdminLayout>
                    </ProtectedRoute>
                } />
                <Route path="/admin/revisions" element={
                    <ProtectedRoute adminOnly={true}>
                        <AdminLayout><AdminRevisions /></AdminLayout>
                    </ProtectedRoute>
                } />
                <Route path="/admin/packages" element={
                    <ProtectedRoute adminOnly={true}>
                        <AdminLayout><AdminPackages /></AdminLayout>
                    </ProtectedRoute>
                } />
                <Route path="/admin/reviews" element={
                    <ProtectedRoute adminOnly={true}>
                        <AdminLayout><AdminReviews /></AdminLayout>
                    </ProtectedRoute>
                } />
                <Route path="/admin/help" element={
                    <ProtectedRoute adminOnly={true}>
                        <AdminLayout><AdminHelp /></AdminLayout>
                    </ProtectedRoute>
                } />
            </Routes>
        </BrowserRouter>
    );
}