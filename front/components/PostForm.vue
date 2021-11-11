<template>
    <v-card>
        <v-container>
            <v-form ref="form" v-model="valid" @submit.prevent="onSubmitForm">
                <v-textarea
                    v-model="content"
                    outlined
                    auto-grow
                    clearable
                    label="오늘 하루는 어땠나요?"
                    :hide-details="hideDetails"
                    :success-messages="successMessages"
                    :success="success"
                    :rules="[ v => !!v || '내용을 입력하세요.' ]"
                    @input="onChangeTextarea"
                />
                <input ref="imageInput" type="file" multiple hidden @change="onChangeImages">
                <v-btn type="button" @click="onClickImageUpload">이미지 업로드</v-btn>
                <v-btn type="submit" color="green" absolute right>짹짹짹</v-btn>
                <div>
                    <div v-for="(p, i) in imagePaths" :key="p" style="display: inline-block">
                        <img :src="`http://localhost:3085/${p}`" :alt="p" style="width: 100px">
                        <div>
                            <button type="button" @click="onRemoveImage(i)">제거</button>
                        </div>
                    </div>
                </div>
            </v-form>
        </v-container>
    </v-card>
</template>

<script>
import { mapState } from "vuex";


export default {
    data() {
        return {
            valid: false,
            content: "",
            hideDetails: false,
            successMessages: "",
            success: false,
        };
    },
    computed: {
        ...mapState("users", ["me"]),
        ...mapState("posts", ["imagePaths"]),
    },
    methods: {
        onChangeTextarea(value) {
            if(value.length) {
                this.hideDetails = true;
                this.success = false;
                this.successMessages = "";
            }
        },
        onSubmitForm() {
            if(this.$refs.form.validate()) {
                this.$store.dispatch("posts/add", {
                    content: this.content,
                })
                .then(() => {
                    this.content = "";
                    this.hideDetails = false;
                    this.success = true;
                    this.successMessages = "게시글 등록 성공!";
                })
                .catch((err) => {
                    console.error(err);
                });
            }
        },
        onClickImageUpload() {
            this.$refs.imageInput.click();
        },
        onChangeImages(e) {
            console.log(e.target.files);
            const imageFormData = new FormData();
            [].forEach.call(e.target.files, (f) => {
                imageFormData.append("image", f); // { image: [file1, file2] }
            });
            this.$store.dispatch("posts/uploadImages", imageFormData);
        },
        onRemoveImage(index) {
            this.$store.commit("posts/removeImagePaths", index);
        }
    },
}
</script>

<style>

</style>