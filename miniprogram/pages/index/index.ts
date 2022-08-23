// index.ts
// 获取应用实例
const app = getApp<IAppOption>();

Page({
  data: {},
  // 事件处理函数
  onLoad() {},
  to(e) {
    console.log(e.target.dataset.url)
    wx.navigateTo({
      url:e.target.dataset.url,
    });
  },
});
