import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Clock, Truck } from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';

const HomePage: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-cream-50 to-orange-100 py-16 lg:py-24 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl lg:text-6xl font-bold text-brown-900 mb-6 font-display">
                Добро пожаловать в{' '}
                <span className="text-gradient">Burger Deluxe</span>
              </h1>
              <p className="text-xl text-brown-700 mb-8 leading-relaxed">
                Сочные бургеры из премиум ингредиентов, хрустящая картошка и молочные коктейли.
                Всё для идеального обеда с доставкой прямо к вам!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link to="/menu">
                  <Button size="lg" className="w-full sm:w-auto">
                    Смотреть меню
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Узнать больше
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center text-brown-700">
                  <Truck className="h-5 w-5 mr-2 text-orange-500" />
                  <span>Доставка 30-60 мин</span>
                </div>
                <div className="flex items-center text-brown-700">
                  <Star className="h-5 w-5 mr-2 text-orange-500" />
                  <span>Рейтинг 4.9/5</span>
                </div>
                <div className="flex items-center text-brown-700">
                  <Clock className="h-5 w-5 mr-2 text-orange-500" />
                  <span>10:00 - 23:00</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="lg:order-last"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative">
                <img
                  src="/hero-burger.jpg"
                  alt="Deluxe Burger"
                  className="w-full h-96 lg:h-[500px] object-cover rounded-2xl shadow-2xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-hero.jpg';
                  }}
                />
                <div className="absolute -bottom-4 -left-4 bg-white rounded-lg p-4 shadow-lg border border-cream-200">
                  <div className="flex items-center space-x-2">
                    <Badge variant="popular">🔥 Хит продаж</Badge>
                  </div>
                  <p className="font-semibold text-brown-900 mt-2">Deluxe Beast Burger</p>
                  <p className="text-brown-600 text-sm">890 ₽</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Popular Items Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-brown-900 mb-4 font-display">
              Популярные блюда
            </h2>
            <p className="text-brown-600 text-lg max-w-2xl mx-auto">
              Попробуйте наши самые любимые блюда, которые выбирают снова и снова
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="dish-card overflow-hidden group cursor-pointer">
                  <div className="relative">
                    <img
                      src={`/popular-${index}.jpg`}
                      alt={`Популярное блюдо ${index}`}
                      className="dish-image group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-dish.jpg';
                      }}
                    />
                    <div className="absolute top-4 left-4">
                      <Badge variant="popular">Популярное</Badge>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-brown-900 mb-2">
                      {index === 1 && 'Deluxe Beast Burger'}
                      {index === 2 && 'Crispy Chicken Deluxe'}
                      {index === 3 && 'Vanilla Bean Milkshake'}
                    </h3>
                    <p className="text-brown-600 text-sm mb-4">
                      {index === 1 && 'Наша гордость! Двойная говяжья котлета, бекон, авокадо и фирменный соус'}
                      {index === 2 && 'Хрустящая куриная грудка в панировке с сыром и свежими овощами'}
                      {index === 3 && 'Классический ванильный коктейль из настоящего мороженого'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-brown-900">
                        {index === 1 && '890 ₽'}
                        {index === 2 && '650 ₽'}
                        {index === 3 && '320 ₽'}
                      </span>
                      <Button size="sm">В корзину</Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/menu">
              <Button variant="secondary" size="lg">
                Посмотреть все блюда
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 lg:py-24 bg-cream-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-brown-900 mb-4 font-display">
              Почему выбирают нас
            </h2>
            <p className="text-brown-600 text-lg max-w-2xl mx-auto">
              Мы заботимся о качестве каждого ингредиента и каждого заказа
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '🥩', title: 'Премиум мясо', desc: 'Только отборная говядина и курица высшего качества' },
              { icon: '🌱', title: 'Свежие овощи', desc: 'Ежедневная поставка свежих овощей и зелени' },
              { icon: '⚡', title: 'Быстрая доставка', desc: 'Горячие блюда за 30-60 минут по всему городу' },
              { icon: '👨‍🍳', title: 'Опытные повара', desc: 'Команда профессионалов с многолетним опытом' }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="text-center p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-bold text-lg text-brown-900 mb-2">{feature.title}</h3>
                <p className="text-brown-600 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 font-display">
              Готовы попробовать?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Закажите прямо сейчас и получите скидку 10% на первый заказ!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/menu">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto bg-white text-orange-600 hover:bg-cream-100"
                >
                  Заказать сейчас
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;