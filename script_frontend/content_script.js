"use strict";

var user_data;

function EnglishTip(vocabulary, config) {
    // update data from storage
    chrome.storage.onChanged.addListener(function (changes, namespace) {
        if(save_vacabulary.ignore_update) {
            save_vacabulary.ignore_update=0;
            return false;
        }
        setTimeout(function () {
            update_data_from_storage();
        },200)
    });

    document.addEventListener("visibilitychange", function() {
        if (document.hidden){
            setTimeout(function(){
                // var  tuesday_16_05_01= document.getElementById('tuesday_16_05_01');
                // if(tuesday_16_05_01) {
                    update_data_from_storage();
                // }

                // setTimeout(function(){
                //     save_data(1);
                // },500);

            },500);
        }
    });

    window.addEventListener('click', function(e) {
        e = e || window.event;
        var target = e.target || e.srcElement;
        var tuesday=document.getElementById('tuesday_03_10_0');
        if(tuesday && target.id!="tuesday_03_10_0") {
            create_world(false, true);
        }
    });

    var save_vacabulary={time:0,repeat:1, ignore_update:0};
    var count_data_from_storage=0;
    var click_fail=0;

    setInterval(function () {
        start_work();
    }, 1500);

    function start_work() {
        var domain=new String(window.location.hostname).toString();
        var stop=0;
        if(config.training_mode_domain && config.training_mode_domain.indexOf(domain)!=-1) { // site
            stop=1;
        } else if(parseInt(config.training_mode)==0) {
            stop=1;
        }

        create_traning_zero();
        if(!user_data){
            stop=1;
        }

        if(stop) {
            remove_all_element();
            return 1;
        }

        var  wednesday_17_05= document.getElementById('wednesday_17_05_17_0');
        if(wednesday_17_05) return false;

        var main_id = document.getElementById('wednesday_29_03_0');

        var length_body = document.getElementsByTagName("BODY")[0].innerHTML;
        if(length_body.length<=2000) {
            return false;
        }

        if (main_id == null && vocabulary && parseInt(user_data.status_enable)) {
            create_world(false, false);
        }

        // check current time
        var current_timestamp=new Date().getTime()+(config.time_break*60*1000);

        if(config.time==undefined) {
            config.time=new Date().getTime();
        }

        if(parseInt(user_data.status_enable) &&
            (current_timestamp>config.time || parseInt(config.left_traning_word)>0) &&
            (new Date().getTime()>config.time_last_traning || config.time_last_traning==undefined) &&
            new String(config.time_break).length>=1 &&
            vocabulary.length>=get_constant("minimum_elements_for_training")
        ) {
            if(!document.getElementById('tuesday_16_05_01')) {
                if(parseInt(config.left_traning_word)<=0 || !config.left_traning_word) {
                    config.left_traning_word=get_number_repeat(config,vocabulary);
                }

                if(config.left_traning_word<=0) return 0;

                var black_display = create('<div id="tuesday_16_05_01"><div>Time to traning: left <span id="tuesday_16_05_02">'+config.left_traning_word+'</span> words</div></div>');
                insertAfter(black_display,"tuesday_16_05_01");
            } else if(parseInt(config.left_traning_word)>=1) {
                var left_traning_word_id = document.getElementById('tuesday_16_05_02');
                if(left_traning_word_id) left_traning_word_id.innerHTML=config.left_traning_word;
            }
        } else {
            remove_element(["tuesday_16_05_01"]);
        }
    }

    function init_style() {
        var englishtip_css = document.getElementById('wednesday_29_03_0');
        var hide_cursor=config.way_traning?"cursor: none;":"";

        var position_template = `
#wednesday_29_03_1{line-height: 15px;}
#wednesday_29_03_0{ position:fixed; right:0px; bottom:0px; padding:5px 5px 5px 5px; z-index: 90000000000; background:blue; color: #fff; margin:5px 0px 1px 0; font-size:13px; font-family:Arial; min-width: 80px; text-align: center; line-height: 15px; ${hide_cursor} }
#wednesday_29_03_2{position:fixed; right:0px; bottom:0px; padding:5px 0px 5px 0px; z-index: 90000000000; background:green; color: #fff; margin:5px 40px 1px 0px; font-size:13px; font-family:Arial; min-width: 40px !important; text-align: center; cursor:pointer; line-height: 15px; ${hide_cursor}}
#wednesday_29_03_2:hover{-moz-box-shadow:inset 0 0 5px #000000; -webkit-box-shadow: inset 0 0 5px #000000; box-shadow:inset 0 0 5px #000000;}
#wednesday_29_03_3:hover{-moz-box-shadow:inset 0 0 10px red; -webkit-box-shadow: inset 0 0 10px red; box-shadow:inset 0 0 10px red;}
#wednesday_29_03_3{position:fixed; right:0px; bottom:0px; padding:5px 0px 5px 0px; z-index: 90000000000; background:black; color: #fff; margin:5px 0px 1px 0; font-size:13px; font-family:Arial; width: 40px; text-align: center; cursor:pointer; line-height: 15px;}
#wednesday_29_03_4{position: fixed; right: 0px; bottom: 0px; padding: 5px 5px 5px 5px; z-index: 90000000000; background: darkgreen; color: #fff; margin: 5px 0px 1px 0; font-size: 13px; font-family: Arial; min-width: 80px; text-align: center; line-height: 15px; ${hide_cursor}}
#wednesday_29_03_5{position: fixed; right: 0px; bottom: 0px; padding: 5px 5px 5px 5px; z-index: 90000000000; background: red; color: #fff; margin: 5px 0px 1px 0; font-size: 13px; font-family: Arial; min-width: 80px; text-align: center; line-height: 15px; ${hide_cursor}}
#tuesday_16_05_01{position: fixed; background: black; width: 100%; height: 100%; top: 0px; z-index: 90000000000; opacity: .6; display:table-cell; vertical-align:middle;}
#tuesday_16_05_01 div{color: red; position: absolute; top: 50%; width: 100%; text-align: center; font-size: 21px; font-weight: bold;}
#tuesday_16_05_01 span{position: relative !important; color: red; font-size: 21px; font-weight: bold; top:0px; left:0px; text-decoration: underline; cursor: auto;}
#wednesday_17_05_17_0{color:green !important;}
#thursday_14_09_1{position:absolute; right:0px; bottom:0px; padding:0px 0px 0px 0px; margin: 0px; width: 100%; height:100%;background: blue;}
#thursday_14_09_1 input, #thursday_14_09_1 input:hover, #thursday_14_09_1 input:active, #thursday_14_09_1 input:focus{background-image: none !important; background: none; border: none !important; color: #fff !important; padding: 5px 5px 0px 5px !important; text-align: center; width: 94%; margin: 0px; font-size: 13px; font-family: Arial; ${hide_cursor} height:auto; box-shadow:none !important; border-radius:none !important; text-shadow: none !important; font-weight:normal !important; line-height: 13px !important;}
#thursday_14_09_1 input:focus {outline-width: 0;background-image: none !important; background: none !important;}`;

        if(config.position_template=="top_left") {
            position_template += "#wednesday_29_03_0,#wednesday_29_03_2,#wednesday_29_03_3,#wednesday_29_03_5,#wednesday_29_03_4{top: 0px; bottom: auto; left: 0px; right: auto; margin-top: 0px;}";
        } else if(config.position_template=="top_right") {
            position_template += "#wednesday_29_03_0,#wednesday_29_03_2,#wednesday_29_03_3,#wednesday_29_03_5,#wednesday_29_03_4{top: 0px; bottom: auto; margin-top: 0px;}";
        } else if(config.position_template=="bottom_left") {
            position_template += "#wednesday_29_03_0,#wednesday_29_03_2,#wednesday_29_03_3,#wednesday_29_03_5,#wednesday_29_03_4{left: 0px; right: auto; margin-top: 0px;}";
        }

        var css = document.createElement("style");
        css.type = "text/css";
        css.innerHTML = position_template;
        css.id="englishtip_css";
        remove_element(["englishtip_css"]);
        document.body.appendChild(css);
    }

    function create(htmlStr, id) {
        var frag = document.createDocumentFragment(),
            temp = document.createElement('div');
        temp.innerHTML = htmlStr;
        while (temp.firstChild) {
            frag.appendChild(temp.firstChild);
        }
        return frag;
    }

    function create_world(save_action, show_prev_word) {
        init_style();
        remove_element(["wednesday_29_03_0"]);

        var word = show_prev_word ? config.last_word : get_next_world();

        if(!word) {
            //console.log("Wrong word!");
            return false;
        }

        var word_id="", word_text="", word_direction;

        if(config.dir_translation=="source_translation" || config.dir_translation=="source_source") {
            word_text=word.en;
            word_direction="ru";
        } else if(config.dir_translation=="translation_source") {
            word_text=word.ru;
            word_direction="en";
        } else if(config.dir_translation=="random_random") {
            if(Math.round(Math.random())) {
                word_text=word.en;
                word_direction="ru";
            } else {
                word_text=word.ru;
                word_direction="en";
            }
        }

        if(config.template_word=="id_word") {
            word_id=word.id+" - "+word_text;
        } else if(config.template_word=="word") {
            word_id=word_text;
        } else if(config.template_word=="only_id") {
            word_id=word.id;
        }

        var frag = create('<div id="wednesday_29_03_0">' + word_id + '</div>');
        insertAfter(frag,"wednesday_29_03_0");

        if(!document.getElementById('wednesday_29_03_0')){
            return false;
        }

        document.getElementById('wednesday_29_03_0').onmouseenter = function (e) {
            if(document.getElementById('tuesday_03_10_0') || document.getElementById('wednesday_29_03_1')) {
                return false;
            }

            var width_background=document.getElementById("wednesday_29_03_0").offsetWidth;

            var position_left="";
            if(config.position_template=="top_left") {
                position_left = "margin-left: "+(width_background/2)+"px;";
            } else if(config.position_template=="bottom_left") {
                position_left = "margin-left: "+(width_background/2)+"px;";
            }

            var frag;

            if(config.way_traning) {
                frag = `<div id="wednesday_29_03_1"><div id="thursday_14_09_1"><input type="text" value="" id="tuesday_03_10_0" autocomplete="off"></div></div>`;
            } else {
                frag = '<div id="wednesday_29_03_1"><div id="wednesday_29_03_2" style="width:'+(width_background/2)+'px; margin-right:'+(width_background/2)+'px">V</div> <div id="wednesday_29_03_3" style="width:'+(width_background/2)+'px; '+position_left+'">X</div></div>';
            }

            var div = document.getElementById('wednesday_29_03_0');
            remove_element(["wednesday_29_03_1","wednesday_29_03_2"]);
            div.innerHTML += frag;

            if(document.getElementById('tuesday_03_10_0')) {
                var node = document.getElementById('tuesday_03_10_0');
                node.addEventListener('keydown', function(event) {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        var check_word=word[word_direction];
                        // console.log(new String(event.target.value).toLowerCase()+"="+check_word.toLowerCase());
                        var input_text=new String(event.target.value).toLowerCase().trim();
                        if(input_text==check_word.toLowerCase() ||
                            convert_qwerty().fromEn(input_text).toLowerCase()==check_word.toLowerCase() ||
                            convert_qwerty().toEn(input_text).toLowerCase()==check_word.toLowerCase()
                        ) {
                            right_answer();
                            set_focus_on_input();
                        } else {
                            fail_answer(word_direction);
                            set_focus_on_input();
                        }
                    }
                });
            }

            // success
            if(document.getElementById('wednesday_29_03_2')) {
                document.getElementById('wednesday_29_03_2').onclick = function (e) {
                    right_answer();
                }
            }

            // fail
            if(document.getElementById('wednesday_29_03_3')) {
                document.getElementById('wednesday_29_03_3').onclick = function (e) {
                    fail_answer(word_direction);
                }
            }
        }

        var wednesday_tany=document.getElementById("wednesday_29_03_4");
        if (wednesday_tany) {
            var width_background=document.getElementById("wednesday_29_03_0").offsetWidth;
            wednesday_tany.style.minWidth=width_background+"px";
        }

        if(save_action) {
            save_data(2);
        }
    }

    function set_focus_on_input() {
        setTimeout(function () {
            var node = document.getElementById('wednesday_29_03_0');
            eventFire(node,"mouseenter");
            setTimeout(function () {
                if(document.getElementById('tuesday_03_10_0')) {
                    document.getElementById('tuesday_03_10_0').focus();
                }
            },500);
        }, 3000);
    }

    function right_answer() {
        click_fail=0;
        config.left_traning_word = parseInt(config.left_traning_word) - 1;
        if (parseInt(config.left_traning_word) == 0) {
            var next_time_lesson = save_next_time(config.time_break * 60, "default");
            var congratulation = document.getElementById('tuesday_16_05_01');
            if (congratulation) {
                congratulation.innerHTML = '<div id="wednesday_17_05_17_0">Congratulations! The lesson is over. You are attaboy!<br>Next lesson in ' + getFormattedDate(new Date(next_time_lesson)) + '</div>';
            }
            setTimeout(function () {
                remove_element(["wednesday_17_05_17_0", "tuesday_16_05_01"]);
            }, 5000);
        } else if (parseInt(config.left_traning_word) < 0) {
            var tuesday_16_05_01 = document.getElementById('tuesday_16_05_01');
            if (tuesday_16_05_01) {
                config.left_traning_word = get_number_repeat(config, vocabulary) - 1;
            } else {
                config.left_traning_word = 0;
            }
        }

        if (config.left_traning_word != 0) {
            var left_traning_word_id = document.getElementById('tuesday_16_05_02');
            if (left_traning_word_id) left_traning_word_id.innerHTML = config.left_traning_word;
        }

        if(config.stop_next_word==1 && !document.getElementById("tuesday_16_05_01")) {
            click_fail=1;
        }

        time_end();

        var width_background = document.getElementById("wednesday_29_03_0").offsetWidth;

        remove_element(["wednesday_29_03_1", "wednesday_29_03_0"]);

        var translate_word = "";
        if (config.dir_translation == "source_translation") {
            translate_word = config.last_word.ru;
        } else if (config.dir_translation == "translation_source" || config.dir_translation == "source_source") {
            translate_word = config.last_word.en;
        }

        if (translate_word.length > 0) {
            var seccess_word = create('<div id="wednesday_29_03_4" style="min-width:' + width_background + 'px;">' + translate_word + '</div>');
            setTimeout(function () {
                remove_element(["wednesday_29_03_4"]);
            }, 1500);

            insertAfter(seccess_word, "wednesday_29_03_4");

            document.getElementById('wednesday_29_03_4').onclick = function (e) {
                remove_element(["wednesday_29_03_4"]);
            };
        }

        create_world(true, click_fail);
    }

    function fail_answer(word_direction) {
            click_fail = 1;

            var width_background = document.getElementById("wednesday_29_03_0").offsetWidth;
            var translate_word = config.last_word[word_direction];

            var fail_word = create('<div id="wednesday_29_03_5" style="min-width:' + width_background + 'px;">' + translate_word + '</div>');

            setTimeout(function () {
                remove_element(["wednesday_29_03_5"]);
            }, 5000);
            insertAfter(fail_word, "wednesday_29_03_5");

            document.getElementById('wednesday_29_03_5').onclick = function (e) {
                remove_element(["wednesday_29_03_5"]);
            };

            remove_element(["wednesday_29_03_1", "wednesday_29_03_0"]);
            create_world(true, true);

            var delay_traning = config.delay_traning ? parseInt(config.delay_traning) : 0;
            var delay_traning_second = config.delay_traning_second ? config.delay_traning_second : get_constant("delay_traning_second");

            if (delay_traning) {
                var delay_traning_second_ar = delay_traning_second.split("-");
                var tuesday_16_05_01 = document.getElementById('tuesday_16_05_01');
                if (tuesday_16_05_01) {
                    var randomInt = getRandomInt(delay_traning_second_ar[0], delay_traning_second_ar[1]);
                    save_next_time(randomInt, "shot_time");
                }
            }
    }

    function save_next_time(seconds, indicator) {
        var next_time_lesson=new Date().getTime()+(seconds*1000);
        config.time_last_traning=next_time_lesson;

        // update time in rest categories
        var all_category=get_all_category();

        for(var i in all_category) {
            var time=all_category[i].config.time_break?all_category[i].config.time_break:30;
            time=time*60*1000;
            if(indicator!="default") {
                time=seconds*1000;
            }
            all_category[i].config.time_last_traning=new Date().getTime()+time;
        }

        save_data(3);
        return next_time_lesson;
    }

    function get_next_world() {
        var list_elemet=get_list_element();

        if(!list_elemet.length) return 0;

        var ret_element;
        if (!parseInt(config.dir_sorting)) {
            ret_element = list_elemet[0];
        } else if (parseInt(config.dir_sorting) == 1) {
            ret_element = list_elemet[list_elemet.length - 1];
        } else if (parseInt(config.dir_sorting) == 2) {
            ret_element = list_elemet[~~(Math.random() * list_elemet.length)];
        }

        for(var i in vocabulary) {
            if(vocabulary[i].id==ret_element.id) {
                ret_element=vocabulary[i];
                break;
            }
        }

        config.last_word = ret_element;

        return ret_element;
    }

    function get_list_element() {
        var current_iteration = 0;
        var vocabulary_copy=JSON.parse(JSON.stringify(vocabulary));

        var train_learned_words=(config.train_learned_words)?1:0;

        if(!train_learned_words) {
            var lenth=vocabulary_copy.length;
            while(lenth--) {
                if(vocabulary_copy[lenth].status_learn==1) {
                    vocabulary_copy.splice(lenth,1);
                }
            }
        }

        vocabulary_copy.sort(function (a,b) {
            return a.id-b.id;
        });


        if(!config.range_area.end || config.range_area.end<=0) {
            config.range_area.end=vocabulary_copy.length-1;
        }

        var ar_index=get_index(vocabulary_copy,config.range_area.start, config.range_area.end);

        vocabulary_copy=vocabulary_copy.splice(ar_index.start, (config.range_area.end-config.range_area.start)+1);

        vocabulary_copy.map(function (element) {
            if (element.iteration > current_iteration) {
                current_iteration = element.iteration;
            }
        });

        // if iteration not ended
        vocabulary_copy.map(function (element) {
            if (element.iteration == (current_iteration - 1)) {
                current_iteration--;
            }
        });

        // fix smaller iteration
        vocabulary.map(function (element) {
            if (element.iteration < current_iteration) {
                element.iteration=current_iteration;
            }
        });

        var list_elemet = [];
        vocabulary_copy.map(function (element) {
            if (element.iteration == current_iteration) {
                list_elemet.push(element);
            }
        });
        return list_elemet;
    }

    function get_index(vocabulary_copy, start_index, end_index) {
        var obj={start:0};
        for(i in vocabulary_copy) {
            if(vocabulary_copy[i].id==start_index) {
                obj.start=i;
                continue;
            }

            if(obj.stat && obj.end) {
                break;
            }
        }
        return obj;
    }

    function insertAfter(newNode, name) {
        var referenceNode;
        if(name=="tuesday_16_05_01") {
            referenceNode=document.body.childNodes[0];
        } else {
            var sp2 = document.getElementById("memory_traning_zero");
            referenceNode = sp2;
        }

        if(name=="wednesday_29_03_4" || name=="wednesday_29_03_5") {
            referenceNode=referenceNode.nextSibling;
        }
        if(referenceNode) referenceNode.parentNode.insertBefore(newNode, referenceNode);
    }

    function remove_element(id) {
        if (typeof(id) == "string") {
            var element = document.getElementById(id);
            if (element != null) element.parentNode.removeChild(element);
        } else {
            for (var i in id) {
                var element = document.getElementById(id[i]);
                if (element != null) element.parentNode.removeChild(element);
            }
        }
    }

    function time_end() {
        var t = new Date().getTime();
        var time_diff = (t - config.time) / 1000;

        config.time = new Date().getTime();

        // FIX remove not array, remove after clean data in my account
        if(config.last_word.time_reaction) {
            var length=config.last_word.time_reaction.length;
            while(length--) {
               if(typeof config.last_word.time_reaction[length]!="object") {
                   config.last_word.time_reaction.splice(length,1);
               }
            }
        }

        if(!click_fail) {
            if (!config.last_word.time_reaction) {
                config.last_word.time_reaction = [{index: 0, time: time_diff}];
            } else if (time_diff <= 15) {
                config.last_word.time_reaction.push({
                    index: config.last_word.total_iteration,
                    time: time_diff.toFixed(2)
                });
                config.last_word.time_reaction.sort(function (a, b) {
                    return a.index - b.index;
                });
                config.last_word.time_reaction = config.last_word.time_reaction.splice(-50);
            }

            config.last_word.total_iteration++;
            config.last_word.iteration++;
        }

        var time_reaction=config.time_reaction?config.time_reaction:get_constant("time_reaction");
        var time_reps=config.time_reps?config.time_reps:get_constant("time_reps");

        var time_everage=time_reaction_get_everage_value(config.last_word.time_reaction);

        if(time_everage<=time_reaction && config.last_word.total_iteration>time_reps) {
            config.last_word.status_learn=1;
        }
    }

    function save_data(id_callback) {
        var current_time=new Date().getTime();
        var dif_time=current_time-save_vacabulary.time;

        if(user_data) {
            user_data.update_content_script = 1;
        }

        if(save_vacabulary.time==0 || dif_time>=2000) {
            var copy_config=JSON.parse(JSON.stringify(config));

            save_vacabulary.ignore_update=1;
            try {
                chrome.storage.local.get('english_tip', function (result) {
                    if(result && result.hasOwnProperty("english_tip") && result.english_tip) {
                        chrome.storage.local.set({'english_tip': user_data}, function () {
                            setTimeout(function () {
                                save_vacabulary.ignore_update = 0;
                            }, 500);
                        });
                    }
                });
            } catch (err) {
                console.log("MemoryTraning: save_data - error 1");
                location.reload();
            }

            save_vacabulary.time=new Date().getTime();
            save_vacabulary.repeat=1;
        } else if(save_vacabulary.repeat) {
            save_vacabulary.repeat=0;
            setTimeout(function () {
                save_data(0);
            }, 3000);
        }

    }

    function update_data_from_storage() {
        var time_count_data_from_storage=count_data_from_storage;
        chrome.storage.local.get('english_tip', function (all_data) {
            count_data_from_storage++;

            if(!( Object.keys(all_data).length)) {
                user_data=null;
                remove_all_element();
                return 0;
            }

            if(!all_data.english_tip.update_content_script) return false;

            user_data=all_data.english_tip;

            if(!user_data){
                remove_element(["wednesday_29_03_1", "wednesday_29_03_0", "tuesday_16_05_01"]);
                return 1;
            }

            var length_body = document.getElementsByTagName("BODY")[0].innerHTML;
            if(length_body.length<=3000) {
                return false;
            }

            if(!parseInt(user_data.status_enable)) {
                remove_element(["wednesday_29_03_1", "wednesday_29_03_0", "tuesday_16_05_01"]);
                return false;
            }

            all_data=get_current_category("front");

            if (all_data.vocabulary) {
                vocabulary = all_data.vocabulary;
            }

            var one=md5(JSON.stringify(all_data.config)+"-"+all_data.vocabulary.length);

            delete config.last_word;
            delete config.time;

            all_data.vocabulary.map(function (element) {
                if(!element.iteration) {
                    element.iteration = 0;
                }

                if(!element.time_reaction) {
                    element.time_reaction = [];
                }
            });

            config=all_data.config;

            if(config.left_traning_word<=0) {
                remove_element(["tuesday_16_05_01"]);
            }

            if (all_data.vocabulary) {
                vocabulary = all_data.vocabulary;
                create_world(false, false);
            }
        });

        setTimeout(function(){
            if(count_data_from_storage<time_count_data_from_storage+1) {
                console.log("MemoryTraning: save_data - error 2");
                location.reload();
            }
        }, 500);

    }

    function get_number_repeat(config,vocabulary) {
        var list_elemet=get_list_element();

        if(new String(config.number_repeat).toLowerCase()=="all") {
            return list_elemet.length;
        } else {
            var rel_element=0;
            if(config.number_repeat > list_elemet.length) {
                rel_element= list_elemet.length;
            } else {
                rel_element= config.number_repeat;
            }
            return rel_element;
        }
    }

    function convert_qwerty () {
        var map={q:"й",w:"ц",e:"у",r:"к",t:"е",y:"н",u:"г",i:"ш",o:"щ",p:"з","[":"х","{":"Х","]":"ъ","}":"Ъ","|":"/","`":"ё","~":"Ё",a:"ф",s:"ы",d:"в",f:"а",g:"п",h:"р",j:"о",k:"л",l:"д",";":"ж",":":"Ж","'":"э",'"':"Э",z:"я",x:"ч",c:"с",v:"м",b:"и",n:"т",m:"ь",",":"б","<":"Б",".":"ю",">":"Ю","/":".","?":",","@":'"',"#":"№",$:";","^":":","&":"?"};

        function replace (map) {
            return function (str) {
                return str.split('').map(function (i) {
                    return map[i] || i
                }).join('');
            }
        }

        var reverse = { }
        var full = { }

        for (var key in map) {
            var value = map[key]
            full[key] = value
            reverse[value] = key

            var upper = key.toUpperCase()
            if (upper !== key) {
                full[upper] = value.toUpperCase()
                reverse[full[upper]] = upper
            }
        }

        return { fromEn: replace(full), toEn: replace(reverse) }
    }

    function create_traning_zero() {
        if(!document.getElementById("memory_traning_zero")) {
            var frag = create('<div id="memory_traning_zero"></div>');
            document.body.childNodes[document.body.childNodes.length - 1].parentNode.insertBefore(frag, document.body.childNodes[document.body.childNodes.length - 1].nextSibling);
        }
    } 

    function remove_all_element() {
        remove_element(["wednesday_29_03_1", "wednesday_29_03_0", "tuesday_16_05_01", "memory_traning_zero", "englishtip_css"]);
    }
}

function init_memory_traning() {
    chrome.storage.local.get('english_tip', function (data) {
        if(data.hasOwnProperty("english_tip") && data.english_tip) {
            user_data=data.english_tip;

            var carrent_category=get_current_category("front");

            if (carrent_category.vocabulary) {
                EnglishTip(carrent_category.vocabulary, carrent_category.config);
            }
        } else {
            setTimeout(function () {
                init_memory_traning();
            }, 5000);
        }
    });
}

setTimeout(function () {
    init_memory_traning();
},1000);

// Функция для получения сообщений
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.are_you_smart) {
            sendResponse({yes_i_smart: 1});
        }
    }
);