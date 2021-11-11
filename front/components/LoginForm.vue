<template>
    <v-container v-if="me">
        <v-card>
            <v-container>
                {{ me.nickname }}님, 로그인 되었습니다.
                <v-btn @click="onLogOut">로그아웃</v-btn>
                <v-row style="margin-top: 10px">
                    <v-col cols="4">{{ me.Followers.length }} 팔로워</v-col>
                    <v-col cols="4">{{ me.Followings.length }} 팔로잉</v-col>
                    <v-col cols="4">{{ me.Posts.length }} 게시글</v-col>
                </v-row>
            </v-container>
        </v-card>
    </v-container>
    <v-container v-else>
        <v-card>
            <v-form ref="form" v-model="valid" @submit.prevent="onLogIn">
                <v-container>
                    <v-text-field
                        v-model="email"
                        :rules="emailRules"
                        label="이메일"
                        type="email"
                        required
                    />
                    <v-text-field
                        v-model="password"
                        :rules="passwordRules"
                        label="비밀번호"
                        type="password"
                        required
                    />
                    <v-btn color="green" type="submit" :disabled="!valid">Login</v-btn>
                    <v-btn nuxt to="/signup">Join</v-btn>
                </v-container>
            </v-form>
        </v-card>
    </v-container>
</template>

<script>
export default {
    data() {
        return {
            valid: false,
            email: "",
            password: "",
            emailRules: [
                v => !!v || "이메일을 적어주세요.",
                v => /.+@.+/.test(v) || "이메일이 유효하지 않습니다."
            ],
            passwordRules: [
                v => !!v || "비밀번호를 적어주세요.",
            ],
        };
    },
    computed: {
        me() {
            return this.$store.state.users.me;
        },
    },
    methods: {
        onLogIn() {
            if(this.$refs.form.validate()) {
                this.$store.dispatch("users/logIn", {
                    email: this.email,
                    password: this.password,
                // });
                // dispatch는 비동기 작업이기 때문에,
                // 로그인에 실패하여도 메인페이지로 돌아갈 수 있음.
                // this.$router.push({
                //     path:"/",
                // });
                })
                .then(() => {
                    this.$router.push({
                        path: "/",
                    });
                })
                .catch(() => {
                    alert("회원가입 실패");
                });
            }
        },
        onLogOut() {
            this.$store.dispatch("users/logOut");
        },
    },
}
</script>

<style>

</style>