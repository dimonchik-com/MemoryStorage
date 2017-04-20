var config = {
    apiKey: "AIzaSyCMRbZuQQmVc610R3GGb3pGqF81VAyIL7E",
    databaseURL: "https://englishtip-516bc.firebaseio.com",
    storageBucket: "englishtip-516bc.appspot.com"
};
firebase.initializeApp(config);

var user_data={ current_category:1, category:[{vocabulary:[], config:{range_area:{start:0,end:0},sorting:0, id:1, parent_id:0, name:"Vocabulary"}, child:[]}, {vocabulary:[], config:{range_area:{start:0,end:0},sorting:0, id:2,  parent_id:0, name:"Other"}, child:[]}], top_id:3 };

$( document ).ready(function() {

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {

            var userId = firebase.auth().currentUser.uid;
            firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
                if(snapshot.val()) {
                    user_data=snapshot.val();
                    get_storage(function () {
                        start_play();
                    });
                } else {
                    user_data.displayName=user.displayName;
                    user_data.email=user.email;
                    firebase.database().ref('users/' + user.uid).set(user_data, function (result) {
                        get_storage(function () {
                            start_play();
                        });
                    });
                }
            });

        } else {
			$(".wednesday_05_04_02").hide();
            $(".wednesday_05_04_01 button").show();
		}
    });

	$("body").on("click",".wednesday_05_04_01 button", function () {
        startSignIn();
    });

	// Log out
	$("body").on("click",".p5 .p6", function () {
        firebase.auth().signOut();

        $(".wednesday_05_04_01").show();
        $(".p0,.p5").hide();
        $(".p0").removeClass("wednesday_05_04_03");
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
				total_iteration:0
			});

            set_storage(function(){
				$(".p12 input").val("");
                $(".p11").hide();
                $(".p8 a[data-name="+user_data.current_category+"]").click();
			});
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
        });
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
			var name_domain=$(this).closest("tr").find(".p17").attr("id");
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
                    set_storage(function () {
                        $(".all_task .build_task_table").bootstrapTable("load", result.vocabulary);
                        $(".p19").hide();
                    });
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

    var current_click_class;
    $("body").on("click",".wednesday_05_04_05,.wednesday_05_04_07", function () {
        current_click_class=$(this).hasClass("wednesday_05_04_05")?"en":"ru";
        $(".wednesday_05_04_06").remove();
        var ofsset=$(this).parent().offset();
        var w=$(this).parent().width();
        var word=$(this).text();
        var id=$(this).attr("id");
        var html=get_tooltip(id, word,(ofsset.top-75), (ofsset.left+w/2-130));
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

        update_word_in_vacabulary(id, val, current_click_class);

        $(".wednesday_05_04_06").remove();
        return false;
    });

    $('.friday_04_07_2').on('change', function (e) {
        var result=get_current_category();
        var sorting=$(this).val();
        result.config.sorting=sorting;
        set_storage();
    });

    $('body').on('click', ".saturday_04_04,.tuersday_04_13_2,.p14", function (e) {
        $(".p8 a[data-name="+user_data.current_category+"]").click();
        return false;
    });

    $('body').on('click', ".saturday_04_01", function (e) {
        $(".all_task, .config, .mondey_04_17_0").hide();
        $(".tuersday_04_13_1").text("Save");
        $(".new_category").show();
        $(".tuersday_04_13_0").val("");

        update_category_in_select_list();

        return false;
    });

    $('body').on('click', ".tuersday_04_13_1", function (e) {
        var name_category=$(".tuersday_04_13_0").val();
        var parent_category=$(".tuersday_04_13_4").val();

        if(!name_category.length) {
            $(".tuersday_04_13_0").parent().addClass("has-error");
        } else {
            if($(".mondey_04_17_0").is(":visible")){
                var current_category=get_current_category();
                delete_current_category();
                current_category.config.parent_id=parent_category;
                current_category.config.name=name_category;

                if(current_category.config.parent_id==0) {
                    user_data.category.splice(user_data.category.length-1,0, current_category);
                } else {
                    var category=get_cutegory_by_id(current_category.config.parent_id);
                    category.child.splice(category.child.length-1,0, current_category);
                }
            } else {
                var parent_category=get_parent_categoty(parent_category);
                var blank_category={vocabulary:[], config:{range_area:{start:0,end:0},sorting:0, id:user_data.top_id++, parent_id:parent_category.id_categoty, name:name_category}, child:[]};

                parent_category.category.splice(parent_category.category.length-1,0, blank_category);

                user_data.current_category=user_data.top_id;
                set_storage(function () {
                    build_menu();
                    $(".p8 a[data-name="+(user_data.current_category-1)+"]").click();
                    $(".tuersday_04_13_0").val("");
                });
            }
        }
        return false;
    });

    $('body').on('click', ".friday_04_14_02", function (e) {
        update_category_in_select_list();

        $(".all_task, .config").hide();
        $(".new_category, .mondey_04_17_0").show();

        var current_category = get_current_category();

        $(".tuersday_04_13_4").val(current_category.config.parent_id);
        $(".tuersday_04_13_0").val(current_category.config.name);
        $(".tuersday_04_13_1").text("Save change");

        return false;
    });

    $('body').on('click', ".mondey_04_17_0", function (e) {
        bootbox.confirm("Are you sure you want to delete this category? This action cannot be undone! <br>When you delete a parent category, all sub categories will be deleted also!", function(action) {
            if(action) {
                delete_current_category();
            }
        });
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

    function get_tooltip(id, word, top, left) {
        var html='<div class="popover editable-container editable-popup fade top in wednesday_05_04_06" style="top:'+top+'px; left:'+left+'px; display: block;"><div class="arrow"></div><h3 class="popover-title">Enter username</h3><div class="popover-content"> <div><div class="editableform-loading" style="display: none;"></div><form class="form-inline editableform" style=""><div class="control-group form-group"><div><div class="editable-input" style="position: relative;"><input type="text" class="form-control input-sm wednesday_05_04_09" value="'+word+'" style="padding-right: 24px;" id="'+id+'"></div><div class="editable-buttons"><button type="submit" class="btn btn-primary btn-sm editable-submit"><i class="glyphicon glyphicon-ok"></i></button><button type="button" class="btn btn-default btn-sm editable-cancel"><i class="glyphicon glyphicon-remove"></i></button></div></div><div class="editable-error-block help-block" style="display: none;"></div></div></form></div></div></div>';
        return html;
    }

});

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
            set_storage();
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
        if(result.hasOwnProperty("english_tip")) {
            user_data = result.english_tip;
        }

        build_menu();

		return callback(get_current_category());
	});
}

