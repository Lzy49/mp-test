import { weBtoa } from "./boat";
Page({
  data: {
    src: "",
    events: {},
    updateing: null,
  },
  onLoad: function () {
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
  getDOMInfo(id: string) {
    return new Promise((resolve) => {
      const query = wx.createSelectorQuery();
      query.select("#" + id).boundingClientRect();
      query.selectViewport().scrollOffset();
      query.exec(function (res) {
        resolve(res);
      });
    });
  },
  getBase64Url(svgText: string, w: number, h: number) {
    if (!svgText) {
      return "";
    }
    const agreement = "data:image/svg+xml;base64,";
    svgText =
      `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
      svgText +
      "</svg>";
    // 必须这样搭配，可以支持中文且可编码成base64， 别问为什么... 好困....
    svgText = encodeURIComponent(svgText);
    const base64Url = weBtoa(unescape(svgText));

    return agreement + base64Url;
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
              clientX: item.clientX,
              clientY: item.clientY,
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
  play(rects: any, { clear, drawRect, update, addEvent, contextInfo }: any) {
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
      update();
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
      that.getDOMInfo("image").then((res) => {
        const container = res[0];
        let SVG = "";
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
            y: container.top || 0,
            x: container.left || 0,
            width: container.width,
            height: container.height,
          },
          addEvent,
          update,
        });
        function clear() {
          SVG = ``;
          that.update(SVG);
        }
        function drawRect(aRect: any) {
          SVG += `<rect x="${aRect.x}" y="${aRect.y}" width="${aRect.width}" height="${aRect.height}" style="fill:${aRect.fill}; pointer-events: none;"></rect>`;
        }
        function update() {
          that.update(SVG);
        }
      });
    });
  },
  update(str: string) {
    if (this.data.updateing === null) {
      this.data.updateing = str; 
      setTimeout(() => {
        const file = this.getBase64Url(this.data.updateing, 300, 300);
        this.setData({
          src: file,
          updateing: null,
        });
      }, 33);
    }
    this.data.updateing = str;
  },
});
