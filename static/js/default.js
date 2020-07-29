$( document ).ready(function() {
  $('.testy').click(function(event){
    event.preventDefault();
    console.log($(this).prop('href'));
    history.pushState({}, "test", $(this).prop('href'));
  });

  $(window).bind("popstate", function() {
    console.log($(document.location).prop('href'));
  });
});
