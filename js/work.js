(function(){

var $window = $(window);
var windowWidth =  $window.width();
var windowHeight = $window.height();
var sliderHeight = 860, oldSliderHeight = 860, maxSliderHeight = 860;
var desiredPercent = 0.75, resizePercent = 1; // resizePercent will be computed based on the desired percent of screen to be filled
var $curSlider = null, $curDragbar = null, $instructionTooltip = null, $contact = null, $prevSlider = null, curSliderID = null, $container = null;	// give these selectors global scope
var anims = {};					// an object containing information regarding the animations for the current slider
var curScrollPos = 0, prevScrollPos = 0, changeInScrollPos = 0;			// the position of the scrollbar in pixels
var curSliderInnerWidth = 0, unseenSliderInnerWidth = 0;
var offsetScrollRange = 0.15 * windowWidth;	// the position at which the animations should be completed
var parallaxLayers;
var container;
var $curVideo = null;
var contactFormVisible = false;
if (windowHeight < 1160) {
	resizePercent = (desiredPercent * windowHeight) / 860;
}
var sliders = {
	'lff': { 'url': 'lff.html', 'animation': animateLFF }, 
	'holy': { 'url': 'holy.html', 'animation': animateHoly },
	'sweetbay': { 'url': 'sweetbay.html', 'animation': animateSweetbay },
	'tour': { 'url': 'tour.html', 'animation': animateTour },
	'florida': { 'url': 'florida.html', 'animation': animateFlorida },
	'design': { 'url': 'design.html', 'animation': animateDesign },
	'bayfront': { 'url': 'bayfront.html', 'animation': animateBayfront },
	'studios': { 'url': 'studios.html', 'animation': animateStudios },
	'relaj': { 'url': 'relaj.html', 'animation': animateRelaj },
	'passion': { 'url': 'passion.html', 'animation': animatePassion },
	'sparkday': { 'url': 'spark-day.php?resizePercent=' + resizePercent, 'animation': animateSparkDay },
	'onset': { 'url': 'onset.php?resizePercent=' + resizePercent, 'animation': animateOnSet },
	'clock': { 'url': 'clock.php?resizePercent=' + resizePercent, 'animation': animateClock },
	'shame': { 'url': 'shame.php?resizePercent=' + resizePercent, 'animation': animateShame }
};


$(document).ready(function () {
	
    // remove upon production mode
	$.ajaxSetup({ cache: false });
	
	updateViewportSettings();	
    
    // lock images/prevent images from being dragged
    $('.slider').bind('dragstart', function (event) {
        event.preventDefault()
    });
    
	// setup the accordion the sliders are stored in
    $("#accordion").accordion({
        active: false,
        animated: false,
        autoHeight: false,
        collapsible: true		
    });
    
    setupContactForm();
	
	// opens one of the sliders automatically
	autoOpenSlider();
    
    // bind the events that need to happen for our accordion to work
    $('.ui-accordion').bind('accordionchange', function (event, ui) {

        $prevSlider = $curSlider;
        $prevDragbar = $curDragbar;
        $curSlider = ui.newContent; // jQuery object, activated content
        prevSliderID = curSliderID;
        curSliderID = $curSlider.attr('id');
        
        // if $prevSlider is not null and not the same as $curSlider, it means we are closing a slider
        if (typeof $prevSlider !== "undefined" && $prevSlider !== null) {
        	// console.log("closing slider. new slider is "  + $curSlider.attr("id") + " the old slider was " + $prevSlider.attr("id"))
        	onSliderClose();        
        }
		beforeLoadSliderHTML();
		loadSliderHTML($curSlider, onSliderLoaded)
		
    });
     

});

function updateViewportSettings() {
		
	if ($.browser.mobile) {
		viewport = document.querySelector("meta[name=viewport]");
		viewport.setAttribute('content', 'width=device-width; initial-scale=0.65; maximum-scale=0.65; user-scalable=1;');
	}

};

function autoOpenSlider() {

	// automatically opens the provided slider, e.g. work.html#florida opens the visit florida slider
	// if non provided, auto opens the first slider after 2 seconds

    var hash = window.location.hash;
    var index = 0;
  	var timeout = 0;
  	
  	switch(hash)
	{
		case "#lff": case "#passion":
			index = 0;
	  		break;
		case "#florida": case "#clock":
	  		index = 1;
	  		break;
		case "#tour": case "#sparkday":
	  		index = 2;
	  		break;
	  	case "#relaj": case "#onset":
	  		index = 3;
	  		break;
	  	case "#sweetbay": case "#shame":
	  		index = 4;
	  		break;
	  	case "#bayfront":
	  		index = 5;
	  		break;
	  	case "#studios":
	  		index = 6;
	  		break;
		default:
			index = 0;
			timeout = 1000;
			break;	
		return;
	}
    
    setTimeout(function() {
    
    	// if the user clicks a slider before the timeout, do not open another
    	if ($("#accordion").accordion("option", "active") === false)
    		$('#accordion').accordion('activate', index)
    
    }, timeout);
};


// modifies the css of the title of the current slider
function toggleTitle($slider) {
	
	var $slider = $("#" + $slider.attr("id")  + "-title");
	
	// console.log($slider.attr('id'));
	$slider.toggleClass('active-title').toggleClass('title');
	
};

function toggleLoadingTitle() {
//	$("#" + curSliderID + "-title-hide").toggleClass('hide');
}

function loadSliderHTML(slider, callback) {

	var id = slider.attr('id');
	
	if (sliders[id] == undefined)
		return;
	
	var url = sliders[id]['url'];
	var animation = sliders[id]['animation'];	
	
	// if the slider's HTML has not yet been loaded make an ajax request for it, then run its animation
	if (!slider.data('loaded')) {
    	slider.load('sliders/' + url, function() {   		

			beforeSliderLoaded();
		   
		   // only once the images are finished loading do we trigger the onSliderLoaded function();  		
			var $images = $curSlider.find('img');
			var imagesCount = $images.size() || 0;
			var imagesLoaded = 0;
						
			if (imagesCount === 0) {
				// run the onSLiderLoaded event and pass the current slider to it
		    	onSliderLoaded(function() {
	    			animation();
	    			$curSlider.find("img").each(function() {
	    			
	    			});
	    			
	    		});				
			}
			else {
				$images.load ( function() {
		             ++imagesLoaded;
		             if (imagesLoaded >= imagesCount) {		
						// run the onSLiderLoaded event and pass the current slider to it
				    	onSliderLoaded(function() {
			    			animation();
			    		});
						
		             }
				}); 	    		
    		}
		});

    	slider.data('resized', true);
    	// force the slider to never be marked as loaded
    	// slider.data('loaded', true);
	}
	// the html is already there, so run its animation
	else { 
		animation(function() {
    			callback();
			});
	}
		        

	scrollToCurSlider();

	window.location.hash = curSliderID;						                
    
	
};

function beforeLoadSliderHTML() {
	toggleLoadingTitle();
};

// this is run when the HTML is guaranteed to be loaded, but not the images
function beforeSliderLoaded() {

	// resize the slider before the images are finished loading, so that we don't have a big to small flicker
	resize($curSlider);
//	$curSlider.find(".inner").fadeOut(0);
			
	// slider title is not active; make active
	toggleTitle($curSlider);
		
   
};

function onSliderLoaded() {
	
//	$curSlider.find(".inner").fadeIn(1000, "easeOutQuad");
	
	// this callback will contain the animation function to be executed, e.g. animateLFF()
	var callback = arguments[0];
	
	activateDragbar();
	
	toggleLoadingTitle();	
	curSliderInnerWidth = $curSlider.find(".inner").width();
	
	$curSlider.scroll(function() {
		updateScrollPos();
	});
	
	// trigger a scroll event on the current slider, this is to trigger animations that happen when an element is 		    
	// when this callback is run, the .scroll event for the current slider has not yet been bound
	// so instead of putting the callback into there, we set a timeout for this function, as it is the only one dependent on that characteristic
	setTimeout(function() {$curSlider.trigger("scroll")}, 100);
	
    anims = animsObject($curSlider.find(".layer"));

	bindMovementEvents();

    callback();


		    
};

function bindMovementEvents() {

    var startX;
    
    $curSlider.on("touchstart", function (e) {	        	
	    var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
		startX = touch.pageX;
    }); 
    
    $curSlider.on("touchmove", function (e) {
    	// prevent the page from scrolling up when the user swipes
	    e.preventDefault();							
    }); 
    
    $curSlider.on("touchend", function (e) {
	    var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
	
		var changeX = startX - touch.pageX;
		var travelTime = Math.abs(changeX) + 300;
		
    	newPos = curScrollPos + changeX;
    	
		updateDragbar(newPos);
    	$curSlider.stop(true, false).scrollTo(newPos, travelTime);
    }); 
    
    
    
    $curSlider.on("mousedown", function (e) {	        	
        startX = e.pageX;
    });	        

    $curSlider.on("mouseup", function (e) {

	
		var changeX = startX - e.pageX;
		var travelTime = Math.abs(changeX) + 300;				
		
		// for some reason the slider would still scroll forwards a little bit when just clicked; this works around
		if (changeX === 0)
			return;				
		
    	newPos = curScrollPos + changeX;
    	if (newPos < 0)
    		newPos = 0;

    	$curSlider.stop(true, false).scrollTo(newPos, travelTime, function() {
			updateDragbar(newPos);
	    });
    }); 	
    
    
/*   
	var updateDragbar = _.throttle( function() {	
	
		var scrollLeft = arguments[0];
		$curSlider.stop(true, false).scrollTo( scrollLeft, 1000, { easing: "easeOutQuad" } );
		$curDragbar.slider('value', (scrollLeft / curSliderInnerWidth));	
	
	} , 1300);


	var mousewheelRatio = windowWidth * .25;
   	// makes the slider respond to the two finger scroll gesture  
  	$curSlider.on( 'mousewheel', function(e, delta){		
		
		e.preventDefault();	

		var scrollLeft = parseInt($curSlider.scrollLeft());
			
		scrollLeft += wheelDirection(e.originalEvent) * mousewheelRatio;
		
		console.log(scrollLeft)
		updateDragbar(scrollLeft);

	});           
    
    var wheelDirection = function(e){
		if (!e) e = event;		
		return (e.detail<0) ? 1 : (e.wheelDelta>0) ? 1 : -1;
	};
 
*/
	unseenSliderInnerWidth = curSliderInnerWidth - windowWidth;
	var updateDragbar = _.throttle( function() {
		var scrollLeft = arguments[0];
		newDragbarPos = scrollLeft / unseenSliderInnerWidth;
		$curDragbar.slider('value', newDragbarPos);		
	} , 300);

	var mousewheelRatio = 25 * resizePercent;

   	// makes the slider respond to the two finger scroll gesture  
  	$curSlider.on( 'mousewheel', function(e, delta){		
		
		if(e.originalEvent.wheelDeltaX < 0 || e.originalEvent.wheelDeltaX > 0 || e.originalEvent.axis == 1){
			e.preventDefault();	
	
			var scrollLeft = parseInt($curSlider.scrollLeft());
			var deltaX = ( e.originalEvent.wheelDeltaX ) / mousewheelRatio;
				
			scrollLeft -= deltaX;
													
			$curSlider.scrollLeft( scrollLeft );
			updateDragbar(scrollLeft);
		}
	});

    
};


function onSliderClose() {        
	// slider title is active; change back
	toggleTitle($prevSlider);
	
	// reset dragbar
	$prevDragbar.slider("value", 0).hide();
	
	// kill the html of the previous slider, this stops the videos being played there as well
	// the event listeners are removed as well https://github.com/jquery/jquery/blob/master/src/manipulation.js#L231
	$prevSlider.html("");
	
	// reset the currently playing video to null
	$curVideo = null;
};


// not used
function activateTooltip() {
	$instructionTooltip = $("#instruction-tooltip");
	$instructionTooltip.fadeIn(1000);
	$(document).on("mousemove", function (e) {
	    	$instructionTooltip.css({
	        	left: (e.pageX + 5) + "px",
	        	top: (e.pageY + 5) + "px"
	    	});
	    	
	});
};

function scrollToCurSlider(){

	if ($curSlider === null || typeof $curSlider === "undefined")
		curSliderTop = 0;
		
	else {
		var curSliderTop = $curSlider.offset().top - (150);	        			
		if (curSliderTop < 0)
			curSliderTop = 0;
	}
	// scroll to the top of $curslider
    $.scrollTo( curSliderTop, 1000, { easing: "easeOutQuad"});
}

function activateDragbar() {
	
	var dragbarOptions = {
		max: 1,
		step: 0.01,
		animate: true,
		change: dragSlider,
		slide: dragSlider		
	};
	
    // change is the amount the drag bar changes, changePrev is the amount it changed before
	var change = 0, changePrev = 0;
							
	// set up the drag bar for this slider show the dragbar for this slider
	$curDragbar = $("#" + curSliderID + "-title .dragbar").slider(dragbarOptions).show().css("display", "block");
	
			    
	function dragSlider(event, ui) {
	
		/* scrolls the slider to the current position of the dragbar */
		
		// if the dragbar is moved as a result of a script and not the user, then don't run these animations					
		if (!event.originalEvent)
			return;
		
		// determine the position to scroll to
		change = ($curDragbar.slider("value"));
		var newScrollPos = change * (curSliderInnerWidth - windowWidth);
			
		// determine the time the scrolling animation should take				
		var delta = Math.abs(change - changePrev);
		var travelTime = 7000 * delta + 1000;
	
		// animate the scroll (and stop the previous scrolls dead in their tracks, if they exist)						
		$curSlider.stop(true, false).scrollTo( newScrollPos, travelTime, { easing: "easeOutQuad" } );
	
		changePrev = change;
	};

};


function setupContactForm() {

    $container = $("#container");

    
    $("#contact-link").click(function() {
    	if (contactFormVisible) {
    		hideContact();
    		contactFormVisible = false;
    	}
    	else {
    		showContact();
    		contactFormVisible = true;
    	}    	
	});
	$("#contact-x").click(function() {
		hideContact();
		contactFormVisible = false;		
	});
};

var contactHeight;
function showContact() {
	
	if ($contact === null) {
		$contact = $("#contact");
		$contactLink = $("#contact-link");
		$hideContainer = $("#hide-container");
		contactHeight = parseInt($contact.height()) + 60; 
	}
	
	$hideContainer.stop();
	$container.stop();
	$contact.stop();
	
	$("#header .menu li a.active").removeClass("active");
	$contactLink.toggleClass("active");
	

	$.scrollTo(document.height, 500, {
		onAfter: function() {
			$contact.css({"visibility": "visible"});
			$hideContainer.fadeIn(1000);
			$container.css({
				"height" : ($(document).height() - 30) + "px",
				"position": "relative",
				"overflow": "hidden"
			}).animate({ top: "-" + contactHeight + "px"}, 1000, "easeOutQuint", function() {
				$contact.css("z-index", 0);
			});
		}
	});
	
};
function hideContact() {

 	$hideContainer.stop();
	$container.stop();
	$contact.stop();

	$hideContainer.fadeOut(1000);
	$contact.css("z-index", -100);
	$container.animate({ top: "0px"}, 1000, "easeInQuint", function() {		
		$container.css({
			"height" : "auto",
			"position": "static",
			"overflow": "auto"
		});		
		$contact.css("visibility", "hidden");
		scrollToCurSlider();
	});
	$("#header .menu li a.link").addClass("active");
	$contactLink.toggleClass("active");
};


function animateLFF(callback) {
	
	anims["02tophand"].animate = function() {
	
		var self = anims["02tophand"];
		self.$.animate({
            top: self.endt + "px",
            left: self.endl + "px"
        }, {
            duration: 2000,
            specialEasing: {
                top: 'easeInOutQuint',
                left: 'easeInOutQuint'
            }
        });
        
        self = anims["04type"];
		self.$.animate({
            top: self.endt + "px",
            left: self.endl + "px"
        }, {
            duration: 2000,
            specialEasing: {
                top: 'easeInOutQuint',
                left: 'easeInOutQuint'
            }
        });	
        
        self = anims["03bottomhand"];
		self.$.animate({
            top: self.endt + "px",
            left: self.endl + "px"
        }, {
            duration: 2000,
            specialEasing: {
                top: 'easeInOutQuint',
                left: 'easeInOutQuint'
            }
        });	
	};

	anims["08newspaperad"].animate = function() {
		
		var self = anims["08newspaperad"];

		self.$.animate({
            left: self.endl + "px"
        }, {
            duration: 2000,
            specialEasing: {
                left: 'easeOutQuart'
            }
        });

	};


	anims["11makingof1"].animate = function() {	
		anims["11makingof1"].$.fadeIn(700, function() {
			anims["12makingof2"].animate();
		});
	};
	anims["12makingof2"].animate = function() {	
		anims["12makingof2"].$.fadeIn(700, function() {
			anims["13makingof3"].animate();
		});
	};
	anims["13makingof3"].animate = function() {	
		anims["13makingof3"].$.fadeIn(700, function() {
			anims["14makingof4"].animate();
		});
	};
	anims["14makingof4"].animate = function() {	
		anims["14makingof4"].$.fadeIn(700, function() {
		});
	};


	anims["17typeface"].animate = function() {	
	    rotateScroll("17typeface", 8, anims["17typeface"].xCenter);
	    rotateScroll("18strings", 11, anims["18strings"].xCenter);
	};

	anims["21Alkoya"].animate = function() {	
        yScroll("21Alkoya");
	};
	anims["22hand"].animate = function() {	
        yScroll("22hand");
	};


	anims["27hand"].animate = function() {
		yScroll("27hand");
		xScrollStable("27hand");
	};


	anims["30newspaper"].animate = function() {

		var self = anims["30newspaper"];
		
		self.$.animate({
            left: self.endl + "px"
        }, {
            duration: 2000,
            specialEasing: {
                top: 'easeOutQuart',
                left: 'easeOutQuart'
            }
        });

	};

	/* anims["35text1"].animate = function() {	
	    rotateScroll("35text1", 20, anims["35text1"].xCenter);
	    rotateScroll("36text2", 15, anims["36text2"].xCenter);
	    rotateScroll("37text3", 10, anims["37text3"].xCenter);
	}; */

	anims["38booklet"].animate = function() {	
        yScroll("38booklet", true);
	};

	anims["39fbcloseup"].animate = function() {	
        yScroll("39fbcloseup", true);
	};

	loadVideo("23tv");
    resizeVideos($curSlider);

    //console.log(anims);

    $curSlider.scroll(function (e) {
        
 

        if ( !anims["02tophand"].animated && onScreen(anims["02tophand"].xCenter)) {
            setTimeout(anims["02tophand"].animate, 300);
            anims["02tophand"].animated = true;
        }
        if ( !anims["11makingof1"].animated && onScreen(anims["11makingof1"].xCenter)) {
            anims["11makingof1"].animate();
            anims["11makingof1"].animated = true;
        }
        if ( !anims["08newspaperad"].animated && onScreen(anims["08newspaperad"].right + 400)) {
            anims["08newspaperad"].animate();
            anims["08newspaperad"].animated = true;
        }
        if (onScreen(anims["27hand"].endl)) {
           anims["27hand"].animate();
        }
        if ( !anims["30newspaper"].animated && onScreen(anims["30newspaper"].right + 400)) {
            anims["30newspaper"].animate();
            anims["30newspaper"].animated = true;
        }
       


        if (onScreen(anims["17typeface"].left)) {
            anims["17typeface"].animate();
        }
        if (onScreen(anims["21Alkoya"].left)) {
            anims["21Alkoya"].animate();
        }
        if (onScreen(anims["22hand"].left)) {
            anims["22hand"].animate();
        }
        /* if (onScreen(anims["35text1"].left)) {
            anims["35text1"].animate();
        } */
        if (onScreen(anims["38booklet"].left)) {
            anims["38booklet"].animate();
        }
        /* if (onScreen(anims["39fbcloseup"].left)) {
            anims["39fbcloseup"].animate();
        } */



    });

};

/*delete*/
function animateHoly(callback) {





    /* staircases */

    anims["stair-top"].end = anims["stair-top"].$.data("end");
    anims["stair-top"].animate = function () {
        oldyScroll("stair-top");
    };
    anims["stair-bottom"].end = anims["stair-bottom"].$.data("end");
    anims["stair-bottom"].animate = function () {
        oldYDownScroll("stair-bottom");
    };

    /* horizontal parallax */

    anims["holy-color"].animate = function () {
        xScroll("holy-color", -0.3);
    };
    anims["holy-shape"].animate = function () {
        xScroll("holy-shape", -0.2);
    };
    anims["direct-mail"].animate = function () {
        xScroll("direct-mail", 0.4);
        xScroll("03text2", 0.4);
    };
    anims["prestige"].animate = function () {
        xScroll("prestige", 0.2);
        xScroll("04text3", 0.2);
    };
    anims["dentist-video"].animate = function () {
        xScroll("dentist-video", 0.3);
        xScroll("05text4", 0.3);
    };
    var montiLeft = 0;
    var $montiImg = anims["monticciolo"].$.find("img");
    anims["monticciolo"].animate = function () {
		xScroll("monticciolo", 0.4);      
        
        if (changeInScrollPos > 0)
        	direction = -1;
        else
        	direction = 1;
        
        var move = montiLeft + ( direction * 10  ) ;
        if (move > -400 * resizePercent && move < 400 * resizePercent) {
	        $montiImg.css ("left", montiLeft + "px");
	        montiLeft = move;
        }
        
        xScroll("07text5", 0.4);
    };
    anims["reality-video"].animate = function () {
        xScroll("reality-video", 0.5);
        xScroll("08text6", 0.5);
    };
    anims["evos"].animate = function () {
        xScroll("evos", 0.1);
        xScroll("09text7", 0.1);
    };
    
	loadVideo("dentist-video");
	loadVideo("reality-video");

    //console.log(anims);

	var $colorblock = $("#colorblock");
	
	var colorblockTop = $colorblock.css("top").replace("px", "");
	var colorblockHeight = $colorblock.css("height").replace("px", "");
	colorblockTop *= resizePercent;
	colorblockHeight *= resizePercent;
	$colorblock.css({ top : colorblockTop + "px", height : colorblockHeight + "px"});

	

    $curSlider.scroll(function (e) {
        //	console.log(e);
        //	console.log(this);
        

  		
		$colorblock.css("left", (curScrollPos + (windowWidth / 2) - 325) + "px");  

        /* lff staircase */

        if (curScrollPos < anims["stair-top"].left) {
            anims["stair-top"].animate();
        }

        if (curScrollPos < anims["stair-bottom"].left) {
            anims["stair-bottom"].animate();
        }

        /* horizontal parallax */

        if (onScreen(anims["holy-color"].right)) {
            anims["holy-color"].animate();
        }
        if (onScreen(anims["holy-shape"].right)) {
            anims["holy-shape"].animate();
        }
        if (onScreen(anims["direct-mail"].left)) {
            anims["direct-mail"].animate();
        }
        if (onScreen(anims["prestige"].left)) {
            anims["prestige"].animate();
        }
        if (onScreen(anims["dentist-video"].left)) {
            anims["dentist-video"].animate();
        }
        if (onScreen(anims["monticciolo"].left) || onScreen(anims["monticciolo"].right)) {
            anims["monticciolo"].animate();
        }
        if (onScreen(anims["reality-video"].left)) {
            anims["reality-video"].animate();
        }
        if (onScreen(anims["evos"].left)) {
            anims["evos"].animate();
        }

    });

};

function animateSweetbay(callback) {

    
    /* jQuery Powered Animations */
    anims["flour"].animate = function () {
        var self = anims["flour"];
        self.animated = true;
        self.$.animate({
            top: self.endt + "px",
            left: self.endl + "px"
        }, {
            duration: 1000,
            specialEasing: {
                top: 'easeInOutQuint',
                left: 'easeInOutQuint'
            }
        });
    };
    anims["lemons"].animate = function () {
    
        var self = anims["lemons"];
        self.animated = true;
        self.$.animate({
            top: self.endt + "px",
            left: self.endl + "px"
        }, {
            duration: 1500,
            specialEasing: {
                top: 'easeInOutQuint',
                left: 'easeInOutQuint'
            }
        });
    };
    anims["plate"].animate = function () {
        var self = anims["plate"];
        self.animated = true;
        self.$.animate({
            top: self.endt + "px",
            left: self.endl + "px"
        }, {
            duration: 1000,
            specialEasing: {
                top: 'easeOutQuint',
                left: 'easeInOutQuint'
            }
        });
        anims["perfect"].$.fadeIn(1000);
    };

	anims["girl-video"].animate = function() {	
		anims["girl-video"].$.fadeIn(700);
		anims["girl-outline"].$.fadeIn(700, function() {
			anims["10-paragraph"].$.fadeIn(700);
		});
	};

    /* Scroll Powered Animations */
    anims["ok-go"].animate = function () {
        yScroll("ok-go");
    };
    anims["ok-go"].animate2 = function () {
        xScrollStable("ok-go");
    };
    anims["nate-video"].animate = function () {
        xScrollStable("nate-video");
    };
    anims["collage"].animate = function () {
        xScrollStable("collage");
    };
    anims["tested-and-approved"].animate = function () {
        xScrollStable("tested-and-approved");
    };
    anims["stromboli-recipe"].animate = function () {
        rotateScroll("stromboli-recipe", -7, anims["stromboli-recipe"].xCenter);
    };
	anims["eggs-photo"].animate = function() {
		anims["eggs-photo"].$.fadeIn(700, function() {
			setTimeout (
				anims["stromboli-recipe"].$.fadeIn(700), 500);
		});
	};
	anims["stromboli-hand"].animate = function() {
		anims["stromboli-hand"].$.fadeIn(700);	
	};
	anims["making-10-meals"].animate = function() {
		anims["making-10-meals"].$.fadeIn(700);	
	};
	anims["stromboli-video"].animate = function() {
		anims["stromboli-outline"].$.fadeIn(700);	
		anims["stromboli-video"].$.fadeIn(700);	
	};
	anims["recipe-matrix"].animate = function() {
		anims["recipe-matrix"].$.fadeIn(700);
	};
    anims["pear-recipe"].animate = function () {
		yScroll("pear-recipe");
    };
	anims["pear-video"].animate = function() {
		anims["pear-outline"].$.fadeIn(700);	
		anims["pear-video"].$.fadeIn(700);	
	};
	anims["pear-stand"].animate = function() {
		yScroll("pear-stand");
	};
    anims["mac-empty"].animate = function () {
		yScroll("mac-empty");
    };
    anims["mac-fill"].animate = function () {
	    yScroll("mac-fill");
    };

	loadVideo("girl-video");
	loadVideo("stromboli-video");
	loadVideo("pear-video");
	loadVideo("nate-video");

    //console.log(anims);

    

    $curSlider.scroll(function (e) {
        //	console.log(e);
        //	console.log(this);
        

        if ( !anims["lemons"].animated && onScreen(anims["lemons"].right)) {
            anims["flour"].animate();
            anims["lemons"].animate();
            anims["lemons"].animated = true;
        }
        if (!anims["girl-video"].animated && onScreen(anims["girl-video"].right + 200)) {
            anims["girl-video"].animate();
            anims["girl-video"].animated = true;
        }
        if (onScreen(anims["ok-go"].left)) {

        }
        if (onScreen(anims["ok-go"].left)) {
            anims["ok-go"].animate();
            anims["ok-go"].animate2();
        }
        if (onScreen(anims["tested-and-approved"].left)) {
            anims["tested-and-approved"].animate();
        }
        if (onScreen(anims["nate-video"].left)) {
            anims["nate-video"].animate();
        }
        if (onScreen(anims["collage"].left)) {
            anims["collage"].animate();
        }
        if (!anims["eggs-photo"].animated && onScreen(anims["eggs-photo"].right)) {
            anims["eggs-photo"].animate();
            anims["eggs-photo"].animated = true;
        }
	    if (onScreen(anims["stromboli-recipe"].xCenter)) {
            anims["stromboli-recipe"].animate();
        }
        if (!anims["stromboli-hand"].animated && onScreen(anims["stromboli-hand"].xCenter)) {
            anims["stromboli-hand"].animate();
            anims["stromboli-hand"].animated = true;
        }
        if (!anims["making-10-meals"].animated && onScreen(anims["making-10-meals"].xCenter)) {
            anims["making-10-meals"].animate();
            anims["making-10-meals"].animated = true;
        }
        if (!anims["stromboli-video"].animated && onScreen(anims["stromboli-video"].xCenter)) {
            anims["stromboli-video"].animate();
            anims["stromboli-video"].animated = true;
        }
        if (!anims["pear-video"].animated && onScreen(anims["pear-video"].xCenter)) {
            anims["pear-video"].animate();
            anims["pear-video"].animated = true;
        }
        if (!anims["recipe-matrix"].animated && onScreen(anims["recipe-matrix"].xCenter)) {
            anims["recipe-matrix"].animate();
            anims["recipe-matrix"].animated = true;
        }    
        if (onScreen(anims["pear-stand"].xCenter)) {
            anims["pear-stand"].animate();
        }    
        if (onScreen(anims["pear-recipe"].left)) {
            anims["pear-recipe"].animate();
        }
        if (onScreen(anims["mac-empty"].left)) {
            anims["mac-empty"].animate();
        }
        if (onScreen(anims["mac-fill"].left)) {
            anims["mac-fill"].animate();
        }
        if (onScreen(anims["plate"].left - 50)) {
            anims["plate"].animate();
        }
    });
	
};


function animateTour(callback) {



    /* hide stuff before its animated; make sure its hidden by JS and not CSS so that if the us=er has bad JS, they won't see it hidden */


    /* Slide 1 Sequence */

    anims["introducing"].animate = function () {
        var self = anims["introducing"];
        self.animated = true;
        self.$.animate({
            opacity: 1
        }, {
            duration: 500,
            specialEasing: {
                width: 'easeOutQuint'
            },
            complete: function() {
            	anims["that-changed"].animate();
            }
        });
    };
    anims["that-changed"].animate = function () {
        var self = anims["that-changed"];
        self.$.animate({
            opacity: 1
        }, {
            duration: 300,
            specialEasing: {
                width: 'easeOutQuint'
            },
            complete: function() {
            	anims["slide1-ipad"].animate();
            }
        });
    };
    anims["slide1-ipad"].animate = function () {
        var self = anims["slide1-ipad"];
        self.$.animate({
            top: self.endt + "px",
            left: self.endl + "px"
        }, {
            duration: 1300,
            specialEasing: {
                top: 'easeOutQuad',
                left: 'easeOutQuad'
            },
            complete: function () {
                anims["slide1-marker"].animate();
            }
        });
    };
    anims["slide1-marker"].animate = function () {
        var self = anims["slide1-marker"];
        self.animated = true;
        self.$.animate({
            width: self.endw + "px"
        }, {
            duration: 300,
            specialEasing: {
                width: 'easeOutQuad'
            }
        });
    };
    
    /* Slide 2 Sequence */
    
    anims["slide2-bg"].animate = function () {
        var self = anims["slide2-bg"];
        self.animated = true;
        anims["slide2-ipad"].animate();
    };
    anims["slide2-ipad"].animate = function() {
        var self = anims["slide2-ipad"];
        self.$.animate({
            top: self.endt + "px"
        }, {
            duration: 2000,
            complete: function () {
                anims["slide2-copy"].animate();
        }});
    };
    anims["slide2-copy"].animate = function() {
        var self = anims["slide2-copy"];
        self.$.fadeIn( 1000, 'easeOutQuint', function () {
                anims["you-jump-first"].animate();
                anims["go"].animate();                
        });
    };   
    anims["you-jump-first"].animate = function() {
        var self = anims["you-jump-first"];
        self.$.fadeIn( 4000, 'easeOutQuint' );
    };      
    anims["go"].animate = function() {
        var self = anims["go"];
        self.$.fadeIn( 4000, 'easeOutQuint' );
    };
    
    /* Slide 3 (Charles) Sequence */
    
    anims["charles-copy-1"].animate = function () {
        var self = anims["charles-copy-1"];
        self.animated = true;
        self.$.fadeIn( 1000, 'easeOutQuint', function () {
                anims["charles-1"].animate();
        });
    };    
    anims["charles-1"].animate = function () {
        var self = anims["charles-1"];
        self.$.fadeIn( 1000, 'easeOutQuint', function () {
                anims["charles-2"].animate();
        });
    }; 
    anims["charles-2"].animate = function () {
        var self = anims["charles-2"];
        self.$.fadeIn( 1000, 'easeOutQuint', function () {
                anims["charles-3"].animate();
        });
    }; 
    anims["charles-3"].animate = function () {
        var self = anims["charles-3"];
        self.$.fadeIn( 1000, 'easeOutQuint', function () {
                anims["charles-4"].animate();
        });
    }; 
    anims["charles-4"].animate = function () {
        var self = anims["charles-4"];
        self.$.fadeIn( 1000, 'easeOutQuint', function () {
                anims["charles-5"].animate();
        });
    }; 
    anims["charles-5"].animate = function () {
        var self = anims["charles-5"];
		self.$.fadeIn( 1000, 'easeOutQuint', function () {
                anims["charles-copy-2"].animate();
        });
    };     
    anims["charles-copy-2"].animate = function () {
        var self = anims["charles-copy-2"];
        self.$.fadeIn( 1000, 'easeOutQuint');
    };
    
    /* Slide 4 (Parallax iPad) Sequence */
    
    
    anims["popup-ok"].$.click(function() {    
    	anims["popup-ok"].$.fadeOut(1000);
		anims["parallax-tour-container"].animate();
    	anims["popup-remote"].$.fadeOut(1000, function() {
    	});
    });  
    
	parallaxLayers = anims["parallax-tour-container"].$.find(".parallax-layer");    
    anims["parallax-tour-container"].animate = function() {
		var self = anims["parallax-tour-container"];
		self.animated = true;
		
		parallaxLayers.parallax( {
			// default options
			mouseport: self.$
		}, 
		{	// background image options
			xparallax: Math.round($('#parallax-nyc').data("x-parallax") * resizePercent) + "px",
		    yparallax: Math.round($('#parallax-nyc').data("y-parallax") * resizePercent) + "px",
			yorigin: 0.3 * resizePercent,
			xorigin: 0.5,
		    decay: 0.3
		},
		{ 	// ipad options
			xparallax: Math.round($('#parallax-ipad-hands').data("x-parallax") * resizePercent) + "px",
		    yparallax: Math.round($('#parallax-ipad-hands').data("y-parallax") * resizePercent) + "px",
			yorigin: 0,
			xorigin: 0.5,
		    decay: 0.3
		} );	
	};

    /* Slide 5 (Mac) Sequence */
    
    anims["pretty-cool"].animate = function () {
        var self = anims["pretty-cool"];
        self.animated = true;
        self.$.fadeIn( 1000, 'easeInQuint', function() {
            anims["mac"].animate();
        });
    };    
    anims["mac"].animate = function () {
        var self = anims["mac"];
        self.$.animate({
            top: self.endt + 'px'
        }, {
            duration: 2000,
            specialEasing: {
                width: 'easeOutQuint'
            },
            complete: function() {
                anims["mac-callout"].animate();
            }
        });
    }; 
    anims["mac-callout"].animate = function () {
        var self = anims["mac-callout"];
		self.$.animate({
            width: self.endw + 'px'
        }, {
            duration: 700,
            specialEasing: {
                width: 'easeInExpo'
            },
            complete: function() {
                anims["charles-copy-2"].animate();
            }
        });
    };      	

    /* Slide 6 (Text Messages) Sequence */
    anims["a-lot"].animate = function () {
        var self = anims["a-lot"];
        self.animated = true;
        self.$.fadeIn( 700, 'easeInExpo', function() {
            anims["text-number-one"].animate();
        });
    };  	
     anims["text-number-one"].animate = function () {
        var self = anims["text-number-one"];
        self.animated = true;
        self.$.fadeIn( 700, 'easeInExpo', function() {
            anims["text-fast-company"].animate();
        });
    };  
    anims["text-fast-company"].animate = function () {
        var self = anims["text-fast-company"];
        self.animated = true;
        self.$.fadeIn( 700, 'easeInExpo', function() {
            anims["text-big-app"].animate();
        });
    };  
    anims["text-big-app"].animate = function () {
        var self = anims["text-big-app"];
        self.animated = true;
        self.$.fadeIn( 700, 'easeInExpo', function() {
            anims["text-tnw"].animate();
        });
    };             
    anims["text-tnw"].animate = function () {
        var self = anims["text-tnw"];
        self.animated = true;
        self.$.fadeIn( 700, 'easeInExpo');
    }; 
    
    /* Slide 7 (Cascading images) Sequences */
    // TODO cascading effect for the three images
    
    anims["a-whole-lot"].animate = function () {
        var self = anims["a-whole-lot"];
        self.animated = true;
        self.$.fadeIn( 700, 'easeInExpo', function() {
            anims["magazine-cover"].animate();
        });
    };  
    
    anims["magazine-cover"].animate = function () {
    	xScrollStable("magazine-cover");
    	var a = Math.abs(parseInt(anims["magazine-cover"].$.css("left")) - anims["magazine-cover"].endl);
    	if (a <= 50)
    		anims["magazine-cover"].animated = true;
    };
    anims["magazine-inner"].animate = function () {
    	xScrollStable("magazine-inner");
    	var a = Math.abs(parseInt(anims["magazine-inner"].$.css("left")) - anims["magazine-inner"].endl);
    	if (a <= 50)
    		anims["magazine-inner"].animated = true;
    };
    anims["splash"].animate = function () {
    	xScrollStable("splash");
    	
    	var a = Math.abs(parseInt(anims["splash"].$.css("left")) - anims["splash"].endl);
    	if (a <= 25)
    		anims["splash"].animated = true;
    };
    anims["macworld"].animate = function () {
    	yScroll("macworld");
    };

    /* Slide 8 (Map) Sequences */
        
    anims["map-copy"].animate = function () {
        self = anims["map-copy"];
        self.animated = true;
        setTimeout( function() { self.$.fadeIn( 1500, 'easeInExpo') }, 2000);
    };
    anims["tampa-marker"].animate = function () {
        self = anims["tampa-marker"];
        self.animated = true;
		self.$.fadeIn( 2000, 'easeInExpo', function () {
			anims["group1"].animate();
		});
    };    
    anims["group1"].animate = function () {
        self = anims["group1"];
        self.animated = true;
        anims["group6"].$.fadeOut(1100, 'easeInExpo');
		self.$.fadeIn( 1300, 'easeInExpo', function () {
			anims["group2"].animate();
		});
    };
    anims["group2"].animate = function () {
        self = anims["group2"];
        self.animated = true;
        anims["group4"].$.fadeOut(1100, 'easeInExpo');
		self.$.fadeIn( 1300, 'easeInExpo', function () {
			anims["group3"].animate();
		});
    };
    anims["group3"].animate = function () {
        self = anims["group7"];
        self.animated = true;
        anims["group2"].$.fadeOut(1100, 'easeInExpo');
		self.$.fadeIn( 1300, 'easeInExpo', function () {
			anims["group4"].animate();
		});
    };
    anims["group4"].animate = function () {
        self = anims["group4"];
        self.animated = true;
        anims["group1"].$.fadeOut(1100, 'easeInExpo');
		self.$.fadeIn( 1200, 'easeInExpo', function () {
			anims["group5"].animate();
		});
    };
    anims["group5"].animate = function () {
        self = anims["group5"];
        self.animated = true;
        anims["group3"].$.fadeOut(1100, 'easeInExpo');
		self.$.fadeIn( 1100, 'easeInExpo', function () {
			anims["group6"].animate();
		});
    };
    anims["group6"].animate = function () {
        self = anims["group6"];
        self.animated = true;
        anims["group2"].$.fadeOut(1100, 'easeInExpo');
		self.$.fadeIn( 1100, 'easeInExpo', function () {
			anims["group7"].animate();
		});
    };
    anims["group7"].animate = function () {
        self = anims["group7"];
        self.animated = true;
        anims["group6"].$.fadeOut(1100, 'easeInExpo');
		self.$.fadeIn( 1100, 'easeInExpo', function() {
			anims["group1"].animate();
		});
    };
    
    //console.log(anims);

    

	var parallaxDialogEffect, dialog = false, frozen = false;

    $curSlider.scroll(function (e) {

        
        if (!anims["introducing"].animated && onScreen(anims["introducing"].left)) {
            anims["introducing"].animate();
        }
		if (!anims["slide2-bg"].animated && anims["slide1-marker"].animated && onScreen(anims["slide2-bg"].activate)) {
            anims["slide2-bg"].animate();           
        }
		if (!anims["charles-copy-1"].animated && onScreen(anims["charles-2"].right)) {
            anims["charles-copy-1"].animate();           
        }
        if ( !parallaxDialogEffect && onScreen(anims["popup-ok"].left)) {
   		    parallaxDialogEffect = true;
        	anims["popup-ok"].$.effect("pulsate", { times:4 }, 500);
        }
		if (anims["parallax-tour-container"].animated) {
			if ( !onScreen(anims["parallax-tour-container"].right) && !onScreen(anims["parallax-tour-container"].left)) {
				if (!frozen) {
					parallaxLayers.trigger({type: 'freeze'});
					frozen = true;
					console.log('frozen')
				}
 	        }
	        else {
	        	frozen = false;
				parallaxLayers.trigger({type: 'unfreeze'});       	        
	        }
        }

		if (!anims["pretty-cool"].animated && onScreen(anims["pretty-cool"].activate)) {
            anims["pretty-cool"].animate();           
        }    
		if (!anims["a-lot"].animated && onScreen(anims["a-lot"].activate)) {
            anims["a-lot"].animate();     
        }
        if (!anims["a-whole-lot"].animated && onScreen(anims["a-whole-lot"].activate)) {
            anims["a-whole-lot"].animate();     
        }
        if (anims["a-whole-lot"].animated && onScreen(anims["magazine-cover"].endl)) {
            anims["magazine-cover"].animate();     
        }
        if (anims["magazine-cover"].animated && onScreen(anims["magazine-inner"].endl)) {
            anims["magazine-inner"].animate();          
        }
        if (anims["magazine-inner"].animated && onScreen(anims["splash"].endl)) {
            anims["splash"].animate();          
        }
        if (onScreen(anims["macworld"].left)) {
        	anims["macworld"].animate();
        }     
        if (!anims["map-copy"].animated && onScreen(anims["map-copy"].left)) {
        	anims["map-copy"].animate();
        	anims["tampa-marker"].animate();
        }
        if ( !anims["popup-location"].animated && onScreen(anims["popup-location"].left)) {
        	anims["popup-location"].animated = true;
        	anims["popup-location"].$.effect("pulsate", { times:4 }, 500);
        }
    });
};

function animateFlorida(callback) {


	
	anims["02yellowpaper"].animate = function() {
        yScroll("02yellowpaper");
    }; 
	
	anims["20webscreenshot"].animate = function() {
		yScroll("20webscreenshot");
	};
	
	anims["03fishguy"].animate = function() {
        var self = anims["03fishguy"];
        self.animated = true;
        self.$.fadeIn( 500, 'easeOutQuint', function () {
        	anims["04lifeguards"].animate();
        });
    }; 
    
    anims["04lifeguards"].animate = function() {
        var self = anims["04lifeguards"];
        self.animated = true;
        self.$.fadeIn( 500, 'easeOutQuint', function () {              
        	anims["05armada"].animate();
        });
    };
    
    anims["05armada"].animate = function() {
        var self = anims["05armada"];
        self.animated = true;
        self.$.fadeIn( 500, 'easeOutQuint', function () {              
        	anims["06guitarguys"].animate();
        });
    };
   
    anims["06guitarguys"].animate = function() {
        var self = anims["06guitarguys"];
        self.animated = true;
        self.$.fadeIn( 500, 'easeOutQuint', function () {              
        	anims["07airboat"].animate();
        });
    };
    
    anims["07airboat"].animate = function() {
        var self = anims["07airboat"];
        self.animated = true;
        self.$.fadeIn( 500, 'easeOutQuint', function () {              
        	anims["08walkingwboards"].animate();
        });
    }; 
    
    anims["08walkingwboards"].animate = function() {
        var self = anims["08walkingwboards"];
        self.animated = true;
        self.$.fadeIn( 500, 'easeOutQuint', function () {              
        });
    };
    
    anims["09boardsun"].animate = function() {
        var self = anims["09boardsun"];
        self.animated = true;
        self.$.fadeIn( 100, 'easeOutQuint', function() {
            anims["10parkguys"].animate();
            anims["11jaydu"].animate();
            anims["12kidswboards"].animate();
        });
    }; 
    
    anims["10parkguys"].animate = function() {
        var self = anims["10parkguys"];
        self.animated = true;
        self.$.animate({
            top: self.endt + 'px'
        }, {
            duration: 700,
            specialEasing: {
                width: 'easeOutQuint'
            },
            complete: function() {
            }
        });
    };
    
    anims["11jaydu"].animate = function() {
        var self = anims["11jaydu"];
        self.animated = true;
        self.$.animate({
            top: self.endt + 'px'
        }, {
            duration: 900,
            specialEasing: {
                width: 'easeOutQuint'
            },
            complete: function() {
            }
        });
    };
    
    anims["12kidswboards"].animate = function() {
        var self = anims["12kidswboards"];
        self.animated = true;
        self.$.animate({
            top: self.endt + 'px'
        }, {
            duration: 700,
            specialEasing: {
                width: 'easeOutQuint'
            },
            complete: function() {
                anims["13hotdogstand"].animate();
            }
        });
    }; 
    
    anims["13hotdogstand"].animate = function() {
        var self = anims["13hotdogstand"];
        self.animated = true;
        self.$.fadeIn( 100, 'easeOutQuint', function() {
                anims["14younggirls"].animate();
        });
    };
    
    anims["14younggirls"].animate = function() {
        var self = anims["14younggirls"];
        self.animated = true;
        self.$.fadeIn( 250, 'easeOutQuint', function () {              
        	anims["15couple"].animate();
        });
    };
    
    anims["15couple"].animate = function() {
        var self = anims["15couple"];
        self.animated = true;
        self.$.fadeIn( 250, 'easeOutQuint', function () {              
        	anims["16hotelworkers"].animate();
        });
    };
    
    anims["16hotelworkers"].animate = function() {
        var self = anims["16hotelworkers"];
        self.animated = true;
        self.$.fadeIn( 250, 'easeOutQuint', function () {              
        	anims["17cindi"].animate();
        });
    }; 
    
    anims["17cindi"].animate = function() {
        var self = anims["17cindi"];
        self.animated = true;
        self.$.fadeIn( 250, 'easeOutQuint');
    };
    
	anims["18sun2"].animate = function() {
        var self = anims["18sun2"];
        opacityScroll("18sun2");
    };
    
    var arrowSpeed = 300;
    var arrowEasing = "easeInOutCirc";
    anims["19arrowout6"].animate = function() {
		var self = anims["19arrowout6"];
        self.animated = true;
        self.$.fadeIn( arrowSpeed, arrowEasing, function () {              
        	anims["19arrowout5"].animate();
        });
    };
    anims["19arrowout5"].animate = function() {
		var self = anims["19arrowout5"];
        self.animated = true;
        self.$.fadeIn( arrowSpeed, arrowEasing, function () {              
        	anims["19arrowout4"].animate();
        });
    };
    anims["19arrowout4"].animate = function() {
		var self = anims["19arrowout4"];
        self.animated = true;
        self.$.fadeIn( arrowSpeed, arrowEasing, function () {              
        	anims["19arrowout3"].animate();
        });
    };
    anims["19arrowout3"].animate = function() {
		var self = anims["19arrowout3"];
        self.animated = true;
        self.$.fadeIn( arrowSpeed, arrowEasing, function () {              
        	anims["19arrowout2"].animate();
        });
    };
    anims["19arrowout2"].animate = function() {
		var self = anims["19arrowout2"];
        self.animated = true;
        self.$.fadeIn( arrowSpeed, arrowEasing, function () {              
        	anims["19arrowout1"].animate();
        });
    };
    anims["19arrowout1"].animate = function() {
		var self = anims["19arrowout1"];
        self.animated = true;
        self.$.fadeIn( arrowSpeed, arrowEasing, function () {              
        });
    };
    
    var prevPos_23 = 0;
    var $img_23 = anims["23billboard"].$.find("img");
    var maxPos_23 = anims["23billboard"].width - parseInt($img_23.css("width").replace("px"));
    anims["23billboard"].animate = function () {
        prevPos_23 = monticcilioScroll(prevPos_23, maxPos_23, $img_23, 4);
    };
       
 
    
    anims["24likesandenvelope"].animate = function() {
		var self = anims["24likesandenvelope"];
        self.animated = true;        
        self.$.fadeIn( 100, 'easeOutQuint');
        self.$.animate({
            top: self.endt + 'px'
        }, {
            duration: 1400,
            specialEasing: {
                top: 'easeOutBounce'
            },
            complete: function() {
                anims["24likes"].animate();
                anims["24invites"].animate();
            }
        });
    };    

    anims["24likes"].animate = function() {
		var self = anims["24likes"];
        self.animated = true;            
        self.$.fadeIn( 300, 'easeOutQuint');
        
		var counts = ["14", "23", "49", "102", "261", "495", "609", "1,373", "1,664", "2,375", "3,212", "4,853", "5,342", "7,947", "8,979", "9,757", "12,156", "13,153", "14,602", "16,093", "17,537", "18,580", "19,912", "20,383", "21,996", "23,033", "24,725", "26,043", "27,632", "32,318", "37,373", "38,809", "41,937", "42,156", "45,372", "48,061", "50,682", "51,726", "52,209", "53,318", "58,458", "60,100", "62,580", "62,963", "65,000+" ];	
		
		var i = 0;
		function count() {
			self.$.html(counts[i]); 
			//console.log(i);
			if (i < counts.length) {
				i++;
		        setTimeout(count, 30);        
	        }
		};
		count();
    
    };

    anims["24invites"].animate = function() {
		var self = anims["24invites"];
        self.animated = true;            
        self.$.fadeIn( 300, 'easeOutQuint');
       
        var counts = ["9", "17", "44", "74", "93", "175", "224", "252", "305", "340", "376", "400", "461", "504", "562", "809", "883", "982", "1,179", "1,248", "1,468", "1,495", "1,495", "1,553", "1,643", "1,767", "15,440", "24,668", "31,973", "33,345", "37,005", "38,205", "41,801", "45,444", "52,910", "59,411", "61,232", "61,723", "67,140", "76,391", "80,003", "81,224", "89,579", "93,956", "99,725", "100,455", "106,901", "113,215", "115,724", "117,953"];
		
		var i = 0;
		function count() {
			self.$.html(counts[i]); 
			//console.log(i);
			if (i < counts.length) {
				i++;
		        setTimeout(count, 30);        
	        }
		};
		count();
    
    };
	anims["25flsand"].animate = function() {
		yScroll("25flsand");
	};
	anims["26lindseysunset"].animate = function() {
		yScroll("26lindseysunset");
	};
	anims["28carprofile"].animate = function() {
		yScroll("28carprofile");
	};
	anims["29cartrack"].animate = function() {
		yScroll("29cartrack");
	};
	
    anims["30dempseylaugh"].animate = function() {
		yScroll("30dempseylaugh");
	};
	
	loadVideo("21lovevideo");	
	loadVideo("31dempseyvideo");

	//console.log(anims);

    
    
	$curSlider.scroll(function (e) {	
        
        if (onScreen(anims["02yellowpaper"].left)) {
            anims["02yellowpaper"].animate();
        }        
        if (!anims["03fishguy"].animated && onScreen(anims["03fishguy"].right + 300)) {
            anims["03fishguy"].animate();           
        }
        if (!anims["05armada"].animated && onScreen(anims["05armada"].right + 200)) {
            anims["05armada"].animate();           
        }
        if (!anims["09boardsun"].animated && anims["08walkingwboards"].animated && onScreen(anims["09boardsun"].xCenter)) {
            anims["09boardsun"].animate();           
            //console.log("barodsun");
        }
        if ( onScreen(anims["18sun2"].left)) {
            anims["18sun2"].animate();
        }
        if (onScreen(anims["20webscreenshot"].left)) {
            anims["20webscreenshot"].animate();
        }
        if (!anims["19arrowout6"].animated && onScreen(anims["19arrowout6"].right)) {
	        anims["19arrowout6"].animated = true;
            anims["19arrowout6"].animate();           
        }        
        if (!anims["24likesandenvelope"].animated && onScreen(anims["24likesandenvelope-bg"].xCenter)) {
	        anims["24likesandenvelope"].animated = true;
            anims["24likesandenvelope"].animate();           
        }        
		if (onScreen(anims["23billboard"].left) || onScreen(anims["23billboard"].right)) {
			anims["23billboard"].animate();
		}
		if (onScreen(anims["28carprofile"].left)) {
            anims["28carprofile"].animate();
        }
		if (onScreen(anims["26lindseysunset"].left)) {
            anims["26lindseysunset"].animate();
        }
        if (onScreen(anims["29cartrack"].activate)) {
            anims["29cartrack"].animate();
        } 
        if (onScreen(anims["30dempseylaugh"].left)) {
            anims["30dempseylaugh"].animate();
        }
        
	});

};

/*delete?*/
function animateDesign(callback) {


	
		
	anims["02underline"].animate = function() {
		var self = anims["02underline"];
		
		//NOTE: the following code is based on the yScroll function. We might want to make this a function in the future
        var xcurPos, xTotal, wTotal, wPos, newPosW;
        var speed = 1;
        var windowWidthScale = 0.75;    //to complete the effect without having to scroll through the whole screen

        //maximum movement on the x axis AKA total distance of the x axis
        xWidth = windowWidth*windowWidthScale;
        
        //add an offset to the current scroll position
        xcurPos = Math.abs(curScrollPos+(xWidth *(1-windowWidthScale)) - self.right);

        // total distance its allowed to move on the y axis
        wTotal = self.endw - self.width;
        
        var curRatio = xcurPos / xWidth;
        // the amount to move the element by on the y axis
        // compute by calculating the change in the x axis and multiplying it by the total distance on the y axis
        wPos = (wTotal - (curRatio * wTotal)) * speed;

        /*console.log("cur width: " + self.$.css("width"));*/
        newPosW = self.width + wPos;
        /*console.log("width: " + newPosW);*/
        self.$.css("width", newPosW + "px");
        
        //make sure that the image is only "zoomed in" once
        if (curRatio < 0.1) {
        	self.animated = true;
        }
	};
	
	/*anims["_0017_Layer-19"].animate = function() {
		var self = anims["_0017_Layer-19"];
		self.animated = true;
        self.$.animate({
            left: self.endl + 'px',
            top: self.endt + 'px',
        }, {
            duration: 500,
            specialEasing: {
                width: 'easeOutQuint'
            },
            complete: function() {
            }
        });
	};
	*/
	
	function flyIn(element, callback) {
		
		
		// allow you to say:	flyIn("_0001_start2", function() {anims["_0001_text"].animate()});
		if (typeof element !== "object")
			var self = anims[element];
		else
			var self = element;

		// allow you to say:	flyIn("_0001_start2", function() {anims["_0001_text"].animate()}, 3000);		
		if (arguments[2] !== undefined)
			var durate = arguments[2]
		else
			var durate = 300;

		// allow you to say:	flyIn("_0001_start2", 3000);				
		if (typeof callback === "number") {
			var durate = callback;
			callback = function(){};
		}
				
		self.animated = true;
        self.$.animate({
            left: self.endl + 'px',
            top: self.endt + 'px'
        }, {
            duration: durate,
            specialEasing: {
                left: 'easeOutQuint',
                top: 'easeOutQuint'
            },
            complete: function() {
        		// allow you to say:	flyIn("_0001_start2");		
				if (typeof callback !== "undefined")
			    	callback();
            }
        });	
	}
	
	
	anims["_0001_start4"].animate = function () {
		flyIn("_0001_start4", 5000);
		flyIn("_0001_start3", 5000);
		flyIn("_0001_start2", 5000);
		flyIn("_0001_start1", 5000, anims["_0001_text"].animate());
	}
	anims["_0001_text"].animate = function () {
		anims["_0001_text"].$.fadeIn(500)
	}
	anims["_0017_Layer-19"].animate = function() {
		flyIn(anims["_0017_Layer-19"], function(){anims["_0002_Layer-4"].animate();});
	};
	anims["_0002_Layer-4"].animate = function() {
		flyIn(anims["_0002_Layer-4"], function(){anims["_0008_Layer-10"].animate()});
	};
	anims["_0008_Layer-10"].animate = function() {
		flyIn(anims["_0008_Layer-10"], function(){anims["_0011_Layer-13"].animate();});
	};
	anims["_0011_Layer-13"].animate = function() {
		flyIn(anims["_0011_Layer-13"], function(){});
	};
	
	anims["_0016_Layer-18"].animate = function() {
		flyIn(anims["_0016_Layer-18"], function(){anims["_0007_Layer-9"].animate();});
	};
	anims["_0007_Layer-9"].animate = function() {
		anims["_0007_Layer-9"].$.css('display', 'inline');
		flyIn(anims["_0007_Layer-9"], function(){anims["_0003_Layer-5"].animate()});
	};
	anims["_0003_Layer-5"].animate = function() {
		anims["_0003_Layer-5"].$.css('display', 'inline');
		flyIn(anims["_0003_Layer-5"], function(){anims["_0012_Layer-14"].animate();});
	};
	anims["_0012_Layer-14"].animate = function() {
		anims["_0012_Layer-14"].$.css('display', 'inline');
		flyIn(anims["_0012_Layer-14"], function(){});
	};
	
	anims["_0004_Layer-6"].animate = function() {
		flyIn(anims["_0004_Layer-6"], function(){anims["_0006_Layer-8"].animate();});
	};
	anims["_0006_Layer-8"].animate = function() {
		flyIn(anims["_0006_Layer-8"], function(){anims["_0013_Layer-15"].animate()});
	};
	anims["_0013_Layer-15"].animate = function() {
		anims["_0013_Layer-15"].$.css('display', 'inline');
		flyIn(anims["_0013_Layer-15"], function(){anims["_0015_Layer-17"].animate();});
	};
	anims["_0015_Layer-17"].animate = function() {
		anims["_0015_Layer-17"].$.css('display', 'inline');
		flyIn(anims["_0015_Layer-17"], function(){});
	};
	
	anims["_0014_Layer-16"].animate = function() {
		anims["_0014_Layer-16"].$.css('display', 'inline');
		flyIn(anims["_0014_Layer-16"], function(){anims["_0018_Layer-20"].animate()});
	};
	anims["_0018_Layer-20"].animate = function() {
		flyIn(anims["_0018_Layer-20"], function(){anims["_0001_Layer-3"].animate();});
	};
	anims["_0001_Layer-3"].animate = function() {
		flyIn(anims["_0001_Layer-3"], function(){});
	};
	
	
	anims["_0000_Layer-2"].animate = function() {
		flyIn(anims["_0000_Layer-2"], function(){anims["_0009_Layer-11"].animate()});
	};
	anims["_0009_Layer-11"].animate = function() {
		flyIn(anims["_0009_Layer-11"], function(){anims["_0010_Layer-12"].animate();});
	};
	anims["_0010_Layer-12"].animate = function() {
		flyIn(anims["_0010_Layer-12"], function(){});
	};
	
	anims["06stadiumlights2"].animate = function() {
        var self = anims["06stadiumlights2"];
        self.$.fadeIn(1500, 'easeOutQuint', function () {              
        	self.animated = true;
        });
    };
    
    anims["07stadiumlights3"].animate = function() {
        var self = anims["07stadiumlights3"];
        self.animated = true;
        self.$.fadeIn(2000, 'easeOutQuint', function () {              
        });
    };
    
    anims["08benz"].animate = function () {
        xScroll("08benz", 0.2);
    };
    
	anims["09lvpattern"].animate = function () {
        xScroll("09lvpattern", 0.4);
    };
    
    anims["12djackson"].animate = function() {
		xScroll("12djackson", 0.6);
	};
	
    anims["11draftstage"].animate = function () {
        xScroll("11draftstage", 0.8);
    };
    
	anims["10jayzkayne"].animate = function () {
        xScroll("10jayzkayne", 0.2);
    };
    
    anims["15freshairblue"].animate = function() {
        var self = anims["15freshairblue"];
        self.$.fadeIn(2000, 'easeOutQuint', function () {              
        	self.animated = true;
        	anims["16freshairgreen"].animate();
        });
    };
    
    anims["16freshairgreen"].animate = function() {
        var self = anims["16freshairgreen"];
        self.animated = true;
        self.$.fadeIn(1500, 'easeOutQuint', function () {              
        });
    };
    
    anims["18letterhead2"].animate = function() {
        var self = anims["18letterhead2"];
        self.animated = true;
        self.$.fadeIn(2000, 'easeOutQuint', function () {              
        });
    };
    
    anims["22flushplogo"].animate = function() {
		var self = anims["22flushplogo"];
		self.animated = true;
        self.$.animate({
            left: self.endl + 'px',
            top: self.endt + 'px'
        }, {
            duration: 1200,
            specialEasing: {
                width: 'easeOutQuint'
            },
            complete: function() {
            }
        });
	};
	
	loadVideo("20heyvideo");
	
    //console.log(anims);

    
    
	$curSlider.scroll(function (e) {	
        
        

		if (onScreen(anims["_0001_start4"].left)) {
			anims["_0001_start4"].animate();
		}
        if (!anims["_0017_Layer-19"].animated && onScreen(anims["03ollibean_01"].right)) {
        	anims["_0017_Layer-19"].animate();
        }
        if (!anims["_0004_Layer-6"].animated && onScreen(anims["03ollibean_01"].right+100)) {
        	anims["_0004_Layer-6"].animate();
        }
        if (!anims["_0016_Layer-18"].animated && onScreen(anims["03ollibean_01"].right+200)) {
        	anims["_0016_Layer-18"].animate();
        }
        if (!anims["_0014_Layer-16"].animated && onScreen(anims["03ollibean_01"].right+300)) {
        	anims["_0014_Layer-16"].animate();
        }
        if (!anims["_0000_Layer-2"].animated && onScreen(anims["03ollibean_01"].right+400)) {
        	anims["_0000_Layer-2"].animate();
        }
        if (!anims["02underline"].animated && onScreen(anims["02underline"].right)) {
        	anims["02underline"].animate();
        }
        if (onScreen(anims["06stadiumlights2"].left+100)) {
        	anims["06stadiumlights2"].animate();
        }
        if (anims["06stadiumlights2"].animated && onScreen(anims["07stadiumlights3"].right)) {
        	anims["07stadiumlights3"].animate();
        }
        if (onScreen(anims["15freshairblue"].right+100)) {
        	anims["15freshairblue"].animate();
        }
        if (onScreen(anims["08benz"].left)) {
        	anims["08benz"].animate();
        }
        if (onScreen(anims["09lvpattern"].left)) {
        	anims["09lvpattern"].animate();
        }
        if (onScreen(anims["12djackson"].left)) {
        	anims["12djackson"].animate();
        }
        if (onScreen(anims["11draftstage"].left)) {
        	anims["11draftstage"].animate();
        }
        if (onScreen(anims["10jayzkayne"].left)) {
        	anims["10jayzkayne"].animate();
        }
        if (onScreen(anims["18letterhead2"].right+100)) {
        	anims["18letterhead2"].animate();
        }
        if (onScreen(anims["22flushplogo"].right)) {
        	anims["22flushplogo"].animate();
        }
	});
}

function animateBayfront(callback) {
	

	
	anims["01hello"].animate = function() {
		var self = anims["01hello"];
		self.animated = true;
        self.$.animate({
            left: self.endl + 'px',
            top: self.endt + 'px'
        }, {
            duration: 1200,
            specialEasing: {
                width: 'easeOutQuint'
            },
            complete: function() {
            	anims["04simplepaper"].animate();
            }
        });
	};

	anims["04simplepaper"].animate = function() {
		var self = anims["04simplepaper"];
		self.animated = true;
		self.$.rotate(3);
		
		anims["05onesimpleword"].animate();

		self.$.animate({
            top: self.endt + 'px'
        }, {
            duration: 1200,
            specialEasing: {
                width: 'easeOutQuint'
            },
            complete: function() {
            }
        });
	};
	  

	anims["03meshcircle"].animate = function() {
		xScrollStable("03meshcircle");
	};
	
	anims["06meshbyvideo"].animate = function() {
		xScrollStable("06meshbyvideo");
	};
	
  
	anims["05onesimpleword"].animate = function() {
		var self = anims["05onesimpleword"];
		self.animated = true;
		self.$.animate({
            top: self.endt + 'px'
        }, {
            duration: 1200,
            specialEasing: {
                width: 'easeOutQuint'
            },
            complete: function() {
            }
        });
	};
	
	var prevPos_parallax = 0;
    var $img_parallax = anims["posterparallax"].$.find("img");
    var maxPos_parallax = anims["posterparallax"].width - parseInt($img_parallax.css("width").replace("px"));
	
    anims["posterparallax"].animate = function () {
        prevPos_parallax = monticcilioScroll(prevPos_parallax, maxPos_parallax, $img_parallax, 6); 
    };
	
	
    anims["14greenmesh"].animate = function() {
		xScrollStable("14greenmesh");
	};
	
	anims["19booktozoom"].animate = function() {
		var self = anims["19booktozoom"];
		
		//NOTE: the following code is based on the yScroll function. We might want to make this a function in the future
        var xcurPos, xTotal, xPos, yTotal, yPos, wTotal, wPos, newPos;
        var speed = 1;
        var windowWidthScale = 0.75;    //to complete the effect without having to scroll through the whole screen

        //maximum movement on the x axis AKA total distance of the x axis
        xWidth = windowWidth*windowWidthScale;
        
        //add an offset to the current scroll position
        xcurPos = Math.abs(curScrollPos+(xWidth *(1-windowWidthScale)) - self.left);

        // total distance its allowed to move on the y axis
        yTotal = self.endt - self.start;
        xTotal = self.endl - self.left;
        wTotal = self.endw - self.width;
        
        var curRatio = xcurPos / xWidth;
        // the amount to move the element by on the y axis
        // compute by calculating the change in the x axis and multiplying it by the total distance on the y axis
        yPos = (yTotal - (curRatio * yTotal)) * speed;
        xPos = (xTotal - (curRatio * xTotal)) * speed;
        wPos = (wTotal - (curRatio * wTotal)) * speed;
        
        newPosY = self.start + yPos;
        newPosX = self.left + xPos;
        newPosW = self.width + wPos;
        
        self.$.css("top", newPosY + "px");
        self.$.css("left", newPosX + "px");
        self.$.css("width", newPosW + "px");
	};
    
	anims["22mesh_unorthodox"].animate = function() {
		xScrollStable("22mesh_unorthodox");
	};
	
    anims["23imac"].animate = function () {
    	var self = anims["23imac"];
    	var currentTop = parseInt(self.$.css('top').replace("px", ""));
        yScroll("23imac");
        if (currentTop - self.endt < 1) {
        	self.animated = true;
    	}
    };
    
    anims["24fullfacebook"].animate = function() {
        var self = anims["24fullfacebook"];
        self.animated = true;
        self.$.fadeIn(5000, 'easeOutQuint', function () {              
        });
    };
    
    anims["25fbhighlight"].animate = function() {
        var self = anims["25fbhighlight"];
        self.animated = true;
        self.$.fadeIn(5000, 'easeOutQuint', function () {              
        });
    };
    
    anims["26glowandtell"].animate = function() {
        var self = anims["26glowandtell"];
        self.animated = true;
        self.$.fadeIn(5000, 'easeOutQuint', function () {              
        });
    };
    
    anims["27welcome"].animate = function() {
		var self = anims["27welcome"];
		self.animated = true;
        self.$.animate({
            left: self.endl + 'px'
        }, {
            duration: 1200,
            specialEasing: {
                width: 'easeOutQuint'
            },
            complete: function() {
            }
        });
	};

	anims["27mesh_welcome"].animate = function() {
		xScrollStable("27mesh_welcome");
	};
	    
    anims["28tray"].animate = function() {
		var self = anims["28tray"];
		self.animated = true;
        self.$.animate({
            left: self.endl + 'px',
            top: self.endt + 'px'
        }, {
            duration: 1200,
            specialEasing: {
                width: 'easeOutQuint'
            },
            complete: function() {
            }
        });
	};
	
	loadVideo("07videoone");
	
	//console.log(anims);

    
    
	$curSlider.scroll(function (e) {	
                
        if (!anims["01hello"].animated && !onScreen(anims["01hello"].left)) {
            anims["01hello"].animate();           
        }
        if (onScreen(anims["03meshcircle"].left)) {
            anims["03meshcircle"].animate();           
        }
        if (onScreen(anims["06meshbyvideo"].left)) {
            anims["06meshbyvideo"].animate();           
        }
  /*      if (onScreen(anims["10mesh_above_baywalk"].right)) {
            anims["10mesh_above_baywalk"].animate();
            anims["10mesh_under_baywalk"].animate();
        } */

		if (onScreen(anims["posterparallax"].left) || onScreen(anims["posterparallax"].right)) {
			anims["posterparallax"].animate();
		}
        if (onScreen(anims["14greenmesh"].left)) {
            anims["14greenmesh"].animate();           
        }
        if (onScreen(anims["22mesh_unorthodox"].left)) {
        	anims["22mesh_unorthodox"].animate();
        }
        if (!anims["19booktozoom"].animated && onScreen(anims["19booktozoom"].left)) {
        	anims["19booktozoom"].animate();
        }
        if (!anims["23imac"].animated && onScreen(anims["23imac"].left)) {
        	anims["23imac"].animate();
        }
        if (!anims["24fullfacebook"].animated && onScreen(anims["24fullfacebook"].activate)) {
        	anims["24fullfacebook"].animate();
        }
        if (!anims["25fbhighlight"].animated && onScreen(anims["25fbhighlight"].activate)) {
        	anims["25fbhighlight"].animate();
        }
        if (!anims["26glowandtell"].animated && onScreen(anims["26glowandtell"].activate)) {
        	anims["26glowandtell"].animate();
        }
        if (!anims["27welcome"].animated && onScreen(anims["27welcome"].activate)) {
        	anims["27welcome"].animate();
        }
        if (onScreen(anims["27mesh_welcome"].left)) {
        	anims["27mesh_welcome"].animate();
        }
        if (!anims["28tray"].animated && onScreen(anims["28tray"].activate)) {
            anims["28tray"].animate();           
        }
	});
};


function animateRelaj(callback) {


	
	/* Slide 1 */
/*	anims["02spotlight"].animate = function() {
		xScrollStable("02spotlight");
	}; */

	anims["03bottle"].animate = function() {
		xScrollStable("03bottle");
	};
	anims["01drops"].animate = function() {
		xScrollStable("01drops");
	};
	
	/* Slide 2 */
	
	
	/* resize the width sequence */
	anims["19text6"].steps = [1127,1235,1302,1339,1419,1525];
	var i = 0;
	for (i=0; i < anims["19text6"].steps.length; i++) {
		anims["19text6"].steps[i] *= resizePercent;
	}
	/* animate the width transitions by stepping through the array */
	anims["19text6"].animate = function() {
		var self = anims["19text6"];
		
		self.$.fadeIn(500, function() {
        	self.animated = true;
			anims["13bottle"].animate()
        });
		
		anims["13bottle"].$.fadeIn(1000, "easeInQuint");
	
	};
	
	/* rotate the bottle*/
	anims["13bottle"].animate = function() {
		rotateScroll("13bottle", 480, anims["48bubble"].xCenter);
	};		

	/* Slide 3 (Rider) */
	
	anims["20rider"].animate = function() {
		xScrollStable("20rider");
		xScrollStable("22text-smoked");
	};
	
	/* Slide 5 (Bubble) */

	anims["48bubble"].animate = function() {
       widthScroll("48bubble", 1);
	};
	
	
	/* Slide 6 */
	
	/* #1 */
	anims["008_line1"].animate = function () {
	    var self = anims["008_line1"];
	    self.animated = true;
	    self.$.animate(
	        {
	            top: self.endt + 'px'
	        }, {
	            duration: 700,
	            specialEasing: {
	                top: 'easeOutQuint'
	            },
	            complete: function () {
	                anims["009_text1"].animate();
	            }
            }
        );
    }
	anims["009_text1"].animate = function() {
		anims["009_text1"].$.fadeIn(2000);
	}
	/* #3 */
	anims["001_line3"].animate = function () {
	    var self = anims["001_line3"];
	    self.animated = true;
	    self.$.animate(
	        {
	            top: self.endt + 'px'
	        }, {
	            duration: 700,
	            specialEasing: {
	                top: 'easeOutQuint'
	            },
	            complete: function () {
	                anims["002_text3"].animate();
	            }
            }
        );
    }
	anims["002_text3"].animate = function() {
		anims["002_text3"].$.fadeIn(2000);
	}	
	/* #2 */
	anims["006_line2"].animate = function () {
	    var self = anims["006_line2"];
	    self.animated = true;
	    self.$.animate(
	        {
	            top: self.endt + 'px'
	        }, {
	            duration: 700,
	            specialEasing: {
	                top: 'easeOutQuint'
	            },
	            complete: function () {
	                anims["007_text2"].animate();
	            }
            }
        );
    }
	anims["007_text2"].animate = function() {
		anims["007_text2"].$.fadeIn(2000);
	}	



	//console.log(anims);

	$curSlider.scroll(function (e) {	
        
        
        
           
/*        if (onScreen(anims["02spotlight"].xCenter)) {
            anims["02spotlight"].animate();           
        }   */
        if (onScreen(anims["03bottle"].left) ) {
            anims["03bottle"].animate();           
        }   
/*        if (onScreen(anims["05text1"].activate)) {
            anims["05text1"].animate();           
        }   */
        if (onScreen(anims["01drops"].right)) {
            anims["01drops"].animate();           
        }
        if ( !anims["19text6"].animated && onScreen( anims["19text6"].xCenter )) {
        	anims["19text6"].animate();
        }
		if ( anims["19text6"].animated && ( onScreen(anims["13bottle"].left - offsetScrollRange) || onScreen(anims["13bottle"].right - offsetScrollRange) )) {
			anims["13bottle"].animate();
		}
	        
        if ( onScreen(anims["20rider"].left) || onScreen(anims["20rider"].right)) {
            anims["20rider"].animate();           
        } 	        
        if ( onScreen(anims["48bubble"].left	)) {
            anims["48bubble"].animate();
        }
        if ( !anims["008_line1"].animated && onScreen( anims["008_line1"].right )) {
        	anims["008_line1"].animate();
        }        
        if ( !anims["006_line2"].animated && onScreen( anims["006_line2"].right )) {
        	anims["006_line2"].animate();
        }
	    if ( !anims["001_line3"].animated && onScreen( anims["001_line3"].right )) {
        	anims["001_line3"].animate();
        }            
        
    });

};

function animateStudios(callback) {
	
	

	
	// sequence 1
	
    anims["01bringtolife"].animate = function() {
        var self = anims["01bringtolife"];
        self.animated = true;
        self.$.fadeIn( 1500, 'easeInOutQuint', function () {              
        	anims["02text"].animate();
	    });
    };
    anims["01bringtolife"].animate = function() {
        var self = anims["01bringtolife"];
        self.animated = true;
        self.$.fadeIn( 1500, 'easeInOutQuint', function () {              
        	anims["04reel"].animate();
	    });
    };
    anims["04reel"].animate = function() {
        var self = anims["04reel"];
        self.animated = true;
        self.$.fadeIn( 1500, 'easeInOutQuint', function () {              
        	anims["03reelplay"].animate();
	    });
    };    
   	anims["04reel"].$.click(function() {
   		anims["03reelplay"].$.fadeOut(500);
   	
   	});
    anims["03reelplay"].animate = function() {
        var self = anims["03reelplay"];
        self.animated = true;
        self.$.fadeIn( 500, 'easeInOutQuint', function () {              
	    });
    };

	// sequence 2   
      
	anims["nielsenvideo"].animate = function() {
        var self = anims["nielsenvideo"];
        self.animated = true;
        self.$.fadeIn( 1500, 'easeInOutQuint', function () {              
	    });
    };
        
    anims["09photo"].animate = function() {
        var self = anims["09photo"];
        self.animated = true;
        self.$.fadeIn( 1000, 'easeInOutQuint', function () {              
	    });
    };
   
	// sequence 3
   
	anims["10text"].animate = function() {
	    var self = anims["10text"];
	    self.animated = true;
	    self.$.fadeIn( 1500, 'easeInOutQuint', function () {              
	    });
	};	
	anims["11red"].animate = function() {
        var self = anims["11red"];
        self.animated = true;
        self.$.fadeIn( 1500, 'easeInOutQuint', function () {              
	    });
    };	    
    
	// flame section
    anims["13smallflame"].animate = function() {
	    xScrollStable("13smallflame");
    };
    anims["12text"].animate = function() {
        var self = anims["12text"];
        self.animated = true;
        self.$.fadeIn( 1500, 'easeInOutQuint', function () {              
	    });
    };
	// instagram section
    anims["15instagram1"].animate = function() {
        var self = anims["15instagram1"];
        self.animated = true;
        anims["16instagram2"].animate();
        self.$.fadeIn( 1500, 'easeInOutQuint', function () {              
	    });
    };    
    anims["16instagram2"].animate = function() {
        var self = anims["16instagram2"];
        self.animated = true;
        self.$.fadeIn( 1500, 'easeInOutQuint', function () {              
	    });
    };    
        
    	
	
	// photo sequence
	
    anims["18photo1"].animate = function() {
        var self = anims["18photo1"];
        self.animated = true;
        self.$.fadeIn( 1000, 'easeInOutQuint', function () {              
	    });
    };	
    anims["19photo2"].animate = function() {
        var self = anims["19photo2"];
        self.animated = true;
        self.$.fadeIn( 1000, 'easeInOutQuint', function () {              
	    });
    };
    anims["20photo3"].animate = function() {
        var self = anims["20photo3"];
        self.animated = true;
        self.$.fadeIn( 1000, 'easeInOutQuint', function () {              
        	anims["21photo4"].animate();
	    });
    };
    anims["21photo4"].animate = function() {
        var self = anims["21photo4"];
        self.animated = true;
        self.$.fadeIn( 1000, 'easeInOutQuint', function () {              
	    	anims["22photo5"].animate();
	    });
    };	
    anims["22photo5"].animate = function() {
        var self = anims["22photo5"];
        self.animated = true;
        self.$.fadeIn( 1000, 'easeInOutQuint', function () {              
	    });
    };   
    anims["22photo5"].animate = function() {
        var self = anims["22photo5"];
        self.animated = true;
        self.$.fadeIn( 1000, 'easeInOutQuint', function () {              
	    });
    };		
    anims["23photo5"].animate = function() {
        var self = anims["23photo5"];
        self.animated = true;
        self.$.fadeIn( 1000, 'easeInOutQuint', function () {              
	    });
    };			

	// 
    anims["25text1"].animate = function() {
        var self = anims["25text1"];
        self.animated = true;
        self.$.fadeIn( 1500, 'easeInOutQuint', function () {              
	    });
    };	
    anims["26text2"].animate = function() {
        var self = anims["26text2"];
        self.animated = true;
        self.$.fadeIn( 1500, 'easeInOutQuint', function () {              
        	anims["25text1"].animate();
	    });
    };	   
     
    anims["27mixer"].animate = function() {
        var self = anims["27mixer"];
        self.animated = true;
        self.$.fadeIn( 1500, 'easeInOutQuint', function () {              
        	anims["28soundbooth"].animate();
	    });
    };
    anims["28soundbooth"].animate = function() {
        var self = anims["28soundbooth"];
        self.animated = true;
        self.$.fadeIn( 1500, 'easeInOutQuint', function () {              
	  	});  
    };
    
  	var playing = false, loaded = false;
  	$audio = "";  	
  	function audioHandler() {
	  	if (!loaded) {
	  		$audio = playmp3("https://trello-attachments.s3.amazonaws.com/4f5e84714378624114ba5907/4f7dfc50e701577b175a006d/G6BlcVFbTE1e5XLsh4J9rWry9iAx/RadioSparkWebsite.mp3");
	  		loaded = true;
	  		playing = true;
  		}
	  	else {
	  		if (playing)
		  		$audio.pause();
		  	else
		  		$audio.play();
		  	playing = !playing;
  		}
  	};
  	
    anims["29newradio"].animate = function() {
        var self = anims["29newradio"];
        self.animated = true;
        self.$.fadeIn( 1500, 'easeInOutQuint', function () {              
            anims["30radioplay"].animate();
	  	});  
	  	self.$.click(audioHandler);
    };
    anims["30radioplay"].animate = function() {
        var self = anims["30radioplay"];
        self.animated = true;
        self.$.fadeIn( 500, 'easeInOutQuint', function () {      
            anims["31radiotext"].animate();
	  	});
	  	self.$.click(audioHandler);
	  	
    };
    anims["31radiotext"].animate = function() {
        var self = anims["31radiotext"];
        self.animated = true;
        self.$.fadeIn( 500, 'easeInOutQuint', function () {  
	  	});  
	  	self.$.click(audioHandler);
    };
    anims["33image"].animate = function() {
        var self = anims["33image"];
        self.animated = true;
        self.$.fadeIn( 1500, 'easeInOutQuint', function () {              
	  	});  
    };
    anims["34text"].animate = function() {
        var self = anims["34text"];
        self.animated = true;
        self.$.fadeIn( 1500, 'easeInOutQuint', function () {              
	  	});  
    };

	loadVideo("04reel");
	loadVideo("nielsenvideo");
    resizeVideos($curSlider);

	function playmp3(url){
	    var audioElement = document.createElement('audio');
	    audioElement.setAttribute('src', url);
	    audioElement.load();
	    audioElement.addEventListener("canplay", function() {
	        audioElement.play();
	    });
	    return audioElement;
	}

        	
	//console.log(anims);
	
	$curSlider.scroll(function (e) {	
		
		

		
		// find and replace to insert has animated condition
		if (!anims["01bringtolife"].animated && onScreen(anims["01bringtolife"].xCenter)) {
			anims["01bringtolife"].animate();
			anims["01bringtolife"].animated = true;
		}
		if (!anims["nielsenvideo"].animated && onScreen(anims["nielsenvideo"].xCenter)) {
			anims["nielsenvideo"].animate();
			anims["nielsenvideo"].animated = true;
		}
		if (!anims["09photo"].animated && onScreen(anims["09photo"].xCenter)) {
			anims["09photo"].animate();
			anims["09photo"].animated = true;
		}
		if (!anims["10text"].animated && onScreen(anims["10text"].xCenter)) {
			anims["10text"].animate();
			anims["10text"].animated = true;
		}
		if (!anims["11red"].animated && onScreen(anims["11red"].xCenter)) {
			anims["11red"].animate();
			anims["11red"].animated = true;
		}
		if (onScreen(anims["13smallflame"].left)) {
			anims["13smallflame"].animate();
		}		  
		if (!anims["12text"].animated && onScreen(anims["12text"].xCenter)) {
			anims["12text"].animate();
			anims["12text"].animated = true;
		}
		if (!anims["15instagram1"].animated && onScreen(anims["15instagram1"].xCenter)) {
			anims["15instagram1"].animate();
			anims["15instagram1"].animated = true;
		}
		if (!anims["18photo1"].animated && onScreen(anims["18photo1"].xCenter)) {
			anims["18photo1"].animate();
			anims["18photo1"].animated = true;
		}
		if (!anims["19photo2"].animated && onScreen(anims["19photo2"].xCenter)) {
			anims["19photo2"].animate();
			anims["19photo2"].animated = true;
		}
		if (!anims["20photo3"].animated && onScreen(anims["20photo3"].xCenter)) {
			anims["20photo3"].animate();
			anims["20photo3"].animated = true;
		}
		if (!anims["21photo4"].animated && onScreen(anims["21photo4"].xCenter)) {
			anims["21photo4"].animate();
			anims["21photo4"].animated = true;
		}
		if (!anims["22photo5"].animated && onScreen(anims["22photo5"].xCenter)) {
			anims["22photo5"].animate();
			anims["22photo5"].animated = true;
		}
		if (!anims["23photo5"].animated && onScreen(anims["23photo5"].right)) {
			anims["23photo5"].animate();
			anims["23photo5"].animated = true;
		}
		if (!anims["26text2"].animated && onScreen(anims["26text2"].right)) {
			anims["26text2"].animate();
			anims["26text2"].animated = true;
		} 
		if (!anims["27mixer"].animated && onScreen(anims["27mixer"].right)) {
			anims["27mixer"].animate();
			anims["27mixer"].animated = true;
		}	
		if (!anims["29newradio"].animated && onScreen(anims["29newradio"].right)) {
			anims["29newradio"].animate();
			anims["29newradio"].animated = true;
		}
		if (!anims["33image"].animated && onScreen(anims["33image"].xCenter)) {
			anims["33image"].animate();
			anims["33image"].animated = true;
		}
		if (!anims["34text"].animated && onScreen(anims["34text"].right)) {
			anims["34text"].animate();
			anims["34text"].animated = true;
		} 

			
	});

};

function animatePassion(callback) {
	
	


	
	anims["_0001_Nielson_HD"].animate = function() {
	    var self = anims["_0001_Nielson_HD"];
	    self.animated = true;
	    self.$.fadeIn( 500, 'easeOutQuint', function () {              
	    });
	};
	
	anims["_0003_EL-HD"].animate = function() {
	    var self = anims["_0003_EL-HD"];
	    self.animated = true;
	    self.$.fadeIn( 500, 'easeOutQuint', function () {              
			anims["_0001_Nielson_HD"].animate();	              
	    });
	};
	
	anims["_0005_Gordon_HD"].animate = function() {
	    var self = anims["_0005_Gordon_HD"];
	    self.animated = true;
	    self.$.fadeIn( 500, 'easeOutQuint', function () {
			anims["_0007_James-HD"].animate();	              
	    });
	};
	
	anims["_0007_James-HD"].animate = function() {
	    var self = anims["_0007_James-HD"];
	    self.animated = true;
	    self.$.fadeIn( 500, 'easeOutQuint', function () {              
	    });
	};
	
	anims["Richard_HD"].animate = function() {
	    var self = anims["Richard_HD"];
	    self.animated = true;
	    self.$.fadeIn( 500, 'easeOutQuint', function () {              
			anims["_0009_Brett_HD"].animate();	              
	    });
	};
	anims["_0009_Brett_HD"].animate = function() {
	    var self = anims["_0009_Brett_HD"];
	    self.animated = true;
	    self.$.fadeIn( 500, 'easeOutQuint', function () {              
	    });
	};
	
	anims["_0011_Du_HD2"].animate = function() {
	    var self = anims["_0011_Du_HD2"];
	    self.animated = true;
	    self.$.fadeIn( 500, 'easeOutQuint', function () {              
	    });
	};
	
	anims["_0013_Peters-HD"].animate = function() {
	    var self = anims["_0013_Peters-HD"];
	    self.animated = true;
	    self.$.fadeIn( 500, 'easeOutQuint', function () {              
			anims["_0011_Du_HD2"].animate();
	    });
	};
	
	anims["_0015_Tony"].animate = function() {
	    var self = anims["_0015_Tony"];
	    self.animated = true;
	    self.$.fadeIn( 500, 'easeOutQuint', function () {              
	    });
	};
	anims["_0016_A-relentless"].animate = function() {
	    var self = anims["_0016_A-relentless"];
	    self.animated = true;
	    self.$.fadeIn( 500, 'easeOutQuint', function () {              
			anims["_0015_Tony"].animate();
	    });
	};
	anims["_0017_leadership-team"].animate = function() {
	    var self = anims["_0017_leadership-team"];
	    self.animated = true;
	    self.$.fadeIn( 500, 'easeOutQuint', function () {              
			anims["_0016_A-relentless"].animate();
	    });
	};
	anims["_0018_A-relentless-"].animate = function() {
	    var self = anims["_0018_A-relentless-"];
	    self.animated = true;
	    self.$.fadeIn( 500, 'easeOutQuint', function () {              
	    });
	};
	anims["_0020_Spark_Leaves"].animate = function() {
	    var self = anims["_0020_Spark_Leaves"];
	    self.animated = true;
	    self.$.fadeIn( 500, 'easeOutQuint', function () {              
	    });
	};
	anims["_0021_Play"].animate = function() {
	    var self = anims["_0021_Play"];
	    self.animated = true;
	    self.$.fadeIn( 500, 'easeOutQuint', function () {              
	    });
	};
	anims["_0022_Genuine-collaboration"].animate = function() {
	    var self = anims["_0022_Genuine-collaboration"];
	    self.animated = true;
	    self.$.fadeIn( 500, 'easeOutQuint', function () {              
	    });
	};
	anims["_0024_Kitchen"].animate = function() {
	    var self = anims["_0024_Kitchen"];
	    self.animated = true;
	    self.$.fadeIn( 500, 'easeOutQuint', function () {              
	    });
	};
	anims["_0025_And-if-challenges"].animate = function() {
	    var self = anims["_0025_And-if-challenges"];
	    self.animated = true;
	    self.$.fadeIn( 500, 'easeOutQuint', function () {              
	    });
	};
	anims["_0027_Wall"].animate = function() {
	    var self = anims["_0027_Wall"];
	    self.animated = true;
	    self.$.fadeIn( 500, 'easeOutQuint', function () {              
	    });
	};
	anims["_0028_Video"].animate = function() {
	    var self = anims["_0028_Video"];
	    self.animated = true;
	    self.$.fadeIn( 500, 'easeOutQuint', function () {              
	    });
	};
	anims["_0025_And-if-challenges-old"].animate = function() {
	    var self = anims["_0025_And-if-challenges-old"];
	    self.animated = true;
	    self.$.fadeIn( 500, 'easeOutQuint', function () {              
			anims["_0028_Video"].animate();
	    });
	};
	anims["_0031_Reception"].animate = function() {
	    var self = anims["_0031_Reception"];
	    self.animated = true;
	    self.$.fadeIn( 500, 'easeOutQuint', function () {              
			anims["_0025_And-if-challenges-old"].animate();
	    });
	};
	
	loadVideo("_0021_Play");
	loadVideo("_0028_Video");
    resizeVideos($curSlider);	
        	
	//console.log(anims);

	$curSlider.scroll(function (e) {	
		
		
		if (!anims["_0003_EL-HD"].animated && onScreen(anims["_0003_EL-HD"].xCenter)) {
			anims["_0003_EL-HD"].animate();
			anims["_0003_EL-HD"].animated = true;
		}
	
		if (!anims["_0005_Gordon_HD"].animated && onScreen(anims["_0005_Gordon_HD"].xCenter)) {
			anims["_0005_Gordon_HD"].animate();
			anims["_0005_Gordon_HD"].animated = true;
		}
		
		if (!anims["Richard_HD"].animated && onScreen(anims["Richard_HD"].xCenter)) {
			anims["Richard_HD"].animate();
			anims["Richard_HD"].animated = true;
		}
		
		if (!anims["_0013_Peters-HD"].animated && onScreen(anims["_0013_Peters-HD"].xCenter)) {
			anims["_0013_Peters-HD"].animate();
			anims["_0013_Peters-HD"].animated = true;
		}
		
		if (!anims["_0018_A-relentless-"].animated && onScreen(anims["_0018_A-relentless-"].xCenter)) {
			anims["_0018_A-relentless-"].animate();
			anims["_0018_A-relentless-"].animated = true;
		}
		if (!anims["_0017_leadership-team"].animated && onScreen(anims["_0017_leadership-team"].xCenter)) {
			anims["_0017_leadership-team"].animate();
			anims["_0017_leadership-team"].animated = true;
		}
		if (!anims["_0020_Spark_Leaves"].animated && onScreen(anims["_0020_Spark_Leaves"].xCenter)) {
			anims["_0020_Spark_Leaves"].animate();
			anims["_0020_Spark_Leaves"].animated = true;
		}
		if (!anims["_0021_Play"].animated && onScreen(anims["_0021_Play"].xCenter)) {
			anims["_0021_Play"].animate();
			anims["_0021_Play"].animated = true;
		}
		if (!anims["_0022_Genuine-collaboration"].animated && onScreen(anims["_0022_Genuine-collaboration"].xCenter)) {
			anims["_0022_Genuine-collaboration"].animate();
			anims["_0022_Genuine-collaboration"].animated = true;
		}
		if (!anims["_0024_Kitchen"].animated && onScreen(anims["_0024_Kitchen"].xCenter)) {
			anims["_0024_Kitchen"].animate();
			anims["_0024_Kitchen"].animated = true;
		}
		if (!anims["_0025_And-if-challenges"].animated && onScreen(anims["_0025_And-if-challenges"].xCenter)) {
			anims["_0025_And-if-challenges"].animate();
			anims["_0025_And-if-challenges"].animated = true;
		}
		if (!anims["_0027_Wall"].animated && onScreen(anims["_0027_Wall"].xCenter)) {
			anims["_0027_Wall"].animate();
			anims["_0027_Wall"].animated = true;
		}
		if (!anims["_0031_Reception"].animated && onScreen(anims["_0031_Reception"].xCenter)) {
			anims["_0031_Reception"].animate();
			anims["_0031_Reception"].animated = true;
		}
		
		
		
	});
	
	

};

function loadInstagrams() {

	var section = arguments[0];
			
	var $instaContainer = $curSlider.find(".instacontainer");
	
	var $instaImg = $instaContainer.find("img");	
	
	var count = $instaImg.size();	
	
	$instaContainer.css({
		top : 130 * resizePercent + "px",
		height : 600 * resizePercent + "px",
		left: $instaContainer.css("left").replace("px", "") * resizePercent + "px",
		width: count * ((600 * resizePercent) + 50) + "px"
	});
		
	curSliderInnerWidth = $instaContainer.width() + parseInt($instaContainer.css("left").replace("px",""));
	unseenSliderInnerWidth = curSliderInnerWidth - windowWidth;
	$curSlider.find(".inner").css("width", curSliderInnerWidth + "px");
	
};

function forceImages() {

	$("#forced-images").css("width", "auto");
	
	$("#forced-images span").each(function() {
		
		$(this).css({
			"width" : 600 * resizePercent + "px",
			"height" : 600 * resizePercent + "px",
			"overflow" : "hidden"
		});	
	});
};

        	
function animateSparkDay(callback) {
	
	loadInstagrams("sparkday");
	// forceImages();
};

function animateShame(callback) {
	
	loadInstagrams("shame");
	// forceImages();

};


function animateClock(callback) {
	
	loadInstagrams("clock");
	// forceImages();

};


function animateOnSet(callback) {

	loadInstagrams("onset");
	// forceImages();

};


function animsObject() {

	var $selector = arguments[0];
	var callback = arguments[1];
    var _anims = {};
    var currentLayer = 1;
    var numberOfLayers = $selector.size();
    
	//	console.log(numberOfLayers);

    $selector.each(function () {

        var $this = $(this);

        _anims[$this.attr('id')] = {};
        var layer = _anims[$this.attr('id')];

		layer.id = $this.attr('id');
        layer.left = parseInt($this.css('left').replace("px", ""));
        layer.width = parseInt($this.css('width').replace("px", ""));
        layer.height = parseInt($this.css('height').replace("px", ""));
        layer.right = parseInt(layer.left) + parseInt(layer.width);
        layer.animated = false;
        layer.start = parseInt($this.css('top').replace("px", ""));
        layer.end = $this.data("end");
        layer.endl = $this.data("endl");
        layer.endt = $this.data("endt");
        layer.endw = $this.data("endw");
        layer.top = layer.start;
        layer.rangeX = layer.endl - layer.left; 
        layer.xCenter = layer.left + layer.width / 2;
        layer.yDistance = layer.end - layer.start;
        layer.$ = $this;
        layer.activate = $this.data("activate") ;
        if (layer.endl !== 'undefined' && layer.activate === 'undefined') {
            layer.activate = layer.endl;
        }
        else if (layer.activate === 'undefined') {
            layer.activate = layer.endl;        	
        }
        if (layer.endt === "NaN")
	    	layer.endt = layer.end;
	    	
	    currentLayer++;
	    if (currentLayer === numberOfLayers && (typeof callback !== "undefined")) {
	    	// setTimeout(callback, 50);	    	
	    }
    });
    

    return _anims;

};

function loadVideo() {

	// note that this function creates an access control origin error, there's nothing we can do about it though
	// the error happens here as well: http://www.blind.com/work/project/metersbonwe-mtee-havoc-in-heaven/

	var element = anims[arguments[0]];
	var width = arguments[1] || element.width;
	var height = arguments[2] || element.width * .562;
		
	element.$.data("cover", element.$.find("img").attr("src"));	
	
	element.$.click(function() {
	
		if ($curVideo !== null) {
			$curVideo.html("<img src='" + $curVideo.data("cover") + "' />");		
		}

		var videoHTML = '<span class="vid"><iframe src="http://player.vimeo.com/video/' + element.$.data('video') +'?title=0&amp;byline=0&amp;&amp;autoplay=1&amp;portrait=0;" width="' + width  + '" height="' + height  + '" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe></span>';
		
		element.$.html(videoHTML);
		$curVideo = element.$;
				
    });
} 

function yScroll() {
    /* 			example call: 				oldyScroll("stair-top");
		TO ADD	example call with args: 	oldyScroll("stair-top", { 'xEnd' : 300, 'speed' : 2.3});	
		
		assume that the left edge of the element is the number that defines its position
		
		NOTE that xPos and yPos are not the actual position of the element.
		
		xPos and yPos are the position relative to the change thats happening on the screen.
		
		to get the actual position of the element, you must add yPos to the base position.
	*/

    var xPos, xTotal, yPos, yTotal, newPos;

    var element = arguments[0];
    var nearEnd = arguments[1] || false;
    var self = anims[element];
    var speed = 1;
          

    xPos = Math.abs(curScrollPos - self.left);
    // maximum movement on the x axis AKA total distance of the x axis
    xTotal = windowWidth;
    
    if (nearEnd) {
    	xTotal = -1 * (windowWidth - ( (curSliderInnerWidth - self.left) / resizePercent));
    }
    
   
	var xDelta = (xPos / xTotal);

	if (nearEnd && element === "39fbcloseup" ) {
	
		xDelta = 1 / xDelta;
    	console.log ( xDelta);
	}
    // total distance its allowed to move on the y axis
    yTotal = self.endt - self.start;

    // the amount to move the element by on the y axis
    // compute by calculating the change in the x axis and multiplying it by the total distance on the y axis
    yPos = (yTotal - (xDelta * yTotal)) * speed;

    newPos = self.start + yPos;

    /*
	console.log ("xTotal: " + xDistance);	
	console.log ("yTotal: " + yDistance);
	console.log ("xPos: " + xPos);	
	console.log ("yPos: " + yPos);
	console.log ("newPos: " + newPos);
	console.log ("---------");
	*/

    self.$.css("top", newPos + "px");

    return newPos;

}

function yDownScroll() {
    /* 			example call: 				oldyScroll("stair-top");
		TO ADD	example call with args: 	oldyScroll("stair-top", { 'xEnd' : 300, 'speed' : 2.3});	
		
		assume that the left edge of the element is the number that defines its position
		
		NOTE that xPos and yPos are not the actual position of the element.
		
		xPos and yPos are the position relative to the change thats happening on the screen.
		
		to get the actual position of the element, you must add yPos to the base position.
	*/

    var xPos, xTotal, yPos, yTotal, newPos;

    var element = arguments[0];
    var self = anims[element];
    var speed = 1;

    // If we move from high y to low y, we need to count downwards from yTotal to 0
    // If we move from low y to high y, we need to count upwards from 0 to yTotal
    // The counter is yPos
    // amount that element moved on x axis
    xPos = Math.abs(curScrollPos - self.left);
    // maximum movement on the x axis AKA total distance of the x axis
    xTotal = windowWidth;

    // total distance its allowed to move on the y axis
    yTotal = self.end - self.start;

    // the amount to move the element by on the y axis
    // compute by calculating the change in the x axis and multiplying it by the total distance on the y axis
    yPos = (xPos / xTotal) * yTotal * speed;

    newPos = self.start + yPos;

    /*
	console.log ("xTotal: " + xDistance);	
	console.log ("yTotal: " + yDistance);
	console.log ("xPos: " + xPos);	
	console.log ("yPos: " + yPos);
	console.log ("newPos: " + newPos);
	console.log ("---------");
	*/

    self.$.css("top", newPos + "px");

    return newPos;

}

function opacityScroll(element) {

    var self = anims[element];

    // move the element to the left by the amount the scroller moved * some factor of change
    var self = anims[element];
    
    xPos = Math.abs(curScrollPos - self.left);
    // maximum movement on the x axis AKA total distance of the x axis
    xTotal = windowWidth;
    
    xDelta = xPos / xTotal;
    if (xDelta > .5) xDelta = 1 - xDelta;
    
    xDelta *= 2;
        
    // counts from 0 to window width
    self.$.css("opacity", xDelta);

    return xDelta;

};

function xScroll(element, factor) {

    // move the element to the left by the amount the scroller moved * some factor of change
    var self = anims[element];

    var left = self.$.css("left").replace("px", "");

    left = parseInt(left) - (changeInScrollPos * factor);
    
    self.$.css("left", left + "px");


	// console.log ("changeInScrollPos: ", changeInScrollPos);	
	// console.log ("left: " + left);
    return left;

};

function xScrollStable(element) {

    var self = anims[element];

    var left = self.$.css("left").replace("px", "");   
	// get the distance between the final position of the element and the curScrollPos and divide it by windowWidth 
    var delta = -1 * ((curScrollPos - self.endl) / windowWidth);
	
    left = self.endl - (self.rangeX * delta);
    
    self.$.css("left", left + "px");

    return left;
};


function widthScroll(element, speed) {

    // move the element to the left by the amount the scroller moved * some factor of change
    var self = anims[element];
    
    xPos = Math.abs(curScrollPos - self.left);
    // maximum movement on the x axis AKA total distance of the x axis
    xTotal = windowWidth;
    
    xDelta = xPos / xTotal;
    
    self.widthRange = self.endw - self.width;
    
 	newWidth = self.widthRange - (xDelta * self.widthRange * speed);   
    
    self.$.css("width", newWidth + "px");
    
    return newWidth;

};

function rotateScroll(element, range, testPos) {

    // rotate the element to the left by the amount the scroller moved * some factor of change
    var self = anims[element];
    
    if (typeof testPos == undefined)
    	testPos = self.left;
    
    xPos = Math.abs(curScrollPos - testPos);
    // maximum movement on the x axis AKA total distance of the x axis
    xTotal = windowWidth;
    
    xDelta = xPos / xTotal;
    
    self.angle = range - (xDelta * range);
    
    // //console.log (self.angle);
    
    self.$.rotate(self.angle);
    
    return self.angle;

};

function monticcilioScroll (prevPos, maxPos, $img, rate) {
	
	/*
	 * Applies the scrolling parallax frame effect to a layer
	 *
	 * Requires a prevPos (set to 0), maxPos (set to the max range of motion), and the image that will be moved
	 * 		This may look ugly, but saves a few calculations by caching them outside of the animation.
	 *
	 * Example HTML:
	 *
			<span id="23billboard" class="layer" data-resize-children="true" style="width:1204px; top:0px; left: 11216px; overflow:hidden;">
				<img src="images/visitflorida/23billboard.jpg" class="resize" style="width:1604px; left: 0px; top: 0px; position: relative;" />
			</span>
	 * 
	 * Example JS:
	 *		 
			var prevPos_23 = 0;
		    var $img_23 = anims["23billboard"].$.find("img");
		    var maxPos_23 = anims["23billboard"].width - parseInt($img_23.css("width").replace("px"));
		
		    anims["23billboard"].animate = function () {
		        prevPos_23 = monticcilioScroll(prevPos_23, maxPos_23, $img_23, 2); 
		    };
	 *
	 */

    var newPos = prevPos - ( changeInScrollPos / rate);
    
//    console.log("newPos" + newPos)
    
    if ( newPos >= 0 ) {
    	newPos = 0;
    }
    else if ( newPos <= maxPos) {
    	newPos = maxPos;
	}

    $img.css("left", newPos + "px");        

	return newPos;
};


function inMiddle(x) {
    // returns true when the number x is within the range of the screen
    // left is the potion of the left edge of the scroller
    var left = curScrollPos + ( windowWidth / 4);
    var right = curScrollPos + ( windowWidth * .75);
    return (x >= left) && (x <= right);
};

function onScreen(x) {
    // returns true when the number x is within the range of the screen
    // left is the potion of the left edge of the scroller
    
    if (x == 0)
    	curScrollPos -= offsetScrollRange;
    var right = curScrollPos + windowWidth;
    return (x >= curScrollPos) && (x  <= right);
};

function resizeVideos($slider) {
	var video = $slider.find(".video");
	
	video.each(function () {
		var width = $(this).css("width").replace("px", "");
		var height = $(this).css("width").replace("px", "");
		
		width *= resizePercent;
		height = parseInt(width) * .562;
		
		$(this).css({
	            "width": width + "px",
	            "height": height + "px"
	        });
	});
}

function resizeLayers($slider, callback) {

    // this function resizes the CSS for all the layers
    // if the layer has children with custom css, resize their custom css as well
    
    var layers = $slider.find(".layer");
    var numberOfLayers = layers.size();
    
    var callbackCounter = 0;
    
    layers.each(function () {


		// determine the dimensions of the current layer
        var top = $(this).css("top").replace("px", "");
        var left = $(this).css("left").replace("px", "");
        var width = $(this).css("width").replace("px", "");
        var bottom = $(this).css("bottom").replace("px", "");
        var fontsize = $(this).css("font-size").replace("px", "");

		// determine the animation attributes of the current layer
        var end = $(this).data("end");
        var endl = $(this).data("endl");
        var endt = $(this).data("endt");
        var endw = $(this).data("endw");
        var activate = $(this).data("activate");

		// resize the dimensions and animation attributes of the current layer
        top *= resizePercent;
        left *= resizePercent;
        width *= resizePercent;
        end *= resizePercent;
        endl *= resizePercent;
        endt *= resizePercent;
        endw *= resizePercent;
        activate *= resizePercent;
        fontsize *= resizePercent;

//		$(this).find("img").css("width", width + "px");
		
        
		// apply the changes we have made
			 // TODO: rewrite this statement to receive an array with only values that exist. e.g. don't resize width if it is auto
		if ($(this).attr('class') === 'layer instacontainer' || $(this).attr('class') === 'layer line') {
	        $(this).css({
	            "top": top + "px",
	            "left": left + "px"
	        });
        }
        else if ($(this).attr('class') === 'layer instagram') {
        	// do nothing
        }
        else {
	        $(this).css({
	            "top": top + "px",
	            "left": left + "px",
	            "width": width + "px",
	            "font-size": fontsize + "px"
	        });
		}
		
        if (bottom !== 'undefined') {
            bottom *= resizePercent;
            $(this).css({
                "bottom": bottom + "px"
            });
        }
        
        $(this).data("end", end);
        $(this).data("endl", endl);
        $(this).data("endt", endt);
        $(this).data("endw", endw);
        $(this).data("activate", activate);


		// an exception to handle layers that have children that need to be resized as well
        if ($(this).data("resize-children")) {

            var $child = $(this).find(".resize");

            var top = $child.css("top").replace("px", "");
            var left = $child.css("left").replace("px", "");
            var width = $child.css("width").replace("px", "");

            top *= resizePercent;
            left *= resizePercent;
            width *= resizePercent;

            $child.css({
                "top": top + "px",
                "left": left + "px",
                "width": width + "px"
            });

        }
        
        
        /* =====
		   Need to add a resizer for the elements with children images with custom styles; e.g. the glow layers 
		*/
		
		callbackCounter++;
		if (callbackCounter == numberOfLayers && typeof callback !== "undefined") {
			callback();
		}
    });
    
};

function resizeSlider($slider) {
	
	$slider.data("resized", "true");
	
	var $inner = $slider.find(".inner");

	// update the height, they are all the same height
	$inner.css("height", sliderHeight + "px");
	
	// they all have different widths, so loop through each one
	$inner.each(function () {
	
		var $this = $(this);

		var newWidth = resizePercent * $this.css("width").replace("px", "");
		$this.css("width", newWidth + "px");

	});
	
};


function resizeClock($slider) {

    $slider.find(".layer").not(".instagram").each(function () {

        //console.log($(this).attr("id"));
        var top = $(this).css("top").replace("px", "");
        var left = $(this).css("left").replace("px", "");
        var width = $(this).css("width").replace("px", "");
        var bottom = $(this).css("bottom").replace("px", "");
        var margintop = $(this).css("margin-top").replace("px", "");
        var marginbottom = $(this).css("margin-bottom").replace("px", "");
        var marginleft = $(this).css("margin-left").replace("px", "");
        var fontsize = $(this).css("font-size").replace("px", "");
        var height = $(this).css("height").replace("px", "");

        var end = $(this).data("end");
        var endl = $(this).data("endl");
        var endt = $(this).data("endt");
        var endw = $(this).data("endw");
        var activate = $(this).data("activate");


//console.log ("margintop1 " + margintop);
        top *= resizePercent;
        left *= resizePercent;
        width *= resizePercent;
        end *= resizePercent;
        endl *= resizePercent;
        endt *= resizePercent;
        endw *= resizePercent;
        activate *= resizePercent;
        margintop *= resizePercent;
        marginbottom *= resizePercent;
        marginleft *= resizePercent;
        fontsize *= resizePercent;
        height *= resizePercent;
//console.log ("margintop2 " + margintop);
 
        $(this).css({
	            "top": top + "px",
	            "left": left + "px",
	            "width": width + "px",
	            "font-size": fontsize + "px",
	            "margin-top": margintop + "px",
	            "margin-bottom": marginbottom + "px",
	            "margin-left": marginleft + "px",
	            "height": height + "px",
	            "line-height": height + "px"
        });
	});

};

function resize($selector, callback) {

	/* 	this function resizes the sliders it is called on
	
		all sliders: 		resize($(".slider"));
		specific slider: 	resize($("#relaj");
		
		can also add a callback: resize($(".slider"), function() {  alert("hai"); });
		
	*/

	// if the slider has already been resized, exit
	if ($selector.data('resized') === 'true')
		return;

	oldSliderHeight = sliderHeight;
    sliderHeight = maxSliderHeight * resizePercent;
    
    // this one is 820px high, the only exception; no time to request new psd
    if ($selector.attr('id') == 'passion') {
		sliderHeight = 820 * resizePercent;	
	}
	
    if (sliderHeight < maxSliderHeight && sliderHeight + "px" !== $selector.find(".inner").css("height") && $selector.data("resized") !== "true") {
		if ($selector.attr('id') == 'clock') {
			resizeSlider($selector);
			resizeClock($selector);
		}
		else {
		    resizeSlider($selector);
	        resizeLayers($selector, callback);
        }
    }

	/* note that we forward the callback onto the resize layers function; we really aren't done resizing when resize() is done 
		
TODO:		OK, I CANT GET THE CALLBACKS TO WORK IN THE ORDER I WOULD EXPECT THEM TO
	
	*/

};

function updateScrollPos() {

    prevScrollPos = curScrollPos;
    curScrollPos = parseInt($curSlider.scrollLeft()) + offsetScrollRange;
    changeInScrollPos = parseInt(curScrollPos - prevScrollPos);

	//	console.log(changeInScrollPos);

};

(function(a){jQuery.browser.mobile=/android.+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))})(navigator.userAgent||navigator.vendor||window.opera);


})();