<template>
    <div class="comment-row" v-bind:class="{ editing: editing }">
        <div class="error" v-if="error">{{error}}</div>
        <div class="comment-content" v-html="content"></div>
        <div class="comment-editable">
            <textarea ref="content">{{content}}</textarea>
        </div>
        <div class="comment-section--lower">
            <div>
                <a href="javascript: void 0" v-if="!editing && isEdit" @click="toggleEdit">edit comment</a>
                <a href="javascript: void 0" v-if="!editing && isNew" @click="toggleEdit">add comment</a>
                <a href="javascript: void 0" v-if="editing" @click="save">{{ isNew ? "save":"update" }}</a>
            </div>
            <div class="comment-section--edited" v-if="comment && notSameEditor">
                <div class="date">Edited {{ comment.modified | fromNow }}</div>
                <div class="user">
                    <img class="user-icon" v-bind:title="comment.modifiedBy.name" v-bind:src="comment.modifiedBy.img"/>
                    <div class="inner">
                        <div class="name">{{ comment.modifiedBy.name }}</div>
                        <div class="points">{{ comment.modifiedBy.points }}</div>
                    </div>
                </div>
            </div>
            <div class="comment-section--user" v-if="comment">
                <div class="date">Answered {{ comment.created | fromNow }}</div>
                <div class="user">
                    <img class="user-icon" v-bind:title="comment.createdBy.name" v-bind:src="comment.createdBy.img"/>
                    <div class="inner">
                        <div class="name">{{ comment.createdBy.name }}</div>
                        <div class="points">{{ comment.createdBy.points }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    $fadedText:#989797;
    $border:#ddd;

    .comment-row {
        padding: 20px;
        border-bottom: 1px solid $border;
    }
    .comment-content { display: block; }
    .comment-editable { display: none; }
    .comment-row.editing{
        .comment-content { display: none; }
        .comment-editable { display: block; }
    }
    a {
        font-weight: bold;
        text-decoration: none;
        color: $fadedText;
        &:hover{ text-decoration: underline; }
    }
    .comment-section--lower{
    
        padding: 30px 0 10px;
        display: flex;
        flex-flow: row wrap;
        align-items: flex-start;
        justify-content: space-between;
    }
</style>

<script>
    module.exports = {
        props:["comment","user","type","parent"],
        data: function(){
            return {
                error: void 0,
                editor: void 0,
                editing: false,
                messageId: void 0,
            }
        },
        computed: {
            content() { return this.comment? megamark(this.comment.content) : "" },
            isEdit() { return this.type === 'edit' },
            isNew() { return this.type === 'add' },
            notSameEditor() { return this.comment && this.comment.modifiedBy && this.comment.modifiedBy._id !== this.comment.createdBy._id },
        },
        methods: {
            save(e) {
                //clear any errors, get current editor data and post for saving
                e.preventDefault();
                this.error = void 0;
                let newContent = this.editor.value();
    
                let save;
                if(this.isEdit) {
                    save = axios.patch(`/comments`,{
                        user: this.user,
                        messageId: this.messageId,
                        content: newContent,
                        parent: this.parent ? this.parent._id : void 0,
                        id: this.comment ? this.comment._id : void 0,
                    },{ headers: { auth: Cookies.get('token') } });
                } else {
                    save = axios.post(`/comments`,{
                        user: this.user,
                        messageId: this.messageId,
                        content: newContent,
                        parent: this.parent ? this.parent.id : void 0,
                    },{ headers: { auth: Cookies.get('token') } });
                }
    
                save.then((res) => {
                    this.toggleEdit();
                    
                    if(!this.comment) {
                        this.$emit('new-comment');
                    } else {
                        this.comment.content = newContent;
                    }
                }).catch((err) => {
                    console.error(err);
                    this.error = err.response.data.message;
                });
            },
            toggleEdit(){
                this.editing = !this.editing;
                let div = this.editor.editable;
                setTimeout(function() {
                    div.focus();
                }, 0);
            }
        },
        mounted() {
            this.messageId = messageId;
            this.editor = woofmark(this.$refs.content, editorSettings);
            //this.editing = !!this.isNew;
        },
        filters:{
            fromNow(date){ return moment(date).fromNow(); }
        }
    };
</script>

