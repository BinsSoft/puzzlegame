var getRandom = function (arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}
var config = {
    container: document.getElementById('pazzle-container'),
    maxWidth: window.innerWidth,
    imageList: [
        'img/img1.jpg',
        'img/img2.jpg',
        'img/img3.jpg',
    ],
    rowNo: 3,
    columnNo: 5,
    slices: []
}
var drag = function (event) {
    event.dataTransfer.setData("text", event.target.getAttribute('data-slice'));
}
var drop = function (ev) {

    ev.preventDefault();
    new Promise(function (resolve, reject) {
        var data = ev.dataTransfer.getData("text");

        var dragElement = document.querySelector("[data-slice='" + data + "']");
        var dropElement = ev.target;
        var firstItem = {
            id: dragElement.getAttribute('data-slice'),
            position: {
                top: dragElement.style.top,
                left: dragElement.style.left
            }
        }
        var secItem = {
            id: dropElement.getAttribute('data-slice'),
            position: {
                top: dropElement.style.top,
                left: dropElement.style.left
            }
        }
        dragElement.style.top = secItem.position.top;
        dragElement.style.left = secItem.position.left;
        dragElement.setAttribute('data-slice', secItem.id);
        dropElement.style.top = firstItem.position.top;
        dropElement.style.left = firstItem.position.left;
        dropElement.setAttribute('data-slice', firstItem.id);
        resolve();
    }).then(function () {
        resultCalculate();
    })

}
var allowDrop = function (ev) {
    ev.preventDefault();
}
var resultCalculate = function () {
    var slices = Array.prototype.slice.call(document.querySelectorAll('.slice'));
    var currentResult = '';
    var exactResult = '';
    for (let s in slices) {
        exactResult += s.toString() + ',';
        currentResult += slices[s].getAttribute('data-slice') + ',';
    }
    if (currentResult === exactResult) {
        setTimeout(function () {
            alert('Hey, You completed successfully');
        }, 1000)
    }
}
var pazzle = function () {
    var image = config.imageList[Math.floor(Math.random() * config.imageList.length)];
    var newImage = new Image();
    newImage.src = image;
    newImage.onload = function () {
        var imageConfig = {
            width: (this.width > window.innerWidth) ? window.innerWidth : this.width,
            height: this.height,
            src: this.src
        }
        imageConfig.height = (this.height / this.width) * imageConfig.width;

        config.container.style.width = imageConfig.width + "px";
        config.container.style.height = imageConfig.height + "px";
        config.container.style.backgroundImage = 'url("' + imageConfig.src + '")';


        var perSliceWidth = (imageConfig.width / config.columnNo);
        var perSliceHeight = (imageConfig.height / config.rowNo);
        var perSliceBackgroundPositionX = 0;
        var perSliceBackgroundPositionY = -perSliceHeight;
        var totalBlock = config.columnNo * config.rowNo;
        new Promise(function (resolve, reject) {

            for (let x = 0; x < totalBlock; x++) {
                if ((x % config.columnNo) === 0) {
                    perSliceBackgroundPositionX = 0;
                    perSliceBackgroundPositionY += perSliceHeight;
                } else {
                    perSliceBackgroundPositionX += perSliceWidth;
                }
                let newSlice = document.createElement('span');
                newSlice.classList.add('slice');
                newSlice.setAttribute('draggable', true);
                newSlice.addEventListener('dragstart', drag, false);
                newSlice.addEventListener('touchmove', drag, false);
                newSlice.addEventListener('drop', drop, false);
                newSlice.addEventListener('touchend', drop, false);
                newSlice.addEventListener('dragover', allowDrop, false);
                newSlice.addEventListener('touchstart', allowDrop, false);

                newSlice.style.width = perSliceWidth + "px";
                newSlice.style.height = perSliceHeight + "px";
                newSlice.style.backgroundImage = "url('" + imageConfig.src + "')";
                newSlice.style.backgroundSize = imageConfig.width + 'px ' + imageConfig.height + 'px';
                newSlice.setAttribute('data-slice', x);
                newSlice.style.backgroundPositionX = "-" + perSliceBackgroundPositionX + "px";
                newSlice.style.backgroundPositionY = "-" + perSliceBackgroundPositionY + "px";
                newSlice.style.left = perSliceBackgroundPositionX + "px";
                newSlice.style.top = perSliceBackgroundPositionY + "px";
                config.container.appendChild(newSlice);
                config.slices.push(newSlice);
            }
            resolve();
        }).then(function () {
            var count = 0;
            var interval = setInterval(function () {
                var randomElement = getRandom(config.slices, 2);

                var firstItem = {
                    id: randomElement[0].getAttribute('data-slice'),
                    position: {
                        top: randomElement[0].style.top,
                        left: randomElement[0].style.left,
                    }
                }
                var secItem = {
                    id: randomElement[1].getAttribute('data-slice'),
                    position: {
                        top: randomElement[1].style.top,
                        left: randomElement[1].style.left,
                    }
                }
                randomElement[0].style.top = secItem.position.top;
                randomElement[0].style.left = secItem.position.left;
                randomElement[0].setAttribute('data-slice', secItem.id);
                randomElement[1].style.top = firstItem.position.top;
                randomElement[1].style.left = firstItem.position.left;
                randomElement[1].setAttribute('data-slice', firstItem.id);
                count++;
                if (count == totalBlock) {
                    clearInterval(interval);
                }
            }, 50);
        })

    }
}

pazzle();