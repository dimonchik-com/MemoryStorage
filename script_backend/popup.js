"use strict";

var db,
    user_data,
    current_open_page = {},
    popup = 0,
    snapshot,
    result_data_firebase,
    flag_get_data_from_firebase;

$(document).ready(function () {

    if ($(window).width() < 200) {
        $(".p0").css({ "width": "800px", "height": "600px" });
        popup = 1;
    } else {
        $(".monday_26_03_0,.wednesday_20_06_3").show();
    }

    firebase.initializeApp({
        apiKey: 'AIzaSyCMRbZuQQmVc610R3GGb3pGqF81VAyIL7E',
        authDomain: 'https://englishtip-516bc.firebaseio.com',
        projectId: 'englishtip-516bc'
    });
    db = firebase.firestore();

    user_data = {
        current_category: 1,
        current_select_category: 1,
        category: [{
            vocabulary: [{
                id: 1,
                en: "Hallo",
                ru: "Hello",
                time_reaction: [],
                iteration: 0,
                total_iteration: 0,
                status_learn: 0,
                cat_id: 1
            }, {
                id: 2,
                en: "ÐŸÑ€Ð¸Ð²ÐµÑ‚",
                ru: "Hello",
                time_reaction: [],
                iteration: 0,
                total_iteration: 0,
                status_learn: 0,
                cat_id: 1
            }, {
                id: 3,
                en: "å—¨",
                ru: "Hello",
                time_reaction: [],
                iteration: 0,
                total_iteration: 0,
                status_learn: 0,
                cat_id: 1
            }],
            config: {
                range_area: {
                    start: 0,
                    end: 0
                },
                dir_sorting: 0,
                id: 1,
                parent_id: 0,
                name: "Vocabulary",
                dir_translation: "source_translation",
                template_word: "id_word",
                time_break: get_constant("time_break"),
                number_repeat: get_constant("number_repeat"),
                position_template: "bottom_right",
                time_last_traning: new Date().getTime(),
                delay_traning: get_constant("delay_traning"),
                delay_traning_second: get_constant("delay_traning_second"),
                training_mode: 1,
                stop_next_word: 0,
                visible: 1, // visible cat or not,
                visible_id: 0 // next id in list
            },
            category: []
        }],
        top_id: 3,
        time_last_activity: new Date().getTime(),
        time_save_data_in_firebase: new Date().getTime(), // time last save data in firebase
        update_content_script: 1, // need or not update content_script
        status_enable: 1
    };

    get_storage(function () {
        start_play();
        setTimeout(function () {
            if (new Date().getTime() > parseInt(user_data.time_save_data_in_firebase) + 60 * 60 * 24 * 1e3) { // если прошло 24 часа с момента сохранения данных на сервере
                console.log("Save data to server");
                $(".monday_06_01").click();
            } else {
                console.log("Next synchronization: " + parseInt((parseInt(user_data.time_save_data_in_firebase) + 60 * 60 * 24 * 1e3 - new Date().getTime()) / 1000 / 60) + "  minutes");
            }
        }, 1000);
    });

    chrome.tabs.getSelected(null, function (tab) {
        var url = new URL(tab.url);
        current_open_page.url = new String(url.href).toString();
        current_open_page.domain = new String(url.hostname).toString();
    });

    firebase.auth().onAuthStateChanged(function (user) {
        if (user && !user_data.first_load && !$(".p4:visible").length) {
            var userId = firebase.auth().currentUser.uid;
            get_data_from_firebase(userId, function (data) {
                if (data != "not find") {
                    user_data = data;
                } else {
                    // create new users
                    user_data.displayName = user.displayName;
                    user_data.email = user.email;
                    save_data_in_firebase(function () {});
                }

                console.log(user_data);

                user_data.first_load = 1;
                set_storage(function () {
                    build_menu();
                    start_play();
                }, 1, 1);
            });
        }
    });

    $("body").on("click", ".wednesday_05_04_01 button", function () {
        $(".p4").hide();
        $(".wednesday_05_04_02").show();
        startSignIn();
    });

    // Log out
    var start_log_out = 1;
    $("body").on("click", ".p5 .p6", function () {
        if (start_log_out) {
            start_log_out = 0;
            synchronize_data(function () {
                firebase.auth().signOut();

                var firebase_key = ["english_tip"];
                for (var key in localStorage) {
                    if (key.match(/firebase:/)) {
                        firebase_key.push(key);
                    }
                }

                chrome.storage.local.remove(firebase_key, function () {});

                delete user_data.first_load;

                $(".wednesday_05_04_01,.wednesday_05_04_01 button").show();
                $(".p0,.p5,.wednesday_05_04_02").hide();
                $(".p0").removeClass("wednesday_05_04_03");
                start_log_out = 1;
            }, true);
        }
    });

    // setTimeout(()=>{
    //     $(".p5 .p6").click();
    // },2e3);

    // add new task
    $("body").on("click", ".p10", function () {
        $(".all_task .build_task_table").bootstrapTable('destroy');
        $(".p11").show();
        $(".tuesday_19_06_02").hide();
    });

    // click learn word
    $("body").on("click", ".tuesday_07_11_01", function () {
        $(this).removeClass("tuesday_07_11_01").text("");
        $(this).addClass("sunday_07_09 glyphicon glyphicon-ok").attr({ "title": "Learned" });

        var id = $(this).parent().parent().find(".wednesday_05_04_05").attr("id");
        var cat_id = $(this).parent().parent().find(".wednesday_05_04_05").attr("cat_id");
        var word = get_word_from_vacabulary(id, cat_id);

        if (word) {
            word.status_learn = 1;
        }
        set_storage(function () {}, 1, 2);
    });

    $("body").on("click", ".sunday_07_09", function () {
        $(this).removeAttr("class").text("-");
        $(this).addClass("tuesday_07_11_01").attr({ "title": "Not learned" });

        var id = $(this).parent().parent().find(".wednesday_05_04_05").attr("id");
        var cat_id = $(this).parent().parent().find(".wednesday_05_04_05").attr("cat_id");
        var word = get_word_from_vacabulary(id, cat_id);

        if (word) {
            word.status_learn = 0;
        }
        set_storage(function () {}, 1, 3);
    });

    // create new task
    $("body").on("click", ".p13", function () {
        get_storage(function (result) {
            var new_word = $("input[name=new_word]").val();
            var new_translate = $("input[name=new_translate]").val();
            var type = $("select[name=saturday_04_18_0]").val();

            if (type == 0) {
                var error = 0;
                for (var i in result.vocabulary) {
                    if (result.vocabulary[i].en == new_word) {
                        $(".friday_04_07_1").show();
                        error = 1;
                    }
                }
                if (error) return false;
                create_new_word(result, new_word, new_translate);
            } else {
                var result = get_current_category();
                create_category(parseInt(result.config.id), new_word, 0);
            }
        });
        return false;
    });

    $("body").on("change", "select[name=saturday_04_18_0]", function () {
        var value = parseInt($(this).val());
        if (value) {
            $("input[name=new_translate]").parent().hide();
        } else {
            $("input[name=new_translate]").parent().show();
        }
    });

    // build different task by action
    $("body").on("click", ".p8 a", function () {
        var name_tab = parseInt($(this).attr("data-name"));
        start_build_frame(name_tab);
    });

    $("body").on("click", ".saturday_02_11_1", function () {
        $(".config,.new_category,.all_task,.p11").hide();
        $(".all_task .bootstraptable").bootstrapTable('destroy');
        update_sort_category();
        $(".sunday_02_11_2").show();

        return false;
    });

    $("body").on("click", "#nestable-menu button[data-action='expand-all']", function () {
        $('.dd').nestable('expandAll');
        return false;
    });

    $("body").on("click", "#nestable-menu button[data-action='collapse-all']", function () {
        $('.dd').nestable('collapseAll');
        return false;
    });

    $("body").on("click", "#nestable-menu button[data-action='cancel']", function () {
        $(".p8 a[data-name=" + user_data.current_category + "]").click();
        return false;
    });

    $("body").on("click", "#nestable-menu button[data-action='save_new']", function () {
        var ob = $('.dd').nestable('serialize');
        console.log(ob);

        var all_category = get_all_categories(user_data.category, []);
        var new_all_category = [];
        all_category.map(function (elem) {
            new_all_category[elem.config.id] = elem;
        });

        var new_user_data = sort_new_user_data(ob, [], new_all_category);
        user_data.category = new_user_data;

        set_storage(function () {
            build_menu();
            start_build_frame(user_data.current_category);
            $(".tuesday_04_13_0").val("");
        }, 1, 8);

        return false;
    });

    $("body").on("click", ".wednesday_24_01", function () {
        user_data.current_select_category = user_data.current_category;
        $(".wednesday_24_01,.friday_22_06_0").hide();
        set_storage(function () {
            $(".config,.new_category,.all_task,.p11").hide();
            $(".all_task .bootstraptable").bootstrapTable('destroy');

            $(".all_task").show();
            all_task();
        }, 1, 5);
        return false;
    });

    $("body").on("click", ".friday_22_06_0", function () {
        start_build_frame(user_data.current_select_category);
        return false;
    });

    $("body").on("click", ".saturday_04_02", function () {
        $(".all_task").hide();
        $(".config").show();
        config_tab();
    });

    // event check or uncheck
    $(".build_task_table").on('check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table', function () {
        var check_element = $(".build_task_table input[type='checkbox']:checked").length;
        if (check_element) {
            $(".p19").show();
        } else {
            $(".p19").hide();
        }
    });

    // remove several task
    $("body").on("click", ".p19", function () {

        var userId = firebase.auth().currentUser.uid;
        db.collection("users").doc(userId + "-catdata-2").delete();

        var list_remove_word = [];
        $(".build_task_table input[type='checkbox']:checked").each(function () {
            var name_domain = $(this).closest("tr").find(".wednesday_05_04_05:not([is_cat=1])").attr("id");
            if (name_domain) {
                list_remove_word.push(name_domain);
            }
        });

        var list_remove_subcategory = [];
        $(".build_task_table input[type='checkbox']:checked").each(function () {
            var name_domain = $(this).closest("tr").find(".wednesday_05_04_05[is_cat=1]").attr("cat_id");
            if (name_domain) {
                list_remove_subcategory.push(parseInt(name_domain));
            }
        });

        bootbox.confirm("Are you sure you want to delete the element?", function (action) {
            if (action) {
                get_storage(function (result) {
                    if (list_remove_word.length) {
                        var i = result.vocabulary.length;
                        while (i--) {
                            if (list_remove_word.indexOf(String(result.vocabulary[i].id)) != -1 || !result.vocabulary[i].id) {
                                result.vocabulary.splice(i, 1);
                            }
                        }
                    } else if (list_remove_subcategory.length) {
                        var i = result.category.length;
                        while (i--) {
                            result.category.map(function (element, index) {
                                if (list_remove_subcategory.indexOf(element.config.id) != -1) {
                                    result.category.splice(i, 1);
                                }
                            });
                        }
                    }

                    user_data.time_last_activity = new Date().getTime();
                    set_storage(function () {
                        if (list_remove_word.length) {
                            $(".all_task .build_task_table").bootstrapTable("load", result.vocabulary);
                        } else if (list_remove_subcategory.length) {
                            start_build_frame(user_data.current_category);
                        }
                        $(".p19").hide();
                    }, 1, 6);
                });
            }
        });
    });

    // add event click if miss checkbox
    $("body").on('click', ".table td", function (event) {
        var elem = event.target.nodeName;
        if (elem != "INPUT") {
            $(this).find("input").trigger('click');
        }
    });

    var current_click_class, current_click_element;
    $("body").on("click", ".wednesday_05_04_05,.wednesday_05_04_07,.wednesday_05_04_05", function () {
        current_click_class = $(this).hasClass("wednesday_05_04_05") ? "en" : "ru";
        current_click_element = this;

        var cat_id = $(this).attr("cat_id");

        if (parseInt($(this).attr("is_cat")) && $(this).hasClass("wednesday_05_04_05")) {
            user_data.current_category = cat_id;
            start_build_frame(cat_id);
            return true;
        }

        var offset_left = 130, wednesday = "";

        $(".wednesday_05_04_06").remove();
        var ofsset = $(this).parent().offset();
        var w = $(this).parent().width();
        var word = $(this).text();
        if (word == "-") {
            word = "";
        }
        var id = $(this).attr("id");
        word = escapeHtml(word);

        var html = get_tooltip(id, word, ofsset.top - 75, ofsset.left + w / 2 - offset_left, wednesday, cat_id);
        $(".p0").append(html);
        return false;
    });

    $("body").on("click", ".editable-cancel", function () {
        $(".wednesday_05_04_06").hide();
        return false;
    });

    $("body").on("click", ".editable-submit", function () {
        var id = $(".wednesday_05_04_09").attr("id");
        var cat_id = $(".wednesday_05_04_09").attr("cat_id");
        var val = $(".wednesday_05_04_09").val();

        var copy_val = val ? val : "-";
        $(current_click_element).text(copy_val);

        update_word_in_vacabulary(id, val, current_click_class, false, cat_id);

        $(".wednesday_05_04_06").remove();
        return false;
    });

    // Change form data
    $('.friday_04_14_02').on('click', function (e) {
        var result = get_current_category();

        var dir_sorting = $('.wednesday_05_04_08 select[name=dir_sorting]').val();
        result.config.dir_sorting = dir_sorting;

        var dir_translation = $('.wednesday_05_04_08 select[name=dir_translation]').val();
        result.config.dir_translation = dir_translation;

        var template_word = $('.wednesday_05_04_08 select[name=template_word]').val();
        result.config.template_word = template_word;

        var position_template = $('.wednesday_05_04_08 select[name=position_template]').val();
        result.config.position_template = position_template;

        var time_break = parseInt($('.wednesday_05_04_08 input[name=time_break]').val());
        time_break = time_break ? time_break : 30;
        result.config.time_break = time_break;

        var time_reaction = parseInt($('.wednesday_05_04_08 input[name=time_reaction]').val());
        time_reaction = time_reaction ? time_reaction : 5;
        result.config.time_reaction = time_reaction;

        var time_reps = parseInt($('.wednesday_05_04_08 input[name=time_reps]').val());
        time_reps = time_reps ? time_reps : 50;
        result.config.time_reps = time_reps;

        var train_learned_words = parseInt($('.wednesday_05_04_08 input[name=train_learned_words]').val());
        result.config.train_learned_words = train_learned_words;

        var delay_traning = parseInt($('.wednesday_05_04_08 select[name=delay_traning]').val());
        result.config.delay_traning = delay_traning;

        var delay_traning_second = $('.wednesday_05_04_08 input[name=delay_traning_second]').val();
        delay_traning_second = delay_traning_second ? delay_traning_second : get_constant("delay_traning_second");
        result.config.delay_traning_second = delay_traning_second;

        var training_mode = parseInt($('.wednesday_05_04_08 select[name=training_mode]').val());
        result.config.training_mode = training_mode;

        var name_category = $('.wednesday_05_04_08 input[name=name_category]').val();
        result.config.name = name_category;

        // Gear disabled on this site
        if (training_mode == 2 && current_open_page.domain.match(/\./)) {
            if (result.config.training_mode_domain) {
                result.config.training_mode_domain.push(current_open_page.domain);
            } else {
                result.config.training_mode_domain = [current_open_page.domain];
            }
        } else if (training_mode == 1 && result.config.training_mode_domain) {
            var index = result.config.training_mode_domain.indexOf(current_open_page.domain);
            result.config.training_mode_domain.splice(index, 1);
        }

        if ($(this).is("input[name=time_break]")) {
            set_new_time();
        }

        var stop_next_word = parseInt($('.wednesday_05_04_08 select[name=stop_next_word]').val());
        result.config.stop_next_word = stop_next_word;

        var number_repeat = $('.wednesday_05_04_08 input[name=number_repeat]').val();
        number_repeat = number_repeat ? number_repeat : "all";
        result.config.number_repeat = number_repeat;

        var select_category = $("#category_list").val();

        if (select_category != result.config.parent_id) {
            var parent_category = get_parent_category(result.config.parent_id);
            var splice_element;
            for (var i in parent_category.category) {
                if (parent_category.category[i].config.id == result.config.id) {
                    splice_element = parent_category.category[i];
                    parent_category.category.splice(i, 1);
                    break;
                }
            }

            if (parseInt(select_category)) {
                var select_category_object = get_category_by_id(parseInt(select_category), user_data.category);

                select_category_object.category.push(splice_element);
                splice_element.config.parent_id = select_category;
            } else {
                result.config.parent_id = 0;
            }

            user_data.time_last_activity = new Date().getTime();
        }

        $(".saturday_04_04").click();
        set_storage(function () {}, 1, 7);
    });

    $('body').on('click', ".saturday_04_04,.tuersday_04_13_2,.p14", function (e) {
        start_build_frame(user_data.current_category);
        return false;
    });

    $('body').on('click', ".saturday_04_01", function (e) {
        $(".all_task, .config").hide();
        $(".tuersday_04_13_1").text("Save");
        $(".new_category").show();
        $(".tuesday_04_13_0").val("");

        update_category_in_select_list(false);

        return false;
    });

    $('body').on('click', ".tuersday_04_13_1", function (e) {
        var name_category = $(".new_category .tuesday_04_13_0").val();
        var parent_category = $("#category_list_create").val();

        if (!name_category.length) {
            $(".tuesday_04_13_0").parent().addClass("has-error");
        } else {
            create_category(parseInt(parent_category), name_category, 1, 0);
        }
        return false;
    });

    $('body').on('click', ".mondey_04_17_0", function (e) {
        bootbox.confirm("Are you sure you want to delete this category? This action cannot be undone! <br>When you delete a category, all sub categories will be deleted also!<br>Be careful in your desires!", function (action) {
            if (action) {
                delete_current_category();
            }
        });
    });

    $("body").on('click', '.thursday_11_05_01 a', function () {
        var val = $(this).attr("value");
        user_data.status_enable = val;

        $(".thursday_11_05_02").removeClass("thursday_11_05_02");
        $(this).addClass("thursday_11_05_02");
        set_storage(function () {}, 1, 9);
        return false;
    });

    $("body").on("click", ".thirsday_08_06_02", function () {
        bootbox.confirm("Are you sure you want to reschedule the lesson?", function (action) {
            if (action) {
                set_new_time_all();
            }
        });
        return false;
    });

    $("body").on("click", ".friday_09_06_01", function () {
        bootbox.confirm("Are you sure you want to delete all reaction history?", function (action) {
            if (action) {
                var result = get_current_category();
                result.vocabulary.map(function (element) {
                    element.time_reaction = [];
                });
                set_storage(function () {}, 1, 10);
            }
        });
        return false;
    });

    $(document).on("mouseenter", ".p8 li", function (e) {
        $(this).find('ul:first').show();
    });

    $(document).on("mouseleave", ".p8 li", function (e) {
        $(this).find('ul:first').hide();
    });

    $("body").on("click", ".monday_06_01", function () {
        synchronize_data(function () {});
        return false;
    });

    $("body").on("click", ".wednesday_7_12_01", function () {
        var result = get_current_category();
        if (result.vocabulary.length < get_constant("minimum_elements_for_training")) {
            bootbox.alert("Minimum number of words to start training 3");
        } else {
            set_new_time_all(1);
        }
        return false;
    });

    $("body").on("click", ".cp", function () {
        var content = $(this).text();
        (function () {
            var __temp = document.createElement('input');document.body.appendChild(__temp), __temp.value = content, __temp.select(), document.execCommand("copy"), __temp.remove();
        })();
        $(this).animate({ backgroundColor: '#4E1402' }, 300);

        var myRow = $(this);

        myRow.addClass('stylish');

        setTimeout(function () {
            myRow.addClass('stylish1');
            setTimeout(function () {
                myRow.removeClass('stylish stylish1');
            }, 500);
        }, 100);
    });

    $("body").on("click", ".wednesday_13_06_01 a,.tuesday_19_06_01 li", function () {
        var cat_id = $(this).attr("id_cat");
        start_build_frame(cat_id);
        return false;
    });

    $("body").on("click", ".wednesday_20_06_0", function () {
        if ($(".wednesday_20_06_1").is(":visible")) {
            $(".wednesday_05_04_04").show();
            $(".wednesday_20_06_1").hide();
        } else {
            $(".wednesday_05_04_04").hide();
            $(".wednesday_20_06_1").show();
        }
        return false;
    });

    var new_file_upload;
    $('#wednesday_20_06_2').on('change', function () {
        var fileReader = new FileReader();
        fileReader.onload = function () {
            var data = fileReader.result.split(',')[1]; // data <-- in this var you have the file data in Base64 format
            new_file_upload = b64DecodeUnicode(data);
            new_file_upload = JSON.parse(new_file_upload);
        };
        fileReader.readAsDataURL($('#wednesday_20_06_2').prop('files')[0]);
    });

    $(".wednesday_20_06_3").click(function (event) {
        if (new_file_upload) {
            $(".wednesday_20_06_3").prop('disabled', false);
            user_data = new_file_upload;
            save_data_in_firebase(function () {
                $(".wednesday_05_04_04").show();
                $(".wednesday_20_06_1").hide();
                $(".wednesday_20_06_3").prop('disabled', true);
                start_build_frame(user_data.current_category);
            });
        }
        return false;
    });

    $(".monday_26_03_0").on("click", function () {
        saveJson(user_data);
        return false;
    });

    function create_new_word(result, new_word, new_translate) {
        let new_id=get_new_id();

        result.vocabulary.push({
            id: new_id,
            en: new_word,
            ru: new_translate,
            time_reaction: [],
            iteration: 0,
            total_iteration: 0,
            status_learn: 0,
            cat_id: result.config.id
        });

        user_data.time_last_activity = new Date().getTime();

        // update count
        var range = get_range();
        if (result.config.range_area.end == range.max_index - 1) {
            result.config.range_area.end = range.max_index;
        }

        set_storage(function () {
            $(".p12 input").val("");
            $(".p11").hide();
            start_build_frame(user_data.current_category);
        }, 1, 4);
    }

    function synchronize_data(callback) {
        var force_overwriting = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        if($(".monday_06_01").hasClass("gly-spin")) {
            return 1;
        } else {
            $(".monday_06_01").addClass("gly-spin");
        }

        if (firebase.auth().currentUser) {
            var userId = firebase.auth().currentUser.uid;

            get_data_from_firebase(userId, function (data) {
                if (data != "not find") {
                    var data_from_firebase = data;

                    if (!data_from_firebase) {
                        callback();
                    }

                    if (user_data.time_last_activity >= data_from_firebase.time_last_activity || !data_from_firebase.hasOwnProperty("time_last_activity")) {
                        // if local data more recent then server data
                        save_data_in_firebase(function (res) {
                            $(".monday_06_01").removeClass("gly-spin");
                            callback();
                        });
                    } else {
                        // if on server data more recent than local
                        data_from_firebase.current_category = user_data.current_category;
                        data_from_firebase.current_select_category = user_data.current_select_category;

                        var data_from_firebase_categoty = get_category_by_id(data_from_firebase.current_category, data_from_firebase.category);
                        var data_from_user_data = get_category_by_id(user_data.current_category, user_data.category);

                        //console.log(data_from_firebase);
                        //console.log(user_data);

                        // data_from_firebase_categoty.config.time_last_traning=data_from_user_data.config.time_last_traning;

                        //console.log(data_from_firebase_categoty.config.time_last_traning);
                        //console.log(data_from_user_data.config.time_last_traning);

                        user_data = data_from_firebase;
                        set_storage(function () {
                            // if(force_overwriting) {
                            save_data_in_firebase(function (res) {
                                $(".monday_06_01").removeClass("gly-spin");
                                callback();
                            });
                            // } else {
                            //     $(".monday_06_01").removeClass("gly-spin");
                            //     callback();
                            // }
                        }, 1, 11);
                    }
                } else {
                    save_data_in_firebase(function (res) {
                        $(".monday_06_01").removeClass("gly-spin");
                        callback();
                    });
                    console.log("No such document!");
                }
            });
        } else {
            // if not data on server
            firebase.database().ref('users/' + user.uid).set(user_data, function (result) {});
        }
    }

    function get_tooltip(id, word, top, left, wednesday, cat_id) {
        var html = "<div class=\"popover editable-container editable-popup fade top in wednesday_05_04_06\" style=\"top:" + top + "px; left:" + left + "px; display: block;\"><div class=\"arrow " + wednesday + "\"></div><h3 class=\"popover-title\">Enter username</h3><div class=\"popover-content\"> <div><div class=\"editableform-loading\" style=\"display: none;\"></div><form class=\"form-inline editableform\" style=\"\"><div class=\"control-group form-group\"><div><div class=\"editable-input\" style=\"position: relative;\"><input type=\"text\" class=\"form-control input-sm wednesday_05_04_09\" value=\"" + word + "\" style=\"padding-right: 24px;\" id=\"" + id + "\" cat_id=\"" + cat_id + "\"></div><div class=\"editable-buttons\"><button type=\"submit\" class=\"btn btn-primary btn-sm editable-submit\"><i class=\"glyphicon glyphicon-ok\"></i></button><button type=\"button\" class=\"btn btn-default btn-sm editable-cancel\"><i class=\"glyphicon glyphicon-remove\"></i></button></div></div><div class=\"editable-error-block help-block\" style=\"display: none;\"></div></div></form></div></div></div>";
        return html;
    }
});

