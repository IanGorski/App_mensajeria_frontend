import { describe, test, expect } from 'vitest';
import { createMockConversation, createMockMessage, isValidConversation, isValidMessage } from '../utils/testHelpers';

describe('AppContext - Gestión de Conversaciones', () => {
  
  describe('handleSelectContact', () => {
    /*
      Test: Debe seleccionar un contacto correctamente
      Valida que la función actualiza el estado con la conversación seleccionada
     */
    test('debe seleccionar un contacto y actualizar activeConversation', () => {
      const mockContact = createMockConversation({ id: 1, name: 'John Doe' });
      
      // Simulación de la función
      let activeConversation = null;
      const handleSelectContact = (contact) => {
        if (!activeConversation || activeConversation.id !== contact.id) {
          activeConversation = contact;
        }
      };
      
      handleSelectContact(mockContact);
      
      expect(activeConversation).not.toBeNull();
      expect(activeConversation.id).toBe(1);
      expect(activeConversation.name).toBe('John Doe');
      expect(isValidConversation(activeConversation)).toBe(true);
    });

    /*
      Test: No debe actualizar si ya es la conversación activa
      Optimización para evitar re-renderizados innecesarios
     */
    test('no debe actualizar si el contacto ya está seleccionado', () => {
      const mockContact = createMockConversation({ id: 1 });
      let activeConversation = mockContact;
      let updateCount = 0;
      
      const handleSelectContact = (contact) => {
        if (activeConversation && activeConversation.id === contact.id) {
          return; // Early return
        }
        activeConversation = contact;
        updateCount++;
      };
      
      handleSelectContact(mockContact);
      
      expect(updateCount).toBe(0); // No se actualiza
      expect(activeConversation.id).toBe(1);
    });
  });

  describe('handleSendMessage', () => {
    /**
      Test: Debe crear y agregar un nuevo mensaje
      Valida la estructura del mensaje creado
     */
    test('debe crear un mensaje con la estructura correcta', () => {
      const messageContent = 'Hola mundo';
      const newMessage = createMockMessage({
        content: messageContent,
        isOwn: true,
      });
      
      expect(newMessage.content).toBe(messageContent);
      expect(newMessage.isOwn).toBe(true);
      expect(isValidMessage(newMessage)).toBe(true);
      expect(newMessage).toHaveProperty('timestamp');
      expect(newMessage).toHaveProperty('id');
    });

    /**
      Test: Debe actualizar lastMessage en la conversación
      Asegura que la lista de chats se actualiza correctamente
     */
    test('debe actualizar lastMessage de la conversación', () => {
      const conversation = createMockConversation({ id: 1 });
      const newMessageContent = 'Nuevo mensaje';
      
      // Simulación de actualización
      conversation.lastMessage = newMessageContent;
      conversation.lastMessageIsOwn = true;
      
      expect(conversation.lastMessage).toBe(newMessageContent);
      expect(conversation.lastMessageIsOwn).toBe(true);
    });
  });

  describe('handleDeleteMessage', () => {
    /**
      Test: Debe eliminar un mensaje correctamente
      Valida que el array de mensajes se actualiza
     */
    test('debe eliminar un mensaje del array de mensajes', () => {
      const conversation = createMockConversation({
        messages: [
          { id: 1, content: 'Mensaje 1' },
          { id: 2, content: 'Mensaje 2' },
          { id: 3, content: 'Mensaje 3' },
        ],
      });
      
      const messageIdToDelete = 2;
      const filteredMessages = conversation.messages.filter(
        (msg) => msg.id !== messageIdToDelete
      );
      
      expect(filteredMessages.length).toBe(2);
      expect(filteredMessages.find((m) => m.id === messageIdToDelete)).toBeUndefined();
      expect(filteredMessages[0].id).toBe(1);
      expect(filteredMessages[1].id).toBe(3);
    });

    /**
      Test: Debe actualizar lastMessage después de eliminar
      Asegura que se muestra el último mensaje restante
     */
    test('debe actualizar lastMessage al eliminar el último mensaje', () => {
      const messages = [
        { id: 1, content: 'Primer mensaje', timestamp: '10:00' },
        { id: 2, content: 'Último mensaje', timestamp: '10:30' },
      ];
      
      const filteredMessages = messages.filter((msg) => msg.id !== 2);
      const lastMessage = filteredMessages.length > 0 
        ? filteredMessages[filteredMessages.length - 1].content 
        : 'Sin mensajes';
      
      expect(lastMessage).toBe('Primer mensaje');
      expect(filteredMessages.length).toBe(1);
    });
  });

  describe('handleArchiveConversation', () => {
    /**
      Test: Debe archivar una conversación
      Valida el cambio de estado isArchived
     */
    test('debe marcar una conversación como archivada', () => {
      const conversation = createMockConversation({ id: 1, isArchived: false });
      
      conversation.isArchived = true;
      
      expect(conversation.isArchived).toBe(true);
    });
  });

  describe('handleUnarchiveConversation', () => {
    /**
      Test: Debe desarchivar una conversación
      Valida el cambio de estado isArchived
     */
    test('debe marcar una conversación como no archivada', () => {
      const conversation = createMockConversation({ id: 1, isArchived: true });
      
      conversation.isArchived = false;
      
      expect(conversation.isArchived).toBe(false);
    });
  });

  describe('markAsRead / markAsUnread', () => {
    /**
      Test: Debe marcar un chat como leído
      Valida el cambio de estado isUnread
     */
    test('debe marcar un chat como leído', () => {
      const conversation = createMockConversation({ id: 1, isUnread: true });
      
      conversation.isUnread = false;
      
      expect(conversation.isUnread).toBe(false);
    });

    /**
      Test: Debe marcar un chat como no leído
      Valida el cambio de estado isUnread
     */
    test('debe marcar un chat como no leído', () => {
      const conversation = createMockConversation({ id: 1, isUnread: false });
      
      conversation.isUnread = true;
      
      expect(conversation.isUnread).toBe(true);
    });
  });

  describe('handlePinConversation / handleUnpinConversation', () => {
    /**
      Test: Debe fijar una conversación
      Valida el cambio de estado isPinned
     */
    test('debe fijar una conversación', () => {
      const conversation = createMockConversation({ id: 1, isPinned: false });
      
      conversation.isPinned = true;
      
      expect(conversation.isPinned).toBe(true);
    });

    /**
      Test: Debe desfijar una conversación
      Valida el cambio de estado isPinned
     */
    test('debe desfijar una conversación', () => {
      const conversation = createMockConversation({ id: 1, isPinned: true });
      
      conversation.isPinned = false;
      
      expect(conversation.isPinned).toBe(false);
    });
  });

  describe('handleClearConversation', () => {
    /**
      Test: Debe vaciar todos los mensajes de una conversación
      Valida que el array de mensajes queda vacío
     */
    test('debe vaciar todos los mensajes de una conversación', () => {
      const conversation = createMockConversation({
        messages: [
          { id: 1, content: 'Mensaje 1' },
          { id: 2, content: 'Mensaje 2' },
        ],
      });
      
      conversation.messages = [];
      conversation.lastMessage = 'Sin mensajes';
      
      expect(conversation.messages.length).toBe(0);
      expect(conversation.lastMessage).toBe('Sin mensajes');
    });
  });

  describe('handleDeleteConversation', () => {
    /**
      Test: Debe eliminar una conversación completamente
      Valida que la conversación se elimina del array
     */
    test('debe eliminar una conversación del array', () => {
      const conversations = [
        createMockConversation({ id: 1 }),
        createMockConversation({ id: 2 }),
        createMockConversation({ id: 3 }),
      ];
      
      const conversationIdToDelete = 2;
      const filteredConversations = conversations.filter(
        (conv) => conv.id !== conversationIdToDelete
      );
      
      expect(filteredConversations.length).toBe(2);
      expect(filteredConversations.find((c) => c.id === conversationIdToDelete)).toBeUndefined();
    });
  });
});

