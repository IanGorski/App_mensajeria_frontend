import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import ChatPage from './pages/ChatPage';
import ConversationPage from './pages/ConversationPage';
import SettingsPage from './pages/SettingsPage';
import StatusPage from './pages/StatusPage';
import ComingSoonPage from './pages/ComingSoonPage';
import ArchivedChatsPage from './pages/ArchivedChatsPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import './App.css';

function AppContent() {
  const location = useLocation();
  const { user } = useAuth();
  
  // Páginas donde NO se debe mostrar la Sidebar
  const authPages = ['/login', '/signup'];
  const showSidebar = !authPages.includes(location.pathname) && user;

  return (
    <div className="App">
      {showSidebar && <Sidebar />}
      <div className={`content ${!showSidebar ? 'fullWidth' : ''}`}>
        <Routes>
          {/* Ruta principal - redirige a chats si está autenticado, sino a login */}
          <Route path="/" element={user ? <Navigate to="/chats" replace /> : <Navigate to="/login" replace />} />

          {/* Página principal de chats */}
          <Route path="/chats" element={<ChatPage />} />

          {/* Chat específico con parámetro ID */}
          <Route path="/chat/:id" element={<ConversationPage />} />

          {/* Página de estados */}
          <Route path="/status" element={<StatusPage />} />

          {/* Página de configuración */}
          <Route path="/settings" element={<SettingsPage />} />

          {/* Páginas "Coming Soon" */}
          <Route 
            path="/calls" 
            element={<ComingSoonPage title="Llamadas" emoji="📞" />} 
          />
          <Route 
            path="/starred" 
            element={<ComingSoonPage title="Mensajes Destacados" emoji="⭐" />} 
          />
          <Route 
            path="/archived" 
            element={<ArchivedChatsPage />} 
          />
          <Route 
            path="/profile" 
            element={<ComingSoonPage title="Perfil" emoji="👤" />} 
          />

          {/* Rutas para Login y Sign Up */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* Ruta para manejar URLs no encontradas */}
          <Route path="*" element={<Navigate to="/chats" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <AppContent />
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
