"use strict";

const canvasEngraving = Object.create(null);

Object.defineProperties(canvasEngraving, {
    'smallSize': {
        value: 650
    },
    'largeSize': {
        value: 1500
    },
    'params': {
        get: function () {
            return {
                'smallReplaceElement': this.small_replace_el,
                'largeReplaceElement': this.large_replace_el,
                'inputElement': this.input_el,
                'radioElements': this.radio_el,
                'minChar': this.min_char,
                'maxChar': this.max_char,
                'fonts': this.fonts_arr,
                'posX': this.pos_x,
                'posY': this.pos_y,
                'angle': this.rotate_angle,
                'radius': this.arc_radius,
                'skewX': this.skew_x,
                'skewY': this.skew_y
            }
        },
        set: function (data) {
            data['smallReplaceElement'] != null ? this.small_replace_el = data['smallReplaceElement'] : null;
            data['largeReplaceElement'] != null ? this.large_replace_el = data['largeReplaceElement'] : null;
            data['inputElement'] != null ? this.input_el = data['inputElement'] : null;
            data['radioElements'] != null ? this.radio_el = data['radioElements'] : null;
            data['minChar'] != null ? this.min_char = data['minChar'] : null;
            data['maxChar'] != null ? this.max_char = data['maxChar'] : null;
            data['fonts'] != null ? this.fonts_arr = data['fonts'] : null;
            data['posX'] != null ? this.pos_x = +data['posX'] : null;
            data['posY'] != null ? this.pos_y = +data['posY'] : null;
            data['angle'] != null ? this.rotate_angle = +data['angle'] : null;
            data['radius'] != null ? this.arc_radius = +data['radius'] : null;
            data['skewX'] != null ? this.skew_x = +data['skewX'] : null;
            data['skewY'] != null ? this.skew_y = +data['skewY'] : null;
        },
        configurable: true
    },
    'canvasEl': {
        writable: true
    },
    'largeCanvasEl': {
        writable: true
    },
    'canvasCtx': {
        writable: true
    },
    'largeCanvasCtx': {
        writable: true
    },
    'text': {
        writable: true
    },
    'webFontApiLoaded': {
        value: false,
        writable: true
    },
    'webFontApiLink': {
        value: 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js'
    }
});

canvasEngraving.isParamsFull = function () {
    for (let item in this.params) {
        if (this.params.hasOwnProperty(item)) {
            if (this.params[item] == null) {
                return false;
            }
        }
    }
    return true;
};

canvasEngraving.getMaxZIndex = function (node) {
    let maxIndex = 1;
    if (node) {
        const childrenColl = node.children;
        if (childrenColl) {
            for (let item in childrenColl) {
                if (childrenColl.hasOwnProperty(item)) {
                    if (childrenColl[item].style.zIndex > maxIndex) {
                        maxIndex = childrenColl[item].style.zIndex;
                    }
                }
            }
        }
    }
    return +maxIndex;
};

canvasEngraving.init = function () {
    if (this.isParamsFull()) {
        this.small_replace_el = document.querySelector(this.small_replace_el);
        this.large_replace_el = document.querySelector(this.large_replace_el);
        this.input_el = document.querySelector(this.input_el);
        this.radio_el = document.querySelectorAll(this.radio_el);
        if (this.small_replace_el && this.input_el) {
            const allScriptEl = document.getElementsByTagName('script');
            const gFontsScript = document.createElement('script');
            const engCanvas = document.createElement('canvas');
            const engCanvasId = 'ce-' + new Date().getTime();
            engCanvas.width = this.smallSize;
            engCanvas.height = this.smallSize;
            engCanvas.classList.add('canvas_engraving');
            engCanvas.style.width = 'auto';
            engCanvas.style.height = 'auto';
            engCanvas.style.maxWidth = '100%';
            engCanvas.style.maxHeight = '100%';
            engCanvas.style.zIndex = this.getMaxZIndex(this.small_replace_el) + 10;
            const largeEngCanvas = engCanvas.cloneNode(true);
            engCanvas.setAttribute('id', engCanvasId);
            largeEngCanvas.setAttribute('id', engCanvasId + '-l');
            largeEngCanvas.width = this.largeSize;
            largeEngCanvas.height = this.largeSize;
            this.small_replace_el.appendChild(engCanvas);
            this.canvasEl = this.small_replace_el.querySelector('#' + engCanvasId);
            this.canvasCtx = this.canvasEl.getContext('2d');
            if (this.large_replace_el) {
                const ctxScale = +(this.largeSize / this.smallSize).toFixed(1);
                this.large_replace_el.appendChild(largeEngCanvas);
                this.largeCanvasEl = this.large_replace_el.querySelector('#' + engCanvasId + '-l');
                this.largeCanvasCtx = this.largeCanvasEl.getContext('2d');
                this.largeCanvasCtx.setTransform(ctxScale, 0, 0, ctxScale, 0, 0);
            }
            gFontsScript.src = this.webFontApiLink;
            gFontsScript.setAttribute('type', 'text/javascript');
            for (let s in allScriptEl) {
                if (allScriptEl.hasOwnProperty(s)) {
                    if (allScriptEl[s].src === this.webFontApiLink) {
                        this.webFontApiLoaded = true;
                    }
                }
            }
            if (!this.webFontApiLoaded) {
                if (allScriptEl) {
                    const currentScript = allScriptEl[0];
                    const fontsArr = this.fonts_arr;
                    const _this = this;
                    document.body.insertBefore(gFontsScript, currentScript);
                    gFontsScript.onload = function () {
                        WebFont.load({
                            google: {
                                families: fontsArr
                            },
                            active: _this.setDefaultControls()
                        });
                    };
                }
                else {
                    document.body.appendChild(gFontsScript);
                }
            }
            else {
                this.setDefaultControls()
            }
            this.setTextStyle(this.canvasCtx);
            this.setTextStyle(this.largeCanvasCtx);
            this.setListeners();
        }
    }
};