function start_build_frame(name_tab) {
    user_data.current_category = name_tab;

    if (user_data.current_category != user_data.current_select_category) {
        $(".wednesday_24_01,.friday_22_06_0").show();
    } else {
        $(".wednesday_24_01,.friday_22_06_0").hide();
    }

    // if(name_tab==2) {
    //     $("a[data-name=2]").next().find("li:first a").click();
    //     return false;
    // }
    set_storage(function () {
        $(".config,.new_category,.all_task,.p11,.sunday_02_11_2").hide();
        $(".all_task .bootstraptable").bootstrapTable('destroy');

        $(".all_task").show();
        all_task();
    }, 1, 5);
}

function create_category(parent_category_id, name_category, visible) {
    let new_id=get_new_id();
    var parent_category = get_parent_category(parent_category_id);
    var blank_category = {
        vocabulary: [],
        category: [],
        config: {
            range_area: { start: 0, end: 0 },
            dir_sorting: 0,
            id: user_data.top_id++,
            parent_id: parent_category.id_category,
            name: name_category,
            position_template: "bottom_right",
            time_break: 30,
            number_repeat: 10,
            dir_translation: "source_translation",
            template_word: "id_word",
            time_reaction: 5,
            time_reps: 50,
            train_learned_words: 0,
            time_last_traning: new Date().getTime(),
            visible: visible,
            visible_id: new_id
        }
    };

    parent_category.category.push(blank_category);

    if (!visible) {
        // user_data.current_category = blank_category.config.id;
    }

    set_storage(function () {
        build_menu();
        start_build_frame(user_data.current_category);
        $(".tuesday_04_13_0").val("");
    }, 1, 8);
}

