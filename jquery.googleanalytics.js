/*!
* jQuery Google Analytics Plugin v1.0.0
* https://github.com/JimBobSquarePants/jQuery-Google-Analytics-Plugin

* Copyright 2012, James South
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://jquery.org/license
*
* It is recommended that this file is minified before serving.
*/

/*global $, _gaq, jQuery, _jQuery */
(function ($, undef) {
    /// <param name="$" type="jQuery" />

    "use strict";

    $.fn.googleAnalytics = function (apiName, eventType, attributes) {
        /// <summary>
        ///     The googleAnalytics methods provides a wrapper for sending tracking data
        ///     to google. Current events tracked are "_trackEvent" and "_trackPageview".
        /// </summary>
        ///    <param name="apiName" type="String">
        ///        The type of Google event to track. Currently tracked events are.
        ///      &#10;    1: trackevent.
        ///      &#10;    2: trackPageView.
        ///    </param>
        ///    <param name="eventType" type="String">
        ///        A string containing one or more DOM event types,
        ///     such as "click" or "submit," or custom event names.
        ///    </param>
        ///    <param name="attributes" type="Object" optional="true" parameterArray="true">
        ///        A series of attributes that can be used to override the attributes
        ///     defined by the core google event types. These must follow the same format and order
        ///     of the given _gaq.push() method arguments.
        ///    </param>
        ///    <returns type="jQuery">The jQuery object to allow chaining.</returns>

        // Reference outer jQuery context.
        var outer = this,

        // The list of tracker types.
            trackerList = [],

             analytics = (function () {
                 /// <summary>
                 ///     The ga object contains all the functions necessary to create a tracker
                 ///     to send analytics data to google.
                 /// </summary>

                 var ga = {},
                     validation = {
                         /// <summary>
                         ///     A series of methods designed to test data-attribute values.
                         /// </summary>

                         isString: function (obj) {
                             /// <summary>
                             ///     Checks to see if a given object is a valid non-empty string.
                             /// </summary>
                             ///    <param name="obj" type="String">
                             ///        The object to check against.
                             ///    </param>
                             ///    <returns type="Boolean">True if the string is valid, otherwise false.</returns>

                             var empty = true;

                             if (obj && typeof obj === "string") {
                                 empty = /^\s*$/.test(obj);
                             }

                             // If empty === true then something is wrong and we should return false.
                             return !(empty);

                         },

                         optionalString: function (obj) {
                             /// <summary>
                             ///     Checks to see if a given object is a valid non-empty string.
                             ///     Since the object is optional if it is equal to undefined then validation
                             ///     will return true.
                             /// </summary>
                             ///    <param name="obj" type="String">
                             ///        The object to check against.
                             ///    </param>
                             ///    <returns type="Boolean">True if the string is valid, otherwise false.</returns>

                             if (obj === undef) {
                                 return true;
                             }

                             return validation.isString(obj);
                         },

                         isInt: function (obj) {
                             /// <summary>
                             ///     Checks to see if a given object is a valid integer.
                             ///     http://stackoverflow.com/questions/3885817/how-to-check-if-a-number-is-float-or-integer
                             ///     http://lawrence.ecorp.net/inet/samples/regexp-validate2.php
                             /// </summary>
                             ///    <param name="obj" type="Integer">
                             ///        The object to check against.
                             ///    </param>
                             ///    <returns type="Boolean">True if the number is valid, otherwise false.</returns>

                             return (/^[\-+]?\d+$/).test(obj) || (obj === +obj && obj === (obj | 0));

                         },

                         optionalInt: function (obj) {
                             /// <summary>
                             ///     Checks to see if a given object is a valid integer.
                             ///     Since the object is optional if it is equal to undefined then validation
                             ///     will return true.
                             /// </summary>
                             ///    <param name="obj" type="Integer">
                             ///        The object to check against.
                             ///    </param>
                             ///    <returns type="Boolean">True if the number is valid, otherwise false.</returns>

                             if (obj === undef) {
                                 return true;
                             }

                             return validation.isInt(obj);
                         },

                         isFloat: function (obj) {
                             /// <summary>
                             ///     Checks to see if a given object is a valid float.
                             ///     http://stackoverflow.com/questions/3885817/how-to-check-if-a-number-is-float-or-integer
                             ///     http://lawrence.ecorp.net/inet/samples/regexp-validate2.php
                             /// </summary>
                             ///    <param name="obj" type="Float">
                             ///        The object to check against.
                             ///    </param>
                             ///    <returns type="Boolean">True if the number is valid, otherwise false.</returns>

                             return (/^[\-+]?\d+(\.\d+)?$/).test(obj) || (obj === +obj && obj !== (obj | 0));
                         },

                         optionalFloat: function (obj) {
                             /// <summary>
                             ///     Checks to see if a given object is a valid float.
                             ///     Since the object is optional if it is equal to undefined then validation
                             ///     will return true.
                             /// </summary>
                             ///    <param name="obj" type="Float">
                             ///        The object to check against.
                             ///    </param>
                             ///    <returns type="Boolean">True if the number is valid, otherwise false.</returns>

                             if (obj === undef) {
                                 return true;
                             }

                             return validation.isFloat(obj);
                         },

                         isBool: function (obj) {
                             /// <summary>
                             ///     Checks to see if a given object is a valid boolean.
                             /// </summary>
                             ///    <param name="obj" type="Boolean">
                             ///        The object to check against.
                             ///    </param>
                             ///    <returns type="Boolean">True if the boolean is valid, otherwise false.</returns>

                             return (obj === true || obj === "true") || (obj === false || obj === "false");

                         },

                         optionalBool: function (obj) {
                             /// <summary>
                             ///     Checks to see if a given object is a valid boolean.
                             ///     Since the object is optional if it is equal to undefined then validation
                             ///     will return true.
                             /// </summary>
                             ///    <param name="obj" type="Boolean">
                             ///        The object to check against.
                             ///    </param>
                             ///    <returns type="Boolean">True if the boolean is valid, otherwise false.</returns>
                             if (obj === undef) {
                                 return true;
                             }

                             return validation.isBool(obj);
                         }
                     },
                 // A list of Api objects.
                     apiList = {};

                 // Api items.
                 // The order of properties must mach the order of the arguments in Google's
                 // _gaq.push() methods.

                 apiList.trackEvent = function () {
                     /// <summary>
                     ///     The trackEvent object defines all the necessary parameters
                     ///     to send event tracking analytics data to google.
                     ///     http://code.google.com/apis/analytics/docs/tracking/eventTrackerGuide.html
                     /// </summary>

                     this.event = {
                         value: "_trackEvent",
                         validation: "isString",
                         fallback: "_trackEvent"
                     };

                     this.category = {
                         value: undef,
                         validation: "isString",
                         fallback: ""
                     };

                     this.action = {
                         value: undef,
                         validation: "isString",
                         fallback: ""
                     };

                     this.label = {
                         value: undef,
                         validation: "isString",
                         fallback: ""
                     };

                     this.value = {
                         value: undef,
                         validation: "optionalInt",
                         // Assigning undef to the fallback skips the item.
                         fallback: undef
                     };

                     this.nonInteraction = {
                         value: undef,
                         validation: "optionalBool",
                         fallback: undef
                     };

                 };

                 apiList.trackPageview = function () {
                     /// <summary>
                     ///     The trackEvent object defines all the necessary parameters
                     ///     to send page tracking analytics data to google.
                     ///     http://code.google.com/apis/analytics/docs/gaJS/gaJSApiBasicConfiguration.html#_gat.GA_Tracker_._trackPageview
                     /// </summary>

                     this.event = {
                         value: "_trackPageview",
                         validation: "isString",
                         fallback: "_trackPageview"
                     };

                     this.url = {
                         value: undef,
                         validation: "optionalString",
                         fallback: undef
                     };

                 };

                 apiList.addItem = function () {
                     /// <summary>
                     ///    Use this method to track items purchased by visitors to your ecommerce site.
                     ///    This method tracks individual items by their SKU. This means that the sku 
                     ///    parameter is required. This method then associates the item to the parent 
                     ///    transaction object via the orderId argument.
                     ///    http://code.google.com/apis/analytics/docs/gaJS/gaJSApiEcommerce.html#_gat.GA_Tracker_._addItem
                     /// </summary>

                     this.event = {
                         value: "_addItem",
                         validation: "isString",
                         fallback: "_addItem"
                     };

                     this.orderId = {
                         value: undef,
                         validation: "isString",
                         fallback: ""
                     };

                     this.sku = {
                         value: undef,
                         validation: "isString",
                         fallback: ""
                     };

                     this.name = {
                         value: undef,
                         validation: "isString",
                         fallback: ""
                     };

                     this.category = {
                         value: undef,
                         validation: "optionalString",
                         fallback: ""
                     };

                     this.price = {
                         value: undef,
                         validation: "isFloat",
                         fallback: ""
                     };

                     this.quantity = {
                         value: undef,
                         validation: "isInt",
                         fallback: ""
                     };

                 };

                 apiList.addTrans = function () {
                     /// <summary>
                     ///    Creates a transaction object with the given values. As with 
                     ///    _addItem(), this method handles only transaction tracking and 
                     ///    provides no additional ecommerce functionality. Therefore, if the
                     ///    transaction is a duplicate of an existing transaction for that session, 
                     ///    the old transaction values are over-written with the new transaction values. 
                     ///    Arguments for this method are matched by position, so be sure to supply all 
                     ///    parameters, even if some of them have an empty value.
                     ///    http://code.google.com/apis/analytics/docs/gaJS/gaJSApiEcommerce.html#_gat.GA_Tracker_._addTrans
                     /// </summary>

                     this.event = {
                         value: "_addTrans",
                         validation: "isString",
                         fallback: "_addTrans"
                     };

                     this.orderId = {
                         value: undef,
                         validation: "isString",
                         fallback: ""
                     };

                     this.storeName = {
                         value: undef,
                         validation: "isString",
                         fallback: ""
                     };

                     this.total = {
                         value: undef,
                         validation: "isFloat",
                         fallback: ""
                     };

                     this.tax = {
                         value: undef,
                         validation: "optionalFloat",
                         fallback: ""
                     };

                     this.shipping = {
                         value: undef,
                         validation: "optionalFloat",
                         fallback: ""
                     };

                     this.city = {
                         value: undef,
                         validation: "optionalString",
                         fallback: ""
                     };

                     this.city = {
                         value: undef,
                         validation: "optionalString",
                         fallback: ""
                     };

                     this.state = {
                         value: undef,
                         validation: "optionalString",
                         fallback: ""
                     };

                     this.country = {
                         value: undef,
                         validation: "optionalString",
                         fallback: ""
                     };

                 };

                 apiList.trackTrans = function () {
                     /// <summary> 
                     ///    Sends both the transaction and item data to the Google Analytics server. 
                     ///    This method should be called after _trackPageview(), and used in conjunction 
                     ///    with the _addItem() and addTrans() methods. It should be called after items 
                     ///    and transaction elements have been set up.      
                     /// </summary> 

                     // No attributes to pass.

                 };

                 // Api Wrapper Constructor
                 function ApiWrapper() {
                     /// <summary>
                     ///     The ApiWrapper object provides the basic methods for validating and
                     ///     pushing the current DOM object's attributes.
                     /// </summary>
                     ///    <param name="name" type="String">
                     ///        The type of Google event to track. Currently tracked events are.
                     ///      &#10;    1: trackevent.
                     ///      &#10;    2: trackPageView.
                     ///    </param>

                     var shell = this;

                     // Null name value
                     this.apiName = null;

                     // Checking Methods.
                     // Attributes
                     this.checkAttributes = function () {
                         /// <summary>
                         ///     Validates the "data-ga" attributes assigned to the current DOM object.
                         ///     Throws an error if any of the attributes fail validation.
                         /// </summary>

                         // default attributes are assigned in ga.ApiCall()
                         $.each(this.attributes, function (key, obj) {

                             var attr = "data-ga-" + key.toLowerCase(),
                             // Get the attribute data.
                                 val = obj.value || shell.$elem.data(name) || shell.$elem.attr(attr);

                             if (validation[obj.validation] === undef) {

                                 throw new TypeError("Unknown validation type");
                             }

                             // Assign the value.
                             if (validation[obj.validation](val) === true) {

                                 obj.value = val;

                             } else {

                                 throw new Error("object validation error on " + key);

                             }
                         });

                     };

                     this.createArgumentArray = function () {
                         /// <summary>
                         ///     Creates the argument array from the current attribute list to
                         ///     push to Google.
                         /// </summary>
                         ///    <returns type="Array">An array containing a list of method parameters.</returns>

                         // Map a new array getting the default fallback if undefined.
                         var args = $.map(this.attributes, function (obj, key) {

                             var type = obj.validation,
                                value = obj.value,
                                forceType = shell.forceTypeConversion;


                             if ((type === "isInt" || type === "optionalInt") && forceType) {

                                 if (value !== undef) {

                                     value = parseInt(value, 10);

                                 }

                             } else if ((type === "isFloat" || type === "optionalFloat") && forceType) {

                                 if (value !== undef) {

                                     value = parseFloat(value);
                                 }

                             } else if ((type === "isBool" || type === "optionalBool") && forceType) {

                                 if (value !== undef) {

                                     value = Boolean(value);

                                 }

                             }

                             return value !== undef ? value : obj.fallback;

                         });

                         return args;

                     };

                     // Push the analytics data to Google.
                     this.pushToGoogle = function (event) {
                         /// <summary>
                         ///     Pushes the information contained within "data-ga" attributes assigned
                         ///     to the current DOM object to Google using the "_gaq.push()" method.
                         /// </summary>
                         ///    <param name="event" type="jQuery.Event">
                         ///        The event object normalized according to W3C standards.  
                         ///    </param>

                         var google = window._gaq;

                         function push() {

                             // Create the argument array to pass to Google.
                             var args = shell.createArgumentArray();

                             // Push the data.
                             google.push(args);

                         }

                         // Prevent the default action if required.
                         if (this.preventDefault === true) {

                             event.preventDefault();

                         }

                         if (google) {

                             // Validate the attribute data.
                             this.checkAttributes();

                             // Push to google then call any after code.
                             $.when(push()).then(function () {

                                 var after = shell.after;

                                 // Run any after code.
                                 if ($.isFunction(after)) {

                                     after(shell.$elem);

                                 }

                             });

                         } else {

                             throw new ReferenceError("Google Analaytics _gaq variable not found! Please set up Google Analytics properly.");

                         }

                     };

                     // Public function to call.
                     this.assignTracker = function ($elem, attr) {
                         /// <summary>
                         ///     Assigns the given jQuery object and attributes to a new instance of the current tracker.
                         /// </summary>
                         ///    <param name="$elem" type="jQuery">
                         ///        The jQuery DOM element wrapper.
                         ///    </param>
                         ///    <param name="attr" type="Object">
                         ///        A series of attributes that can be used to override the attributes
                         ///     defined by the core google event types. These must follow the same format and order
                         ///     of the given _gaq.push() method arguments.
                         ///    </param>

                         // Assign the jQuery DOM element wrapper by creating a new tracker and copying the attributes.
                         var tracker = $.extend({}, this, { $elem: $elem, attributes: attr });

                         // Add it to our list of running trackers.
                         trackerList.push(tracker);

                     };

                 }

                 // The this of tracker events avalaible.
                 ga.eventList = {};

                 ga.ApiCall = function (name) {
                     /// <summary>
                     ///     Creates new apiList and ApiWrapper objects matching the given apiName.
                     /// </summary>
                     ///    <param name="name" type="String">
                     ///        The type of Google event to track. Currently tracked events are.
                     ///      &#10;    1: trackevent.
                     ///      &#10;    2: trackPageView.
                     ///    </param>

                     if (!name || typeof name !== "string") {
                         throw new ReferenceError("Invalid API name.");
                     }

                     if (apiList[name] === undef) {
                         throw new ReferenceError("Specified API call unknown.");
                     }

                     // Set up our attributes.
                     var apiAttributes = new apiList[name](),
                         apiObject = new ApiWrapper(name);

                     // Assign the default attributes.
                     apiObject.attributes = apiAttributes;

                     return apiObject;

                 };

                 // Return the google analytics object.
                 return ga;

             } ()),

             trackerFactory = (function () {
                 ///<summary>
                 ///   Initialises the tracker event with the default attributes.
                 ///</summary>

                 var factory = {},
                     createTracker = function (args) {
                         ///<summary>
                         ///   Creates a tracker.
                         ///</summary>

                         if (args && args.apiName) {

                             var name = args.apiName,
                             // Create and add the various properties to the tracker.
                                 tracker = $.extend({}, analytics.ApiCall(name), args);

                             // Add the tracker to the eventList.
                             analytics.eventList[name] = tracker;
                         }
                     },
                     createEventTracker = function () {

                         var trackEventArgs = {
                             apiName: "trackEvent",
                             preventDefault: true,
                             // _trackEvent takes different parameter types to the other methods.
                             forceTypeConversion: true,
                             after: function ($elem) {

                                 // Redirect the location - delayed so that any other page functionality has time to run.
                                 setTimeout(function () {
                                     var href = $elem.attr("href");

                                     if (href !== undef && href !== "#") {
                                         document.location = href;
                                     }

                                 }, 500);
                             }
                         };

                         createTracker(trackEventArgs);
                     },
                     createPageTracker = function () {

                         var trackPageviewArgs = {
                             apiName: "trackPageview",
                             preventDefault: true,
                             // _trackEvent takes different parameter types to the other methods.
                             forceTypeConversion: true,
                             after: function ($elem) {

                                 // Redirect the location - delayed so that any other page functionality has time to run.
                                 setTimeout(function () {
                                     var href = $elem.attr("href");

                                     if (href !== undef) {
                                         document.location = href;
                                     }

                                 }, 500);
                             }
                         };

                         createTracker(trackPageviewArgs);
                     },
                     runTracker = function ($elem, event) {
                         /// <summary>
                         ///     Looks up the current jQuery DOM object against the list of available trackers
                         ///     and runs the apropriate tracker.
                         /// </summary>
                         ///    <param name="$elem" type="jQuery">
                         ///        The jQuery object to look up..
                         ///    </param>
                         ///    <param name="event" type="jQuery.Event">
                         ///        The event object normalized according to W3C standards.  
                         ///    </param>

                         var $shell = $elem,
                             tracker;

                         // Loop through our array and return our stored tracker.
                         $.each(trackerList, function (key, val) {

                             if (val.$elem[0] === $shell[0]) {

                                 // Assign the correct tracker value and exit the loop.
                                 tracker = val;

                                 return true;
                             }
                             return false;
                         });

                         if (tracker !== undef) {
                             // Push the analytics data.
                             tracker.pushToGoogle(event);
                         }

                     },

                     bindEvents = function () {

                         // Event Binding.
                         // Handle any load events.
                         if (eventType.toLowerCase() === "load") {

                             // Bind any standard events.
                             $(document.body).on("click", outer.selector, function (event) {

                                 runTracker($(this), event);

                             });

                         }
                         else {

                             // Bind any standard events.
                             $(document.body).on(eventType, outer.selector, function (event) {

                                 runTracker($(this), event);

                             });
                         }
                     };

                 factory.init = function () {
                     ///<summary>
                     ///    Initialises functions necessary to create each tracker event type.
                     ///</summary>

                     // Initialise the _trackEvent tracker.
                     createEventTracker();

                     // Initialise the _trackPageview tracker.
                     createPageTracker();

                     // Bind tracking events.
                     bindEvents();
                 };

                 return factory;

             } ());

        // Initialise the tracker factory.
        trackerFactory.init();

        // jQuery return
        return this.each(function () {

            var tracker = analytics.eventList[apiName];

            // Track the event if a matching tracker exists.
            if (tracker) {

                // Assign the tracker event to the DOM object.
                tracker.assignTracker($(this), attributes);

                // Handle any load events.
                if (eventType.toLowerCase() === "load") {

                    // Trigger the click event for the object.
                    $(this).trigger("click");
                }
            }

        });
    };

} (jQuery || _jQuery));