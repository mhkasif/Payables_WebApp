var db;
var UserObject;
var tblAccounts/* = db.collection("tbl_accounts")*/;
var tblAccountCheques/* = db.collection("tbl_account_cheques")*/;
var tblUsers;
var fireBaseConfigInfo;
var weekday = new Array(7);
weekday[0] = "Sunday";
weekday[1] = "Monday";
weekday[2] = "Tuesday";
weekday[3] = "Wednesday";
weekday[4] = "Thursday";
weekday[5] = "Friday";
weekday[6] = "Saturday";
var liRecords = '<tr>' +
    '                                <td><i class="fa fa-bars"></i></td>' +
    '                                <td class="active_flag flag">??</td>' +
    '                                <td>#100457</td>' +
    '                                <td>John</td>' +
    '                                <td>Cheque</td>' +
    '                                <td>ICICI 69</td>' +
    '                                <td>' +
    '                                    <select' +
    '                                            class="form-control red-text"' +
    '                                            onchange="this.className=\'form-control \' + this.options[this.selectedIndex].className">' +
    '                                        <option class="red-text" value="Un Clear">Un-Clear</option>' +
    '                                        <option class="orange-text" value="To Pay">To Pay</option>' +
    '                                        <option class="green-text" value="Cleared">Cleared</option>' +
    '                                    </select>' +
    '                                </td>' +
    '                                <td class="balance">50,000</td>' +
    '                                <td><a href="#" type="button"> <i class="fa fa-pen"></i> &nbsp; Edit</a></td>' +
    '                            </tr>';
var liTemplate = '<li class="timelinePart">' +
    '                <p class="timeline-date">23/04/19</p>' +
    '                <div class="timeline-content">' +
    '                    <h3 style="font-weight: 300;">Wednesday' +
    '                        <a class="totalBalance" title="This is the balance that is after deduction and to be carry forward to the next payment day" style="float:right;color: #737373;">Balance left after today :' +
    '                            2,00,000</a>' +
    '                        <a class="alert_notification_tag" style="display:none"> <i' +
    '                                class="fas fa-exclamation-circle"></i>' +
    '                            &nbsp;' +
    '                            Alert : Balance Shortage</a>' +
    '                        <a class=" Collection_date"><i class="fas fa-rupee-sign"></i> &nbsp; Collection Date</a>' +
    '                    </h3>' +
    '                    <div class="responsive-table">' +
    '                        <table class="nowTable" id="t_draggable1">' +
    '                            <thead>' +
    '                            <tr class="ui-state-default">' +
    '                                <th>Drag</th>' +
    '                                <th></th>' +
    '                                <th>Cheque no.</th>' +
    '                                <th>Party Name</th>' +
    '                                <th>Party Type</th>' +
    '                                <th>Bank</th>' +
    '                                <th>Status</th>' +
    '                                <th>Withdrwal</th>' +
    '                                <th>Action</th>' +
    '                            </tr>' +
    '                            </thead>' +
    '                            <tbody class="t_sortable">' +
    'REPLACE_ME' +
    '                            </tbody>' +
    '                                <tfoot>'+
    '                                <tr class="ui-state-default">'+
    '                                    <th colspan="7"></th>'+
    '                                    <th></th>'+
    '                                </tr>'+
    '                            </tfoot>'+
    '                        </table>' +
    '                    </div>' +
    '                </div>' +
    '            </li>';

