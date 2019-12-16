<template>
    <div class="user">
        <img class="user-icon" :title="user.name" :src="user.img"/>
        <span class="points">{{ user.points }}</span>
    </div>
</template>

<script>
    module.exports = {
        props: ['user'],
    };
</script>

