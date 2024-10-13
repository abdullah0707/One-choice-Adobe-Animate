var canvas, stage, exportRoot, anim_container, dom_overlay_container, fnStartAnimation;

var soundsArr;
//var video, video_div;
var clickSd, goodSd, errorSd, infoSd, timeOutSd,popUpSd1, popUpSd2,
    rightFbSd, wrongFbSd, tryFbSd, tryTimeFbSd;

var quizNum = 1,
    numOfAns = 4,
    currentQ = 1,
    correctAns = false;

var score = 0,
    prevAns = null;

var attempts = 0,
    maxAttempts = 3;

var overOut = [];
var retryV = false;
var l = console.log;

var timerInterval = null,
	timerFrame = 0,
	timeCounter = 60;

var arabicNums = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
var isFirefox = typeof InstallTrigger !== 'undefined';

function init() {
	canvas = document.getElementById("canvas");
	anim_container = document.getElementById("animation_container");
	dom_overlay_container = document.getElementById("dom_overlay_container");
	var comp=AdobeAn.getComposition("E129F071783AAD489B5902931D3A50C6");
	var lib=comp.getLibrary();
	var loader = new createjs.LoadQueue(false);
	loader.addEventListener("fileload", function(evt){handleFileLoad(evt,comp)});
	loader.addEventListener("complete", function(evt){handleComplete(evt,comp)});
	var lib=comp.getLibrary();
	loader.loadManifest(lib.properties.manifest);
}
function handleFileLoad(evt, comp) {
	var images=comp.getImages();	
	if (evt && (evt.item.type == "image")) { images[evt.item.id] = evt.result; }	
}

function handleComplete(evt, comp) {
    //This function is always called, irrespective of the content. You can use the variable "stage" after it is created in token create_stage.
    var lib = comp.getLibrary();
    var ss = comp.getSpriteSheet();
    var queue = evt.currentTarget;
    var ssMetadata = lib.ssMetadata;
    for (i = 0; i < ssMetadata.length; i++) {
        ss[ssMetadata[i].name] = new createjs.SpriteSheet({
            "images": [queue.getResult(ssMetadata[i].name)],
            "frames": ssMetadata[i].frames
        })
    }
	exportRoot = new lib.L4V9();

    stage = new lib.Stage(canvas);
    //Registers the "tick" event listener.
    fnStartAnimation = function () {
        stage.addChild(exportRoot);
        stage.enableMouseOver(10);
        createjs.Touch.enable(stage);
       /* document.ontouchmove = function (e) {
            e.preventDefault();
        }*/
        stage.mouseMoveOutside = true;
        stage.update();
        createjs.Ticker.setFPS(lib.properties.fps);
        createjs.Ticker.addEventListener("tick", stage);
        prepareTheStage();
    }
    //Code to support hidpi screens and responsive scaling.
    function makeResponsive(isResp, respDim, isScale, scaleType) {
        var lastW, lastH, lastS = 1;
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        function resizeCanvas() {
            var w = lib.properties.width,
                h = lib.properties.height;
            var iw = window.innerWidth,
                ih = window.innerHeight;
            var pRatio = window.devicePixelRatio || 1,
                xRatio = iw / w,
                yRatio = ih / h,
                sRatio = 1;
            if (isResp) {
                if ((respDim == 'width' && lastW == iw) || (respDim == 'height' && lastH == ih)) {
                    sRatio = lastS;
                } else if (!isScale) {
                    if (iw < w || ih < h)
                        sRatio = Math.min(xRatio, yRatio);
                } else if (scaleType == 1) {
                    sRatio = Math.min(xRatio, yRatio);
                } else if (scaleType == 2) {
                    sRatio = Math.max(xRatio, yRatio);
                }
            }
            canvas.width = w * pRatio * sRatio;
            canvas.height = h * pRatio * sRatio;
            canvas.style.width = dom_overlay_container.style.width = anim_container.style.width = w * sRatio + 'px';
            canvas.style.height = anim_container.style.height = dom_overlay_container.style.height = h * sRatio + 'px';
            stage.scaleX = pRatio * sRatio;
            stage.scaleY = pRatio * sRatio;
            lastW = iw;
            lastH = ih;
            lastS = sRatio;
            stage.tickOnUpdate = false;
            stage.update();
            stage.tickOnUpdate = true;
            canvas.style.display = "block";
            anim_container.style.display = "block";
        }
    }
   makeResponsive(true, 'both', true, 1);
	 prepareTheStage();
    AdobeAn.compositionLoaded(lib.properties.id);

    fnStartAnimation();
    exportRoot["playBtn"].cursor = "pointer";
    exportRoot["playBtn"].addEventListener("click", playFn);
}