function getFirebaseConfig() {
        return fetch('/firebaseConfig', {
          method: 'get',
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then((response) => {
            return response.json();
          })
          .then((response) => {
            fireBaseConfigInfo=response;
            console.log(fireBaseConfigInfo);
      
          });
}
function initializeFirebase() {
    getFirebaseConfig().then(function(){
        console.log("came here first");
    var firebaseConfig = fireBaseConfigInfo;
    //initialize firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
    }
});
}

function addAccountActual() {


    if (!$('#account_title').val()) {
        $('#account_title').addClass("invalidInput");
        return;
    }
    $('#account_title').removeClass("invalidInput");
    addAccount({ title: document.getElementById('account_title').value, UserID: UserObject.uid, init_balance: 0 });
document.getElementById('account_title').value = '';

}

function getAccountsAll() {
    $('#tabs-accounts button:not([id=defaultOpen]):not([id=add-account])').remove();
    $('#account-list').empty();
    tblAccounts = db.collection("tbl_accounts");

    tblAccounts.where("UserID", "==", UserObject.uid).get().then(function (querySnapshot) {
        // console.log(querySnapshot.docs.length);
        // console.log(querySnapshot.size);
        var htmlTabs = '';
        var SumOfAllInit_Balance = 0;
        querySnapshot.forEach(function (doc) {
            // doc.data() is never undefined for query doc snapshots
            // console.log(doc.id, " => ", doc.data());
            SumOfAllInit_Balance +=Number(doc.data().init_balance);
            if (doc.data().title === 'Cash in Hand') {
                htmlTabs += '<button class="tablinks" data-accid="'+doc.id+'" onclick="openTab(event, \'' + doc.id + '\')">' +
                    '<i class="fas fa-university"></i><br>' +
                    '    <b>' + doc.data().title + '</b>' +
                    '    <input placeholder="Enter Balance" type="number" ' +
                    '           onblur="updateAccount(\'' + doc.id + '\', \'' + doc.data().title + '\', this.value)"' +
                    '           value="' + doc.data().init_balance + '"/>' +
                    '</button>';
            } else {
                htmlTabs += '<button class="tablinks" data-accid="'+doc.id+'" onclick="openTab(event, \'' + doc.id + '\')">' +
                    '<i class="fas fa-university"></i><br>' +
                    '    <b>' + doc.data().title + '</b>' +
                    '    <input placeholder="Enter Balance" type="number" ' +
                    '           onblur="updateAccount(\'' + doc.id + '\', \'' + doc.data().title + '\', this.value)"' +
                    '           value="' + doc.data().init_balance + '"/>' +
                    '<a style="display: inherit;" onclick="deleteAccount(\'' + doc.id + '\')"> <i class="fas fa-minus-circle"></i> &nbsp; Delete Account</a>' +
                    '</button>';
            }
            var accTab = '  <div class="tabcontent" id="'+doc.id+'">\n' +
                '            <div class="balance_in_account_bar">\n' +
                '        <input class="balance_input" placeholder="Search data within all transactions" onkeyup="advance_search_recordtab($(this).val(),\'' + doc.id +'\')"            '
        +'            type="text" />                                                                                                                  '
        +'    <b style="padding: 19px; border-radius: 8px; border: 1px solid #9999;color: #999;"><i class="fas fa-filter"></i> &nbsp; Filters        '
        +'        <a style="color: #19c9a0; background: #ccfff3; border: 1px solid;font-weight: 700;padding: 12px;border-radius: 38px;margin: 1%;" title="Cheques paid and are now deducted from your bank">           '
        +'            <input                                                                                                                                  '
                + '                class="1 clearchk" name="clearPaymentCheckbox" onchange="filterRecordstab(\'' + doc.id +'\')"                                                                    '
        +'                style="width: 27px; height: 20px; vertical-align: text-bottom;"                                                                     '
        +'                value="Cleared"                                                                                                                   '
        +'                type="checkbox">&nbsp; Cleared &nbsp; <i class="fas fa-check"></i></a>                                                                                                 '
        +'            <a style="color: #f46083; background: #ffeaef; border: 1px solid;font-weight: 700;padding: 12px;border-radius: 38px;margin: 1%;" title="Cheques that are paid but un-clear"><input              '
                + '                class="1" name="clearPaymentCheckbox" onchange="filterRecordstab(\'' + doc.id +'\')"                                                                     '
        +'                style="width: 27px; height: 20px; vertical-align: text-bottom;"                                                                     '
        +'                value="Un Clear"                                                                                                                    '
        +'                type="checkbox">&nbsp; Un-Clear &nbsp; <i class="fas fa-exclamation-circle"></i></a>                                                                                                        '
        +'                <a style="color: #fac200; background: #fffae8; border: 1px solid;font-weight: 700;padding: 12px;border-radius: 38px;margin: 1%;" title="Cheques that is still to be paid"><input      '
                + '                    class="1" name="clearPaymentCheckbox" onchange="filterRecordstab(\'' + doc.id +'\')"                                                                 '
        +'                    style="width: 27px; height: 20px; vertical-align: text-bottom;"                                                                 '
        +'                    value="To Pay"                                                                                                                  '
        +'                    type="checkbox">&nbsp; To Pay &nbsp; <i class="fas fa-bell"></i></a>                                                                                                      '
        +'    </b>                                                                                                                                            '
                + '                <select class="select collectionDays" multiple id="selectbox_'+doc.id+'" onchange="filterbyCollectionDaytab($(this).val(),\'' + doc.id +'\');" style="float: right; margin: -7px 11px;">                   '
        +'                                                                                         '
        +'                    <option>Monday</option>                                                                                                         '
        +'                    <option>Tuesday</option>                                                                                                        '
        +'                    <option>Wednesday</option>                                                                                                      '
        +'                    <option>Thursday</option>                                                                                                       '
        +'                    <option>Friday</option>                                                                                                         '
        +'                    <option>Saturday</option>                                                                                                       '
        +'                    <option>Sunday</option>                                                                                                         '
        +'                </select>                     </div><ul id="acc-li-'+doc.id+'" class="timeline"></ul></div>';
            $("#All").after(accTab);
            $('#account-list').append('<option value="' + doc.id + '">' + doc.data().title + '</option>');
        });
        $('#defaultOpen').find("input").val(SumOfAllInit_Balance);
        $('#defaultOpen').after(htmlTabs);
        getTrasactionsAll();
    });
}

function getAccountByName(title) {
    tblAccounts = db.collection("tbl_accounts");

    tblAccounts.where("title", "==", title).where("UserID", "==", UserObject.uid).get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data());
            return doc.data();
        });
    });
}

function addAccount(obj) {
    tblAccounts = db.collection("tbl_accounts");
    tblAccounts.add({
        title: obj.title,
        init_balance: obj.init_balance,
        UserID: UserObject.uid
    })
        .then(function (docRef) {
            console.log("Document written with ID: ", docRef.id);

            getAccountsAll();
        })
        .catch(function (error) {
            console.error("Error adding document: ", error);
        });
}

