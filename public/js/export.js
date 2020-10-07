function generateReport() {
  let fromDateField = document.querySelector("#fromDate");
  let toDateField = document.querySelector("#toDate");
  let fromDate = fromDateField.value;
  let toDate = toDateField.value;

  let transactionType = document.querySelector("#transactionType");
  if (fromDate && toDate) {
    fromDate = new Date(fromDate);
    toDate = new Date(toDate);
    let table = document.querySelector(".exportTable");
    let changedTable = getTable(table, fromDate, toDate, transactionType.value);

    if (tableFormat.value === "CSV") {
      $(changedTable).table2CSV({
        header: ["Date", "Type", "Party", "Account Head", "Amount", "Status"],
      });
    } else if (tableFormat.value === "JSON") {
      console.log("object");
      let json = $(changedTable).tableToJSON();

      console.log(json);

      var generator = window.open("", "json", "height=400,width=600");
      generator.document.write("<html><head><title>JSON</title>");
      generator.document.write("</head><body >");
      generator.document.write('<textArea cols=70 rows=15 wrap="off" >');
      generator.document.write(JSON.stringify(json));
      generator.document.write("</textArea>");
      generator.document.write("</body></html>");
      generator.document.close();
    } else if (tableFormat.value === "XLS") {
      exceller(changedTable);
    }
  }
}

function getTable(table, fromDate, toDate, transactionType) {
  // Declare variables
  let tableChanged = table;
  var date, type;
  tr = tableChanged.getElementsByTagName("tr");

  // Loop through all table rows, and hide those who don't match the search query
  for (i = 0; i < tr.length; i++) {
    if (
      tr[i].getElementsByTagName("td")[0] &&
      tr[i].getElementsByTagName("td")[1]
    ) {
      date = new Date(tr[i].getElementsByTagName("td")[0].innerHTML);
      type = tr[i].getElementsByTagName("td")[1].innerHTML;
      console.log(tr[i]);
      if (date <= new Date(toDate) && date >= new Date(fromDate)) {
        console.log(type.toLowerCase());
        console.log(transactionType);
        if (type.toLowerCase() === transactionType.toLowerCase()) {
        } else {
          tr[i].style.display = `none`;
        }
      } else {
        tr[i].style.display = `none`;
      }
    }
  }
  return tableChanged;
}

jQuery.fn.table2CSV = function (options) {
  var options = jQuery.extend(
    {
      separator: ",",
      header: [],
      delivery: "popup", // popup, value
    },
    options
  );

  var csvData = [];
  var headerArr = [];
  var el = this;

  //header
  var numCols = options.header.length;
  var tmpRow = []; // construct header avalible array

  if (numCols > 0) {
    for (var i = 0; i < numCols; i++) {
      tmpRow[tmpRow.length] = formatData(options.header[i]);
    }
  } else {
    $(el)
      .filter(":visible")
      .find("th")
      .each(function () {
        if ($(this).css("display") != "none")
          tmpRow[tmpRow.length] = formatData($(this).html());
      });
  }

  row2CSV(tmpRow);

  // actual data
  $(el)
    .find("tr")
    .each(function () {
      var tmpRow = [];
      $(this)
        .filter(":visible")
        .find("td")
        .each(function () {
          if ($(this).css("display") != "none")
            tmpRow[tmpRow.length] = formatData($(this).html());
        });
      row2CSV(tmpRow);
    });
  if (options.delivery == "popup") {
    var mydata = csvData.join("\n");
    return popup(mydata);
  } else {
    var mydata = csvData.join("\n");
    return mydata;
  }

  function row2CSV(tmpRow) {
    var tmp = tmpRow.join(""); // to remove any blank rows
    // alert(tmp);
    if (tmpRow.length > 0 && tmp != "") {
      var mystr = tmpRow.join(options.separator);
      csvData[csvData.length] = mystr;
    }
  }
  function formatData(input) {
    // replace " with “
    var regexp = new RegExp(/["]/g);
    var output = input.replace(regexp, "“");
    //HTML
    var regexp = new RegExp(/\<[^\<]+\>/g);
    var output = output.replace(regexp, "");
    if (output == "") return "";
    return '"' + output + '"';
  }
  function popup(data) {
    var generator = window.open("", "csv", "height=400,width=600");
    generator.document.write("<html><head><title>CSV</title>");
    generator.document.write("</head><body >");
    generator.document.write('<textArea cols=70 rows=15 wrap="off" >');
    generator.document.write(data);
    generator.document.write("</textArea>");
    generator.document.write("</body></html>");
    generator.document.close();
    return true;
  }
};

function exceller(table) {
  var uri = "data:application/vnd.ms-excel;base64,",
    template =
      '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>',
    base64 = function (s) {
      return window.btoa(unescape(encodeURIComponent(s)));
    },
    format = function (s, c) {
      return s.replace(/{(\w+)}/g, function (m, p) {
        return c[p];
      });
    };
  var toExcel = table.innerHTML;
  var ctx = {
    worksheet: name || "",
    table: toExcel,
  };
  var link = document.createElement("a");
  link.download = "export.xls";
  link.href = uri + base64(format(template, ctx));
  link.click();
}
