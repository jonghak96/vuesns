<template>
    <div v-if="images.length === 0" />
    <div v-else-if="images.length === 1">
        <v-img
            :src="`http://localhost:3085/${images[0].src}`"
            contain
            aspect-ratio="2"
            style="background: #000;"
            @click="zoomImages"
        />
        <image-zoom v-if="imageZoomed" :close-modal="closeModal" :images="images" />
    </div>
    <div v-else-if="images.length === 2" style="display: flex">
        <v-img
            :src="`http://localhost:3085/${images[0].src}`"
            contain
            aspect-ratio="2"
            style="flex: 1;background: #000;"
            @click="zoomImages"
        />
        <v-img
            :src="`http://localhost:3085/${images[1].src}`"
            contain
            aspect-ratio="2"
            style="flex: 1;background: #000;"
            @click="zoomImages"
        />
        <image-zoom v-if="imageZoomed" :close-modal="closeModal" :images="images" />
    </div>
    <div v-else-if="images.length > 2" style="display: flex">
        <v-img
            :src="`http://localhost:3085/${images[0].src}`"
            contain
            aspect-ratio="2"
            style="flex: 1;background: #000;"
            @click="zoomImages"
        />
        <div style="flex: 1;align-items: center;justify-content: center;display: flex;border: 1px solid #000;text-align: center;" @click="zoomImages">
            <div>
                <v-icon>mdi-dots-horizontal</v-icon>
                <div>더 보기</div>
            </div>
        </div>
        <image-zoom v-if="imageZoomed" :close-modal="closeModal" :images="images" />
    </div>
</template>

<script>
import ImageZoom from "~/components/ImageZoom";
export default {
    components: {
        ImageZoom,
    },
    props: {
        images: {
            type: Array,
            required: true,
        }
    },
    data() {
        return {
            imageZoomed: false,
        };
    },
    methods: {
        closeModal() {
            this.imageZoomed = false;
        },
        zoomImages() {
            this.imageZoomed = true;
        },
    },
};
</script>

<style>

</style>