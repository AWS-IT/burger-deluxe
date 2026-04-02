import React from 'react';
import { Link } from 'react-router-dom';
import { User, ShoppingCart, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import { useAuthStore, useCartStore } from '@/store';

interface NavbarProps {
  onMenuToggle?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const { user, isAuthenticated } = useAuthStore();
  const { items, toggleCart } = useCartStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (onMenuToggle) onMenuToggle();
  };

  return (
    <motion.header
      className="sticky top-0 z-50 w-full border-b border-cream-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              className="text-2xl font-bold text-gradient"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              Burger Deluxe
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-brown-700 hover:text-orange-500 font-medium transition-colors">
              Главная
            </Link>
            <Link to="/menu" className="text-brown-700 hover:text-orange-500 font-medium transition-colors">
              Меню
            </Link>
            {isAuthenticated && (
              <Link to="/orders" className="text-brown-700 hover:text-orange-500 font-medium transition-colors">
                Заказы
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-brown-700 hover:text-orange-500 font-medium transition-colors">
                Админ
              </Link>
            )}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Cart Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCart}
              className="relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <motion.span
                  className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  {cartItemsCount}
                </motion.span>
              )}
            </Button>

            {/* User Menu */}
            {isAuthenticated ? (
              <Link to="/profile">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button size="sm">Войти</Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="md:hidden"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.nav
            className="md:hidden py-4 border-t border-cream-200"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-brown-700 hover:text-orange-500 font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Главная
              </Link>
              <Link
                to="/menu"
                className="text-brown-700 hover:text-orange-500 font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Меню
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/orders"
                    className="text-brown-700 hover:text-orange-500 font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Заказы
                  </Link>
                  <Link
                    to="/profile"
                    className="text-brown-700 hover:text-orange-500 font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Профиль
                  </Link>
                </>
              )}
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="text-brown-700 hover:text-orange-500 font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Админ-панель
                </Link>
              )}
              {!isAuthenticated && (
                <Link
                  to="/auth"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button size="sm" className="w-fit">Войти</Button>
                </Link>
              )}
            </div>
          </motion.nav>
        )}
      </div>
    </motion.header>
  );
};

export default Navbar;