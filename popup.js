/* ===================================================
 *  jquery-sortable.js v0.9.13
 *  http://johnny.github.com/jquery-sortable/
 * ===================================================
 *  Copyright (c) 2012 Jonas von Andrian
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *  * The name of the author may not be used to endorse or promote products
 *    derived from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 *  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 *  DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 *  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 *  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 *  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 *  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 *  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * ========================================================== */


!function ( $, window, pluginName, undefined){
    var containerDefaults = {
            // If true, items can be dragged from this container
            drag: true,
            // If true, items can be droped onto this container
            drop: true,
            // Exclude items from being draggable, if the
            // selector matches the item
            exclude: "",
            // If true, search for nested containers within an item.If you nest containers,
            // either the original selector with which you call the plugin must only match the top containers,
            // or you need to specify a group (see the bootstrap nav example)
            nested: true,
            // If true, the items are assumed to be arranged vertically
            vertical: true
        }, // end container defaults
        groupDefaults = {
            // This is executed after the placeholder has been moved.
            // $closestItemOrContainer contains the closest item, the placeholder
            // has been put at or the closest empty Container, the placeholder has
            // been appended to.
            afterMove: function ($placeholder, container, $closestItemOrContainer) {
            },
            // The exact css path between the container and its items, e.g. "> tbody"
            containerPath: "",
            // The css selector of the containers
            containerSelector: "ol, ul",
            // Distance the mouse has to travel to start dragging
            distance: 0,
            // Time in milliseconds after mousedown until dragging should start.
            // This option can be used to prevent unwanted drags when clicking on an element.
            delay: 0,
            // The css selector of the drag handle
            handle: "",
            // The exact css path between the item and its subcontainers.
            // It should only match the immediate items of a container.
            // No item of a subcontainer should be matched. E.g. for ol>div>li the itemPath is "> div"
            itemPath: "",
            // The css selector of the items
            itemSelector: "li",
            // The class given to "body" while an item is being dragged
            bodyClass: "dragging",
            // The class giving to an item while being dragged
            draggedClass: "dragged",
            // Check if the dragged item may be inside the container.
            // Use with care, since the search for a valid container entails a depth first search
            // and may be quite expensive.
            isValidTarget: function ($item, container) {
                return true
            },
            // Executed before onDrop if placeholder is detached.
            // This happens if pullPlaceholder is set to false and the drop occurs outside a container.
            onCancel: function ($item, container, _super, event) {
            },
            // Executed at the beginning of a mouse move event.
            // The Placeholder has not been moved yet.
            onDrag: function ($item, position, _super, event) {
                $item.css(position)
            },
            // Called after the drag has been started,
            // that is the mouse button is being held down and
            // the mouse is moving.
            // The container is the closest initialized container.
            // Therefore it might not be the container, that actually contains the item.
            onDragStart: function ($item, container, _super, event) {
                $item.css({
                    height: $item.outerHeight(),
                    width: $item.outerWidth()
                })
                $item.addClass(container.group.options.draggedClass)
                $("body").addClass(container.group.options.bodyClass)
            },
            // Called when the mouse button is being released
            onDrop: function ($item, container, _super, event) {
                $item.removeClass(container.group.options.draggedClass).removeAttr("style")
                $("body").removeClass(container.group.options.bodyClass)
            },
            // Called on mousedown. If falsy value is returned, the dragging will not start.
            // Ignore if element clicked is input, select or textarea
            onMousedown: function ($item, _super, event) {
                if (!event.target.nodeName.match(/^(input|select|textarea)$/i)) {
                    event.preventDefault()
                    return true
                }
            },
            // The class of the placeholder (must match placeholder option markup)
            placeholderClass: "placeholder",
            // Template for the placeholder. Can be any valid jQuery input
            // e.g. a string, a DOM element.
            // The placeholder must have the class "placeholder"
            placeholder: '<li class="placeholder"></li>',
            // If true, the position of the placeholder is calculated on every mousemove.
            // If false, it is only calculated when the mouse is above a container.
            pullPlaceholder: true,
            // Specifies serialization of the container group.
            // The pair $parent/$children is either container/items or item/subcontainers.
            serialize: function ($parent, $children, parentIsContainer) {
                var result = $.extend({}, $parent.data())

                if(parentIsContainer)
                    return [$children]
                else if ($children[0]){
                    result.children = $children
                }

                delete result.subContainers
                delete result.sortable

                return result
            },
            // Set tolerance while dragging. Positive values decrease sensitivity,
            // negative values increase it.
            tolerance: 0
        }, // end group defaults
        containerGroups = {},
        groupCounter = 0,
        emptyBox = {
            left: 0,
            top: 0,
            bottom: 0,
            right:0
        },
        eventNames = {
            start: "touchstart.sortable mousedown.sortable",
            drop: "touchend.sortable touchcancel.sortable mouseup.sortable",
            drag: "touchmove.sortable mousemove.sortable",
            scroll: "scroll.sortable"
        },
        subContainerKey = "subContainers"

    /*
     * a is Array [left, right, top, bottom]
     * b is array [left, top]
     */
    function d(a,b) {
        var x = Math.max(0, a[0] - b[0], b[0] - a[1]),
            y = Math.max(0, a[2] - b[1], b[1] - a[3])
        return x+y;
    }

    function setDimensions(array, dimensions, tolerance, useOffset) {
        var i = array.length,
            offsetMethod = useOffset ? "offset" : "position"
        tolerance = tolerance || 0

        while(i--){
            var el = array[i].el ? array[i].el : $(array[i]),
                // use fitting method
                pos = el[offsetMethod]()
            pos.left += parseInt(el.css('margin-left'), 10)
            pos.top += parseInt(el.css('margin-top'),10)
            dimensions[i] = [
                pos.left - tolerance,
                pos.left + el.outerWidth() + tolerance,
                pos.top - tolerance,
                pos.top + el.outerHeight() + tolerance
            ]
        }
    }

    function getRelativePosition(pointer, element) {
        var offset = element.offset()
        return {
            left: pointer.left - offset.left,
            top: pointer.top - offset.top
        }
    }

    function sortByDistanceDesc(dimensions, pointer, lastPointer) {
        pointer = [pointer.left, pointer.top]
        lastPointer = lastPointer && [lastPointer.left, lastPointer.top]

        var dim,
            i = dimensions.length,
            distances = []

        while(i--){
            dim = dimensions[i]
            distances[i] = [i,d(dim,pointer), lastPointer && d(dim, lastPointer)]
        }
        distances = distances.sort(function  (a,b) {
            return b[1] - a[1] || b[2] - a[2] || b[0] - a[0]
        })

        // last entry is the closest
        return distances
    }

    function ContainerGroup(options) {
        this.options = $.extend({}, groupDefaults, options)
        this.containers = []

        if(!this.options.rootGroup){
            this.scrollProxy = $.proxy(this.scroll, this)
            this.dragProxy = $.proxy(this.drag, this)
            this.dropProxy = $.proxy(this.drop, this)
            this.placeholder = $(this.options.placeholder)

            if(!options.isValidTarget)
                this.options.isValidTarget = undefined
        }
    }

    ContainerGroup.get = function  (options) {
        if(!containerGroups[options.group]) {
            if(options.group === undefined)
                options.group = groupCounter ++

            containerGroups[options.group] = new ContainerGroup(options)
        }

        return containerGroups[options.group]
    }

    ContainerGroup.prototype = {
        dragInit: function  (e, itemContainer) {
            this.$document = $(itemContainer.el[0].ownerDocument)

            // get item to drag
            var closestItem = $(e.target).closest(this.options.itemSelector);
            // using the length of this item, prevents the plugin from being started if there is no handle being clicked on.
            // this may also be helpful in instantiating multidrag.
            if (closestItem.length) {
                this.item = closestItem;
                this.itemContainer = itemContainer;
                if (this.item.is(this.options.exclude) || !this.options.onMousedown(this.item, groupDefaults.onMousedown, e)) {
                    return;
                }
                this.setPointer(e);
                this.toggleListeners('on');
                this.setupDelayTimer();
                this.dragInitDone = true;
            }
        },
        drag: function  (e) {
            if(!this.dragging){
                if(!this.distanceMet(e) || !this.delayMet)
                    return

                this.options.onDragStart(this.item, this.itemContainer, groupDefaults.onDragStart, e)
                this.item.before(this.placeholder)
                this.dragging = true
            }

            this.setPointer(e)
            // place item under the cursor
            this.options.onDrag(this.item,
                getRelativePosition(this.pointer, this.item.offsetParent()),
                groupDefaults.onDrag,
                e)

            var p = this.getPointer(e),
                box = this.sameResultBox,
                t = this.options.tolerance

            if(!box || box.top - t > p.top || box.bottom + t < p.top || box.left - t > p.left || box.right + t < p.left)
                if(!this.searchValidTarget()){
                    this.placeholder.detach()
                    this.lastAppendedItem = undefined
                }
        },
        drop: function  (e) {
            this.toggleListeners('off')

            this.dragInitDone = false

            if(this.dragging){
                // processing Drop, check if placeholder is detached
                if(this.placeholder.closest("html")[0]){
                    this.placeholder.before(this.item).detach()
                } else {
                    this.options.onCancel(this.item, this.itemContainer, groupDefaults.onCancel, e)
                }
                this.options.onDrop(this.item, this.getContainer(this.item), groupDefaults.onDrop, e)

                // cleanup
                this.clearDimensions()
                this.clearOffsetParent()
                this.lastAppendedItem = this.sameResultBox = undefined
                this.dragging = false
            }
        },
        searchValidTarget: function  (pointer, lastPointer) {
            if(!pointer){
                pointer = this.relativePointer || this.pointer
                lastPointer = this.lastRelativePointer || this.lastPointer
            }

            var distances = sortByDistanceDesc(this.getContainerDimensions(),
                pointer,
                lastPointer),
                i = distances.length

            while(i--){
                var index = distances[i][0],
                    distance = distances[i][1]

                if(!distance || this.options.pullPlaceholder){
                    var container = this.containers[index]
                    if(!container.disabled){
                        if(!this.$getOffsetParent()){
                            var offsetParent = container.getItemOffsetParent()
                            pointer = getRelativePosition(pointer, offsetParent)
                            lastPointer = getRelativePosition(lastPointer, offsetParent)
                        }
                        if(container.searchValidTarget(pointer, lastPointer))
                            return true
                    }
                }
            }
            if(this.sameResultBox)
                this.sameResultBox = undefined
        },
        movePlaceholder: function  (container, item, method, sameResultBox) {
            var lastAppendedItem = this.lastAppendedItem
            if(!sameResultBox && lastAppendedItem && lastAppendedItem[0] === item[0])
                return;

            item[method](this.placeholder)
            this.lastAppendedItem = item
            this.sameResultBox = sameResultBox
            this.options.afterMove(this.placeholder, container, item)
        },
        getContainerDimensions: function  () {
            if(!this.containerDimensions)
                setDimensions(this.containers, this.containerDimensions = [], this.options.tolerance, !this.$getOffsetParent())
            return this.containerDimensions
        },
        getContainer: function  (element) {
            return element.closest(this.options.containerSelector).data(pluginName)
        },
        $getOffsetParent: function  () {
            if(this.offsetParent === undefined){
                var i = this.containers.length - 1,
                    offsetParent = this.containers[i].getItemOffsetParent()

                if(!this.options.rootGroup){
                    while(i--){
                        if(offsetParent[0] != this.containers[i].getItemOffsetParent()[0]){
                            // If every container has the same offset parent,
                            // use position() which is relative to this parent,
                            // otherwise use offset()
                            // compare #setDimensions
                            offsetParent = false
                            break;
                        }
                    }
                }

                this.offsetParent = offsetParent
            }
            return this.offsetParent
        },
        setPointer: function (e) {
            var pointer = this.getPointer(e)

            if(this.$getOffsetParent()){
                var relativePointer = getRelativePosition(pointer, this.$getOffsetParent())
                this.lastRelativePointer = this.relativePointer
                this.relativePointer = relativePointer
            }

            this.lastPointer = this.pointer
            this.pointer = pointer
        },
        distanceMet: function (e) {
            var currentPointer = this.getPointer(e)
            return (Math.max(
                Math.abs(this.pointer.left - currentPointer.left),
                Math.abs(this.pointer.top - currentPointer.top)
            ) >= this.options.distance)
        },
        getPointer: function(e) {
            var o = e.originalEvent || e.originalEvent.touches && e.originalEvent.touches[0]
            return {
                left: e.pageX || o.pageX,
                top: e.pageY || o.pageY
            }
        },
        setupDelayTimer: function () {
            var that = this
            this.delayMet = !this.options.delay

            // init delay timer if needed
            if (!this.delayMet) {
                clearTimeout(this._mouseDelayTimer);
                this._mouseDelayTimer = setTimeout(function() {
                    that.delayMet = true
                }, this.options.delay)
            }
        },
        scroll: function  (e) {
            this.clearDimensions()
            this.clearOffsetParent() // TODO is this needed?
        },
        toggleListeners: function (method) {
            var that = this,
                events = ['drag','drop','scroll']

            $.each(events,function  (i,event) {
                that.$document[method](eventNames[event], that[event + 'Proxy'])
            })
        },
        clearOffsetParent: function () {
            this.offsetParent = undefined
        },
        // Recursively clear container and item dimensions
        clearDimensions: function  () {
            this.traverse(function(object){
                object._clearDimensions()
            })
        },
        traverse: function(callback) {
            callback(this)
            var i = this.containers.length
            while(i--){
                this.containers[i].traverse(callback)
            }
        },
        _clearDimensions: function(){
            this.containerDimensions = undefined
        },
        _destroy: function () {
            containerGroups[this.options.group] = undefined
        }
    }

    function Container(element, options) {
        this.el = element
        this.options = $.extend( {}, containerDefaults, options)

        this.group = ContainerGroup.get(this.options)
        this.rootGroup = this.options.rootGroup || this.group
        this.handle = this.rootGroup.options.handle || this.rootGroup.options.itemSelector

        var itemPath = this.rootGroup.options.itemPath
        this.target = itemPath ? this.el.find(itemPath) : this.el

        this.target.on(eventNames.start, this.handle, $.proxy(this.dragInit, this))

        if(this.options.drop)
            this.group.containers.push(this)
    }

    Container.prototype = {
        dragInit: function  (e) {
            var rootGroup = this.rootGroup

            if( !this.disabled &&
                !rootGroup.dragInitDone &&
                this.options.drag &&
                this.isValidDrag(e)) {
                rootGroup.dragInit(e, this)
            }
        },
        isValidDrag: function(e) {
            return e.which == 1 ||
                e.type == "touchstart" && e.originalEvent.touches.length == 1
        },
        searchValidTarget: function  (pointer, lastPointer) {
            var distances = sortByDistanceDesc(this.getItemDimensions(),
                pointer,
                lastPointer),
                i = distances.length,
                rootGroup = this.rootGroup,
                validTarget = !rootGroup.options.isValidTarget ||
                    rootGroup.options.isValidTarget(rootGroup.item, this)

            if(!i && validTarget){
                rootGroup.movePlaceholder(this, this.target, "append")
                return true
            } else
                while(i--){
                    var index = distances[i][0],
                        distance = distances[i][1]
                    if(!distance && this.hasChildGroup(index)){
                        var found = this.getContainerGroup(index).searchValidTarget(pointer, lastPointer)
                        if(found)
                            return true
                    }
                    else if(validTarget){
                        this.movePlaceholder(index, pointer)
                        return true
                    }
                }
        },
        movePlaceholder: function  (index, pointer) {
            var item = $(this.items[index]),
                dim = this.itemDimensions[index],
                method = "after",
                width = item.outerWidth(),
                height = item.outerHeight(),
                offset = item.offset(),
                sameResultBox = {
                    left: offset.left,
                    right: offset.left + width,
                    top: offset.top,
                    bottom: offset.top + height
                }
            if(this.options.vertical){
                var yCenter = (dim[2] + dim[3]) / 2,
                    inUpperHalf = pointer.top <= yCenter
                if(inUpperHalf){
                    method = "before"
                    sameResultBox.bottom -= height / 2
                } else
                    sameResultBox.top += height / 2
            } else {
                var xCenter = (dim[0] + dim[1]) / 2,
                    inLeftHalf = pointer.left <= xCenter
                if(inLeftHalf){
                    method = "before"
                    sameResultBox.right -= width / 2
                } else
                    sameResultBox.left += width / 2
            }
            if(this.hasChildGroup(index))
                sameResultBox = emptyBox
            this.rootGroup.movePlaceholder(this, item, method, sameResultBox)
        },
        getItemDimensions: function  () {
            if(!this.itemDimensions){
                this.items = this.$getChildren(this.el, "item").filter(
                    ":not(." + this.group.options.placeholderClass + ", ." + this.group.options.draggedClass + ")"
                ).get()
                setDimensions(this.items, this.itemDimensions = [], this.options.tolerance)
            }
            return this.itemDimensions
        },
        getItemOffsetParent: function  () {
            var offsetParent,
                el = this.el
            // Since el might be empty we have to check el itself and
            // can not do something like el.children().first().offsetParent()
            if(el.css("position") === "relative" || el.css("position") === "absolute"  || el.css("position") === "fixed")
                offsetParent = el
            else
                offsetParent = el.offsetParent()
            return offsetParent
        },
        hasChildGroup: function (index) {
            return this.options.nested && this.getContainerGroup(index)
        },
        getContainerGroup: function  (index) {
            var childGroup = $.data(this.items[index], subContainerKey)
            if( childGroup === undefined){
                var childContainers = this.$getChildren(this.items[index], "container")
                childGroup = false

                if(childContainers[0]){
                    var options = $.extend({}, this.options, {
                        rootGroup: this.rootGroup,
                        group: groupCounter ++
                    })
                    childGroup = childContainers[pluginName](options).data(pluginName).group
                }
                $.data(this.items[index], subContainerKey, childGroup)
            }
            return childGroup
        },
        $getChildren: function (parent, type) {
            var options = this.rootGroup.options,
                path = options[type + "Path"],
                selector = options[type + "Selector"]

            parent = $(parent)
            if(path)
                parent = parent.find(path)

            return parent.children(selector)
        },
        _serialize: function (parent, isContainer) {
            var that = this,
                childType = isContainer ? "item" : "container",

                children = this.$getChildren(parent, childType).not(this.options.exclude).map(function () {
                    return that._serialize($(this), !isContainer)
                }).get()

            return this.rootGroup.options.serialize(parent, children, isContainer)
        },
        traverse: function(callback) {
            $.each(this.items || [], function(item){
                var group = $.data(this, subContainerKey)
                if(group)
                    group.traverse(callback)
            });

            callback(this)
        },
        _clearDimensions: function  () {
            this.itemDimensions = undefined
        },
        _destroy: function() {
            var that = this;

            this.target.off(eventNames.start, this.handle);
            this.el.removeData(pluginName)

            if(this.options.drop)
                this.group.containers = $.grep(this.group.containers, function(val){
                    return val != that
                })

            $.each(this.items || [], function(){
                $.removeData(this, subContainerKey)
            })
        }
    }

    var API = {
        enable: function() {
            this.traverse(function(object){
                object.disabled = false
            })
        },
        disable: function (){
            this.traverse(function(object){
                object.disabled = true
            })
        },
        serialize: function () {
            return this._serialize(this.el, true)
        },
        refresh: function() {
            this.traverse(function(object){
                object._clearDimensions()
            })
        },
        destroy: function () {
            this.traverse(function(object){
                object._destroy();
            })
        }
    }

    $.extend(Container.prototype, API)

    /**
     * jQuery API
     *
     * Parameters are
     *   either options on init
     *   or a method name followed by arguments to pass to the method
     */
    $.fn[pluginName] = function(methodOrOptions) {
        var args = Array.prototype.slice.call(arguments, 1)

        return this.map(function(){
            var $t = $(this),
                object = $t.data(pluginName)

            if(object && API[methodOrOptions])
                return API[methodOrOptions].apply(object, args) || this
            else if(!object && (methodOrOptions === undefined ||
                typeof methodOrOptions === "object"))
                $t.data(pluginName, new Container($t, methodOrOptions))

            return this
        });
    };

}(jQuery, window, 'sortable');
var config = {
    apiKey: "AIzaSyCMRbZuQQmVc610R3GGb3pGqF81VAyIL7E",
    databaseURL: "https://englishtip-516bc.firebaseio.com",
    storageBucket: "englishtip-516bc.appspot.com"
};
firebase.initializeApp(config);

