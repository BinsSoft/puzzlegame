
var config = {
    application : 'Puzzle Bins',
    headerContainer: document.querySelector('.header'),
    container: document.getElementById('puzzle-container'),
    actionContainer: document.getElementById('puzzle-action-container'),
    modalContainer: document.getElementById('modal-box'),
    maxWidth: (window.innerWidth <= 768) ? window.innerWidth : ((window.innerWidth*60)/100) ,
    imageList: [
        'Animale',
        'Bird',
        'Bridge',
        'City',
        'Foods'
    ],
    
    mode : {
        easy : {
            rowNo: 3,
            columnNo: 3,
            countdown : 300,
        },
        medium: {
            rowNo: 5,
            columnNo: 5,
            countdown: 300,
        },
        hard: {
            rowNo: 6,
            columnNo: 6,
            countdown: 300,
        },
    },
    currentCategory: 'Animale',
    currentMode : 'easy',
    currentDrugSlice : '',
    gameStatus : 0,
    helpCount : 10,
    countDown : 0,
    usedTime : 0,
    usedMove : 0,
    remainHelpCount : 10,
    remainCounter : function() {
        return this.remainHelpCount+' remains';
    },
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
    },
    getQueryStringValue: function(key) {
        return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
    }  
}


var Puzzle = {
    _init : function() {

        var queryString = this.getQueryStringValue('q');
        if (queryString) {
            var query = atob(queryString);
            query = JSON.parse(query);
            this.currentCategory = query.c;
            this.currentImage = query.i;
            this.currentMode = query.m;
            this._loadImage();
        } else {
            this.randmomImage();
        }
        
        this.header();
        

        
        howToPlayBtn.addEventListener('click', (function (event) {
            var howToPlayContainer = document.createElement('ul');
            howToPlayContainer.setAttribute('id', 'howToPlayContainer');
            howToPlayContainer.innerHTML = `<li>Select any game mode <strong>(Easy / Medium / Hard)</strong>.</li>
                <li>You can change any category from next dropdown.</li>
                <li>You can change any other picture from next button.</li>
                <li>Start the game by clicking <strong>Start</strong> button.</li>
                <li>After strating the game a new button will open <strong>Want to see actual Picture ?</strong>. This button will help you to see the actual picture. You can  get only 10 chances to check the picture.</li>
                <li>Press the mouse and hold, untill you release the button, you can see the actual picture.</li>
                <li>Just solve the puzzle by drug and drop the right puzzle in right place.</li>
                <li>A timer will start when you click on the <strong>Start</strong> button.</li>
                <li>If you can solve the puzzle within this time, you win. </li>
                <li>Any time you can quit from the game by clicking on <strong>Want to quit</strong> button.</li>`;

            this.modal('How To Play', howToPlayContainer);
            event.preventDefault();
        }).bind(this))
        howToPlayBtn.click();
        var puzzleModeContainer = document.createElement('div');
        puzzleModeContainer.classList.add('puzzle-mode-container');
        for (let pMode in this.mode) {
            let modeElement = document.createElement('button');
            modeElement.classList.add('mode-btn');
            modeElement.classList.add('action-btn');
            if (this.currentMode == pMode) {
                modeElement.classList.add('active');
            }
            modeElement.innerText = pMode;
            modeElement.setAttribute('data-mode', pMode);
            modeElement.addEventListener('click', (function() {
                this.currentMode = pMode;
                let buttons = Array.prototype.slice.call(this.actionContainer.querySelectorAll('.mode-btn'));
                for (let b of buttons) {
                    b.classList.remove('active');
                }
                document.querySelector('[data-mode="' + pMode + '"]').classList.add('active');
                this.setPlayMode(this.currentMode);
                
            }).bind(this));
            
            puzzleModeContainer.appendChild(modeElement);
        }
        this.actionContainer.appendChild(puzzleModeContainer);
        
        var changePicContainer = document.createElement('div');
        changePicContainer.classList.add('change-pic-container');
        

        var selectCategory = document.createElement('select');
        selectCategory.classList.add('select-category');
        for (var c of this.imageList) {
            let option = document.createElement('option');
            option.value = c;
            option.innerText = c;
            if (c == this.currentCategory) {
                option.selected = true;
            }
            selectCategory.appendChild(option);
        }
        selectCategory.addEventListener('change', (function(event){
            
            this.currentCategory = event.target.value;
            this.randmomImage();
        }).bind(this));
        changePicContainer.appendChild(selectCategory);

        var picChangeBtn = document.createElement('button');
        picChangeBtn.classList.add('action-btn');
        picChangeBtn.innerText = 'Change Picture';
        picChangeBtn.addEventListener('click', this.randmomImage.bind(this));
        changePicContainer.appendChild(picChangeBtn);
        /* var shuffleBtn = document.createElement('button');
        shuffleBtn.innerText = 'Shuffle';
        shuffleBtn.addEventListener('click', this.setPlayMode.bind(this));
        changePicContainer.appendChild(shuffleBtn); */

        this.actionContainer.appendChild(changePicContainer);

        var startQuitContainer = document.createElement('div');
        startQuitContainer.classList.add('start-quit-container');

        var startQuitBtn = document.createElement('button');
        startQuitBtn.innerText = 'Start';
        startQuitBtn.classList.add('start-quit-btn');
        startQuitBtn.addEventListener('click', this._startPuzzling.bind(this));
        startQuitContainer.appendChild(startQuitBtn);
        this.startQuitBtn = startQuitBtn;
        this.actionContainer.appendChild(startQuitContainer);

        var helpContainer = document.createElement('div');
        helpContainer.classList.add('help-container');
        var helpBtn = document.createElement('button');
        helpBtn.innerText = 'Want to see actual Picture ?';
        helpBtn.classList.add('help-btn');
        helpBtn.classList.add('hidden');
        helpBtn.addEventListener('mousedown', this._helpPuzzleing.bind(this,'show'));
        helpBtn.addEventListener('mouseup', this._helpPuzzleing.bind(this,'hide'));
        let hepCountText = document.createElement('span');
        hepCountText.innerText = this.remainCounter();
        helpBtn.appendChild(hepCountText);

        this.helpBtn = helpBtn;
        helpContainer.appendChild(helpBtn);
        this.actionContainer.appendChild(helpContainer);


        var heading = document.createElement('div');
        heading.classList.add('action-heading');

        var title = document.createElement('h3');
        title.classList.add('action-heading-title');
        
        title.innerText = '00 : 00';
        this.timerText = title;
        heading.appendChild(title);

        this.actionContainer.appendChild(heading);

        var resultContainer = document.createElement('div');
        resultContainer.classList.add('result-container');
        this.resultContainer = resultContainer;
        this.actionContainer.appendChild(resultContainer);

        
        

    },
    header : function() {
        var logoContainer  = document.createElement('div');
        logoContainer.classList.add('logo');
        let img = new Image;
        img.src = 'img/logo-128.png';
        img.width = 45;
        logoContainer.appendChild(img);
        let spanTitle = document.createElement('span');
        spanTitle.classList.add('app-title');
        spanTitle.innerHTML = this.application.replace(' ','<br/>');
        logoContainer.appendChild(spanTitle);
        this.headerContainer.appendChild(logoContainer);

        var onlineContainer = document.createElement('div');
        onlineContainer.classList.add('online-container');
        onlineContainer.innerText = 'Online Players ';
        var onlineCount = document.createElement('span');
        onlineCount.innerText = Math.floor(Math.random() * (500 - 470 + 1) + 470); // random number  between 470 to 500 
        onlineContainer.appendChild(onlineCount);
        this.headerContainer.appendChild(onlineContainer);
        

        var howToPlayBtn = document.createElement('button');
        howToPlayBtn.classList.add('header-btn');
        howToPlayBtn.classList.add('modal-btn');
        howToPlayBtn.setAttribute('id', 'howToPlayBtn');
        howToPlayBtn.innerText = 'How To Play';
        this.headerContainer.appendChild(howToPlayBtn);

        var challengeBtn = document.createElement('button');
        challengeBtn.innerText = 'Challenge';
        challengeBtn.classList.add('header-btn');
        challengeBtn.classList.add('modal-btn');
        challengeBtn.addEventListener('click', (function () {
            var url = window.location.href+'?q=';
            url += btoa(JSON.stringify({
                m: this.currentMode,
                c: this.currentCategory,
                i: this.currentImage
            }));
            this.modal('Challenge', `
                <div class="challenge-container">
                <input type='text' class='text-challenge' value='`+ url + `'/>
                </div>
            `);
            document.querySelector('.text-challenge').addEventListener('click', function () {
                this.setSelectionRange(0, this.value.length);
            })
        }).bind(this))
        this.headerContainer.appendChild(challengeBtn);  
    },
    modal: function(heading, content) {
        this.modalContainer.classList.remove('hidden');
        this.modalContainer.querySelector('.modal-header').querySelector('h3').innerText = heading;
        this.modalContainer.querySelector('.modal-content').innerHTML = '';
        if (typeof content === 'string') {
            this.modalContainer.querySelector('.modal-content').innerHTML  = content;    
        } else {
            this.modalContainer.querySelector('.modal-content').appendChild(content);
        }
        

        this.modalContainer.querySelector('.close-modal').addEventListener('click', (function (event) {
            this.modalContainer.classList.add('hidden')
            event.preventDefault();
        }).bind(this))
        document.addEventListener("click", (function (event) {
            if (event.target.closest(".modal-custom-container") 
                || event.target.closest(".modal-btn")
        ) return; this.modalContainer.classList.add("hidden");
        }).bind(this));
    },
    setResultMessage : function(status) {
        
        var messageContent = document.createElement('div');
        messageContent.classList.add('result-container')
        let img = new Image();
        img.width = 100;
        messageContent.appendChild(img);
        let msg = document.createElement('p');
        if (status === 1) { // won
            img.src = 'img/thumbs-up.png';
            msg.innerHTML = 'Hooray, you finish in time <br/> You take just <strong>' + this.usedTime + ' sec</strong> and use <strong>' + this.usedMove +' moves</strong>';
        } else { // lost
            img.src = 'img/thumbs-down.png';
            msg.innerHTML = 'Opps, times over. <br/><h4>You fail</h4>Better luck next time';
        }
        messageContent.appendChild(msg);
        this.modal('Your Result ', messageContent);

    },
    setPlayMode : function(modeName) {
        var _self = this;
        _self.slices = [];
        if (modeName && typeof modeName === 'string') {
            _self.currentMode = modeName ;
        }
        var mode = _self.mode[_self.currentMode];
        var totalBlock = mode.columnNo * mode.rowNo;
        new Promise (function(resolve, reject) {
            var slices = Array.prototype.slice.call(document.querySelectorAll('.slice'));
            for (let s of slices) {
                s.parentElement.removeChild(s);
            }
            resolve();
        }).then(function () {
                let containerWidth = parseInt(_self.container.style.width.replace('px',''));
                let containerHeight = parseInt(_self.container.style.height.replace('px', ''));
                var perSliceWidth = (containerWidth / mode.columnNo);
                var perSliceHeight = (containerHeight / mode.rowNo);
                var perSliceBackgroundPositionX = 0;
                var perSliceBackgroundPositionY = - perSliceHeight;
                for (let x = 0; x < totalBlock; x++) {
                    if ((x % mode.columnNo) === 0) {
                        perSliceBackgroundPositionX = 0;
                        perSliceBackgroundPositionY += perSliceHeight;
                    } else {
                        perSliceBackgroundPositionX += perSliceWidth;
                    }
                    let newSlice = document.createElement('span');
                    newSlice.classList.add('slice');
                    newSlice.setAttribute('draggable', true);

                    newSlice.addEventListener('dragstart', _self.drag.bind(_self));
                    newSlice.addEventListener('drop', _self.drop.bind(_self));
                    newSlice.addEventListener('dragover', _self.allowDrop.bind(_self));

                    newSlice.addEventListener('touchstart', _self.allowDrop.bind(_self), false);
                    newSlice.addEventListener('touchmove', _self.drag.bind(_self), false);
                    newSlice.addEventListener('touchend', _self.drop.bind(_self), false);
                    
                    newSlice.style.width = perSliceWidth + "px";
                    newSlice.style.height = perSliceHeight + "px";
                   
                    newSlice.style.backgroundImage = "url('" + _self.imageConfig.src + "')";
                    newSlice.style.backgroundSize = _self.imageConfig.width + 'px ' + _self.imageConfig.height + 'px';
                    newSlice.setAttribute('data-slice', x);
                    newSlice.setAttribute('data-slice-actual', x);
                    newSlice.style.backgroundPositionX = "-" + perSliceBackgroundPositionX + "px";
                    newSlice.style.backgroundPositionY = "-" + perSliceBackgroundPositionY + "px";
                    newSlice.style.left = perSliceBackgroundPositionX + "px";
                    newSlice.style.top = perSliceBackgroundPositionY + "px";
                    _self.container.appendChild(newSlice);
                    _self.slices.push(newSlice);
                }
               
            
        })
    },
    _puzzling : function() {
        var count = 0;
        var _self = this;
        var mode = _self.mode[_self.currentMode];
        var totalBlock = mode.columnNo * mode.rowNo;
        var interval = setInterval(function () {
            var randomElement = _self.getRandom(_self.slices, 2);

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
    },
    _helpPuzzleing : function(display) {
        var slices = Array.prototype.slice.call(document.querySelectorAll('.slice'));
        if (display === 'show') {
            if (this.remainHelpCount > 0) {
                for (let s of slices) {
                    s.classList.add('hidden');
                }
                this.remainHelpCount--;
                let hBtn = this.helpBtn;
                hBtn.querySelector('span').innerText = this.remainCounter();
            } else {
                this.helpBtn.disabled = true;
            }
        } else if (display === 'hide') {
            for (let s of slices) {
                s.classList.remove('hidden');
            }
        }
    },
    _startPuzzling : function() {
        if (this.gameStatus === 0) { // want to play
            this.gameStatus = 1;
            this.startQuitBtn.innerText = 'Want to quit';
            this.helpBtn.classList.remove('hidden');
            
            this._puzzling();

            var btns = Array.prototype.slice.call(document.querySelectorAll('.action-btn'));
            for (let b of btns) {
                b.disabled = true;
            }
            
        } else { // want to stop
            this.resetGame();
        }
        this._setTimer();
    },
    resetGame : function () {
        this.gameStatus = 0;
        this.startQuitBtn.innerText = 'Start';
        this.helpBtn.classList.add('hidden');
        var btns = Array.prototype.slice.call(document.querySelectorAll('.action-btn'));
        for (let b of btns) {
            b.disabled = false;
        }
        this.remainHelpCount = this.helpCount;
        this.helpBtn.querySelector('span').innerText = this.remainCounter();
        this.timerText.innerText = '';
        var slices = Array.prototype.slice.call(document.querySelectorAll('.slice'));
        for (let s of slices) {
            s.parentElement.removeChild(s);
        }
    },
    randmomImage : function() {
        
        var imageIndex = Math.floor(Math.random() * 5);
        var image = 'img/blocks/'+this.currentCategory.toLowerCase()+'/img'+imageIndex+'.jpg';
        
        if (this.currentImage === image) {
            this.randmomImage();
        } else {
            this.currentImage = image;
        }
        this._loadImage();
    },
    _loadImage : function() {
        var image = this.currentImage;
        var newImage = new Image();
        newImage.src = image;
        var _self = this;
        newImage.onload = function () {
            _self.imageConfig = {
                width: _self.maxWidth,
                height: this.height,
                src: this.src
            }
            _self.imageConfig.height = (this.height / this.width) * _self.imageConfig.width;

            _self.container.style.width = _self.imageConfig.width  + "px";
            _self.container.style.height = _self.imageConfig.height + "px";
            _self.container.style.backgroundImage = 'url("' + _self.imageConfig.src + '")';

            if (window.innerWidth === _self.imageConfig.width) {
                _self.actionContainer.style.width = _self.imageConfig.width+'px';
            } else {
                _self.actionContainer.style.width = (window.innerWidth - _self.imageConfig.width - 50)+'px';
            }

            _self.setPlayMode(_self.currentMode);

        }
    },
    _setTimer: function () {

        var self = this;
        
        if (self.gameStatus === 1) { // start
            var timer = self.mode[self.currentMode].countdown;
            
            self.timer = setInterval(function () {
                timer--;
                self.usedTime++;

                let min = parseInt(timer / 60);
                let sec = timer;
                if (sec < 60) {
                    self.timerText.classList.add('glow');
                } else {
                    self.timerText.classList.remove('glow');
                }
                if (min > 0) {
                    sec = timer - min * 60;
                }
                self.timerText.innerText = ((min < 10) ? '0' + min : min) + ' : ' + ((sec < 10) ? '0' + sec : sec);
                if (timer == 0) {
                    clearInterval(self.timer);
                    self.resetGame();
                    self.setResultMessage(0);
                }
            }, 1000)

            
        } else if (self.gameStatus === 0) { // stop
            self.timerText.innerText = '00 : 00';
            clearInterval(self.timer);
        }
        
    },
    allowDrop : function (ev) {
        if (this.gameStatus == 1) {
            ev.preventDefault();
        }
    },
    drag : function (event) {
        if (this.gameStatus == 1) {
            this.currentDrugSlice = event.target.getAttribute('data-slice');
            //event.dataTransfer.setData("text", event.target.getAttribute('data-slice'));
        }
    },
    drop : function (ev) {

        ev.preventDefault();
        var _self = this;
        if (this.gameStatus == 1) {
            var data = this.currentDrugSlice;
            var dragElement = document.querySelector("[data-slice='" + data + "']");
            var dropElement = ev.target;
            new Promise(function (resolve, reject) {
                
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
                var slices = Array.prototype.slice.call(document.querySelectorAll('.slice'));
                for (let s of slices) {
                    if (s.getAttribute('data-slice') === s.getAttribute('data-slice-actual')) {
                        s.style.border = 'none';
                    } else {
                        s.style.border = '1px solid #CCC';
                    }
                }
                _self.usedMove ++ ;
                _self.resultCalculate();
            })
        }
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
                self.setResultMessage(1);
                self.resetGame();
                clearInterval(self.timer);
            }, 1000)
        }
    }
}
Puzzle.__proto__ = config;
Puzzle._init();


