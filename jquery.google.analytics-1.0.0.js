/*!
* jQuery Google Analytics Plugin v1.0.0
* https://github.com/JimBobSquarePants/jQuery-Google-Analytics-Plugin
*
* Copyright 2011, James South
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
        ///	<param name="apiName" type="String">
        ///		The type of Google event to track. Currently tracked events are.
        ///      &#10;    1: trackevent.
        ///      &#10;    2: trackPageView. 
        ///	</param>
        ///	<param name="eventType" type="String">
        ///		A string containing one or more DOM event types, 
        ///     such as "click" or "submit," or custom event names.
        ///	</param>
        ///	<param name="attributes" type="Object" optional="true" parameterArray="true">
        ///		A series of attributes that can be used to override the attributes 
        ///     defined by the core google event types. These must follow the same format and order
        ///     of the given _gaq.push() method arguments.
        ///	</param>
        ///	<returns type="jQuery">The jQuery object to allow chaining.</returns>

        // Hold all the event trackers.
        var eventList = [],

            ga = (function () {
                /// <summary>
                ///     The ga object contains all the functions necessary to create a tracker.
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
                        ///	<param name="obj" type="String">
                        ///		The object to check against.
                        ///	</param>
                        ///	<returns type="Boolean">True if the string is valid, otherwise false.</returns>

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
                        ///	<param name="obj" type="String">
                        ///		The object to check against.
                        ///	</param>
                        ///	<returns type="Boolean">True if the string is valid, otherwise false.</returns>
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
                        ///	<param name="obj" type="Integer">
                        ///		The object to check against.
                        ///	</param>
                        ///	<returns type="Boolean">True if the number is valid, otherwise false.</returns>

                        return (/^[\-+]?\d+$/.test(obj)) || obj === +obj && obj === (obj | 0);

                    },

                    optionalInt: function (obj) {
                        /// <summary>
                        ///     Checks to see if a given object is a valid integer.
                        ///     Since the object is optional if it is equal to undefined then validation
                        ///     will return true.
                        /// </summary>
                        ///	<param name="obj" type="Integer">
                        ///		The object to check against.
                        ///	</param>
                        ///	<returns type="Boolean">True if the number is valid, otherwise false.</returns>

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
                        ///	<param name="obj" type="Float">
                        ///		The object to check against.
                        ///	</param>
                        ///	<returns type="Boolean">True if the number is valid, otherwise false.</returns>

                        return (/^[\-+]?\d+(\.\d+)?$/.test(obj)) || obj === +obj && obj !== (obj | 0);
                    },

                    optionalFloat: function (obj) {
                        /// <summary>
                        ///     Checks to see if a given object is a valid float.
                        ///     Since the object is optional if it is equal to undefined then validation
                        ///     will return true.
                        /// </summary>
                        ///	<param name="obj" type="Float">
                        ///		The object to check against.
                        ///	</param>
                        ///	<returns type="Boolean">True if the number is valid, otherwise false.</returns>

                        if (obj === undef) {
                            return true;
                        }

                        return validation.isFloat(obj);
                    },

                    isBool: function (obj) {
                        /// <summary>
                        ///     Checks to see if a given object is a valid boolean.
                        /// </summary>
                        ///	<param name="obj" type="Boolean">
                        ///		The object to check against.
                        ///	</param>
                        ///	<returns type="Boolean">True if the boolean is valid, otherwise false.</returns>

                        return (obj === true || obj === "true") || (obj === false || obj === "false");

                    },

                    optionalBool: function (obj) {
                        /// <summary>
                        ///     Checks to see if a given object is a valid boolean.
                        ///     Since the object is optional if it is equal to undefined then validation
                        ///     will return true.
                        /// </summary>
                        ///	<param name="obj" type="Boolean">
                        ///		The object to check against.
                        ///	</param>
                        ///	<returns type="Boolean">True if the boolean is valid, otherwise false.</returns>
                        if (obj === undef) {
                            return true;
                        }

                        return validation.isBool(obj);
                    }

                },

                // A list of Api objects.
                ApiList = {};

                // Api items. 
                // The order of properties must mach the order of the arguments in Google's
                // _gaq.push() methods. 

                ApiList.trackEvent = function () {
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
                        fallback: "na"
                    };

                    this.action = {
                        value: undef,
                        validation: "isString",
                        fallback: "na"
                    };

                    this.label = {
                        value: undef,
                        validation: "isString",
                        fallback: "na"
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

                ApiList.trackPageview = function () {
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


                // Api Wrapper Constructor
                function ApiWrapper(apiName) {
                    /// <summary>
                    ///     The ApiWrapper object provides the basic methods for validating and 
                    ///     pushing the current DOM object's attributes.
                    /// </summary>
                    ///	<param name="apiName" type="String">
                    ///		The type of Google event to track. Currently tracked events are.
                    ///      &#10;    1: trackevent.
                    ///      &#10;    2: trackPageView. 
                    ///	</param>

                    this.apiName = apiName;

                    // Checking Methods.

                    // Attributes
                    this.checkAttributes = function () {
                        /// <summary>
                        ///     Validates the "data-ga" attributes assigned to the current DOM object.
                        ///     Throws an error if any of the attributes fail validation.
                        /// </summary>

                        var shell = this;

                        // attributes is assigned in ga.ApiCall()
                        $.each(this.attributes, function (key, obj) {

                            var attr = "data-ga-" + key.toLowerCase(),

                            // Get the attribute data.
                            val = obj.value || shell.$elem.data(name) || shell.$elem.attr(attr);

                            if (validation[obj.validation] === undef) {

                                throw new Error("Unknown validation type");

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
                        ///	<returns type="Array">An array containing a list of method parameters.</returns>

                        var shell = this,

                        // Map a new array getting the default fallback if undefined.
                        args = $.map(this.attributes, function (obj, key) {

                            var type = obj.validation,
                                value = obj.value;

                            if (type === "isInt" || type === "optionalInt") {

                                if (value !== undef) {

                                    value = parseInt(value, 10);

                                }

                            }
                            else if (type === "isFloat" || type === "optionalFloat") {

                                if (value !== undef) {

                                    value = parseFloat(value);
                                }

                            }
                            else if (type === "isBool" || type === "optionalBool") {

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
                        ///	<param name="event" type="jQuery.Event">
                        ///		The event object normalized according to W3C standards.  
                        ///	</param>

                        var shell = this;

                        function push() {

                            // Create the argument array to pass to Google.
                            var args = shell.createArgumentArray();

                            // Push the data.
                            _gaq.push(args);

                        }

                        // Prevent the default action if required.
                        if (this.preventDefault === true) {

                            event.preventDefault();

                        }

                        if (_gaq !== undef) {

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

                            throw new Error("Google Analaytics _gaq variable not found! Please set up Google Analytics properly.");

                        }

                    };

                    // Public function to call.
                    this.assignTracker = function ($elem, attributes) {
                        /// <summary>
                        ///     Assigns the given jQuery object and attributes to the current tracker.
                        /// </summary>
                        ///	<param name="$elem" type="jQuery">
                        ///		The jQuery DOM element wrapper.
                        ///	</param>
                        ///	<param name="attributes" type="Object">
                        ///		A series of attributes that can be used to override the attributes 
                        ///     defined by the core google event types. These must follow the same format and order
                        ///     of the given _gaq.push() method arguments.
                        ///	</param>

                        // Assign the jQuery DOM element wrapper.
                        this.$elem = $elem;

                        // Assign any dynamic attributes.
                        if (attributes) {
                            this.attributes = attributes;
                        }

                    };

                }

                ga.ApiCall = function (apiName) {
                    /// <summary>
                    ///     Creates new ApiList and ApiWrapper objects matching the given apiName.
                    /// </summary>
                    ///	<param name="apiName" type="String">
                    ///		The type of Google event to track. Currently tracked events are.
                    ///      &#10;    1: trackevent.
                    ///      &#10;    2: trackPageView. 
                    ///	</param>

                    if (!apiName || typeof apiName !== "string") {

                        throw new Error("Invalid API name.");

                    }

                    if (ApiList[apiName] === undef) {

                        throw new Error("Specified API call unknown.");
                    }

                    // Set up our attributes.
                    var apiAttributes = new ApiList[apiName](),
                    apiObject = new ApiWrapper(apiName);

                    // Assign the default attributes.
                    apiObject.attributes = apiAttributes;

                    return apiObject;

                };

                // Return the google analytics object.
                return ga;

            } ()),

        // The list of tracker types.
            trackerList = {};

        (function () {
            /// <summary>
            ///     Initialisation code for setting up tracker objects and binding events.
            /// </summary>

            // Set up the trackers.
            // Track event
            var trackEvent = {

                getTracker: {},

                makeTracker: function () {

                    var tracker = new ga.ApiCall("trackEvent");
                    tracker.preventDefault = true;
                    tracker.after = function ($elem) {

                        // Redirect the location - delayed so that any other page functionality has time to run.
                        setTimeout(function () {
                            var href = $elem.attr("href");

                            if (href !== undef && href !== "#") {
                                document.location = href;
                            }

                        }, 500);

                    };

                    // Assign the tracker to the trackEvent object.
                    trackEvent.getTracker = tracker;

                    // Add the trackEvent to the eventList.
                    eventList.push(tracker);
                }

            };

            trackerList.trackEvent = trackEvent;

            // Track pageView
            var trackPageview = {

                getTracker: {},

                makeTracker: function () {

                    var tracker = new ga.ApiCall("trackPageview");
                    tracker.preventDefault = true;
                    tracker.after = function ($elem) {

                        // Redirect the location - delayed so that any other page functionality has time to run.
                        setTimeout(function () {
                            var href = $elem.attr("href");

                            if (href !== undef) {
                                document.location = href;
                            }

                        }, 500);

                    };

                    // Assign the tracker to the trackPageview object.
                    trackPageview.getTracker = tracker;

                    // Add the tracker to the eventList.
                    eventList.push(tracker);
                }

            };

            trackerList.trackPageview = trackPageview;

        } ());

        // Bind any events.
        $(document).on(eventType, this.selector, function (event) {

            var $shell = $(this),

                tracker;

            // Loop through our array and return our stored tracker.
            $.each(eventList, function (key, val) {

                if (val.$elem[0] === $shell[0]) {
                    // Assign the correct tracker value and exit the loop.
                    tracker = val;

                    return true;
                }

            });

            if (tracker !== undef) {

                // Push the analytics data.
                tracker.pushToGoogle(event);

            }

        });

        // jQuery return
        return this.each(function () {

            // Track the event if a matching tracker exists.
            if (trackerList[apiName]) {

                // Create a new tracker object for this DOM object.
                trackerList[apiName].makeTracker();

                // Assign the tracker event to the DOM object.
                trackerList[apiName].getTracker.assignTracker($(this), attributes);
            }

        });

    };
} (jQuery || _jQuery));