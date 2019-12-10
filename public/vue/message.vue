<template>
    <a :href="message.url" class="message">
        <div class="view-card">
            <span class="view-card--total">{{ message.views }}</span>
            <span class="view-card--label">views</span>
        </div>
        <div class="view-card">
            <span class="view-card--total">{{ message.comments }}</span>
            <span class="view-card--label">comments</span>
        </div>
        <div class="desc">
            <div class="title">{{ message.title }}</div>
            <div class="lower">
                <div class="tags">
                    <div class="tag" v-for="tag of message.tags" >{{ tag }}</div>
                </div>
                <div class="meta">
                    <span class="meta--change-type">{{ isNew ? "modified" : "asked" }}</span>
                    <span class="meta--from-now" :title="isNew ? message.created : message.modified">{{ fromNow() }}</span>
                    <span class="meta--user">
                        <span class="meta--user-name">{{ message.user.name }}</span>
                        <span class="meta--user-points">{{ message.user.points }}</span>
                    </span>
                </div>
            </div>
        </div>
    </a>
</template>

<style lang="scss">
    $primary: #fb406c;
    $tagBg: #f3f3f3;
    $border: #eee;
    $fadedText: #989797;
    $messageHoverBg: #f8f8f8;
    
    .message {
        display: flex;
        align-items: stretch;
        justify-content: flex-start;
        text-decoration: none;
        color: $fadedText;
        width: 100%;
        padding: 10px 0;
        border-bottom: 1px solid $border;
        
        .title {
            color: $primary;
            font-size: 20px;
        }
        &:hover {
            background: $messageHoverBg;
            .title { color: darken($primary, 20%); }
        }
    }
    .view-card {
        text-align: center;
        padding: 7px 10px;
        flex: 0 0 auto;
        display: flex;
        flex-flow: column;
        align-items: center;
        justify-content: center;
        
        .view-card--total {
            display: block;
            font-size: 20px;
            line-height: 1;
        }
    }
    
    .desc {
        flex: 1 1 100%;
        padding: 5px 10px;
        display: flex;
        flex-flow: column nowrap;
        align-items: flex-start;
        justify-content: center;
        
        .lower {
            display: flex;
            width: 100%;
            flex-flow: row wrap;
            align-items: center;
            justify-content: space-between;
        }
        .tags {
            .tag {
                display: inline-block;
                padding: 2px 6px;
                color: darken($fadedText, 10%);
                margin: 3px;
                background: $tagBg;
                border-radius: 10px;
                font-size: 0.8em;
            }
        }
        .meta--user {
            white-space: nowrap;
            
            .meta--user-name { color: $primary; }
            .meta--user-points { font-weight: bold; }
        }
    }
</style>
<script>
    module.exports = {
        props: ['message'],
        methods: {
            isNew() { return this.message.modified && this.message.modified.length },
            fromNow() {
                return moment.utc(this.isNew ? this.message.created : this.message.modified).fromNow();
            }
        }
    };
</script>