var user_data={
    current_category:"1",
    category:[
        {
            vocabulary:[
                {
                    id:1,
                    en:"Hallo",
                    ru:"Hello",
                    time_reaction:[],
                    iteration:0,
                    total_iteration:0,
                    status_learn:0
                },
                {
                    id:2,
                    en:"Привет",
                    ru:"Hello",
                    time_reaction:[],
                    iteration:0,
                    total_iteration:0,
                    status_learn:0
                },
                {
                    id:3,
                    en:"嗨",
                    ru:"Hello",
                    time_reaction:[],
                    iteration:0,
                    total_iteration:0,
                    status_learn:0
                }
            ],
            config:{
                range_area:{
                    start:0,
                    end:0
                },
                dir_sorting:0,
                id:1,
                parent_id:0,
                name:"Vocabulary",
                dir_translation:"source_translation",
                template_word:"id_word",
                time_break:get_constant("time_break"),
                number_repeat:get_constant("number_repeat"),
                position_template: "bottom_right",
                time_last_traning:new Date().getTime(),
                delay_traning:get_constant("delay_traning"),
                delay_traning_second:get_constant("delay_traning_second"),
                way_traning:get_constant("way_traning"),
                training_mode:1,
                stop_next_word:0
            },
            child:[

            ]
        },
        {
            vocabulary:[

            ],
            config:{
                range_area:{
                    start:0,
                    end:0
                },
                dir_sorting:0,
                id:2,
                parent_id:0,
                name:"Other",
                dir_translation:"source_translation",
                template_word:"id_word",
                time_break:get_constant("time_break"),
                number_repeat:get_constant("number_repeat"),
                position_template: "bottom_right",
                delay_traning:get_constant("delay_traning"),
                delay_traning_second:get_constant("delay_traning_second"),
                way_traning:get_constant("way_traning"),
                training_mode:1,
                stop_next_word:0
            },
            child:[

            ]
        }
    ],
    top_id:3,
    time_last_activity:new Date().getTime(),
    update_content_script:1,
    status_enable:1
};

