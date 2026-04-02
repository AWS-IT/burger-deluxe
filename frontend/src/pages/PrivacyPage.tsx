import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-cream-50">
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 text-white py-12">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center text-orange-100 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            На главную
          </Link>
          <h1 className="text-4xl font-display font-bold flex items-center gap-3">
            <Shield className="h-8 w-8" />
            Политика конфиденциальности
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
            <h2 className="text-xl font-semibold text-brown-900 mb-3">1. Общие положения</h2>
            <p className="text-brown-600 leading-relaxed">
              Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных
              пользователей сервиса Burger Deluxe (далее — «Сервис»). Используя Сервис, вы соглашаетесь с
              условиями данной Политики.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-brown-900 mb-3">2. Какие данные мы собираем</h2>
            <p className="text-brown-600 leading-relaxed mb-3">
              Мы собираем следующие категории персональных данных:
            </p>
            <ul className="list-disc list-inside text-brown-600 space-y-2 ml-2">
              <li>Имя и фамилия</li>
              <li>Адрес электронной почты</li>
              <li>Номер телефона</li>
              <li>Адрес доставки</li>
              <li>История заказов</li>
              <li>Информация о предпочтениях и выборе блюд</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-brown-900 mb-3">3. Цели обработки данных</h2>
            <p className="text-brown-600 leading-relaxed mb-3">
              Персональные данные обрабатываются в следующих целях:
            </p>
            <ul className="list-disc list-inside text-brown-600 space-y-2 ml-2">
              <li>Оформление и доставка заказов</li>
              <li>Идентификация пользователя в Сервисе</li>
              <li>Связь с пользователем для подтверждения заказов</li>
              <li>Улучшение качества обслуживания</li>
              <li>Отправка уведомлений о статусе заказа</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-brown-900 mb-3">4. Защита данных</h2>
            <p className="text-brown-600 leading-relaxed">
              Мы принимаем необходимые организационные и технические меры для защиты персональных данных
              от неправомерного или случайного доступа, уничтожения, изменения, блокирования, копирования,
              распространения, а также от иных неправомерных действий с ними третьих лиц. Передача данных
              осуществляется по защищенным каналам связи.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-brown-900 mb-3">5. Передача данных третьим лицам</h2>
            <p className="text-brown-600 leading-relaxed">
              Мы не передаем персональные данные третьим лицам, за исключением случаев, когда это необходимо
              для выполнения заказа (например, передача адреса курьерской службе) или когда это требуется
              по законодательству Российской Федерации.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-brown-900 mb-3">6. Cookies</h2>
            <p className="text-brown-600 leading-relaxed">
              Сервис использует cookies для обеспечения работы аутентификации и сохранения настроек
              пользователя. Вы можете отключить cookies в настройках браузера, однако это может повлиять
              на функциональность Сервиса.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-brown-900 mb-3">7. Права пользователя</h2>
            <p className="text-brown-600 leading-relaxed mb-3">
              Вы имеете право:
            </p>
            <ul className="list-disc list-inside text-brown-600 space-y-2 ml-2">
              <li>Запросить информацию о хранящихся персональных данных</li>
              <li>Потребовать исправления неточных данных</li>
              <li>Потребовать удаления ваших данных</li>
              <li>Отозвать согласие на обработку данных</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-brown-900 mb-3">8. Контакты</h2>
            <p className="text-brown-600 leading-relaxed">
              По вопросам, связанным с обработкой персональных данных, вы можете обратиться по
              электронной почте: <a href="mailto:privacy@burgerdeluxe.com" className="text-orange-500 hover:text-orange-600">privacy@burgerdeluxe.com</a>
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

export default PrivacyPage;
