(function(Vue,http){
    let app;
    
    app = new Vue({
        el:"#header--right",
        components: {
            'user': httpVueLoader('/vue/user.vue'),
        },
        data() {
            return {
                user: void 0,
                passFieldType: 'password',
                email: '',
                password: '',
                showLogin: false,
                error: void 0,
            }
        },
        computed: {
            isPassField()     { return this.passFieldType === "password" },
            isTextField()     { return this.passFieldType === "text" },
        },
        methods: {
            openLoginBox()    { this.showLogin = true; document.querySelector("#login input[name='email']").focus() },
            hideLoginBox()    { this.showLogin = false },
            togglePassField() { this.passFieldType = this.passFieldType === "password" ? "text" : "password" },
            signin(e) {
                e.preventDefault();
                this.error = void 0;
                http.post("/auth/login",{
                    email: this.email,
                    password: this.password,
                }).then((res) => {
                    if(res.data && res.data.token){
                        this.user = jwt_decode(res.data.token);
                        Cookies.set('token',res.data.token, {expires: 90});
                        this.hideLoginBox();
                    }
                }).catch((err) => {
                    this.error = err.response.data.message;
                });
                return false;
            },
            signout() {
                if(this.user) {
                    http.get('/auth/logout').then((res) => {
                        this.user = void 0;
                        Cookies.remove('token');
                        console.log("successful logout");
                    });
                }
            },
            onClickLoginBox(event) {
                let loginBox = document.querySelector('#login > .inner');
                if(!loginBox.contains(event.target)) {
                    app.hideLoginBox();
                }
            }
        },
        mounted: function(){
            let token = Cookies.get('token');
            if(token) { this.user = jwt_decode(token); }
        }
    });
})(Vue, axios);
