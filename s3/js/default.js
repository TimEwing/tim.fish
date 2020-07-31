
$( document ).ready(function() {
  // When internal navigation links are clicked, only update the content of the 
  // page while allowing the forward and back buttons to continue working
  $(".internal-nav").click(function(event){
    event.preventDefault();
    linkHREF = $(this).prop("href");
    currentHREF = $(document.location).prop("href");
    if(linkHREF != currentHREF) {
      history.pushState({}, "", linkHREF);
      internalNav(linkHREF);
    }
  });

  $(window).bind("popstate", function() {
    internalNav($(document.location).prop("href"));
  });

  // Replace the content div with content retrieved by ajax
  function internalNav(url) {
    $.ajax({
      url: url,
      method: "GET",
      dataType: "json", // Parse response as json
      success: function(data) {
        console.log(data);
        $("#title").prop("innerHTML", data.title);
        $("#content").prop("innerHTML", data.content);
      },
      error: function(data) {
        console.log(data);
        $("#content").prop("innerHTML", data.responseText);
      },
    });
  }

  // When the page first loads, load whatever page was passed in as {{ target }}
  target = $("#target").text();
  history.pushState({}, "", target);
  internalNav(target);
});
