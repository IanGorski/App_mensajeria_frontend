import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ConversationPanel from '../panels/ConversationPanel';
import { AppContext } from '../context/AppContext';

// Mockear hooks que requieren sockets/efectos
vi.mock('../hooks/useUserStatus', () => ({
    useUserStatus: () => ({
        isUserOnline: () => false,
        getUserStatus: () => ({ online: false, last_connection: null }),
        requestStatusSync: () => { },
    }),
}));

vi.mock('../hooks/useRealtimeMessages', () => ({
    useRealtimeMessages: () => ({
        messages: [],
        setMessages: () => { },
        sendMessage: () => { },
        startTyping: () => { },
        stopTyping: () => { },
        markAsRead: () => { },
    }),
}));

vi.mock('../hooks/useTypingIndicator', () => ({
    useTypingIndicator: () => ({
        isTyping: false,
        typingText: '',
    }),
}));

// Mockear AuthContext hook para evitar provider real
vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({ user: { id: 'me', name: 'Yo' } }),
}));

const renderWithProviders = (ui, { appContextValue } = {}) => {
    const defaultContext = {
        isMobile: false,
        handleDeselectContact: vi.fn(),
    };
    return render(
        <AppContext.Provider value={{ ...defaultContext, ...appContextValue }}>
            <BrowserRouter>{ui}</BrowserRouter>
        </AppContext.Provider>
    );
};

describe('ConversationPanel Integration Test', () => {
    it('muestra el nombre correcto en el header', () => {
        const activeConversation = {
            id: 'chat-1',
            name: 'Contacto Correcto',
            isGroup: false,
            otherUserId: 'user-123',
            messages: [],
        };

        renderWithProviders(<ConversationPanel activeConversation={activeConversation} />);

        expect(screen.getByRole('heading', { name: /Contacto Correcto/i })).toBeInTheDocument();
        // Estado por mock: "desconectado"
        expect(screen.getByText(/desconectado/i)).toBeInTheDocument();
    });
});
