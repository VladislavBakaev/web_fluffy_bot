$(document).ready(function (){
    update_emotion_list()
    $("#play-b").click(update_emotion_list)
});

function update_emotion_list(){
    $.get( "/api/emotion/list", function( data ) {
        $("#move-list").html('')
        names = JSON.parse(data)['emotions']
        for(i in names){
            $("#move-list").append(`<li>${names[i]}</li>`)
        }
        $("#move-list > li").on("click touch" ,select_movement)
    });
}

function play_emotion(name){
    $.get(`/api/emotion/${name}/start`, function( data ) {
        console.log(data)
    });
}

function select_movement(){
    let name = $(this).html();
    play_emotion(name);
}