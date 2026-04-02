import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-brown-900 text-cream-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <h3 className="text-2xl font-bold text-orange-400">Burger Deluxe</h3>
            </div>
            <p className="text-cream-200 mb-6 max-w-md">
              Мы создаем не просто бургеры — мы создаем моменты радости.
              Только свежие ингредиенты, проверенные рецепты и любовь к своему делу.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center text-cream-200">
                <Heart className="h-4 w-4 mr-2 text-orange-400" />
                <span className="text-sm">Сделано с любовью</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-orange-400">Меню</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/menu?category=signature-burgers" className="text-cream-200 hover:text-orange-400 transition-colors">
                  Signature Burgers
                </Link>
              </li>
              <li>
                <Link to="/menu?category=classic-burgers" className="text-cream-200 hover:text-orange-400 transition-colors">
                  Classic Burgers
                </Link>
              </li>
              <li>
                <Link to="/menu?category=chicken-sides" className="text-cream-200 hover:text-orange-400 transition-colors">
                  Chicken & Sides
                </Link>
              </li>
              <li>
                <Link to="/menu?category=drinks-shakes" className="text-cream-200 hover:text-orange-400 transition-colors">
                  Напитки
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-orange-400">Контакты</h4>
            <ul className="space-y-3">
              <li className="flex items-center text-cream-200">
                <Phone className="h-4 w-4 mr-3 text-orange-400 flex-shrink-0" />
                <span>+7 (999) 123-45-67</span>
              </li>
              <li className="flex items-center text-cream-200">
                <Mail className="h-4 w-4 mr-3 text-orange-400 flex-shrink-0" />
                <span>info@burgerdeluxe.com</span>
              </li>
              <li className="flex items-start text-cream-200">
                <MapPin className="h-4 w-4 mr-3 text-orange-400 flex-shrink-0 mt-0.5" />
                <span>г. Москва, ул. Вкусная, д. 1</span>
              </li>
            </ul>

            <div className="mt-6">
              <h5 className="font-medium mb-2 text-orange-400">Время работы:</h5>
              <p className="text-sm text-cream-200">
                Ежедневно: 10:00 - 23:00<br />
                Доставка до 22:30
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-brown-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-cream-300 text-sm">
            © 2024 Burger Deluxe. Все права защищены.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-cream-300 hover:text-orange-400 text-sm transition-colors">
              Политика конфиденциальности
            </Link>
            <Link to="/terms" className="text-cream-300 hover:text-orange-400 text-sm transition-colors">
              Условия использования
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;