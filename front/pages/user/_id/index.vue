<template>
    <v-container>
        <v-card style="margin-bottm: 20px;">
            <v-container>
                {{ other.nickname }}
                <v-row style="margin-top: 10px">
                    <v-col cols="4">{{ other.Followers.length }} 팔로워</v-col>
                    <v-col cols="4">{{ other.Followings.length }} 팔로잉</v-col>
                    <v-col cols="4">{{ other.Posts.length }} 게시글</v-col>
                </v-row>
            </v-container>
        </v-card>
        <div>
            <post-card v-for="p in mainPosts" :key="p.id" :post="p" />
        </div>
    </v-container>
</template>

<script>
    import PostCard from "~/components/PostCard";

    export default {
        components: {
            PostCard,
        },
        data() {
            return {
                name: "Nuxt.js",
            }
        },
        fetch({ store, params }) {
            return Promise.all([
                store.dispatch("users/loadOther", {
                    userId: params.id,
                }),
                store.dispatch("posts/loadUserPosts", {
                    userId: params.id,
                    reset: true,
                }),
            ]);
        },
        head: {
            title: "메인페이지"
        },
        computed: {
            other() {
                return this.$store.state.users.other;
            },
            mainPosts() {
                return this.$store.state.posts.mainPosts;
            },
        },
        mounted() {
            window.addEventListener("scroll", this.onScroll);
        },
        beforeDestroy() {
            window.removeEventListener("scroll", this.onScroll);
        },
        methods: {
            onScroll() {
                if(window.scrollY + document.documentElement.clientHeight > document.documentElement.scrollHeight - 10) {
                    if(this.hasMorePost) {
                        this.$store.dispatch("posts/loadPosts");
                    }
                }
            },
        },
    }
</script>

<style>

</style>