function playFn(){
	stopAllSounds();
	clickSd.play();
exportRoot.play();
}

function prepareTheStage() {
	timerTxt = exportRoot.timerTxt;
    overOut = [exportRoot["retryBtn"], exportRoot["showAnsBtn"],
               exportRoot["confirmBtn"],
               exportRoot["startBtn"]
            ];
    
    for (var i = 0; i < overOut.length; i++) {
        l(i)
        overOut[i].cursor = "pointer";
        overOut[i].on("mouseover", over);
        overOut[i].on("mouseout", out);
    }


    clickSd = new Howl({
        src: ['sounds/click.mp3']
    });
    goodSd = new Howl({
        src: ['sounds/good.mp3']
    });
    errorSd = new Howl({
        src: ['sounds/error.mp3']
    });
    timeOutSd = new Howl({
        src: ['sounds/timeOutSd.mp3']
    });
    rightFbSd = new Howl({
        src: ['sounds/rightFbSd.mp3']
    });
    wrongFbSd = new Howl({
        src: ['sounds/wrongFbSd.mp3']
    });
    timeFbSd = new Howl({
        src: ['sounds/timeFbSd.mp3']
    });
    tryFbSd = new Howl({
        src: ['sounds/tryFbSd.mp3']
    });
    nashat = new Howl({
        src: ['sounds/nashat.mp3']
    });
    intro = new Howl({
        src: ['sounds/intro.mp3']
    });
    quizSd = new Howl({
        src: ['sounds/quizSd.mp3']
    });

    soundsArr = [clickSd, goodSd, errorSd, nashat, intro, quizSd, tryFbSd,
                 timeOutSd, rightFbSd, wrongFbSd, timeFbSd];
    stopAllSounds();

    for (var i = 1; i <= numOfAns; i++) {
        exportRoot["ans" + i].id = i;
    }
    	    exportRoot["startBtn"].addEventListener("click", function(){
		 stopAllSounds();
		clickSd.play();
       // clearTimeoutsFn();
        exportRoot.play();
    });
  //  exportRoot["nextBtn"].addEventListener("click", nextQFn);

    
   
    exportRoot["confirmBtn"].addEventListener("click", confirmFN);
    
    exportRoot["retryBtn"].addEventListener("click", retryFN);
    exportRoot["showAnsBtn"].addEventListener("click", function () {
        //hideFB();
        stopAllSounds();
        exportRoot["showAnsBtn"].alpha = 0;
        exportRoot["answers"].alpha = 1;
        exportRoot["answers"].gotoAndPlay(0);
    });

    hideFB();
}

function clearTimeoutsFn() {
    for (var t = 0; t < timeoutsArr.length; t++) {
        clearTimeout(timeoutsArr[t])
    }
    timeoutsArr = [];
}

function hideFB() {
    exportRoot["wrongFB"].alpha = 0;
    exportRoot["wrongFB"].playV = false;
    exportRoot["rightFB"].alpha = 0;
    exportRoot["rightFB"].playV = false;
    exportRoot["tryFB"].alpha = 0;
    exportRoot["tryFB"].playV = false;
  //  exportRoot["tryTimeFB"].alpha = 0;
  //  exportRoot["tryTimeFB"].playV = false;
 
  //  exportRoot["score"].alpha = 0;
    exportRoot["answers"].alpha = 0;
    exportRoot["confirmBtn"].alpha = 0;
    exportRoot["confirmBtn"].gotoAndStop(0);
    exportRoot["retryBtn"].alpha = 0;
    exportRoot["retryBtn"].gotoAndStop(0);
    exportRoot["showAnsBtn"].alpha = 0;
    exportRoot["showAnsBtn"].gotoAndStop(0);
   // exportRoot["nextBtn"].alpha = 0;
   // exportRoot["nextBtn"].gotoAndStop(0);
    exportRoot["hideSymb"].alpha = 0;
	
	  //  timerTxt.alpha = 0;
   // exportRoot.timerBox.alpha = 0;
}

