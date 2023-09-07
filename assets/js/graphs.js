
$("#organisation").change(function() {
  const val = $(this).val();
  $("#memberGroup").html('<option value="">Please select</option>');
  if (val.startsWith("/organisation/")) {
    $.get("https://api.ecorewards.co.uk/groups", response => {
      response.data
        .filter(group => group.organisation === val)
        .map(group => $('<option>').val(group.id).text(group.name))
        .forEach(option => option.appendTo('#memberGroup'));
    });
  }
});
function toggleButton() {
  const memberIdLength = $("#memberId").val().length;
  const memberIdValid = memberIdLength === 10 || memberIdLength === 16 || memberIdLength === 18;
  $("#submit").attr("disabled", $("#memberGroup").val() == null || $("#memberGroup").val().length < 1 || !memberIdValid);
}

$("#memberId").keypress(toggleButton);
$("#memberGroup").change(toggleButton);

function setupGraphs(organisations, apiResponse, prefixId = "", graphConstructor = createGraph) {

  $("input[name=" + prefixId + "chartToggle]").click(function() {
    $("#" + prefixId + "rewardChart").css({ display: "none"});
    $("#" + prefixId + "carbonSavingChart").css({ display: "none"});
    $("#" + prefixId + "milesChart").css({ display: "none"});
    $($(this).val()).css({ display: "block" });
  });

  graphConstructor(prefixId + "rewardChart", "totalRewardsEarned", organisations, apiResponse);
  graphConstructor(prefixId + "carbonSavingChart", "totalCarbonSaving", organisations, apiResponse);
  graphConstructor(prefixId + "milesChart", "totalDistance", organisations, apiResponse);
}

function createGraph(id, field, organisations, response) {
  const ctx = document.getElementById(id).getContext("2d");
  let colourI = 0;
  const colours = ["#4e73df", "#1cc88a", "#f6c23e", "#36b9cc",  "#e74a3b", "#858796", "#ff00ff", "#ff9900", "#674ea7"];
  const datasets = response.data.reduce((index, col) => {
    if (organisations === null || organisations.includes(col.name)) {
      index[col.name] = index[col.name] || { data: [], label: col.name, backgroundColor: colours[colourI++ % colours.length] };
      index[col.name].data.push(col[field]);
    }

    return index;
  }, {});
  const labels = response.data.reduce((index, col) => {
    index[col.date] = true;
    return index;
  }, {});
  const myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(labels),
      datasets: Object.values(datasets)
    },
    options: {
      maintainAspectRatio: false,
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }
    }
  });
}

function createCumulativeGraph(id, field, organisations, response) {
  const ctx = document.getElementById(id).getContext("2d");
  let colourI = 0;
  const colours = ["#4e73df", "#1cc88a", "#f6c23e", "#36b9cc",  "#e74a3b", "#858796", "#ff00ff", "#ff9900", "#674ea7"];
  const data = response.data.reduce((index, col) => {
    if (organisations === null || organisations.includes(col.name)) {
      index[col.name] = index[col.name] || 0;
      index[col.name] += col[field];
    }

    return index;
  }, {});

  const myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(data),
      datasets: [{
        data: Object.values(data),
        backgroundColor: Object.keys(data).map(() => colours[colourI++ % colours.length]),
      }]
    },
    options: {
      legend: {
        display: false
      },
      tooltips: {
        display: false
      },
      maintainAspectRatio: false,
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }
    }
  });
}

function getDefaultDate() {
  const defaultDate = new Date();

  // 1st Aug, 1st Nov, 1st Jan, 1st March, 1st April, 1st June
  const monthMap = {
    0: 0,
    1: 0,
    2: 2,
    3: 3,
    4: 3,
    5: 5,
    6: 5,
    7: 7,
    8: 7,
    9: 7,
    10: 10,
    11: 10
  };

  defaultDate.setMonth(monthMap[defaultDate.getMonth()]);
  defaultDate.setDate(1);

  return defaultDate;
}

function setupTables(organisations, url, fromDate = getDefaultDate()) {

  $.get(`${url}?from=${fromDate.toISOString().split('T')[0]}`, response => {
    createTable(organisations, response);
    const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][fromDate.getMonth()];
    const nth = function(d) {
      if (d > 3 && d < 21) return 'th';
      switch (d % 10) {
        case 1:  return "st";
        case 2:  return "nd";
        case 3:  return "rd";
        default: return "th";
      }
    }

    $(".tableStartDate").html(`Totals since ${fromDate.getDate()}${nth(fromDate.getDate())} ${month} ${fromDate.getFullYear()}`);
  });

}

function createTable(organisations, response) {
  const schoolData = response.data.reduce((index, col) => {
    index[col.name] = index[col.name] || { totalRewardsEarned: 0, totalCarbonSaving: 0, totalDistance: 0 };
    index[col.name].totalRewardsEarned += col.totalRewardsEarned;
    index[col.name].totalCarbonSaving += col.totalCarbonSaving;
    index[col.name].totalDistance += col.totalDistance;

    return index;
  }, {});

  const html = (organisations || Object.keys(schoolData))
    .sort((a, b) => a.replace("St ", "") > b.replace("St ", ""))
    .filter(school => schoolData[school])
    .map(school => `
        <td>${school}</td>
        <td class="text-right">${schoolData[school].totalRewardsEarned}</td>
        <td class="text-right">${schoolData[school].totalCarbonSaving.toFixed(2)}kg</td>
        <td class="text-right">${schoolData[school].totalDistance.toFixed(2)} miles</td>
      `)
    .reduce((r, row) => r + `<tr>${row}</tr>`, "");

  $("#dataTable").html(html);
}
