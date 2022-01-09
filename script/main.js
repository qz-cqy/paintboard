function run(canvas, obj) {
    obj = obj || {};
    this.canvas = canvas;
    this.cvs = canvas.getContext("2d");
    this.bgColor = obj.bgColor || "#e8e8e8";
    this.clickedColor = obj.clickedColor || "#000000";
    this.boxSize = obj.boxSize || 5;
    this.bgWidthLength = 0;
    this.bgHeightLength = 0;
    this.history = [];
    this.step = -1;
    this.color = {};
    this.start();
    this.click();
    return this;
}

run.prototype.start = function () {
    this.bgWidthLength = parseInt(this.canvas.width / this.boxSize);
    this.bgHeightLength = parseInt(this.canvas.height / this.boxSize);
    this.drawBg();
};

run.prototype.click = function () {
    let move = this.mousemove.bind(this);
    this.canvas.addEventListener("mousedown", function (e) {
        let o = this.computedXY(e.offsetX, e.offsetY);
        this.doClick(o);
        this.canvas.addEventListener("mousemove", move);
    }.bind(this));
    this.canvas.addEventListener("mouseup", function (e) {
        this.canvas.removeEventListener("mousemove", move);
    }.bind(this));
};

run.prototype.mousemove = function (e) {
    console.log(e.offsetX, e.offsetY);
    let o = this.computedXY(e.offsetX, e.offsetY);
    this.doClick(o, true);
};

run.prototype.computedXY = function (x, y) {
    for (let i = 0; i < this.bgWidthLength; i++) {
        if (x > i * this.boxSize && x < (i + 1) * this.boxSize) {
            x = i;
            break;
        }
    }
    for (let i = 0; i < this.bgHeightLength; i++) {
        if (y > i * this.boxSize && y < (i + 1) * this.boxSize) {
            y = i;
            break;
        }
    }
    return { x, y };
};

run.prototype.calcPos = function(x, y) {
    return y * this.bgWidthLength + x + 1;
}

run.prototype.doClick = function (o, draw) {
    let pos = this.calcPos(o.x, o.y);
    console.log(o, pos);
    o.c = this.color[pos] != null ? this.color[pos] : this.bgColor;
    o.t = this.clickedColor;
    ++this.step;
    if (this.step < this.history.length) this.history.length = this.step;
    this.history.push(o);
    this.color[pos] = this.clickedColor;
    this.drawBgBox(o.x * this.boxSize, o.y * this.boxSize, this.clickedColor);
    console.log(this.color, this.history, this.step);
};

run.prototype.Random = function (length) {
    for (let i = 0; i < length; i++) {
        let o = {};
        o.x = parseInt(Math.random() * this.bgWidthLength);
        o.y = parseInt(Math.random() * this.bgHeightLength);
        this.doClick(o);
    }
};

run.prototype.clear = function () {
    this.history.forEach(function (o, index) {
        this.drawBgBox(o.x * this.boxSize, o.y * this.boxSize, this.bgColor);
    }.bind(this));
    this.history = [];
    this.step = -1;
    this.color = {};
};

run.prototype.undo = function () {
    if (this.step == -1) alert("不能再继续撤销了！");
    else {
        let x = this.history[this.step].x;
        let y = this.history[this.step].y;
        let c = this.history[this.step].c;
        let t = this.history[this.step].t;
        this.color[this.calcPos(x, y)] = c;
        this.drawBgBox(x * this.boxSize, y * this.boxSize, c);
        --this.step;
    }
};

run.prototype.redo = function () {
    if (this.step == this.history.length - 1) alert("已经是最后一步了！");
    else {
        ++this.step;
        let x = this.history[this.step].x;
        let y = this.history[this.step].y;
        let c = this.history[this.step].c;
        let t = this.history[this.step].t;
        this.color[this.calcPos(x, y)] = t;
        this.drawBgBox(x * this.boxSize, y * this.boxSize, t);
    }
};

run.prototype.drawBg = function () {
    for (let i = 0; i < this.bgHeightLength; i++) {
        for (let j = 0; j < this.bgWidthLength; j++) {
            this.drawBgBox(j * this.boxSize, i * this.boxSize, this.bgColor);
        }
    }
    this.load();
};

run.prototype.load = function () {
    console.log("loading...");
    let tmp = localStorage.ruier_paintboard;
    if (tmp != null && tmp != undefined && tmp != "undefined") {
        this.history = JSON.parse(tmp);
        while (this.step < this.history.length - 1) {
            this.redo();
        }
    }
};

run.prototype.drawBgBox = function (x, y, c) {
    this.cvs.beginPath();
    this.cvs.fillStyle = c;
    this.cvs.fillRect(x + 1, y + 1, this.boxSize - 1, this.boxSize - 1);
    this.cvs.fill();
    this.cvs.stroke();
    this.cvs.closePath();
};

let canvas = document.querySelector(".paintboard canvas");
let cvs = canvas.getContext("2d");
let a = new run(canvas);

let clear = document.querySelector(".clear");
let random = document.querySelector(".random");
let setcolor = document.querySelector(".setcolor");
let eraser = document.querySelector(".eraser");
let undo = document.querySelector(".undo");
let redo = document.querySelector(".redo");
let save = document.querySelector(".save");
let down = document.querySelector(".download");

function autoDownload() {
    let checkbox = document.getElementsByName("autodownload")[0];
    if (checkbox.checked) return true;
    return false;
}

clear.onclick = function () {
    if (autoDownload()) down.click();
    a.clear();
};

random.onclick = function () {
    if (autoDownload()) down.click();
    a.Random(100);
};

setcolor.onclick = function () {
    let input = document.getElementsByName("color")[0];
    let regex1 = /^\#[0-9a-f]{3}$/, regex2 = /^#[0-9a-f]{6}$/;
    let x = regex1.exec(input.value), y = regex2.exec(input.value);
    if (x != null) {
        input.value = x[0];
        a.clickedColor = x[0];
    }
    else if (y != null) {
        input.value = y[0];
        a.clickedColor = y[0];
    }
    else {
        input.value = "16 进制颜色代码不合法！";
        alert("16 进制颜色代码不合法！");
    }
};

eraser.onclick = function () {
    let input = document.getElementsByName("color")[0];
    input.value = a.bgColor;
    a.clickedColor = a.bgColor;
};

undo.onclick = function () {
    a.undo();
}

redo.onclick = function () {
    a.redo();
}

down.onclick = function () {
    let imgUrl = canvas.toDataURL('image/png');
    let saveA = document.createElement('a');
    document.body.appendChild(saveA);
    saveA.href = imgUrl;
    saveA.download = 'mypic' + (new Date).getTime();
    saveA.target = '_blank';
    saveA.click();
};

save.onclick = function () {
    console.log("saved!");
    localStorage.ruier_paintboard = JSON.stringify(a.history);
}

setInterval(function () {
    let checkbox = document.getElementsByName("autosave")[0];
    if (checkbox.checked) save.click();
}, 60000);