function updateAccount(id, title, init_balance) {
    tblAccounts = db.collection("tbl_accounts");
    tblAccounts.doc(id).update({
        title: title,
        UserID: UserObject.uid,
        init_balance: parseFloat(init_balance)
    });
    var allinputs = $('#tabs-accounts button:not([id=defaultOpen]):not([id=add-account])').find("input");
    var totalAmount = 0;
    $(allinputs).each(function (i, v) {
        totalAmount += Number($(v).val());
    });
    $("#defaultOpen>input").val(totalAmount);
    $(".tabcontent[style=\"display: block;\"]").find(".timelinePart.records").each(function (ii, vv) {
        var tbody = $(vv).find("table>tbody>tr");
    var totalWithdrawl = 0;
    $(tbody).each(function (i, v) {
        totalWithdrawl += Number($(v).find(".balance>span").text());
        });
        if (totalAmount < totalWithdrawl) {
            $(vv).find(".alert_notification_tag").show();
        } else {
            $(vv).find(".alert_notification_tag").hide();
        }
        totalAmount = totalAmount - totalWithdrawl;
    });
}

function deleteAccount(id) {
    tblAccounts = db.collection("tbl_accounts");
    tblAccountCheques.where("account_id", "==", id).get().then(function (querySnapshot) {
        console.log(querySnapshot.docs.length);
        if (querySnapshot.docs.length == 0) {
            tblAccounts.doc(id)
                .delete().then(function () {
                    getAccountsAll();
                    console.log("Document successfully deleted!");
                }).catch(function (error) {
                    console.error("Error removing document: ", error);
                });
        } else {
            alert("Account cannot be deleted because it has transactions associated.");
        }
    });
}

var groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};

var allTrasactions = [];
var groupedRecords = {};
var tblRecordsHtml = '';

