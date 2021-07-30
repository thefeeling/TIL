<template>
  <div>
      <template v-for="(item) in this.pages">
        <h3 v-bind:key="item.yyyyMMdd">{{ item.yyyyMMdd }}</h3>
        <div v-for="(page, index, key) in item.body" :affix="false" v-bind:key="key">
          <a v-bind:href="page.path">{{ page.title }}</a>
        </div>
      </template>
  </div>
</template>

<script>
import moment from 'moment';
import * as R from 'ramda';


export default {
  name: 'Articles',
  data() {
    return {};
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
        const date = moment(lastUpdated || '07/28/2021', "MM/DD/YYYY, LTS");
        const yyyyMMdd = date.format('YYYY-MM-DD');
        const hhMMss = date.format('hh:mm:ss');
        const unix = date.unix();
        return {
          yyyyMMdd,
          hhMMss,
          unix,
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
      const result = R.groupBy(o => o.yyyyMMdd)(list);
      return Object.keys(result)
      .sort((a, b) => (a > b) ? -1 : ((a < b) ? 1 : 0))
      .map(o => ({
        yyyyMMdd: o,
        body: result[o].sort((a, b) => {
          return (a.unix > b.unix) ? -1 : ((a.unix < b.unix) ? 1 : 0);
        }),
      }));
    },
  }
}
</script>