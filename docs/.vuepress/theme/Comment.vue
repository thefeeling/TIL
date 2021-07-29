<template>
  <div ref="comment"></div>
</template>
<script>
export default {
  mounted() {
    // script tag 생성
    const utterances = document.createElement("script");
    utterances.type = "text/javascript";
    utterances.async = true;
    utterances.crossorigin = "anonymous";
    utterances.src = "https://utteranc.es/client.js";

    utterances.setAttribute("issue-term", "pathname");
    utterances.setAttribute("theme", "github-light");
    utterances.setAttribute("repo", `thefeeling/TIL`);

    this.$refs.comment.appendChild(utterances);
  }
};
</script>