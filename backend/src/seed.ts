import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import prisma from './config/database';

dotenv.config();

const dishes = [
  // Signature Burgers
  {
    name: 'Deluxe Beast Burger',
    description: 'Наша гордость! Двойная говяжья котлета 200г, бекон, сыр чеддер, карамелизированный лук, авокадо, фирменный соус Beast и свежие овощи в пышной булочке.',
    category: 'SIGNATURE_BURGERS' as const,
    price: 890,
    weight: 450,
    calories: 820,
    ingredients: JSON.stringify(['говяжья котлета', 'бекон', 'чеддер', 'авокадо', 'карамелизированный лук', 'соус Beast', 'салат', 'помидор']),
    isSpicy: false,
    isVegetarian: false,
    isNew: true,
    isPopular: true,
    stock: 25
  },
  {
    name: 'Smoky BBQ Premium',
    description: 'Сочная говяжья котлета 180г с домашним BBQ соусом, копченым беконом, луковыми кольцами, маринованными огурчиками и плавленым сыром гауда.',
    category: 'SIGNATURE_BURGERS' as const,
    price: 750,
    weight: 380,
    calories: 720,
    ingredients: JSON.stringify(['говяжья котлета', 'BBQ соус', 'копченый бекон', 'луковые кольца', 'гауда', 'маринованные огурцы']),
    isSpicy: false,
    isVegetarian: false,
    isNew: false,
    isPopular: true,
    stock: 30
  },
  {
    name: 'Spicy Fire Dragon',
    description: 'Острый бургер для любителей жгучих ощущений! Говяжья котлета с перцем халапеньо, острым чили-соусом, пеппер-джеком и хрустящими чипсами начос.',
    category: 'SIGNATURE_BURGERS' as const,
    price: 720,
    weight: 370,
    calories: 680,
    ingredients: JSON.stringify(['говяжья котлета', 'халапеньо', 'чили-соус', 'пеппер-джек', 'чипсы начос', 'острый майонез']),
    isSpicy: true,
    isVegetarian: false,
    isNew: true,
    isPopular: false,
    stock: 20
  },
  {
    name: 'Truffle Royal Burger',
    description: 'Премиум бургер с трюфельным соусом, говяжьей котлетой из мраморной говядины, камамбером, рукколой и карамелизированным луком.',
    category: 'SIGNATURE_BURGERS' as const,
    price: 1200,
    weight: 420,
    calories: 780,
    ingredients: JSON.stringify(['мраморная говядина', 'трюфельный соус', 'камамбер', 'руккола', 'карамелизированный лук']),
    isSpicy: false,
    isVegetarian: false,
    isNew: false,
    isPopular: true,
    stock: 15
  },

  // Classic Burgers
  {
    name: 'Classic Beef Burger',
    description: 'Традиционный бургер с сочной говяжьей котлетой 150г, свежими овощами, сыром чеддер и нашим фирменным соусом в классической булочке.',
    category: 'CLASSIC_BURGERS' as const,
    price: 520,
    weight: 320,
    calories: 580,
    ingredients: JSON.stringify(['говяжья котлета', 'чеддер', 'салат', 'помидор', 'лук', 'огурцы', 'фирменный соус']),
    isSpicy: false,
    isVegetarian: false,
    isNew: false,
    isPopular: true,
    stock: 50
  },
  {
    name: 'Double Cheese Burger',
    description: 'Двойное удовольствие! Две говяжьи котлеты по 120г, двойной сыр чеддер, свежие овощи и классический соус.',
    category: 'CLASSIC_BURGERS' as const,
    price: 680,
    weight: 420,
    calories: 720,
    ingredients: JSON.stringify(['2 говяжьи котлеты', 'двойной чеддер', 'салат', 'помидор', 'лук', 'соус']),
    isSpicy: false,
    isVegetarian: false,
    isNew: false,
    isPopular: true,
    stock: 35
  },
  {
    name: 'Veggie Paradise',
    description: 'Вегетарианский бургер с котлетой из киноа и овощей, авокадо, свежими овощами, веганским сыром и соусом песто.',
    category: 'CLASSIC_BURGERS' as const,
    price: 590,
    weight: 340,
    calories: 480,
    ingredients: JSON.stringify(['котлета из киноа', 'авокадо', 'веганский сыр', 'песто', 'салат', 'помидор']),
    isSpicy: false,
    isVegetarian: true,
    isNew: true,
    isPopular: false,
    stock: 25
  },

  // Chicken & Sides
  {
    name: 'Crispy Chicken Deluxe',
    description: 'Хрустящая куриная грудка в панировке, сыр чеддер, свежий салат, помидоры и нежный чесночный соус в мягкой булочке.',
    category: 'CHICKEN_SIDES' as const,
    price: 650,
    weight: 380,
    calories: 620,
    ingredients: JSON.stringify(['куриная грудка', 'панировка', 'чеддер', 'салат', 'помидор', 'чесночный соус']),
    isSpicy: false,
    isVegetarian: false,
    isNew: false,
    isPopular: true,
    stock: 40
  },
  {
    name: 'Buffalo Chicken Wings',
    description: 'Острые куриные крылышки в соусе баффало с сельдереем и сырным соусом блю чиз. 8 штук.',
    category: 'CHICKEN_SIDES' as const,
    price: 580,
    weight: 320,
    calories: 650,
    ingredients: JSON.stringify(['куриные крылышки', 'соус баффало', 'сельдерей', 'блю чиз']),
    isSpicy: true,
    isVegetarian: false,
    isNew: false,
    isPopular: true,
    stock: 30
  },
  {
    name: 'Chicken Nuggets Premium',
    description: 'Нежные куриные наггетсы из цельной грудки в хрустящей панировке. 10 штук. Подаются с соусами на выбор.',
    category: 'CHICKEN_SIDES' as const,
    price: 450,
    weight: 250,
    calories: 520,
    ingredients: JSON.stringify(['куриная грудка', 'панировка', 'соусы на выбор']),
    isSpicy: false,
    isVegetarian: false,
    isNew: false,
    isPopular: true,
    stock: 45
  },

  // Fries & Snacks
  {
    name: 'Truffle Parmesan Fries',
    description: 'Картофель фри с трюфельным маслом, тертым пармезаном, свежей зеленью и чесноком. Настоящий деликатес!',
    category: 'FRIES_SNACKS' as const,
    price: 380,
    weight: 200,
    calories: 420,
    ingredients: JSON.stringify(['картофель', 'трюфельное масло', 'пармезан', 'зелень', 'чеснок']),
    isSpicy: false,
    isVegetarian: true,
    isNew: true,
    isPopular: false,
    stock: 35
  },
  {
    name: 'Classic French Fries',
    description: 'Золотистый картофель фри, приготовленный до идеальной хрустящей корочки. Подается с кетчупом.',
    category: 'FRIES_SNACKS' as const,
    price: 220,
    weight: 150,
    calories: 320,
    ingredients: JSON.stringify(['картофель', 'соль', 'кетчуп']),
    isSpicy: false,
    isVegetarian: true,
    isNew: false,
    isPopular: true,
    stock: 100
  },
  {
    name: 'Loaded Potato Skins',
    description: 'Запеченные картофельные лодочки с беконом, сыром чеддер, зеленым луком и сметаной. 4 штуки.',
    category: 'FRIES_SNACKS' as const,
    price: 490,
    weight: 280,
    calories: 580,
    ingredients: JSON.stringify(['картофель', 'бекон', 'чеддер', 'зеленый лук', 'сметана']),
    isSpicy: false,
    isVegetarian: false,
    isNew: false,
    isPopular: false,
    stock: 25
  },
  {
    name: 'Onion Rings Deluxe',
    description: 'Хрустящие луковые кольца в золотистой панировке с пряными травами. Подаются с острым соусом ранч.',
    category: 'FRIES_SNACKS' as const,
    price: 320,
    weight: 180,
    calories: 380,
    ingredients: JSON.stringify(['лук', 'панировка', 'травы', 'соус ранч']),
    isSpicy: false,
    isVegetarian: true,
    isNew: false,
    isPopular: true,
    stock: 40
  },

  // Drinks & Shakes
  {
    name: 'Vanilla Bean Milkshake',
    description: 'Классический ванильный молочный коктейль из настоящего мороженого с ванильными стручками. Увенчан взбитыми сливками.',
    category: 'DRINKS_SHAKES' as const,
    price: 320,
    weight: 400,
    calories: 480,
    ingredients: JSON.stringify(['ванильное мороженое', 'молоко', 'ванильные стручки', 'взбитые сливки']),
    isSpicy: false,
    isVegetarian: true,
    isNew: false,
    isPopular: true,
    stock: 50
  },
  {
    name: 'Chocolate Fudge Shake',
    description: 'Насыщенный шоколадный коктейль с кусочками шоколадной помадки, взбитыми сливками и шоколадной стружкой.',
    category: 'DRINKS_SHAKES' as const,
    price: 350,
    weight: 400,
    calories: 520,
    ingredients: JSON.stringify(['шоколадное мороженое', 'шоколадная помадка', 'молоко', 'взбитые сливки']),
    isSpicy: false,
    isVegetarian: true,
    isNew: false,
    isPopular: true,
    stock: 45
  },
  {
    name: 'Fresh Berry Lemonade',
    description: 'Освежающий лимонад с лесными ягодами, мятой и льдом. Идеально для жаркого дня!',
    category: 'DRINKS_SHAKES' as const,
    price: 250,
    weight: 350,
    calories: 120,
    ingredients: JSON.stringify(['лимоны', 'лесные ягоды', 'мята', 'сахарный сироп', 'лед']),
    isSpicy: false,
    isVegetarian: true,
    isNew: true,
    isPopular: false,
    stock: 60
  },

  // Desserts
  {
    name: 'New York Cheesecake',
    description: 'Классический нью-йоркский чизкейк с нежным кремом из сливочного сыра, ванили на песочной основе с ягодным соусом.',
    category: 'DESSERTS' as const,
    price: 420,
    weight: 150,
    calories: 380,
    ingredients: JSON.stringify(['сливочный сыр', 'ваниль', 'песочное печенье', 'ягодный соус']),
    isSpicy: false,
    isVegetarian: true,
    isNew: false,
    isPopular: true,
    stock: 20
  },
  {
    name: 'Chocolate Lava Cake',
    description: 'Теплый шоколадный фондан с жидкой шоколадной начинкой, ванильным мороженым и свежими ягодами.',
    category: 'DESSERTS' as const,
    price: 480,
    weight: 180,
    calories: 450,
    ingredients: JSON.stringify(['темный шоколад', 'масло', 'яйца', 'ванильное мороженое', 'ягоды']),
    isSpicy: false,
    isVegetarian: true,
    isNew: true,
    isPopular: false,
    stock: 15
  },
  {
    name: 'Apple Pie Supreme',
    description: 'Домашний яблочный пирог с корицей, ванильным мороженым и карамельным соусом. Подается теплым.',
    category: 'DESSERTS' as const,
    price: 390,
    weight: 200,
    calories: 410,
    ingredients: JSON.stringify(['яблоки', 'корица', 'тесто', 'ванильное мороженое', 'карамельный соус']),
    isSpicy: false,
    isVegetarian: true,
    isNew: false,
    isPopular: true,
    stock: 25
  }
];

