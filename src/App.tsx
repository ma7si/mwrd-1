import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home, LayoutDashboard, Package, FileText, ShoppingCart, Settings } from 'lucide-react';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PortalLayout } from './components/layouts/PortalLayout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { PendingApproval } from './pages/PendingApproval';
import { Unauthorized } from './pages/Unauthorized';
import { Portal } from './pages/Portal';
import { ClientDashboard } from './pages/client/ClientDashboard';
import { ClientCatalog } from './pages/client/ClientCatalog';
import { SupplierDashboard } from './pages/supplier/SupplierDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route
            path="/portal"
            element={
              <ProtectedRoute>
                <Portal />
              </ProtectedRoute>
            }
          />

          <Route
            path="/portal/client/*"
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <PortalLayout
                  navigation={[
                    {
                      name: 'Dashboard',
                      path: '/portal/client',
                      icon: <Home className="w-5 h-5" />,
                    },
                    {
                      name: 'Catalog',
                      path: '/portal/client/catalog',
                      icon: <Package className="w-5 h-5" />,
                    },
                    {
                      name: 'My RFQs',
                      path: '/portal/client/rfqs',
                      icon: <FileText className="w-5 h-5" />,
                    },
                    {
                      name: 'Orders',
                      path: '/portal/client/orders',
                      icon: <ShoppingCart className="w-5 h-5" />,
                    },
                  ]}
                >
                  <Routes>
                    <Route index element={<ClientDashboard />} />
                    <Route path="catalog" element={<ClientCatalog />} />
                    <Route
                      path="rfqs"
                      element={
                        <div className="text-center py-12">
                          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">RFQ Management</h2>
                          <p className="text-gray-600">RFQ list and details page coming soon</p>
                        </div>
                      }
                    />
                    <Route
                      path="orders"
                      element={
                        <div className="text-center py-12">
                          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order History</h2>
                          <p className="text-gray-600">Order tracking page coming soon</p>
                        </div>
                      }
                    />
                  </Routes>
                </PortalLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/portal/supplier/*"
            element={
              <ProtectedRoute allowedRoles={['supplier']}>
                <PortalLayout
                  navigation={[
                    {
                      name: 'Dashboard',
                      path: '/portal/supplier',
                      icon: <Home className="w-5 h-5" />,
                    },
                    {
                      name: 'Inventory',
                      path: '/portal/supplier/items',
                      icon: <Package className="w-5 h-5" />,
                    },
                    {
                      name: 'RFQs',
                      path: '/portal/supplier/rfqs',
                      icon: <FileText className="w-5 h-5" />,
                    },
                    {
                      name: 'Orders',
                      path: '/portal/supplier/orders',
                      icon: <ShoppingCart className="w-5 h-5" />,
                    },
                  ]}
                >
                  <Routes>
                    <Route index element={<SupplierDashboard />} />
                    <Route
                      path="items"
                      element={
                        <div className="text-center py-12">
                          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">Inventory Management</h2>
                          <p className="text-gray-600">Item management page coming soon</p>
                        </div>
                      }
                    />
                    <Route
                      path="rfqs"
                      element={
                        <div className="text-center py-12">
                          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">RFQ Opportunities</h2>
                          <p className="text-gray-600">RFQ listing page coming soon</p>
                        </div>
                      }
                    />
                    <Route
                      path="orders"
                      element={
                        <div className="text-center py-12">
                          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Fulfillment</h2>
                          <p className="text-gray-600">Order management page coming soon</p>
                        </div>
                      }
                    />
                  </Routes>
                </PortalLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/portal/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PortalLayout
                  navigation={[
                    {
                      name: 'Dashboard',
                      path: '/portal/admin',
                      icon: <LayoutDashboard className="w-5 h-5" />,
                    },
                    {
                      name: 'Users',
                      path: '/portal/admin/users',
                      icon: <Home className="w-5 h-5" />,
                    },
                    {
                      name: 'Items',
                      path: '/portal/admin/items',
                      icon: <Package className="w-5 h-5" />,
                    },
                    {
                      name: 'RFQs',
                      path: '/portal/admin/rfqs',
                      icon: <FileText className="w-5 h-5" />,
                    },
                    {
                      name: 'Settings',
                      path: '/portal/admin/settings',
                      icon: <Settings className="w-5 h-5" />,
                    },
                  ]}
                >
                  <Routes>
                    <Route index element={<AdminDashboard />} />
                    <Route
                      path="users"
                      element={
                        <div className="text-center py-12">
                          <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">User Management</h2>
                          <p className="text-gray-600">User approval and management page coming soon</p>
                        </div>
                      }
                    />
                    <Route
                      path="items"
                      element={
                        <div className="text-center py-12">
                          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">Item Approval</h2>
                          <p className="text-gray-600">Item review page coming soon</p>
                        </div>
                      }
                    />
                    <Route
                      path="rfqs"
                      element={
                        <div className="text-center py-12">
                          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">RFQ Monitoring</h2>
                          <p className="text-gray-600">RFQ oversight page coming soon</p>
                        </div>
                      }
                    />
                    <Route
                      path="settings"
                      element={
                        <div className="text-center py-12">
                          <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">Platform Settings</h2>
                          <p className="text-gray-600">Margin and configuration page coming soon</p>
                        </div>
                      }
                    />
                  </Routes>
                </PortalLayout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
