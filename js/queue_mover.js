$(function() {
    $( "#queue-movement" ).sortable();
    $( "#queue-movement" ).disableSelection();
});


function change_element_select(){
    if ($(this).hasClass('selected')){
        $(this).removeClass('selected')
    }
    else{
        $(this).addClass('selected')
    }
}