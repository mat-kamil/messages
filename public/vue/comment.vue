<template>
    <comment-editor
            v-bind:type="`edit`"
            v-bind:user="user"
            v-bind:comment="comment"
    ></comment-editor>
    
    <!--No more time to do children-->
    <!--<div class="children" v-if="children && children.length">
        <comment v-for="child of children"
                 v-bind:comment="child"
                 v-bind:user="user"
        ></comment>
        <comment-editor
                v-bind:type="`add`"
                v-bind:user="user"
                v-bind:parent="comment"
        ></comment-editor>
    </div>-->
</template>

<script>
    module.exports = {
        props:["comment","user"],
        components: {
            'comment': httpVueLoader('/vue/comment.vue'),
            'comment-editor': httpVueLoader('/vue/comment-editor.vue'),
        },
        data: function() {
            return {
            
            }
        },
        methods: {
        
        },
        created(){
            this.messageId = messageId;
        }
    };
</script>

