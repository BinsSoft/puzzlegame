
var config = {
    container: document.getElementById('puzzle-container'),
    actionContainer: document.getElementById('puzzle-action-container'),
    maxWidth: (window.innerWidth <= 768) ? window.innerWidth : ((window.innerWidth*70)/100) ,
    imageList: [
        'img/img1.jpg',
        'img/img2.jpg',
        'img/img3.jpg',
    ],
    rowNo: 3,
    columnNo: 5,
    slices: [],
    getRandom : function (arr, n) {
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
}


var Puzzle = {
    
    action : function() {
        var heading = document.createElement('div');
        heading.classList.add('action-heading');

        var title = document.createElement('h3');
        title.classList.add('action-heading-title');
        heading.appendChild(title);

        this.actionContainer.appendChild(heading);

        var self = this;
        (function(){
            var timer = 0;
            self.timer = setInterval(function(){
                ++timer;
                let min = parseInt(timer / 60);
                let sec = timer;
                if (min > 0) {
                    sec = timer - min * 60;
                }
                title.innerText = ((min<10)?'0'+min : min ) +' : '+ ((sec<10)? '0'+sec : sec) ;
            },1000)
        })()
    },

    game : function() {
        var image = this.imageList[Math.floor(Math.random() * this.imageList.length)];
        var newImage = new Image();
        newImage.src = image;
        var config = this;
        newImage.onload = function () {
            var imageConfig = {
                width: config.maxWidth,
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

                    newSlice.addEventListener('dragstart', config.drag, false);
                    newSlice.addEventListener('drop', config.drop, false);
                    newSlice.addEventListener('dragover', config.allowDrop, false);

                    /* newSlice.addEventListener('touchstart', allowDrop, false);
                    newSlice.addEventListener('touchmove', drag, false);
                    newSlice.addEventListener('touchend', drop, false); */

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
                    var randomElement = config.getRandom(config.slices, 2);

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
                        Puzzle.action();
                    }
                }, 50);
            })

        }
    },
    allowDrop : function (ev) {
        ev.preventDefault();
    },
    drag : function (event) {
        event.dataTransfer.setData("text", event.target.getAttribute('data-slice'));
    },
    drop : function (ev) {

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
            Puzzle.resultCalculate();
        })

    },
    resultCalculate : function () {
        
        var slices = Array.prototype.slice.call(document.querySelectorAll('.slice'));
        var currentResult = '';
        var exactResult = '';
        for (let s in slices) {
            exactResult += s.toString() + ',';
            currentResult += slices[s].getAttribute('data-slice') + ',';
        }
        if (currentResult === exactResult) {
            var self = this;
            setTimeout(function () {
                alert('Hey, You completed successfully');
                clearInterval(self.timer);
            }, 1000)
        }
    }
}
Puzzle.__proto__ = config;
Puzzle.game();