function sortByKey(array, key,isAsc) {
    if(isAsc){
        return array.sort(function(a, b) {
            var x = a[key]; var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    }else {
        return array.sort(function(a, b) {
            var x = a[key]; var y = b[key];
            return ((x > y) ? -1 : ((x < y) ? 1 : 0));
        });
    }

}

function getTrasactionsAll() {
    
    clearTransactionFields();
if($(".tablinks.active").attr("data-accid").toLowerCase()!="defaultopen" && $(".tablinks.active").attr("data-accid").toLowerCase()!="add-account"){
    getTrasactionsByAccount($(".tablinks.active").attr("data-accid"));
    return;
}
    tblAccountCheques = db.collection("tbl_account_cheques");

    allTrasactions = [];
    groupedRecords = {};
    tblRecordsHtml = '';
    $('#all-transactions li:not([id=add-entry-all])').remove();

    tblAccountCheques.where("UserID", "==", UserObject.uid).get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
            // doc.data() is never undefined for query doc snapshots
            // console.log(doc.id, " => ", doc.data());
            doc.data().id = doc.id;
            var obj = doc.data();
            obj.id = doc.id;
            allTrasactions.push(obj);
        });
        allTrasactions = sortByKey(allTrasactions,"order_sequence",true);
        allTrasactions =sortByKey(allTrasactions,"date",true);
        groupedRecords = groupBy(allTrasactions, 'date');
        var tbodyindex = 0;
        var totalAmount = Number($(".tablinks[data-accid=defaultOpen]").find("input").val());
        for (var key in groupedRecords) {
            // console.log(key);
            // console.log(groupedRecords[key]);
            tbodyindex = tbodyindex + 1;
            var sumOfAmount=0;
            var accountid = "";
            var trCount = 0;
            for (var record in groupedRecords[key]) {
                // console.log(record);
                // console.log(groupedRecords[key][record]);
                var myRecord = groupedRecords[key][record];
                    trCount++;
                    if (myRecord.mode == "Buyer") {
                        sumOfAmount = sumOfAmount + Number(myRecord.withdrawal);
                    } else {
                        sumOfAmount = sumOfAmount - Number(myRecord.withdrawal);
                    }
                accountid=myRecord.account_id;
                tblRecordsHtml += '<tr id=\'' + myRecord.id + '\' ' + (myRecord.status === "Cleared" ? "style=\'display:none;\'" : "") +'>' +
                    '                                <td><i class="fa fa-bars"></i></td>' +
                    '                                <td class="active_flag flag ' + (myRecord.flag ? "" : "disable_flag") + '" id="flag_' + myRecord.id + '" onclick="updateTrasactionFlag(this, \'' + myRecord.id + '\', ' + myRecord.flag + ');">🚩</td>' +
                    '                                <td>' + (myRecord.cheque_no ? "#" : "") +'<span>' + myRecord.cheque_no + '</span></td>' +
                    '                                <td><span>' + myRecord.payee + '</span></td>' +
                    '                                <td><span>' + myRecord.mode + '</span></td>' +
                    '                                <td><span>' + myRecord.bank + '</span></td>' +
                    '                                <td>' +
                    '                                    <select' +
                    '                                            class="form-control red-text ' + (myRecord.status === "Un Clear" ? "status-unclear" : myRecord.status === "Cleared" ? "status-clear" : "status-topay") + '"' +
                    '                                            onchange="updateTrasactionStatus(this, \'' + myRecord.id + '\', $(this).val())">' +
                    '                                        <option class="red-text" value="Un Clear" ' + (myRecord.status === "Un Clear" ? "selected" : "") + '>Un-Clear</option>' +
                    '                                        <option class="orange-text" value="To Pay" ' + (myRecord.status === "To Pay" ? "selected" : "") + '>To Pay</option>' +
                    '                                        <option class="green-text" value="Cleared" ' + (myRecord.status === "Cleared" ? "selected" : "") + '>Cleared</option>' +
                    '                                    </select>' +
                    '                                </td>' +
                    '                                <td class="balance"><span>' + myRecord.withdrawal + '</span></td>' +
                    '                                <td><a href="#" type="button" onclick="editRecord(\'' + myRecord.id + '\')"> <i class="fa fa-pen"></i> &nbsp; Edit</a> &nbsp;<a href="#" style="color:#f46083;" type="button" onclick="deleteTrasaction(\'' + myRecord.id + '\')"> <i class="fa fa-trash"></i> &nbsp; Delete</a></td>' +
                    '                            </tr>';
            }
            totalAmount = totalAmount + sumOfAmount;
            var myLi = '<li ' + (trCount == 0 ? "style=\'display:none;\'" : "") + ' class="timelinePart records '+weekday[new Date(key).getDay()]+'">' +
                '                <p class="timeline-date">' + (new Date(key).getDate() + '/' + (new Date(key).getMonth() + 1) + '/' + new Date(key).getFullYear()) + '</p>' +
                '                <div class="timeline-content">' +
                '                    <h3 style="font-weight: 300;">' + weekday[new Date(key).getDay()] +
                '                      <span id="remainingfromtotal" style="display:none;">' + totalAmount+'</span> &nbsp;<a class="totalBalance" style="float:right;color: #737373;">'+
                '<i class="fas fa-question-circle" title="This is the balance that is after deduction and to be carry forward to the next payment day"></i> &nbsp; <u>Balance carry forward :</u>' +
                '                            ' + (totalAmount) + ' &nbsp; <i class="fas fa-level-down-alt" style="position: absolute;color: #9999; line-height: 2; font-size: 16px;"></i> </a>' +
                '                        <a class="alert_notification_tag"  style="display:' + ((totalAmount < 0) ? "block;" : "none;") +'"> <i' +
                '                                class="fas fa-exclamation-circle"></i>' +
                '                            &nbsp;' +
                '                            Alert : Balance Shortage</a>' +
                '                        <a class=" Collection_date" style="display:none;"><i class="fas fa-rupee-sign"></i> &nbsp; Collection Date</a>' +
                '                    </h3>' +
                '                    <div class="responsive-table">' +
                '                        <table class="nowTable" id="draggable-' + key + '">' +
                '                            <thead>' +
                '                            <tr class="ui-state-default">' +
                '                                <th>Drag</th>' +
                '                                <th></th>' +
                '                                <th>Cheque no.</th>' +
                '                                <th>Party Name</th>' +
                '                                <th>Party Type</th>' +
                '                                <th>Bank</th>' +
                '                                <th  style="width: 10%;">Status</th>' +
                '                                <th>Amount</th>' +
                '                                <th style="width: 10%;">Action</th>' +
                '                            </tr>' +
                '                            </thead>' +
                '                            <tbody id="tbody_'+key+'_'+tbodyindex+'" class="t_sortable">' +
                tblRecordsHtml +
                '                            </tbody>' +
                '                                <tfoot>'+
                '                                <tr class="ui-state-default">'+
                '                                    <th colspan="7" style="text-align: right;">Balance:</th>' +
                '                                    <th>' + sumOfAmount + '</th>' +
                '                                    <th></th>'+
                '                                </tr>'+
                '                            </tfoot>'+
                '                        </table>' +
                '                    </div>' +
                '                </div>' +
                '            </li>';
            $('#all-transactions').append(myLi);
            if (totalAmount < sumOfAmount) {
                $("alert_notification_" + accountid).show();
            } else {
                $("alert_notification_" + accountid).hide();
            }
            var $tabs = $('#draggable-' + key + '');
            $("tbody.t_sortable").sortable({
                connectWith: ".t_sortable",
                items: "> tr",
                appendTo: $tabs,
                helper: "clone",
                zIndex: 999990,
                update: function( ) {
                   console.log($(this).find("tr"));
                   var allrows = $(this).find("tr");
                   for(var i=0;i<allrows.length;i++){
                       updateTrasactionSorting($(allrows[i]).attr("id"),i+1);
                    }
                    var tbody = allrows;
                    var totalWithdrawl = 0;


                    var totalAmount = Number($("#defaultOpen>input").val());
                    $(".timelinePart.records").each(function (ii, vv) {
                        var tbody = $(vv).find("table>tbody>tr");


                        var totalWithdrawl = 0;
                        $(tbody).each(function (i, v) {
                            totalWithdrawl += Number($(v).find(".balance>span").text());
                        });
                        $(vv).find("a.totalBalance").html("Balance Left: " + totalWithdrawl + "");
                        if (totalAmount < totalWithdrawl) {
                            $(vv).find(".alert_notification_tag").show();
                        } else {
                            $(vv).find(".alert_notification_tag").hide();
                        }
                        totalAmount = totalAmount - totalWithdrawl;
                    });
                }
            }).disableSelection();

            tblRecordsHtml = '';

        }
    });
    tblUsers.where("UserID", "==", UserObject.uid).get().then(function (resp) {
        $(".collectionDays").val(resp.docs[0].data().collectionDays);
        $(".collectionDays").change();
        filterbyCollectionDay($(".collectionDays").val());
    });
}


