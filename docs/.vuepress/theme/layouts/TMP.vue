<template>
  <div id="global-layout">
    <component :is="$page.path ? 'Layout' : 'NotFound'" />
    <Comment />
  </div>
</template>

<script>
import Layout from "vuepress-theme-antdocs/layouts/Layout.vue";
import Comment from "../Comment";

export default {
  components: {
    Layout,
    Comment
  }
};
</script>

