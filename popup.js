var config = {
    apiKey: "AIzaSyCMRbZuQQmVc610R3GGb3pGqF81VAyIL7E",
    databaseURL: "https://englishtip-516bc.firebaseio.com",
    storageBucket: "englishtip-516bc.appspot.com"
};
firebase.initializeApp(config);

var user_data={vocabulary:[],config:{range_area:{start:0,end:0},sorting:0}};


$( document ).ready(function() {

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            $(".wednesday_05_04_01").hide();
            $(".p0,.p5").show();
            $(".p0").addClass("wednesday_05_04_03");
            $(".p8 a:first").click();
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

		var max_id=user_data.vocabulary.reduce(function(old_val, new_val){
			if(new_val.id>old_val) {
				return new_val.id;
			} else {
				return old_val;
			}
		},0);

        $("input[name=new_id]").val(parseInt(max_id)+1);
	});

	// create new task
	$("body").on("click",".p13", function () {
		get_storage(function (result) {
            var new_id=$("input[name=new_id]").val();
            var new_word=$("input[name=new_word]").val();
            var new_translate=$("input[name=new_translate]").val();

            var error=0;
            for(var i in user_data.vocabulary) {
                if(user_data.vocabulary[i].id==new_id) {
                    $(".friday_04_07_0").show();
                    error=1;
                }

                if(user_data.vocabulary[i].en==new_word) {
                    $(".friday_04_07_1").show();
                    error=1;
                }
            }

            if(error) return false;

			user_data.vocabulary.push({
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
                $(".p8 a:first").click();
			});
		});
		return false;
	});

	// build different task by action
	$(".p8").on("click", "a",function () {
		var name_tab=$(this).attr("data-name");
		$(".p8 li").removeClass("active");
		$(this).parent().addClass("active");

		$(".config").hide();
		$("."+name_tab).show();
		$(".p9 .bootstraptable").bootstrapTable('destroy');


        switch (name_tab) {
            case "all_task":
                $(".p9").show();
                all_task();
                break;
            case "config":
                $(".p9").hide();
                config_tab();
                break;
        }
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
                    for(var i in result.vocabulary) {
                        if(list_remove_task.indexOf(result.vocabulary[i].id)!=-1 || !result.vocabulary[i].id) {
                            result.vocabulary.splice(i,1);
                        }
                    }
                    set_storage();
                    $(".all_task .build_task_table").bootstrapTable("load", user_data.vocabulary);
                    $(".p19").hide();
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

    // cancel new or update task
    $("body").on("click",".p14", function () {
        $(".p11").hide();
        $(".p8 a:first").click();
        return false;
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
        var sorting=$(this).val();
        user_data.config.sorting=sorting;
        set_storage();
    });

    function get_tooltip(id, word, top, left) {
        var html='<div class="popover editable-container editable-popup fade top in wednesday_05_04_06" style="top:'+top+'px; left:'+left+'px; display: block;"><div class="arrow"></div><h3 class="popover-title">Enter username</h3><div class="popover-content"> <div><div class="editableform-loading" style="display: none;"></div><form class="form-inline editableform" style=""><div class="control-group form-group"><div><div class="editable-input" style="position: relative;"><input type="text" class="form-control input-sm wednesday_05_04_09" value="'+word+'" style="padding-right: 24px;" id="'+id+'"></div><div class="editable-buttons"><button type="submit" class="btn btn-primary btn-sm editable-submit"><i class="glyphicon glyphicon-ok"></i></button><button type="button" class="btn btn-default btn-sm editable-cancel"><i class="glyphicon glyphicon-remove"></i></button></div></div><div class="editable-error-block help-block" style="display: none;"></div></div></form></div></div></div>';
        return html;
    }

});

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
		return callback(result.english_tip);
	});
}

function set_storage(callback){
    if(user_data) {
        user_data.vocabulary.sort(function (a, b) {
            return b.id - a.id;
        });
    }

    chrome.storage.local.set({'english_tip': user_data}, function() {
        if(callback) {
            return callback();
        }
    });
}

function update_word_in_vacabulary(id, val, current_click_class) {
    for(var i in user_data.vocabulary) {
        if(user_data.vocabulary[i].id==id) {
            user_data.vocabulary[i][current_click_class]=val;
            break;
        }
    }
    $(".all_task .build_task_table").bootstrapTable("load", user_data.vocabulary);
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
    });
}

function get_range() {
    var min_index=user_data.vocabulary.reduce(function(old_val, new_val){
        if(new_val.id>old_val.id) {
            return old_val;
        } else {
            return new_val;
        }
    });
    min_index=min_index.id;

    var max_index=user_data.vocabulary.reduce(function(old_val, new_val){
        if(new_val.id>old_val.id) {
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

    var slider=$("#range_03").data("ionRangeSlider");
    if(slider) {
        slider.destroy();
    }

    $(".friday_04_07_2").val(user_data.config.sorting);

    $("#range_03").ionRangeSlider({
        type: "double",
        grid: true,
        min: range.min_index,
        max: range.max_index,
        from: user_data.config.range_area.start ? user_data.config.range_area.start : range.min_index,
        to: user_data.config.range_area.end ? user_data.config.range_area.end : null,
        prefix: "",
        onFinish:function(a){
            user_data.config.range_area.start=a.from;
            user_data.config.range_area.end=a.to;
            set_storage();
        }
    });
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