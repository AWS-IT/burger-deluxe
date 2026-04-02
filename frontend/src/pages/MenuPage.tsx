import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Flame, Leaf, Star, Sparkles } from 'lucide-react';
import apiClient from '@/services/api';
import { Dish, Category } from '@/types';
import { cn, formatPrice, generateImageUrl, getCategoryName } from '@/lib/utils';
import { Button, Input, Badge, Card } from '@/components/ui';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';

const MenuPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { addItem } = useCartStore();

  // Получаем категории
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories(),
  });

  // Получаем блюда
  const { data: dishesData, isLoading } = useQuery({
    queryKey: ['dishes', selectedCategory, searchQuery],
    queryFn: () => apiClient.getDishes({
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      search: searchQuery || undefined,
    }),
  });

  const categories = categoriesData?.data || [];
  const dishes = dishesData?.data || [];

  const handleAddToCart = (dish: Dish) => {
    addItem(dish, 1);
    toast.success(`${dish.name} добавлен в корзину`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-display font-bold mb-4">Наше меню</h1>
          <p className="text-orange-100 text-lg">
            Откройте для себя вкуснейшие бургеры и закуски
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Поиск и фильтры */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brown-400" />
            <Input
              placeholder="Поиск блюд..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-cream-200"
            />
          </div>
          <Button variant="outline" className="md:w-auto">
            <Filter className="h-4 w-4 mr-2" />
            Фильтры
          </Button>
        </div>

        {/* Категории */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
            className={cn(
              'rounded-full',
              selectedCategory === 'all' && 'bg-orange-500 hover:bg-orange-600'
            )}
          >
            Все
          </Button>
          {categories.map((category: Category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                'rounded-full',
                selectedCategory === category.id && 'bg-orange-500 hover:bg-orange-600'
              )}
            >
              {category.name}
              <span className="ml-2 text-xs opacity-70">({category.count})</span>
            </Button>
          ))}
        </div>

        {/* Сетка блюд */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="h-48 bg-cream-200 rounded-lg mb-4" />
                <div className="h-4 bg-cream-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-cream-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : dishes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-brown-500 text-lg">Блюда не найдены</p>
            <p className="text-brown-400 mt-2">Попробуйте изменить параметры поиска</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {dishes.map((dish: Dish) => (
              <motion.div key={dish._id} variants={itemVariants}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white border-cream-200">
                  {/* Изображение */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={generateImageUrl(dish.images[0])}
                      alt={dish.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-dish.jpg';
                      }}
                    />
                    {/* Бейджи */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                      {dish.isNewDish && (
                        <Badge className="bg-green-500 text-white border-0">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Новинка
                        </Badge>
                      )}
                      {dish.isPopular && (
                        <Badge className="bg-orange-500 text-white border-0">
                          <Star className="h-3 w-3 mr-1" />
                          Хит
                        </Badge>
                      )}
                    </div>
                    {/* Теги */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      {dish.isSpicy && (
                        <Badge className="bg-red-500 text-white border-0">
                          <Flame className="h-3 w-3" />
                        </Badge>
                      )}
                      {dish.isVegetarian && (
                        <Badge className="bg-emerald-500 text-white border-0">
                          <Leaf className="h-3 w-3" />
                        </Badge>
                      )}
                    </div>
                    {/* Наличие */}
                    {dish.stock === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-medium">Нет в наличии</span>
                      </div>
                    )}
                  </div>

                  {/* Контент */}
                  <div className="p-4">
                    <div className="text-xs text-orange-500 font-medium mb-1">
                      {getCategoryName(dish.category)}
                    </div>
                    <h3 className="font-display font-semibold text-brown-900 text-lg mb-2 line-clamp-1">
                      {dish.name}
                    </h3>
                    <p className="text-brown-500 text-sm mb-3 line-clamp-2">
                      {dish.description}
                    </p>

                    {/* Характеристики */}
                    <div className="flex items-center gap-3 text-xs text-brown-400 mb-4">
                      <span>{dish.weight} г</span>
                      <span className="w-1 h-1 bg-brown-300 rounded-full" />
                      <span>{dish.calories} ккал</span>
                    </div>

                    {/* Цена и кнопка */}
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-brown-900">
                        {formatPrice(dish.price)}
                      </span>
                      <Button
                        onClick={() => handleAddToCart(dish)}
                        disabled={dish.stock === 0}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                        size="sm"
                      >
                        В корзину
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;