<template>
    <v-app>
        <nav>
            <v-toolbar dark color="green">
                <v-toolbar-title>
                    <nuxt-link to="/">Node Bird</nuxt-link>
                </v-toolbar-title>
                <v-spacer />
                <v-toolbar-items>
                    <v-form @submit.prevent="onSearchHashtag">
                        <v-text-field v-model="hashtag" label="검색" hide-details prepend-icon="mdi-magnify" :style="{ display: 'flex', alignItems: 'center'}" />
                    </v-form>
                    <v-btn text nuxt to="/profile" :style="{ display: 'flex', alignItems: 'center'}">
                        <div>프로필</div>
                    </v-btn>
                    <v-btn text nuxt to="/signup" :style="{ display: 'flex', alignItems: 'center'}">
                        <div>회원가입</div>
                    </v-btn>
                </v-toolbar-items>
            </v-toolbar>
        </nav>
        <v-row no-gutters>
            <v-col cols="12" md="3">
                <login-form />
            </v-col>
            <v-col cols="12" md="9">
                <nuxt />
            </v-col>
        </v-row>
    </v-app>
    <!-- <div>
        <nav>
            <nuxt-link to="/">Home</nuxt-link>
            <nuxt-link to="/profile">Profile</nuxt-link>
            <nuxt-link to="/signup">Signup</nuxt-link>
        </nav>
        <nuxt />
    </div> -->
</template>

<script>
    import LoginForm from "~/components/LoginForm"; // ~ : 소스들의 루트폴더.

    export default {
        name: "Default",
        // head: {
        //     title: "Node Bird"
        // },
        components: {
            LoginForm,
        },
        data() {
            return {
                hashtag: "",
            };
        },
        methods: {
            onSearchHashtag() {
                this.$router.push({
                    path: `/hashtag/${encodeURIComponent(this.hashtag)}`,
                });
                this.hashtag = "";
            },
        },
    }
</script>

<style>

</style>