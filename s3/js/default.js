
$( document ).ready(function() {
  // Defaults
  var typingSpeed = 100; // ms per char

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

  // Two different behaviors; base.html and welcome.html
  if ($("#target").length) {
    // base.html
    // When the page first loads, load whatever page was passed in as {{ target }}
    target = $("#target").text();
    history.pushState({}, "", target);
    internalNav(target);
  }
  else {
    // welcome.html
    // Render console with typing animation
    var contentArray = $("#template-content").children().toArray();
    renderConsole(null, contentArray, [], typingSpeed); 
  }


  /// Functions for the typewriter effect in the pseudo-console
  function consoleNewline() {
    // Add new line's element
    $("#console").append("<span></span>");

    var currentLine = $("#console").children().last();
    // Add newline symbol
    var contentTarget = $("#template-newline").clone().attr("id", "").appendTo(currentLine);
    // Move cursor, or add one if it doesn't exist
    if($("#cursor").length) {
      $("#cursor").appendTo(currentLine);
    }
    else {
      currentLine.append($("#template-cursor").clone().attr("id", "cursor"));
    }
    return contentTarget
  }

  function consoleNewElement(contentTarget, element) {
    // If the new element has the newline class, add a new line
    if(element.is(".newline")) {
      var contentTarget = consoleNewline();
    }
    // Remove classes from element
    element.removeClass("typewriter newline");
    element.data("delay", null);
    // Empty out text
    element.text("");
    // Add this element after old target
    contentTarget.after(element);

    return element;
  }

  function renderConsole(contentTarget, contentArray, textArray, delay) {
    // If the content array is empty and there's no more target text, exit
    if(contentArray.length == 0 && textArray.length == 0) {
      // Make sure cursor is fixed before exiting
      $("#cursor").addClass("blink");
      return
    }
    // If textArray is empty, we need a new element
    if(textArray.length == 0) {
      // Pull element out of the content array
      newElement = $(contentArray.shift());

      // Pull out text and delay
      delay = newElement.data("delay");
      if(delay === undefined) {
        delay = typingSpeed;
      }

      if(newElement.is(".typewriter")) {
        textArray = newElement.text().split("");
      }
      else {
        // This is "" sometimes; that's ok.
        textArray = [newElement.text()];
      }
      // Make new element
      contentTarget = consoleNewElement(contentTarget, newElement);
    }
    // If the delay is less than 750ms, disable the cursor blink
    if(delay < 750) {
      $("#cursor").removeClass("blink");
    }
    else {
      $("#cursor").addClass("blink");
    }
    // Add an element of textArray to the contentTarget, then render more after a delay
    contentTarget.append(textArray.shift());
    setTimeout(renderConsole, delay, contentTarget, contentArray, textArray, delay); // last 3 args are sent to the function 
  }

});
