
/*====HIDDING THE FLASHLIGHT ====*/
$('.flashlight').hide();
/*====FLASHLIGHT FOLLOW MOUSE====*/
$(".zoneswitch").click(function(){
   $('body').css("background-color","black");
   $('.flashlight').fadeIn('5000'); 
  document.body.style.cursor = 'none';
  
 $(".zoneswitch").click(function(){
    $('body').css("background-color","white");
    $('.flashlight').hide();
    document.body.style.cursor = 'default';
  });
});
$("body").mousemove(function(e){
$('.flashlight').css('top', e.clientY-150).css('left', e.clientX-150);
});


