// Utilidades para normalizar conversaciones y participantes

const getId = (obj) => {
    if (!obj) return undefined;
    if (typeof obj === 'string') return obj;
    return (
        obj._id?.toString?.() ||
        obj.id?.toString?.() ||
        obj.userId?.toString?.() ||
        obj.user?._id?.toString?.() ||
        obj.user?.id?.toString?.()
    );
};

const normalizeParticipant = (p) => {
    if (!p) return null;
    if (typeof p === 'string') return { id: p };
    const id = getId(p);
    const base = p.user || p;
    return {
        id,
        name: base.name || base.fullName || base.displayName || base.email || 'Usuario',
        avatar: base.avatar || base.photo || base.picture || undefined,
    };
};

const getParticipants = (conv) => {
    const raw = (
        conv?.participants || conv?.users || conv?.members || conv?.members?.users || []
    );
    return Array.isArray(raw) ? raw.map(normalizeParticipant).filter(Boolean) : [];
};

const getOtherUser = (conv, selfId) => {
    const participants = getParticipants(conv);
    const candidates = [];
    // Añadir participantes distintos a self
    for (const p of participants) {
        if (p?.id && (!selfId || p.id !== selfId)) candidates.push(p);
    }
    // Añadir fuentes alternativas (otherUser, partner, partner.user)
    const alt1 = normalizeParticipant(conv?.otherUser);
    const alt2 = normalizeParticipant(conv?.partner);
    const alt3 = normalizeParticipant(conv?.partner?.user);
    [alt1, alt2, alt3].forEach(c => { if (c && (!selfId || c.id !== selfId)) candidates.push(c); });

    // Elegir el candidato con más información (nombre/avatar)
    const scored = candidates.map(c => ({
        c,
        score: (c.name ? 1 : 0) + (c.avatar ? 1 : 0)
    }));
    scored.sort((a, b) => b.score - a.score);
    return (scored[0]?.c) || null;
};

export const normalizeConversation = (conv, selfId) => {
    const chatId = conv.id || conv._id || conv.chat_id || conv.chatId;
    const isGroup = Boolean(conv.isGroup || conv.type === 'group');
    const otherUser = isGroup ? null : getOtherUser(conv, selfId);

    const name = isGroup
        ? (conv.groupName || conv.name || 'Grupo')
        : (otherUser?.name || conv.name || 'Conversación');

    const avatar = isGroup
        ? (conv.groupAvatar || conv.avatar)
        : (otherUser?.avatar || conv.avatar);

    const otherUserId = isGroup ? undefined : (otherUser?.id || conv.otherUserId);

    const lastMsg = conv.lastMessage || conv.last_message || conv.preview || '';
    const lastTime = conv.lastMessageAt || conv.updated_at || conv.lastTime || conv.time;
    const lastTs = lastTime ? new Date(lastTime).getTime() : undefined;

    return {
        ...conv,
        id: chatId?.toString?.() || chatId,
        name,
        avatar,
        otherUserId,
        isGroup,
        participants: getParticipants(conv),
        lastMessage: lastMsg || '',
        time: lastTime || conv.time,
        lastMessageTimestamp: lastTs || conv.lastMessageTimestamp,
    };
};

export const normalizeConversations = (user, conversations) => {
    const selfId = (user?._id ?? user?.id)?.toString?.();
    return (conversations || []).map((c) => normalizeConversation(c, selfId));
};

export default {
    normalizeConversation,
    normalizeConversations,
};
