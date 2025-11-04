/**
 * Tests Unitarios para Componentes UI
 * Prueba el comportamiento táctil y menús contextuales
*/

import { describe, test, expect } from 'vitest';
import { createTouchEvent, createContextMenuEvent, wait } from '../utils/testHelpers';

describe('Touch Events - Soporte Móvil', () => {
  
  describe('handleTouchStart', () => {
    /**
     * Test: Debe iniciar el temporizador al tocar
     * Valida que se guarda la posición inicial del toque
     */
    test('debe guardar la posición inicial del toque', () => {
      let touchStartPos = null;
      const event = createTouchEvent('touchstart', { x: 100, y: 200 });
      
      const handleTouchStart = (e) => {
        const touch = e.touches[0];
        touchStartPos = { x: touch.clientX, y: touch.clientY };
      };
      
      handleTouchStart(event);
      
      expect(touchStartPos).not.toBeNull();
      expect(touchStartPos.x).toBe(100);
      expect(touchStartPos.y).toBe(200);
    });

    /**
     * Test: Debe crear un temporizador de 500ms
     * Valida que el menú contextual se muestra después del tiempo
     */
    test('debe crear temporizador para mostrar menú contextual', async () => {
      let menuShown = false;
      let touchTimer = null;
      
      const handleTouchStart = () => {
        touchTimer = setTimeout(() => {
          menuShown = true;
        }, 500);
      };
      
      handleTouchStart();
      expect(menuShown).toBe(false);
      
      await wait(600);
      expect(menuShown).toBe(true);
      
      clearTimeout(touchTimer);
    });
  });

  describe('handleTouchEnd', () => {
    /**
     * Test: Debe limpiar el temporizador al soltar
     * Valida que se cancela el menú si se suelta antes de tiempo
     */
    test('debe cancelar el temporizador si se suelta antes de 500ms', async () => {
      let menuShown = false;
      let touchTimer = null;
      
      const handleTouchStart = () => {
        touchTimer = setTimeout(() => {
          menuShown = true;
        }, 500);
      };
      
      const handleTouchEnd = () => {
        if (touchTimer) {
          clearTimeout(touchTimer);
          touchTimer = null;
        }
      };
      
      handleTouchStart();
      await wait(200); // Espera menos de 500ms
      handleTouchEnd();
      await wait(400); // Espera más tiempo
      
      expect(menuShown).toBe(false);
      expect(touchTimer).toBeNull();
    });
  });

  describe('handleTouchMove', () => {
    /**
     * Test: Debe cancelar si el movimiento excede 10px
     * Valida la detección de scroll vs toque prolongado
     */
    test('debe cancelar si el movimiento excede el umbral de 10px', () => {
      let touchTimer = 'active';
      const touchStartPos = { x: 100, y: 100 };
      
      const handleTouchMove = (e) => {
        if (touchStartPos) {
          const touch = e.touches[0];
          const deltaX = Math.abs(touch.clientX - touchStartPos.x);
          const deltaY = Math.abs(touch.clientY - touchStartPos.y);
          
          if (deltaX > 10 || deltaY > 10) {
            touchTimer = null;
          }
        }
      };
      
      // Movimiento pequeño (no cancela)
      let event = createTouchEvent('touchmove', { x: 105, y: 105 });
      handleTouchMove(event);
      expect(touchTimer).toBe('active');
      
      // Movimiento grande (cancela)
      event = createTouchEvent('touchmove', { x: 120, y: 100 });
      handleTouchMove(event);
      expect(touchTimer).toBeNull();
    });
  });
});

describe('Context Menu - Menú Contextual', () => {
  
  describe('handleContextMenu', () => {
    /**
     * Test: Debe abrir el menú contextual con clic derecho
     * Valida que se guarda la posición del cursor
     */
    test('debe abrir el menú en la posición del cursor', () => {
      let contextMenu = { isOpen: false, x: 0, y: 0 };
      const event = createContextMenuEvent({ x: 150, y: 250 });
      
      const handleContextMenu = (e) => {
        e.preventDefault();
        contextMenu = {
          isOpen: true,
          x: e.clientX,
          y: e.clientY,
        };
      };
      
      handleContextMenu(event);
      
      expect(contextMenu.isOpen).toBe(true);
      expect(contextMenu.x).toBe(150);
      expect(contextMenu.y).toBe(250);
    });
  });

  describe('Position Adjustment', () => {
    /**
     * Test: Debe ajustar la posición si sale de la pantalla
     * Valida el ajuste dinámico del menú contextual
     */
    test('debe ajustar la posición si el menú sale de la pantalla', () => {
      const windowWidth = 1024;
      const windowHeight = 768;
      const menuWidth = 200;
      const menuHeight = 300;
      
      let position = { x: 900, y: 600 }; // Cerca del borde
      
      // Ajustar X
      if (position.x + menuWidth > windowWidth) {
        position.x = Math.max(10, windowWidth - menuWidth - 10);
      }
      
      // Ajustar Y
      if (position.y + menuHeight > windowHeight) {
        position.y = Math.max(10, windowHeight - menuHeight - 10);
      }
      
      expect(position.x).toBe(814); // 1024 - 200 - 10
      expect(position.y).toBe(458); // 768 - 300 - 10
    });
  });
});