var current_open_page={};

$( document ).ready(function() {
    get_storage(function () {
            start_play();

            setTimeout(function () {
                if (user_data.save_data_when_open) {
                    $(".monday_06_01").click();
                }
            }, 1000);
    });

    chrome.tabs.getSelected(null, function (tab) {
        var url = new URL(tab.url);
        current_open_page.url=new String(url.href).toString();
        current_open_page.domain=new String(url.hostname).toString();
    });

    firebase.auth().onAuthStateChanged(function(user) {
        if (user && !user_data.first_load && !$(".p4:visible").length) {
            var userId = firebase.auth().currentUser.uid;
            firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
                var result=snapshot.val();
                if(result) {
                    user_data = result;
                } else { // creating a new user
                    user_data.displayName=user.displayName;
                    user_data.email=user.email;
                    save_data_in_firebase(function () {
                        
                    });
                }
                user_data.first_load=1;
                set_storage(function () {
                    build_menu();
                    start_play();
                },1,1);
            });
        }
    });

	$("body").on("click",".wednesday_05_04_01 button", function () {
	    $(".p4").hide();
	    $(".wednesday_05_04_02").show();
        startSignIn();
    });

	// Log out
    var start_log_out=1;
	$("body").on("click",".p5 .p6", function () {
        if(start_log_out) {
            start_log_out=0;
            synchronize_data(function () {
                firebase.auth().signOut();

                var firebase_key=["english_tip"];
                for (var key in localStorage){
                    if(key.match(/firebase:/)){
                        firebase_key.push(key);
                    }
                }

                chrome.storage.local.remove(firebase_key, function () {

                });

                delete user_data.first_load;

                $(".wednesday_05_04_01,.wednesday_05_04_01 button").show();
                $(".p0,.p5,.wednesday_05_04_02").hide();
                $(".p0").removeClass("wednesday_05_04_03");
                start_log_out=1;
            }, true);
        }
	});

	// add new task
	$("body").on("click",".p10", function () {
		$(".all_task .build_task_table").bootstrapTable('destroy');
		$(".p11").show();

        var result=get_current_category();

        var max_id;
        if(result.vocabulary.length) {
            max_id = result.vocabulary.reduce(function (old_val, new_val) {
                if (parseInt(new_val.id) > parseInt(old_val.id)) {
                    return new_val;
                } else {
                    return old_val;
                }
            });
            max_id=parseInt(max_id.id)+1;
        } else {
            max_id=0;
        }

        $("input[name=new_id]").val(max_id);
	});

	// click learn word
    $("body").on("click",".tuesday_07_11_01", function () {
        $(this).removeClass("tuesday_07_11_01").text("");
        $(this).addClass("sunday_07_09 glyphicon glyphicon-ok").attr({"title":"Learned"});

        var id=$(this).parent().parent().find(".thursday_27_04_1").attr("id");
        var word=get_word_from_vacabulary(id);

        if(word) {
            word.status_learn=1;
        }
        set_storage(()=>{},1,2);
    });

    $("body").on("click",".sunday_07_09", function () {
        $(this).removeAttr("class").text("-");
        $(this).addClass("tuesday_07_11_01").attr({"title":"Not learned"});

        var id=$(this).parent().parent().find(".thursday_27_04_1").attr("id");
        var word=get_word_from_vacabulary(id);

        if(word) {
            word.status_learn=0;
        }
        set_storage(()=>{},1,3);
    });

	// create new task
	$("body").on("click",".p13", function () {
		get_storage(function (result) {
            var new_id=$("input[name=new_id]").val();
            var new_word=$("input[name=new_word]").val();
            var new_translate=$("input[name=new_translate]").val();

            var error=0;
            for(var i in result.vocabulary) {
                if(result.vocabulary[i].id==new_id) {
                    $(".friday_04_07_0").show();
                    error=1;
                }

                if(result.vocabulary[i].en==new_word) {
                    $(".friday_04_07_1").show();
                    error=1;
                }
            }

            if(error) return false;

            result.vocabulary.push({
                id:new_id,
				en:new_word,
				ru:new_translate,
                time_reaction:[],
                iteration:0,
				total_iteration:0,
                status_learn:0
			});

            user_data.time_last_activity=new Date().getTime();
            user_data.save_data_when_open=1;

            // update count
            var range=get_range();
            if(result.config.range_area.end==(range.max_index-1)){
                result.config.range_area.end=range.max_index;
            }
            set_storage(function(){
				$(".p12 input").val("");
                $(".p11").hide();
                $(".p8 a[data-name="+user_data.current_category+"]").click();
			},1,4);
		});
		return false;
	});

	// build different task by action
	$(".p8").on("click", "a",function () {
		var name_tab=$(this).attr("data-name");
        user_data.current_category=name_tab

        if(name_tab==2) {
            $("a[data-name=2]").next().find("li:first a").click();
            return false;
        }
        set_storage(function () {
            $(".config,.new_category,.all_task,.p11").hide();
            $(".all_task .bootstraptable").bootstrapTable('destroy');

            $(".all_task").show();
            all_task();
        },1,5);
	});

    $("body").on("click", ".saturday_04_02",function () {
        $(".all_task").hide();
        $(".config").show();
        config_tab();
    });

	// event check or uncheck
	$(".build_task_table").on('check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table', function () {
		var check_element=$(".build_task_table input[type='checkbox']:checked").length;
		if(check_element) {
			$(".p19").show();
		} else {
			$(".p19").hide();
		}
	});

	// remove several task
	$("body").on("click",".p19", function () {
		var list_remove_task=[];
		$(".build_task_table input[type='checkbox']:checked, .build_task_table input[type='checkbox']:checked").each(function(){
			var name_domain=$(this).closest("tr").find(".thursday_27_04_1").attr("id");
			list_remove_task.push(name_domain);
		});

		bootbox.confirm("Are you sure you want to delete the tasks?", function(action) {
			if(action) {
				get_storage(function (result) {
				    var i=result.vocabulary.length;
                    while(i--) {
                        if(list_remove_task.indexOf(result.vocabulary[i].id)!=-1 || !result.vocabulary[i].id) {
                            result.vocabulary.splice(i,1);
                        }
                    }

                    user_data.time_last_activity=new Date().getTime();
                    user_data.save_data_when_open=1;
                    set_storage(function () {
                        $(".all_task .build_task_table").bootstrapTable("load", result.vocabulary);
                        $(".p19").hide();
                    },1,6);
				});
			}
		});
	});

	// add event click if miss checkbox
	$("body").on('click', ".table td", function (event) {
		var elem=event.target.nodeName;
		if(elem!="INPUT") {
			$(this).find("input").trigger('click');
		}
	});

    var current_click_class, current_click_element;
    $("body").on("click",".wednesday_05_04_05,.wednesday_05_04_07,.thursday_27_04_1", function () {
        current_click_class=$(this).hasClass("wednesday_05_04_05")?"en":"ru";
        current_click_element=this;

        var offset_left=130, wednesday="";
        if($(this).hasClass("thursday_27_04_1")) {
            offset_left=70;
            wednesday=" wednesday_03_05_1 ";
            current_click_class="id";
        }

        $(".wednesday_05_04_06").remove();
        var ofsset=$(this).parent().offset();
        var w=$(this).parent().width();
        var word=$(this).text();
        if(word=="-") {
            word="";
        }
        var id=$(this).attr("id");
        word=escapeHtml(word);
        var html=get_tooltip(id, word, (ofsset.top-75), (ofsset.left+w/2-offset_left), wednesday);
        $(".p0").append(html);
        return false;
    });

    $("body").on("click",".editable-cancel", function () {
        $(".wednesday_05_04_06").hide();
        return false;
    });

    $("body").on("click",".editable-submit", function () {
        var id=$(".wednesday_05_04_09").attr("id");
        var val=$(".wednesday_05_04_09").val();

        var copy_val=(val)?val:"-";
        $(current_click_element).text(copy_val);

        update_word_in_vacabulary(id, val, current_click_class, false);

        $(".wednesday_05_04_06").remove();
        return false;
    });

    // Change form data
    $('.friday_04_14_02').on('click', function (e) {
        var result=get_current_category();

        var dir_sorting=$('.wednesday_05_04_08 select[name=dir_sorting]').val();
        result.config.dir_sorting=dir_sorting;

        var dir_translation=$('.wednesday_05_04_08 select[name=dir_translation]').val();
        result.config.dir_translation=dir_translation;

        var template_word=$('.wednesday_05_04_08 select[name=template_word]').val();
        result.config.template_word=template_word;

        var position_template=$('.wednesday_05_04_08 select[name=position_template]').val();
        result.config.position_template=position_template;

        var time_break=parseInt($('.wednesday_05_04_08 input[name=time_break]').val());
        time_break=time_break?time_break:30;
        result.config.time_break=time_break;

        var time_reaction=parseInt($('.wednesday_05_04_08 input[name=time_reaction]').val());
        time_reaction=time_reaction?time_reaction:5;
        result.config.time_reaction=time_reaction;

        var time_reps=parseInt($('.wednesday_05_04_08 input[name=time_reps]').val());
        time_reps=time_reps?time_reps:50;
        result.config.time_reps=time_reps;

        var train_learned_words=parseInt($('.wednesday_05_04_08 input[name=train_learned_words]').val());
        result.config.train_learned_words=train_learned_words;

        var delay_traning=parseInt($('.wednesday_05_04_08 select[name=delay_traning]').val());
        result.config.delay_traning=delay_traning;

        var delay_traning_second=$('.wednesday_05_04_08 input[name=delay_traning_second]').val();
        delay_traning_second=delay_traning_second?delay_traning_second:get_constant("delay_traning_second");
        result.config.delay_traning_second=delay_traning_second;

        var way_traning=parseInt($('.wednesday_05_04_08 select[name=way_traning]').val());
        result.config.way_traning=way_traning;

        var training_mode=parseInt($('.wednesday_05_04_08 select[name=training_mode]').val());
        result.config.training_mode=training_mode;

        // Gear disabled on this site
        if(training_mode==2 && current_open_page.domain.match(/\./)) {
            if(result.config.training_mode_domain){
                result.config.training_mode_domain.push(current_open_page.domain);
            } else {
                result.config.training_mode_domain=[current_open_page.domain];
            }
        } else if(training_mode==1 && result.config.training_mode_domain) {
            var index=result.config.training_mode_domain.indexOf(current_open_page.domain);
            result.config.training_mode_domain.splice(index,1);
        }

        if($(this).is("input[name=time_break]")) {
            set_new_time();
        }

        var stop_next_word=parseInt($('.wednesday_05_04_08 select[name=stop_next_word]').val());
        result.config.stop_next_word=stop_next_word;

        var number_repeat=$('.wednesday_05_04_08 input[name=number_repeat]').val();
        number_repeat=number_repeat?number_repeat:"all";
        result.config.number_repeat=number_repeat;

        $(".saturday_04_04").click();
        set_storage(()=>{},1,7);
    });

    $('body').on('click', ".saturday_04_04,.tuersday_04_13_2,.p14", function (e) {
        $(".p8 a[data-name="+user_data.current_category+"]").click();
        return false;
    });

    $('body').on('click', ".saturday_04_01", function (e) {
        $(".all_task, .config").hide();
        $(".tuersday_04_13_1").text("Save");
        $(".new_category").show();
        $(".tuersday_04_13_0").val("");

        update_category_in_select_list();

        return false;
    });

    $('body').on('click', ".tuersday_04_13_1", function (e) {
        var name_category=$(".new_category .tuersday_04_13_0").val();
        var parent_category=$(".new_category .tuersday_04_13_4").val();

        if(!name_category.length) {
            $(".tuersday_04_13_0").parent().addClass("has-error");
        } else {
            var parent_category=get_parent_categoty(parent_category);
            var blank_category={
                vocabulary:[],
                child:[],
                config:{
                    range_area:{start:0,end:0},
                    dir_sorting:0,
                    id:user_data.top_id++,
                    parent_id:parent_category.id_categoty,
                    name:name_category,
                    position_template: "bottom_right",
                    time_break: 30,
                    number_repeat: 10,
                    dir_translation: "source_translation",
                    template_word: "id_word",
                    time_reaction: 5,
                    time_reps:50,
                    train_learned_words:0,
                    time_last_traning:new Date().getTime()
                }
            };

            parent_category.category.splice(parent_category.category.length-1,0, blank_category);

            user_data.current_category=blank_category.config.id;
            set_storage(function () {
                build_menu();
                $(".p8 a[data-name="+user_data.current_category+"]").click();
                $(".tuersday_04_13_0").val("");
            },1,8);
        }
        return false;
    });

    $('body').on('click', ".mondey_04_17_0", function (e) {
        bootbox.confirm("Are you sure you want to delete this category? This action cannot be undone! <br>When you delete a category, all sub categories will be deleted also!<br>Be careful in your desires!", function(action) {
            if(action) {
                delete_current_category();
            }
        });
    });

    $("body").on('click','.thursday_11_05_01 a', function () {
       var val=$(this).attr("value");
       user_data.status_enable=val;

       $(".thursday_11_05_02").removeClass("thursday_11_05_02");
       $(this).addClass("thursday_11_05_02");
       set_storage(()=>{},1,9);
       return false;
    });

    $("body").on("click",".thirsday_08_06_02", function () {
        bootbox.confirm("Are you sure you want to reschedule the lesson?", function(action) {
            if(action) {
                set_new_time_all();
            }
        });
       return false;
    });

    $("body").on("click",".friday_09_06_01", function () {
        bootbox.confirm("Are you sure you want to delete all reaction history?", function(action) {
            if(action) {
                var result = get_current_category();
                result.vocabulary.map(function (element) {
                    element.time_reaction = [];
                });
                set_storage(()=>{},1,10);
            }
        });
        return false;
    });

    $(document).on("mouseenter", ".p8 li", function(e) {
        $(this).find('ul').show();
    });

    $(document).on("mouseleave", ".p8 li", function(e) {
        $(this).find('ul').hide();
    });

    $("ol.nav").sortable({
        group: 'nav',
        nested: false,
        vertical: false,
        exclude: 'li ul li',
        onDrop: function ($item, container, _super) {
            container.el.removeClass("active");
            resort_menu();
            _super($item, container);
        }
    });

    $("body").on("click",".monday_06_01", function () {
        synchronize_data(function () {
            
        });
    });

    $("body").on("click",".wednesday_7_12_01",function () {
        var result=get_current_category();
        if(result.vocabulary.length<get_constant("minimum_elements_for_training")) {
            bootbox.alert("Minimum number of words to start training 3");
        } else {
            set_new_time_all(1);
        }
        return false;
    });

    function synchronize_data(callback, force_overwriting=false) {
        $(".monday_06_01").addClass("gly-spin");
        if (firebase.auth().currentUser) {
            var userId = firebase.auth().currentUser.uid;
            firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
                var data_from_firebase=snapshot.val();

                if(!data_from_firebase) {
                    callback();
                }

                if(user_data.time_last_activity>data_from_firebase.time_last_activity) { // if local data more recent then server data
                    save_data_in_firebase(function (res) {
                        $(".monday_06_01").removeClass("gly-spin");
                        callback();
                    });
                } else { // if on server data more recent than local
                    data_from_firebase.current_category = user_data.current_category;

                    var data_from_firebase_categoty=get_cutegory_by_id(data_from_firebase.current_category,data_from_firebase.category);
                    var data_from_user_data=get_cutegory_by_id(user_data.current_category,user_data.category);

                    console.log(data_from_firebase);
                    console.log(user_data);

                    data_from_firebase_categoty.config.time_last_traning=data_from_user_data.config.time_last_traning;

                    console.log(data_from_firebase_categoty.config.time_last_traning);
                    console.log(data_from_user_data.config.time_last_traning);

                    user_data = data_from_firebase;
                    set_storage(function () {
                        if(force_overwriting) {
                            save_data_in_firebase(function (res) {
                                $(".monday_06_01").removeClass("gly-spin");
                                callback();
                            });
                        } else {
                            $(".monday_06_01").removeClass("gly-spin");
                            callback();
                        }
                    },1,11);
                }
            });
        } else { // if not data on server
            firebase.database().ref('users/' + user.uid).set(user_data, function (result) {

            });
        }
    }

    function get_tooltip(id, word, top, left, wednesday) {
        var html='<div class="popover editable-container editable-popup fade top in wednesday_05_04_06" style="top:'+top+'px; left:'+left+'px; display: block;"><div class="arrow '+wednesday+'"></div><h3 class="popover-title">Enter username</h3><div class="popover-content"> <div><div class="editableform-loading" style="display: none;"></div><form class="form-inline editableform" style=""><div class="control-group form-group"><div><div class="editable-input" style="position: relative;"><input type="text" class="form-control input-sm wednesday_05_04_09" value="'+word+'" style="padding-right: 24px;" id="'+id+'"></div><div class="editable-buttons"><button type="submit" class="btn btn-primary btn-sm editable-submit"><i class="glyphicon glyphicon-ok"></i></button><button type="button" class="btn btn-default btn-sm editable-cancel"><i class="glyphicon glyphicon-remove"></i></button></div></div><div class="editable-error-block help-block" style="display: none;"></div></div></form></div></div></div>';
        return html;
    }
});

