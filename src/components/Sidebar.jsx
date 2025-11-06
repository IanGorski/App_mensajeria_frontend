import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import AddContactModal from "./AddContactModal";
import styles from "./Sidebar.module.css";
import ChatIcon from '@mui/icons-material/Chat';
import BarChartIcon from '@mui/icons-material/BarChart';
import CallIcon from '@mui/icons-material/Call';
import StarIcon from '@mui/icons-material/Star';
import ArchiveIcon from '@mui/icons-material/Archive';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import logger from '../utils/logger';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { handleDeselectContact, fetchConversations } = useAppContext();
  const { logout } = useAuth();

  const handleContactAdded = async (chat) => {
  logger.debug('Contacto agregado, chat creado:', chat);
    setShowAddContact(false);
    // Recargar la lista de chats
    await fetchConversations();
    // Navegar al nuevo chat
    if (chat?.id) {
      navigate(`/chat/${chat.id}`);
    }
  };

  const handleMenuClick = (path) => {
    // Si es el icono de chats, deseleccionar el chat activo
    if (path === "/chats") {
      handleDeselectContact();
    }
    navigate(path);
  };

  const isActive = (path) => {
    // Para chats, considerar activo tanto /chats como /chat/:id
    if (path === "/chats" || path === "/") {
      return location.pathname === "/chats" || location.pathname.startsWith("/chat/");
    }
    return location.pathname === path;
  };

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`${styles.sidebar} ${isExpanded ? styles.expanded : ""}`}>
      {/* Menú hamburguesa */}
      <button
        className={styles.hamburgerBtn}
        onClick={toggleSidebar}
        title="Abrir navegación"
      >
        <div className={styles.hamburgerIcon}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      {/* Chats (con indicador verde) */}
      <button
        className={`${styles.menuItem} ${
          isActive("/chats") ? styles.active : ""
        }`}
        onClick={() => handleMenuClick("/chats")}
        title="Chats"
      >
        <span className={styles.menuIcon}>
          <ChatIcon sx={{ fontSize: 24 }} />
        </span>
        {isExpanded && <span className={styles.menuLabel}>Chats</span>}
      </button>

      {/* Nuevo Chat - Botón para agregar contactos */}
      <button
        className={`${styles.menuItem} ${styles.newChatBtn}`}
        onClick={() => setShowAddContact(true)}
        title="Nuevo Chat"
      >
        <span className={styles.menuIcon}>
          <AddIcon sx={{ fontSize: 24 }} />
        </span>
        {isExpanded && <span className={styles.menuLabel}>Nuevo Chat</span>}
      </button>

      {/* Estados */}
      <button
        className={`${styles.menuItem} ${
          isActive("/status") ? styles.active : ""
        }`}
        onClick={() => handleMenuClick("/status")}
        title="Estados"
      >
        <span className={styles.menuIcon}>
          <BarChartIcon sx={{ fontSize: 24 }} />
        </span>
        {isExpanded && <span className={styles.menuLabel}>Estados</span>}
      </button>

      {/* Llamadas */}
      <button
        className={`${styles.menuItem} ${
          isActive("/calls") ? styles.active : ""
        }`}
        onClick={() => handleMenuClick("/calls")}
        title="Llamadas"
      >
        <span className={styles.menuIcon}>
          <CallIcon sx={{ fontSize: 24 }} />
        </span>
        {isExpanded && <span className={styles.menuLabel}>Llamadas</span>}
      </button>

      {/* Espaciador para empujar los siguientes elementos al bottom */}
      <div className={styles.bottomSpacer}></div>

      {/* Mensajes destacados */}
      <button
        className={`${styles.menuItem} ${
          isActive("/starred") ? styles.active : ""
        }`}
        onClick={() => handleMenuClick("/starred")}
        title="Mensajes destacados"
      >
        <span className={styles.menuIcon}>
          <StarIcon sx={{ fontSize: 24 }} />
        </span>
        {isExpanded && <span className={styles.menuLabel}>Destacados</span>}
      </button>

      {/* Archivados */}
      <button
        className={`${styles.menuItem} ${
          isActive("/archived") ? styles.active : ""
        }`}
        onClick={() => handleMenuClick("/archived")}
        title="Archivar Chats"
      >
        <span className={styles.menuIcon}>
          <ArchiveIcon sx={{ fontSize: 24 }} />
        </span>
        {isExpanded && <span className={styles.menuLabel}>Archivar Chats</span>}
      </button>

      {/* Configuración */}
      <button
        className={`${styles.menuItem} ${
          isActive("/settings") ? styles.active : ""
        }`}
        onClick={() => handleMenuClick("/settings")}
        title="Ajustes"
      >
        <span className={styles.menuIcon}>
          <SettingsIcon sx={{ fontSize: 24 }} />
        </span>
        {isExpanded && <span className={styles.menuLabel}>Ajustes</span>}
      </button>

      {/* Perfil */}
      <button
        className={`${styles.menuItem} ${
          isActive("/profile") ? styles.active : ""
        }`}
        onClick={() => handleMenuClick("/profile")}
        title="Perfil"
      >
        <span className={styles.menuIcon}>
          <PersonIcon sx={{ fontSize: 24 }} />
        </span>
        {isExpanded && <span className={styles.menuLabel}>Perfil</span>}
      </button>

      {/* Cerrar Sesión */}
      <button
        className={`${styles.menuItem} ${styles.logoutBtn}`}
        onClick={handleLogout}
        title="Cerrar Sesión"
      >
        <span className={styles.menuIcon}>
          <LogoutIcon sx={{ fontSize: 24 }} />
        </span>
        {isExpanded && <span className={styles.menuLabel}>Cerrar Sesión</span>}
      </button>

      {/* Modal para agregar contactos */}
      <AddContactModal
        isOpen={showAddContact}
        onClose={() => setShowAddContact(false)}
        onContactAdded={handleContactAdded}
      />
    </div>
  );
};

export default Sidebar;