function getTrasactionsByAccount(id) {
    clearTransactionFields();
    
    tblAccountCheques = db.collection("tbl_account_cheques");
    allTrasactions = [];
    groupedRecords = {};
    tblRecordsHtml = '';
    $('#acc-li-'+id).empty();

    tblAccountCheques.where("account_id", "==", id).get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
            // doc.data() is never undefined for query doc snapshots
            // console.log(doc.id, " => ", doc.data());
            doc.data().id = doc.id;
            var obj = doc.data();
            obj.id = doc.id;
            allTrasactions.push(obj);
        });
        allTrasactions = sortByKey(allTrasactions,"order_sequence",true);
        allTrasactions =sortByKey(allTrasactions,"date",true);
        groupedRecords = groupBy(allTrasactions, 'date');
        var totalAmount = Number($(".tablinks[data-accid=defaultOpen]").find("input").val());
        for (var key in groupedRecords) {
            // console.log(key);
            // console.log(groupedRecords[key]);
            var sumOfAmount=0;
            var accountid = "";
            var trCount = 0;
            for (var record in groupedRecords[key]) {
                // console.log(record);
                // console.log(groupedRecords[key][record]);
                var myRecord = groupedRecords[key][record];
                if (myRecord.status != "Cleared") {
                    trCount++;
                    if (myRecord.mode == "Buyer") {
                        sumOfAmount = sumOfAmount + Number(myRecord.withdrawal);
                    } else {
                        sumOfAmount = sumOfAmount - Number(myRecord.withdrawal);
                    }
                }
                accountid=myRecord.account_id;
                tblRecordsHtml += '<tr id=\'' + myRecord.id + '\' ' + (myRecord.status === "Cleared"?"style=\'display:none;\'":"") + '>'  +
                    '                                <td><i class="fa fa-bars"></i></td>' +
                    '                                <td class="active_flag flag ' + (myRecord.flag ? "" : "disable_flag") + '" id="flag-' + myRecord.id + '" onclick="updateTrasactionFlag(this, \'' + myRecord.id + '\', ' + myRecord.flag + ');">🚩</td>' +
                    '                                <td>' + (myRecord.cheque_no ? "#" : "") +'<span>' + myRecord.cheque_no + '</span></td>' +
                    '                                <td><span>' + myRecord.payee + '</span></td>' +
                    '                                <td><span>' + myRecord.mode + '</span></td>' +
                    '                                <td><span>' + myRecord.bank + '</span></td>' +
                    '                                <td>' +
                    '                                    <select' +
                    '                                            class="form-control red-text ' + (myRecord.status === "Un Clear" ? "status-unclear" : myRecord.status === "Cleared" ? "status-clear" : "status-topay") + '"' +
                    '                                            onchange="updateTrasactionStatus(this, \'' + myRecord.id + '\', $(this).val())">' +
                    '                                        <option class="red-text" value="Un Clear" ' + (myRecord.status === "Un Clear" ? "selected" : "") + '>Un-Clear</option>' +
                    '                                        <option class="orange-text" value="To Pay" ' + (myRecord.status === "To Pay" ? "selected" : "") + '>To Pay</option>' +
                    '                                        <option class="green-text" value="Cleared" ' + (myRecord.status === "Cleared" ? "selected" : "") + '>Cleared</option>' +
                    '                                    </select>' +
                    '                                </td>' +
                    '                                <td class="balance"><span>' + myRecord.withdrawal + '</span></td>' +
                    '                                <td><a href="#" type="button" onclick="editRecord(\'' + myRecord.id + '\')"> <i class="fa fa-pen"></i> &nbsp; Edit</a> &nbsp;<a href="#" type="button" onclick="deleteTrasaction(\'' + myRecord.id + '\')"> <i class="fa fa-trash"></i> &nbsp; Delete</a></td>' +
                    '                            </tr>';
            }
            totalAmount = totalAmount - sumOfAmount;
            var myLi = '<li ' + (trCount==0?"style=\'display:none;\'":"") + ' class="timelinePart records ' + weekday[new Date(key).getDay()] + '">' +
                '                <p class="timeline-date">' + (new Date(key).getDate() + '/' + (new Date(key).getMonth() + 1) + '/' + new Date(key).getFullYear()) + '</p>' +
                '                <div class="timeline-content">' +
                '                    <h3 style="font-weight: 300;">' + weekday[new Date(key).getDay()] +
                '                      <span id="remainingfromtotal" style="display:none;">' + totalAmount +'</span>    <a class="totalBalance" style="float:right;color: #737373;">'+
                'Balance Left:' +
                '                            ' + (totalAmount)+'</a>' +
                '                        <a class="alert_notification_tag" id="alert_notification_' + accountid + '" style="display:' + ((totalAmount < 0)?"block;":"none;")+'"> <i' +
                '                                class="fas fa-exclamation-circle"></i>' +
                '                            &nbsp;' +
                '                            Alert : Balance Shortage</a>' +
                '                        <a class=" Collection_date" style="display:none;"><i class="fas fa-rupee-sign"></i> &nbsp; Collection Date</a>' +
                '                    </h3>' +
                '                    <div class="responsive-table">' +
                '                        <table class="nowTable" id="draggable-' + key + '">' +
                '                            <thead>' +
                '                            <tr class="ui-state-default">' +
                '                                <th>Drag</th>' +
                '                                <th></th>' +
                '                                <th>Cheque no.</th>' +
                '                                <th>Payee</th>' +
                '                                <th>Mode</th>' +
                '                                <th>Bank</th>' +
                '                                <th  style="width: 10%;">Status</th>' +
                '                                <th>Withdrwal</th>' +
                '                                <th  style="width: 10%;">Action</th>' +
                '                            </tr>' +
                '                            </thead>' +
                '                            <tbody class="t_sortable">' +
                tblRecordsHtml +
                '                            </tbody>' +
                '                                <tfoot>' +
                '                                <tr class="ui-state-default">' +
                '                                    <th colspan="7"></th>' +
                '                                    <th>' + sumOfAmount + '</th>' +
                '                                    <th></th>' +
                '                                </tr>' +
                '                            </tfoot>' +
                '                        </table>' +
                '                    </div>' +
                '                </div>' +
                '            </li>';
            $('#acc-li-' + id).append(myLi);

            if (totalAmount < sumOfAmount) {
                $("alert_notification_" + accountid).show();
            } else {
                $("alert_notification_" + accountid).hide();
            }
            var $tabs = $('#draggable-' + key + '');
            $("tbody.t_sortable").sortable({
                connectWith: ".t_sortable",
                items: "> tr",
                appendTo: $tabs,
                helper: "clone",
                zIndex: 999990,
                update: function( ) {
                    console.log($(this).find("tr"));
                    var allrows = $(this).find("tr");
                    for (var i = 0; i < allrows.length; i++){
                        updateTrasactionSorting($(allrows[i]).attr("id"),i+1);
                    }


                    var totalAmount = Number($("#defaultOpen>input").val());
                    $(".timelinePart.records").each(function (ii, vv) {
                        var tbody = $(vv).find("table>tbody>tr");


                        var totalWithdrawl = 0;
                        $(tbody).each(function (i, v) {
                            totalWithdrawl += Number($(v).find(".balance>span").text());
                        });
                        $(vv).find("a.totalBalance").html("Balance Left: " + totalWithdrawl + "");
                        if (totalAmount < totalWithdrawl) {
                            $(vv).find(".alert_notification_tag").show();
                        } else {
                            $(vv).find(".alert_notification_tag").hide();
                        }
                        totalAmount = totalAmount - totalWithdrawl;
                    });
                }
            }).disableSelection();

            tblRecordsHtml = '';

        }
    });
    tblUsers.where("UserID", "==", UserObject.uid).get().then(function (resp) {
        console.log(resp.docs[0].data().collectionDays);
        $(".collectionDays").val(resp.docs[0].data().collectionDays);
        $(".collectionDays").change();
        filterbyCollectionDaytab( $(".collectionDays").val(), id);
    });
}