function set_new_time() {
    var result=get_current_category();
    result.config.time_last_traning=new Date().getTime()+(result.config.time_break*60*1000);
    set_storage(()=>{},1,12);
}

function set_new_time_all(time_now) {
    var result=get_all_category();

    for(var i in result) {
        var time=result[i].config.time_break?result[i].config.time_break:30;
        if(time_now) {
            result[i].config.time_last_traning=new Date().getTime();
        } else {
            result[i].config.time_last_traning=new Date().getTime()+(time*60*1000);
        }
    }

    $(".p8 a[data-name=" + user_data.current_category + "]").click();
    set_storage(()=>{},1,13);
}

function resort_menu() {
    var sort_list=[];

    $(".p8 li:not(li ul li)").each(function () {
       var id=$(this).find("a").attr("data-name");
       sort_list.push(id);
    });

    if(sort_list.length) {
        get_storage(function () {
            var new_array=[];

            for(var i in sort_list) {
                for(var i_two in user_data.category) {
                    if(sort_list[i]==user_data.category[i_two].config.id) {
                        var slice=user_data.category.splice(i_two, 1);
                        new_array.push(slice[0]);
                        break;
                    }
                }
            }

            user_data.category=new_array;
            set_storage(()=>{},1,14);
        });
    }
}

