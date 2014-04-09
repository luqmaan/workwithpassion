var $contact = null, contactFormVisible = false, contactHeight;

$(document).ready(function(){
	$homepagewrapper = $("#home-page-wrapper");
	$container = $("#container");
	$body = $("body");
	
	resizeWrapper();
	setupContactForm();
//	setTimeout(loadAhead, 5000);
	loadAhead();
});

$(window).resize(function() {
	resizeWrapper();	
});

function resizeWrapper(){

	$container.css("height", $(window).height() + "px");
	
	var wrapperHeight = window.innerWidth * 0.68;
	var wrapperWidth = window.innerHeight * 1.46;
	var top = (window.innerHeight / 2) - (wrapperHeight / 2);
	var left = (window.innerWidth / 2) - (wrapperWidth / 2);

	if (window.innerHeight < window.innerWidth * 0.68)
	{	
		$homepagewrapper.css({
			"height": "100%",
			"width": wrapperWidth,
			"left": left
		});
	}
	
	if (window.innerWidth < window.innerHeight * 1.46)
	{
		$homepagewrapper.css({
			"width": "100%",
			"height": wrapperHeight,
			"top": top
		});
	}
	// load the tourwrist widget
	loadEmbeds($("#tourwrist").width(), (wrapperHeight / 5));

	
};

function loadAhead() {
	$("#lff").load('sliders/lff.html');
}

$.getJSON("http://twitter.com/statuses/user_timeline/SPARKbrand.json?callback=?", function(data) {
     $("#tweet").html(parseLinks(data[0].text));

	var created = data[0].created_at;
	var date = new Date(created);
	var month = date.getMonth();
	var day = date.getDate();
	var year = 2012;
	var hour = date.getHours();
	var minutes = date.getMinutes();
	var am = "am";
	
	if(hour > 12)
	{
		hour -= 12;
		am = "pm";
	}
	  
	switch(month)
	{
		case 0:
			month = "January";
				break;
		case 1:
				month = "February";
				break;
		case 2:
			month = "March";
			break;
		case 3:
			month = "April";
			break;
		case 4:
			month = "May";
			break;
		case 5:
			month = "June";
			break;
		case 6:
			month = "July";
			break;
		case 7:
			month = "August";
			break;
		case 8:
			month = "September";
			break;
		case 9:
			month = "October";
			break;
		case 10:
			month = "November";
			break;
		case 11:
			month = "December";
			break;
	default:
		month = "January";
};

created = month + " " + day + ", " + year + " &nbsp;" + hour + ":" + minutes + am;

$("#date").html(created);
});


function parseLinks(tweet) {
    return tweet.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&\?\/.=]+/g, function (tweet) {
       var a = tweet.link(tweet);
       a = a.substring(0,2) + " target='_blank' " + a.substring(3);
       return a;
    });
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

function showContact () {

	// on the first run of the contact form, we cache its selectors
	if ($contact === null) {
		$contact = $("#contact");
		$hideContainer = $("#hide-container")
		$contactLink = $("#contact-link");
		contactHeight = parseInt($contact.height()) + 80; 
	}
	
	$contactLink.toggleClass("active");
	$contact.css({visibility: "visible"});
	
	$container.css({
		"position": "relative",
		"overflow": "hidden"
	}).animate({ top: "-" + contactHeight + "px"}, 1000, "easeOutQuint", function() {
		$contact.css("z-index", 0);
	});
	$hideContainer.fadeIn(1000);	
		
};

function hideContact () {

	$hideContainer.fadeOut(1000);
		
	$container.animate({ top: "0px"}, 1000, "easeOutBounce", function() {
		$container.css({
			"position": "static",
			"overlfow" : "scroll"
		});
		$contact.css({
			"visibility": "hidden",
			"z-index": -100
		});
	});
	$contactLink.toggleClass("active");
};