

function setupGraphs(organisations, schemeId) {
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

  $("input[name=chartToggle]").click(function() {
    $("canvas").css({ display: "none"});
    $($(this).val()).css({ display: "block" });
  });

  function toggleButton() {
    $("#submit").attr("disabled", $("#memberGroup").val() == null || $("#memberGroup").val().length < 1 || $("#memberId").val().length < 10);
  }

  $("#memberId").change(toggleButton);
  $("#memberGroup").change(toggleButton);

  const date = new Date();

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

  date.setMonth(monthMap[date.getMonth()]);
  date.setDate(1);

  $.get(`https://api.ecorewards.co.uk/scheme/${schemeId}/report?from=` + date.toJSON().substr(0, date.toJSON().indexOf("T")), response => {
    createTable(organisations, response);
    const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][date.getMonth()];
    const nth = function(d) {
      if (d > 3 && d < 21) return 'th';
      switch (d % 10) {
        case 1:  return "st";
        case 2:  return "nd";
        case 3:  return "rd";
        default: return "th";
      }
    }

    $(".tableStartDate").html(`Totals since ${date.getDate()}${nth(date.getDate())} ${month} ${date.getFullYear()}`);
  });

  $.get(`https://api.ecorewards.co.uk/scheme/${schemeId}/report` , response => {
    createGraph("rewardChart", "totalRewardsEarned", organisations, response);
    createGraph("carbonSavingChart", "totalCarbonSaving", organisations, response);
    createGraph("milesChart", "totalDistance", organisations, response);
  });
}

function createGraph(id, field, organisations, response) {
  const ctx = document.getElementById(id).getContext("2d");
  let colourI = 0;
  const colours = ["#4e73df", "#1cc88a", "#f6c23e", "#36b9cc",  "#e74a3b", "#858796", "#ff00ff", "#ff9900", "#674ea7"];
  const datasets = response.data.reduce((index, col) => {
    if (organisations.includes(col.name)) {
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

function createTable(organisations, response) {
  const schoolData = response.data.reduce((index, col) => {
    index[col.name] = index[col.name] || { totalRewardsEarned: 0, totalCarbonSaving: 0, totalDistance: 0 };
    index[col.name].totalRewardsEarned += col.totalRewardsEarned;
    index[col.name].totalCarbonSaving += col.totalCarbonSaving;
    index[col.name].totalDistance += col.totalDistance;

    return index;
  }, {});

  const html = organisations
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
