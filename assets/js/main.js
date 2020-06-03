
$(".travel-form").on("submit", e => {
  e.preventDefault();

  const submitButton = $(".travel-form button");
  const title = $(".modal-title");
  const formSuccess = $(".form-success");
  const formErrors = $(".form-error");
  const errors = $(formErrors, ".modal-errors");
  const modalContainer = $("#reportJourneyModal");

  submitButton.prop("disabled", true);
  document.cookie = "memberId=" + $("#smartcard").val() + ";SameSite=Strict";

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
  $(".travel-form button").prop("disabled", !$("#confirm").prop("checked"));
});