function addupdatetransaction(isUpdate) {
    var errorCount = 0;
    var InputsAll = $("#all-transaction-fields").find("input.mandatory-field");
    $(InputsAll).each(function (i, v) {
        if ($(v).attr("id") == "transaction_id") {

        } else {
            if ($(v).val()) {
                $(v).removeClass("invalidInput");
            } else {
                $(v).addClass("invalidInput");
                errorCount = errorCount + 1;
            }
        }
    });
    if ($("#status").val()) {
        $("#status").removeClass("invalidSelect");
    } else {
        $("#status").addClass("invalidSelect");
        errorCount = errorCount + 1;
    }
    if ($("#account-list").val()) {
        $("#account-list").removeClass("invalidSelect");
    } else {
        $("#account-list").addClass("invalidSelect");
        errorCount = errorCount + 1;
    }
    if (errorCount == 0) {

        if (isUpdate) {
            updateTrasaction(document.getElementById('transaction_id').value);
        } else {
            addTrasaction();
        }
    }
}

function addTrasaction(/*account_id, bank, cheque_no, flag, mode, order_sequence, payee, status, withdrawal*/) {
    tblAccountCheques = db.collection("tbl_account_cheques");
    tblAccountCheques.add({
        account_id: document.getElementById('account-list').value,
        bank: document.getElementById('account-list').options[document.getElementById('account-list').selectedIndex].text,
        cheque_no: document.getElementById('cheque_no').value,
        date: document.getElementById('transaction_date').value,
        flag: false,
        UserID: UserObject.uid,
        mode: document.getElementById('mode').value,
        order_sequence: 0,
        payee: document.getElementById('payee').value,
        status: document.getElementById('status').value,
        withdrawal: document.getElementById('withdrawal').value
    })
        .then(function (docRef) {
            console.log("Document written with ID: ", docRef.id);
            document.getElementById('account-list').value = '';
            document.getElementById('cheque_no').value = '';
            document.getElementById('transaction_date').value = '';
            document.getElementById('mode').value = '';
            document.getElementById('payee').value = '';
            document.getElementById('status').value = '';
            document.getElementById('withdrawal').value = '';
            getTrasactionsAll();
        })
        .catch(function (error) {
            console.error("Error adding document: ", error);
        });
}
$("#status").on("change", function () {
    if ($("#status").val() == "Un Clear")
        $("#status").removeClass("status-clear").removeClass("status-topay").addClass("status-unclear");
    if ($("#status").val() == "Cleared")
        $("#status").removeClass("status-unclear").removeClass("status-topay").addClass("status-clear");
    if ($("#status").val() == "To Pay")
        $("#status").removeClass("status-clear").removeClass("status-unclear").addClass("status-topay");
});
function deleteTrasaction(id) {
    tblAccountCheques = db.collection("tbl_account_cheques");
    tblAccountCheques.doc(id)
        .delete().then(function () {
            var trid = $("#" + id).parent().attr("id");
            $("#" + id).remove();
            var tbody = $("#" + trid).find("tr");
            console.log(tbody, trid);
            var totalWithdrawl = 0;
            $(tbody).each(function (i, v) {
                totalWithdrawl += Number($(v).find(".balance>span").text());
            });
            $("#" + trid).parent().parent().parent().find("a.totalBalance").html("Balance Left: " + totalWithdrawl + "");

            var totalAmount = Number($("#defaultOpen>input").val());
            $(".timelinePart.records").each(function (ii, vv) {
                var tbody = $(vv).find("table>tbody>tr");
                var totalWithdrawl = 0;
                $(tbody).each(function (i, v) {
                    totalWithdrawl += Number($(v).find(".balance>span").text());
                });
                if (totalAmount < totalWithdrawl) {
                    $(vv).find(".alert_notification_tag").show();
                } else {
                    $(vv).find(".alert_notification_tag").hide();
                }
                totalAmount = totalAmount - totalWithdrawl;
            });
        console.log("Document successfully deleted!");
    }).catch(function (error) {
        console.error("Error removing document: ", error);
    });
}

