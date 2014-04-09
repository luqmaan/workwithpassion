
	/* https://developers.google.com/analytics/devguides/collection/gajs/gaTrackingCustomVariables */
/*	
	function getCookie(c_name)
	{
	var i,x,y,ARRcookies=document.cookie.split(";");
	for (i=0;i<ARRcookies.length;i++)
	{
	  x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
	  y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
	  x=x.replace(/^\s+|\s+$/g,"");
	  if (x==c_name)
	    {
	    return unescape(y);
	    }
	  }
	};
	
	
	var utma = getCookie("__utma");
	utma = utma.split(".");
	
	_gaq.push(['_setCustomVar',
	      1,                   // This custom var is set to slot #1.  Required parameter.
	      'Visitor UTMA ID',     // The name acts as a kind of category for the user activity.  Required parameter.
	      "" + utma[1]  + "",               // This value of the custom variable.  Required parameter.
	      1                    // Sets the scope to session-level.  Optional parameter.
	]);

*/