function set_storage(callback){
    var current_category=get_current_category();
    if(current_category) {
        current_category.vocabulary.sort(function (a, b) {
            return b.id - a.id;
        });
    }

    //remove_strange_word_state();

    chrome.storage.local.set({'english_tip': user_data}, function() {
        if(callback) {
            return callback();
        }
    });
}

function update_word_in_vacabulary(id, val, current_click_class) {
    var result=get_current_category();

    for(var i in result.vocabulary) {
        if(result.vocabulary[i].id==id) {
            result.vocabulary[i][current_click_class]=val;
            break;
        }
    }
    $(".all_task .build_task_table").bootstrapTable("load", result.vocabulary);
    set_storage();
}

function all_task() {
    $(".friday_04_07_0,.friday_04_07_1").hide();
    get_storage(function (result) {

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
                        formatter:function (data) {
                            return "<div class='p17' id='"+data+"'>"+data+"</div>";
                        }
                    },
                    {
                        field: 'en',
                        title: 'Source word',
                        align: 'center',
                        editable: true,
                        formatter :function (data, all_data) {
                            return '<a href="#" class="wednesday_05_04_05" id="'+all_data.id+'">'+data+'</a>';
                        }
                    },
					{
						field: 'ru',
						title: 'Translation word',
						align: 'center',
						formatter :function (data, all_data) {
                            return '<a href="#" class="wednesday_05_04_07" id="'+all_data.id+'">'+data+'</a>';
						}
					},
					{
						field: 'reaction',
						title: 'Reaction',
						align: 'center',
						formatter :function (data) {
                            return data;
						}
					},
                    {
                        field: 'count_show_time',
                        title: 'Count show',
                        align: 'center',
                        formatter :function (data) {
                            return data;
                        }
                    }
                ],
                search: true,
                pagination: true,
                pageSize: 10,
                showRefresh: true,
                pageList: [10, 25, 50, 'All'],
                cookieIdTable: "all_task",
				height: 529
            });
            $(".fixed-table-toolbar").append('<button type="button" class="btn btn-default p10">Create</button> <button type="button" class="btn btn-danger p19">Delete</button>');
            $(".fixed-table-toolbar").append('<button type="button" class="btn btn-default saturday_04_02">Config panel</button>');

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

    return {min_index:min_index,max_index:max_index};
}

