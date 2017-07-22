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
                time_break:30,
                number_repeat:10,
                position_template: "bottom_right",
                time_last_traning:new Date().getTime()
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
                time_break:30,
                number_repeat:10,
                position_template: "bottom_right"
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

$( document ).ready(function() {
    get_storage(function () {
        start_play();

        setTimeout(function () {
            if(user_data.save_data_when_open) {
                $(".monday_06_01").click();
            }
        },1000);

    });

    var authUser=0;
    for (var key in localStorage){
        if(key.match(/firebase:authUser/)){
            authUser=1;
        }
    }

    firebase.auth().onAuthStateChanged(function(user) {
        if (user && !user_data.first_load && !authUser) {
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
                });
            });
        }
    });

	$("body").on("click",".wednesday_05_04_01 button", function () {
        startSignIn();
    });

	// Log out
    var start_log_out=1;
	$("body").on("click",".p5 .p6", function () {
        if(start_log_out) {
            start_log_out=0;
            synchronize_data(function () {
                firebase.auth().signOut();

                chrome.storage.local.remove(["english_tip"]);
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

        set_storage();
    });

    $("body").on("click",".sunday_07_09", function () {
        $(this).removeAttr("class").text("-");
        $(this).addClass("tuesday_07_11_01").attr({"title":"Not learned"});

        var id=$(this).parent().parent().find(".thursday_27_04_1").attr("id");
        var word=get_word_from_vacabulary(id);

        if(word) {
            word.status_learn=0;
        }

        set_storage();
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
        var html=get_tooltip(id, word,(ofsset.top-75), (ofsset.left+w/2-offset_left), wednesday);
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
    $('.wednesday_05_04_08 select,.wednesday_05_04_08 input').on('change keyup', function (e) {
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
        train_learned_words=train_learned_words;
        result.config.train_learned_words=train_learned_words;

        if($(this).is("input[name=time_break]")) {
            set_new_time();
        }

        var number_repeat=$('.wednesday_05_04_08 input[name=number_repeat]').val();
        number_repeat=number_repeat?number_repeat:"all";
        result.config.number_repeat=number_repeat;

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
                    user_data.category.splice(user_data.category.length-1,0, current_category)
                } else {
                    var category=get_cutegory_by_id(current_category.config.parent_id,user_data);
                    category.child.splice(category.child.length-1,0, current_category);
                }
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

    $("body").on('click','.thursday_11_05_01 a', function () {
       var val=$(this).attr("value");
       user_data.status_enable=val;

       $(".thursday_11_05_02").removeClass("thursday_11_05_02");
       $(this).addClass("thursday_11_05_02");

       set_storage();
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
                set_storage();
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

                    var data_from_firebase_categoty=get_cutegory_by_id(data_from_firebase.current_category,data_from_firebase);
                    var data_from_user_data=get_cutegory_by_id(user_data.current_category,user_data);

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
                    });
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
    set_storage();
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
    set_storage();
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

        console.log(result.english_tip);

        if(result.hasOwnProperty("english_tip")) {
            user_data=result.english_tip;
            build_menu();
            return callback(get_current_category());
        } else {
            $(".wednesday_05_04_02").hide();
            $(".wednesday_05_04_01,.p4").show();
        }
	});
}

function set_storage(callback, update_content_script=1){
    var current_category=get_current_category();
    if(current_category) {
        current_category.vocabulary.sort(function (a, b) {
            return b.id - a.id;
        });
    }

    user_data.update_content_script=update_content_script;

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
            },1);
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
    set_storage();
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

                    }, 0);
                },
                customScroll:function(top){

                    clearTimeout($.data(this, 'scrollTimer'));
                    $.data(this, 'scrollTimer', setTimeout(function() {
                        result.config.scrollTop=top;
                        set_storage(function () {

                        }, 0);
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
            set_storage();
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
                reloadAllWindows();
            }
        }, 1000);

    });
});

