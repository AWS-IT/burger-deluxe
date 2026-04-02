import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  MapPin,
  Clock,
  CreditCard,
  Banknote,
  MessageSquare,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import { Button, Input, Label, Card, Textarea } from '@/components/ui';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/services/api';
import { formatPrice, generateImageUrl } from '@/lib/utils';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const checkoutSchema = z.object({
  street: z.string().min(5, 'Укажите адрес доставки (минимум 5 символов)'),
  apartment: z.string().optional(),
  floor: z.string().optional(),
  addressComment: z.string().optional(),
  deliveryTime: z.string().min(1, 'Выберите время доставки'),
  paymentMethod: z.enum(['cash', 'card'], { required_error: 'Выберите способ оплаты' }),
  customerComment: z.string().max(500).optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, totalAmount, deliveryFee, finalAmount, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const defaultAddress = user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];

  // Генерируем минимальное время доставки (через 1 час)
  const minDate = new Date();
  minDate.setHours(minDate.getHours() + 1);
  const minDateStr = minDate.toISOString().slice(0, 16);

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      street: defaultAddress?.street || '',
      apartment: defaultAddress?.apartment || '',
      floor: defaultAddress?.floor || '',
      addressComment: defaultAddress?.comment || '',
      deliveryTime: '',
      paymentMethod: 'card',
      customerComment: '',
    },
  });

  const handleSubmit = async (data: CheckoutForm) => {
    if (items.length === 0) {
      toast.error('Корзина пуста');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.createOrder({
        deliveryAddress: {
          street: data.street,
          apartment: data.apartment,
          floor: data.floor,
          comment: data.addressComment,
        },
        deliveryTime: new Date(data.deliveryTime).toISOString(),
        paymentMethod: data.paymentMethod,
        customerComment: data.customerComment,
      });

      if (response.success && response.data) {
        clearCart();
        setOrderNumber(response.data.orderNumber);
        setIsSuccess(true);
        toast.success('Заказ оформлен!');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка оформления заказа';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Успешное оформление
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <Card className="p-8 bg-white border-cream-200">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-display font-bold text-brown-900 mb-2">
              Заказ оформлен!
            </h2>
            <p className="text-brown-600 mb-2">
              Номер заказа: <span className="font-mono font-semibold">{orderNumber}</span>
            </p>
            <p className="text-brown-500 text-sm mb-6">
              Мы уже готовим ваш заказ. Вы можете отследить статус в разделе «Мои заказы».
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/orders">
                <Button className="w-full bg-orange-500 hover:bg-orange-600">
                  Мои заказы
                </Button>
              </Link>
              <Link to="/menu">
                <Button variant="outline" className="w-full">
                  Вернуться в меню
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Пустая корзина
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4">
        <Card className="p-8 text-center bg-white border-cream-200 max-w-md">
          <h2 className="text-xl font-semibold text-brown-900 mb-2">Корзина пуста</h2>
          <p className="text-brown-500 mb-6">Добавьте блюда, чтобы оформить заказ</p>
          <Link to="/menu">
            <Button className="bg-orange-500 hover:bg-orange-600">Перейти в меню</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 text-white py-12">
        <div className="container mx-auto px-4">
          <Link to="/menu" className="inline-flex items-center text-orange-100 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Вернуться в меню
          </Link>
          <h1 className="text-4xl font-display font-bold">Оформление заказа</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Форма */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Адрес доставки */}
              <Card className="p-6 bg-white border-cream-200">
                <h3 className="text-lg font-semibold text-brown-900 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-orange-500" />
                  Адрес доставки
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="street">Улица, дом</Label>
                    <Input
                      id="street"
                      placeholder="ул. Примера, д. 1"
                      className="mt-1"
                      {...form.register('street')}
                    />
                    {form.formState.errors.street && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.street.message}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="apartment">Квартира</Label>
                      <Input
                        id="apartment"
                        placeholder="кв. 25"
                        className="mt-1"
                        {...form.register('apartment')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="floor">Этаж</Label>
                      <Input
                        id="floor"
                        placeholder="5"
                        className="mt-1"
                        {...form.register('floor')}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="addressComment">Комментарий к адресу</Label>
                    <Input
                      id="addressComment"
                      placeholder="Домофон, подъезд и т.д."
                      className="mt-1"
                      {...form.register('addressComment')}
                    />
                  </div>
                </div>
              </Card>

              {/* Время доставки */}
              <Card className="p-6 bg-white border-cream-200">
                <h3 className="text-lg font-semibold text-brown-900 mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-orange-500" />
                  Время доставки
                </h3>
                <div>
                  <Label htmlFor="deliveryTime">Желаемое время</Label>
                  <Input
                    id="deliveryTime"
                    type="datetime-local"
                    min={minDateStr}
                    className="mt-1"
                    {...form.register('deliveryTime')}
                  />
                  {form.formState.errors.deliveryTime && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.deliveryTime.message}</p>
                  )}
                  <p className="text-brown-400 text-xs mt-1">Минимум через 1 час от текущего времени</p>
                </div>
              </Card>

              {/* Способ оплаты */}
              <Card className="p-6 bg-white border-cream-200">
                <h3 className="text-lg font-semibold text-brown-900 mb-4">Способ оплаты</h3>
                <div className="grid grid-cols-2 gap-4">
                  <label
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      form.watch('paymentMethod') === 'card'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-cream-200 hover:border-cream-300'
                    }`}
                  >
                    <input
                      type="radio"
                      value="card"
                      {...form.register('paymentMethod')}
                      className="sr-only"
                    />
                    <CreditCard className={`h-5 w-5 ${
                      form.watch('paymentMethod') === 'card' ? 'text-orange-500' : 'text-brown-400'
                    }`} />
                    <span className={`text-sm font-medium ${
                      form.watch('paymentMethod') === 'card' ? 'text-orange-600' : 'text-brown-700'
                    }`}>
                      Картой
                    </span>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      form.watch('paymentMethod') === 'cash'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-cream-200 hover:border-cream-300'
                    }`}
                  >
                    <input
                      type="radio"
                      value="cash"
                      {...form.register('paymentMethod')}
                      className="sr-only"
                    />
                    <Banknote className={`h-5 w-5 ${
                      form.watch('paymentMethod') === 'cash' ? 'text-orange-500' : 'text-brown-400'
                    }`} />
                    <span className={`text-sm font-medium ${
                      form.watch('paymentMethod') === 'cash' ? 'text-orange-600' : 'text-brown-700'
                    }`}>
                      Наличными
                    </span>
                  </label>
                </div>
              </Card>

              {/* Комментарий */}
              <Card className="p-6 bg-white border-cream-200">
                <h3 className="text-lg font-semibold text-brown-900 mb-4 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-orange-500" />
                  Комментарий к заказу
                </h3>
                <Textarea
                  placeholder="Пожелания к заказу..."
                  rows={3}
                  {...form.register('customerComment')}
                />
              </Card>

              {/* Submit (мобильный) */}
              <div className="lg:hidden">
                <Button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Оформление...' : `Оформить заказ — ${formatPrice(finalAmount)}`}
                </Button>
              </div>
            </form>
          </motion.div>

          {/* Сводка заказа */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="sticky top-24">
              <Card className="p-6 bg-white border-cream-200">
                <h3 className="text-lg font-semibold text-brown-900 mb-4">Ваш заказ</h3>

                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.dish.id} className="flex items-center gap-3">
                      <img
                        src={generateImageUrl(item.dish.images?.[0] || '')}
                        alt={item.dish.name}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-dish.jpg';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-brown-900 truncate">{item.dish.name}</p>
                        <p className="text-xs text-brown-500">{item.quantity} × {formatPrice(item.dish.price)}</p>
                      </div>
                      <span className="text-sm font-medium text-brown-900">
                        {formatPrice(item.dish.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-cream-200 mt-4 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-brown-500">
                    <span>Сумма заказа</span>
                    <span>{formatPrice(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-brown-500">
                    <span>Доставка</span>
                    <span>{deliveryFee > 0 ? formatPrice(deliveryFee) : 'Бесплатно'}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-brown-900 pt-2 border-t border-cream-200">
                    <span>Итого</span>
                    <span>{formatPrice(finalAmount)}</span>
                  </div>
                </div>

                {/* Submit (десктоп) */}
                <div className="hidden lg:block mt-4">
                  <Button
                    type="submit"
                    form="checkout-form"
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    size="lg"
                    disabled={isSubmitting}
                    onClick={form.handleSubmit(handleSubmit)}
                  >
                    {isSubmitting ? 'Оформление...' : 'Оформить заказ'}
                  </Button>
                </div>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;