canvasEngraving.setTextStyle = function (ctx) {
    if (ctx) {
        ctx.strokeStyle = '#cecfd4';
        ctx.lineWidth = 1;
        ctx.fillStyle = "#4c4c4c";
    }
};

canvasEngraving.setDefaultControls = function () {
    this.setFont(this.fonts_arr[0], this.canvasCtx);
    this.setFont(this.fonts_arr[0], this.largeCanvasCtx);
    this.input_el.value = '';
    if (this.radio_el) {
        for (let item in this.radio_el) {
            if (this.radio_el.hasOwnProperty(item)) {
                if (this.radio_el[item].value === this.fonts_arr[0]) {
                    this.radio_el[item].checked = true;
                }
            }
        }
    }
};

canvasEngraving.setListeners = function () {
    const maxLength = this.max_char;
    const _this = this;
    this.input_el.addEventListener('input', function () {
        if (this.value.length > maxLength) {
            this.value = this.value.substr(0, maxLength);
        }
        if (this.value !== _this.text) {
            if (this.value.length && this.value.length <= maxLength) {
                _this.clearText(_this.canvasCtx);
                _this.clearText(_this.largeCanvasCtx);
                _this.drawText(this.value, _this.canvasCtx);
                _this.drawText(this.value, _this.largeCanvasCtx);
                _this.text = this.value;
            }
            else {
                _this.text = '';
                _this.clearText(_this.canvasCtx);
                _this.clearText(_this.largeCanvasCtx);
            }
        }
    });
    if (this.radio_el) {
        for (let item in this.radio_el) {
            if (this.radio_el.hasOwnProperty(item)) {
                this.radio_el[item].addEventListener('change', function () {
                    _this.setFont(this.value, _this.canvasCtx);
                    _this.setFont(this.value, _this.largeCanvasCtx);
                });
            }
        }
    }
};


canvasEngraving.drawText = function (text, ctx) {
    if (text && ctx) {
        if (text.length < this.max_char) {
            let lengthDiff = this.max_char - text.length;
            for (let i = 0; i <= lengthDiff; i++) {
                i % 2 === 0 ? text += ' ' : text = ' ' + text;
            }
        }
        if (this.skew_x || this.skew_y) {
            ctx.setTransform(1, this.skew_x, this.skew_y, 1, 0, 0);
            ctx.fillText(text, this.pos_x, this.pos_y);
        }
        if (this.arc_radius != null) {
            if (this.arc_radius < 0) {
                let reverseText = '';
                for (let ch = text.length - 1; ch >= 0; ch--) {
                    reverseText += text[ch];
                }
                text = reverseText;
            }
            let spacedText = '';
            for (let ch = 0; ch < text.length; ch++) {
                if (text[ch].match(/[W]/g)) {
                    spacedText += ' ' + text[ch];
                }
                else {
                    spacedText += text[ch];
                }
            }
            text = spacedText;
            const textLength = text.length;
            ctx.save();
            ctx.translate(this.pos_x, this.pos_y);
            ctx.rotate(-1 * this.rotate_angle / 2);
            ctx.rotate(-1 * (this.rotate_angle / textLength) / 2);
            for (var n = 0; n < textLength; n++) {
                const char = text[n];
                ctx.rotate(this.rotate_angle / textLength);
                ctx.save();
                ctx.translate(0, -1 * this.arc_radius);
                ctx.strokeText(char, -0.5, -0.5);
                ctx.fillText(char, 0, 0);
                ctx.restore();
            }
            ctx.restore();
        }
    }
};

canvasEngraving.clearText = function (ctx) {
    if (ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
};

canvasEngraving.setFont = function (fontSku, ctx) {
    if (this.fonts_arr && ctx) {
        let fontName = this.fonts_arr[0];
        if (fontSku && typeof fontSku === 'string') fontName = fontSku;
        ctx.font = '18px ' + fontName;
        if (this.text) {
            this.clearText(ctx);
            this.drawText(this.text, ctx);
        }
    }
};