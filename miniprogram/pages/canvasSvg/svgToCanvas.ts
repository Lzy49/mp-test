import { html, renderSVG } from "./cax/cax";
// pages/canvasSvg/svgToCanvas.ts
let ctx = null;
Page({
  data: { svg: null, funs: [] },
  onLoad() {
    this.fun();
  },
  test(e) {
    this.data.funs.forEach(event => {
      event();
      
    });
  },
  fun() {
    const svg = renderSVG(
      html` <svg
        width="300"
        height="${Math.random() * 100}"
        style="border: 1px solid #eee"
      >
        <rect
          x="10"
          y="10"
          width="100"
          height="75"
          style="stroke: black; fill: silver; fill-opacity: 0.4"
          bindtap="test"
        />
      </svg>`,
      "svg-c",
      this
    );
    this.setData({
      funs:[
        ...this.data.funs,
        ()=> {
          console.log(1)
          console.log(svg.children[0])
          svg.children[0].width = 100 * Math.random() + 15
          svg.stage.update();
        }
      ]
    })
    svg.stage.update();
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},
});
