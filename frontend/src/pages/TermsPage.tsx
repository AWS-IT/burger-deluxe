import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-cream-50">
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 text-white py-12">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center text-orange-100 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            На главную
          </Link>
          <h1 className="text-4xl font-display font-bold flex items-center gap-3">
            <FileText className="h-8 w-8" />
            Условия использования
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-cream-200 p-8 space-y-8"
        >
          <section>
            <h2 className="text-xl font-semibold text-brown-900 mb-3">1. Общие условия</h2>
            <p className="text-brown-600 leading-relaxed">
              Настоящие Условия использования (далее — «Условия») регулируют отношения между пользователем
              и сервисом Burger Deluxe (далее — «Сервис»). Используя Сервис, вы подтверждаете свое согласие
              с настоящими Условиями. Если вы не согласны с Условиями, пожалуйста, прекратите использование Сервиса.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-brown-900 mb-3">2. Регистрация и аккаунт</h2>
            <ul className="list-disc list-inside text-brown-600 space-y-2 ml-2">
              <li>Для оформления заказов необходима регистрация в Сервисе</li>
              <li>Вы обязуетесь предоставлять достоверную информацию при регистрации</li>
              <li>Вы несете ответственность за сохранность данных вашего аккаунта</li>
              <li>Один пользователь может иметь только один аккаунт</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-brown-900 mb-3">3. Оформление заказов</h2>
            <ul className="list-disc list-inside text-brown-600 space-y-2 ml-2">
              <li>Минимальная сумма заказа составляет 1 200 ₽</li>
              <li>Стоимость доставки составляет 250 ₽</li>
              <li>Время доставки составляет от 30 до 60 минут в зависимости от загруженности</li>
              <li>Заказ можно отменить до момента подтверждения его рестораном</li>
              <li>Цены на блюда указаны в рублях и включают все применимые налоги</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-brown-900 mb-3">4. Оплата</h2>
            <p className="text-brown-600 leading-relaxed mb-3">
              Сервис поддерживает следующие способы оплаты:
            </p>
            <ul className="list-disc list-inside text-brown-600 space-y-2 ml-2">
              <li>Банковская карта (Visa, MasterCard, МИР)</li>
              <li>Наличные при получении</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-brown-900 mb-3">5. Доставка</h2>
            <p className="text-brown-600 leading-relaxed">
              Доставка осуществляется по адресу, указанному при оформлении заказа. Зона доставки ограничена
              пределами города. Время доставки является ориентировочным и может меняться в зависимости от
              загруженности и погодных условий. При получении заказа рекомендуем проверить его комплектность.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-brown-900 mb-3">6. Возврат и отмена</h2>
            <ul className="list-disc list-inside text-brown-600 space-y-2 ml-2">
              <li>Заказ можно отменить бесплатно до момента его подтверждения</li>
              <li>В случае ненадлежащего качества блюд, свяжитесь с нами для решения вопроса</li>
              <li>Возврат денежных средств осуществляется тем же способом, которым была произведена оплата</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-brown-900 mb-3">7. Ответственность</h2>
            <p className="text-brown-600 leading-relaxed">
              Сервис не несет ответственности за задержки доставки, вызванные обстоятельствами непреодолимой
              силы. Мы стремимся обеспечить максимальное качество обслуживания, но не гарантируем
              бесперебойную работу Сервиса.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-brown-900 mb-3">8. Интеллектуальная собственность</h2>
            <p className="text-brown-600 leading-relaxed">
              Все материалы, размещенные на Сервисе, включая тексты, изображения, логотипы и дизайн,
              являются интеллектуальной собственностью Burger Deluxe и защищены законодательством
              об авторских правах.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-brown-900 mb-3">9. Изменение условий</h2>
            <p className="text-brown-600 leading-relaxed">
              Мы оставляем за собой право изменять настоящие Условия. Актуальная версия Условий всегда
              доступна на данной странице. Продолжая использовать Сервис после внесения изменений,
              вы соглашаетесь с обновленными Условиями.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-brown-900 mb-3">10. Контакты</h2>
            <p className="text-brown-600 leading-relaxed">
              По вопросам, связанным с настоящими Условиями, обращайтесь по электронной почте:{' '}
              <a href="mailto:info@burgerdeluxe.com" className="text-orange-500 hover:text-orange-600">info@burgerdeluxe.com</a>{' '}
              или по телефону: <a href="tel:+79991234567" className="text-orange-500 hover:text-orange-600">+7 (999) 123-45-67</a>
            </p>
          </section>

          <div className="border-t border-cream-200 pt-6">
            <p className="text-sm text-brown-400">
              Последнее обновление: 1 апреля 2026 г.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsPage;