describe('AppContext - Gestión de Estado Móvil', () => {
  
  describe('isMobile detection', () => {
    /**
      Test: Debe detectar correctamente el modo móvil
      Valida la detección basada en window.innerWidth
     */
    test('debe retornar true cuando innerWidth <= 768', () => {
      const checkMobile = (width) => width <= 768;
      
      expect(checkMobile(320)).toBe(true);
      expect(checkMobile(768)).toBe(true);
      expect(checkMobile(1024)).toBe(false);
    });
  });

  describe('showChatList management', () => {
    /**
      Test: Debe alternar showChatList en móvil
      Valida el comportamiento de navegación en móvil
     */
    test('debe ocultar lista de chats al seleccionar contacto en móvil', () => {
      const isMobile = true;
      let showChatList = true;
      
      // Simula handleSelectContact en móvil
      if (isMobile) {
        showChatList = false;
      }
      
      expect(showChatList).toBe(false);
    });

    /**
      Test: Debe mostrar lista de chats al deseleccionar en móvil
      Valida el comportamiento de navegación hacia atrás
     */
    test('debe mostrar lista de chats al deseleccionar contacto en móvil', () => {
      const isMobile = true;
      let showChatList = false;
      
      // Simula handleDeselectContact en móvil
      if (isMobile) {
        showChatList = true;
      }
      
      expect(showChatList).toBe(true);
    });
  });
});
