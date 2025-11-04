import { createContext, useContext } from "react";
import { useAuth } from "./AuthContext";
import socketService from "../services/socket.service";

const SocketContext = createContext();

export const useSocketContext = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocketContext debe ser usado dentro de SocketProvider");
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();

    const socket = user?.token ? socketService.connect(user.token) : null;

    return (
        <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
    );
};
