jQuery Google Analytics Plugin
=========================

A jQuery plugin that helps you set up [Event Tracking With Google Analytics](http://code.google.com/apis/analytics/docs/tracking/eventTrackerGuide.html).


Features
--------

* Reading event tracking variables from HTML data attributes as default.
* Reading pageview tracking variables from HTML data attributes as default.
* Validates values for type before pushing.
* Support for dynamically created DOM objects and attributes created using `$.data()`.
* Support delay for links to ensure that the logging to Google Analytics occurs before redirect.

Dependencies
------------

* jQuery v1.7.0 (or higher). (HTML5 data attributes required)
* Google Analytics script with `_gaq` variable set.

Usage
-----

`$(selector).googleAnalytics(apiName, eventType, attributes)` to initialize tracking at selected elements.

 - **apiName**
   The type of Google event to track. Currently tracked events are.
        1. trackevent.
        2 .trackPageView. 

 - **eventType**
   A string containing one or more DOM event types, such as "click" or "submit," or custom event names.

 - **attributes**
   An optional series of attributes that can be used to override the attributes the core google event types. 
   These must follow the same format and order of the given _gaq.push() method arguments.

   e.g.

	var attributes = {

						event : {
							value: "_trackEvent",
							validation: "isString",
							fallback: "_trackEvent"
						},

						category : {
							value: undef,
							validation: "isString",
							fallback: "na"
						},

						action : {
							value: undef,
							validation: "isString",
							fallback: "na"
						},

						label : {
							value: undef,
							validation: "isString",
							fallback: "na"
						},

						value : {
							value: undef,
							validation: "optionalInt",
							// Assigning undef to the fallback skips the item.
							fallback: undef
						},

						nonInteraction : {
							value: undef,
							validation: "optionalBool",
							fallback: undef
						}

					};

Examples
-----
    <a class="trackEvent" href="#" data-ga-category="category" data-ga-action="action"  data-ga-label="label" >Click to test trackEvent</a>
    $("a.trackEvent").googleAnalytics("trackEvent", "click");

Will bind the `_trackEvent` analytics method to click event of the selected DOM object.

	<a class="trackPageview" href="#" data-ga-url="/some other url">Click to test trackPageview</a>
    $("a.trackPageview").googleAnalytics("trackPageview", "click");    
	
Will bind the `_trackPageview` analytics method to click event of the selected DOM object.

A jsfiddle [link](http://jsfiddle.net/jamessouth/4wV2g/3/) is available for simple testing and debugging (use console to view results).
Fullscreen [link](http://jsfiddle.net/4wV2g/3/embedded/result/)

Please use the [GitHub issue tracker](https://github.com/JimBobSquarePants/jQuery-Google-Analytics-Plugin/issues) for bug
reports and feature requests.

