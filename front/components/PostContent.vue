<template>
    <div>
        <post-images :images="post.Images || []" />
        <v-card-title>
            <h3>
                <nuxt-link :to="'/user/'+post.User.id">{{ post.User.nickname }}</nuxt-link>
                <v-btn v-show="canFollow" @click="onFollow">팔로우</v-btn>
                <v-btn v-show="canUnfollow" @click="onUnfollow">언팔로우</v-btn>
            </h3>
        </v-card-title>
        <v-card-text>
            <template v-for="(node, i) in nodes">
                <nuxt-link v-if="node.startsWith('#')" :key="i" :to="`/hashtag/${node.slice(1)}`">{{ node }}</nuxt-link>
                <span v-else :key="i">{{ node }}</span>
            </template>
            <div style="color: gray;font-size:80%;">{{ $moment(post.createdAt).fromNow() }}</div>
        </v-card-text>
    </div>
</template>

<script>
import PostImages from "~/components/PostImages";
export default {
    components: {
        PostImages,
    },
    props: {
        post: {
            type: Object,
            required: true,
        },
    },
    computed: {
        nodes() {
            return this.post.content.split(/(#[^\s#]+)/);
        },
        me() {
            return this.$store.state.users.me;
        },
        canFollow() {
            return this.me && this.post.User.id !== this.me.id && !this.me.Followings.find( (v) => v.id === this.post.User.id );
        },
        canUnfollow() {
            return this.me && this.post.User.id !== this.me.id && this.me.Followings.find( (v) => v.id === this.post.User.id );
        },
    },
    methods: {
        onFollow() {
            this.$store.dispatch("users/follow", {
                userId: this.post.User.id,
            });
        },
        onUnfollow() {
            this.$store.dispatch("users/removeFollowing", {
                userId: this.post.User.id,
            });
        }
    },
}
</script>

<style scoped>
a {text-decoration: none;color: inherit;}
</style>