<template>
    <v-container>
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
            return store.dispatch("posts/loadHashtagPosts", {
                hashtag: encodeURIComponent(params.id),
                reset: true,
            });
        },
        head: {
            title: "메인페이지"
        },
        computed: {
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