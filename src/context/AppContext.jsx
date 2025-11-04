import { createContext, useContext, useState, useEffect } from "react";
import apiService from "../services/api.service";
import { useAuth } from "./AuthContext";

export const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);

    useEffect(() => {
        if (user) {
            fetchConversations();
        }
    }, [user]);

    const fetchConversations = async () => {
        try {
            const response = await apiService.request("/chats");
            setConversations(response.data);
        } catch (error) {
            console.error("Error al cargar chats:", error);
        }
    };

    const handleSelectContact = (contact) => {
        setSelectedContact(contact);
    };

    const handleDeselectContact = () => {
        setSelectedContact(null);
    };

    return (
        <AppContext.Provider value={{ 
            conversations, 
            selectedContact,
            handleSelectContact,
            handleDeselectContact
        }}>
            {children}
        </AppContext.Provider>
    );
};
