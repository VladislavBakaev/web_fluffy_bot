var modal = $modal({
    title: 'Create new movement',
    content: '<p>Name: </p><input id="movement-name-field" type="text">',
    footerButtons: [
      { class: 'modal__btn', text: 'ОК', handler: 'modal_handler_ok' }
    ]
});

var pos_slider = $("#position").find('input')
var vel_slider = $("#velocity").find('input')
var slope_slider = $("#slope").find('input')
var delay_slider = $("#time-delay").find('input')

var movement_queue = [];
var emotion_name = '';

var cur_position = [0, 0, 0, 0, 0]
var cur_velocity = [125,125,125,125,125]
var cur_slope = [125,125,125,125,125]

$(document).ready(function(){ 
    $('.slider-range').trigger("change");
    $('#create-div :input').attr('disabled', true)
    $('#new-movement-but').attr('disabled', false)
})
$('.slider-range').on("change mousemove touchmove", update_slider_value_field);
$('.slider-range').on("change mousemove touchmove", move_to_current_pose);

function update_slider_value_field() {
    var val = $(this).val();
    var field = $(this).parent().find('.value-field');
    var current_pose = (val - $(this)[0].min)/($(this)[0].max - $(this)[0].min)
    field.html(val);
    field.css('transform',`translateX(${$(this).width()*current_pose+field.width()/2}px)`)
}

function move_to_current_pose(){
    let position = [];
    let velocity = [];
    let slope = [];

    for(i=0; i < pos_slider.length; i++){
        position.push(parseInt(pos_slider[i].value))
        velocity.push(parseInt(vel_slider[i].value))
        slope.push(parseInt(slope_slider[i].value))
    }
    let euc = euclidean_distance(position, velocity, slope)
    
    if(euc > 5){
        cur_position = position.slice()
        cur_velocity = velocity.slice()
        cur_slope = slope.slice()
        let cmd = get_movement_json()
        let cmd_dict = {'emotion':emotion_name,
                        'frame_list':[cmd]}
        send_movement(cmd_dict)
    }
}

function get_movement_json(){
    let target_pos = [];
    let target_vel = [];
    let target_slope = [];
    let time_delay = 0;

    target_pos = cur_position.slice()
    target_vel = cur_velocity.slice()
    target_slope = cur_slope.slice()
    for(i=0; i < target_pos.length; i++){
        target_pos[i] = Math.PI + target_pos[i]*Math.PI/180
    }

    let cmd = {
                "delay": time_delay,
                "num": 0,
                "pos": target_pos,
                "slope": target_slope,
                "vel": target_vel
              }
    return cmd
}

function send_movement(cmd){
    $.ajax({
        type: "POST",
        url: "/api/movement/start",
        data: JSON.stringify(cmd),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(data){console.log(data);},
        failure: function(errMsg) {
            console.log(errMsg);
        }
    });
}


function save_emotion(){

    var current_seq = get_sequence_movement()

    var current_movement = {'emotion':emotion_name,
                           'frame_list':current_seq}

    $.ajax({
        type: "POST",
        url: "/api/emotion/save",
        data: JSON.stringify(current_movement),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(data){console.log(data);},
        failure: function(errMsg) {
            console.log(errMsg);
        }
    });
}

function euclidean_distance(pos, vel, slope){
    let euc = 0;
    for(i in pos){
        euc += (pos[i] - cur_position[i])**2
        euc += (vel[i] - cur_velocity[i])**2
        euc += (slope[i] - cur_slope[i])**2
    }
    return Math.sqrt(euc)
}

function modal_handler_ok(){
    modal.hide()
    emotion_name = $("#movement-name-field").val()
    $("#movement-name-field").val('')
    $('.emotion-name-field').html(`Emotion name: ${emotion_name}`)
    $('#create-div :input').attr('disabled', false)
    $('#queue-movement').html('')
    movement_queue = []
}

function save_pose_in_queue(){
    let cur_state = get_movement_json()
    cur_state['delay'] = parseFloat(delay_slider.val())
    cur_state['num'] = movement_queue.length
    movement_queue.push(cur_state);
    $('#queue-movement').append(`<li>${movement_queue.length}</li>`)
    $( "#queue-movement li:last-child" ).click(change_element_select)
}

function play_queue(){

    var current_seq = get_sequence_movement()

    var current_movement = {'emotion':emotion_name,
                           'frame_list':current_seq}

    send_movement(current_movement)
}

function get_sequence_movement(){
    let cur_queue = [];
    let seq = $( "#queue-movement li.selected" )
    for (let i =0; i< seq.length; i++){
        let num = parseInt(seq[i].innerText)
        let movement = find_movement_by_num(num-1);
        // movement['num'] = i
        cur_queue.push(movement);
    }

    return cur_queue
}

function find_movement_by_num(num){
    let movement = {}
    for(let i=0; i < movement_queue.length; i++){
        if(movement_queue[i]['num'] == num){
            movement = movement_queue[i]
        }
    }
    return movement
}