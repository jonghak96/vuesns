<template>
    <v-container v-if="post">
        <post-card :post="post" />
    </v-container>
    <div v-else>
        해당 아이디의 게시글이 존재하지 않습니다.
    </div>
</template>

<script>
import PostCard from "~/components/PostCard";

export default {
    components: {
        PostCard,
    },
    fetch({ store, params }) {
        return store.dispatch("posts/loadPost", params.id);
    },
    head() {
        return {
            title: `${this.post.User.nickname}님의 게시글`,
            meta: [{
                charset: "utf-8",
            }, {
                name: "viewport",
                content: "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=yes, viewport-fit=cover",
            }, {
                "http-equiv" : "X-UA-Compatible",
                content: "IE=edge",
            }, {
                name: "description",
                content: "NodeBird SNS",
            }, {
                hid: "ogtitle",
                name: "og:title",
                content: `${this.post.User.nickname}님의 게시글`,
            }, {
                hid: "ogdescription",
                name: "og:description",
                content: this.post.content,
            }, {
            //     property: "og:image",
            //     content: this.post.Images[0] ? this.post.Images.src : "",
            // }, {
                hid: "ogurl",
                property: "og:url",
                content: "",
            }],
        };
    },
    computed: {
        post() {
            if(Array.isArray(this.$store.state.posts.mainPosts)) {
                return this.$store.state.posts.mainPosts.find(v => v.id === parseInt(this.$route.params.id, 10));
            }
            return this.$store.state.posts.mainPosts;
        },
    },
}
</script>

<style>

</style>