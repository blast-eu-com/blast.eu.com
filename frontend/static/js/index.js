
function goto_home( obj ) {

    $.get( "/home.html", function( data ) { 
        $("#global_display").html( data ) ;
    } )
}
 