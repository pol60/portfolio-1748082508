import React, { useState, useEffect, useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

interface FileData {
  id: string;
  name: string;
  type: 'photo' | 'file';
  url: string;
  preview?: string;
}

interface Message {
  id: string;
  text: string;
  type: 'text' | 'photo' | 'file';
  fileId?: string;
  timestamp: number;
  isRead: boolean;
  fromUser: boolean;
}

interface FormState {
  name: string;
  topic: string;
}

const Chat: React.FC = () => {
  // ----------------- 1. Проверяем, не перезапускался ли сервер -----------------
  useEffect(() => {
    // При монтировании компонента (пустой массив зависимостей)
    fetch("/server-start")
      .then((res) => res.json())
      .then((data: { serverStart: number }) => {
        const prev = localStorage.getItem("chat_serverStart");
        const newStamp = data.serverStart.toString();

        if (prev !== newStamp) {
          // либо сервер первый раз, либо его перезапустили
          localStorage.removeItem("chat_user_id");
          // Может быть несколько ключей вида chat_<id>_form, chat_<id>_messages.
          // Точно знаем, что старые ключи содержат префикс "chat_".
          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith("chat_")) {
              localStorage.removeItem(key);
            }
          });
          // Сохраняем новую метку старта сервера
          localStorage.setItem("chat_serverStart", newStamp);
        }
      })
      .catch(() => {
        // В случае ошибки запроса /server-start просто ничего не делаем.
      });
  }, []);
  // ------------------------------------------------------------------------------

  // ----------------- 2. Инициализируем currentUserId из localStorage -----------------
  const [currentUserId] = useState<string>(() => {
    const saved = localStorage.getItem("chat_user_id");
    if (saved) return saved;
    const newId = uuidv4();
    localStorage.setItem("chat_user_id", newId);
    return newId;
  });
  const userIdRef = useRef<string>(currentUserId);

  // ----------------- 3. Состояния чата -----------------
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Инициализируем form сразу из localStorage
  const [form, setForm] = useState<FormState>(() => {
    try {
      const saved = localStorage.getItem(`chat_${currentUserId}_form`);
      if (saved) {
        return JSON.parse(saved) as FormState;
      }
    } catch {
      // если не удалось — вернём пустую форму
    }
    return { name: "", topic: "" };
  });
  // Показываем форму, только если нет имени и темы
  const [showForm, setShowForm] = useState<boolean>(() => {
    return !(Boolean(form.name) && Boolean(form.topic));
  });

  const [tempFiles, setTempFiles] = useState<FileData[]>([]);
  const [showFilePreview, setShowFilePreview] = useState<FileData | null>(null);
  const [showTopicForm, setShowTopicForm] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  // Определяем адрес бэкенда для /file endpoint
  const serverOrigin = window.location.origin;

  // ----------------- 4. Загрузка только сообщений из localStorage -----------------
  useEffect(() => {
    const savedMessages = localStorage.getItem(
      `chat_${currentUserId}_messages`
    );
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch {
        setMessages([]);
      }
    }
  }, [currentUserId]);

  // ----------------- 5. Сохранение form + последних 100 сообщений в localStorage -----------------
  useEffect(() => {
    const saveData = () => {
      // Сохраняем форму
      try {
        localStorage.setItem(
          `chat_${currentUserId}_form`,
          JSON.stringify(form)
        );
      } catch (e) {
        console.warn("Не удалось записать form в localStorage:", e);
      }

      // Кэшируем максимум 100 последних сообщений
      const MAX_CACHE = 100;
      if (messages.length > MAX_CACHE) {
        const sliceStart = messages.length - MAX_CACHE;
        const tail = messages.slice(sliceStart);
        try {
          localStorage.setItem(
            `chat_${currentUserId}_messages`,
            JSON.stringify(tail)
          );
        } catch (e) {
          console.warn("Не удалось записать messages в localStorage:", e);
        }
      } else {
        try {
          localStorage.setItem(
            `chat_${currentUserId}_messages`,
            JSON.stringify(messages)
          );
        } catch (e) {
          console.warn("Не удалось записать messages в localStorage:", e);
        }
      }
    };

    window.addEventListener("beforeunload", saveData);
    // Сразу сохраняем форму при любом её изменении
    try {
      localStorage.setItem(
        `chat_${currentUserId}_form`,
        JSON.stringify(form)
      );
    } catch {}

    return () => {
      saveData();
      window.removeEventListener("beforeunload", saveData);
    };
  }, [messages, form, currentUserId]);
  // ------------------------------------------------------------------------------------------------------------------

  // ----------------- 6. Обработчик отправки формы (имя + тема) -----------------
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const sendFormData = () => {
      if (wsRef.current?.readyState !== WebSocket.OPEN) {
        console.error("Соединение не установлено");
        return;
      }
      const formId = uuidv4();
      const ackHandler = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "form_ack" && data.formId === formId) {
            setShowForm(false);
            wsRef.current?.removeEventListener("message", ackHandler);
          }
        } catch {
          // игнорируем
        }
      };

      wsRef.current?.addEventListener("message", ackHandler);
      wsRef.current?.send(
        JSON.stringify({
          type: "form",
          formId,
          ...form,
        })
      );
    };

    if (wsRef.current?.readyState === WebSocket.CONNECTING) {
      wsRef.current.addEventListener("open", sendFormData);
    } else if (wsRef.current?.readyState === WebSocket.OPEN) {
      sendFormData();
    } else {
      console.error("WebSocket не подключен");
      connectWebSocket();
      setTimeout(() => handleSubmitForm(e), 500);
    }
  };
  // ------------------------------------------------------------------------------------------------------------------

  // ----------------- 7. Обработчик загрузки файла (фото и не-фото) -----------------
  const handleFileUpload = async (file: File) => {
    const fileId = uuidv4();
    const reader = new FileReader();

    reader.onload = () => {
      const dataUrl = reader.result as string;
      const fileData: FileData = {
        id: fileId,
        name: file.name,
        type: file.type.startsWith("image/") ? "photo" : "file",
        url: dataUrl,
        preview: dataUrl,
      };

      // Сохраняем во временные файлы для превью
      setTempFiles((prev) => [...prev, fileData]);

      // Добавляем локальное сообщение сразу
      const localMsg: Message = {
        id: fileId,
        text: file.name,
        type: fileData.type,
        fileId: fileId,
        timestamp: Date.now(),
        isRead: false,
        fromUser: true,
      };
      setMessages((prev) => [...prev, localMsg]);

      // Отправляем файл на сервер (base64 без префикса)
      wsRef.current?.send(
        JSON.stringify({
          type: "file",
          fileId,
          fileName: file.name,
          fileType: file.type,
          data: dataUrl.split(",")[1],
        })
      );
    };

    reader.readAsDataURL(file);
  };
  // ------------------------------------------------------------------------------------------------------------------

  // ----------------- 8. WebSocket: подключение и обработка сообщений -----------------
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws?userId=${userIdRef.current}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket соединение установлено");
        setIsConnected(true);
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Подтверждение загрузки файла
          if (data.type === "file_ack" && data.success) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === data.fileId ? { ...m, isRead: true } : m
              )
            );
            return;
          }

          if (data.type === "form_ack") {
            setShowForm(false);
            return;
          }

          if (data.type === "init") {
            console.log(
              "Получили INIT с сервера, сообщений:",
              data.history.length
            );
            setMessages((prevLocal) => {
              const serverHistory: Message[] = data.history;
              const serverMap = new Map<string, Message>();
              serverHistory.forEach((m) => serverMap.set(m.id, m));
              const uniqueLocal = prevLocal.filter(
                (m) => !serverMap.has(m.id)
              );
              return [...uniqueLocal, ...serverHistory];
            });

            if (data.pending && data.pending.length > 0) {
              setUnreadCount(data.pending.length);
            }
            return;
          }

          if (data.action === "admin_message") {
            const newMsg: Message = {
              id: data.id || uuidv4(),
              text: data.text,
              type: data.contentType,
              fileId: data.fileId,
              timestamp: data.timestamp || Date.now(),
              isRead: data.isRead || false,
              fromUser: false,
            };
            setMessages((prev) => [...prev, newMsg]);
            if (!isOpen) {
              setUnreadCount((c) => c + 1);
            }
          }
        } catch (e) {
          console.error("Ошибка при разборе сообщения WS:", e);
        }
      };

      ws.onclose = (event) => {
        console.log(
          "WebSocket соединение закрыто",
          event.code,
          event.reason
        );
        setIsConnected(false);
        wsRef.current = null;
        if (event.code !== 1000) {
          reconnectTimeoutRef.current = window.setTimeout(() => {
            connectWebSocket();
          }, 5000);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket ошибка:", error);
        setIsConnected(false);
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connectWebSocket();
        }, 5000);
      };

      return ws;
    } catch (error) {
      console.error("Ошибка при создании WebSocket:", error);
      return null;
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const ws = connectWebSocket();
      return () => {
        if (wsRef.current) {
          wsRef.current.close(1000, "Chat closed");
          wsRef.current = null;
        }
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
      };
    }
  }, [isOpen, connectWebSocket]);

  // Отправляем "прочитано" при открытии чата
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      const sendReadStatus = () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: "read",
              userId: userIdRef.current,
            })
          );
        }
      };

      if (wsRef.current?.readyState === WebSocket.CONNECTING) {
        wsRef.current.addEventListener("open", sendReadStatus);
        return () => {
          wsRef.current?.removeEventListener("open", sendReadStatus);
        };
      } else {
        sendReadStatus();
      }
    }
  }, [isOpen]);

  // Прокрутка вниз при новых сообщениях
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);
  // ------------------------------------------------------------------------

  // ----------------- 9. Отправка текстового сообщения  -----------------
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const sendMessage = () => {
      const message: Message = {
        id: uuidv4(),
        text: newMessage.trim(),
        type: "text",
        timestamp: Date.now(),
        isRead: false,
        fromUser: true,
      };

      setMessages((prev) => [...prev, message]);
      setNewMessage("");

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "message",
            text: message.text,
            timestamp: message.timestamp,
            id: message.id,
          })
        );
      } else {
        console.error("WebSocket не готов к отправке");
      }
    };

    if (wsRef.current?.readyState === WebSocket.CONNECTING) {
      wsRef.current.addEventListener("open", sendMessage);
    } else {
      sendMessage();
    }
  };
  // ------------------------------------------------------------------------

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const groupMessagesByDate = () => {
    const groups: { [date: string]: Message[] } = {};
    messages.forEach((message) => {
      const dateStr = formatDate(message.timestamp);
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(message);
    });
    return groups;
  };
  const messageGroups = groupMessagesByDate();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors relative"
        >
          <i className="fas fa-comments text-xl"></i>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm h-[80vh] sm:w-96 sm:h-[600px] flex flex-col">
          <div className="bg-indigo-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={`w-2 h-2 rounded-full mr-2 ${
                  isConnected ? "bg-green-400" : "bg-red-400"
                }`}
              ></div>
              <div>
                <h3 className="font-medium">Чат поддержки</h3>
                <button
                  onClick={() => setShowTopicForm(true)}
                  className="text-xs opacity-75 hover:opacity-100"
                >
                  Тема: {form.topic || "Без темы"} (изменить)
                </button>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Закрыть чат"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {showForm ? (
            <div className="p-4 flex-1">
              <form onSubmit={handleSubmitForm} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ваше имя
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    className="w-full p-2 border rounded text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Тема обращения
                  </label>
                  <input
                    type="text"
                    value={form.topic}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, topic: e.target.value }))
                    }
                    className="w-full p-2 border rounded text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
                >
                  Начать чат
                </button>
              </form>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {Object.entries(messageGroups).map(([date, msgs]) => (
                  <div key={date}>
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400 my-2">
                      {date}
                    </div>
                    {msgs.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.fromUser ? 'justify-end' : 'justify-start'} mb-2`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            msg.fromUser
                              ? "bg-indigo-600 text-white"
                              : "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                          }`}
                        >
                          <div className="text-sm">{msg.text}</div>

                          {/* Рендерим картинку, если type === 'photo' */}
                          {msg.type === "photo" &&
                            (() => {
                              const localFile = tempFiles.find(
                                (f) => f.id === msg.fileId
                              );
                              const src = localFile
                                ? localFile.preview!
                                : `${serverOrigin}/file/${msg.fileId}`;
                              return (
                                <img
                                  src={src}
                                  alt={msg.text}
                                  className="mt-2 rounded max-w-full max-h-64 object-contain cursor-pointer"
                                  onClick={() => {
                                    if (localFile) {
                                      setShowFilePreview(localFile);
                                    } else {
                                      setShowFilePreview({
                                        id: msg.fileId!,
                                        name: msg.text,
                                        type: "photo",
                                        url: `${serverOrigin}/file/${msg.fileId}`,
                                        preview: `${serverOrigin}/file/${msg.fileId}`,
                                      });
                                    }
                                  }}
                                />
                              );
                            })()}

                          {/* Рендерим файл, если type === 'file' */}
                          {msg.type === "file" &&
                            (() => {
                              const localFile = tempFiles.find(
                                (f) => f.id === msg.fileId
                              );
                              const href = localFile
                                ? localFile.url
                                : `${serverOrigin}/file/${msg.fileId}`;
                              return (
                                <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                                  <a
                                    href={href}
                                    download
                                    className="text-blue-500 dark:text-blue-300"
                                  >
                                    <i className="fas fa-file-download mr-2"></i>
                                    {msg.text}
                                  </a>
                                </div>
                              );
                            })()}

                          <div className="text-xs opacity-75 mt-1">
                            {formatTime(msg.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t dark:border-gray-700"
              >
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 p-2 border rounded text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Введите сообщение..."
                  />
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                    />
                    <i className="fas fa-paperclip text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl p-2"></i>
                  </label>
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                  >
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}

      {/* Модальное окно для превью файлов */}
      {showFilePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg max-w-3xl max-h-[90vh]">
            <img
              src={showFilePreview.preview}
              alt={showFilePreview.name}
              className="max-w-full max-h-[80vh] object-contain"
            />
            <button
              onClick={() => setShowFilePreview(null)}
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* Модальное окно для изменения темы */}
      {showTopicForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg w-96">
            <h3 className="text-lg font-medium mb-4">Изменить тему</h3>
            <input
              type="text"
              value={form.topic}
              onChange={(e) =>
                setForm((p) => ({ ...p, topic: e.target.value }))
              }
              className="w-full mb-4 p-2 border rounded text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
              placeholder="Новая тема"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowTopicForm(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  setShowTopicForm(false);
                  wsRef.current?.send(
                    JSON.stringify({
                      type: "update_topic",
                      topic: form.topic,
                    })
                  );
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
