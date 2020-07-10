window.onload = datepickers;
function datepickers() {
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var today = days[new Date().getDay()];
    var monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"];
    var date = new Date();
    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();
    document.getElementById("date").innerHTML = (day + ' ' + monthNames[monthIndex] + ' ' + year);
    document.getElementById("today").innerHTML = (today);
    // Best Practice
    // document.getElementById("tostring").innerHTML = new Date().toDateString();
    // method to get day latter
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    // document.getElementById("day").innerHTML = days[new Date().getDay()];
}

$(document).ready(function () {
    initializeFirebase();
});

function openTab(evt, tabName) {
    if (tabName.toLowerCase() != "all") {
        $('#selectbox_' + tabName).select2({
            placeholder: 'Select Collection day'
        });
    getTrasactionsByAccount(tabName);}
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";

    evt.currentTarget.className += " active";

    // Clearing up every toggle table or table row upon tab switch
    $('table').css('display', 'table');
    $('table tr').css('display', 'table-row');

    // Unchecking every checkbox upon tab switch
    $('input:checkbox').map(function () {
        $(this).prop('checked', false)
    })
}

// Get the element with id="defaultOpen" and click on it
document.getElementById("defaultOpen").click();

function filterbyCollectionDay(value) {
    tblUsers.where("UserID", "==", UserObject.uid).get().then(function (resp) {
        tblUsers.doc(resp.docs[0].id).update({
            collectionDays: value
        });

    });
    if (!value) {
        $(".timelinePart.records").find(".Collection_date").hide();
       // $("#add-entry-all").show();
        return;
    }
    $(".timelinePart.records").find(".Collection_date").hide();
    $(value).each(function (i, v) {

        $(".timelinePart.records." + v).find(".Collection_date").show();
    });
   // $("#add-entry-all").hide();
   // $(".timelinePart.records").hide();
}

function filterbyCollectionDaytab(value, tabid) {
    tblUsers.where("UserID", "==", UserObject.uid).get().then(function (resp) {
        tblUsers.doc(resp.docs[0].id).update({
            collectionDays: value
        });

    });
    if (!value) {
        $('#acc-li-' + tabid).find(".timelinePart.records").find(".Collection_date").hide();
        return;
    }
    $('#acc-li-' + tabid).find(".timelinePart.records").find(".Collection_date").hide();
    $(value).each(function (i, v) {
        $('#acc-li-' + tabid).find(".timelinePart.records." + v).find(".Collection_date").show();
    });


}

function advance_search_record(value) {


    if (value.length < 1) {
        $("#add-entry-all").show();
        $('#all-transactions tbody tr').each(function (index, val) {

            $(val).show();
        });
        $("#all-transactions>li").each(function (i, v) {
            if ($(v).find("tbody>tr:not([style=\"display: none;\"])").length > 0) {
                $(v).show();
            } else {
                $(v).hide();
            }
        });
        return;
    }
    $("#add-entry-all").hide();
    $('#all-transactions tbody tr').each(function (index, val) {
        $(val).hide();

        // console.log(val);
        // console.log($(val).find('select > option:selected').val());
        $(val).find("td:not(:last-child)").each(function(i, v){
            // console.log($(v).val());
            if($(v).text().toLowerCase().indexOf(value.toLowerCase())>-1){
                $(val).show();
            }
        });
    });
    $("#all-transactions>li").each(function (i, v) {
        if ($(v).find("tbody>tr:not([style=\"display: none;\"])").length > 0) {
            $(v).show();
        } else {
            $(v).hide();
        }
    });
}

