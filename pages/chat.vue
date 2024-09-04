<script setup lang="ts">
import type { User } from '~/types/User';
import { io, type Socket } from 'socket.io-client'
const route = useRoute();

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

const sendMessage = async () => {
    socket.value?.emit('chatMessage', message.value);
    await nextTick(() => message.value = '');
};

onMounted(() => {
    const { username, room } = route.query as Partial<Chat>;
    if (!username || !room) {
        navigateTo('/');
    }
    socket.value = io({
        path: '/api/socket.io'
    })

    // * Join ChatRoom
    socket.value.emit('joinRom', { username, room })
    socket.value.on('message', (response: Chat) => {
        chats.value.push(response)
    })
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
    <div class="md:mx-32">
        <UCard>
            <template #header>
                <div class="flex items-center justify-between text-primary">
                    <div class="flex items-center gap-x-2">
                        <UIcon
                               name="i-heroicons-chat-bubble-left-right"
                               class="w-6 h-6 font-semibold" />
                        <div class="text-primary font-semibold text-center text-xl">Chat App</div>
                    </div>
                    <UButton
                             @click="() => navigateTo('/')"
                             class="bg-primary px-3 py-1.5 cursor-pointer">
                        Leave {{ $route.query.room }}
                    </UButton>
                </div>
            </template>
            <div class="flex flex-col md:flex-row">
                <!-- Sidebar -->
                <div class="py-4 px-6 border-primary border rounded-md">
                    <div>
                        <UBadge size="md" color="white" variant="solid">
                            <UIcon name="i-heroicons-chat-bubble-bottom-center-text" class="w-6 h-6 m-1" />
                            <div class="text-base">Room Name</div>
                        </UBadge>
                        <div class="my-2 capitalize font-semibold text-left">
                            {{ currentRoom }}
                        </div>
                    </div>
                    <div>
                        <UBadge size="md" color="white" variant="solid" class="w-full">
                            <UIcon name="i-heroicons-user-group" class="w-6 h-6 m-1" />
                            <div class="text-base">Users</div>
                        </UBadge>
                        <div v-for="(user, i) in users" :key="i" class="mt-2 capitalize text-base"
                             :class="{ 'text-primary': user.username === route.query.username }">
                            {{ user.username }}
                        </div>
                    </div>
                </div>
                <!-- Chat -->
                <div class="h-96 overflow-y-auto px-2 py-2 flex-1">
                    <div class="w-full mb-3 flex" v-for="(chat, i) in chats" :key="i" :class="{
                        'justify-center': chat.username === 'Bot',
                        'justify-end': chat.username === route.query.username,
                        'justify-start': chat.username !== route.query.username,
                    }">
                        <UBadge class="flex flex-col items-start w-2/5 rounded-md"
                                :variant="chat.username === 'Bot' ? 'outline' : 'solid'"
                                :color="chat.username === route.query.username ? 'gray' : 'white'">
                            <div class="flex flex-row">
                                <div class="text-base font-semibold mr-2 text-gray-800 dark:text-gray-200 ">
                                    [{{ chat.username }}]
                                </div>
                                <div class="text-base text-black dark:text-gray-100">{{ chat.time }}</div>
                            </div>
                            <div class="text-sm text-black dark:text-gray-100 mt-1">
                                {{ chat.text }}
                            </div>
                        </UBadge>
                    </div>
                </div>
            </div>

            <template #footer>
                <form @submit.prevent="sendMessage">
                    <div class="flex flex-row">
                        <UInput
                                v-model="message"
                                placeholder="Enter your message...."
                                size="xs"
                                class="w-full mr-2">
                        </UInput>
                        <UButton
                                 icon="i-heroicons-paper-airplane"
                                 size="xs"
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
