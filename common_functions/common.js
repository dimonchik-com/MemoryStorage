"use strict";

function get_constant(name) {
    var constant={
        time_reaction:5,
        time_reps:50,
        minimum_elements_for_training:3,
        delay_traning_second:"30-240",
        delay_traning:1,
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
        var data = sum / time_reaction.length;
        data = data.toFixed(2);
        return data;
    }
}

function get_all_category() {
    var category=[];
    if(user_data.category.length) {
        for(var i in user_data.category) {
            category.push(user_data.category[i]);

            if(user_data.category[i].hasOwnProperty("category")) {
                if (user_data.category[i].category.length) {
                    for (var i_two in user_data.category[i].category) {
                        category.push(user_data.category[i].category[i_two]);
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

function get_current_category(from="backend") {

    var id=parseInt((from=="front" && user_data.current_select_category)?user_data.current_select_category:user_data.current_category);

    var link_category=get_category_by_id(id,user_data.category);

    if(!link_category.hasOwnProperty('vocabulary')) {
        link_category.vocabulary=[];
    }

    return link_category;
}

function get_category_by_id(id,category) {
    if(category.length) {
        if(id==0) return {category:category};
        for (var i in category) {
            if(category[i].config.id==id) {
                return category[i];
            }

            if(category[i].hasOwnProperty("category")) {
                if (category[i].category.length) {
                    var link_category=get_category_by_id(id,category[i].category);
                    if(link_category) {
                        return link_category;
                    }
                }
            }
        }
    }
    return 0;
}

function get_all_categories(category, list_categories) {
    for(var i in category) {
        list_categories.push(category[i]);
        if(category[i].hasOwnProperty("category")) {
            if (category[i].category.length) {
                get_all_categories(category[i].category,list_categories);
            }
        }
    }
    return list_categories;
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

function isEmptyObject(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return JSON.stringify(obj) === JSON.stringify({});
}