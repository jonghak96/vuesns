export const state = () => ({
    me: null,
    other: null,
    followerList: [],
    followingList: [],
    hasMoreFollower: true,
    hasMoreFollowing: true,
});

const totalFollower = 8;
const totalFollowing = 7;
const limit = 3;

// 동기적 작업
export const mutations = {
    setMe(state, payload) {
        state.me = payload;
    },
    setOther(state, payload) {
        state.other = payload;
    },
    changeNickname(state, payload) {
        state.me.nickname = payload.nickname;
    },
    addFollower(state, payload) {
        state.followerList.push(payload);
    },
    addFollowing(state, payload) {
        state.followingList.push(payload);
    },
    loadFollowers(state, payload) {
        if(payload.offset === 0) {
            state.followerList = payload.data;
        } else {
            state.followerList = state.followerList.concat(payload.data);
        }
        state.hasMoreFollower = payload.data.length === limit;
    },
    loadFollowings(state, payload) {
        if(payload.offset === 0) {
            state.followingList = payload.data;
        } else {
            state.followingList = state.followingList.concat(payload.data);
        }
        state.hasMoreFollowing = payload.data.length === limit;
    },
    following(state, payload) {
        state.me.Followings.push({ id: payload.userId });
    },
    removeFollowing(state, payload) {
        // 목록 하나하나 지우는 것.
        const index = state.followingList.findIndex( (v) => v.id === payload.userId );
        state.followingList.splice(index, 1);
        // 쓸꺼라니깐 놔두자.
        index = state.me.Followings.findIndex( (v) => v.id === payload.userId );
        state.me.Followings.splice(index, 1);
    },
    removeFollower(state, payload) {
        const index = state.followerList.findIndex( (v) => v.id === payload.id);
        state.followerList.splice(index, 1);
        // 쓸꺼라니깐 놔두자.
        index = state.me.Followings.findIndex( (v) => v.id === payload.userId );
        state.me.Followings.splice(index, 1);
    },
};

// (복잡한 특히) 비동기적 작업
export const actions = {
    signUp({ commit }, payload) {
        // console.log(context);
        // { commit, dispatch, state, rootState, getters, rootGetters }
        // 서버에 회원가입 요청을 보내는 부분
        this.$axios.post("/user", {
            email: payload.email,
            password: payload.password,
            nickname: payload.nickname,
        },
        {
            withCredentials: true, // 다른 서버 간에 쿠키를 심어주기 위해.
        }
        )
        .then( (res) => {
            commit("setMe", res.data);
        })
        .catch( (err) => {
            console.error(err);
        });
    },
    logIn({ commit }, payload) {
        this.$axios.post("/user/login", {
            email: payload.email,
            password: payload.password,
        },
        {
            withCredentials: true,
        }
        )
        .then( (res) => {
            commit("setMe", res.data);
        })
        .catch( (err) => {
            console.error(err);
        });
    },
    logOut({ commit }, payload) {
        this.$axios.post("/user/logout",
        {},
        {
            withCredentials: true,
        }
        )
        .then( (res) => {
            commit("setMe", null);
        })
        .catch( (err) => {
            console.error(err);
        });
    },
    loadUser({ commit }) {
        this.$axios.get("/user", {
            withCredentials: true,
        })
        .then( (res) => {
            commit("setMe", res.data);
        })
        .catch( (e) => {
            console.error(e);
        });
    },
    async loadOther({ commit }, payload) {
        try {
            const res = await this.$axios.get(`/user/${payload.userId}`);
            commit("setOther", res.data);
        } catch (e) {
            console.error(e);
        }
    },
    changeNickname({ commit }, payload) {
        this.$axios.patch("/user/nickname", {
            nickname: payload.nickname,
        }, {
            withCredentials: true,
        })
        .then( () => {
            commit("changeNickname", payload);
        })
        .catch( (e) => {
            console.error(e);
        });
    },
    addFollower({ commit }, payload) {
        commit("addFollower", payload);
    },
    addFollowing({ commit }, payload) {
        commit("addFollowing", payload);
    },
    removeFollower({ commit }, payload) {
        commit("removeFollower", payload);
    },
    removeFollowing({ commit }, payload) {
        commit("removeFollowing", payload);
    },
    loadFollowers({ commit, state }, payload) {
        if(!(payload && payload.offset === 0) && !state.hasMoreFollower) return;
        let offset = state.followerList.length;
        if(payload && payload.offset === 0) offset = 0;
        return this.$axios.get(`user/${state.me.id}/followers?limit=3&offset=${offset}`, {
            withCredentials: true,
        })
        .then( (res) => {
            commit("loadFollowers", {
                data: res.data,
                offset: offset,
            });
        })
        .catch( (e) => {
            console.error(e);
        });
    },
    loadFollowings({ commit, state }, payload) {
        if(!(payload && payload.offset === 0) && !state.hasMoreFollowing) return;
        let offset = state.followingList.length;
        if(payload && payload.offset === 0) offset = 0;
        return this.$axios.get(`user/${state.me.id}/followings?limit=3&offset=${offset}`, {
            withCredentials: true,
        })
        .then( (res) => {
            commit("loadFollowings", {
                data: res.data,
                offset: offset,
            });
        })
        .catch( (e) => {
            console.error(e);
        });
    },
    follow({ commit }, payload) {
        return this.$axios.post(`/user/${payload.userId}/follow`, {}, {
            withCredentials: true,
        })
        .then( (res) => {
            commit("following", {
                userId: payload.userId,
            });
        })
        .catch( (e) => {
            console.error(e);
        });
    },
    removeFollowing({ commit }, payload) {
        return this.$axios.delete(`/user/${payload.userId}/follow`, {
            withCredentials: true,
        })
        .then( (res) => {
            commit("removeFollowing", {
                userId: payload.userId,
            });
        })
        .catch( (e) => {
            console.error(e);
        });
    },
    removeFollower({ commit }, payload) {
        return this.$axios.delete(`/user/${payload.userId}/follower`, {
            withCredentials: true,
        })
        .then( (res) => {
            commit("removeFollower", {
                userId: payload.userId,
            });
        })
        .catch( (e) => {
            console.error(e);
        });
    },
};