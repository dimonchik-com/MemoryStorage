# MemoryTraining
The best Google Chrome extension for memory training. To be smart is easy!
### Data structure
```
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
                time_break:get_constant("time_break"),
                number_repeat:get_constant("number_repeat"),
                position_template: "bottom_right",
                time_last_traning:new Date().getTime(),
                delay_traning:get_constant("delay_traning"),
                delay_traning_second:get_constant("delay_traning_second"),
                way_traning:get_constant("way_traning"),
                training_mode:1,
                stop_next_word:0
            },
            category:[

            ]
        }
    ],
    top_id:3,
    time_last_activity:new Date().getTime(),
    update_content_script:1,
    status_enable:1
};
```