function startAuth(interactive) {
    chrome.identity.getAuthToken({interactive: !!interactive}, function(token) {
        if (chrome.runtime.lastError && !interactive) {
            console.log('It was not possible to get a token programmatically.');
        } else if(chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
        } else if (token) {
            // Authrorize Firebase with the OAuth Access Token.
            var credential = firebase.auth.GoogleAuthProvider.credential(null, token);
            firebase.auth().signInWithCredential(credential).catch(function(error) {
                // The OAuth token might have been invalidated. Lets' remove it from cache.
                if (error.code === 'auth/invalid-credential') {
                    chrome.identity.removeCachedAuthToken({token: token}, function() {
                        startAuth(interactive);
                    });
                }
            });
        } else {
            console.error('The OAuth Token was null');
        }
    });
}

function startSignIn() {
    if (!firebase.auth().currentUser) {
        startAuth(true);
    }
}

/**
 * Function for get session id
 * @param callback
 */
function get_storage(callback) {
	chrome.storage.local.get('english_tip', function (result) {
        console.log(result.english_tip);

        if(result && result.hasOwnProperty("english_tip") && result.english_tip) {
            user_data=result.english_tip;
            build_menu();
            return callback(get_current_category());
        } else {
            $(".wednesday_05_04_02").hide();
            $(".wednesday_05_04_01,.p4").show();
        }
	});
}

