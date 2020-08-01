
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
    // We need the hostname to construct URL objects
    var url = new URL(url, window.location.origin);
    // Load page content
    $.ajax({
      url: url.pathname,
      method: "GET",
      dataType: "json", // Parse response as json
      success: function(data) {
        console.log(data);
        $("#title").prop("innerHTML", data.title);
        $("#content").prop("innerHTML", data.content);
      },
      error: function(data) {
        $("#content").prop("innerHTML", data.responseText);
      },
    });
    // Set active tab
    $("#navbarNav").find("a").removeClass("active");
    $("#navbarNav").find("a[href=\""+url.pathname+"\"]").addClass("active");
  }

  // When the page first loads, load whatever page was passed in as {{ target }}
  target = $("#target").text();
  console.log("target: "+target); 
  history.pushState({}, "", target);
  internalNav(target);
});
