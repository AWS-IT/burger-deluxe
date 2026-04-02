import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  CreditCard,
  Banknote,
  XCircle
} from 'lucide-react';
import apiClient from '@/services/api';
import { Order } from '@/types';
import { formatPrice, formatDate, getStatusColor, getStatusText, generateImageUrl } from '@/lib/utils';
import { Button, Card, Badge } from '@/components/ui';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const OrdersPage = () => {
  const queryClient = useQueryClient();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['user-orders'],
    queryFn: () => apiClient.getUserOrders({ limit: 50 }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => apiClient.cancelOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-orders'] });
      toast.success('Заказ отменен');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Не удалось отменить заказ');
    },
  });

  const orders = ordersData?.data || [];

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(prev => prev === orderId ? null : orderId);
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-display font-bold mb-2">Мои заказы</h1>
          <p className="text-orange-100">История и статус ваших заказов</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-cream-200 rounded w-1/3 mb-3" />
                <div className="h-3 bg-cream-200 rounded w-1/2 mb-2" />
                <div className="h-3 bg-cream-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-12 text-center bg-white border-cream-200">
              <Package className="h-16 w-16 mx-auto text-cream-300 mb-4" />
              <h2 className="text-xl font-semibold text-brown-900 mb-2">Заказов пока нет</h2>
              <p className="text-brown-500 mb-6">Самое время попробовать наши бургеры!</p>
              <Link to="/menu">
                <Button className="bg-orange-500 hover:bg-orange-600">Перейти в меню</Button>
              </Link>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: Order, index: number) => {
              const isExpanded = expandedOrder === (order._id || order.id);
              const canCancel = order.status === 'pending';

              return (
                <motion.div
                  key={order._id || order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="bg-white border-cream-200 overflow-hidden">
                    {/* Header */}
                    <button
                      onClick={() => toggleExpand(order._id || order.id)}
                      className="w-full p-4 text-left hover:bg-cream-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm text-brown-500">
                            #{order.orderNumber}
                          </span>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-brown-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-brown-400" />
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-4 text-sm text-brown-500">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatDate(order.createdAt)}
                          </span>
                          <span>{order.items?.length || 0} позиций</span>
                        </div>
                        <span className="font-bold text-brown-900">
                          {formatPrice(order.finalAmount)}
                        </span>
                      </div>
                    </button>

                    {/* Expanded details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-cream-200 p-4 space-y-4">
                            {/* Order items */}
                            <div className="space-y-3">
                              <h4 className="text-sm font-medium text-brown-700">Состав заказа</h4>
                              {order.items?.map((item, idx) => {
                                const dish = typeof item.dish === 'object' ? item.dish : null;
                                return (
                                  <div key={idx} className="flex items-center gap-3">
                                    {dish && (
                                      <img
                                        src={generateImageUrl(dish.images?.[0] || '')}
                                        alt={dish.name}
                                        className="w-12 h-12 rounded-lg object-cover"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = '/placeholder-dish.jpg';
                                        }}
                                      />
                                    )}
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-brown-900">
                                        {dish?.name || 'Блюдо'}
                                      </p>
                                      <p className="text-xs text-brown-500">
                                        {item.quantity} × {formatPrice(item.price)}
                                      </p>
                                    </div>
                                    <span className="text-sm font-medium text-brown-900">
                                      {formatPrice(item.price * item.quantity)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Delivery info */}
                            <div className="bg-cream-50 rounded-lg p-3 space-y-2">
                              <div className="flex items-start text-sm">
                                <MapPin className="h-4 w-4 mr-2 text-orange-500 mt-0.5" />
                                <span className="text-brown-700">
                                  {order.deliveryAddress?.street || (order as any).street}
                                  {(order.deliveryAddress?.apartment || (order as any).apartment) &&
                                    `, кв. ${order.deliveryAddress?.apartment || (order as any).apartment}`}
                                </span>
                              </div>
                              <div className="flex items-center text-sm">
                                {order.paymentMethod === 'card' ? (
                                  <CreditCard className="h-4 w-4 mr-2 text-orange-500" />
                                ) : (
                                  <Banknote className="h-4 w-4 mr-2 text-orange-500" />
                                )}
                                <span className="text-brown-700">
                                  {order.paymentMethod === 'card' ? 'Оплата картой' : 'Наличными'}
                                </span>
                              </div>
                            </div>

                            {/* Totals */}
                            <div className="border-t border-cream-200 pt-3 space-y-1">
                              <div className="flex justify-between text-sm text-brown-500">
                                <span>Сумма заказа</span>
                                <span>{formatPrice(order.totalAmount)}</span>
                              </div>
                              <div className="flex justify-between text-sm text-brown-500">
                                <span>Доставка</span>
                                <span>{formatPrice(order.deliveryFee)}</span>
                              </div>
                              <div className="flex justify-between font-semibold text-brown-900 pt-1">
                                <span>Итого</span>
                                <span>{formatPrice(order.finalAmount)}</span>
                              </div>
                            </div>

                            {/* Customer comment */}
                            {order.customerComment && (
                              <div className="text-sm text-brown-500">
                                <span className="font-medium">Комментарий:</span> {order.customerComment}
                              </div>
                            )}

                            {/* Cancel button */}
                            {canCancel && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => cancelMutation.mutate(order._id || order.id)}
                                disabled={cancelMutation.isPending}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Отменить заказ
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;