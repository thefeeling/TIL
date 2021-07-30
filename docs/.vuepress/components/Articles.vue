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
        const date = moment(lastUpdated, "MM DD YYYY hh:mm:ss");
        return {
          yyyyMMdd: date.format('YYYY-MM-DD'),
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