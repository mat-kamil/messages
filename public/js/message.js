(function(Vue,http, woofmark){
    const editable = document.querySelector("#message-editable textarea");
    window.editorSettings = {
        parseMarkdown: megamark,
        parseHTML: domador,
        defaultMode: 'wysiwyg',
        markdown: false,
        html: false,
        render: {
            commands: function (button, id) {
                button.className = 'wk-command woofmark-command-' + id;
                switch(id){
                    case 'bold': button.innerHTML = "<b>BOLD</b>"; break;
                    case 'italic': button.innerHTML = "<i>italic</i>"; break;
                    case 'quote': button.innerHTML = "&ldquo; <i>quote</i> &rdquo;"; break;
                    case 'ol': button.innerHTML = "1 2 3..."; break;
                    case 'ul': button.innerHTML = "&bullet; &bullet; &bullet;..."; break;
                    case 'heading': button.innerHTML = "H1 H2 H3..."; break;
                    case 'link': button.innerHTML = "href"; break;
                    case 'image': button.innerHTML = "img"; break;
                }
            }
        }
    };
    let page = document.querySelector(".message-page");
    let editor = woofmark(editable, editorSettings);
    let content = document.querySelector('#message-content');
    let title = document.querySelector('#title');
    let slugify = function(str){
        return (str + "").toLowerCase()
            .replace(/(\w)\'/g, '$1')       // Special case for apostrophes
            .replace(/[^a-z0-9_\-]+/g, '-') // Replace all non-word chars with -
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');
    };
    
    let editableVue = new Vue({
        el:"#editable-vue",
        components: {
            'comments': httpVueLoader('/vue/comments.vue'),
        },
        data: {
            messageId: void 0,
            user: void 0,
            error: void 0,
        },
        methods: {
            save(e) {
                //clear any errors, get current editor data and post for saving
                e.preventDefault();
                this.error = void 0;
                let newContent = editor.value();
                let tags = void 0;
                let newTitle = document.querySelector("#title-edit").value;
                
                let save;
                if(this.messageId) {
                    save = http.patch(`/messages`,{
                        id: this.messageId,
                        content: newContent,
                        title: newTitle,
                        tags: tags,
                        user: this.user,
                    },{ headers: { auth: Cookies.get('token') } });
                } else {
                    save = http.post(`/messages`,{
                        content: newContent,
                        title: newTitle,
                        tags: tags,
                        user: this.user,
                    },{ headers: { auth: Cookies.get('token') } });
                }
                
                save.then((res) => {
                    page.classList.remove("editing");
                    content.innerHTML = megamark(newContent);
                    title.innerHTML = newTitle;
                    if(!this.messageId) {
                        let data = res.data.data;
                        let url = `/messages/${data.id}/${slugify(data.title)}`;
                        window.location.replace(url);
                    }
                }).catch((err) => {
                    console.warn("error",err.response);
                    this.error = err.response.data.message;
                });
            },
            edit(e) {
                e.preventDefault();
                page.classList.add("editing");
            }
        },
        created() {
            content.innerHTML = megamark(content.innerHTML);
            this.messageId = messageId; // taken from page
            if(!messageId) {
                page.classList.add("editing","new");
                document.querySelector("#title-edit").focus();
            }
        }
    });
    
    let messageVue = new Vue({
        el:"#message-vue",
        components: {
            'comment': httpVueLoader('/vue/comment.vue'),
            'comment-editor': httpVueLoader('/vue/comment-editor.vue'),
        },
        data: function() {
            return {
                comments: [],
                user: void 0,
            }
        },
        methods: {
            getComments() {
                axios.get(`/comments/${this.messageId}`)
                    .then(function(res){
                        messageVue.comments = res.data;
                    });
            },
            updateComments() {
                this.commentCount = ++this.commentCount;
                this.getComments();
            }
        },
        created: function(){
            this.messageId = messageId; // taken from page
            this.commentCount = commentCount; // taken from page
            if(messageId){
                this.getComments();
            }
        }
    });
    
    // Login & Logout event listeners
    window.addEventListener("load",function(){
        let token = Cookies.get('token');
        if(token) {
            editableVue.user = jwt_decode(token);
            messageVue.user = jwt_decode(token);
        }
    });
    window.addEventListener("login",function(){
        let token = Cookies.get('token');
        if(token) {
            editableVue.user = jwt_decode(token);
            messageVue.user = jwt_decode(token);
        }
    });
    window.addEventListener("logout",function(){
        editableVue.user = void 0;
        messageVue.user = void 0;
    });
})(Vue, axios, woofmark);
