import React, { useState, useEffect } from "react";
import Chat from "../components/Chat";

interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  city: string;
}

const Contact: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const getWeather = async (latitude: number, longitude: number) => {
    try {
      console.log('Получение погоды для координат:', latitude, longitude);
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=695605c4006a81a3e07c2f064ba1f851&units=metric&lang=ru`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Ошибка получения данных о погоде: ${errorData.message || response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Полученные данные о погоде:', data);
      
      setWeather({
        temp: Math.round(data.main.temp),
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        city: data.name
      });
      setWeatherError(null);

      // Отправляем геолокацию в телеграм бот
      const ws = new WebSocket(`wss://${window.location.host}/ws?userId=${localStorage.getItem('chat_user_id')}`);
      ws.onopen = () => {
        ws.send(JSON.stringify({
          type: "location",
          latitude,
          longitude,
          city: data.name
        }));
      };
    } catch (error) {
      console.error('Ошибка получения погоды:', error);
      setWeatherError(error instanceof Error ? error.message : 'Неизвестная ошибка');
    } finally {
      setWeatherLoading(false);
    }
  };

  const getLocationByIP = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      console.log('Получено местоположение по IP:', data);
      return {
        latitude: data.latitude,
        longitude: data.longitude
      };
    } catch (error) {
      console.error('Ошибка получения местоположения по IP:', error);
      return null;
    }
  };

  useEffect(() => {
    const getLocation = async () => {
      console.log('Запуск получения геолокации...');
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            console.log('Геолокация получена:', position.coords);
            await getWeather(position.coords.latitude, position.coords.longitude);
          },
          async (error) => {
            console.error('Ошибка получения геолокации:', error);
            console.log('Пробуем получить местоположение по IP...');
            
            const ipLocation = await getLocationByIP();
            if (ipLocation) {
              await getWeather(ipLocation.latitude, ipLocation.longitude);
            } else {
              setWeatherError('Не удалось определить местоположение. Пожалуйста, проверьте настройки геолокации в браузере.');
              setWeatherLoading(false);
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      } else {
        console.log('Геолокация не поддерживается браузером, пробуем получить по IP...');
        const ipLocation = await getLocationByIP();
        if (ipLocation) {
          await getWeather(ipLocation.latitude, ipLocation.longitude);
        } else {
          setWeatherError('Ваш браузер не поддерживает геолокацию и не удалось определить местоположение по IP');
          setWeatherLoading(false);
        }
      }
    };

    getLocation();
  }, []);

  const getWeatherIcon = (iconCode: string): string => {
    const iconMap: { [key: string]: string } = {
      '01d': 'sun',
      '01n': 'moon',
      '02d': 'cloud-sun',
      '02n': 'cloud-moon',
      '03d': 'cloud',
      '03n': 'cloud',
      '04d': 'cloud',
      '04n': 'cloud',
      '09d': 'cloud-showers-heavy',
      '09n': 'cloud-showers-heavy',
      '10d': 'cloud-sun-rain',
      '10n': 'cloud-moon-rain',
      '11d': 'bolt',
      '11n': 'bolt',
      '13d': 'snowflake',
      '13n': 'snowflake',
      '50d': 'smog',
      '50n': 'smog'
    };
    return iconMap[iconCode] || 'cloud';
  };

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
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mt-4 mb-8">
            Есть проект или идея? Давайте обсудим, как я могу помочь воплотить
            ее в жизнь.
          </p>
          <button
            onClick={() => setIsChatOpen(true)}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Написать <i className="fas fa-paper-plane ml-2"></i>
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              Контактная информация
            </h3>

            <div className="space-y-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-4">
                  <i className="fas fa-envelope text-indigo-600"></i>
                </div>
                <div className="flex-1">
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

              <div className="flex items-center">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-4">
                  <i className="fas fa-phone-alt text-indigo-600"></i>
                </div>
                <div className="flex-1">
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

              <div className="flex items-center">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-4">
                  <i className="fas fa-map-marker-alt text-indigo-600"></i>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Локация
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    Worldwide
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-4">
                  <i className="fas fa-cloud-sun text-indigo-600"></i>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Погода
                  </h4>
                  {weather && (
                    <div className="flex items-center space-x-2">
                      <img
                        src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                        alt={weather.description}
                        className="w-8 h-8"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const icon = document.createElement('i');
                            icon.className = `fas fa-${getWeatherIcon(weather.icon)} text-2xl text-indigo-600`;
                            parent.appendChild(icon);
                          }
                        }}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                          {weather.city}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {weather.temp}°C, {weather.description}
                        </span>
                      </div>
                    </div>
                  )}
                  {weatherLoading && (
                    <div className="animate-pulse flex space-x-2">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                      <div className="flex flex-col space-y-2">
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-600 rounded"></div>
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-600 rounded"></div>
                      </div>
                    </div>
                  )}
                  {weatherError && (
                    <div className="text-sm text-red-500">
                      {weatherError}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              Социальные сети
            </h3>

            <div className="grid grid-cols-1 gap-4">
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

      {/* Компонент чата */}
      <Chat isOpen={isChatOpen} setIsOpen={setIsChatOpen} />
    </section>
  );
};

export default Contact;
