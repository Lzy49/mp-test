// pages/canvasSvg/canvas.ts
Page({
  /**
   * 页面的初始数据
   */
  data: {
    events: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.createContext().then((res) => {
      const rects = [
        {
          x: 75,
          y: 75,
          width: 100,
          height: 100,
          fill: "rgba(155,155,250,.9)",
        },
        {
          x: 125,
          y: 125,
          width: 100,
          height: 100,
          fill: "rgba(250,155,155,.9)",
        },
      ];
      this.play(
        rects.map((item) => Object.assign({}, item)),
        res
      );
    });
  },

  play(rects: any, { clear, drawRect, addEvent, contextInfo }: any) {
    render();
    // 点击
    watchClick();
    watchMove();
    function watchMove() {
      let path: any[] = [];
      let scale = 1;
      addEvent("touchmove", (e: any) => {
        catchPath(e);
        if (path.length === 2) {
          isZoom();
        }
      });
      addEvent("touchend", () => {
        path = [];
        rects = setScale(scale);
        scale = 1;
      });
      function isZoom() {
        const initDistance = getDistance(path[0][0], path[1][0]);
        const distance = getDistance(
          path[0][path[0].length - 1],
          path[1][path[1].length - 1]
        );
        scale = distance / initDistance;
        render(scale);
      }
      function catchPath(touches: any) {
        for (let i = 0; i < touches.length; i++) {
          path[i] || (path[i] = []);
          const { clientX, clientY } = touches[i];
          path[i].push({
            x: clientX,
            y: clientY,
          });
        }
      }
    }
    function watchClick() {
      addEvent("click", (e: any) => {
        const i = catchItem(e);
        if (i !== -1) {
          const item = rects[i];
          rects.splice(i, 1);
          rects.push(item);
          render();
        }
      });
    }
    // 计算点在那个图形中
    function catchItem(e) {
      let { clientX, clientY } = e;
      clientY = clientY - contextInfo.y;
      clientX = clientX - contextInfo.x;
      console.log(e,contextInfo)
      for (let i = rects.length - 1; i >= 0; i--) {
        const item = rects[i];
        const { x, y, width, height } = item;
        if (clientX - x > 0 && clientX - x < width) {
          if (clientY - y > 0 && clientY - y < height) {
            return i;
          }
        }
      }
      return -1;
    }
    function render(scale = 1) {
      clear();
      drawItems(scale);
      function drawItems(scale: any) {
        setScale(scale).forEach(drawRect);
      }
    }
    function setScale(scale: any) {
      return rects.map((item: any) => {
        const { x, y, width, height } = item;
        return {
          ...item,
          x: x - (width * (scale - 1)) / 2,
          y: y - (height * (scale - 1)) / 2,
          width: width * scale,
          height: height * scale,
        };
      });
    }
    function getDistance(p1: any, p2: any) {
      let dep = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
      return dep;
    }
  },
  createContext() {
    const that = this;
    return new Promise((resolve) => {
      wx.createSelectorQuery()
        .select("#canvas") // 在 WXML 中填入的 id
        .fields({ node: true, size: true })
        .exec((res) => {
          // Canvas 对象
          const canvas = res[0].node;
          // 渲染上下文
          const ctx = canvas.getContext("2d");
          // Canvas 画布的实际绘制宽高
          const width = res[0].width;
          const height = res[0].height;
          // 初始化画布大小
          const dpr = wx.getWindowInfo().pixelRatio;
          canvas.width = width * dpr;
          canvas.height = height * dpr;
          ctx.scale(dpr, dpr);
          function addEvent(event, fn) {
            that.data.events[event] || (that.data.events[event] = []);
            that.data.events[event].push(fn);
            that.setData({
              events: that.data.events,
            });
          }
          resolve({
            clear,
            drawRect,
            contextInfo: {
              y: canvas._top || 0,
              x: canvas._left || 0,
              width: canvas._width,
              height: canvas._height,
            },
            addEvent,
            context: canvas,
          });
          function clear() {
            let w = canvas.width;
            let h = canvas.height;
            ctx.clearRect(0, 0, w, h);
          }
          function drawRect(aRect: any) {
            ctx.fillStyle = aRect.fill;
            ctx.fillRect(aRect.x, aRect.y, aRect.width, aRect.height);
          }
        });
    });
  },
  touch(e) {
    switch (e.type) {
      case "tap":
        this.data.events["click"].forEach((event) =>
          event({
            clientX: e.detail.x,
            clientY: e.detail.y,
          })
        );
        break;
      case "touchmove":
        this.data.events["touchmove"].forEach((event) =>
          event(
            e.touches.map((item) => ({
              clientX: item.x,
              clientY: item.y,
            }))
          )
        );
        break;
      case "touchend":
        this.data.events["touchend"].forEach((event) => event(e.touches));
        break;
      default:
    }
  },
});
