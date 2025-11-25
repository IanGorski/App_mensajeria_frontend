# 📚 Documentación Técnica del Frontend

## 📁 Estructura del Proyecto

```
Frontend/
├── public/                  # Archivos estáticos
├── src/
│   ├── assets/             # Imágenes y recursos
│   ├── components/         # Componentes reutilizables
│   │   ├── auth/          # Componentes de autenticación
│   │   │   ├── LoginForm.jsx
│   │   │   └── RegisterForm.jsx
│   │   ├── config/        # Componentes de configuración
│   │   ├── Sidebar.jsx    # Barra lateral de navegación
│   │   └── ProtectedRoute.jsx  # HOC para rutas protegidas
│   ├── context/           # Context API
│   │   ├── AppContext.jsx    # Estado global de la app
│   │   ├── AuthContext.jsx   # Autenticación
│   │   └── SocketContext.jsx # WebSocket
│   ├── hooks/             # Custom hooks
│   │   ├── useAuth.js        # Hook de autenticación
│   │   ├── useSocket.js      # Hook de WebSocket
│   │   ├── useMessages.js    # Hook de mensajes
│   │   └── useEscapeKey.js   # Hook para tecla ESC
│   ├── pages/             # Páginas de la aplicación
│   │   ├── ChatPage.jsx           # Lista de chats
│   │   ├── ConversationPage.jsx   # Conversación individual
│   │   ├── LoginPage.jsx          # Página de login
│   │   ├── SignUpPage.jsx         # Página de registro
│   │   ├── SettingsPage.jsx       # Configuración
│   │   ├── StatusPage.jsx         # Estados (Stories)
│   │   ├── ComingSoonPage.jsx     # Próximamente
│   │   └── ArchivedChatsPage.jsx  # Chats archivados
│   ├── panels/            # Paneles laterales
│   │   ├── ConversationPanel.jsx  # Panel de conversación
│   │   ├── ContactInfoPanel.jsx   # Info de contacto
│   │   └── ProfilePanel.jsx       # Panel de perfil
│   ├── services/          # Servicios API
│   │   ├── api.js            # Cliente Axios configurado
│   │   ├── authService.js    # Servicios de autenticación
│   │   ├── chatService.js    # Servicios de chats
│   │   └── messageService.js # Servicios de mensajes
│   ├── ui/                # Componentes UI base
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   └── ...
│   ├── utils/             # Utilidades
│   │   ├── formatDate.js
│   │   ├── validation.js
│   │   └── ...
│   ├── App.jsx            # Componente principal
│   ├── App.css            # Estilos globales
│   ├── main.jsx           # Punto de entrada
│   └── index.css          # Estilos base
├── .env                   # Variables de entorno
├── vite.config.js         # Configuración de Vite
├── vitest.config.js       # Configuración de tests
└── package.json
```

## 🧩 Componentes Principales

### Sidebar
Barra lateral de navegación con acceso a todas las secciones de la aplicación.

```jsx
<Sidebar />
```

### ProtectedRoute
HOC para proteger rutas que requieren autenticación.

```jsx
<Route 
  path="/chats" 
  element={
    <ProtectedRoute>
      <ChatPage />
    </ProtectedRoute>
  } 
/>
```

### LoginForm
Formulario de inicio de sesión con validación.

```jsx
<LoginForm onSuccess={() => navigate('/chats')} />
```

### RegisterForm
Formulario de registro con validación de email y contraseña.

```jsx
<RegisterForm onSuccess={() => navigate('/login')} />
```