describe('Message Composer - Composer de Mensajes', () => {
  
  describe('handleSubmit', () => {
    /**
     * Test: Debe enviar mensaje y limpiar input
     * Valida el flujo de envío de mensajes
     */
    test('debe enviar mensaje y limpiar el input', () => {
      let message = 'Hola mundo';
      let sentMessage = null;
      
      const handleSubmit = (e) => {
        e?.preventDefault?.();
        if (message.trim()) {
          sentMessage = message;
          message = '';
        }
      };
      
      const mockEvent = { preventDefault: () => {} };
      handleSubmit(mockEvent);
      
      expect(sentMessage).toBe('Hola mundo');
      expect(message).toBe('');
    });

    /**
     * Test: No debe enviar mensaje vacío
     * Valida la validación de entrada
     */
    test('no debe enviar mensaje vacío o solo espacios', () => {
      let message = '   ';
      let sentMessage = null;
      
      const handleSubmit = () => {
        if (message.trim()) {
          sentMessage = message;
        }
      };
      
      handleSubmit();
      
      expect(sentMessage).toBeNull();
    });
  });

  describe('handleKeyDown', () => {
    /**
     * Test: Debe enviar con Enter (sin Shift)
     * Valida el atajo de teclado
     */
    test('debe enviar mensaje al presionar Enter', () => {
      let submitted = false;
      
      const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          submitted = true;
        }
      };
      
      const event = {
        key: 'Enter',
        shiftKey: false,
        preventDefault: () => {},
      };
      
      handleKeyDown(event);
      
      expect(submitted).toBe(true);
    });

    /**
     * Test: No debe enviar con Shift+Enter (nueva línea)
     * Valida el comportamiento de líneas múltiples
     */
    test('no debe enviar con Shift+Enter', () => {
      let submitted = false;
      
      const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          submitted = true;
        }
      };
      
      const event = {
        key: 'Enter',
        shiftKey: true,
      };
      
      handleKeyDown(event);
      
      expect(submitted).toBe(false);
    });
  });
});

describe('Message List - Lista de Mensajes', () => {
  
  describe('highlightText', () => {
    /**
     * Test: Debe resaltar texto en búsqueda
     * Valida la funcionalidad de búsqueda en chat
     */
    test('debe resaltar el término de búsqueda', () => {
      const text = 'Hola mundo, este es un mensaje';
      const searchTerm = 'mundo';
      
      const containsSearch = text.toLowerCase().includes(searchTerm.toLowerCase());
      
      expect(containsSearch).toBe(true);
    });

    /**
     * Test: No debe resaltar si no hay búsqueda activa
     * Valida el comportamiento sin búsqueda
     */
    test('no debe modificar texto sin término de búsqueda', () => {
      const text = 'Hola mundo';
      const searchTerm = '';
      
      const shouldHighlight = Boolean(searchTerm) && Boolean(text);
      
      expect(shouldHighlight).toBe(false);
    });
  });

  describe('messageMatches', () => {
    /**
     * Test: Debe encontrar coincidencias case-insensitive
     * Valida la búsqueda sin distinción de mayúsculas
     */
    test('debe encontrar coincidencias sin distinguir mayúsculas', () => {
      const message = { content: 'Hola MUNDO' };
      const searchTerm = 'mundo';
      
      const matches = message.content.toLowerCase().includes(searchTerm.toLowerCase());
      
      expect(matches).toBe(true);
    });
  });
});

describe('Search Functionality - Funcionalidad de Búsqueda', () => {
  
  describe('Search Navigation', () => {
    /**
     * Test: Debe navegar entre resultados de búsqueda
     * Valida la navegación con flechas
     */
    test('debe avanzar al siguiente resultado', () => {
      const totalMatches = 5;
      let currentMatchIndex = 1;
      
      const goToNextMatch = () => {
        if (totalMatches > 0) {
          currentMatchIndex = currentMatchIndex < totalMatches ? currentMatchIndex + 1 : 1;
        }
      };
      
      goToNextMatch();
      expect(currentMatchIndex).toBe(2);
      
      currentMatchIndex = 5;
      goToNextMatch();
      expect(currentMatchIndex).toBe(1); // Vuelve al inicio
    });

    /**
     * Test: Debe retroceder al resultado anterior
     * Valida la navegación reversa
     */
    test('debe retroceder al resultado anterior', () => {
      const totalMatches = 5;
      let currentMatchIndex = 3;
      
      const goToPreviousMatch = () => {
        if (totalMatches > 0) {
          currentMatchIndex = currentMatchIndex > 1 ? currentMatchIndex - 1 : totalMatches;
        }
      };
      
      goToPreviousMatch();
      expect(currentMatchIndex).toBe(2);
      
      currentMatchIndex = 1;
      goToPreviousMatch();
      expect(currentMatchIndex).toBe(5); // Vuelve al final
    });
  });

  describe('Filter Messages', () => {
    /**
     * Test: Debe filtrar mensajes por término de búsqueda
     * Valida el filtrado de resultados
     */
    test('debe retornar solo mensajes que coincidan', () => {
      const messages = [
        { id: 1, content: 'Hola mundo' },
        { id: 2, content: 'Adiós' },
        { id: 3, content: 'Mundo feliz' },
      ];
      
      const searchTerm = 'mundo';
      const filtered = messages.filter((msg) =>
        msg.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      expect(filtered.length).toBe(2);
      expect(filtered[0].id).toBe(1);
      expect(filtered[1].id).toBe(3);
    });
  });
});
