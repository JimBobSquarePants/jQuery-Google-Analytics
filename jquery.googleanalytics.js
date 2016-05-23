/*!
* jQuery Google Analytics Plugin v2.0.7
* https://github.com/JimBobSquarePants/jQuery-Google-Analytics-Plugin

* Copyright 2013, James South
* Released under the Apache 2.0 license
* http://www.apache.org/licenses/LICENSE-2.0
*
*/
/*It is recommended that this file is minified before serving.*/

/*global jQuery, console */
/*jshint forin:true, noarg:true, noempty:true, eqnull:true, eqeqeq:true, bitwise:false, strict:true, curly:true, browser:true, maxerr:50 */

(function ($, window) {

    "use strict";

    // Custom ga selector.
    $.extend($.expr[":"], {

        ga: function (a) {
            var attr = a.attributes,
                len = attr.length;

            while (len--) {
                if (attr[len].name.indexOf("data-ga-") !== -1) {
                    return true;
                }
            }

            return false;
        }
    });

    $.googleAnalyticsApi = {
        /// <summary>
        ///     A representation of available methods provided by Google analytics.
        /// </summary>

        trackEvent: {
            /// <summary>
            ///     The trackEvent object defines all the necessary parameters
            ///     to send event tracking analytics data to Google.
            ///     https://developers.google.com/analytics/devguides/collection/gajs/eventTrackerGuide
            /// </summary>

            event: {
                value: "_trackEvent",
                validation: "isString",
                type: "string"
            },
            category: {
                value: null,
                validation: "isString",
                type: "string"
            },
            action: {
                value: null,
                validation: "isString",
                type: "string"
            },
            label: {
                value: null,
                validation: "optString",
                type: "string"
            },
            value: {
                value: null,
                validation: "optInt",
                type: "integer"
            },
            nonInteraction: {
                value: null,
                validation: "optBool",
                type: "boolean"
            }
        },
        trackPageview: {
            /// <summary>
            ///     The trackEvent object defines all the necessary parameters
            ///     to send page tracking analytics data to Google.
            ///     https://developers.google.com/analytics/devguides/collection/gajs/methods/gaJSApiBasicConfiguration#_gat.GA_Tracker_._trackPageview
            /// </summary>

            event: {
                value: "_trackPageview",
                validation: "isString",
                type: "string"
            },
            url: {
                value: null,
                validation: "optString",
                type: "string"
            }
        }
    };

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

            // Don't test the type here just test for emptiness.
            if (obj) {
                empty = /^\s*$/.test(obj);
            }

            // If empty === true then something is wrong and we should return false.
            return !(empty);

        },

        optString: function (obj) {
            /// <summary>
            ///     Checks to see if a given object is a valid non-empty string.
            ///     Since the object is optional if it is equal to null then validation
            ///     will return true.
            /// </summary>
            /// <param name="obj" type="String">
            ///     The object to check against.
            /// </param>
            /// <returns type="Boolean">True if the string is valid, otherwise false.</returns>

            if (obj == null) {
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
            ///     Since the object is optional if it is equal to null then validation
            ///     will return true.
            /// </summary>
            /// <param name="obj" type="Integer">
            ///     The object to check against.
            /// </param>
            /// <returns type="Boolean">True if the number is valid, otherwise false.</returns>

            if (obj == null) {
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
            ///     Since the object is optional if it is equal to null then validation
            ///     will return true.
            /// </summary>
            /// <param name="obj" type="Float">
            ///     The object to check against.
            /// </param>
            /// <returns type="Boolean">True if the number is valid, otherwise false.</returns>

            if (obj == null) {
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
            ///     Since the object is optional if it is equal to null then validation
            ///     will return true.
            /// </summary>
            /// <param name="obj" type="Boolean">
            ///     The object to check against.
            /// </param>
            /// <returns type="Boolean">True if the boolean is valid, otherwise false.</returns>

            if (obj == null) {
                return true;
            }

            return validation.isBool(obj);
        }
    },

    methods = {
        /// <summary>
        ///     A series of private methods.
        /// </summary>
        validate: function (param, name) {
            /// <summary>
            ///     Validates the "data-ga" attributes assigned to the current DOM object.
            ///     Throws an error if any of the attributes fail validation.
            /// </summary>
            /// <param name="param" type="Object">
            ///     An object containing all the necessary information to allow
            ///     validation of the given targets properties.
            /// </param>
            /// <param name="name" type="String">
            ///     A string containing the name of the parameter to validate.
            /// </param>
            /// <returns type="Object">The value from the DOM.</returns>

            var $element = this.$element,
                data = $element.data("ga-" + name.toLowerCase()),
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
            return data;
        },
        createArgs: function () {
            /// <summary>
            ///     Creates the parameter array to pass to the Google gaq/_gaq.push() method.
            /// </summary>
            /// <param name="api" type="Object">
            ///     An object containing all the api relevant information to
            ///     allow validation of the given targets properties.
            /// </param>
            /// <returns type="Array">The array of necessary parameters.</returns>

            var self = this,
                event = this.event,
                params = [];

            // Loop through and build the parameters.
            $.each(event, function (key, val) {

                var value;

                if (key === "event") {
                    // We don't want to check for the event property in the DOM.
                    value = val.value;

                } else {

                    // Validate and return the correct value from the DOM.
                    value = methods.validate.call(self, val, key);
                    if (typeof value === "object") {
                        value = JSON.stringify(value);
                    }
                }

                params.push(value);
            });

            // Trim the last null value to reduce data overheads.
            while (params[params.length - 1] == null) {
                params.pop();
            }

            return params;
        }
    },

    GoogleAnalytics = function (element, options) {

        this.$element = $(element);
        this.options = $.extend({}, $.fn.googleAnalytics.defaults, options);
    };

    GoogleAnalytics.prototype = {
        constructor: GoogleAnalytics,
        trackEvent: function () {

            var trackedEvent = $.Event("tracked.ga");

            this.args = methods.createArgs.call(this);

            if (this.options.debug) {

                if (window.console && window.console.log) {

                    // Push the data.
                    console.log("Pushing Google analytics data.", this.args);
                    this.$element.trigger(trackedEvent);
                }
            }
            else {

                var gaq = window._gaq || window.gaq;

                if (gaq) {

                    // Set the context for our deferred callback.
                    var self = this;

                    // Push the data.
                    $.when(gaq.push(this.args)).done(
                        function () {

                            self.$element.trigger(trackedEvent);

                            // Redirect the location - delayed so that any other page functionality has time to run.
                            setTimeout(function () {
                                var href = self.$element.attr("href"),
                                    target = self.$element.attr("target");

                                if (href && href.indexOf("#") !== 0) {

                                    // IE8 doesn't pass the referrer to the next page
                                    // using window.location. We create a hidden link to 
                                    // counter that. Fixes issue #2
                                    // http://stackoverflow.com/a/7917528/427899
                                    var a = document.createElement("a");

                                    if (!a.click) {
                                        // Handle external window requests.
                                        if (target && target === "_blank") {
                                            window.open(href, target);
                                        }
                                        else {
                                            // Old FF and Secure links.
                                            window.location = href;
                                        }
                                        return;
                                    }

                                    a.setAttribute("href", href);
                                    if (target && target === "_blank") {
                                        a.setAttribute("target", target);
                                    }
                                    a.style.display = "none";
                                    document.body.appendChild(a);
                                    a.click();
                                }

                            }, 100);
                        }
                    );


                } else {
                    throw new ReferenceError("Google Analytics _gaq/gaq object is not defined.");
                }
            }
        }

    };

    // Plugin definition 
    $.fn.googleAnalytics = function (options) {
        return this.each(function () {

            var $this = $(this),
                data = $this.data("ga"),
                opts = typeof options === "object" ? options : null;

            if (!data) {
                // Check the data and assign if not present.
                $this.data("ga", (data = new GoogleAnalytics(this, opts)));
            }

            var handler = data.options.handler.toLowerCase(),
                // Check for the event attr here as it might be other than the default.
                event = data.$element.attr("data-ga-event");

            // Overwrite if necessary.
            $.extend(data.options, { event: event });

            // Build the data as we have nothing there.
            // First assign the event.
            data.event = $.googleAnalyticsApi[data.options.event];

            // Then bind the handler.
            if (handler === "load") {

                data.trackEvent();

            } else {

                data.$element.on(handler + ".ga", function (e) {

                    e.preventDefault();
                    data.trackEvent();

                });
            }
        });
    };

    // Define the defaults.
    $.fn.googleAnalytics.defaults = {
        event: "trackEvent",
        handler: "click",
        debug: false
    };

    // Set the public constructor.
    $.fn.googleAnalytics.Constructor = GoogleAnalytics;

    // Let's get this started.
    $(document).on("ready.ga", function () {

        // Bind using the custom selector.
        $(":ga").each(function () {
            $(this).googleAnalytics();
        });
    });

}(jQuery, window));