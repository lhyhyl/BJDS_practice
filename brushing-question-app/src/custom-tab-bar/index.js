Component({
  data: {
    selected: 0,
    color: "#999999",
    selectedColor: "#1890ff",
    list: [
      {
        pagePath: "/pages/index/index",
        text: "首页",
      },
      {
        pagePath: "/pages/category/index",
        text: "分类",
      },
      {
        pagePath: "/pages/practice/index",
        text: "练习",
      },
      {
        pagePath: "/pages/mine/index",
        text: "我的",
      },
    ],
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      wx.switchTab({ url });
      this.setData({
        selected: data.index,
      });
    },
  },
});
