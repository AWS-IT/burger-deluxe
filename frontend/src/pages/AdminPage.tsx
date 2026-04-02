import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Routes, Route, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Users,
  Plus,
  Pencil,
  Trash2,
  Upload,
  X,
  RefreshCw,
  Package,
  DollarSign
} from 'lucide-react';
import apiClient from '@/services/api';
import { Dish, Order } from '@/types';
import { cn, formatPrice, formatDate, getStatusColor, getStatusText, generateImageUrl, getCategoryName } from '@/lib/utils';
import { Button, Input, Label, Card, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Textarea } from '@/components/ui';
import { toast } from 'sonner';

// Dashboard Component
const Dashboard = () => {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => apiClient.getAdminStats(),
  });

  const stats = statsData?.data;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-cream-200 rounded w-1/2 mb-4" />
            <div className="h-8 bg-cream-200 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold text-brown-900">Панель управления</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-400 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Заказы сегодня</p>
              <p className="text-3xl font-bold mt-1">{stats?.today.orders || 0}</p>
            </div>
            <ShoppingBag className="h-10 w-10 opacity-80" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-500 to-green-400 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Выручка сегодня</p>
              <p className="text-3xl font-bold mt-1">{formatPrice(stats?.today.revenue || 0)}</p>
            </div>
            <DollarSign className="h-10 w-10 opacity-80" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-400 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Всего блюд</p>
              <p className="text-3xl font-bold mt-1">{stats?.total.dishes || 0}</p>
            </div>
            <UtensilsCrossed className="h-10 w-10 opacity-80" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-400 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Всего пользователей</p>
              <p className="text-3xl font-bold mt-1">{stats?.total.users || 0}</p>
            </div>
            <Users className="h-10 w-10 opacity-80" />
          </div>
        </Card>
      </div>

      {/* Order Stats */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-brown-900 mb-4">Статистика заказов</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats?.orderStatuses?.map((status: { _id: string; count: number }) => (
            <div key={status._id} className="text-center p-4 bg-cream-50 rounded-lg">
              <Badge className={cn('mb-2', getStatusColor(status._id))}>
                {getStatusText(status._id)}
              </Badge>
              <p className="text-2xl font-bold text-brown-900">{status.count}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Sync Buttons */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-brown-900 mb-4">Интеграции</h3>
        <div className="flex flex-wrap gap-4">
          <Button
            variant="outline"
            onClick={() => toast.info('Интеграция с МойСклад в разработке')}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Синхронизировать с МойСклад
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.info('Интеграция с 1С в разработке')}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Синхронизировать с 1С
          </Button>
        </div>
      </Card>
    </div>
  );
};