function config_tab() {
    var range=get_range();
    var result=get_current_category();

    var slider=$("#range_03").data("ionRangeSlider");
    if(slider) {
        slider.destroy();
    }

    $(".friday_04_07_2").val(result.config.sorting);

    $("#range_03").ionRangeSlider({
        type: "double",
        grid: true,
        min: range.min_index,
        max: range.max_index,
        from: result.config.range_area.start ? result.config.range_area.start : range.min_index,
        to: result.config.range_area.end ? result.config.range_area.end : null,
        prefix: "",
        onFinish:function(a){
            result.config.range_area.start=a.from;
            result.config.range_area.end=a.to;
            set_storage();
        }
    });
}

function get_parent_categoty(parent_category) {
    var ref;
    if(parent_category==0) {
        ref={category:user_data.category, id_categoty:0};
    } else {
        for(var i in user_data.category) {
            if(parent_category==user_data.category[i].config.id) {
                ref={category:user_data.category[i].child, id_categoty:user_data.category[i].config.id};
            }
        }
    }

    return ref;
}

function get_current_category() {
    var link_category;
    if(user_data.category.length) {
        for(var i in user_data.category) {
            if(user_data.category[i].config.id==user_data.current_category) {
                link_category=user_data.category[i];
                break;
            }
            if(user_data.category[i].child.length) {
                for(var i_two in user_data.category[i].child) {
                    if(user_data.category[i].child[i_two].config.id==user_data.current_category) {
                        link_category=user_data.category[i].child[i_two];
                        break;
                    }
                }
            }
        }
    }

    return link_category;
}

function get_cutegory_by_id(id) {
    if(user_data.category.length) {
        for (var i in user_data.category) {
            if(user_data.category[i].config.id==id) {
                return link_category=user_data.category[i];
            }
        }
    }
}

function build_menu() {
    $(".p8").html("");

    for(var i in user_data.category) {
        var active=(user_data.category[i].config.id==user_data.current_category) ? "active": ""

        if(user_data.category[i].config.id==2 && !user_data.category[i].child.length) {
            continue;
        }

        $(".p8").append('<li class="'+active+'"><a href="#" data-name="'+user_data.category[i].config.id+'">'+user_data.category[i].config.name+'</a></li>');

        if(user_data.category[i].child.length) {
            $(".p8 li a[data-name='"+user_data.category[i].config.id+"']").attr({"data-toggle":"dropdown"});
            $(".p8 li a[data-name='"+user_data.category[i].config.id+"']").append('<span class="caret"></span>');
            $(".p8 li a[data-name='"+user_data.category[i].config.id+"']").parent().append('<ul class="dropdown-menu"></ul>');
            for(var i_two in user_data.category[i].child) {
                var active=(user_data.category[i].child[i_two].config.id==user_data.current_category) ? "active": "";
                if(active) {
                    $(".p8 li a[data-name='"+user_data.category[i].config.id+"']").parent().addClass("active");
                }
                $(".p8 li a[data-name='"+user_data.category[i].config.id+"']").parent().find("ul").append('<li class="'+active+'"><a href="#" data-name="'+user_data.category[i].child[i_two].config.id+'">'+user_data.category[i].child[i_two].config.name+'</a></li>');
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

        if(user_data.category[i].child.length) {
            for(var i_two in user_data.category[i].child) {
                if(user_data.category[i].child[i_two].config.id==user_data.current_category) {
                    user_data.category[i].child.splice(i_two,1);
                }
            }
        }
    }

    user_data.current_category=user_data.category[0].config.id;

    set_storage(function() {
        $(".p8 a[data-name="+user_data.current_category+"]").click();
    });
}

function update_category_in_select_list() {
    $(".tuersday_04_13_5").remove();

    for(var i=user_data.category.length-1; i>=0; i--) {
        $(".tuersday_04_13_4 option:first").after('<option class="tuersday_04_13_5" value="' + user_data.category[i].config.id + '">' + user_data.category[i].config.name + '</option>');
    }
}

function start_play() {
    $(".wednesday_05_04_01").hide();
    $(".p0,.p5").show();
    $(".p0").addClass("wednesday_05_04_03");
    $(".p8 a[data-name="+user_data.current_category+"]").click();
}

// Функция для отправки сообщений
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
		//console.log(response.farewell);
	});
});

// Функция для получения сообщений
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		console.log(request.greeting);
		//sendResponse({farewell: "goodbye"});
	}
);