function updateTrasaction(id) {
    tblAccountCheques = db.collection("tbl_account_cheques");
    tblAccountCheques.doc(id).update({
        account_id: document.getElementById('account-list').value,
        bank: document.getElementById('account-list').options[document.getElementById('account-list').selectedIndex].text,
        cheque_no: document.getElementById('cheque_no').value,
        date: document.getElementById('transaction_date').value,
        flag: false,
        UserID: UserObject.uid,
        mode: document.getElementById('mode').value,
        order_sequence: 0,
        payee: document.getElementById('payee').value,
        status: document.getElementById('status').value,
        withdrawal: document.getElementById('withdrawal').value
    });

    var myRecord = {
        id: id,
        account_id: document.getElementById('account-list').value,
        bank: document.getElementById('account-list').options[document.getElementById('account-list').selectedIndex].text,
        cheque_no: document.getElementById('cheque_no').value,
        date: document.getElementById('transaction_date').value,
        flag: false,
        mode: document.getElementById('mode').value,
        order_sequence: 0,
        payee: document.getElementById('payee').value,
        status: document.getElementById('status').value,
        withdrawal: document.getElementById('withdrawal').value
    };
    var targetTr = $("#" + id);
    var tblRecordsHtml = '<tr id="' + id + '">' +
        '                                <td><i class="fa fa-bars"></i></td>' +
        '                                <td class="active_flag flag ' + (myRecord.flag ? "" : "disable_flag") + '" id="flag-' + myRecord.id + '" onclick="updateTrasactionFlag(this, \'' + myRecord.id + '\', ' + myRecord.flag + ');">🚩</td>' +
        '                                <td>' + (myRecord.cheque_no ? "#" : "") +'<span>' + myRecord.cheque_no + '</span></td>' +
        '                                <td><span>' + myRecord.payee + '</span></td>' +
        '                                <td><span>' + myRecord.mode + '</span></td>' +
        '                                <td><span>' + myRecord.bank + '</span></td>' +
        '                                <td>' +
        '                                    <select' +
        '                                            class="form-control red-text ' + (myRecord.status === "Un Clear" ? "status-unclear" : myRecord.status === "Cleared"?"status-clear":"status-topay") + '"'+
        '                                            onchange="updateTrasactionStatus(this, \'' + myRecord.id + '\', $(this).val())">' +
        '                                        <option class="red-text" value="Un Clear" ' + (myRecord.status === "Un Clear" ? "selected" : "") + '>Un-Clear</option>' +
        '                                        <option class="orange-text" value="To Pay" ' + (myRecord.status === "To Pay" ? "selected" : "") + '>To Pay</option>' +
        '                                        <option class="green-text" value="Cleared" ' + (myRecord.status === "Cleared" ? "selected" : "") + '>Cleared</option>' +
        '                                    </select>' +
        '                                </td>' +
        '                                <td class="balance"><span>' + myRecord.withdrawal + '</span></td>' +
        '                                <td><a href="#" type="button" onclick="editRecord(\'' + myRecord.id + '\')"> <i class="fa fa-pen"></i> &nbsp; Edit</a>&nbsp;<a href="#" type="button" onclick="deleteTrasaction(\'' + myRecord.id + '\')"> <i class="fa fa-trash"></i> &nbsp; Delete</a></td>' +
        '                            </tr>';

    $(targetTr).replaceWith(tblRecordsHtml);
    var tbody = $("#" + id).parent().find("tr");
    var totalWithdrawl = 0;
    $(tbody).each(function (i, v) {
        totalWithdrawl += Number($(v).find(".balance>span").text());
    });
    $("#" + id).parent().parent().parent().parent().find("a.totalBalance").html("Balance Left: "+totalWithdrawl+"");

    var totalAmount = Number($("#defaultOpen>input").val());
    $(".timelinePart.records").each(function (ii, vv) {
        var tbody = $(vv).find("table>tbody>tr");
        var totalWithdrawl = 0;
        $(tbody).each(function (i, v) {
            totalWithdrawl += Number($(v).find(".balance>span").text());
        });
        if (totalAmount < totalWithdrawl) {
            $(vv).find(".alert_notification_tag").show();
        } else {
            $(vv).find(".alert_notification_tag").hide();
        }
        totalAmount = totalAmount - totalWithdrawl;
    });
    clearTransactionFields();
}

