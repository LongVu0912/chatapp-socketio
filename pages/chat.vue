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
                <div class="text-primary flex items-center justify-between">
                    <div class="flex items-center gap-x-2">
                        <UIcon
                               name="i-heroicons-chat-bubble-left-right"
                               class="h-6 w-6 font-semibold" />
                        <div class="text-primary text-center text-xl font-semibold">Chat App</div>
                    </div>
                    <UButton
                             @click="() => navigateTo('/')"
                             class="cursor-pointer px-3 py-1.5"
                             size="xl">
                        Leave {{ $route.query.room }}
                    </UButton>
                </div>
            </template>
            <div class="flex flex-col md:flex-row">
                <!-- Sidebar -->
                <div class="border-primary rounded-md border px-6 py-4 md:min-h-[460px]">
                    <div>
                        <UBadge size="md" color="white" variant="solid" class="w-full">
                            <UIcon name="i-heroicons-chat-bubble-bottom-center-text" class="m-1 h-6 w-6" />
                            <div class="whitespace-nowrap text-base">Room Name</div>
                        </UBadge>
                        <div class="my-2 text-left font-semibold capitalize">
                            {{ currentRoom }}
                        </div>
                    </div>
                    <div>
                        <UBadge size="md" color="white" variant="solid" class="w-full">
                            <UIcon name="i-heroicons-user-group" class="m-1 h-6 w-6" />
                            <div class="text-base">Users: {{ users.length }}</div>
                        </UBadge>
                        <div class="mt-2 flex flex-row gap-1 md:flex-col">
                            <div v-for="(user, i) in users" :key="i" class="text-lg font-normal capitalize"
                                 :class="{ 'text-primary': user.username === route.query.username }">
                                [{{ user.username }}]
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Chat -->
                <div class="mt-2 flex w-full flex-row justify-between">
                    <div></div>
                    <div id="chatContainer" class="h-[300px] flex-1 overflow-y-auto px-2 py-2 md:h-[460px]">
                        <div class="mb-3 flex w-full" v-for="(chat, i) in chats" :key="i" :class="{
                            'justify-center': chat.username === 'Bot',
                            'justify-end': chat.username === route.query.username,
                            'justify-start': chat.username !== route.query.username,
                        }">
                            <UBadge class="flex w-auto flex-col items-start rounded-md px-4"
                                    :variant="chat.username === 'Bot' ? 'outline' : 'solid'"
                                    :color="chat.username === route.query.username ? 'gray' : 'white'">
                                <div class="flex flex-row items-center">
                                    <div class="text-primary mr-2 text-2xl">
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
                                class="mr-2 w-full">
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
