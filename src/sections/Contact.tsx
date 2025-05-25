import React from "react";
import Chat from "../components/Chat";

const Contact: React.FC = () => {
  return (
    <section
      id="contact"
      className="py-20 bg-gray-50 dark:bg-gray-800 min-h-screen flex items-center"
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Связаться со мной
            </span>
          </h2>
          <div className="w-20 h-1 bg-indigo-600 mx-auto rounded-full"></div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mt-4">
            Есть проект или идея? Давайте обсудим, как я могу помочь воплотить
            ее в жизнь.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              Отправить сообщение
            </h3>

            <form className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Имя
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-3 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm"
                  placeholder="Ваше имя"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Тема
                </label>
                <input
                  type="text"
                  id="subject"
                  className="w-full px-4 py-3 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm"
                  placeholder="Тема сообщения"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Сообщение
                </label>
                <textarea
                  id="message"
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm"
                  placeholder="Ваше сообщение..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors duration-300 !rounded-button whitespace-nowrap cursor-pointer"
              >
                Отправить сообщение <i className="fas fa-paper-plane ml-2"></i>
              </button>
            </form>
          </div>

          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Контактная информация
              </h3>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-4">
                    <i className="fas fa-envelope text-indigo-600"></i>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                      Email
                    </h4>
                    <a
                      href="mailto:contact@example.com"
                      className="text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-400"
                    >
                      contact@example.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-4">
                    <i className="fas fa-phone-alt text-indigo-600"></i>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                      Телефон
                    </h4>
                    <a
                      href="tel:+71234567890"
                      className="text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-400"
                    >
                      +380 (93) 075-9403
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-4">
                    <i className="fas fa-map-marker-alt text-indigo-600"></i>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                      Локация
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      {" "}
                      Worldwide
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Социальные сети
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <a
                  href="#"
                  className="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300 cursor-pointer"
                >
                  <i className="fab fa-github text-2xl mr-3 text-gray-800 dark:text-white"></i>
                  <span className="text-gray-700 dark:text-gray-300">
                    GitHub
                  </span>
                </a>

                <a
                  href="#"
                  className="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300 cursor-pointer"
                >
                  <i className="fab fa-linkedin text-2xl mr-3 text-blue-600"></i>
                  <span className="text-gray-700 dark:text-gray-300">
                    LinkedIn
                  </span>
                </a>

                <a
                  href="#"
                  className="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300 cursor-pointer"
                >
                  <i className="fab fa-twitter text-2xl mr-3 text-blue-400"></i>
                  <span className="text-gray-700 dark:text-gray-300">
                    Twitter
                  </span>
                </a>

                <a
                  href="#"
                  className="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300 cursor-pointer"
                >
                  <i className="fab fa-telegram text-2xl mr-3 text-blue-500"></i>
                  <span className="text-gray-700 dark:text-gray-300">
                    Telegram
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Компонент чата */}
      <Chat />
    </section>
  );
};

export default Contact;
