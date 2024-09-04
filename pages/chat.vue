<script setup lang="ts">
import type { User } from '~/types/User';
import { io, type Socket } from 'socket.io-client'
const route = useRoute();

useHead({
    title: 'Chat App: ' + route.query.username,
})

interface Chat {
    username: string;
    text: string;
    time: string;
    room?: string;
}

const message = ref('');
const chats = ref<Chat[]>([]);
const users = ref<User[]>([]);
const socket = ref<Socket>();
const currentRoom = ref('');
const currentUser = ref('');
const notificationSound = new Audio('/notification.mp3');

const sendMessage = async () => {
    if (!message.value) return;
    socket.value?.emit('chatMessage', message.value);
    await nextTick(() => message.value = '');
};

const scrollToBottom = () => {
    const chatContainer = document.getElementById('chatContainer');
    if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight + 500;
    }
};

onMounted(() => {
    const { username, room } = route.query as Partial<Chat>;
    currentUser.value = username || '';
    if (!username || !room) {
        navigateTo('/');
    }
    socket.value = io({
        path: '/api/socket.io'
    })

    // * Join ChatRoom
    socket.value.emit('joinRom', { username, room })
    socket.value.on('message', (response: Chat) => {
        chats.value.push(response);
        nextTick(() => {
            scrollToBottom();
            if (response.username !== currentUser.value) {
                console.log('Notification Sound', response);
                notificationSound.play();
            }
        });
    });
    socket.value.on('roomUsers', (response: { room: string, users: User[] }) => {
        currentRoom.value = response.room
        users.value = response.users
    })
});

onBeforeUnmount(() => {
    socket.value?.disconnect();
})

</script>

<template>
    <div class="mx-2 md:mx-32">
        <UCard class="">
            <template #header>
                <div class="flex items-center justify-between text-primary">
                    <div class="flex items-center gap-x-2">
                        <UIcon
                               name="i-heroicons-chat-bubble-left-right"
                               class="w-6 h-6 font-semibold" />
                        <div class="text-xl font-semibold text-center text-primary">Chat App</div>
                    </div>
                    <UButton
                             @click="() => navigateTo('/')"
                             class="px-3 py-1.5 cursor-pointer"
                             size="xl">
                        Leave {{ $route.query.room }}
                    </UButton>
                </div>
            </template>
            <div class="flex flex-col md:flex-row">
                <!-- Sidebar -->
                <div class="px-6 py-4 border rounded-md md:min-h-[460px] border-primary">
                    <div>
                        <UBadge size="md" color="white" variant="solid" class="w-full">
                            <UIcon name="i-heroicons-chat-bubble-bottom-center-text" class="w-6 h-6 m-1" />
                            <div class="text-base">Room Name</div>
                        </UBadge>
                        <div class="my-2 font-semibold text-left capitalize">
                            {{ currentRoom }}
                        </div>
                    </div>
                    <div>
                        <UBadge size="md" color="white" variant="solid" class="w-full">
                            <UIcon name="i-heroicons-user-group" class="w-6 h-6 m-1" />
                            <div class="text-base">Users: {{ users.length }}</div>
                        </UBadge>
                        <div class="flex flex-row gap-1 mt-2 md:flex-col">
                            <div v-for="(user, i) in users" :key="i" class="text-lg font-normal capitalize"
                                 :class="{ 'text-primary': user.username === route.query.username }">
                                [{{ user.username }}]
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Chat -->
                <div class="flex flex-row justify-between w-full mt-2">
                    <div></div>
                    <div id="chatContainer" class="flex-1 px-2 py-2 overflow-y-auto h-[300px] md:h-[460px]">
                        <div class="flex w-full mb-3" v-for="(chat, i) in chats" :key="i" :class="{
                            'justify-center': chat.username === 'Bot',
                            'justify-end': chat.username === route.query.username,
                            'justify-start': chat.username !== route.query.username,
                        }">
                            <UBadge class="flex flex-col items-start w-auto px-4 rounded-md"
                                    :variant="chat.username === 'Bot' ? 'outline' : 'solid'"
                                    :color="chat.username === route.query.username ? 'gray' : 'white'">
                                <div class="flex flex-row items-center">
                                    <div class="mr-2 text-2xl text-primary ">
                                        {{ chat.username }}
                                    </div>
                                    <div class="text-lg text-black dark:text-gray-100">
                                        {{ chat.time }}
                                    </div>
                                </div>
                                <div class="text-lg text-black dark:text-gray-100">
                                    {{ chat.text }}
                                </div>
                            </UBadge>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <form @submit.prevent="sendMessage">
                    <div class="flex flex-row">
                        <UInput
                                v-model="message"
                                placeholder="Enter your message...."
                                size="xl"
                                class="w-full mr-2">
                        </UInput>
                        <UButton
                                 icon="i-heroicons-paper-airplane"
                                 size="xl"
                                 color="primary"
                                 variant="solid"
                                 :trailing="false"
                                 label="Send"
                                 @click="sendMessage" />
                    </div>
                </form>
            </template>
        </UCard>
    </div>
</template>
