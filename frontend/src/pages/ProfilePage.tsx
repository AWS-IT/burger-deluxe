import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone, MapPin, LogOut, Save, ShoppingBag } from 'lucide-react';
import { Button, Input, Label, Card } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/services/api';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const profileSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  phone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Неверный формат телефона'),
});

type ProfileForm = z.infer<typeof profileSchema>;

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
    },
  });

  const handleSave = async (data: ProfileForm) => {
    setIsSaving(true);
    try {
      const response = await apiClient.updateProfile(data);
      if (response.success && response.data) {
        updateUser(response.data);
        toast.success('Профиль обновлен');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка обновления';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Вы вышли из аккаунта');
    navigate('/');
  };

  if (!user) return null;

  const defaultAddress = user.addresses?.find(a => a.isDefault) || user.addresses?.[0];

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-display font-bold mb-2">Мой профиль</h1>
          <p className="text-orange-100">Управление аккаунтом и настройками</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка — Инфо */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="p-6 bg-white border-cream-200">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-orange-500" />
                </div>
                <h2 className="text-xl font-semibold text-brown-900">{user.name}</h2>
                <p className="text-brown-500 text-sm mt-1">{user.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-orange-100 text-orange-600 text-xs font-medium rounded-full">
                  {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                </span>
              </div>

              <div className="space-y-3 border-t border-cream-200 pt-4">
                <div className="flex items-center text-sm text-brown-600">
                  <Mail className="h-4 w-4 mr-3 text-brown-400" />
                  {user.email}
                </div>
                <div className="flex items-center text-sm text-brown-600">
                  <Phone className="h-4 w-4 mr-3 text-brown-400" />
                  {user.phone}
                </div>
                {defaultAddress && (
                  <div className="flex items-start text-sm text-brown-600">
                    <MapPin className="h-4 w-4 mr-3 text-brown-400 mt-0.5" />
                    <span>
                      {defaultAddress.street}
                      {defaultAddress.apartment && `, кв. ${defaultAddress.apartment}`}
                      {defaultAddress.floor && `, ${defaultAddress.floor} этаж`}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3 mt-6">
                <Link to="/orders" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Мои заказы
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Выйти из аккаунта
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Правая колонка — Редактирование */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="p-6 bg-white border-cream-200">
              <h3 className="text-lg font-semibold text-brown-900 mb-6">Редактировать профиль</h3>

              <form onSubmit={form.handleSubmit(handleSave)} className="space-y-5">
                <div>
                  <Label htmlFor="profile-name">Имя</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brown-400" />
                    <Input
                      id="profile-name"
                      className="pl-10"
                      {...form.register('name')}
                    />
                  </div>
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="profile-email">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brown-400" />
                    <Input
                      id="profile-email"
                      value={user.email}
                      disabled
                      className="pl-10 bg-cream-50"
                    />
                  </div>
                  <p className="text-brown-400 text-xs mt-1">Email нельзя изменить</p>
                </div>

                <div>
                  <Label htmlFor="profile-phone">Телефон</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brown-400" />
                    <Input
                      id="profile-phone"
                      className="pl-10"
                      {...form.register('phone')}
                    />
                  </div>
                  {form.formState.errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.phone.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600"
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>
              </form>
            </Card>

            {/* Адрес доставки */}
            {defaultAddress && (
              <Card className="p-6 bg-white border-cream-200 mt-6">
                <h3 className="text-lg font-semibold text-brown-900 mb-4">Адрес доставки</h3>
                <div className="bg-cream-50 rounded-lg p-4 border border-cream-200">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-orange-500 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-brown-900">{defaultAddress.street}</p>
                      <div className="text-sm text-brown-500 mt-1 space-y-0.5">
                        {defaultAddress.apartment && <p>Квартира: {defaultAddress.apartment}</p>}
                        {defaultAddress.floor && <p>Этаж: {defaultAddress.floor}</p>}
                        {defaultAddress.comment && <p>Комментарий: {defaultAddress.comment}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;