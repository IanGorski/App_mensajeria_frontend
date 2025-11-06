/**
 * Creo un mock de conversación para testing
 * @param {Object} overrides - Propiedades
 * @returns {Object} Conversación mock
 */
export const createMockConversation = (overrides = {}) => {
  return {
    id: 1,
    name: "User 1",
    avatar: "https://ejemplodeavatar.com/avatar.jpg",
    lastMessage: "Ultimo mensaje de pruebas",
    time: "10:30",
    isUnread: false,
    messages: [
    {
        id: 1,
        sender: "User 1",
        content: "Esto es una prueba",
        timestamp: "10:30",
        isOwn: false,
        isRead: true,
    },
    ],
    ...overrides,
  };
};

/**
 * @param {Object} overrides 
 * @returns {Object} 
 */
export const createMockMessage = (overrides = {}) => {
  return {
    id: Date.now(),
    sender: "User 1",
    content: "Esto es una prueba",
    timestamp: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    isOwn: false,
    isRead: true,
    ...overrides,
  };
};

/**
 * Simulación de un evento táctil
 * @param {string} type - Tipo de evento (touchstart, touchend, touchmove)
 * @param {Object} coords - Coordenadas {x, y}
 * @returns {Object} Evento mock
 */
export const createTouchEvent = (type, coords = { x: 0, y: 0 }) => {
  const mockFn = () => {};
  return {
    type,
    preventDefault: mockFn,
    stopPropagation: mockFn,
    touches: [
      {
        clientX: coords.x,
        clientY: coords.y,
      },
    ],
  };
};

/**
 * Simulación de un evento de contexto
 * @param {Object} coords - Coordenadas {x, y}
 * @returns {Object} Evento mock
 */
export const createContextMenuEvent = (coords = { x: 0, y: 0 }) => {
  const mockFn = () => {};
  return {
    type: "contextmenu",
    preventDefault: mockFn,
    stopPropagation: mockFn,
    clientX: coords.x,
    clientY: coords.y,
  };
};

/**
 * Espera de un tiempo determinado (asíncronos)
 * @param {number} ms - Tiempo en ms a esperar
 * @returns {Promise}
 */
export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Valida la estructura de una conversación
 * @param {Object} conversation - Conversación a validar
 * @returns {boolean}
 */
export const isValidConversation = (conversation) => {
  return (
    conversation &&
    typeof conversation.id === "number" &&
    typeof conversation.name === "string" &&
    Array.isArray(conversation.messages)
  );
};

/**
 * Valida la estructura de un mensaje
 * @param {Object} message - Mensaje a validar
 * @returns {boolean}
 */
export const isValidMessage = (message) => {
  return (
    message &&
    typeof message.id === "number" &&
    typeof message.content === "string" &&
    typeof message.timestamp === "string" &&
    typeof message.isOwn === "boolean"
  );
};