function set_storage(callback, update_content_script=1, id_callback){
    var current_category=get_current_category();
    if(current_category) {
        current_category.vocabulary.sort(function (a, b) {
            return b.id - a.id;
        });
    }

    user_data.update_content_script=update_content_script;

    // console.log("update date "+new Date());
    chrome.storage.local.set({'english_tip': user_data}, function(status) {
        if(callback) {
            return callback();
        }
    });
}

function save_data_in_firebase(callback) {
    var userId = firebase.auth().currentUser.uid;
    var copy_user_data=JSON.parse(JSON.stringify(user_data));
    delete copy_user_data.first_load;

    delete user_data.save_data_when_open;
    delete copy_user_data.save_data_when_open;

    copy_user_data.time_last_activity=new Date().getTime();
    firebase.database().ref('users/' + userId).set(copy_user_data, function(result) {
        if(callback) {
            set_storage(function(){
                callback(result);
            },1,15);
        }
    });
}

function update_word_in_vacabulary(id, val, current_click_class, rebut=true) {
    var word=get_word_from_vacabulary(id);

    if(word) {
        word[current_click_class]=val;
    }

    if(rebut) {
        $(".all_task .build_task_table").bootstrapTable("load", result.vocabulary);
    }
    set_storage(()=>{},1,16);
}

function get_word_from_vacabulary(id) {
    var result=get_current_category();
    for(var i in result.vocabulary) {
        if(result.vocabulary[i].id==id) {
            return result.vocabulary[i];
            break;
        }
    }
}

