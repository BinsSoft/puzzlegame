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
    imageList: [
        'img/img1.jpg',
        'img/img2.jpg',
        'img/img3.jpg',
    ],
    rowNo : 3,
    columnNo : 5,
    slices : []
}
var drag = function (event) {
    event.dataTransfer.setData("text", event.target.getAttribute('data-slice'));
}
var drop = function(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var dragElement = document.querySelector("[data-slice='" + data + "']");
    var dropElement = event.target;
    var firstItemPosition = {
        top: dragElement.style.top,
        left: dragElement.style.left,
    }
    var secItemPosition = {
        top: dropElement.style.top,
        left: dropElement.style.left,
    }
    dragElement.style.top = secItemPosition.top;
    dragElement.style.left = secItemPosition.left;
    dropElement.style.top = firstItemPosition.top;
    dropElement.style.left = firstItemPosition.left;
    resultCalculate();
}
var allowDrop = function(ev) {
    ev.preventDefault();
}
var resultCalculate  = function() {
    var slices = document.querySelectorAll('.slices');
    var result = "";
    var currentResult = "";
    var totalBlock = config.columnNo * config.rowNo; 
    for (let x = 0; x < totalBlock; x++) {
        result += x.toString();
    }
    for (let s of slices) {
        currentResult += s.getAttribute('data-slice'); 
    }
    console.log(result, currentResult);
}
var pazzle = function() {
    
    var image = config.imageList[Math.floor(Math.random() *config.imageList.length) ];
    var newImage = new Image();
    newImage.src = image;
    newImage.onload = function(){
        var imageConfig = {
            width: this.width,
            height: this.height,
            src : this.src
        }
        config.container.style.width = imageConfig.width + "px";
        config.container.style.height = imageConfig.height + "px";

        var perSliceWidth = (imageConfig.width / config.columnNo);
        var perSliceHeight = (imageConfig.height / config.rowNo);
        var perSliceBackgroundPositionX = 0;
        var perSliceBackgroundPositionY = -perSliceHeight;
        var totalBlock = config.columnNo * config.rowNo; 
        new Promise(function(resolve, reject){
            
            for (let x = 0; x < totalBlock; x++) {
                if ((x % config.columnNo) === 0) {
                    perSliceBackgroundPositionX = 0;
                    perSliceBackgroundPositionY += perSliceHeight;
                } else {
                    perSliceBackgroundPositionX += perSliceWidth;
                }
                let newSlice = document.createElement('span');
                newSlice.classList.add('slice');
                newSlice.setAttribute('draggable',true);
                newSlice.addEventListener('dragstart', drag , false);
                newSlice.addEventListener('drop', drop, false);
                newSlice.addEventListener('dragover', allowDrop, false);
                
                newSlice.style.width = perSliceWidth + "px";
                newSlice.style.height = perSliceHeight + "px";
                newSlice.style.backgroundImage = "url('" + imageConfig.src + "')";
                newSlice.setAttribute('data-slice',x);
                newSlice.style.backgroundPositionX = "-" + perSliceBackgroundPositionX + "px";
                newSlice.style.backgroundPositionY = "-" + perSliceBackgroundPositionY + "px";
                newSlice.style.left =  perSliceBackgroundPositionX + "px";
                newSlice.style.top = perSliceBackgroundPositionY + "px";
                config.container.appendChild(newSlice);
                config.slices.push(newSlice);
            }
            resolve();
        }).then(function () {
            var count = 0;
            var interval = setInterval(function(){
                var randomElement = getRandom(config.slices,2);
                var firstItemPosition = {
                    top : randomElement[0].style.top,
                    left : randomElement[0].style.left,
                }
                var secItemPosition = {
                    top: randomElement[1].style.top,
                    left: randomElement[1].style.left,
                }
                randomElement[0].style.top = secItemPosition.top;
                randomElement[0].style.left = secItemPosition.left;
                randomElement[1].style.top = firstItemPosition.top;
                randomElement[1].style.left = firstItemPosition.left;
                count++;
                if (count == 10) {
                    clearInterval(interval);
                }
            },500);
        })
        
    }
}

pazzle();