function advance_search_recordtab(value,tabid) {


    if (value.length < 1) {
        $("#add-entry-all").show();
        $('#acc-li-' + tabid + ' tbody tr').each(function (index, val) {

            $(val).show();
        });
        $('#acc-li-' + tabid + '>li').each(function (i, v) {
            if ($(v).find("tbody>tr:not([style=\"display: none;\"])").length > 0) {
                $(v).show();
            } else {
                $(v).hide();
            }
        });
        return;
    }
    $("#add-entry-all").hide();
    $('#acc-li-' + tabid + ' tbody tr').each(function (index, val) {
        $(val).hide();

        // console.log(val);
        // console.log($(val).find('select > option:selected').val());
        $(val).find("td:not(:last-child)").each(function (i, v) {
            // console.log($(v).val());
            if ($(v).text().toLowerCase().indexOf(value.toLowerCase()) > -1) {
                $(val).show();
            }
        });
    });
    $('#acc-li-' + tabid + '>li').each(function (i, v) {
        if ($(v).find("tbody>tr:not([style=\"display: none;\"])").length > 0) {
            $(v).show();
        } else {
            $(v).hide();
        }
    });
}

function filterRecords() {
  var checked = $('[name=clearPaymentCheckbox]:checked');

    if (checked.length < 1) {
        $("#add-entry-all").show();
    $('#all-transactions tbody tr').each(function (index, val) {
      $(val).show();
    });
        $("#all-transactions>li").each(function (i, v) {
            if ($(v).find("tbody>tr:not([style=\"display: none;\"])").length > 0) {
                $(v).show();
            } else {
                $(v).hide();
            }
        });
    return;
    }
    $("#add-entry-all").hide();
  $('#all-transactions tbody tr').each(function (index, val) {
    $(val).hide();

    // console.log(val);
    // console.log($(val).find('select > option:selected').val());
    $('[name=clearPaymentCheckbox]:checked').each(function(i, v){
      // console.log($(v).val());
      if($(val).find('select > option:selected').val() === $(v).val()){
        $(val).show();
      }
    });
    });
    $("#all-transactions>li").each(function (i, v) {
        if ($(v).find("tbody>tr:not([style=\"display: none;\"])").length > 0) {
            $(v).show();
        } else {
            $(v).hide();
        }
    });
}

function filterRecordstab(tabid) {

    var checked = $('.tabcontent#' + tabid).find('[name=clearPaymentCheckbox]:checked');
    console.log(checked);
    if (checked.length < 1) {
        $('.tabcontent#' + tabid).find("#add-entry-all").show();
        $('.tabcontent#' + tabid).find('#acc-li-' + tabid + ' tbody tr').each(function (index, val) {
            $(val).show();
        });
        $('.tabcontent#' + tabid).find("#acc-li-" + tabid + ">li").each(function (i, v) {
            if ($(v).find("tbody>tr:not([style=\"display: none;\"])").length > 0) {
                $(v).show();
            } else {
                $(v).hide();
            }
        });
        return;
    }
    $('.tabcontent#' + tabid).find("#add-entry-all").hide();
    $('.tabcontent#' + tabid).find('#acc-li-' + tabid + ' tbody tr').each(function (index, val) {
        $(val).hide();

        // console.log(val);
        // console.log($(val).find('select > option:selected').val());
        $('.tabcontent#' + tabid).find('[name=clearPaymentCheckbox]:checked').each(function (i, v) {
            // console.log($(v).val());
            if ($(val).find('select > option:selected').val() === $(v).val()) {
                $(val).show();
            }
        });
    });
    $('.tabcontent#' + tabid).find("#acc-li-" + tabid + ">li").each(function (i, v) {
        if ($(v).find("tbody>tr:not([style=\"display: none;\"])").length > 0) {
            $(v).show();
        } else {
            $(v).hide();
        }
    });
}
// To display those results with status 'CLEARED'
function displayClearPayments(ele,id) {
    $("#acc-li-"+id).find("tbody>tr").hide();
if($(ele).is(":checked")){
    $("#acc-li-"+id).find("tbody>tr").each(function (ii,vv) {
        if($(vv).find("select").val().toLowerCase()=="cleared"){
            $(vv).show();
        }
    });
}
else{
    $("#acc-li-"+id).find("tbody>tr").show();
}
return;
    // console.log($(ctx).prop('checked'));
    // var value = 'cleared';
    var value = $(ctx).prop('checked');

    // Getting the value of all options of all select boxes and filtering through them
    $("table select option:selected").filter(function () {
        // Checking when switching from show cleared to all then hide cleared rows
        if (!$(ctx).prop('checked') && this.value.toLowerCase() !== value) {
            // Displaying all those rows which are not cleared
            $(this).closest('tr').css('display', 'table-row');
        } else if (!$(ctx).prop('checked') && this.value.toLowerCase() === value) {
            // Hiding the cleared row
            $(this).closest('tr').css('display', 'none');
        }

        // Checking when switching from cleared->all->cleared then show those cleared rows which were hidden
        if ($(ctx).prop('checked') && this.value.toLowerCase() === value) {
            $(this).closest('tr').css('display', 'table-row');
        }


        // If option value matches the value above then keep the row else hide the row
        if (this.value.toLowerCase() !== value && $(ctx).prop('checked')) {
            // Hiding the unmatched row
            $(this).closest('tr').toggle();
        }
    });

    // This function is Now hiding tables with no rows at all
    // Map over all the tables
    $('table').map(function () {

        // variable to count how many rows are there in current iterable table
        let count = 0;
        // Iterating over the rows of current table
        $(this).find('tr').map(function () {
            // If the display of the current row is 'table-row' then increase the count
            if ($(this).css('display') == 'table-row') {
                count++;
            }
        });

        // If count is only 1 then it means there is only 1 row which the header itself
        if (count === 1) {


            // So toggling the table/hiding the table
            $(this).toggle();
        } else {

            // If count is greater than 1,then displaying the table
            $(this).css('display', 'table');
        }

    });


}

