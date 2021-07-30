<template>
  <div>
    <a-timeline>
      <a-timeline-item v-for="(item, index) in this.pages" v-bind:key="index">
        <div>{{ item.lastUpdated }} {{ item.yyyyMMdd }}</div>
        <a v-bind:href="item.path">{{ item.title }} </a>
      </a-timeline-item>
    </a-timeline>
  </div>
</template>

<script>
import moment from 'moment';


export default {
  name: 'Articles',

  components: {},

  data() {
    return {};
  },
  methods:{

  },
  mounted() {
  },
  computed: {
    pages() {
      return this.$site.pages.map(({
        frontmatter,
        headers,
        key,
        lastUpdated,
        path,
        regularPath,
        relativePath,
        title
      }) => {
        let yyyyMMdd;
        let hhMMss;
        if (lastUpdated) {
            const date = lastUpdated.split(",");
            yyyyMMdd = date[0];
            hhMMss = date[1];
        }
        return {
          yyyyMMdd,
          hhMMss,
          frontmatter,
          headers,
          key,
          lastUpdated,
          path,
          regularPath,
          relativePath,
          title,
        }
      });
    },
  }
}
</script>