function all_task() {
    $(".friday_04_07_0,.friday_04_07_1").hide();
    get_storage(function (result) {

            var next_lesson=new Date(parseInt(result.config.time_last_traning));
            var date_next_lesson=/*moment(next_lesson).format('DD-MM-YYYY')+*/" at "+moment(next_lesson).format('HH:mm:ss');

            var pageSize=(result.config.pageSize)?result.config.pageSize:25;
            var pageNumber=(result.config.pageNumber)?result.config.pageNumber:1;
            $(".all_task .build_task_table").bootstrapTable({
            	data:(result)?result.vocabulary:"",
                columns: [
                    {
                        field: 'state',
                        checkbox: true,
                        title: '',
                        align: 'center'
                    },
                    {
                        field: 'id',
                        title: 'ID',
                        sortable: true,
                        align: 'center',
                        editable: true,
                        formatter:function (data) {
                            return '<a href="#" class="thursday_27_04_1" id="'+data+'">'+data+'</a>';
                        }
                    },
                    {
                        field: 'en',
                        title: 'Source',
                        align: 'center',
                        editable: true,
                        formatter :function (data, all_data) {
                            if(data.replace(/\s/g,'')==""){
                                data="-";
                            }
                            return '<a href="#" class="wednesday_05_04_05" id="'+all_data.id+'">'+data+'</a>';
                        }
                    },
					{
						field: 'ru',
						title: 'Value',
						align: 'center',
						formatter :function (data, all_data) {
						    if(data.replace(/\s/g,'')==""){
                                data="-";
                            }
                            return '<a href="#" class="wednesday_05_04_07" id="'+all_data.id+'">'+data+'</a>';
						}
					},
					{
						field: 'reaction',
						title: 'Time',
						align: 'center',
						formatter :function (data, all_data) {
						    if(all_data.time_reaction!=undefined) {
                                data=time_reaction_get_everage_value(all_data.time_reaction);
                            }
                            return data;
						}
					},
                    {
                        field: 'total_iteration',
                        title: 'Count',
                        align: 'center',
                        formatter :function (data) {
                            return data;
                        }
                    },
                    {
                        field: 'status_learn',
                        title: 'Status',
                        align: 'center',
                        formatter :function (data) {
                            if(data) {
                                data="<span class='sunday_07_09 glyphicon glyphicon-ok'></span>";
                            } else {
                                data="<span class='tuesday_07_11_01'>-</span>";
                            }
                            return data;
                        }
                    }
                ],
                search: true,
                pagination: true,
                pageSize: pageSize,
                showRefresh: true,
                pageList: [10, 25, 50, 'All'],
                pageNumber:pageNumber,
                cookieIdTable: "all_task",
				height: 529,
                onPageChange:function(){
                    result.config.pageSize=this.pageSize;
                    result.config.pageNumber=this.pageNumber;
                    set_storage(function () {

                    }, 0, 17);
                },
                customScroll:function(top){

                    clearTimeout($.data(this, 'scrollTimer'));
                    $.data(this, 'scrollTimer', setTimeout(function() {
                        result.config.scrollTop=top;
                        set_storage(function () {

                        }, 0, 18);
                    }, 500));

                }
            });

           if(result.config.scrollTop>0) {
               $(".fixed-table-body").scrollTop(result.config.scrollTop);
           }

           $(".fixed-table-toolbar").append('<button type="button" class="btn btn-default p10">Create word</button> <button type="button" class="btn btn-danger p19">Delete</button>');
           $(".fixed-table-toolbar").append('<button type="button" class="btn btn-default saturday_04_02">Config</button>');
           $(".fixed-table-toolbar").append('<div class="thirsday_08_06_01">The next lesson start '+date_next_lesson+' <a href="#" class="thirsday_08_06_02">skip and reset</a>, <a href="#" class="wednesday_7_12_01">train now</a></div>');
    });
}

function get_range() {
    var result=get_current_category();
    if(!result.vocabulary.length) return {min_index:0,max_index:0};

    var min_index=result.vocabulary.reduce(function(old_val, new_val){
        if(parseInt(new_val.id)>parseInt(old_val.id)) {
            return old_val;
        } else {
            return new_val;
        }
    });
    min_index=min_index.id;

    var max_index=result.vocabulary.reduce(function(old_val, new_val){
        if(parseInt(new_val.id)>parseInt(old_val.id)) {
            return new_val;
        } else {
            return old_val;
        }
    });
    max_index=max_index.id;

    return {min_index:parseInt(min_index),max_index:parseInt(max_index)};
}

// Set default values
function config_tab() {
    var range=get_range();
    var result=get_current_category();

    update_category_in_select_list();

    var slider=$("#range_03").data("ionRangeSlider");
    if(slider) {
        slider.destroy();
    }

    $('.wednesday_05_04_08 select[name=dir_sorting]').val(result.config.dir_sorting);
    $('.wednesday_05_04_08 select[name=dir_translation]').val(result.config.dir_translation);
    $('.wednesday_05_04_08 select[name=template_word]').val(result.config.template_word);
    $('.wednesday_05_04_08 select[name=position_template]').val(result.config.position_template);
    $('.wednesday_05_04_08 input[name=time_break]').val(result.config.time_break);
    $('.wednesday_05_04_08 input[name=number_repeat]').val(result.config.number_repeat);
    $('.wednesday_05_04_08 select[name=delay_traning]').val(result.config.hasOwnProperty("delay_traning")?result.config.delay_traning:get_constant("delay_traning"));
    $('.wednesday_05_04_08 input[name=delay_traning_second]').val(result.config.delay_traning_second);
    $('.wednesday_05_04_08 select[name=way_traning]').val(result.config.hasOwnProperty("way_traning")?result.config.way_traning:get_constant("way_traning"));
    $('.wednesday_05_04_08 input[name=name_category]').val(result.config.name);

    if (parseInt(result.config.training_mode) == 0) {
        $('.wednesday_05_04_08 select[name=training_mode]').val(result.config.training_mode);
    } else if(result.config.training_mode_domain && result.config.training_mode_domain.indexOf(current_open_page.domain) != -1) {
        $('.wednesday_05_04_08 select[name=training_mode]').val(2);
    }

    $('.wednesday_05_04_08 select[name=stop_next_word]').val(result.config.hasOwnProperty("stop_next_word")?result.config.stop_next_word:0);


    $("input[name=delay_traning_second]").attr("placeholder",get_constant("delay_traning_second"));

    $(".thursday_27_04_0").html("Last time activite: "+moment(new Date(result.config.time)).format('DD-MM-YYYY HH:mm:ss'));

    $("#range_03").ionRangeSlider({
        type: "double",
        grid: true,
        min: range.min_index,
        max: range.max_index,
        from: (result.config.range_area.start && result.config.range_area.start<=result.config.range_area.end) ? result.config.range_area.start : range.min_index,
        to: (result.config.range_area.end && result.config.range_area.end>=result.config.range_area.start) ? result.config.range_area.end : null,
        prefix: "",
        onFinish:function(a){
            result.config.range_area.start=a.from;
            result.config.range_area.end=a.to;
            set_storage(()=>{},1,19);
        }
    });
}