$(document).on('click', '.flag', function () {
    $(this).toggleClass('disable_flag');
    // updateTrasactionFlag();
});
//This function calculates the balance of each table....
function BalanceInputField() {
    // Function to calculate balance required from table rows balances

    // Getting each timeline tables
    $('.timelinePart').map(function () {
        let totalBalance = 0;

        // Getting each table and iterating over balance td
        $(this).find('.balance').map(function () {

            // Adding value in td element to totalBalance
            totalBalance += parseInt($(this).text().replace(/,/g, ''))
        });

        // Putting/Displaying the sum to the table balance
        $(this).find('.totalBalance').text('Balance Required: ' + totalBalance);
    });

    // Checking if something has been entered in account balance input?
    // For different tabs balance field
    $('#All .balance_input').on('keydown', function (e) {
        specificBalanceInputField('All', this.value, e);
    });

    $('#Account1 .balance_input').on('keydown', function (e) {
        specificBalanceInputField('Account1', this.value, e);
    });

    $('#Account2 .balance_input').on('keydown', function (e) {
        specificBalanceInputField('Account2', this.value, e);
    });

    $('#Account3 .balance_input').on('keydown', function (e) {
        specificBalanceInputField('Account3', this.value, e);
    })


}
//This is the code that checks the balance after when the data has been entered into the nput field.
function specificBalanceInputField(id, value, e) {

    // If enter is pressed
    if (e.keyCode === 13) {
        console.log($(`#${id} .totalBalance`));
        // get the input field value
        let inputValue = parseInt(value);

        // Find total balances of the tables and map through them
        $(`#${id} .totalBalance`).map(function () {

            // Get the individual balance of table and trim it to number only
            let balanceValue = parseInt($(this).text().replace(/^\D+/g, ''));

            // If table balance > input value then just show the alert box
            if (balanceValue > inputValue) {
                $(this).next().find('.alert_notification_tag').prevObject.css('display', 'block');
            }
            // Else hide the alert box
            else if (balanceValue < inputValue) {
                $(this).next().find('.alert_notification_tag').prevObject.css('display', 'none');
            }

        })

    }
}

