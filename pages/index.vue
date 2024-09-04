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
        <UCard class="max-w-[600px] mx-auto" :ui="{ body: { padding: 'p-5 sm:p-8' } }">
            <template #header>
                <div class="flex items-center justify-center gap-x-3 text-primary">
                    <UIcon
                           name="i-heroicons-chat-bubble-left-right"
                           class="w-9 h-9 font-semibold" />
                    <div class="text-primary font-semibold text-center text-3xl">Chat App</div>
                </div>
            </template>

            <div :state="state" @submit="onSubmit" class="space-y-6">
                <UFormGroup label="Username" name="username">
                    <UInput v-model="state.username" />
                </UFormGroup>

                <UFormGroup label="Room" name="room">
                    <USelect v-model="state.room" :options="rooms" />
                </UFormGroup>

                <UButton size="xl" block :disabled="!state.username || !state.room" @click="handleJoin">
                    Join Chat
                </UButton>
            </div>
        </UCard>
    </div>
</template>
