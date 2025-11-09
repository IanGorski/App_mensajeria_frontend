import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  MessageCircle, 
  BarChart3, 
  Phone, 
  Star, 
  Archive, 
  Settings, 
  User, 
  LogOut, 
  Plus,
  Menu,
  X
} from 'lucide-react';
import { useAppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import AddContactModal from "./AddContactModal";
import styles from "./Sidebar.module.css";
import logger from '../utils/logger';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { handleDeselectContact, fetchConversations, conversations } = useAppContext();
  const { logout } = useAuth();

  // Calcular mensajes no leídos
  const unreadCount = conversations?.filter(conv => conv.isUnread)?.length || 0;

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
      {/* Logo y toggle */}
      <div className={styles.sidebarHeader}>
        <button
          className={styles.hamburgerBtn}
          onClick={toggleSidebar}
          title={isExpanded ? "Contraer menú" : "Expandir menú"}
        >
          {isExpanded ? <X size={24} /> : <Menu size={24} />}
        </button>
        {isExpanded && (
          <div className={styles.logo}>
            <MessageCircle size={28} />
            <span>ChatApp</span>
          </div>
        )}
      </div>

      {/* Navegación principal */}
      <nav className={styles.mainNav}>
        <button
          className={`${styles.menuItem} ${
            isActive("/chats") ? styles.active : ""
          }`}
          onClick={() => handleMenuClick("/chats")}
          title="Chats"
        >
          <span className={styles.menuIcon}>
            <MessageCircle size={24} />
          </span>
          {isExpanded && <span className={styles.menuLabel}>Chats</span>}
          {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
        </button>

        <button
          className={`${styles.menuItem} ${styles.newChatBtn}`}
          onClick={() => setShowAddContact(true)}
          title="Nuevo Chat"
        >
          <span className={styles.menuIcon}>
            <Plus size={24} />
          </span>
          {isExpanded && <span className={styles.menuLabel}>Nuevo Chat</span>}
        </button>

        <button
          className={`${styles.menuItem} ${
            isActive("/status") ? styles.active : ""
          }`}
          onClick={() => handleMenuClick("/status")}
          title="Estados"
        >
          <span className={styles.menuIcon}>
            <BarChart3 size={24} />
          </span>
          {isExpanded && <span className={styles.menuLabel}>Estados</span>}
        </button>

        <button
          className={`${styles.menuItem} ${
            isActive("/calls") ? styles.active : ""
          }`}
          onClick={() => handleMenuClick("/calls")}
          title="Llamadas"
        >
          <span className={styles.menuIcon}>
            <Phone size={24} />
          </span>
          {isExpanded && <span className={styles.menuLabel}>Llamadas</span>}
        </button>
      </nav>

      {/* Espaciador */}
      <div className={styles.bottomSpacer}></div>

      {/* Navegación inferior */}
      <nav className={styles.bottomNav}>
        <button
          className={`${styles.menuItem} ${
            isActive("/starred") ? styles.active : ""
          }`}
          onClick={() => handleMenuClick("/starred")}
          title="Mensajes destacados"
        >
          <span className={styles.menuIcon}>
            <Star size={24} />
          </span>
          {isExpanded && <span className={styles.menuLabel}>Destacados</span>}
        </button>

        <button
          className={`${styles.menuItem} ${
            isActive("/archived") ? styles.active : ""
          }`}
          onClick={() => handleMenuClick("/archived")}
          title="Archivar Chats"
        >
          <span className={styles.menuIcon}>
            <Archive size={24} />
          </span>
          {isExpanded && <span className={styles.menuLabel}>Archivados</span>}
        </button>

        <button
          className={`${styles.menuItem} ${
            isActive("/settings") ? styles.active : ""
          }`}
          onClick={() => handleMenuClick("/settings")}
          title="Ajustes"
        >
          <span className={styles.menuIcon}>
            <Settings size={24} />
          </span>
          {isExpanded && <span className={styles.menuLabel}>Ajustes</span>}
        </button>

        <button
          className={`${styles.menuItem} ${
            isActive("/profile") ? styles.active : ""
          }`}
          onClick={() => handleMenuClick("/profile")}
          title="Perfil"
        >
          <span className={styles.menuIcon}>
            <User size={24} />
          </span>
          {isExpanded && <span className={styles.menuLabel}>Perfil</span>}
        </button>

        <button
          className={`${styles.menuItem} ${styles.logoutBtn}`}
          onClick={handleLogout}
          title="Cerrar Sesión"
        >
          <span className={styles.menuIcon}>
            <LogOut size={24} />
          </span>
          {isExpanded && <span className={styles.menuLabel}>Cerrar Sesión</span>}
        </button>
      </nav>

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