function get_parent_categoty(parent_category) {
    var ref;
    if(parent_category==0) {
        if(!user_data.hasOwnProperty("category")) {
            user_data.category=[];
        }
        ref={category:user_data.category, id_categoty:0};
    } else {
        for(var i in user_data.category) {
            if(parent_category==user_data.category[i].config.id) {
                if(!user_data.category[i].hasOwnProperty("child")) {
                    user_data.category[i].child=[];
                }
                ref={category:user_data.category[i].child, id_categoty:user_data.category[i].config.id};
            }
        }
    }

    return ref;
}

function build_menu() {
    $(".p8").html("");

    for(var i in user_data.category) {
        var active=(user_data.category[i].config.id==user_data.current_category) ? "active": ""

        if(user_data.category[i].config.id==2 && user_data.category[i].hasOwnProperty('child')) {
            if(!user_data.category[i].child.length) continue;
        } else if(user_data.category[i].config.id==2) {
            continue;
        }

        $(".p8").append('<li class="'+active+'"><a href="#" data-name="'+user_data.category[i].config.id+'">'+user_data.category[i].config.name+'</a></li>');

        if(user_data.category[i].hasOwnProperty("child")) {
            if (user_data.category[i].child.length) {
                $(".p8 li a[data-name='" + user_data.category[i].config.id + "']").attr({"data-toggle": "dropdown"});
                $(".p8 li a[data-name='" + user_data.category[i].config.id + "']").append('<span class="caret"></span>');
                $(".p8 li a[data-name='" + user_data.category[i].config.id + "']").parent().append('<ul class="dropdown-menu"></ul>');
                for (var i_two in user_data.category[i].child) {
                    var active = (user_data.category[i].child[i_two].config.id == user_data.current_category) ? "active" : "";
                    if (active) {
                        $(".p8 li a[data-name='" + user_data.category[i].config.id + "']").parent().addClass("active");
                    }
                    $(".p8 li a[data-name='" + user_data.category[i].config.id + "']").parent().find("ul").append('<li class="' + active + '"><a href="#" data-name="' + user_data.category[i].child[i_two].config.id + '">' + user_data.category[i].child[i_two].config.name + '</a></li>');
                }
            }
        }
    }
}

function delete_current_category() {
    for(var i in user_data.category) {

        if(user_data.category[i].config.id==user_data.current_category) {
            user_data.category.splice(i,1);
            break;
        }

        if(user_data.category[i].hasOwnProperty("child")) {
            if (user_data.category[i].child.length) {
                for (var i_two in user_data.category[i].child) {
                    if (user_data.category[i].child[i_two].config.id == user_data.current_category) {
                        user_data.category[i].child.splice(i_two, 1);
                    }
                }
            }
        }

    }

    user_data.current_category=user_data.category[0].config.id;
    set_storage(function() {
        $(".p8 a[data-name="+user_data.current_category+"]").click();
    },1,20);
}

function update_category_in_select_list() {
    $(".tuersday_04_13_5").remove();

    for(var i=0; i<user_data.category.length; i++) {
        $(".tuersday_04_13_4").append('<option class="tuersday_04_13_5" value="' + user_data.category[i].config.id + '">' + user_data.category[i].config.name + '</option>');
    }
}

function start_play() {
    $(".wednesday_05_04_01").hide();
    $(".p0,.p5").show();
    $(".p0").addClass("wednesday_05_04_03");
    $(".p8 a[data-name="+user_data.current_category+"]").click();
    $(".thursday_11_05_01 a[value="+user_data.status_enable+"]").click();
}

function reloadWindow(win)
{
    chrome.tabs.getAllInWindow(win.id, (tabs) => {
        for (var i in tabs) {
            var tab = tabs[i]
            chrome.tabs.update(tab.id, {url: tab.url, selected: tab.selected}, null)
        }
    });
};

/**
 * Reload all tabs in all windows one by one.
 */
function reloadAllWindows()
{
    chrome.windows.getAll({}, function(windows) {
        for (var i in windows)
            reloadWindow(windows[i])
    }.bind(this));
}

chrome.windows.getCurrent(function(win)
{
    chrome.tabs.getAllInWindow(win.id, function(tabs)
    {
        var find_memory_traning=0;
        for (var i in tabs) {
            var tab = tabs[i];
            chrome.tabs.sendMessage(tab.id, {are_you_smart: 1}, function(response) {
                if(response) {
                    if(response.hasOwnProperty("yes_i_smart")) {
                        find_memory_traning=1;
                    }
                }
            });
        }

        setTimeout(function () {
            if(!find_memory_traning) {
                //reloadAllWindows();
            }
        }, 1000);

    });
});
function get_constant(name) {
    var constant={
        time_reaction:5,
        time_reps:50,
        minimum_elements_for_training:3,
        delay_traning_second:"30-60",
        delay_traning:0,
        way_traning:0,
        time_break:30,
        number_repeat:10
    };
    return constant[name];
}

function time_reaction_get_everage_value(time_reaction) {
    if (time_reaction.length) {
        var sum = time_reaction.reduce(function (a, b) {
            return a + parseFloat(b.time);
        }, 0);
        data = sum / time_reaction.length;
        data = data.toFixed(2);
        return data;
    }
}

function get_all_category() {
    var category=[];
    if(user_data.category.length) {
        for(var i in user_data.category) {
            category.push(user_data.category[i]);

            if(user_data.category[i].hasOwnProperty("child")) {
                if (user_data.category[i].child.length) {
                    for (var i_two in user_data.category[i].child) {
                        category.push(user_data.category[i].child[i_two]);
                    }
                }
            }
        }
    }
    return category;
}

function getFormattedDate(date) {
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var min = date.getMinutes();
    var sec = date.getSeconds();

    month = (month < 10 ? "0" : "") + month;
    day = (day < 10 ? "0" : "") + day;
    hour = (hour < 10 ? "0" : "") + hour;
    min = (min < 10 ? "0" : "") + min;
    sec = (sec < 10 ? "0" : "") + sec;

    var str = date.getFullYear() + "-" + month + "-" + day + " " +  hour + ":" + min + ":" + sec;

    return str;
}

function get_current_category() {
    var link_category;
    if(user_data.category.length) {
        for(var i in user_data.category) {
            if(user_data.category[i].config.id==user_data.current_category) {
                link_category=user_data.category[i];
                break;
            }

            if(user_data.category[i].hasOwnProperty("child")) {
                if (user_data.category[i].child.length) {
                    for (var i_two in user_data.category[i].child) {
                        if (user_data.category[i].child[i_two].config.id == user_data.current_category) {
                            link_category = user_data.category[i].child[i_two];
                            break;
                        }
                    }
                }
            }

        }
    }

    if(!link_category.hasOwnProperty('vocabulary')) {
        link_category.vocabulary=[];
    }

    return link_category;
}

function get_cutegory_by_id(id,category) {
    if(category.length) {
        for (var i in category) {
            if(category[i].config.id==id) {
                return link_category=category[i];
            }

            if(category[i].hasOwnProperty("child")) {
                if (category[i].child.length) {
                    for (var i_two in category[i].child) {
                        if (category[i].child[i_two].config.id == current_category) {
                            return link_category = category[i].child[i_two];
                        }
                    }
                }
            }

        }
    }
}

function getRandomInt(min, max) {
    max=parseInt(max);
    min=parseInt(min);
    return Math.floor(min + Math.random() * (max + 1 - min));
}

function escapeHtml(text) {
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };

    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function eventFire(el, etype){
    var evObj = document.createEvent('Events');
    evObj.initEvent(etype, true, false);
    el.dispatchEvent(evObj);
}