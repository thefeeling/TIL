<template>
  <div>
      <template v-for="(item, index) in this.pages">
        <h3 v-bind:key="index">{{ item.yyyyMMdd }}</h3>
        <a-anchor v-for="(page, index) in item.body" :affix="false" v-bind:key="index">
          <a-anchor-link v-bind:key="key" v-bind:href="page.path" v-bind:title="page.title" />
        </a-anchor>
      </template>
  </div>
</template>

<script>
import moment from 'moment';
import * as R from 'ramda';


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
      const list = this.$site.pages.map(({
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
            yyyyMMdd = moment(date[0], 'MM/DD/YYYY').format('YYYY-MM-DD');
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
      const result = R.groupBy(o => {
        if (o.yyyyMMdd) {
          return o.yyyyMMdd
        } else {
          return '2021-01-01'
        }
      })(list);
      debugger;
      return Object.keys(result)
      .sort(o => o[0] < o[1])
      .map(o => {
        return {
          yyyyMMdd: o,
          body: result[o],
        }
      });
    },
  }
}
</script>