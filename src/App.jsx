import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Sidebar from './components/Sidebar';
import ChatPage from './pages/ChatPage';
import SettingsPage from './pages/SettingsPage';
import StatusPage from './pages/StatusPage';
import ComingSoonPage from './pages/ComingSoonPage';
import ArchivedChatsPage from './pages/ArchivedChatsPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import './App.css';
import ErrorBoundary from './components/ErrorBoundary';

function AppContent() {
  const location = useLocation();
  const { user } = useAuth();
  
  // Páginas donde NO se debe mostrar la Sidebar
  const authPages = ['/login', '/signup', '/forgot-password', '/reset-password'];
  const showSidebar = !authPages.some(p => location.pathname.startsWith(p)) && user;

  return (
    <div className="App">
      {showSidebar && <Sidebar />}
      <div className={`content ${!showSidebar ? 'fullWidth' : ''}`}>
        <Routes>
          {/* Ruta principal - redirige a chats si está autenticado, sino a login */}
          <Route path="/" element={user ? <Navigate to="/chats" replace /> : <Navigate to="/login" replace />} />

          {/* Página principal de chats - sin selección */}
          <Route path="/chats" element={<ChatPage />} />

          {/* Chat específico con parámetro ID */}
          <Route path="/chat/:chatId" element={<ChatPage />} />

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
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

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
      <SocketProvider>
        <AppProvider>
          <Router>
            <ErrorBoundary>
              <AppContent />
            </ErrorBoundary>
          </Router>
        </AppProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
