# 💬 Frontend - Aplicación de Mensajería en Tiempo Real

Aplicación web de mensajería instantánea con interfaz moderna, construida con React, Vite, Socket.IO y Material-UI.

## 🛠️ Stacks Tecnológicos

[![React](https://img.shields.io/badge/React-19.1-61DAFB.svg?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101.svg?logo=socket.io)](https://socket.io/)
[![Material-UI](https://img.shields.io/badge/Material--UI-7.x-0081CB.svg?logo=mui)](https://mui.com/)
[![Axios](https://img.shields.io/badge/Axios-1.x-5A29E4.svg)](https://axios-http.com/)
[![React Router](https://img.shields.io/badge/React--Router-6.x-CA4245.svg?logo=react-router&logoColor=white)](https://reactrouter.com/)
[![Lucide React](https://img.shields.io/badge/Lucide--React-latest-F56565.svg)](https://lucide.dev/)
[![Google Fonts](https://img.shields.io/badge/Google--Fonts-Inter%20%7C%20Poppins-4285F4.svg?logo=google-fonts&logoColor=white)](https://fonts.google.com/)
[![Vitest](https://img.shields.io/badge/Vitest-1.x-brightgreen.svg)](https://vitest.dev/)

## 🌐 Despliegue

- [![Frontend en Vercel](https://img.shields.io/badge/Vercel-Deploy-black.svg)](https://app-mensajeria-frontend.vercel.app/login)

- [![Frontend en Render](https://img.shields.io/badge/Render-Deploy-blue.svg)](https://app-mensajeria-frontend.onrender.com/login)

## 📚 Documentación Técnica

Para más detalles sobre la estructura del proyecto y componentes principales, consulta la [Documentación Técnica del Frontend](./DOCUMENTACION.md).

## 🚀 Instalación

### Prerrequisitos

- **Node.js** >= 20.x
- **npm** o **yarn**
- Backend corriendo en `http://localhost:3000`
- **Backend** (repositorio separado es [App_mensajeria_backend](https://github.com/IanGorski/App_mensajeria_backend)) 


### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/IanGorski/App_mensajeria_frontend.git
cd App_mensajeria_frontend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

4. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

La aplicación va a estar disponible en `http://localhost:5173`

## 🔐 Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
# Backend API
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000

# Entorno
VITE_NODE_ENV=development

# Configuración
VITE_APP_NAME=WhatsApp Clone
```

## 🗺️ Rutas de la Aplicación

| Ruta | Componente | Descripción | Protegida |
|------|-----------|-------------|-----------|
| `/` | Redirect | Redirige a /chats o /login | No |
| `/login` | LoginPage | Página de inicio de sesión | No |
| `/signup` | SignUpPage | Página de registro | No |
| `/chats` | ChatPage | Lista de chats | Sí |
| `/chats/:id` | ConversationPage | Conversación individual | Sí |
| `/settings` | SettingsPage | Configuración de usuario | Sí |
| `/status` | StatusPage | Estados (Stories) | Sí |
| `/archived` | ArchivedChatsPage | Chats archivados | Sí |
| `/calls` | ComingSoonPage | Llamadas (próximamente) | Sí |

### Navegación

```jsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Ir a un chat específico
navigate(`/chats/${chatId}`);

// Ir a la configuración
navigate('/settings');

// Volver atrás
navigate(-1);
```

## 📦 Contextos

### AuthContext
Maneja la autenticación del usuario.

```jsx
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { user, login, logout, loading } = useAuth();
  
  // ...
}
```

**Propiedades:**
- `user`: Usuario actual
- `login(email, password)`: Iniciar sesión
- `logout()`: Cerrar sesión
- `register(data)`: Registrar usuario
- `loading`: Estado de carga

### SocketContext
Maneja las conexiones WebSocket.

```jsx
import { useSocket } from './hooks/useSocket';

function MyComponent() {
  const { socket, connected } = useSocket();
  
  useEffect(() => {
    socket?.on('receiveMessage', handleNewMessage);
    
    return () => {
      socket?.off('receiveMessage', handleNewMessage);
    };
  }, [socket]);
}
```

**Propiedades:**
- `socket`: Instancia de Socket.io
- `connected`: Estado de conexión
- `joinChat(chatId)`: Unirse a un chat
- `sendMessage(data)`: Enviar mensaje
- `emitTyping(chatId)`: Indicar escritura

### AppContext
Estado global de la aplicación.

```jsx
import { useApp } from './context/AppContext';

function MyComponent() {
  const { 
    chats, 
    selectedChat, 
    setSelectedChat,
    messages,
    addMessage 
  } = useApp();
  
  // ...
}
```

## 🔌 Servicios

### authService

```javascript
import { authService } from './services/authService';

// Registrar usuario
const response = await authService.register({
  name: 'nn',
  email: 'example@example.com',
  password: 'Password123'
});

// Iniciar sesión
const response = await authService.login({
  email: 'example@example.com',
  password: 'Password123'
});

// Verificar token
const response = await authService.verifyToken(token);
```

### chatService

```javascript
import { chatService } from './services/chatService';

// Obtener todos los chats
const chats = await chatService.getAllChats();

// Obtener chat por ID
const chat = await chatService.getChatById(chatId);

// Crear chat privado
const chat = await chatService.createPrivateChat(userId);

// Crear grupo
const group = await chatService.createGroup({
  participants: [userId1, userId2],
  groupName: 'Grupo Familia'
});

// Archivar chat
await chatService.archiveChat(chatId);

// Eliminar chat
await chatService.deleteChat(chatId);
```

### messageService

```javascript
import { messageService } from './services/messageService';

// Obtener mensajes
const messages = await messageService.getMessages(chatId, {
  limit: 50,
  skip: 0
});

// Enviar mensaje
const message = await messageService.sendMessage({
  chat_id: chatId,
  content: 'Hola',
  type: 'text'
});

// Marcar como leído
await messageService.markAsRead(messageId);

// Marcar todos como leídos
await messageService.markChatAsRead(chatId);

// Eliminar mensaje
await messageService.deleteMessage(messageId);

// Obtener conteo de no leídos
const count = await messageService.getUnreadCount(chatId);
```

## 📝 Scripts Disponibles

```bash
# Desarrollo con hot reload
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Ejecutar tests
npm run test

# Ejecutar tests con UI
npm run test:ui

# Linter
npm run lint
```

# Tests con UI
npm run test:ui

# Tests con cobertura
npm run test:coverage

# Linter
npm run lint
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm run test

# Ejecutar tests en modo watch
npm run test:watch

# Ver cobertura
npm run test:coverage
```

## 🔒 Seguridad

- ✅ Rutas protegidas con autenticación
- ✅ Tokens JWT almacenados en localStorage
- ✅ Validación de inputs en formularios
- ✅ Sanitización de datos del usuario
- ✅ HTTPS en producción
- ✅ CORS configurado correctamente

## 📈 Estado del Proyecto

- ✅ Autenticación y registro
- ✅ Lista de chats
- ✅ Conversaciones en tiempo real
- ✅ Envío de mensajes
- ✅ Indicador de escritura
- ✅ Mensajes leídos/no leídos
- ✅ Chats archivados
- ✅ Responsive design
- ✅ Gestión de estados con Context API
- ✅ Manejo de errores

## 🛠️ Troubleshooting

En esta sección realicé un resumen de los problemas que se me fueron presentando y sus soluciones. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).

## 📝 Licencia

ISC License

## 👤 Autor

**Ian Gorski**
- GitHub: [@IanGorski](https://github.com/IanGorski)

## 🔗 Enlaces

- **Backend Repository:** [App_mensajeria_backend](https://github.com/IanGorski/App_mensajeria_backend)

---