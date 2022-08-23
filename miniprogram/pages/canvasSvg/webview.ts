const app = getApp<IAppOption>();
Page({
  data: {
    type: "",
    url: "",
  },
  // 事件处理函数
  onLoad(option) {
    switch (option.type) {
      case "canvas-canvas":
        this.setData({
          url: "https://lzy49.github.io/svg-canvas-test/canvas.html",
        });
        break;
      case "canvas-svg":
        this.setData({
          url: "https://lzy49.github.io/svg-canvas-test/svg.html",
        });
    }
  },
});
