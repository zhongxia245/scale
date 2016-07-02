/***************************************************
 * 时间: 16/7/2 18:35
 * 作者: 从腾讯新闻 下载的代码
 * 使用方式
 document.addEventListener("DOMContentLoaded", function(event){
		ImagesZoom.init({
			"elem": ".primary"
		});
	}, false);
 *
 ***************************************************/
(function (window, undefined) {
  var document = window.document,
    support = {
      transform3d: ("WebKitCSSMatrix" in window && "m11" in new WebKitCSSMatrix()),
      touch: ("ontouchstart" in window)
    };

  function getTranslate(x, y) {
    var distX = x,
      distY = y;
    return support.transform3d ? "translate3d(" + distX + "px, " + distY + "px, 0)" : "translate(" + distX + "px, " + distY + "px)";
  }

  function getPage(event, page) {
    return support.touch ? event.changedTouches[0][page] : event[page];
  }

  var ImagesZoom = function () {
  };

  ImagesZoom.prototype = {
    // 缁欏垵濮嬪寲鏁版嵁
    init: function (param) {
      var self = this;
      var params = param || {};

      //添加图片放大容器,缩放, 放大, 移动
      if (document.querySelectorAll('.imgzoom_pack').length === 0) {
        var section = document.createElement('section')
        section.classList.add('imgzoom_pack')
        var scaleHtml = "";
        scaleHtml += '  <div class="imgzoom_x">X</div>'
        scaleHtml += '  <div class="imgzoom_img"><img src></div>'
        section.innerHTML = scaleHtml;
        document.body.appendChild(section)
      }

      var imgList = document.querySelectorAll(params.elem + " img");
      var zoomMask = document.querySelector(".imgzoom_pack");
      var zoomImg = document.querySelector(".imgzoom_pack .imgzoom_img img");
      var zoomClose = document.querySelector(".imgzoom_pack .imgzoom_x");
      var imgSrc = "";

      self.buffMove = 3; //缂撳啿绯绘暟
      self.buffScale = 2; //鏀惧ぇ绯绘暟
      self.finger = false; //瑙︽懜鎵嬫寚鐨勭姸鎬� false锛氬崟鎵嬫寚 true锛氬鎵嬫寚

      self._destroy();

      zoomClose.addEventListener("click", function () {
        zoomMask.style.cssText = "display:none";
        zoomImg.src = "";
        zoomImg.style.cssText = "";

        self._destroy();

        document.removeEventListener("touchmove", self.eventStop, false);
      }, false);

      for (var len = imgList.length, i = 0; i < len; i++) {
        imgList[i].addEventListener("click", function () {
          imgSrc = this.getAttribute("src");
          zoomMask.style.cssText = "display:block";
          zoomImg.src = imgSrc;

          zoomImg.onload = function () {
            zoomImg.style.cssText = "margin-top:-" + (zoomImg.offsetHeight / 2) + "px";

            // 绂佹椤甸潰婊氬姩
            document.addEventListener("touchmove", self.eventStop, false);

            self.imgBaseWidth = zoomImg.offsetWidth;
            self.imgBaseHeight = zoomImg.offsetHeight;

            self.addEventStart({
              wrapX: zoomMask.offsetWidth,
              wrapY: zoomMask.offsetHeight,
              mapX: zoomImg.width,
              mapY: zoomImg.height
            });
          }
        }, false);
      }
    },
    addEventStart: function (param) {
      var self = this,
        params = param || {};

      self.element = document.querySelector(".imgzoom_pack img");

      //config set
      self.wrapX = params.wrapX || 0; //鍙鍖哄煙瀹藉害
      self.wrapY = params.wrapY || 0; //鍙鍖哄煙楂樺害
      self.mapX = params.mapX || 0; //鍦板浘瀹藉害
      self.mapY = params.mapY || 0; //鍦板浘楂樺害

      self.outDistY = (self.mapY - self.wrapY) / 2; //鍥剧墖瓒呰繃涓€灞忕殑鏃跺€欐湁鐢�

      self.width = self.mapX - self.wrapX; //鍦板浘鐨勫搴﹀噺鍘诲彲瑙嗗尯鍩熺殑瀹藉害
      self.height = self.mapY - self.wrapY; //鍦板浘鐨勯珮搴﹀噺鍘诲彲瑙嗗尯鍩熺殑楂樺害

      self.element.addEventListener("touchstart", function (e) {
        self._touchstart(e);
      }, false);
      self.element.addEventListener("touchmove", function (e) {
        self._touchmove(e);
      }, false);
      self.element.addEventListener("touchend", function (e) {
        self._touchend(e);
      }, false);
    },
    // 閲嶇疆鍧愭爣鏁版嵁
    _destroy: function () {
      this.distX = 0;
      this.distY = 0;
      this.newX = 0;
      this.newY = 0;

    },
    // 鏇存柊鍦板浘淇℃伅
    _changeData: function () {
      this.mapX = this.element.offsetWidth; //鍦板浘瀹藉害
      this.mapY = this.element.offsetHeight; //鍦板浘楂樺害
      // this.outDistY = (this.mapY - this.wrapY)/2; //褰撳浘鐗囬珮搴﹁秴杩囧睆骞曠殑楂樺害鏃跺€欍€傚浘鐗囨槸鍨傜洿灞呬腑鐨勶紝杩欐椂绉诲姩鏈変釜楂樺害鍋氫负缂撳啿甯�
      this.width = this.mapX - this.wrapX; //鍦板浘鐨勫搴﹀噺鍘诲彲瑙嗗尯鍩熺殑瀹藉害
      this.height = this.mapY - this.wrapY; //鍦板浘鐨勯珮搴﹀噺鍘诲彲瑙嗗尯鍩熺殑楂樺害
    },
    _touchstart: function (e) {
      var self = this;

      self.tapDefault = false;
      // self.tapDefaultY = false;

      e.preventDefault();

      var touchTarget = e.targetTouches.length; //鑾峰緱瑙︽帶鐐规暟

      self._changeData(); //閲嶆柊鍒濆鍖栧浘鐗囥€佸彲瑙嗗尯鍩熸暟鎹紝鐢变簬鏀惧ぇ浼氫骇鐢熸柊鐨勮绠�

      if (touchTarget == 1) {
        // 鑾峰彇寮€濮嬪潗鏍�
        self.basePageX = getPage(e, "pageX");
        self.basePageY = getPage(e, "pageY");

        self.finger = false;
      } else {
        self.finger = true;

        self.startFingerDist = self.getTouchDist(e).dist;
        self.startFingerX = self.getTouchDist(e).x;
        self.startFingerY = self.getTouchDist(e).y;
      }
      /*console.log("pageX: " + getPage(e, "pageX"));
       console.log("pageY: " + getPage(e, "pageY"));*/
    },
    _touchmove: function (e) {
      var self = this;
      self.tapDefault = true;
      e.preventDefault();
      e.stopPropagation();

      // console.log("event.changedTouches[0].pageY: " + event.changedTouches[0].pageY);

      var touchTarget = e.targetTouches.length; //鑾峰緱瑙︽帶鐐规暟

      if (touchTarget == 1 && !self.finger) {

        self._move(e);
      }

      if (touchTarget >= 2) {
        self._zoom(e);
      }
    },
    _touchend: function (e) {
      var self = this;
      console.log(self.tapDefault)

      if (!self.finger && !self.tapDefault) {
        var zoomMask = document.querySelector(".imgzoom_pack"),
          zoomImg = document.querySelector(".imgzoom_pack .imgzoom_img img");
        zoomMask.style.cssText = "display:none";
        zoomImg.src = "";
        zoomImg.style.cssText = "";

        self._destroy();

        document.removeEventListener("touchmove", self.eventStop, false);
        return
      }
      ;
      self._changeData(); //閲嶆柊璁＄畻鏁版嵁
      if (self.finger) {
        self.distX = -self.imgNewX;
        self.distY = -self.imgNewY;
      }

      if (self.distX > 0) {
        self.newX = 0;
      } else if (self.distX <= 0 && self.distX >= -self.width) {
        self.newX = self.distX;
        self.newY = self.distY;
      } else if (self.distX < -self.width) {
        self.newX = -self.width;
      }


      self.reset();
    },
    _move: function (e) {

      var self = this,
        pageX = getPage(e, "pageX"), //鑾峰彇绉诲姩鍧愭爣
        pageY = getPage(e, "pageY");

      // 绂佹榛樿浜嬩欢
      // e.preventDefault();
      // e.stopPropagation();

      /*self.tapDefaultX = pageX - self.basePageX;
       self.tapDefaultY = pageY - self.basePageY;*/
      // 鑾峰緱绉诲姩璺濈
      self.distX = (pageX - self.basePageX) + self.newX;
      self.distY = (pageY - self.basePageY) + self.newY;

      if (self.distX > 0) {
        self.moveX = Math.round(self.distX / self.buffMove);
      } else if (self.distX <= 0 && self.distX >= -self.width) {
        self.moveX = self.distX;
      } else if (self.distX < -self.width) {
        self.moveX = -self.width + Math.round((self.distX + self.width) / self.buffMove);
      }
      self.movePos();
      self.finger = false;
    },
    // 鍥剧墖缂╂斁
    _zoom: function (e) {
      var self = this;
      // e.preventDefault();
      // e.stopPropagation();

      var nowFingerDist = self.getTouchDist(e).dist, //鑾峰緱褰撳墠闀垮害
        ratio = nowFingerDist / self.startFingerDist, //璁＄畻缂╂斁姣�
        imgWidth = Math.round(self.mapX * ratio), //璁＄畻鍥剧墖瀹藉害
        imgHeight = Math.round(self.mapY * ratio); //璁＄畻鍥剧墖楂樺害

      // 璁＄畻鍥剧墖鏂扮殑鍧愭爣
      self.imgNewX = Math.round(self.startFingerX * ratio - self.startFingerX - self.newX * ratio);
      self.imgNewY = Math.round((self.startFingerY * ratio - self.startFingerY) / 2 - self.newY * ratio);

      if (imgWidth >= self.imgBaseWidth) {
        self.element.style.width = imgWidth + "px";
        self.refresh(-self.imgNewX, -self.imgNewY, "0s", "ease");
        self.finger = true;
      } else {
        if (imgWidth < self.imgBaseWidth) {
          self.element.style.width = self.imgBaseWidth + "px";
        }
      }

      self.finger = true;
    },
    // 绉诲姩鍧愭爣
    movePos: function () {
      var self = this;

      if (self.height < 0) {
        if (self.element.offsetWidth == self.imgBaseWidth) {
          self.moveY = Math.round(self.distY / self.buffMove);
          // console.log(self.moveY +"111")
        } else {
          var moveTop = Math.round((self.element.offsetHeight - self.imgBaseHeight) / 2);
          self.moveY = -moveTop + Math.round((self.distY + moveTop) / self.buffMove);
          // console.log(self.moveY +"222")
        }
      } else {
        var a = Math.round((self.wrapY - self.imgBaseHeight) / 2),
          b = self.element.offsetHeight - self.wrapY + Math.round(self.wrapY - self.imgBaseHeight) / 2;

        if (self.distY >= -a) {
          self.moveY = Math.round((self.distY + a) / self.buffMove) - a;
          // console.log(self.moveY +"333")
        } else if (self.distY <= -b) {
          self.moveY = Math.round((self.distY + b) / self.buffMove) - b;
          // console.log(self.moveY +"444")
        } else {
          self.moveY = self.distY;
          // console.log(self.moveY +"555")
        }
      }
      self.refresh(self.moveX, self.moveY, "0s", "ease");
    },
    // 閲嶇疆鏁版嵁
    reset: function () {
      var self = this,
        hideTime = ".2s";
      if (self.height < 0) {
        self.newY = -Math.round(self.element.offsetHeight - self.imgBaseHeight) / 2;
      } else {
        var a = Math.round((self.wrapY - self.imgBaseHeight) / 2),
          b = self.element.offsetHeight - self.wrapY + Math.round(self.wrapY - self.imgBaseHeight) / 2;

        if (self.distY >= -a) {
          self.newY = -a;
        } else if (self.distY <= -b) {
          self.newY = -b;
        } else {
          self.newY = self.distY;
        }
      }
      self.refresh(self.newX, self.newY, hideTime, "ease-in-out");
    },
    // 鎵ц鍥剧墖绉诲姩
    refresh: function (x, y, timer, type) {
      this.element.style.webkitTransitionProperty = "-webkit-transform";
      this.element.style.webkitTransitionDuration = timer;
      this.element.style.webkitTransitionTimingFunction = type;
      this.element.style.webkitTransform = getTranslate(x, y);
    },
    // 鑾峰彇澶氱偣瑙︽帶
    getTouchDist: function (e) {
      var x1 = 0,
        y1 = 0,
        x2 = 0,
        y2 = 0,
        x3 = 0,
        y3 = 0,
        result = {};

      x1 = e.touches[0].pageX;
      x2 = e.touches[1].pageX;
      y1 = e.touches[0].pageY - document.body.scrollTop;
      y2 = e.touches[1].pageY - document.body.scrollTop;

      if (!x1 || !x2) return;

      if (x1 <= x2) {
        x3 = (x2 - x1) / 2 + x1;
      } else {
        x3 = (x1 - x2) / 2 + x2;
      }
      if (y1 <= y2) {
        y3 = (y2 - y1) / 2 + y1;
      } else {
        y3 = (y1 - y2) / 2 + y2;
      }

      result = {
        dist: Math.round(Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))),
        x: Math.round(x3),
        y: Math.round(y3)
      };
      return result;
    },
    eventStop: function (e) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  window.ImagesZoom = new ImagesZoom();
})(this);
/*  |xGv00|e265149d8101b256799ca6fa116fac35 */