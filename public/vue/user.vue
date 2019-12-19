<template>
    <div class="user">
        <img class="user-icon" :title="user.name" :src="user.img"/>
        <div class="inner">
            <div class="name">{{ user.name }}</div>
            <div class="points">{{ user.points }}</div>
        </div>
    </div>
</template>

<script>
    module.exports = {
        props: ['user'],
    };
</script>