function stopAllSounds() {
    for (var s = 0; s < soundsArr.length; s++) {
        soundsArr[s].stop();
    }
}

function activateButtons() {
    for (var i = 1; i <= numOfAns; i++) {
        if(prevAns == null || i !== prevAns.id){
            exportRoot["ans" + i].clicked = false;
            exportRoot["ans" + i].cursor = "pointer";
            exportRoot["ans" + i].addEventListener("click", chooseAnsFn);
            exportRoot["ans" + i].addEventListener("mouseover", overAnswerd);
            exportRoot["ans" + i].addEventListener("mouseout", out);
        }
        if(retryV){
            exportRoot["ans" + i].gotoAndStop(0);
        }
    }
    
    if(prevAns == null){
        //exportRoot["nextBtn"].alpha = 0;
        exportRoot["confirmBtn"].alpha = 0;
    }else{
       // exportRoot["nextBtn"].alpha = 1;
        exportRoot["confirmBtn"].alpha = 1;
    }
    
}

function deactivateButtons() {
    for (var i = 1; i <= numOfAns; i++) {
        exportRoot["ans" + i].cursor = "auto";
        exportRoot["ans" + i].removeEventListener("click", chooseAnsFn);
        exportRoot["ans" + i].removeEventListener("mouseover", overAnswerd);
        exportRoot["ans" + i].removeEventListener("mouseout", out);
    }
    
   // exportRoot["nextBtn"].alpha = 0;
    exportRoot["confirmBtn"].alpha = 0;

}

function chooseAnsFn(e2){
    stopAllSounds();
    clickSd.play();
    if(prevAns !== null){
        prevAns.cursor = "pointer";
        prevAns.gotoAndStop(0);
        prevAns.addEventListener("click", chooseAnsFn);
        prevAns.addEventListener("mouseover", over);
        prevAns.addEventListener("mouseout", out);
    }
        
    e2.currentTarget.gotoAndStop(1);
    e2.currentTarget.cursor = "auto";
    e2.currentTarget.removeEventListener("click", chooseAnsFn);
    e2.currentTarget.removeEventListener("mouseover", over);
    e2.currentTarget.removeEventListener("mouseout", out);
    prevAns = e2.currentTarget;
    
    if(e2.currentTarget.id == currentQ){
        correctAns = true;
    }else{
        correctAns = false;
    }

 //   exportRoot["nextBtn"].alpha = 1;
    exportRoot["confirmBtn"].alpha = 1;
}

function checkAns(){
    clickSd.play();
  
    deactivateButtons();
    if(correctAns){
        score++;
    }
    prevAns = null;
}

function confirmFN() {
    //hideFB();
    //stopAllSounds();
    //clickSd.play();
	 clearInterval(timerInterval);
    checkAns();
    if (score == quizNum) {
        exportRoot["rightFB"].playV = true;
        exportRoot["rightFB"].alpha = 1;
        exportRoot["rightFB"].gotoAndPlay(0);
		//setTimeout(function(){exportRoot["showAnsBtn"].alpha = 1;}, 6500);
		  
    } else {
        attempts++;
        if(attempts == maxAttempts){
            exportRoot["wrongFB"].playV = true;
            exportRoot["wrongFB"].alpha = 1;
            exportRoot["wrongFB"].gotoAndPlay(0);
			
			//setTimeout(function(){exportRoot["showAnsBtn"].alpha = 1;}, 6500);
        }else{
            exportRoot["tryFB"].playV = true;
            exportRoot["tryFB"].alpha = 1;
            exportRoot["tryFB"].gotoAndPlay(0);
			//setTimeout(function(){exportRoot["retryBtn"].alpha = 1;},6500);
			  
        }
    }
}

