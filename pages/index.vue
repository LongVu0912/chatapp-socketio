<script setup lang="ts">
const rooms = ['Room 1', 'Room 2', 'Room 3', 'Room 4', 'Room 5'];

const state = reactive({
    username: '',
    room: rooms[0],
});

const handleJoin = () => {
    navigateTo(`/chat?username=${state.username}&room=${state.room}`);
};

</script>

<template>
    <div>
        <UCard class="max-w-[700px] mx-auto" :ui="{ body: { padding: 'p-5 sm:p-8' } }">
            <template #header>
                <div class="flex items-center justify-center gap-x-3 text-primary">
                    <UIcon
                           name="i-heroicons-chat-bubble-left-right"
                           class="font-semibold w-9 h-9" />
                    <div class="text-3xl font-semibold text-center text-primary">Chat App</div>
                </div>
            </template>

            <div class="space-y-6">
                <UFormGroup label="Username" name="username" size="xl">
                    <UInput v-model="state.username" />
                </UFormGroup>

                <UFormGroup label="Room" name="room" size="xl">
                    <USelect v-model="state.room" :options="rooms" />
                </UFormGroup>

                <UButton size="xl" block :disabled="!state.username || !state.room" @click="handleJoin">
                    Join Chat
                </UButton>
            </div>
        </UCard>
    </div>
</template>
