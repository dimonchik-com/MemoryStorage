var config = {
    apiKey: "AIzaSyCMRbZuQQmVc610R3GGb3pGqF81VAyIL7E",
    databaseURL: "https://englishtip-516bc.firebaseio.com",
    storageBucket: "englishtip-516bc.appspot.com"
};
firebase.initializeApp(config);

var user_data={vocabulary:[],config:{range_area:{start:0,end:0}},sorting:0}

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

		// chrome.storage.local.remove('pickup_session', function (result) {
		// 	$("#form_login").show();
		// 	$(".p5,.p9").hide();
		// 	$(".p0").css({"min-width":"200px","height":"auto"});
		// });
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
			user_data.vocabulary.push({
                id:new_id,
				en:new_word,
				ru:new_translate,
                time_reaction:[],
                iteration:0,
				total_iteration:0
			});

			set_strage(function(){
				$(".p12 input").val("")
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
                all_task();
                break;
            case "all_black_list":

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
					$.ajax({
						method: "POST",
						url: "http://localhost/pickup/remove_task",
						data: {list_remove_task: list_remove_task, pickup_session: result.pickup_session}
					}).done(function (respons) {
						$(".all_task .build_task_table").bootstrapTable('refresh');
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
        var html=get_tooltip((ofsset.top-75), (ofsset.left+w/2-130));
        $(".p0").append(html);
        return false;
    });

    $("body").on("click",".editable-cancel", function () {
        $(".wednesday_05_04_06").hide();
        return false;
    });

    $("body").on("click",".editable-submit", function () {
        $(".wednesday_05_04_06").hide();
        return false;
    });

    function get_tooltip(top, left) {
        var html='<div class="popover editable-container editable-popup fade top in wednesday_05_04_06" style="top:'+top+'px; left:'+left+'px; display: block;"><div class="arrow"></div><h3 class="popover-title">Enter username</h3><div class="popover-content"> <div><div class="editableform-loading" style="display: none;"></div><form class="form-inline editableform" style=""><div class="control-group form-group"><div><div class="editable-input" style="position: relative;"><input type="text" class="form-control input-sm" style="padding-right: 24px;"></div><div class="editable-buttons"><button type="submit" class="btn btn-primary btn-sm editable-submit"><i class="glyphicon glyphicon-ok"></i></button><button type="button" class="btn btn-default btn-sm editable-cancel"><i class="glyphicon glyphicon-remove"></i></button></div></div><div class="editable-error-block help-block" style="display: none;"></div></div></form></div></div></div>';
        return html;
    }

});

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

function set_strage(callback){
    chrome.storage.local.set({'english_tip': user_data}, function() {
        return callback();
    });
}

/**
 * Show all task
 */
function all_task() {
    get_storage(function (result) {

            var vocabulary;
            if(result) {
                result.vocabulary.sort(function (a, b) {
                    return b.id - a.id;
                });
                vocabulary=result.vocabulary;
            }

            $(".all_task .build_task_table").bootstrapTable({
            	data:vocabulary,
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
                        formatter :function (data) {
                            return data;
                        }
                    },
                    {
                        field: 'en',
                        title: 'English',
                        align: 'center',
                        editable: true,
                        formatter :function (data) {
                            return '<a href="#" class="wednesday_05_04_05">'+data+'</a>';
                        }
                    },
					{
						field: 'ru',
						title: 'Translation',
						align: 'center',
						formatter :function (data) {
                            return '<a href="#" class="wednesday_05_04_07">'+data+'</a>';
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