const seedData = async () => {
  try {
    console.log('🌱 Начинаем заполнение базы данных...');

    // Очищаем существующие данные (в правильном порядке из-за связей)
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.dishImage.deleteMany();
    await prisma.dish.deleteMany();
    await prisma.address.deleteMany();
    await prisma.user.deleteMany();

    console.log('🗑️  Старые данные удалены');

    // Создаем администратора
    const adminPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        name: 'Администратор',
        email: 'admin@burgerdeluxe.com',
        password: adminPassword,
        phone: '+79991234567',
        role: 'ADMIN',
        addresses: {
          create: {
            street: 'ул. Главная, д. 1',
            apartment: '100',
            floor: '10',
            comment: 'Офис администрации',
            isDefault: true
          }
        }
      }
    });

    // Создаем тестового пользователя
    const testPassword = await bcrypt.hash('test123', 10);
    await prisma.user.create({
      data: {
        name: 'Иван Иванов',
        email: 'test@example.com',
        password: testPassword,
        phone: '+79998887777',
        role: 'USER',
        addresses: {
          create: {
            street: 'ул. Тестовая, д. 15',
            apartment: '25',
            floor: '5',
            comment: 'Домофон 25',
            isDefault: true
          }
        }
      }
    });

    console.log('👤 Пользователи созданы');

    // Создаем блюда с изображениями
    for (const dishData of dishes) {
      await prisma.dish.create({
        data: {
          ...dishData,
          images: {
            create: {
              path: `/uploads/dishes/placeholder-${dishData.category.toLowerCase()}.jpg`,
              isMain: true
            }
          }
        }
      });
    }

    console.log(`🍔 Создано ${dishes.length} блюд`);

    console.log(`
    ✅ Данные успешно загружены!

    📊 Статистика:
    - Блюда: ${dishes.length}
    - Пользователи: 2 (1 admin, 1 user)

    🔐 Тестовые аккаунты:
    Администратор:
    - Email: admin@burgerdeluxe.com
    - Пароль: admin123

    Пользователь:
    - Email: test@example.com
    - Пароль: test123

    🏁 Готово к работе!
    `);

  } catch (error) {
    console.error('❌ Ошибка загрузки данных:', error);
  } finally {
    await prisma.$disconnect();
    process.exit();
  }
};

// Запускаем seed
seedData();