// Dishes Management Component
const DishesManagement = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'signature-burgers',
    price: 0,
    weight: 0,
    calories: 0,
    ingredients: '',
    isSpicy: false,
    isVegetarian: false,
    isNewDish: false,
    isPopular: false,
    stock: 100,
  });

  const { data: dishesData, isLoading } = useQuery({
    queryKey: ['admin-dishes'],
    queryFn: () => apiClient.getAllDishesAdmin({ limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: FormData) => apiClient.createDish(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-dishes'] });
      toast.success('Блюдо создано успешно');
      closeDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Ошибка создания блюда');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => apiClient.updateDish(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-dishes'] });
      toast.success('Блюдо обновлено успешно');
      closeDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Ошибка обновления блюда');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteDish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-dishes'] });
      toast.success('Блюдо удалено');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Ошибка удаления блюда');
    },
  });

  const dishes = dishesData?.data || [];

  const openCreateDialog = () => {
    setEditingDish(null);
    setFormData({
      name: '',
      description: '',
      category: 'signature-burgers',
      price: 0,
      weight: 0,
      calories: 0,
      ingredients: '',
      isSpicy: false,
      isVegetarian: false,
      isNewDish: false,
      isPopular: false,
      stock: 100,
    });
    setSelectedFiles([]);
    setIsDialogOpen(true);
  };

  const openEditDialog = (dish: Dish) => {
    setEditingDish(dish);
    setFormData({
      name: dish.name,
      description: dish.description,
      category: dish.category,
      price: dish.price,
      weight: dish.weight,
      calories: dish.calories,
      ingredients: dish.ingredients.join(', '),
      isSpicy: dish.isSpicy,
      isVegetarian: dish.isVegetarian,
      isNewDish: dish.isNewDish,
      isPopular: dish.isPopular,
      stock: dish.stock,
    });
    setSelectedFiles([]);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingDish(null);
    setSelectedFiles([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('price', formData.price.toString());
    data.append('weight', formData.weight.toString());
    data.append('calories', formData.calories.toString());
    data.append('ingredients', JSON.stringify(formData.ingredients.split(',').map(s => s.trim()).filter(Boolean)));
    data.append('isSpicy', formData.isSpicy.toString());
    data.append('isVegetarian', formData.isVegetarian.toString());
    data.append('isNew', formData.isNewDish.toString());
    data.append('isPopular', formData.isPopular.toString());
    data.append('stock', formData.stock.toString());

    selectedFiles.forEach(file => {
      data.append('images', file);
    });

    if (editingDish) {
      updateMutation.mutate({ id: editingDish._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-brown-900">Управление меню</h2>
        <Button onClick={openCreateDialog} className="bg-orange-500 hover:bg-orange-600">
          <Plus className="h-4 w-4 mr-2" />
          Добавить блюдо
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="h-32 bg-cream-200 rounded-lg mb-4" />
              <div className="h-4 bg-cream-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-cream-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dishes.map((dish: Dish) => (
            <Card key={dish._id} className="overflow-hidden">
              <div className="relative h-32">
                <img
                  src={generateImageUrl(dish.images[0])}
                  alt={dish.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-dish.jpg';
                  }}
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 bg-white"
                    onClick={() => openEditDialog(dish)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 bg-white text-red-500 hover:text-red-600"
                    onClick={() => {
                      if (confirm('Удалить это блюдо?')) {
                        deleteMutation.mutate(dish._id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-brown-900 line-clamp-1">{dish.name}</h3>
                  <Badge className={dish.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {dish.stock > 0 ? `${dish.stock} шт` : 'Нет'}
                  </Badge>
                </div>
                <p className="text-sm text-brown-500 mb-2">{getCategoryName(dish.category)}</p>
                <p className="font-bold text-orange-500">{formatPrice(dish.price)}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDish ? 'Редактировать блюдо' : 'Добавить блюдо'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Название</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="col-span-2">
                <Label>Описание</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label>Категория</Label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-cream-200 bg-white"
                >
                  <option value="signature-burgers">Signature Burgers</option>
                  <option value="classic-burgers">Classic Burgers</option>
                  <option value="chicken-sides">Chicken & Sides</option>
                  <option value="fries-snacks">Fries & Snacks</option>
                  <option value="drinks-shakes">Drinks & Shakes</option>
                  <option value="desserts">Desserts</option>
                </select>
              </div>

              <div>
                <Label>Цена (руб)</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  min={0}
                  required
                />
              </div>

              <div>
                <Label>Вес (г)</Label>
                <Input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                  min={0}
                  required
                />
              </div>

              <div>
                <Label>Калории</Label>
                <Input
                  type="number"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: Number(e.target.value) })}
                  min={0}
                  required
                />
              </div>

              <div>
                <Label>Остаток на складе</Label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  min={0}
                  required
                />
              </div>

              <div className="col-span-2">
                <Label>Ингредиенты (через запятую)</Label>
                <Input
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  placeholder="говядина, сыр, салат..."
                />
              </div>

              <div className="col-span-2 flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isSpicy}
                    onChange={(e) => setFormData({ ...formData, isSpicy: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Острое</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isVegetarian}
                    onChange={(e) => setFormData({ ...formData, isVegetarian: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Вегетарианское</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isNewDish}
                    onChange={(e) => setFormData({ ...formData, isNewDish: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Новинка</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Популярное</span>
                </label>
              </div>

              <div className="col-span-2">
                <Label>Изображения</Label>
                <div className="mt-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Выбрать изображения
                  </Button>
                  {selectedFiles.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index}`}
                            className="h-20 w-20 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {editingDish && !selectedFiles.length && (
                    <p className="text-sm text-brown-500 mt-2">
                      Текущие изображения сохранятся, если не выбраны новые
                    </p>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Отмена
              </Button>
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingDish ? 'Сохранить' : 'Создать'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Orders Management Component
const OrdersManagement = () => {
  const queryClient = useQueryClient();

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => apiClient.getAllOrdersAdmin({ limit: 50 }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Статус заказа обновлен');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Ошибка обновления статуса');
    },
  });

  const orders = ordersData?.data || [];
  const statuses = ['pending', 'confirmed', 'preparing', 'on-the-way', 'delivered', 'cancelled'];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold text-brown-900">Управление заказами</h2>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-cream-200 rounded w-1/4 mb-2" />
              <div className="h-3 bg-cream-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card className="p-8 text-center">
          <Package className="h-12 w-12 mx-auto text-brown-300 mb-4" />
          <p className="text-brown-500">Заказов пока нет</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order: Order) => (
            <Card key={order._id} className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm text-brown-500">
                      #{order.orderNumber}
                    </span>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-brown-600">
                    {(order.user as { name: string })?.name || 'Гость'} &bull; {formatDate(order.createdAt)}
                  </p>
                  <p className="text-sm text-brown-500 mt-1">
                    {order.items.length} позиций &bull; {formatPrice(order.finalAmount)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateStatusMutation.mutate({ id: order._id, status: e.target.value })
                    }
                    className="h-9 px-3 rounded-md border border-cream-200 bg-white text-sm"
                    disabled={updateStatusMutation.isPending}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {getStatusText(status)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Main Admin Page Component
const AdminPage = () => {
  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Дашборд', end: true },
    { path: '/admin/dishes', icon: UtensilsCrossed, label: 'Меню' },
    { path: '/admin/orders', icon: ShoppingBag, label: 'Заказы' },
  ];

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-cream-200 min-h-screen p-4 hidden md:block">
          <div className="mb-8">
            <h1 className="text-xl font-display font-bold text-gradient">Админ-панель</h1>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-orange-100 text-orange-600'
                      : 'text-brown-600 hover:bg-cream-100'
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="dishes" element={<DishesManagement />} />
            <Route path="orders" element={<OrdersManagement />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminPage;