import { Server, type ServerOptions, type Socket } from "socket.io";
import type { H3Event } from "h3";
import type { User } from "~/types/User";
import { userJoin, getRoomUsers, userLeave } from "./users";
const options: Partial<ServerOptions> = {
    path: "/api/socket.io",
    serveClient: false,
};

export const io = new Server(options);

const botName = "Bot";
export function initSocket(event: H3Event) {
    // @ts-ignore
    io.attach(event.node.res.socket?.server);

    io.on("connection", (socket: Socket) => {
        // Join Room
        socket.on("joinRom", (payload: User) => {
            const user = userJoin({ ...payload, id: socket.id });
            socket.join(user.room);

            socket.broadcast
                .to(user.room)
                .emit(
                    "message",
                    formatMessage(
                        botName,
                        `${user.username} has joined the chat`
                    )
                );

            io.to(user.room).emit("roomUsers", {
                room: user.room,
                users: getRoomUsers(user.room),
            });
        });

        // Handle Chat Message
        socket.on("chatMessage", (payload: string) => {
            const user = getCurrentUser(socket.id);
            if (user) {
                io.to(user.room).emit(
                    "message",
                    formatMessage(user.username, payload)
                );
            }
        });

        // Disconnect
        socket.on("disconnect", () => {
            const user = userLeave(socket.id);
            if (user) {
                io.to(user.room).emit(
                    "message",
                    formatMessage(botName, `${user.username} has left the chat`)
                );

                io.to(user.room).emit("roomUsers", {
                    room: user.room,
                    users: getRoomUsers(user.room),
                });
            }
        });
    });
}

export function formatMessage(username: string, text: string) {
    const date = new Date();
    date.setUTCHours(date.getUTCHours() + 7); // Adjust to GMT+7

    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");

    return {
        username,
        text,
        time: `${hours}:${minutes}`,
    };
}
