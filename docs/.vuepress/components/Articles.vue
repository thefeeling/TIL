<template>
  <div>
    <a-timeline>
      <a-timeline-item v-for="(item, index) in this.pages" v-bind:key="index">
        <div>{{ item.lastUpdated }}</div>
        <a v-bind:href="item.path">{{ item.title }} </a>
      </a-timeline-item>
    </a-timeline>
  </div>
</template>

<script>
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
      return this.$site.pages;
    },
  }
}
</script>