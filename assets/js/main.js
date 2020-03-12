
let group = "";

$('a[data-toggle="modal"]').on("click", function (e) {
  group = $(this).attr("data-group");
});

$('.modal .btn-primary').on("click", function() {
  const data = {
    smartcard: $("#smartcard").val(),
    defaultTransportMode: $("#defaultTransportMode").val(),
    previousTransportMode: $("#previousTransportMode").val(),
    defaultDistance: $("#distance").val(),
    group: group
  };

  $.ajax({
    type: "POST",
    url: "https://api.ecorewards.co.uk/member",
    data: data,
    success: () => {
      $(".modal .form-body").addClass("d-none");
      $(".modal .btn-primary").addClass("d-none");
      $(".modal .form-success").removeClass("d-none");
      $(".modal .btn-secondary").text("Close");
    }
  });
});

$(".modal input, .modal select").on("change", function() {
  const smartcard = $("#smartcard").val();
  const defaultTransportMode = $("#defaultTransportMode").val();
  const defaultDistance = $("#distance").val();

  const smartcardNumberValid = smartcard.length === 16 || smartcard.length === 18;
  const canSubmit = smartcardNumberValid && defaultTransportMode !== "" && defaultDistance > 0 && group !== "";

  $('.modal .btn-primary').attr("disabled", !canSubmit);
});
