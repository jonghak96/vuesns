module.exports = {
    head: {
        title: "NodeBird",
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
            content: "NodeBird",
        }, {
            hid: "ogdescription",
            name: "og:description",
            content: "NodeBird SNS",
        }, {
            property: "og:type",
            content: "website",
        }, {
            property: "og:image",
            content: "",
        }, {
            hid: "ogurl",
            property: "og:url",
            content: "",
        }],
        link: [{
            rel: "shortcut icon",
            href: "/melbournMuseum.jpg",
        }],
    },
    modules: [
        "@nuxtjs/axios",
    ],
    buildModules: [
        "@nuxtjs/vuetify",
        "@nuxtjs/moment"
    ],
    plugins: [

    ],
    vuetify: {

    },
    axios: {
        browserBaseURL: process.env.NODE_ENV === "production" ? "http://api.jellyforest.shop" : "http://localhost:3085",
        baseURL: process.env.NODE_ENV === "production" ? "http://api.jellyforest.shop" : "http://localhost:3085",
        https: false,
    },
    moment: {
        locales: ["ko"],
    },
    build: {
        analyze: false,
        extend(config, {isClient, isServer, isDev}) {
            if(isServer && !isDev) {
                config.devtool = "hidden-source-map";
            }
            console.log("webpack", config, isServer, isClient);
        },
    },
    server: {
        port: process.env.PORT || 3080,
    },
};