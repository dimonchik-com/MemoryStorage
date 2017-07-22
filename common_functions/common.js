function get_constant(name) {
    var constant={
        time_reaction:5,
        time_reps:50,
        minimum_elements_for_training:3
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

function get_cutegory_by_id(id,user_data_clone) {
    if(user_data_clone.category.length) {
        for (var i in user_data_clone.category) {
            if(user_data_clone.category[i].config.id==id) {
                return link_category=user_data_clone.category[i];
            }

            if(user_data_clone.category[i].hasOwnProperty("child")) {
                if (user_data_clone.category[i].child.length) {
                    for (var i_two in user_data_clone.category[i].child) {
                        if (user_data_clone.category[i].child[i_two].config.id == user_data_clone.current_category) {
                            return link_category = user_data_clone.category[i].child[i_two];
                        }
                    }
                }
            }

        }
    }
}