(function(Vue,http){
    let app = new Vue({
        el:"#message-vue",
        components: {
            'comment': httpVueLoader('/vue/comment.vue'),
        },
        data() {
            return {
                message: void 0,
                comments: []
            }
        },
        methods: {
            getComments() {
                axios.get("/comments").then((comments) => {
                    this.comments = comments.data;
                })
            }
        },
        created: function(){
            //this.getComments();
        }
    });
    console.log("works");
})(Vue, axios);