function set_new_time() {
    var result = get_current_category();
    result.config.time_last_traning = new Date().getTime() + result.config.time_break * 60 * 1000;
    set_storage(function () {}, 1, 12);
}

function set_new_time_all(time_now) {
    var result = get_all_categories(user_data.category, []);

    for (var i in result) {
        var time = result[i].config.time_break ? result[i].config.time_break : 30;
        if (time_now) {
            result[i].config.time_last_traning = new Date().getTime();
        } else {
            result[i].config.time_last_traning = new Date().getTime() + time * 60 * 1000;
        }
    }

    $(".p8 a[data-name=" + user_data.current_category + "]").click();
    set_storage(function () {}, 1, 13);
}

function resort_menu() {
    var sort_list = [];

    $(".p8 li:not(li ul li)").each(function () {
        var id = $(this).find("a").attr("data-name");
        sort_list.push(id);
    });

    if (sort_list.length) {
        get_storage(function () {
            var new_array = [];

            for (var i in sort_list) {
                for (var i_two in user_data.category) {
                    if (sort_list[i] == user_data.category[i_two].config.id) {
                        var slice = user_data.category.splice(i_two, 1);
                        new_array.push(slice[0]);
                        break;
                    }
                }
            }

            user_data.category = new_array;
            set_storage(function () {}, 1, 14);
        });
    }
}

