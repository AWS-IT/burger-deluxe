import React from 'react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, Badge } from '@/components/ui';
import { useCartStore } from '@/store';
import { formatPrice, generateImageUrl } from '@/lib/utils';
import { Link } from 'react-router-dom';

export const CartSidebar: React.FC = () => {
  const {
    items,
    totalAmount,
    deliveryFee,
    finalAmount,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem
  } = useCartStore();

  const minOrderAmount = 1200;
  const needMoreAmount = Math.max(0, minOrderAmount - totalAmount);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />

          {/* Sidebar */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-cream-200">
              <h2 className="text-lg font-semibold text-brown-900 flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Корзина ({items.length})
              </h2>
              <Button variant="ghost" size="icon" onClick={closeCart}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col">
              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <ShoppingBag className="h-16 w-16 text-cream-300 mb-4" />
                  <h3 className="text-lg font-medium text-brown-900 mb-2">Корзина пуста</h3>
                  <p className="text-brown-600 mb-6">Добавьте блюда из меню, чтобы сделать заказ</p>
                  <Link to="/menu" onClick={closeCart}>
                    <Button>Перейти в меню</Button>
                  </Link>
                </div>
              ) : (
                <>
                  {/* Items List */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {needMoreAmount > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-yellow-800">
                          Добавьте еще на <strong>{formatPrice(needMoreAmount)}</strong> для бесплатной доставки
                        </p>
                      </div>
                    )}

                    {items.map((item) => (
                      <Card key={item.dish.id} className="p-3">
                        <div className="flex items-start space-x-3">
                          <img
                            src={generateImageUrl(item.dish.images[0])}
                            alt={item.dish.name}
                            className="w-16 h-16 rounded-lg object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-dish.jpg';
                            }}
                          />

                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-brown-900 truncate">{item.dish.name}</h4>
                            <p className="text-sm text-brown-600 mb-2">{formatPrice(item.dish.price)}</p>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.dish.id, item.quantity - 1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.dish.id, item.quantity + 1)}
                                  disabled={item.quantity >= 10}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeItem(item.dish.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Удалить
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-cream-200">
                          <div className="flex space-x-2">
                            {item.dish.isNewDish && <Badge variant="new">Новинка</Badge>}
                            {item.dish.isSpicy && <Badge variant="spicy">Острое</Badge>}
                            {item.dish.isVegetarian && <Badge variant="vegetarian">Вегетарианское</Badge>}
                          </div>
                          <span className="font-medium text-brown-900">
                            {formatPrice(item.dish.price * item.quantity)}
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="border-t border-cream-200 p-4 space-y-4">
                    {/* Order Summary */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Сумма заказа:</span>
                        <span>{formatPrice(totalAmount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Доставка:</span>
                        <span>{deliveryFee > 0 ? formatPrice(deliveryFee) : 'Бесплатно'}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg border-t border-cream-200 pt-2">
                        <span>Итого:</span>
                        <span>{formatPrice(finalAmount)}</span>
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <Link to="/checkout" onClick={closeCart}>
                      <Button className="w-full" size="lg">
                        Оформить заказ
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;