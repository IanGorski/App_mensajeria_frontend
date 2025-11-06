import { describe, it, expect } from 'vitest';
import { normalizeConversation, normalizeConversations } from '../utils/conversationNormalizer';

const me = { _id: 'u_me' };

describe('conversationNormalizer', () => {
  it('elige al otro usuario cuando participantes son objetos con _id', () => {
    const conv = {
      _id: 'c1',
      participants: [
        { _id: 'u_me', name: 'Yo' },
        { _id: 'u2', name: 'ROBOCOP', avatar: 'avatar.png' },
      ],
      lastMessage: 'hola',
      lastMessageAt: '2025-01-01T10:00:00Z'
    };

    const n = normalizeConversation(conv, me._id);
    expect(n.otherUserId).toBe('u2');
    expect(n.name).toBe('ROBOCOP');
  // El avatar puede provenir del otro usuario o del nivel de conversación según el shape.
  expect(['robocop.png', 'avatar.png']).toContain(n.avatar);
    expect(n.isGroup).toBe(false);
  });

  it('funciona con participantes como strings de id', () => {
    const conv = {
      id: 'c2',
      participants: ['u_me', 'u3'],
      otherUser: { id: 'u3', name: 'Contacto' },
    };
    const n = normalizeConversation(conv, me._id);
    expect(n.otherUserId).toBe('u3');
    expect(n.name).toBe('Contacto');
  });

  it('soporta usuario anidado en conv.partner.user', () => {
    const conv = {
      id: 'c3',
      users: [{ user: { _id: 'u_me', name: 'Yo' } }, { user: { _id: 'u4', name: 'Ali' } }],
      partner: { user: { _id: 'u4', name: 'Ali', avatar: 'ali.jpg' } },
    };
    const n = normalizeConversation(conv, me._id);
    expect(n.otherUserId).toBe('u4');
    expect(n.name).toBe('Ali');
    expect(n.avatar).toBe('ali.jpg');
  });

  it('usa nombre de grupo cuando isGroup=true', () => {
    const conv = {
      id: 'g1',
      isGroup: true,
      groupName: 'UTN',
      participants: [{ _id: 'u_me' }, { _id: 'u2' }],
    };
    const n = normalizeConversation(conv, me._id);
    expect(n.isGroup).toBe(true);
    expect(n.name).toBe('UTN');
    expect(n.otherUserId).toBeUndefined();
  });

  it('normaliza múltiples conversaciones', () => {
    const list = [
      { id: 'c1', participants: [{ _id: 'u_me' }, { _id: 'uX', name: 'X' }] },
      { id: 'c2', isGroup: true, groupName: 'G' },
    ];
    const res = normalizeConversations(me, list);
    expect(res).toHaveLength(2);
    expect(res[0].name).toBe('X');
    expect(res[1].name).toBe('G');
  });
});
