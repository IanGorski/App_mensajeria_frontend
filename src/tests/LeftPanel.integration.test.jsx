import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import LeftPanel from '../panels/LeftPanel';

// Mockear hook de estado de usuario para evitar dependencias de SocketContext
vi.mock('../hooks/useUserStatus', () => ({
  useUserStatus: () => ({
    isUserOnline: () => false,
    getUserStatus: () => ({ online: false, last_connection: null }),
    requestStatusSync: () => {},
  }),
}));

// Mock conversations data
const mockConversations = [
  {
    id: '1',
    name: 'Ian',
    lastMessage: 'Hola!',
    lastMessageTimestamp: Date.now(),
    isPinned: false,
    isGroup: false,
    otherUserId: 'user1',
    online: true,
  },
  {
    id: '2',
    name: 'Ali',
    lastMessage: 'Hola hola?',
    lastMessageTimestamp: Date.now() - 10000,
    isPinned: true,
    isGroup: false,
    otherUserId: 'user2',
    online: false,
  },
];

const mockContextValue = {
  handleSelectContact: vi.fn(),
  isMobile: false,
};

describe('LeftPanel Integration Test', () => {
  it('renders conversations with correct names', () => {
    render(
      <AppContext.Provider value={mockContextValue}>
        <BrowserRouter>
          <LeftPanel conversations={mockConversations} />
        </BrowserRouter>
      </AppContext.Provider>
    );

    // Check if the names are rendered correctly
    expect(screen.getByText('Ian')).toBeInTheDocument();
    expect(screen.getByText('Ali')).toBeInTheDocument();
  });

  it('displays the last message for each conversation', () => {
    render(
      <AppContext.Provider value={mockContextValue}>
        <BrowserRouter>
          <LeftPanel conversations={mockConversations} />
        </BrowserRouter>
      </AppContext.Provider>
    );

    // Check if the last messages are rendered correctly
    expect(screen.getByText('Hola!')).toBeInTheDocument();
    expect(screen.getByText('Hola hola?')).toBeInTheDocument();
  });
});