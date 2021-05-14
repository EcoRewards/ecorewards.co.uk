
$(".travel-form").on("submit", e => {
  e.preventDefault();

  const submitButton = $(".travel-form button[type=submit]");
  const title = $(".modal-title");
  const formSuccess = $(".form-success");
  const formErrors = $(".form-error");
  const errors = $(formErrors, ".modal-errors");
  const modalContainer = $("#reportJourneyModal");

  submitButton.prop("disabled", true);
  document.cookie = "memberId=" + $("#smartcard").val() + ";SameSite=Strict; max-age=31536000; path=/;";

  const url = atob(["aHR0cHM6", "Ly9hcGkuZWN", "vcmV3YXJkcy5", "jby51ay9qb3VybmV5"].join(""));

  $.ajax({
    url,
    type: "POST",
    data: new FormData($(".travel-form")[0]),
    processData: false,
    contentType: false,
    success: (data, status) => {
      formErrors.hide();
      formSuccess.show();
      title.text("Success");
    },
    error: (xhr, desc, err) => {
      formErrors.show();
      formSuccess.hide();
      title.text("Error");
      if (xhr.status === 400) {
        errors.html(xhr.responseJSON.data.errors.map(e => e + "<br/>"));
      }
      else {
        errors.text("Please enter your Eco Rewards ID or registered card number");
      }
    },
    complete: () => {
      submitButton.prop("disabled", false);
      modalContainer.modal();
    }
  });
});

$(".travel-form").ready(() => {
  const cookies = document.cookie.split(";").reduce((index, cookie) => {
    const [key, value] = cookie.split("=");
    index[key.trim()] = value;

    return index;
  }, {});

  if (cookies["memberId"]) {
    $("#smartcard").val(cookies["memberId"]);
  }
});

$("#confirm").change(() => {
  $(".travel-form button[type=submit]").prop("disabled", !$("#confirm").prop("checked"));
});

$("#date").ready(() => {
  setDate();
  setInterval(setDate, 86400);
})

function setDate() {
  const now = new Date();
  const eightDaysAgo = new Date(now.getTime() - 604800000);

  $("#date")
    .prop("min", eightDaysAgo.toJSON().substr(0, 10))
    .prop("max", now.toJSON().substr(0, 10));
}

// Scroll
function goToByScroll(id){
  $('html,body').animate({
      scrollTop: $(id).offset().top
  }, 700);
  scrolled = true;
}

// Toggle Nav Menu
function toggleMenu() {
  $(".js-nav-toggle").attr('aria-expanded', function (i, attr) {
    return attr == 'true' ? 'false' : 'true'
  });
  $(".js-nav-toggle").toggleClass("is-active");
  $(".js-nav").toggleClass("is-open");
}

// Click nav toggle
$(".js-nav-toggle").click(function() {
  toggleMenu();
});

// Scroll to section of page
$(".js-nav-link").click(function(e) {
  e.preventDefault();
  toggleMenu();
  var link = $(this).attr('href');
  goToByScroll(link);
});
