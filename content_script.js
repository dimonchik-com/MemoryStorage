function EnglishTip() {
    var vocabulary = [{"id":"441","en":"neighbor","ru":"сосед"}, {"id":"442","en":"they","ru":"они"}, {"id":"443","en":"gray","ru":"серый"}, {"id":"444","en":"pray","ru":"молиться"}, {"id":"445","en":"survey","ru":"обзор"}, {"id":"446","en":"convey","ru":"передовать, доносить"}, {"id":"447","en":"ceiling","ru":"потолок"}, {"id":"448","en":"either","ru":"один из двух, либо, тоже"}, {"id":"449","en":"eye","ru":"глаза"}, {"id":"450","en":"height","ru":"высота"}, {"id":"451","en":"heir","ru":"наследник"}, {"id":"452","en":"key","ru":"ключ"}, {"id":"453","en":"neither","ru":"никто"}, {"id":"454","en":"perceive","ru":"воспринимать"}, {"id":"455","en":"receive","ru":"получать"}, {"id":"456","en":"seize","ru":"захватить"}, {"id":"457","en":"their","ru":"их"}, {"id":"458","en":"foreign","ru":"иностранный"}, {"id":"459","en":"hockey","ru":"хоккей"}, {"id":"460","en":"money","ru":"деньги"}, {"id":"461","en":"monkey","ru":"обезьяна"}];

    vocabulary.map(function (element) {
        element.iteration = 0;
        element.time_reaction = [];
    });

    var config = {sorting: 0, time: 0, last_word: null, range_area:{start:451, end:460}};
    var save_vacabulary={time:0,repeat:1};

    check_and_update_version();

    // global observer
    chrome.storage.onChanged.addListener(function (changes, namespace) {
        update_data_from_storage();
    });

    setInterval(function () {
        var main_id = document.getElementById('wednesday_29_03_0');
        if (main_id == null) {
            create_world();
        }
    }, 1000);

    function init_style() {
        var englishtip_css = document.getElementById('wednesday_29_03_0');

        if(englishtip_css) {
            return 1;
        }

        var css = document.createElement("style");
        css.type = "text/css";
        css.innerHTML = `
#wednesday_29_03_0{ position:fixed; right:0px; bottom:0px; padding:5px 0px 5px 0px; z-index: 100000000000000000; background:blue; color: #fff; margin:5px 0px 5px 0; font-size:13px; font-family:Arial; width: 80px; text-align: center;}
#wednesday_29_03_2{position:fixed; right:0px; bottom:0px; padding:5px 0px 5px 0px; z-index: 100000000000000000; background:green; color: #fff; margin:5px 40px 5px 0px; font-size:13px; font-family:Arial; width: 40px; text-align: center; cursor:pointer;}
#wednesday_29_03_2:hover{-moz-box-shadow:inset 0 0 5px #000000; -webkit-box-shadow: inset 0 0 5px #000000; box-shadow:inset 0 0 5px #000000;}
#wednesday_29_03_3:hover{-moz-box-shadow:inset 0 0 10px red; -webkit-box-shadow: inset 0 0 10px red; box-shadow:inset 0 0 10px red;}
#wednesday_29_03_3{position:fixed; right:0px; bottom:0px; padding:5px 0px 5px 0px; z-index: 100000000000000000; background:black; color: #fff; margin:5px 0px 5px 0; font-size:13px; font-family:Arial; width: 40px; text-align: center; cursor:pointer;}
#wednesday_29_03_4{position: fixed; right: 0px; bottom: 0px; padding: 5px 0px 5px 0px; z-index: 100000000000000000; background: darkgreen; color: #fff; margin: 5px 0px 5px 0; font-size: 13px; font-family: Arial; min-width: 80px; text-align: center; cursor: pointer;}
#wednesday_29_03_5{position: fixed; right: 0px; bottom: 0px; padding: 5px 0px 5px 0px; z-index: 100000000000000000; background: red; color: #fff; margin: 5px 0px 5px 0; font-size: 13px; font-family: Arial; min-width: 80px; text-align: center; cursor: pointer;}

`;
        css.id="englishtip_css";
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

    function create_world() {
        init_style();
        remove_element(["wednesday_29_03_0"]);
        config.time = new Date().getTime();
        var word = get_next_world();
        var frag = create('<div id="wednesday_29_03_0">' + word.id + '</div>');
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
            var frag = create('<div id="wednesday_29_03_1"><div id="wednesday_29_03_2">V</div> <div id="wednesday_29_03_3">X</div></div>');
            insertAfter(document.body.childNodes[0], frag);

            // success
            document.getElementById('wednesday_29_03_2').onclick = function (e) {
                time_end();
                show_on_element = 1;
                remove_element(["wednesday_29_03_1", "wednesday_29_03_0"]);

                var seccess_word=create('<div id="wednesday_29_03_4">'+config.last_word.en+'</div>');
                setTimeout(function () {
                    remove_element(["wednesday_29_03_4"]);
                }, 1000);
                insertAfter(document.body.childNodes[0], seccess_word);

                create_world();
            }

            // fail
            document.getElementById('wednesday_29_03_3').onclick = function (e) {
                show_on_element = 1;

                var fail_word=create('<div id="wednesday_29_03_5">'+config.last_word.en+'</div>');
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

        save_data();
    }

    function get_next_world() {
        var current_iteration = 0;

        var vocabulary_copy=JSON.parse(JSON.stringify(vocabulary));

        function get_index(start_index, end_index) {
            var obj={start:0};
            for(i in vocabulary) {
                if(vocabulary[i].id==start_index) {
                    obj.start=i;
                    continue;
                }

                if(obj.stat && obj.end) {
                    break;
                }
            }
            return obj;
        }

        var ar_index=get_index(config.range_area.start, config.range_area.end);
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

        var list_elemet = [];
        vocabulary_copy.map(function (element) {
            if (element.iteration == current_iteration) {
                list_elemet.push(element);
            }
        });

        var ret_element;
        if (config.sorting == 0) {
            ret_element = list_elemet[0];
        } else if (config.sorting == 1) {
            ret_element = list_elemet[~~(Math.random() * list_elemet.length)];
        } else if (config.sorting == 2) {
            ret_element = list_elemet[ret_element.length - 1];
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
        config.last_word.time_reaction.push(time_diff.toFixed(2));
        config.last_word.iteration++;
    }

    function update_data_from_storage() {
        chrome.storage.sync.get('vocabulary', function (data) {
            if (data.vocabulary) {
                vocabulary = data.vocabulary;
            }
            create_world();
        });
    }
    
    function save_data() {
        var current_time=new Date().getTime();
        var dif_time=current_time-save_vacabulary.time;

        if(save_vacabulary.time==0 || dif_time>=2000) {
            chrome.storage.sync.set({'vocabulary': vocabulary}, function () {
                console.log('Vocabulary saved');
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

    function check_and_update_version() {
        chrome.storage.sync.get('vocabulary_version', function (data) {
            if (!data.vocabulary_version) {
                chrome.storage.sync.set({'vocabulary_version': vocabulary.length}, function () {

                });
            } else if(data.vocabulary_version!=vocabulary.length){
                chrome.storage.sync.set({'vocabulary_version': vocabulary.length});
                chrome.storage.sync.set({'vocabulary': vocabulary}, function () {
                    console.log('Overwrite completed');
                });
            } else {
                update_data_from_storage();
            }
        });
    }

}
EnglishTip();