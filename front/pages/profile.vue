<template>
    <div>
        <v-container>
            <v-card style="margin-bottom: 20px">
                <v-container>
                    <v-subheader>내 프로필</v-subheader>
                    <v-form ref="form" v-model="valid" @submit.prevent="onChangeNickname">
                        <v-text-field
                            v-model="nickname"
                            label="닉네임"
                            :rules="nicknameRules"
                            required
                        />
                        <v-btn color="blue" type="submit">수정하기</v-btn>
                    </v-form>
                </v-container>
            </v-card>
            <v-card style="margin-bottom: 20px">
                <v-container>
                    <v-subheader>팔로워</v-subheader>
                    <follow-list :users="followerList" :remove="removeFollower" />
                    <v-btn v-show="hasMoreFollower" color="blue" style="width: 100%" @click="onLoadFollowers">더보기</v-btn>
                </v-container>
            </v-card>
            <v-card style="margin-bottom: 20px">
                <v-container>
                    <v-subheader>팔로잉</v-subheader>
                    <follow-list :users="followingList" :remove="removeFollowing" />
                    <v-btn v-show="hasMoreFollowing" color="blue" style="width: 100%" @click="onLoadFollowings">더보기</v-btn>
                </v-container>
            </v-card>
        </v-container>
    </div>
</template>

<script>
    import FollowList from "~/components/FollowList";

    export default {
        components: {
            FollowList,
        },
        middleware: "authenticated",
        data() {
            return {
                valid: false,
                nickname: "",
                nicknameRules: [ v => !!v || "닉네임은 필수입니다."],
            };
        },
        fetch({ store }) {
            return Promise.all([
                store.dispatch("users/loadFollowers", { offset: 0 }),
                store.dispatch("users/loadFollowings", { offset: 0 }),
            ]);
        },
        head: {
            title: "프로필"
        },
        computed: {
            followerList() {
                return this.$store.state.users.followerList;
            },
            followingList() {
                return this.$store.state.users.followingList;
            },
            hasMoreFollower() {
                return this.$store.state.users.hasMoreFollower;
            },
            hasMoreFollowing() {
                return this.$store.state.users.hasMoreFollowing;
            },
        },
        methods: {
            onChangeNickname() {
                this.$store.dispatch("users/changeNickname", {
                    nickname: this.nickname,
                });
            },
            removeFollower(userId) {
                this.$store.dispatch("users/removeFollower", {
                    userId, // id: id,
                });
            },
            removeFollowing(userId) {
                this.$store.dispatch("users/removeFollowing", {
                    userId, // id: id,
                });
            },
            onLoadFollowers() {
                this.$store.dispatch("users/loadFollowers");
            },
            onLoadFollowings() {
                this.$store.dispatch("users/loadFollowings");
            },
        },
    };
</script>

<style>

</style>