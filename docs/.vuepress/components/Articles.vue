<template>
  <a-list item-layout="horizontal" :data-source="this.pages">
    <a-list-item slot="renderItem" slot-scope="item, index">
      <a-list-item-meta
        description="Ant Design, a design language for background applications, is refined by Ant UED Team"
      >
        <a slot="title" href="https://www.antdv.com/">{{ item.title }}</a>
      </a-list-item-meta>
    </a-list-item>
  </a-list>
</template>

<script>
export default {
  name: 'Articles',

  components: {},

  data() {
    return { 
      data
    };
  },
  methods:{

  },
  mounted() {
  },
  computed: {
    pages() {
      debugger;
      return this.$root.$themeConfig.sidebar;
    },
  }
}
</script>