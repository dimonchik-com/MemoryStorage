var user_data;

function EnglishTip(vocabulary, config) {
    
    // update data from storage
    chrome.storage.onChanged.addListener(function (changes, namespace) {
        if(save_vacabulary.ignore_update) {
            save_vacabulary.ignore_update=0;
            return false;
        }

        update_data_from_storage();
    });

    var save_vacabulary={time:0,repeat:1, ignore_update:0};

    setInterval(function () {
        var main_id = document.getElementById('wednesday_29_03_0');

        var length_body = document.getElementsByTagName("BODY")[0].innerHTML;
        if(length_body.length<=3000) {
            return false;
        }

        if (main_id == null && vocabulary && parseInt(user_data.status_enable)) {
            create_world();
        }

        // check current time
        var current_timestamp=new Date().getTime()+(config.time_break*60*1000);

        if(config.time==undefined) {
            config.time=new Date().getTime();
        }

        if(parseInt(user_data.status_enable) &&
          (current_timestamp>config.time || parseInt(config.left_traning_word)>0) &&
          (new Date().getTime()>config.time_last_traning || config.time_last_traning==undefined) &&
            new String(config.time_break).length>=1
        ) {
            if(!document.getElementById('tuesday_16_05_01')) {
                if(parseInt(config.left_traning_word)<=0 || config.left_traning_word==undefined) {
                    config.left_traning_word=get_number_repeat(config,vocabulary);
                }
                var black_display = create('<div id="tuesday_16_05_01"><div>Time to traning: left <span id="tuesday_16_05_02">'+config.left_traning_word+'</span> words</div></div>');
                insertAfter(document.body.childNodes[0], black_display);
            } else if(parseInt(config.left_traning_word)>=1) {
                var left_traning_word_id = document.getElementById('tuesday_16_05_02');
                if(left_traning_word_id) left_traning_word_id.innerHTML=config.left_traning_word;
            }
        } else {
            remove_element(["tuesday_16_05_01"]);
        }
    }, 1000);

    function init_style() {
        var englishtip_css = document.getElementById('wednesday_29_03_0');

        var position_template = `
#wednesday_29_03_0{ position:fixed; right:0px; bottom:0px; padding:5px 5px 5px 5px; z-index: 100000000000000000; background:blue; color: #fff; margin:5px 0px 1px 0; font-size:13px; font-family:Arial; min-width: 80px; text-align: center;}
#wednesday_29_03_2{position:fixed; right:0px; bottom:0px; padding:5px 0px 5px 0px; z-index: 100000000000000000; background:green; color: #fff; margin:5px 40px 1px 0px; font-size:13px; font-family:Arial; width: 40px; text-align: center; cursor:pointer;}
#wednesday_29_03_2:hover{-moz-box-shadow:inset 0 0 5px #000000; -webkit-box-shadow: inset 0 0 5px #000000; box-shadow:inset 0 0 5px #000000;}
#wednesday_29_03_3:hover{-moz-box-shadow:inset 0 0 10px red; -webkit-box-shadow: inset 0 0 10px red; box-shadow:inset 0 0 10px red;}
#wednesday_29_03_3{position:fixed; right:0px; bottom:0px; padding:5px 0px 5px 0px; z-index: 100000000000000000; background:black; color: #fff; margin:5px 0px 1px 0; font-size:13px; font-family:Arial; width: 40px; text-align: center; cursor:pointer;}
#wednesday_29_03_4{position: fixed; right: 0px; bottom: 0px; padding: 5px 5px 5px 5px; z-index: 100000000000000000; background: darkgreen; color: #fff; margin: 5px 0px 1px 0; font-size: 13px; font-family: Arial; min-width: 80px; text-align: center; cursor: pointer;}
#wednesday_29_03_5{position: fixed; right: 0px; bottom: 0px; padding: 5px 5px 5px 5px; z-index: 100000000000000000; background: red; color: #fff; margin: 5px 0px 1px 0; font-size: 13px; font-family: Arial; min-width: 80px; text-align: center; cursor: pointer;}
#tuesday_16_05_01{position: fixed; background: black; width: 100%; height: 100%; top: 0px; z-index: 100000000; opacity: .6; display:table-cell; vertical-align:middle;}
#tuesday_16_05_01 div{color: red; position: absolute; top: 50%; width: 100%; text-align: center; font-size: 21px; font-weight: bold;}
#wednesday_17_05_17_0{color:green !important;}`;

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

    var show_on_element = 0;

    function create_world(save_action) {
        init_style();
        remove_element(["wednesday_29_03_0"]);
        var word = get_next_world();

        if(!word) {
            console.log("Wrong word!");
            return false;
        }

        var word_id=""; var word_text="";

        if(config.dir_translation=="source_translation" || config.dir_translation=="source_source") {
            word_text=word.en;
        } else if(config.dir_translation=="translation_source") {
            word_text=word.ru;
        }

        if(config.template_word=="id_word") {
            word_id=word.id+" - "+word_text;
        } else if(config.template_word=="word") {
            word_id=word_text;
        } else if(config.template_word=="only_id") {
            word_id=word.id;
        }

        var frag = create('<div id="wednesday_29_03_0">' + word_id + '</div>');
        document.body.insertBefore(frag, document.body.childNodes[0]);

        document.getElementById('wednesday_29_03_0').onmouseout = function (e) {
            show_on_element = 0;
        }

        document.getElementById('wednesday_29_03_0').onclick = function (e) {
            show_on_element = 0;
            document.getElementById('wednesday_29_03_0').onmouseover();
        }

        document.getElementById('wednesday_29_03_0').onmouseover = function (e) {
            if (show_on_element) return 1;
            show_on_element = 1;

            var width_background=document.getElementById("wednesday_29_03_0").offsetWidth;

            var position_left="";
            if(config.position_template=="top_left") {
                position_left = "margin-left: "+(width_background/2)+"px;";
            } else if(config.position_template=="bottom_left") {
                position_left = "margin-left: "+(width_background/2)+"px;";
            }

            var frag = create('<div id="wednesday_29_03_1"><div id="wednesday_29_03_2" style="width:'+(width_background/2)+'px; margin-right:'+(width_background/2)+'px">V</div> <div id="wednesday_29_03_3" style="width:'+(width_background/2)+'px; '+position_left+'">X</div></div>');
            insertAfter(document.body.childNodes[0], frag);

            // success
            document.getElementById('wednesday_29_03_2').onclick = function (e) {
                config.left_traning_word--;
                if(config.left_traning_word==0) {
                    var next_time_lesson=new Date().getTime()+(config.time_break*60*1000);
                    var congratulation = document.getElementById('tuesday_16_05_01');
                    congratulation.innerHTML='<div id="wednesday_17_05_17_0">Congratulations! The lesson is over. You are attaboy!<br>Next lesson in '+new Date(next_time_lesson)+'</div>';
                    setTimeout(function () {
                        config.time_last_traning=next_time_lesson;
                        save_data();
                    },5000);
                }

                if(config.left_traning_word!=0) {
                    var left_traning_word_id = document.getElementById('tuesday_16_05_02');
                    if(left_traning_word_id) left_traning_word_id.innerHTML = config.left_traning_word;
                }

                time_end();
                show_on_element = 1;

                var width_background=document.getElementById("wednesday_29_03_0").offsetWidth;

                remove_element(["wednesday_29_03_1", "wednesday_29_03_0"]);

                var translate_word="";
                if(config.dir_translation=="source_translation") {
                    translate_word=config.last_word.ru;
                } else if(config.dir_translation=="translation_source" || config.dir_translation=="source_source") {
                    translate_word=config.last_word.en;
                }

                if(translate_word.length>0) {
                    var seccess_word = create('<div id="wednesday_29_03_4" style="min-width:' + width_background + 'px;">' + translate_word + '</div>');
                    setTimeout(function () {
                        remove_element(["wednesday_29_03_4"]);
                    }, 1000);
                    insertAfter(document.body.childNodes[0], seccess_word);
                }
                create_world();
            }

            // fail
            document.getElementById('wednesday_29_03_3').onclick = function (e) {
                show_on_element = 1;

                var width_background=document.getElementById("wednesday_29_03_0").offsetWidth;

                var translate_word="";
                if(config.dir_translation=="source_translation") {
                    translate_word=config.last_word.ru;
                } else if(config.dir_translation=="translation_source" || config.dir_translation=="source_source") {
                    translate_word=config.last_word.en;
                }

                var fail_word=create('<div id="wednesday_29_03_5" style="min-width:'+width_background+'px;">'+translate_word+'</div>');
                setTimeout(function () {
                    remove_element(["wednesday_29_03_5"]);
                }, 2500);
                insertAfter(document.body.childNodes[0], fail_word);

                remove_element(["wednesday_29_03_1", "wednesday_29_03_0"]);
                create_world();
            }

            document.getElementById('wednesday_29_03_1').onmouseout = function (e) {
                var e = event.toElement || event.relatedTarget;

                if (e != null) {
                    if (e.parentNode == this || e == this) {
                        return;
                    }
                }
                remove_element("wednesday_29_03_1");
                show_on_element = 0;
            }
        }

        var wednesday_tany=document.getElementById("wednesday_29_03_4");
        if (wednesday_tany) {
            var width_background=document.getElementById("wednesday_29_03_0").offsetWidth;
            wednesday_tany.style.minWidth=width_background+"px";
        }

        if(save_action==undefined) {
            save_data();
        }
    }

    function get_next_world() {
        var list_elemet=get_list_element();
        
        var ret_element;
        if (config.dir_sorting == 0) {
            ret_element = list_elemet[0];
        } else if (config.dir_sorting == 1) {
            ret_element = list_elemet[list_elemet.length - 1];
        } else if (config.dir_sorting == 2) {
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

        vocabulary_copy.sort(function (a,b) {
            return a.id-b.id;
        });

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

    function insertAfter(referenceNode, newNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
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

        if(!config.last_word.time_reaction) {
            config.last_word.time_reaction = [{index:0, time:time_diff}];
        } else if(time_diff<=15) {
            config.last_word.time_reaction.push({index:config.last_word.total_iteration, time:time_diff.toFixed(2)});
            config.last_word.time_reaction.sort(function(a,b){
                return a.index-b.index;
            });
            config.last_word.time_reaction=config.last_word.time_reaction.splice(-50);
        }

        config.last_word.iteration++;
        config.last_word.total_iteration++;
    }
    
    function save_data() {
        var current_time=new Date().getTime();
        var dif_time=current_time-save_vacabulary.time;

        if(save_vacabulary.time==0 || dif_time>=2000) {

            var copy_config=JSON.parse(JSON.stringify(config));

            save_vacabulary.ignore_update=1;

            chrome.storage.local.set({'english_tip': user_data}, function() {

            });

            save_vacabulary.time=new Date().getTime();
            save_vacabulary.repeat=1;
        } else if(save_vacabulary.repeat) {
            save_vacabulary.repeat=0;
            setTimeout(function () {
                save_data();
            }, 3000);
        }
    }

    function update_data_from_storage() {
        chrome.storage.local.get('english_tip', function (all_data) {
            user_data=all_data.english_tip;

            var length_body = document.getElementsByTagName("BODY")[0].innerHTML;
            if(length_body.length<=3000) {
                return false;
            }

            if(!parseInt(user_data.status_enable)) {
                remove_element(["wednesday_29_03_1", "wednesday_29_03_0", "tuesday_16_05_01"]);
                return false;
            }

            all_data=get_current_category();

            if (all_data.vocabulary) {
                vocabulary = all_data.vocabulary;
            }

            var one=md5(JSON.stringify(all_data.config)+"-"+all_data.vocabulary.length);

            delete config.last_word;
            delete config.time;

            // var two=md5(JSON.stringify(config)+"-"+vocabulary.length);
            //
            // if(one!=two) {
            //     all_data.vocabulary.map(function (element) {
            //         element.iteration = 0;
            //     });
            // }

            all_data.vocabulary.map(function (element) {
                if(!element.iteration) {
                    element.iteration = 0;
                }

                if(!element.time_reaction) {
                    element.time_reaction = [];
                }
            });

            config=all_data.config;
            if (all_data.vocabulary) {
                vocabulary = all_data.vocabulary;
                create_world(false);
            }
        });
    }

    function get_number_repeat(config,vocabulary) {
        if(new String(config.number_repeat).toLowerCase()=="all") {
            var list_elemet=get_list_element();
            return list_elemet.length;
        } else {
            return config.number_repeat;
        }
    }
    
}

chrome.storage.local.get('english_tip', function (data) {
    user_data=data.english_tip;

    var carrent_category=get_current_category();

    if (carrent_category.vocabulary) {
        EnglishTip(carrent_category.vocabulary, carrent_category.config);
    }
});

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