// function nextQFn(){
//   exportRoot.addChild(exportRoot["hideSymb"]);
//     currentQ++;
//     checkAns();
// 	/*exportRoot.play();
// 		activateButtons();*/
//     createjs.Tween.get(exportRoot["hideSymb"], {
//         override: true
//     }).to({
//         alpha: 1
//     }, 300, createjs.Ease.easeOut).call(function(){
//         exportRoot.play();
//     //    exportRoot["timerSymb"].gotoAndStop(timeCounter);
//         createjs.Tween.get(exportRoot["hideSymb"], {
//             override: true
//         }).to({
//             alpha: 0
//         }, 100, createjs.Ease.easeOut);
//         setTimeout(activateButtons, 50);
//         //setTimeout(Timer, 100);  
//     });  
// }

function retryFN() {
    currentQ = 1;
    score = 0;
    prevAns = null;
    stopAllSounds();
    clickSd.play();
  //  exportRoot.gotoAndPlay("firstQFrame");
    retryV = true;
    activateButtons();
    retryV = false;
    hideFB();
    Timer();
}

function over(e) {
    e.currentTarget.gotoAndStop(1);
}

function overAnswerd(e) {
    e.currentTarget.gotoAndStop(1);
}
function out(e) {
    e.currentTarget.gotoAndStop(0);
}

function Timer() {
	timeCounter = 60;
	timerFrame = 0;
	exportRoot["timerSymb"].gotoAndStop(timerFrame);
	timerInterval = setInterval(timerFn, 1000);
}

function timerFn() {
	timerFrame++;
	timeCounter--;
	exportRoot["timerSymb"].gotoAndStop(timerFrame);
	if (timeCounter == 0) {
		timeOut();
	}
}

/*function timeOut() {
    clearInterval(timerInterval);
    exportRoot.timerBox.gotoAndStop(1);
    exportRoot["confirmBtn"].alpha = 0;
    exportRoot["confirmBtn"].gotoAndStop(0);
    deactivateButtons();
    stopAllSounds();
    timeOutSd.play();
    setTimeout(nextQFn, 800);
}*/

function timeOut() {
    deactivateButtons();
    clearInterval(timerInterval);
    stopAllSounds();
    timeOutSd.play();
    setTimeout(function () {
        correctAns = false;
  if(currentQ == quizNum){
            attempts++;
            if(attempts == maxAttempts){
                exportRoot["wrongFB"].playV = true;
                exportRoot["wrongFB"].alpha = 1;
                exportRoot["wrongFB"].gotoAndPlay(0);
				// setTimeout(function(){exportRoot["showAnsBtn"].alpha = 1;}, 6500);	
            }else{
                exportRoot["tryFB"].playV = true;
                exportRoot["tryFB"].alpha = 1;
                exportRoot["tryFB"].gotoAndPlay(0);
				// setTimeout(function(){exportRoot["retryBtn"].alpha = 1;},6500);
            }
       }
			   }, 800);
}
	
function showScore(){
    exportRoot["score"].playV = true;
    exportRoot["score"].alpha = 1;
    exportRoot["score"].gotoAndPlay(0);
}

function replaceDigits(num) {
    let ArNum = "";
    for (let n = 0; n < num.toString().length; n++) {
        ArNum += arabicNums[parseInt(num.toString()[n])];
    }
    return ArNum;
}



/*
function exitFullscreen() {
    //toggle full screen
    var isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null) ||
        (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
        (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
        (document.msFullscreenElement && document.msFullscreenElement !== null);

    //var docElm = document.documentElement;
    if (!isInFullScreen) {
        if (docElm.requestFullscreen) {
            docElm.requestFullscreen();
        } else if (docElm.mozRequestFullScreen) {
            docElm.mozRequestFullScreen();
        } else if (docElm.webkitRequestFullScreen) {
            docElm.webkitRequestFullScreen();
        } else if (docElm.msRequestFullscreen) {
            docElm.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    //}
}*/
