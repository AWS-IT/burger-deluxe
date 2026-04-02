import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import Navbar from './Navbar';
import Footer from './Footer';
import CartSidebar from '@/components/common/CartSidebar';

interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {children || <Outlet />}
      </main>

      <Footer />

      {/* Cart Sidebar */}
      <CartSidebar />

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: 'white',
            border: '1px solid #F3E8D0',
            color: '#3C2F2F',
          },
        }}
      />
    </div>
  );
};

export default Layout;