function startAuth(interactive) {
    chrome.identity.getAuthToken({ interactive: !!interactive }, function (token) {
        if (chrome.runtime.lastError && !interactive) {
            console.log('It was not possible to get a token programmatically.');
        } else if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
        } else if (token) {
            // Authrorize Firebase with the OAuth Access Token.
            var credential = firebase.auth.GoogleAuthProvider.credential(null, token);
            firebase.auth().signInWithCredential(credential).catch(function (error) {
                // The OAuth token might have been invalidated. Lets' remove it from cache.
                if (error.code === 'auth/invalid-credential') {
                    chrome.identity.removeCachedAuthToken({ token: token }, function () {
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
    } else {
        get_storage(function () {
            start_play();
        });
    }
}

/**
 * Function for get session id
 * @param callback
 */
function get_storage(callback) {
    chrome.storage.local.get('english_tip', function (result) {
        if (result && result.hasOwnProperty("english_tip") && result.english_tip) {
            setTimeout(function () {
                var all_cat = get_all_categories(result.english_tip.category, []);
                all_cat = all_cat.map(function (item) {
                    delete item.config.last_word;
                    return item;
                });
                snapshot = Defiant.getSnapshot(all_cat);
            }, 2000);

            user_data = result.english_tip;

            build_menu();
            return callback(get_current_category());
        } else {
            $(".wednesday_05_04_02").hide();
            $(".wednesday_05_04_01,.p4").show();
        }
    });
}

function set_storage(callback) {
    var update_content_script = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var id_callback = arguments[2];

    var current_category = get_current_category();
    if (current_category) {
        current_category.vocabulary.sort(function (a, b) {
            return b.id - a.id;
        });
    }

    user_data.update_content_script = update_content_script;

    // var all_cat=get_all_categories(user_data.category,[]);
    // all_cat.map((element)=>{
    //     element.vocabulary.map((word)=>{
    //         word.cat_id=element.config.id;
    //     });
    // });

    // console.log("update date "+new Date());
    chrome.storage.local.set({ 'english_tip': user_data }, function (status) {
        if (callback) {
            return callback();
        }
    });
    $(".all_task .build_task_table").bootstrapTable('resetView');
}

function update_sort_category() {
    $('.dd').removeData("nestable");
    $(".sunday_02_11_3").html("");
    var html = update_sort_category_html(user_data.category, "");
    var height_table = popup ? $(window).height() - 67 : $(window).height() - 72;
    $(".sunday_02_11_2").css({ "height": height_table + "px" });
    $(".sunday_02_11_3").append("<ol class=\"dd-list\">" + html + "</ol>");

    $('.dd').nestable({
        group: 1
    }).on('change', function () {
        var data = $('.dd').nestable('serialize');
        console.log(data);
    });
    $('.dd').nestable('collapseAll');
}

function update_sort_category_html(category, list_categories) {
    for (var i in category) {
        var active = category[i].config.id == user_data.current_category ? "active" : "";
        if (category[i].hasOwnProperty("category") && category[i].category.length > 0) {
            list_categories += "<li class=\"dd-item\" data-id=\"" + category[i].config.id + "\"><div class=\"dd-handle\">" + category[i].config.name + "</div><ol class=\"dd-list\">";
            if (category[i].category.length) {
                list_categories += update_sort_category_html(category[i].category, "");
            }
            list_categories += "</ol></li>";
        } else {
            list_categories += "<li class=\"dd-item\" data-id=\"" + category[i].config.id + "\"><div class=\"dd-handle\">" + category[i].config.name + "</div></li>";
        }
    }
    return list_categories;
}

function save_data_in_firebase(callback) {

    var userId = firebase.auth().currentUser.uid;

    var all_category = get_all_categories(user_data.category, []);
    for (var i in all_category) {
        if (!all_category[i].config.hasOwnProperty("visible")) {
            all_category[i].config.visible = 1;
        }
    }

    var copy_user_data = JSON.parse(JSON.stringify(user_data));
    delete copy_user_data.first_load;

    copy_user_data.time_last_activity = new Date().getTime();
    copy_user_data.time_save_data_in_firebase = new Date().getTime();

    var new_category_array = [];
    copy_user_data.category.map(function (element) {
        if (!new_category_array.length) {
            new_category_array.push([element]);
        } else if (lengthInUtf8Bytes(JSON.stringify(new_category_array[new_category_array.length - 1])) + lengthInUtf8Bytes(JSON.stringify(element)) > 25e4) {
            new_category_array.push([element]);
        } else {
            new_category_array[new_category_array.length - 1].push(element);
        }
    });

    for (let _i = 1; _i < new_category_array.length; _i++) {
        db.collection("users").doc(userId + "-catdata-" + _i).set({ data: new_category_array[_i] });
    }

    db.collection("users").doc(userId + "-catdata-" + new_category_array.length).delete();

    copy_user_data.category = new_category_array[0];
    db.collection("users").doc(userId).set(copy_user_data).then(function () {
        set_storage(function () {
            user_data.time_save_data_in_firebase = new Date().getTime();
            callback(copy_user_data);
        }, 1, 15);
    }).catch(function (error) {
        console.error("Error writing document: ", error);
    });

    function lengthInUtf8Bytes(str) {
        // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
        var m = encodeURIComponent(str).match(/%[89ABab]/g);
        return str.length + (m ? m.length : 0);
    }
}

function update_word_in_vacabulary(id, val, current_click_class) {
    var rebut = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
    var cat_id = arguments[4];

    var word = get_word_from_vacabulary(id, cat_id);

    if (word[current_click_class] == val || !word) {
        return true;
    }

    word[current_click_class] = val;
    user_data.time_last_activity = new Date().getTime();

    if (rebut) {
        $(".all_task .build_task_table").bootstrapTable("load", result.vocabulary);
    }
    set_storage(function () {}, 1, 16);
}

function get_word_from_vacabulary(id, cat_id) {
    var result = get_category_by_id(cat_id, user_data.category);
    for (var i in result.vocabulary) {
        if (result.vocabulary[i].id == id) {
            return result.vocabulary[i];
            break;
        }
    }
}

function all_task() {
    $(".friday_04_07_0,.friday_04_07_1").hide();
    get_storage(function (result) {
        var next_lesson = new Date(parseInt(result.config.time_last_traning));
        var date_next_lesson = /*moment(next_lesson).format('DD-MM-YYYY')+*/" at " + moment(next_lesson).format('HH:mm:ss');
        var pageSize = result.config.pageSize ? result.config.pageSize : 25;
        var pageNumber = result.config.pageNumber ? result.config.pageNumber : 1;
        var height_table = popup ? $(window).height() - 67 : $(window).height() - 72;

        var result = get_current_category();

        var copy_result = JSON.parse(JSON.stringify(result));

        if (copy_result.category) {
            copy_result.category.map(function (item) {
                if (item.config.visible == 0) {
                    copy_result.vocabulary.push({
                        cat_id: item.config.id,
                        en: item.config.name,
                        ru: "",
                        id: item.config.visible_id,
                        is_cat: 1,
                        total_iteration: "-",
                        count_words: item.vocabulary.length
                    });
                }
            });
        }

        $(".tuesday_19_06_02").hide();

        var cat_arr = [];
        $(".all_task .build_task_table").bootstrapTable({
            data: copy_result ? copy_result.vocabulary : "",
            columns: [{
                field: 'state',
                checkbox: true,
                title: '',
                align: 'center'
            }, {
                field: 'en',
                title: 'Source',
                align: 'center',
                editable: true,
                formatter: function formatter(data, all_data) {
                    if (data.replace(/\s/g, '') == "") {
                        data = "-";
                    }
                    var is_cat = all_data.is_cat ? 1 : 0;
                    return "<a href=\"#\" class=\"wednesday_05_04_05\" id=\"" + all_data.id + "\" cat_id=\"" + (all_data.cat_id ? all_data.cat_id : "") + "\" is_cat=\"" + is_cat + "\">" + data + "</a>";
                },
                class: 'cp'
            }, {
                field: 'ru',
                title: 'Value',
                align: 'center',
                formatter: function formatter(data, all_data, index) {
                    var is_cat = all_data.is_cat ? 1 : 0;
                    if (is_cat) {
                        cat_arr.push({ "index": index, data: all_data });
                        return 'Category contain ' + all_data.count_words + ' words';
                    }
                    if (data.replace(/\s/g, '') == "") {
                        data = "-";
                    }
                    return "<a href=\"#\" class=\"wednesday_05_04_07\" id=\"" + all_data.id + "\" cat_id=\"" + all_data.cat_id + "\">" + data + "</a>";
                },
                class: 'cp'
            }, {
                field: 'reaction',
                title: 'Time',
                align: 'center',
                formatter: function formatter(data, all_data) {
                    var is_cat = all_data.is_cat ? 1 : 0;
                    if (is_cat) {
                        return '';
                    }
                    if (all_data.time_reaction != undefined) {
                        data = time_reaction_get_everage_value(all_data.time_reaction);
                    }
                    return data;
                }
            }, {
                field: 'total_iteration',
                title: 'Count',
                align: 'center',
                formatter: function formatter(data, all_data) {
                    var is_cat = all_data.is_cat ? 1 : 0;
                    if (is_cat) {
                        return '';
                    }
                    return data;
                }
            }, {
                field: 'status_learn',
                title: 'Status',
                align: 'center',
                formatter: function formatter(data, all_data) {
                    var is_cat = all_data.is_cat ? 1 : 0;
                    if (is_cat) {
                        return '';
                    }
                    if (data) {
                        data = "<span class='sunday_07_09 glyphicon glyphicon-ok'></span>";
                    } else {
                        data = "<span class='tuesday_07_11_01'>-</span>";
                    }
                    return data;
                }
            }],
            search: true,
            pagination: true,
            pageSize: pageSize,
            showRefresh: true,
            pageList: [10, 25, 50, 'All'],
            pageNumber: pageNumber,
            cookieIdTable: "all_task",
            height: height_table,
            customSearch: function customSearch(text) {
                if (text) {
                    if (!snapshot) {
                        var all_cat = get_all_categories(user_data.category, []);
                        all_cat = all_cat.map(function (item) {
                            delete item.config.last_word;
                            return item;
                        });
                        snapshot = Defiant.getSnapshot(all_cat);
                    }
                    var found_ru = JSON.search(snapshot, "//*[contains(ru, \"" + text + "\")]");
                    var found_en = JSON.search(snapshot, "//*[contains(en, \"" + text + "\")]");
                    var found_en_qwerty = JSON.search(snapshot, "//*[contains(en, \"" + convert_qwerty().toEn(text).toLowerCase() + "\")]");
                    var found_ru_qwerty = JSON.search(snapshot, "//*[contains(ru, \"" + convert_qwerty().fromEn(text).toLowerCase() + "\")]");
                    var concat = found_ru.concat(found_en, found_ru_qwerty, found_en_qwerty);
                    var list_id = [];
                    concat = concat.filter(function (item) {
                        if (list_id.indexOf(item.id) == -1) {
                            list_id.push(item.id);
                            return true;
                        } else {
                            return false;
                        }
                    });
                    this.data = concat;
                }
            },
            onPageChange: function onPageChange() {
                result.config.pageSize = this.pageSize;
                result.config.pageNumber = this.pageNumber;
                set_storage(function () {}, 0, 17);
            },
            customScroll: function customScroll(top) {

                clearTimeout($.data(this, 'scrollTimer'));
                $.data(this, 'scrollTimer', setTimeout(function () {
                    result.config.scrollTop = top;
                    set_storage(function () {}, 0, 18);
                }, 500));
            },
            onAll: function onAll(eve, all) {
                if (eve == "destroy.bs.table") {
                    $(".tuesday_19_06_02").hide();
                }
            },
            onPostBody: function onPostBody(data, cc) {
                setTimeout(function () {
                    cat_arr.map(function (elem) {
                        $(".all_task .build_task_table").bootstrapTable('mergeCells', {
                            index: elem.index,
                            field: 'ru',
                            colspan: 4
                        });
                    });
                    $(".all_task .build_task_table").bootstrapTable('resetView');
                    cat_arr = [];

                    if (!copy_result.vocabulary.length && copy_result.category.length) {
                        var ul = [];
                        copy_result.category.map(function (item) {
                            ul.push("<li id_cat=\"" + item.config.id + "\">" + item.config.name + "</li>");
                        });
                        $(".tuesday_19_06_02").html("<ul class=\"tuesday_19_06_01\">" + ul.join("") + "</ul>").show();
                        $(".fixed-table-container").hide();
                    }
                }, 100);
            }
        });

        if (result.config.scrollTop > 0) {
            $(".fixed-table-body").scrollTop(result.config.scrollTop);
        }

        $(".fixed-table-toolbar").append('<button type="button" class="btn btn-default saturday_04_02">Config</button>');
        $(".fixed-table-toolbar").append('<button type="button" class="btn btn-default p10">Create</button> <button type="button" class="btn btn-danger p19">Delete</button>');
        $(".fixed-table-toolbar").append('<div class="thirsday_08_06_01">The next lesson start ' + date_next_lesson + ' <a href="#" class="thirsday_08_06_02">skip and reset</a>, <a href="#" class="wednesday_7_12_01">train now</a></div>');

        var navigation_cat = get_category_nav(result, [result]);
        var st = [];
        navigation_cat.map(function (elem, index) {
            var name = elem.config.name.charAt(0).toUpperCase() + elem.config.name.slice(1).toLowerCase();
            if (index != navigation_cat.length - 1) {
                st.push("<a href=\"\" id_cat=\"" + elem.config.id + "\">" + name + "</a>");
            } else {
                st.push(name);
            }
        });

        if ($(".fixed-table-toolbar").length) {
            $(".fixed-table-toolbar").append('<div class="wednesday_13_06_01">' + st.join(" -> ") + '</div>');
        } else {}
    });
}

function get_range() {
    var result = get_current_category();
    if (!result.vocabulary.length) return { min_index: 0, max_index: 0 };

    var min_index = result.vocabulary.reduce(function (old_val, new_val) {
        if (parseInt(new_val.id) > parseInt(old_val.id)) {
            return old_val;
        } else {
            return new_val;
        }
    });
    min_index = min_index.id;

    var max_index = result.vocabulary.reduce(function (old_val, new_val) {
        if (parseInt(new_val.id) > parseInt(old_val.id)) {
            return new_val;
        } else {
            return old_val;
        }
    });
    max_index = max_index.id;

    return { min_index: parseInt(min_index), max_index: parseInt(max_index) };
}

// Set default values
function config_tab() {
    var range = get_range();
    var result = get_current_category();

    update_category_in_select_list(true);

    var slider = $("#range_03").data("ionRangeSlider");
    if (slider) {
        slider.destroy();
    }

    $('.wednesday_05_04_08 select[name=dir_sorting]').val(result.config.dir_sorting);
    $('.wednesday_05_04_08 select[name=dir_translation]').val(result.config.dir_translation);
    $('.wednesday_05_04_08 select[name=template_word]').val(result.config.template_word);
    $('.wednesday_05_04_08 select[name=position_template]').val(result.config.position_template);
    $('.wednesday_05_04_08 input[name=time_break]').val(result.config.time_break);
    $('.wednesday_05_04_08 input[name=number_repeat]').val(result.config.number_repeat);
    $('.wednesday_05_04_08 select[name=delay_traning]').val(result.config.hasOwnProperty("delay_traning") ? result.config.delay_traning : get_constant("delay_traning"));
    $('.wednesday_05_04_08 input[name=delay_traning_second]').val(result.config.delay_traning_second);
    $('.wednesday_05_04_08 input[name=name_category]').val(result.config.name);

    if (parseInt(result.config.training_mode) == 0) {
        $('.wednesday_05_04_08 select[name=training_mode]').val(result.config.training_mode);
    } else if (result.config.training_mode_domain && result.config.training_mode_domain.indexOf(current_open_page.domain) != -1) {
        $('.wednesday_05_04_08 select[name=training_mode]').val(2);
    }

    $('.wednesday_05_04_08 select[name=stop_next_word]').val(result.config.hasOwnProperty("stop_next_word") ? result.config.stop_next_word : 0);

    $("input[name=delay_traning_second]").attr("placeholder", get_constant("delay_traning_second"));

    $(".thursday_27_04_0").html("Last time activite: " + moment(new Date(result.config.time)).format('DD-MM-YYYY HH:mm:ss'));

    $("#range_03").ionRangeSlider({
        type: "double",
        grid: true,
        min: range.min_index,
        max: range.max_index,
        from: result.config.range_area.start && result.config.range_area.start <= result.config.range_area.end ? result.config.range_area.start : range.min_index,
        to: result.config.range_area.end && result.config.range_area.end >= result.config.range_area.start ? result.config.range_area.end : null,
        prefix: "",
        onFinish: function onFinish(a) {
            result.config.range_area.start = a.from;
            result.config.range_area.end = a.to;
            set_storage(function () {}, 1, 19);
        }
    });
}

function get_parent_category(parent_category) {
    var ref;
    if (parent_category == 0) {
        if (!user_data.hasOwnProperty("category")) {
            user_data.category = [];
        }
        ref = { category: user_data.category, id_category: 0 };
    } else {
        var cat = get_category_by_id(parent_category, user_data.category);
        ref = { category: cat.category, id_category: cat.config.id };
    }

    return ref;
}

function build_menu() {
    $(".p8").remove();

    var outerDiv = build_menu_html(user_data.category, "", 0);
    outerDiv = "<ul class=\"nav navbar-nav p8\">" + outerDiv + "</ul>";

    $(".thursday_07_02_17").prepend(outerDiv);
}

function build_menu_html(category, list_categories, deep) {
    for (var i in category) {
        if (!category[i] || !category[i].config.visible) continue;
        var active = category[i].config.id == user_data.current_category ? "active" : "";

        if (category[i].hasOwnProperty("category") && category[i].category.filter(function (e) {
            return e.config.visible == 1;
        }).length) {
            var deep_class = deep == 0 ? "dropdown" : "dropdown-submenu";
            var caret = deep == 0 ? "<span class=\"caret\"></span>" : "";
            list_categories += "<li class=\"" + deep_class + " " + active + "\"><a href=\"#\" class=\"dropdown-toggle\" data-toggle=\"dropdown\" data-name=\"" + category[i].config.id + "\">" + category[i].config.name + caret + "</a><ul class=\"dropdown-menu\">";
            if (category[i].category.length) {
                list_categories += build_menu_html(category[i].category, "", deep + 1);
            }
            list_categories += "</ul></li>";
        } else {
            list_categories += "<li class=\"" + active + "\"><a href=\"#\" data-name=\"" + category[i].config.id + "\">" + category[i].config.name + "</a></li>";
        }
    }
    return list_categories;
}

function delete_current_category() {
    for (var i in user_data.category) {

        if (user_data.category[i].config.id == user_data.current_category) {
            user_data.category.splice(i, 1);
            break;
        }

        if (user_data.category[i].hasOwnProperty("category")) {
            if (user_data.category[i].category.length) {
                for (var i_two in user_data.category[i].category) {
                    if (user_data.category[i].category[i_two].config.id == user_data.current_category) {
                        user_data.category[i].category.splice(i_two, 1);
                    }
                }
            }
        }
    }

    user_data.current_category = user_data.category[0].config.id;
    set_storage(function () {
        start_build_frame(user_data.current_category);
    }, 1, 20);
}

function update_category_in_select_list(show_current) {
    var all_cat = get_all_categories(user_data.category, []);

    var current_category = get_current_category(user_data.current_category);

    $(".tuesday_04_13_5").remove();
    $("#category_list,#category_list_create").append("<option class=\"tuesday_04_13_5\" value=\"0\">Top level</option>");
    for (var i = 0; i < all_cat.length; i++) {
        if (all_cat[i].config.id == current_category.config.id && show_current || all_cat[i].config.visible == 0) continue;
        var selected = all_cat[i].config.id == current_category.config.parent_id ? "selected" : "";
        $("#category_list,#category_list_create").append("<option " + selected + " class=\"tuesday_04_13_5\" value=\"" + all_cat[i].config.id + "\">" + all_cat[i].config.name + "</option>");
    }
    $("#category_list,#category_list_create").selectpicker('refresh');
}

function start_play() {
    $(".wednesday_05_04_01").hide();
    $(".p0,.p5").show();
    $(".p0").addClass("wednesday_05_04_03");
    start_build_frame(user_data.current_category);
    $(".thursday_11_05_01 a[value=" + user_data.status_enable + "]").click();
}

function get_data_from_firebase(userId, callback) {
    if(flag_get_data_from_firebase) return 1;
    flag_get_data_from_firebase=1;

    var list_id = [userId];
    for (var i = 1; i < 10; i++) {
        list_id.push(userId + "-catdata-" + i);
    }

    result_data_firebase = [];
    async.mapSeries(list_id, resolveAfter2Seconds, function (err, res) {
        if (result_data_firebase.length) {
            result_data_firebase.map(function (element, index) {
                if (index >= 1) {
                    result_data_firebase[0].category = result_data_firebase[0].category.concat(element.data);
                }
            });
            setTimeout(function () {
                flag_get_data_from_firebase=0;
            },1e3);
            callback(result_data_firebase[0]);
        } else {
            callback("not find");
        }
    });
}

function resolveAfter2Seconds(element, callback) {
    var docRef = db.collection("users").doc(element);
    docRef.get().then(function (doc) {
        result_data_firebase.push(doc.data());
        callback(null);
    }).catch(function (err) {
        callback(element);
    });
}

function reloadWindow(win) {
    chrome.tabs.getAllInWindow(win.id, function (tabs) {
        for (var i in tabs) {
            var tab = tabs[i];
            chrome.tabs.update(tab.id, { url: tab.url, selected: tab.selected }, null);
        }
    });
};

/**
 * Reload all tabs in all windows one by one.
 */
function reloadAllWindows() {
    chrome.windows.getAll({}, function (windows) {
        for (var i in windows) {
            reloadWindow(windows[i]);
        }
    }.bind(this));
}

chrome.windows.getCurrent(function (win) {
    chrome.tabs.getAllInWindow(win.id, function (tabs) {
        var find_memory_traning = 0;
        for (var i in tabs) {
            var tab = tabs[i];
            chrome.tabs.sendMessage(tab.id, { are_you_smart: 1 }, function (response) {
                if (response) {
                    if (response.hasOwnProperty("yes_i_smart")) {
                        find_memory_traning = 1;
                    }
                }
            });
        }

        setTimeout(function () {
            if (!find_memory_traning) {
                //reloadAllWindows();
            }
        }, 1000);
    });
});

var saveJson = function saveJson(obj) {
    var str = JSON.stringify(obj, null, 4);

    var blob = new Blob([str], {
        type: 'application/json'
    });

    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', "MemoryStorage-" + ('0' + (new Date().getMonth() + 1)).slice(-2) + "." + (new Date().getDate() + 1) + "." + (new Date().getFullYear() + 1) + ".json");
    var event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
    link.dispatchEvent(event);
};

function b64DecodeUnicode(str) {
    return decodeURIComponent(Array.prototype.map.call(atob(str), function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
};

function get_new_id() {
    var result = get_current_category();

    var max_id;
    if (result.vocabulary.length) {
        max_id = result.vocabulary.reduce(function (old_val, new_val) {
            if (parseInt(new_val.id) > parseInt(old_val.id)) {
                return new_val;
            } else {
                return old_val;
            }
        });
        max_id = parseInt(max_id.id) + 1;
        max_id = isNaN(max_id)?0:max_id;
    } else {
        max_id = 0;
    }
    return max_id;
}