/*!
* jQuery Google Analytics Plugin v1.1.2
* https://github.com/JimBobSquarePants/jQuery-Google-Analytics/

* Copyright 2012, James South
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://jquery.org/license
*
* It is recommended that this file is minified before serving.
*/

/*global $, _gaq, jQuery, _jQuery, console */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:false, strict:true, undef:true, curly:true, browser:true, maxerr:50 */

(function ($) {

    "use strict";
    
    $.fn.googleAnalytics = function (apiName, eventType, debug) {
        /// <summary>
        ///     The googleAnalytics methods provides a wrapper for sending tracking data
        ///     to google. Current events tracked are "_trackEvent" and "_trackPageview".
        /// </summary>
        /// <param name="apiName" type="String">
        ///     The type of Google event to track. Currently tracked events are.
        ///     &#10;    1: trackevent.
        ///     &#10;    2: trackPageView.
        /// </param>
        /// <param name="eventType" type="String">
        ///     A string containing one or more DOM event types,
        ///     such as "click" or "submit," or custom event names.
        /// </param>
        /// <param name="debug" type="Boolean" optional="true">
        ///     Whether the plugin code is running in debug mode.
        /// </param>
        /// <returns type="jQuery">The jQuery object to allow chaining.</returns>
        
        var validation = {
            /// <summary>
            ///     A series of methods designed to test data-attribute values.
            /// </summary>

            isString: function (obj) {
                /// <summary>
                ///     Checks to see if a given object is a valid non-empty string.
                /// </summary>
                /// <param name="obj" type="String">
                ///     The object to check against.
                /// </param>
                /// <returns type="Boolean">True if the string is valid, otherwise false.</returns>

                var empty = true;

                if (obj && typeof obj === "string") {
                    empty = /^\s*$/.test(obj);
                }

                // If empty === true then something is wrong and we should return false.
                return !(empty);

            },

            optString: function (obj) {
                /// <summary>
                ///     Checks to see if a given object is a valid non-empty string.
                ///     Since the object is optional if it is equal to undefinedined then validation
                ///     will return true.
                /// </summary>
                /// <param name="obj" type="String">
                ///     The object to check against.
                /// </param>
                /// <returns type="Boolean">True if the string is valid, otherwise false.</returns>

                if (obj === undefined) {
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
                /// <param name="obj" type="Integer">
                ///     The object to check against.
                /// </param>
                /// <returns type="Boolean">True if the number is valid, otherwise false.</returns>

                return (/^[\-+]?\d+$/).test(obj) || (obj === +obj && obj === (obj | 0));

            },

            optInt: function (obj) {
                /// <summary>
                ///     Checks to see if a given object is a valid integer.
                ///     Since the object is optional if it is equal to undefinedined then validation
                ///     will return true.
                /// </summary>
                /// <param name="obj" type="Integer">
                ///     The object to check against.
                /// </param>
                /// <returns type="Boolean">True if the number is valid, otherwise false.</returns>

                if (obj === undefined) {
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
                /// <param name="obj" type="Float">
                ///     The object to check against.
                /// </param>
                /// <returns type="Boolean">True if the number is valid, otherwise false.</returns>

                return (/^[\-+]?\d+(\.\d+)?$/).test(obj) || (obj === +obj && obj !== (obj | 0));
            },

            optFloat: function (obj) {
                /// <summary>
                ///     Checks to see if a given object is a valid float.
                ///     Since the object is optional if it is equal to undefinedined then validation
                ///     will return true.
                /// </summary>
                /// <param name="obj" type="Float">
                ///     The object to check against.
                /// </param>
                /// <returns type="Boolean">True if the number is valid, otherwise false.</returns>

                if (obj === undefined) {
                    return true;
                }

                return validation.isFloat(obj);
            },

            isBool: function (obj) {
                /// <summary>
                ///     Checks to see if a given object is a valid boolean.
                /// </summary>
                /// <param name="obj" type="Boolean">
                ///     The object to check against.
                /// </param>
                /// <returns type="Boolean">True if the boolean is valid, otherwise false.</returns>

                return (obj === true || obj === "true") || (obj === false || obj === "false");

            },

            optBool: function (obj) {
                /// <summary>
                ///     Checks to see if a given object is a valid boolean.
                ///     Since the object is optional if it is equal to undefinedined then validation
                ///     will return true.
                /// </summary>
                /// <param name="obj" type="Boolean">
                ///     The object to check against.
                /// </param>
                /// <returns type="Boolean">True if the boolean is valid, otherwise false.</returns>
           
                if (obj === undefined) {
                    return true;
                }

                return validation.isBool(obj);
            }
        },
            googleApi = {
                /// <summary>
                ///     A representation of available methods provided by google analytics.
                /// </summary>
                
                trackEvent: {
                    /// <summary>
                    ///     The trackEvent object defines all the necessary parameters
                    ///     to send event tracking analytics data to google.
                    ///     http://code.google.com/apis/analytics/docs/tracking/eventTrackerGuide.html
                    /// </summary>

                    event: {
                        value: "_trackEvent",
                        validation: "isString",
                        returnType: "string"
                    },

                    category: {
                        value: null,
                        validation: "isString",
                        returnType: "string"
                    },

                    action: {
                        value: null,
                        validation: "isString",
                        returnType: "string"
                    },

                    label: {
                        value: null,
                        validation: "isString",
                        returnType: "string"
                    },

                    value: {
                        value: null,
                        validation: "optInt",
                        returnType: "integer"
                    },

                    nonInteraction: {
                        value: null,
                        validation: "optBool",
                        returnType: "boolean"
                    }
                },
                trackPageview: {
                    /// <summary>
                    ///     The trackEvent object defines all the necessary parameters
                    ///     to send page tracking analytics data to google.
                    ///     http://code.google.com/apis/analytics/docs/gaJS/gaJSApiBasicConfiguration.html#_gat.GA_Tracker_._trackPageview
                    /// </summary>

                    event: {
                        value: "_trackPageview",
                        validation: "isString",
                        returnType: "string"
                    },

                    url: {
                        value: undefined,
                        validation: "optString",
                        returnType: "string"
                    }
                }
            },
            methods = {
                /// <summary>
                ///     Encapsulates the utility methods that track the event.
                /// </summary>
                validate: function (param, name) {
                    /// <summary>
                    ///     Validates the "data-ga" attributes assigned to the current DOM object.
                    ///     Throws an error if any of the attributes fail validation.
                    /// </summary>
                    /// <param name="param" type="Object">
                    ///     An object containing all the necessary infomation to allow
                    ///     validation of the given targets properties.
                    /// </param>
                    /// <param name="name" type="String">
                    ///     A string containing the name of the parameter to validate.
                    /// </param>
                    /// <returns type="Object">The value from the DOM.</returns>
                    
                    var attr = "data-ga-" + name.toLowerCase(),
                        data = this.data(name) || this.attr(attr),
                        isValid;

                    if (!validation[param.validation]) {

                        throw new TypeError("Unknown validation type");
                    }

                    // Check the value.
                    isValid = validation[param.validation](data);

                    if (!isValid) {

                        throw new Error("object validation error on " + name);
                    }

                    // Assign the value.
                    // Some analytics methods accept numbers as strings so we check the return type.
                    switch (param.returnType) {
                        case "integer":
                            return data ? parseInt(data, 10) : null;
                        case "float":
                            return data ? parseFloat(data) : null;
                        case "boolean":
                            return data ? Boolean(data) : null;
                        default:
                            // Default to string.
                            return data ? data + "" : null;
                    }
                },
                createArguments: function (api) {
                    /// <summary>
                    ///     Creates the parameter array to pass to the google _gaq.push() method.
                    /// </summary>
                    /// <param name="api" type="Object">
                    ///     An object containing all the api relevent information to
                    ///     allow validation of the given targets properties.
                    /// </param>
                    /// <returns type="Array">The array of necessary parameters.</returns>
                    
                    var that = this,
                        args = $.map(api, function (val, key) {

                            var value;

                            if (key === "event") {
                                // We don't want to check for the event property in the DOM.
                                value = val.value;

                            } else {

                                // Validate and return the correct value from the DOM.
                                value = methods.validate.call(that, val, key);
                            }

                            return value;
                        });

                    return args;
                },
                trackEvent: function (api) {
                    /// <summary>
                    ///     Tracks the event pushing the elements properties to the google _gaq.push() method.
                    /// </summary>
                    /// <param name="api" type="Object">
                    ///     An object containing all the api relevent information to
                    ///     allow validation of the given targets properties.
                    /// </param>
                    
                    if (!api || typeof api !== "string") {
                        throw new TypeError("Invalid API method.");
                    }

                    if (!googleApi[api]) {
                        throw new ReferenceError("Specified API call unknown.");
                    }

                    var args = methods.createArguments.call(this, googleApi[api]);

                    if (!debug) {
                        var gaq = window._gaq;

                        if (gaq) {
                            
                            // Set the context for our deferred callback.
                            var that = this;
                            
                            // Push the data.
                            $.when(gaq.push(args)).done(
                                function () {
                                    // Redirect the location - delayed so that any other page functionality has time to run.

                                    setTimeout(function () {
                                        var href = that.attr("href");

                                        if (href && href.indexOf("#") !== 0) {
                                            window.location = href;
                                        }

                                    }, 100);
                                }
                            );


                        } else {
                            throw new ReferenceError("Google Analaytics _gaq is not defined");
                        }
                    } else {

                        if (window.console && window.console.log) {

                            // Push the data.
                            console.log("Pushing Google analytics data.");
                            console.log(args);
                        }
                    }
                }
            },
            body = document.body,
            selector = this.selector;


        if (eventType.toLowerCase() === "load") {

            methods.trackEvent.call($(this), apiName);

        }
        else {

            // Bind any standard events.
            $(body).on(eventType, selector, function (event) {

                event.preventDefault();
                methods.trackEvent.call($(this), apiName);

            });
        }

        // jQuery return to allow chaining.
        return $(this);

    };

} (jQuery));