function updateTrasactionSorting(id, order) {
console.log(id,order);
    tblAccountCheques = db.collection("tbl_account_cheques");
    tblAccountCheques.doc(id).update({
        order_sequence: order,
    }).then(function () {
       // getTrasactionsAll();
        console.log("Document sequence updated!");
    }).catch(function (error) {
        console.error("Error updating sequence: ", error);
    });
    // $(evt).toggleClass('disable_flag');

}
function updateTrasactionFlag(evt, id, flag) {
   
    if ($("#flag-" + id).hasClass("disable_flag")) {
        flag = true;
        $("#flag-"+id).removeClass("disable_flag");
    } else {
        $("#flag-" + id).addClass("disable_flag");
        flag = false;
    }
    // console.log(id);
    console.log(flag);
    tblAccountCheques = db.collection("tbl_account_cheques");
    tblAccountCheques.doc(id).update({
        flag: !flag,
    }).then(function () {
       // getTrasactionsAll();
        console.log("Document flag updated!");
    }).catch(function (error) {
        console.error("Error updating flag: ", error);
    });
    // $(evt).toggleClass('disable_flag');

}
function updateTrasactionStatus(evt, id, newValue) {
    // console.log(evt);
    // console.log(id);
    console.log(newValue);
    if (newValue == "Un Clear")
        $(evt).removeClass("status-clear").removeClass("status-topay").addClass("status-unclear");
    if (newValue == "Cleared")
       $(evt).removeClass("status-unclear").removeClass("status-topay").addClass("status-clear");
    if (newValue == "To Pay")
        $(evt).removeClass("status-clear").removeClass("status-unclear").addClass("status-topay");
    tblAccountCheques = db.collection("tbl_account_cheques");
    tblAccountCheques.doc(id).update({
        status: newValue,
    }).then(function () {
      //  getTrasactionsAll();
        console.log("Document status updated!");
    }).catch(function (error) {
        console.error("Error updating status: ", error);
    });
    // $(evt).toggleClass('disable_flag');

}

function editRecord(id) {
    var record = allTrasactions.find(x => x.id === id);
    document.getElementById('transaction_id').value = id;
    document.getElementById('account-list').value = record.account_id;
    document.getElementById('cheque_no').value = record.cheque_no;
    document.getElementById('transaction_date').value = record.date;
    document.getElementById('mode').value = record.mode;
    document.getElementById('payee').value = record.payee;
    document.getElementById('status').value = record.status;
    document.getElementById('withdrawal').value = record.withdrawal;
    if (record.status == "Un Clear")
        $("#status").removeClass("status-clear").removeClass("status-topay").addClass("status-unclear");
    if (record.status == "Cleared")
        $("#status").removeClass("status-unclear").removeClass("status-topay").addClass("status-clear");
    if (record.status == "To Pay")
        $("#status").removeClass("status-clear").removeClass("status-unclear").addClass("status-topay");

    $('#edit-transaction').show();
    $('#add-transaction').hide();

}
function editRecordAccount(id){
    var record = allTrasactions.find(x => x.id === id);
    document.getElementById('transaction_id').value = id;
    document.getElementById('account-list').value = record.account_id;
    document.getElementById('cheque_no').value = record.cheque_no;
    document.getElementById('transaction_date').value = record.date;
    document.getElementById('mode').value = record.mode;
    document.getElementById('payee').value = record.payee;
    document.getElementById('status').value = record.status;
    document.getElementById('withdrawal').value = record.withdrawal;
    document.getElementById("defaultOpen").click();
    $('#edit-transaction').show();
    $('#add-transaction').hide();

}
function clearTransactionFields() {
    document.getElementById('transaction_id').value = '';
    document.getElementById('account-list').value = '';
    document.getElementById('cheque_no').value = '';
    document.getElementById('transaction_date').value = '';
    document.getElementById('mode').value = '';
    document.getElementById('payee').value = '';
    document.getElementById('status').value = '';
    document.getElementById('withdrawal').value = '';
    $("#status").removeClass("status-clear").removeClass("status-unclear").removeClass("status-topay");

    $('#edit-transaction').hide();
    $('#add-transaction').show();

}
