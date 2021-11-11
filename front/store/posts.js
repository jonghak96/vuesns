import Vue from 'vue';
import throttle from "lodash.throttle";

export const state = () => ({
    mainPosts: [],
    hasMorePost: true,
    imagePaths: [],
});

export const mutations = {
    addMainPosts(state, payload) {
        state.mainPosts.unshift(payload);
        state.imagePaths = [];
    },
    removeMainPosts(state, payload) {
        const index = state.mainPosts.findIndex( (v) => v.id === payload.postId );
        state.mainPosts.splice(index, 1);
    },
    editMainPosts(state, payload) {
        const index = state.mainPosts.findIndex( (v) => v.id === payload.id );
        state.mainPosts[index].content = payload.content;
    },
    addComment(state, payload) {
        const index = state.mainPosts.findIndex( (v) => v.id === payload.postId );
        state.mainPosts[index].Comments.unshift(payload);
    },
    loadComments(state, payload) {
        const index = state.mainPosts.findIndex( (v) => v.id === payload.postId );
        // 실수: state.mainPosts[index].Comments = payload.data;
        Vue.set(state.mainPosts[index], 'Comments', payload.data);
    },
    loadPost(state, payload) {
        state.mainPosts = payload;
    },
    loadPosts(state, payload) {
        if(payload.reset) {
            state.mainPosts = payload.data;
        } else {
            state.mainPosts = state.mainPosts.concat(payload.data);
        }
        state.hasMorePost = payload.data.length === 10;
    },
    concatImagePaths(state, payload) {
        state.imagePaths = state.imagePaths.concat(payload);
    },
    removeImagePaths(state, payload) {
        state.imagePaths.splice(payload, 1);
    },
    likePost(state, payload) {
        const index = state.mainPosts.findIndex( (v) => v.id === payload.postId );
        state.mainPosts[index].Likers.push({
            id: payload.userId,
        });
    },
    unlikePost(state, payload) {
        const index = state.mainPosts.findIndex( (v) => v.id === payload.postId );
        const userIndex = state.mainPosts[index].Likers.findIndex( (v) => v.id === payload.userId );
        state.mainPosts[index].Likers.splice(userIndex, 1);
    },
};

export const actions = {
    add({ commit, state }, payload) {
        // 서버에 게시글 등록 요청을 보내는 부분
        this.$axios.post("/post/", {
            content: payload.content,
            image: state.imagePaths,
        },
        {
            withCredentials: true,
        }
        )
        .then( (res) => {
            commit("addMainPosts", res.data);
        })
        .catch( (err) => {
            console.error(err);
        });
    },
    remove({ commit }, payload) {
        this.$axios.delete(`/post/${payload.postId}`, { // GET, DELETE는 data 없음.
            withCredentials: true,
        })
        .then( () => {
            commit("removeMainPosts", payload);
        })
        .catch( (e) => {
            console.error(e);
        });
    },
    edit({ commit }, payload) {
        commit("editMainPosts", payload);
    },
    addComment({ commit }, payload) {
        this.$axios.post(`/post/${payload.postId}/comment`, {
            content: payload.content,
        }, {
            withCredentials: true,
        })
        .then( (res) => {
            commit("addComment", res.data);
        })
        .catch( (e) => {
            console.error(e);
            // alert("front/store/posts.js/ actions-addComment error");
        });
    },
    loadComments({ commit }, payload) {
        this.$axios.get(`/post/${payload.postId}/comments`)
        .then( (res) => {
            commit("loadComments", {
                posdId: payload.postId,
                data: res.data,
            });
        })
        .catch( (e) => {
            console.error(e);
            // alert("front/store/posts.js/ actions-loadComment error");
        });
    },
    async loadPost({ commit, state }, payload) {
        try {
            const res = await this.$axios.get(`/post/${payload}`);
            commit("loadPost", res.data);
        } catch (e) {
            console.error(e);
        }
    },
    loadPosts: throttle(async function({ commit, state }, payload) {
        try {
            if(payload && payload.reset) {
                const res = await this.$axios.get(`/posts?limit=10`);
                commit("loadPosts", {
                    data: res.data,
                    reset: true,
                });
                return;
            }
            if(state.hasMorePost) {
                const lastPost = state.mainPosts[state.mainPosts.length - 1]
                const res = await this.$axios.get(`/posts?lastId=${lastPost && lastPost.id}&limit=10`);
                commit("loadPosts", {
                    data: res.data,
                });
                return;
            }
        } catch (e) {
            console.error(e);
        }
    }, 2000),
    loadUserPosts: throttle(async function({ commit, state }, payload) {
        try {
            if(payload && payload.reset) {
                const res = await this.$axios.get(`/user/${payload.userId}/posts?limit=10`);
                commit("loadPosts", {
                    data: res.data,
                    reset: true,
                });
                return;
            }
            if(state.hasMorePost) {
                const lastPost = state.mainPosts[state.mainPosts.length - 1]
                const res = await this.$axios.get(`/user/${payload.userId}/posts?lastId=${lastPost && lastPost.id}&limit=10`);
                commit("loadPosts", {
                    data: res.data,
                });
                return;
            }
        } catch (e) {
            console.error(e);
        }
    }, 2000),
    loadHashtagPosts: throttle(async function({ commit, state }, payload) {
        try {
            if(payload && payload.reset) {
                const res = await this.$axios.get(`/hashtag/${payload.hashtag}?limit=10`);
                commit("loadPosts", {
                    data: res.data,
                    reset: true,
                });
                return;
            }
            if(state.hasMorePost) {
                const lastPost = state.mainPosts[state.mainPosts.length - 1]
                const res = await this.$axios.get(`/hashtag/${payload.hashtag}?lastId=${lastPost && lastPost.id}&limit=10`);
                commit("loadPosts", {
                    data: res.data,
                });
                return;
            }
        } catch (e) {
            console.error(e);
        }
    }, 2000),
    uploadImages({ commit }, payload) {
        this.$axios.post("/post/images", payload,
        {
            withCredentials: true, // 다른 서버 간에 쿠키를 심어주기 위해.
        }
        )
        .then( (res) => {
            commit("concatImagePaths", res.data);
        })
        .catch( () => {

        });
    },
    retweet({ commit }, payload) {
        this.$axios.post(`/post/${payload.postId}/retweet`, {}, {
            withCredentials: true,
        })
        .then( (res) => {
            commit("addMainPosts", res.data);
        })
        .catch( (e) => {
            console.error(e);
            alert(e.response.data);
        });
    },
    likePost({ commit }, payload) {
        this.$axios.post(`/post/${payload.postId}/like`, {}, {
            withCredentials: true,
        })
        .then( (res) => {
            commit("likePost", {
                userId: res.data.userId,
                postId: payload.postId,
            });
        })
        .catch( (e) => {
            console.error(e);
        });
    },
    unlikePost({ commit }, payload) {
        this.$axios.delete(`/post/${payload.postId}/like`, {
            withCredentials: true,
        })
        .then( (res) => {
            commit("unlikePost", {
                userId: res.data.userId,
                postId: payload.postId,
            });
        })
        .catch( (e) => {
            console.error(e);
        });
    },
};