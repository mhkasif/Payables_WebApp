var db;
var UserObject;
var tblAccounts/* = db.collection("tbl_accounts")*/;
var tblAccountCheques/* = db.collection("tbl_account_cheques")*/;
var tblUsers, tbl_transaction_notes;
var lastfetchedRecord;

//Local storage function to have weekdays 
var current_userid = localStorage.getItem("current_userid");
var weekday = new Array(7);
weekday[0] = "Sun";
weekday[1] = "Mon";
weekday[2] = "Tue";
weekday[3] = "Wed";
weekday[4] = "Thu";
weekday[5] = "Fri";
weekday[6] = "Sat";
var liRecords = '<tr>' +
    '                                <td><i class="fa fa-bars"></i></td>' +
    '                                <td>---</td>' +
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
    '                                        <option class="black-text" value="Bounced">Bounced</option>' +
    '                                    </select>' +
    '                                </td>' +
    '                                <td class="balance">50,000</td>' +
    '                                <td><a href="#"> <i class="fa fa-pen"></i></a></td>' +
    '                            </tr>';
var liTemplate = '<li class="timelinePart">' +
    '                <p class="timeline-date">23/04/19</p>' +
    '                <div class="timeline-content">' +
    '                    <h3 style="font-weight: 300;">Wednesday' +
    '                        <a class="totalBalance" data-title="This is the balance that is after deduction and to be carry forward to the next payment day" style="float:right;color: #737373;">Balance left after today :' +
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
    '                                <th></th>' +
    '                                <th>Sign</th>' +
    '                                <th></th>' +
    '                                <th>Submitter</th>' +
    '                                <th>Payment mode</th>' +
    '                                <th>Party Name</th>' +
    '                                <th>Transaction Type</th>' +
    '                                <th>Bank</th>' +
    '                                <th>Payment Status</th>' +
    '                                <th>Withdrwal</th>' +
    '                                <th>Action</th>' +
    '                            </tr>' +
    '                            </thead>' +
    '                            <tbody class="t_sortable">' +
    'REPLACE_ME' +
    '                            </tbody>' +
    '                                <tfoot>' +
    '                                <tr class="ui-state-default">' +
    '                                    <th colspan="8"></th>' +
    '                                    <th></th>' +
    '                                </tr>' +
    '                            </tfoot>' +
    '                        </table>' +
    '                    </div>' +
    '                </div>' +
    '            </li>';
var fireBaseConfigInfo;

//READ/FETCH ~ STRIPE SUBSCRIPTION DATA
function getCustomerSubscriptions() {
    let customerid = document.querySelector('#customerid').value;
    return fetch('/get-cutomer-subscriptions', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            customerid: customerid,
        }),
    })
        .then((response) => {
            return response.json();
        })
        .then((response) => {
            return response.response.data;

        });
}



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
            fireBaseConfigInfo = response;

        });
}
function initializeFirebase() {
    getFirebaseConfig().then(function () {
        var firebaseConfig = fireBaseConfigInfo;
        //initialize firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();
        }
    });
}

function addAccountActual() {

    if (!isOwner) {
        swal("You don't have the permission to add new account");
        return;
    }
    if (!$('#account_title').val()) {
        $('#account_title').addClass("invalidInput");
        return;
    }
    $('#account_title').removeClass("invalidInput");
    addAccount({ title: document.getElementById('account_title').value, UserID: userid, init_balance: 0 });
    document.getElementById('account_title').value = '';

}


//READ ~ BANK ACCOUNTS : it fetches all bank accounts from the database 
function getAccountsAll() {
    $('#tabs-accounts button:not([id=defaultOpen]):not([id=add-account])').remove();
    $('#account-list').empty();
    tblAccounts = db.collection("tbl_accounts");

    tblAccounts.where("UserID", "==", userid).get().then(function (querySnapshot) {
        // console.log(querySnapshot.docs.length);
        // console.log(querySnapshot.size);
        var htmlTabs = '';
        var SumOfAllInit_Balance = 0;
        querySnapshot.forEach(function (doc) {
            console.log(doc.data());
            // doc.data() is never undefined for query doc snapshots
            // console.log(doc.id, " => ", doc.data());
            SumOfAllInit_Balance += Number(doc.data().init_balance);
            if (doc.data().title === 'Cash in Hand') {
                htmlTabs += '<button class="tablinks" data-accid="' + doc.id + '" onclick="openTab(event, \'' + doc.id + '\')">' +
                    '<i class="fas fa-university"></i><br>' +
                    '    <b>' + doc.data().title + '</b>' +
                    '    <input placeholder="Enter Balance" type="number" ' +
                    '           onblur="updateAccount(\'' + doc.id + '\', \'' + doc.data().title + '\', this.value)"' +
                    '           value="' + doc.data().init_balance + '"/>' +
                    '</button>';
            } else {
                htmlTabs += '<button class="tablinks" data-accid="' + doc.id + '" onclick="openTab(event, \'' + doc.id + '\')">' +
                    '<i class="fas fa-university"></i><br>' +
                    '    <b>' + doc.data().title + '</b>' +
                    '    <input placeholder="Enter Balance" type="number" ' +
                    '           onblur="updateAccount(\'' + doc.id + '\', \'' + doc.data().title + '\', this.value)"' +
                    '           value="' + doc.data().init_balance + '"/>' +
                    '<a style="display: inherit;" onclick="deleteAccount(\'' + doc.id + '\')"> <i class="fas fa-minus-circle"></i> &nbsp; Delete Account</a>' +
                    '</button>';
            }
            var accTab = '  <div class="tabcontent" id="' + doc.id + '">\n' +
                '            <div style="display:none;" class="balance_in_account_bar">\n' +
                '        <input class="balance_input" placeholder="Search data within all transactions" onkeyup="advance_search_recordtab($(this).val(),\'' + doc.id + '\')"            '
                + '            type="text" />                                                                                                                  '
                + '    <b style="padding: 19px; border-radius: 8px; border: 1px solid #9999;color: #999;"><i class="fas fa-filter"></i> &nbsp; Filters        '
                + '        <a style="color: #19c9a0; background: #ccfff3; border: 1px solid;font-weight: 700;padding: 12px;border-radius: 38px;margin: 1%;" data-title="Cheques paid and are now deducted from your bank">           '
                + '            <input                                                                                                                                  '
                + '                class="1 clearchk1" name="clearPaymentCheckbox_unused"                                                                    '
                + '                style="width: 27px; height: 20px; vertical-align: text-bottom;"                                                                     '
                + '                value="Cleared"                                                                                                                   '
                + '                type="checkbox">&nbsp; Cleared &nbsp; <i class="fas fa-check"></i></a>                                                                                                 '
                + '            <a style="color: #f46083; background: #ffeaef; border: 1px solid;font-weight: 700;padding: 12px;border-radius: 38px;margin: 1%;" data-title="Cheques that are paid but un-clear"><input              '
                + '                class="1" name="clearPaymentCheckbox_unused"                                                                      '
                + '                style="width: 27px; height: 20px; vertical-align: text-bottom;"                                                                     '
                + '                value="Un Clear"                                                                                                                    '
                + '                type="checkbox">&nbsp; Un-Clear &nbsp; <i class="fas fa-exclamation-circle"></i></a>                                                                                                        '
                + '                <a style="color: #fac200; background: #fffae8; border: 1px solid;font-weight: 700;padding: 12px;border-radius: 38px;margin: 1%;" data-title="Cheques that is still to be paid"><input      '
                + '                    class="1" name="clearPaymentCheckbox_unused"                                                                '
                + '                    style="width: 27px; height: 20px; vertical-align: text-bottom;"                                                                 '
                + '                    value="To Pay"                                                                                                                  '
                + '                    type="checkbox">&nbsp; To Pay &nbsp; <i class="fas fa-bell"></i></a>                                                                                                      '
                + '                <a style="color: #fac200; background: #fffae8; border: 1px solid;font-weight: 700;padding: 12px;border-radius: 38px;margin: 1%;" data-title="Cheques that is still to be paid"><input      '
                + '                    class="1" name="clearPaymentCheckbox_unused"                                                                '
                + '                    style="width: 27px; height: 20px; vertical-align: text-bottom;"                                                                 '
                + '                    value="Bounced"                                                                                                                  '
                + '                    type="checkbox">&nbsp; Bounced &nbsp; <i class="fas fa-bell"></i></a>                                                                                                      '
                + '    </b>                                                                                                                                            '
                + '                <select class="select collectionDaysunused" multiple id="selectbox_' + doc.id + '" onchange="filterbyCollectionDaytab($(this).val(),\'' + doc.id + '\');" style="float: right; margin: -7px 11px;">                   '
                + '                                                                                         '
                + '                    <option>Mon</option>                                                                                                         '
                + '                    <option>Tue</option>                                                                                                        '
                + '                    <option>Wed</option>                                                                                                      '
                + '                    <option>Thu</option>                                                                                                       '
                + '                    <option>Fri</option>                                                                                                         '
                + '                    <option>Sat</option>                                                                                                       '
                + '                    <option>Sun</option>                                                                                                         '
                + '                </select>                     </div><ul style="display:none;" id="acc-li-' + doc.id + '" class="timeline"></ul></div>';
            $("#All").after(accTab);
            $('#account-list').append('<option value="' + doc.id + '">' + doc.data().title + '</option>');
        });

        $('#defaultOpen').find("input").val(SumOfAllInit_Balance);
        $('#defaultOpen').after(htmlTabs);
        document.getElementById("defaultOpen").click();

    });
}

function getAccountByName(title) {
    tblAccounts = db.collection("tbl_accounts");

    tblAccounts.where("title", "==", title).where("UserID", "==", userid).get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data());
            return doc.data();
        });
    });
}


//WRITE: Add Bank Accounts into the system 
function addAccount(obj) {
    if (!isOwner) {
        swal("You don't have the permission for this feature");
        return;
    }
    tblAccounts = db.collection("tbl_accounts");
    tblAccounts.add({
        title: obj.title,
        init_balance: obj.init_balance,
        UserID: userid
    })
        .then(function (docRef) {
            console.log("Document written with ID: ", docRef.id);
            db.collection('tbl_audit_log').add({
                content: `Account Added <b>${obj.title}</b>`,
                now: (new Date()).getTime(),
                party: '',
                date: '',
                groupid:localStorage.getItem("groupid"),
                amount: '',
                user: localStorage.getItem("user"),
                refId: userid,
                collection: 'Account Added'
            });
            getAccountsAll();
        })
        .catch(function (error) {
            console.error("Error adding document: ", error);
        });
}

//WRITE: Using the input field it lets the user update the initial balance 
function updateAccount(id, title, init_balance) {
    if (!isOwner) {
        swal("You don't have the permission to update details");
        return;
    }
    tblAccounts = db.collection("tbl_accounts");
    tblAccounts.doc(id).update({
        title: title,
        UserID: userid,
        init_balance: parseFloat(init_balance)
    }).then(function () {
        db.collection('tbl_audit_log').add({
            content: `Account updated <b>${title}</b> balance <b>${init_balance}</b>`,
            now: (new Date()).getTime(),
            party: '',
            date: '',
            groupid:localStorage.getItem("groupid"),
            user: localStorage.getItem("user"),
            amount: '',
            refId: userid,
            collection: 'Accounts'
        });
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
    if (!isOwner) {
        swal("You don't have the permission to delete");
        return;
    }
    SwalConfirmBox("Are you sure?","ContinueToDeleteAccount('"+id+"');");
}

function ContinueToDeleteAccount(id){
    tblAccounts = db.collection("tbl_accounts");
    tblAccountCheques.where("UserID","==",userid).where("account_id", "==", id).get().then(function (querySnapshot) {
        console.log(querySnapshot.docs.length);
        if (querySnapshot.docs.length == 0) {
                tblAccounts.doc(id)
                    .delete().then(function () {
                        db.collection('tbl_audit_log').add({
                            content: `Account Deleted <b>${id}</b>`,
                            now: (new Date()).getTime(),
                            party: '',
                            groupid:localStorage.getItem("groupid"),
                            user: localStorage.getItem("user"),
                            date: '',
                            amount: '',
                            refId: userid,
                            collection: 'Accounts'
                        });
                        getAccountsAll();
                        console.log("Document successfully deleted!");
                    }).catch(function (error) {
                        console.error("Error removing document: ", error);
                    });
        } else {
            swal("Account cannot be deleted because it has transactions associated.");
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

function sortByKey(array, key, isAsc) {
    if (isAsc) {
        return array.sort(function (a, b) {
            var x = a[key]; var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    } else {
        return array.sort(function (a, b) {
            var x = a[key]; var y = b[key];
            return ((x > y) ? -1 : ((x < y) ? 1 : 0));
        });
    }

}

function GetTransactionGeneral(account_id) {
    if (account_id) {
        getTrasactionsByAccount(account_id);
    } else {
        getTrasactionsAll();
    }
    lastfetchedRecord = null;
}

function getTrasactionsAll() {
    clearTransactionFields();

	
    tblAccountCheques = db.collection("tbl_account_cheques").where("UserID", "==", userid);
    if(!isOwner){
        tblAccountCheques =  tblAccountCheques.where("groupid","==",groupid);
    }
    if(isSubmitter){
        tblAccountCheques = tblAccountCheques.where("added_by","==",current_userid)
    }
    tblAccountCheques = tblAccountCheques.limit(20);

    allTrasactions = [];
    groupedRecords = {};
    tblRecordsHtml = '';
    $('#all-transactions li:not([id=add-entry-all])').remove();

	    tblAccountCheques.get().then(function (querySnapshot) {
        console.log(querySnapshot,"Here it came");


        querySnapshot.forEach(function (doc) {
            // doc.data() is never undefined for query doc snapshots
            // console.log(doc.id, " => ", doc.data());
            doc.data().id = doc.id;
            var obj = doc.data();
            obj.id = doc.id;
            allTrasactions.push(obj);
        });
        lastfetchedRecord = querySnapshot.docs[querySnapshot.docs.length - 1];
        allTrasactions = sortByKey(allTrasactions, "order_sequence", true);
        allTrasactions = sortByKey(allTrasactions, "date", true);
        groupedRecords = groupBy(allTrasactions, 'date');
        var tbodyindex = 0;
        var totalAmount = Number($(".tablinks[data-accid=defaultOpen]").find("input").val());
        for (var key in groupedRecords) {
            tbodyindex = tbodyindex + 1;
            var sumOfAmount = 0;
            var accountid = "";
            var trCount = 0;
            for (var record in groupedRecords[key]) {
                var myRecord = groupedRecords[key][record];
                trCount++;
                if (myRecord.status != "Bounced") {
                    if (myRecord.mode == "Buyer") {
                        sumOfAmount = sumOfAmount + Number(myRecord.withdrawal);
                    } else {
                        sumOfAmount = sumOfAmount - Number(myRecord.withdrawal);
                    }
                }
                var withdrawalSpan = "";
                if (myRecord.mode == "Buyer") {
                    withdrawalSpan = "<span " + (myRecord.status === "Bounced" ? "style='text-decoration: line-through;'" : "") + ">" + myRecord.withdrawal + "</span>";
                }
                else{
                    withdrawalSpan = "<span " + (myRecord.status === "Bounced" ? "style='text-decoration: line-through;'" : "") + ">(" + myRecord.withdrawal + ")</span>";
                }
                               
                var OverAllStatus = "Status: "+myRecord.is_signed;
                if(myRecord.ApprovedBy){
                    OverAllStatus = OverAllStatus +" 🠪 Signed By: " +myRecord.ApprovedBy;
                }
                if(myRecord.Approver_First_Name){
                    OverAllStatus = OverAllStatus +" 🠪 "  + myRecord.Approver_First_Name;
                } 
                if(myRecord.Approver_Second_Name){
                    OverAllStatus = OverAllStatus +" 🠪 "  + myRecord.Approver_Second_Name;
                } 

                if(myRecord.Approver_Third_Name){
                    OverAllStatus = OverAllStatus +" 🠪 "  + myRecord.Approver_Third_Name;
                } 
                accountid = myRecord.account_id;
                tblRecordsHtml += '<tr class="'+myRecord.is_signed+' ApprovalFiltersClass" id=\'' + myRecord.id + '\' data-rcdamt=\'' + myRecord.withdrawal + '\'>' +
                    '                                <td><i class="fa fa-bars"></i></td>' +
                    '                                <td  data-title="'+OverAllStatus+'" onclick="sign_approve_transaction(\''+myRecord.id+'\',\''+myRecord.is_signed+'\',this);">'+(myRecord.is_signed=="Approved"?"<i class='fa fa-check-circle' style='font-size:25px;color: #56bea6;opacity: 1;'></i>":myRecord.is_signed=="Denied"?"<i class='fas fa-times-circle' style='font-size: 25px;color: #ff88a4;opacity: 1;'></i>":"---")+'</td>' +
                    '                                <td class="active_flag flag ' + (myRecord.flag ? "" : "disable_flag") + '" id="flag_' + myRecord.id + '" onclick="updateTrasactionFlag(this, \'' + myRecord.id + '\', ' + myRecord.flag + ');">🚩</td>' +
                    '                                <td data-title="'+(myRecord.submitter?myRecord.submitter+"-"+myRecord.group:"")+'"><a class="submitter_initial">'+(myRecord.submitter?myRecord.submitter.substring(0,1):"-")+'</a></td>' +
                    '                                <td>' + (myRecord.cheque_no ? "#" : "") + '<span>' + myRecord.cheque_no + '</span></td>' +
                    '                                <td><span>' + myRecord.payee + '</span></td>' +
                    '                                <td><span>' + myRecord.mode + '</span></td>' +
                    '                                <td><span>' + myRecord.bank + '</span></td>' +
                    '                                <td>' +
                    '                                    <select' +
                    '                                            class="form-control red-text ' + (myRecord.status === "Un Clear" ? "status-unclear" : myRecord.status === "Cleared" ? "status-clear" : myRecord.status === "Bounced" ? "status-bounced" : "status-topay") + '"' +
                    '                                            onchange="updateTrasactionStatus(this, \'' + myRecord.id + '\', $(this).val())">' +
                    '                                        <option class="red-text" value="Un Clear" ' + (myRecord.status === "Un Clear" ? "selected" : "") + '>Un-Clear</option>' +
                    '                                        <option class="orange-text" value="To Pay" ' + (myRecord.status === "To Pay" ? "selected" : "") + '>To Pay</option>' +
                    '                                        <option class="green-text" value="Cleared" ' + (myRecord.status === "Cleared" ? "selected" : "") + '>Cleared</option>' +
                    '                                        <option class="black-text" value="Bounced" ' + (myRecord.status === "Bounced" ? "selected" : "") + '>Bounced</option>' +
                    '                                    </select>' +
                    '                                </td>' +
                    '                                <td class="balance">' + withdrawalSpan + '</td>' +
                    '                                <td><i class="far fa-sticky-note" href="#" '+(myRecord.notes?"":"style=\'opacity:0.2;\'")+' onclick="open_notes_modal(\''+myRecord.id+'\',\''+myRecord.cheque_no+'\');" title="'+(myRecord.notes?myRecord.notes:"No notes added. click to add.")+'"></i></td>' +
                    '                                <td><a href="#" onclick="editRecord(\'' + myRecord.id + '\')"> <i class="fa fa-pen"></i></a> &nbsp;<a href="#" style="color:#f46083;" onclick="deleteTrasaction(\'' + myRecord.id + '\')"> <i class="fa fa-trash"></i></a></td>' +
                    '                            </tr>';
            }
            var draggablekey = key.split("/").join("_");
            totalAmount = totalAmount + sumOfAmount;
            var myLi = '<li ' + (trCount == 0 ? "style=\'display:none;\'" : "") + ' class="timelinePart records ' + weekday[new Date(key).getDay()] + '">' +
                '                <p class="timeline-date">' + (new Date(key).getDate() + '/' + (new Date(key).getMonth() + 1) + '/' + new Date(key).getFullYear()) + '</p>' +
                '                <div class="timeline-content">' +
                '                    <h3 style="font-weight: 300;">' + weekday[new Date(key).getDay()] +
                '                      <span id="remainingfromtotal" style="display:none;">' + totalAmount + '</span> &nbsp;<a class="totalBalance" style="float:right;color: #737373;">' +
                '<i class="far fa-question-circle" title="This is the balance that is after deduction and to be carry forward to the next payment day"></i> &nbsp; <u>Balance carry forward :</u>' +
                '                            ' + (totalAmount) + ' &nbsp; <i class="fas fa-level-down-alt" style="position: absolute;color: #9999; line-height: 2; font-size: 16px;"></i> </a>' +
                '                        <a class="alert_notification_tag"  style="display:' + ((totalAmount < 0) ? "block;" : "none;") + '"> <i' +
                '                                class="fas fa-exclamation-circle"></i>' +
                '                            &nbsp;' +
                '                            Alert : Balance Shortage</a>' +
                '                        <a class=" Collection_date" style="display:none;"><i class="fas fa-rupee-sign"></i> &nbsp; Collection Date</a>' +
                '                    </h3>' +
                '                    <div class="responsive-table">' +
                '                        <table class="nowTable" id="draggable-' + draggablekey + '">' +
                '                            <thead>' +
                '                            <tr class="ui-state-default">' +
                '                                <th></th>' +
                '                                <th>Sign</th>' +
                '                                <th></th>' +
                '                                <th>Submitter</th>' +
                '                                <th>Payment mode</th>' +
                '                                <th>Party Name</th>' +
                '                                <th>Transaction Type</th>' +
                '                                <th>Payment Source</th>' +
                '                                <th style="width: 10%;">Payment Status</th>' +
                '                                <th>Amount</th>' +
                '                                <th></th>' +
                '                                <th style="width: 10%;">Action</th>' +
                '                            </tr>' +
                '                            </thead>' +
                '                            <tbody data-rcddate="' + key + '" id="tbody_' + key + '_' + tbodyindex + '" class="t_sortable">' +
                tblRecordsHtml +
                '                            </tbody>' +
                '                                <tfoot>' +
                '                                <tr class="ui-state-default">' +
                '                                    <th colspan="9" style="text-align: right;">Balance:</th>' +
                '                                    <th>' + sumOfAmount + '</th>' +
                '                                    <th colspan="2"></th>' +
                '                                </tr>' +
                '                            </tfoot>' +
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
	            var did = '#draggable-' + draggablekey;
            var tabs = $(did);
            $("tbody.t_sortable").sortable({
                connectWith: ".t_sortable",
                items: "> tr",
                appendTo: tabs,
                helper: "clone",
                zIndex: 999990,
                update: function (event, ui) {

                    console.log($(this).find("tr"));
                    var allrows = $(this).find("tr");
                    updateTrasactionSorting($(ui.item[0]).attr("id"), 0, ui.item[0]);

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
    tblUsers.where("UserID", "==", userid).get().then(function (resp) {
        $(".collectionDays").val(resp.docs[0].data().collectionDays);
        $(".collectionDays").change();
        filterRecordsChecked();
        filterRecords();
        filterbyCollectionDay($(".collectionDays").val());
    });
}

//READ : this function is for the 'All Bank/Payment Sources' tab to show all trsactions with 

function getTrasactionsAllPagination() {
    clearTransactionFields();
    console.log("here it comes", lastfetchedRecord);
	    
    tblAccountCheques = db.collection("tbl_account_cheques").where("UserID", "==", userid);
    if(!isOwner){
        tblAccountCheques =  tblAccountCheques.where("groupid","==",groupid);
    }
    if(isSubmitter){
        tblAccountCheques = tblAccountCheques.where("added_by","==",current_userid);
    }
    tblAccountCheques = tblAccountCheques.startAfter(lastfetchedRecord).limit(20);

    allTrasactions = [];
    groupedRecords = {};
    tblRecordsHtml = '';
    // $('#all-transactions li:not([id=add-entry-all])').remove();

    tblAccountCheques.get().then(function (querySnapshot) {

        querySnapshot.forEach(function (doc) {
            // doc.data() is never undefined for query doc snapshots
            // console.log(doc.id, " => ", doc.data());
            doc.data().id = doc.id;
            var obj = doc.data();
            obj.id = doc.id;
            allTrasactions.push(obj);
        });
        lastfetchedRecord = querySnapshot.docs[querySnapshot.docs.length - 1];
        allTrasactions = sortByKey(allTrasactions, "order_sequence", true);
        allTrasactions = sortByKey(allTrasactions, "date", true);
        groupedRecords = groupBy(allTrasactions, 'date');
        var tbodyindex = 0;
        var totalAmount = Number($(".tablinks[data-accid=defaultOpen]").find("input").val());
        for (var key in groupedRecords) {
            // console.log(key);
            // console.log(groupedRecords[key]);
            tbodyindex = tbodyindex + 1;
            var sumOfAmount = 0;
            var accountid = "";
            var trCount = 0;
            for (var record in groupedRecords[key]) {
                // console.log(record);
                // console.log(groupedRecords[key][record]);
                var myRecord = groupedRecords[key][record];
                trCount++;
                if (myRecord.status != "Cleared") {
                    if (myRecord.mode == "Buyer") {
                        sumOfAmount = sumOfAmount + Number(myRecord.withdrawal);
                    } else {
                        sumOfAmount = sumOfAmount - Number(myRecord.withdrawal);
                    }
                }
                var withdrawalSpan = "";
                if (myRecord.mode == "Buyer") {
                    withdrawalSpan = "<span " + (myRecord.status === "Bounced" ? "style='text-decoration: line-through;'" : "") + ">" + myRecord.withdrawal + "</span>";
                }
                else {
                    withdrawalSpan = "<span " + (myRecord.status === "Bounced" ? "style='text-decoration: line-through;'" : "") + ">(" + myRecord.withdrawal + ")</span>";
                }
               
                var OverAllStatus = "Status: "+myRecord.is_signed;
                if(myRecord.Approver_First_Name){
                    OverAllStatus = OverAllStatus +" 🠪 "  + myRecord.Approver_First_Name;
                } 
                if(myRecord.Approver_Second_Name){
                    OverAllStatus = OverAllStatus +" 🠪 "  + myRecord.Approver_Second_Name;
                } 

                if(myRecord.Approver_Third_Name){
                    OverAllStatus = OverAllStatus +" 🠪 "  + myRecord.Approver_Third_Name;
                }
                accountid = myRecord.account_id;
                tblRecordsHtml += '<tr  class="'+myRecord.is_signed+' ApprovalFiltersClass" id=\'' + myRecord.id + '\' data-rcdamt=\'' + myRecord.withdrawal + '\'>' +
                    '                                <td><i class="fa fa-bars"></i></td>' +
                    '                                <td  data-title="'+ OverAllStatus+ '" onclick="sign_approve_transaction(\''+myRecord.id+'\',\''+myRecord.is_signed+'\',this);">'+(myRecord.is_signed=="Approved"?"<i class='fa fa-check-circle' style='font-size:25px;color: #56bea6;opacity: 1;'></i>":myRecord.is_signed=="Denied"?"<i class='fas fa-times-circle' style='font-size: 25px;color: #ff88a4;opacity: 1;'></i>":"---")+'</td>' +
                    '                                <td class="active_flag flag ' + (myRecord.flag ? "" : "disable_flag") + '" id="flag_' + myRecord.id + '" onclick="updateTrasactionFlag(this, \'' + myRecord.id + '\', ' + myRecord.flag + ');">🚩</td>' +
                    '                                <td data-title="'+(myRecord.submitter?myRecord.submitter+"-"+myRecord.group:"")+'"><a class="submitter_initial">'+(myRecord.submitter?myRecord.submitter.substring(0,1):"-")+'</a></td>' +
                    '                                <td>' + (myRecord.cheque_no ? "#" : "") + '<span>' + myRecord.cheque_no + '</span></td>' +
                    '                                <td><span>' + myRecord.payee + '</span></td>' +
                    '                                <td><span>' + myRecord.mode + '</span></td>' +
                    '                                <td><span>' + myRecord.bank + '</span></td>' +
                    '                                <td>' +
                    '                                    <select' +
                    '                                            class="form-control red-text ' + (myRecord.status === "Un Clear" ? "status-unclear" : myRecord.status === "Cleared" ? "status-clear" : myRecord.status === "Bounced" ? "status-bounced" : "status-topay") + '"' +
                    '                                            onchange="updateTrasactionStatus(this, \'' + myRecord.id + '\', $(this).val())">' +
                    '                                        <option class="red-text" value="Un Clear" ' + (myRecord.status === "Un Clear" ? "selected" : "") + '>Un-Clear</option>' +
                    '                                        <option class="orange-text" value="To Pay" ' + (myRecord.status === "To Pay" ? "selected" : "") + '>To Pay</option>' +
                    '                                        <option class="green-text" value="Cleared" ' + (myRecord.status === "Cleared" ? "selected" : "") + '>Cleared</option>' +
                    '                                        <option class="black-text" value="Bounced" ' + (myRecord.status === "Bounced" ? "selected" : "") + '>Bounced</option>' +
                    '                                    </select>' +
                    '                                </td>' +
                    '                                <td class="balance">' + withdrawalSpan + '</td>' +
                    '                                <td><i class="far fa-sticky-note" href="#" '+(myRecord.notes?"":"style=\'opacity:0.2;\'")+' onclick="open_notes_modal(\''+myRecord.id+'\',\''+myRecord.cheque_no+'\');" data-title="'+(myRecord.notes?myRecord.notes:"No notes added. click to add.")+'"></i></td>' +
                    '                                <td><a href="#" onclick="editRecord(\'' + myRecord.id + '\')"> <i class="fa fa-pen"></i></a> &nbsp;<a href="#" style="color:#f46083;" onclick="deleteTrasaction(\'' + myRecord.id + '\')"> <i class="fa fa-trash"></i></a></td>' +
                    '                            </tr>';
            }
            totalAmount = totalAmount + sumOfAmount;
            var myLi = '<li ' + (trCount == 0 ? "style=\'display:none;\'" : "") + ' class="timelinePart records ' + weekday[new Date(key).getDay()] + '">' +
                '                <p class="timeline-date">' + (new Date(key).getDate() + '/' + (new Date(key).getMonth() + 1) + '/' + new Date(key).getFullYear()) + '</p>' +
                '                <div class="timeline-content">' +
                '                    <h3 style="font-weight: 300;">' + weekday[new Date(key).getDay()] +
                '                      <span id="remainingfromtotal" style="display:none;">' + totalAmount + '</span> &nbsp;<a class="totalBalance" style="float:right;color: #737373;">' +
                '<i class="far fa-question-circle" data-title="This is the balance that is after deduction and to be carry forward to the next payment day"></i> &nbsp; <u>Balance carry forward :</u>' +
                '                            ' + (totalAmount) + ' &nbsp; <i class="fas fa-level-down-alt" style="position: absolute;color: #9999; line-height: 2; font-size: 16px;"></i> </a>' +
                '                        <a class="alert_notification_tag"  style="display:' + ((totalAmount < 0) ? "block;" : "none;") + '"> <i' +
                '                                class="fas fa-exclamation-circle"></i>' +
                '                            &nbsp;' +
                '                            Alert : Balance Shortage</a>' +
                '                        <a class=" Collection_date" style="display:none;"><i class="fas fa-rupee-sign"></i> &nbsp; Collection Date</a>' +
                '                    </h3>' +
                '                    <div class="responsive-table">' +
                '                        <table class="nowTable" id="draggable-' + draggablekey + '">' +
                '                            <thead>' +
                '                            <tr class="ui-state-default">' +
                '                                <th></th>' +
                '                                <th>Sign</th>' +
                '                                <th></th>' +
                '                                <th>Submitter</th>' +
                '                                <th>Payment mode</th>' +
                '                                <th>Party Name</th>' +
                '                                <th>Transaction Type</th>' +
                '                                <th>Bank</th>' +
                '                                <th  style="width: 10%;">Status</th>' +
                '                                <th>Amount</th>' +
                '                                <th></th>' +
                '                                <th style="width: 10%;">Action</th>' +
                '                            </tr>' +
                '                            </thead>' +
                '                            <tbody data-rcddate="' + key + '" id="tbody_' + key + '_' + tbodyindex + '" class="t_sortable">' +
                tblRecordsHtml +
                '                            </tbody>' +
                '                                <tfoot>' +
                '                                <tr class="ui-state-default">' +
                '                                    <th colspan="9" style="text-align: right;">Balance:</th>' +
                '                                    <th>' + sumOfAmount + '</th>' +
                '                                    <th colspan="2"></th>' +
                '                                </tr>' +
                '                            </tfoot>' +
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
            var $tabs = $('#draggable-' + draggablekey + '');
            $("tbody.t_sortable").sortable({
                connectWith: ".t_sortable",
                items: "> tr",
                appendTo: $tabs,
                helper: "clone",
                zIndex: 999990,
                update: function (event, ui) {

                    console.log($(this).find("tr"));
                    var allrows = $(this).find("tr");
                    updateTrasactionSorting($(ui.item[0]).attr("id"), 0, ui.item[0]);

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
    tblUsers.where("UserID", "==", userid).get().then(function (resp) {
        $(".collectionDays").val(resp.docs[0].data().collectionDays);
        $(".collectionDays").change();
        filterbyCollectionDay($(".collectionDays").val());
        filterRecordsChecked();
        filterRecords();
    });
}


//READ : All transactions under the 'All Bank/Payment Sources' TAB , to show transactions from all sources.

function getTrasactionsByAccount(id) {
    console.log(id);
    clearTransactionFields();
		    tblAccountCheques = db.collection("tbl_account_cheques").where("UserID", "==", userid).where("account_id", "==", id);
   
    if(!isOwner){
        tblAccountCheques =  tblAccountCheques.where("groupid","==",groupid);
    }
    if(isSubmitter){
        tblAccountCheques = tblAccountCheques.where("added_by","==",current_userid);
    }
    tblAccountCheques = tblAccountCheques.limit(20);

    allTrasactions = [];
    groupedRecords = {};
    tblRecordsHtml = '';
    $('#all-transactions li:not([id=add-entry-all])').remove();

    tblAccountCheques.get().then(function (querySnapshot) {

        querySnapshot.forEach(function (doc) {
            // doc.data() is never undefined for query doc snapshots
            // console.log(doc.id, " => ", doc.data());
            doc.data().id = doc.id;
            var obj = doc.data();
            obj.id = doc.id;
            allTrasactions.push(obj);
        });
        console.log(allTrasactions);
        lastfetchedRecord = querySnapshot.docs[querySnapshot.docs.length - 1];
        allTrasactions = sortByKey(allTrasactions, "order_sequence", true);
        allTrasactions = sortByKey(allTrasactions, "date", true);
        groupedRecords = groupBy(allTrasactions, 'date');
        var tbodyindex = 0;
        var totalAmount = Number($(".tablinks[data-accid=defaultOpen]").find("input").val());
        for (var key in groupedRecords) {
            // console.log(key);
            // console.log(groupedRecords[key]);
            tbodyindex = tbodyindex + 1;
            var sumOfAmount = 0;
            var accountid = "";
            var trCount = 0;
            for (var record in groupedRecords[key]) {
                // console.log(record);
                // console.log(groupedRecords[key][record]);
                var myRecord = groupedRecords[key][record];
                trCount++;
                if (myRecord.status != "Cleared") {
                    if (myRecord.mode == "Buyer") {
                        sumOfAmount = sumOfAmount + Number(myRecord.withdrawal);
                    } else {
                        sumOfAmount = sumOfAmount - Number(myRecord.withdrawal);
                    }
                }

                var withdrawalSpan = "";
                if (myRecord.mode == "Buyer") {
                    withdrawalSpan = "<span " + (myRecord.status === "Bounced" ? "style='text-decoration: line-through;'" : "") + ">" + myRecord.withdrawal + "</span>";
                }
                else{
                    withdrawalSpan = "<span " + (myRecord.status === "Bounced" ? "style='text-decoration: line-through;'" : "") + ">(" + myRecord.withdrawal + ")</span>";
                }
                var OverAllStatus = "Status: "+myRecord.is_signed;
                if(myRecord.Approver_First_Name){
                    OverAllStatus = OverAllStatus +" 🠪 "  + myRecord.Approver_First_Name;
                } 
                if(myRecord.Approver_Second_Name){
                    OverAllStatus = OverAllStatus +" 🠪 "  + myRecord.Approver_Second_Name;
                } 

                if(myRecord.Approver_Third_Name){
                    OverAllStatus = OverAllStatus +" 🠪 "  + myRecord.Approver_Third_Name;
                }
                accountid = myRecord.account_id;
                tblRecordsHtml += '<tr  class="'+myRecord.is_signed+' ApprovalFiltersClass" id=\'' + myRecord.id + '\' data-rcdamt=\'' + myRecord.withdrawal + '\'>' +
                    '                                <td><i class="fa fa-bars"></i></td>' +
                    '                                <td  data-title="'+OverAllStatus+'" onclick="sign_approve_transaction(\''+myRecord.id+'\',\''+myRecord.is_signed+'\',this);">'+(myRecord.is_signed=="Approved"?"<i class='fa fa-check-circle' style='font-size:25px;color: #56bea6;opacity: 1;'></i>":myRecord.is_signed=="Denied"?"<i class='fas fa-times-circle' style='font-size: 25px;color: #ff88a4;opacity: 1;'></i>":"---")+'</td>' +
                    '                                <td class="active_flag flag ' + (myRecord.flag ? "" : "disable_flag") + '" id="flag_' + myRecord.id + '" onclick="updateTrasactionFlag(this, \'' + myRecord.id + '\', ' + myRecord.flag + ');">🚩</td>' +
                    '                                <td data-title="'+(myRecord.submitter?myRecord.submitter+"-"+myRecord.group:"")+'"><a class="submitter_initial">'+(myRecord.submitter?myRecord.submitter.substring(0,1):"-")+'</a></td>' +
                    '                                <td>' + (myRecord.cheque_no ? "#" : "") + '<span>' + myRecord.cheque_no + '</span></td>' +
                    '                                <td><span>' + myRecord.payee + '</span></td>' +
                    '                                <td><span>' + myRecord.mode + '</span></td>' +
                    '                                <td><span>' + myRecord.bank + '</span></td>' +
                    '                                <td>' +
                    '                                    <select' +
                    '                                            class="form-control red-text ' + (myRecord.status === "Un Clear" ? "status-unclear" : myRecord.status === "Cleared" ? "status-clear" : myRecord.status === "Bounced" ? "status-bounced" : "status-topay") + '"' +
                    '                                            onchange="updateTrasactionStatus(this, \'' + myRecord.id + '\', $(this).val())">' +
                    '                                        <option class="red-text" value="Un Clear" ' + (myRecord.status === "Un Clear" ? "selected" : "") + '>Un-Clear</option>' +
                    '                                        <option class="orange-text" value="To Pay" ' + (myRecord.status === "To Pay" ? "selected" : "") + '>To Pay</option>' +
                    '                                        <option class="green-text" value="Cleared" ' + (myRecord.status === "Cleared" ? "selected" : "") + '>Cleared</option>' +
                    '                                        <option class="black-text" value="Bounced" ' + (myRecord.status === "Bounced" ? "selected" : "") + '>Bounced</option>' +
                    '                                    </select>' +
                    '                                </td>' +
                    '                                <td class="balance">' + withdrawalSpan + '</td>' +
                    '                                <td><i class="far fa-sticky-note" href="#" '+(myRecord.notes?"":"style=\'opacity:0.2;\'")+' onclick="open_notes_modal(\''+myRecord.id+'\',\''+myRecord.cheque_no+'\');" title="'+(myRecord.notes?myRecord.notes:"No notes added. click to add.")+'"></i></td>' +
                    '                                <td><a href="#" onclick="editRecord(\'' + myRecord.id + '\')"> <i class="fa fa-pen"></i></a> &nbsp;<a href="#" style="color:#f46083;" onclick="deleteTrasaction(\'' + myRecord.id + '\')"> <i class="fa fa-trash"></i></a></td>' +
                    '                            </tr>';
            }
            var draggablekey = key.split("/").join("_");
            totalAmount = totalAmount + sumOfAmount;
            var myLi = '<li ' + (trCount == 0 ? "style=\'display:none;\'" : "") + ' class="timelinePart records ' + weekday[new Date(key).getDay()] + '">' +
                '                <p class="timeline-date">' + (new Date(key).getDate() + '/' + (new Date(key).getMonth() + 1) + '/' + new Date(key).getFullYear()) + '</p>' +
                '                <div class="timeline-content">' +
                '                    <h3 style="font-weight: 300;">' + weekday[new Date(key).getDay()] +
                '                      <span id="remainingfromtotal" style="display:none;">' + totalAmount + '</span> &nbsp;<a class="totalBalance" style="float:right;color: #737373;">' +
                '<i class="fas fa-question-circle" data-title="This is the balance that is after deduction and to be carry forward to the next payment day"></i> &nbsp; <u>Balance carry forward :</u>' +
                '                            ' + (totalAmount) + ' &nbsp; <i class="fas fa-level-down-alt" style="position: absolute;color: #9999; line-height: 2; font-size: 16px;"></i> </a>' +
                '                        <a class="alert_notification_tag"  style="display:' + ((totalAmount < 0) ? "block;" : "none;") + '"> <i' +
                '                                class="fas fa-exclamation-circle"></i>' +
                '                            &nbsp;' +
                '                            Alert : Balance Shortage</a>' +
                '                        <a class=" Collection_date" style="display:none;"><i class="fas fa-rupee-sign"></i> &nbsp; Collection Date</a>' +
                '                    </h3>' +
                '                    <div class="responsive-table">' +
                '                        <table class="nowTable" id="draggable-' + draggablekey + '">' +
                '                            <thead>' +
                '                            <tr class="ui-state-default">' +
                '                                <th></th>' +
                '                                <th>Sign</th>' +
                '                                <th></th>' +
                '                                <th>Submitter</th>' +
                '                                <th>Payment mode</th>' +
                '                                <th>Party Name</th>' +
                '                                <th>Transaction Type</th>' +
                '                                <th>Payment Source</th>' +
                '                                <th  style="width: 10%;">Payment Status</th>' +
                '                                <th>Amount</th>' +
                '                                <th></th>' +
                '                                <th style="width: 10%;">Action</th>' +
                '                            </tr>' +
                '                            </thead>' +
                '                            <tbody data-rcddate="' + key + '" id="tbody_' + key + '_' + tbodyindex + '" class="t_sortable">' +
                tblRecordsHtml +
                '                            </tbody>' +
                '                                <tfoot>' +
                '                                <tr class="ui-state-default">' +
                '                                    <th colspan="9" style="text-align: right;">Balance:</th>' +
                '                                    <th>' + sumOfAmount + '</th>' +
                '                                    <th colspan="2"></th>' +
                '                                </tr>' +
                '                            </tfoot>' +
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
	            var did = '#draggable-' + draggablekey;
            var $tabs = $(did);
            $("tbody.t_sortable").sortable({
                connectWith: ".t_sortable",
                items: "> tr",
                appendTo: $tabs,
                helper: "clone",
                zIndex: 999990,
                update: function (event, ui) {
                    console.log($(this).find("tr"));
                    var allrows = $(this).find("tr");
                    for (var i = 0; i < allrows.length; i++) {
                        updateTrasactionSorting($(ui.item[0]).attr("id"), 0, ui.item[0]);
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
    tblUsers.where("UserID", "==", userid).get().then(function (resp) {
        $(".collectionDays").val(resp.docs[0].data().collectionDays);
        $(".collectionDays").change();
        filterRecordsChecked();
        filterRecords();
        filterbyCollectionDay($(".collectionDays").val());
    });
}


//READ: This funtion reads transactions from the server and with pagination limit of 20 queries

function getTrasactionsByAccountPagination(id) {
    console.log(id);
    clearTransactionFields();

    tblAccountCheques = db.collection("tbl_account_cheques").where("UserID", "==", userid).where("account_id", "==", id);
    if(!isOwner){
        tblAccountCheques =  tblAccountCheques.where("groupid","==",groupid);
    }
    if(isSubmitter){
        tblAccountCheques = tblAccountCheques.where("added_by","==",current_userid);
    }
    tblAccountCheques = tblAccountCheques.startAfter(lastfetchedRecord).limit(20);

    allTrasactions = [];
    groupedRecords = {};
    tblRecordsHtml = '';

    tblAccountCheques.get().then(function (querySnapshot) {

        querySnapshot.forEach(function (doc) {
            // doc.data() is never undefined for query doc snapshots
            // console.log(doc.id, " => ", doc.data());
            doc.data().id = doc.id;
            var obj = doc.data();
            obj.id = doc.id;
            allTrasactions.push(obj);
        });
        lastfetchedRecord = querySnapshot.docs[querySnapshot.docs.length - 1];
        allTrasactions = sortByKey(allTrasactions, "order_sequence", true);
        allTrasactions = sortByKey(allTrasactions, "date", true);
        groupedRecords = groupBy(allTrasactions, 'date');
        var tbodyindex = 0;
        var totalAmount = Number($(".tablinks[data-accid=defaultOpen]").find("input").val());
        for (var key in groupedRecords) {
            // console.log(key);
            // console.log(groupedRecords[key]);
            tbodyindex = tbodyindex + 1;
            var sumOfAmount = 0;
            var accountid = "";
            var trCount = 0;
            for (var record in groupedRecords[key]) {
                // console.log(record);
                // console.log(groupedRecords[key][record]);
                var myRecord = groupedRecords[key][record];
                trCount++;
                if (myRecord.status != "Cleared") {
                    if (myRecord.mode == "Buyer") {
                        sumOfAmount = sumOfAmount + Number(myRecord.withdrawal);
                    } else {
                        sumOfAmount = sumOfAmount - Number(myRecord.withdrawal);
                    }
                }
                var withdrawalSpan = "";
                if (myRecord.mode == "Buyer") {
                    withdrawalSpan = "<span " + (myRecord.status === "Bounced" ? "style='text-decoration: line-through;'" : "") + ">" + myRecord.withdrawal + "</span>";
                }
                else{
                    withdrawalSpan = "<span " + (myRecord.status === "Bounced" ? "style='text-decoration: line-through;'" : "") + ">(" + myRecord.withdrawal + ")</span>";
                }
                var OverAllStatus = "Status: "+myRecord.is_signed;
                if(myRecord.Approver_First_Name){
                    OverAllStatus = OverAllStatus +" 🠪 "  + myRecord.Approver_First_Name;
                } 
                if(myRecord.Approver_Second_Name){
                    OverAllStatus = OverAllStatus +" 🠪 "  + myRecord.Approver_Second_Name;
                } 
//ApprovalFilters
                if(myRecord.Approver_Third_Name){
                    OverAllStatus = OverAllStatus +" 🠪 "  + myRecord.Approver_Third_Name;
                } 
                accountid = myRecord.account_id;
                tblRecordsHtml += '<tr class="'+myRecord.is_signed+' ApprovalFiltersClass" id=\'' + myRecord.id + '\' data-rcdamt=\'' + myRecord.withdrawal + '\'>' +
                    '                                <td><i class="fa fa-bars"></i></td>' +
                    '                                <td  data-title="'+OverAllStatus+'" onclick="sign_approve_transaction(\''+myRecord.id+'\',\''+myRecord.is_signed+'\',this);">'+(myRecord.is_signed=="Approved"?"<i class='fa fa-check-circle' style='font-size:25px;color: #56bea6;opacity: 1;'></i>":myRecord.is_signed=="Denied"?"<i class='fas fa-times-circle' style='font-size: 25px;color: #ff88a4;opacity: 1;'></i>":"---")+'</td>' +
                    '                                <td class="active_flag flag ' + (myRecord.flag ? "" : "disable_flag") + '" id="flag_' + myRecord.id + '" onclick="updateTrasactionFlag(this, \'' + myRecord.id + '\', ' + myRecord.flag + ');">🚩</td>' +
                    '                                <td data-title="'+(myRecord.submitter?myRecord.submitter+"-"+myRecord.group:"")+'"><a class="submitter_initial">'+(myRecord.submitter?myRecord.submitter.substring(0,1):"-")+'</a></td>' +
                    '                                <td>' + (myRecord.cheque_no ? "#" : "") + '<span>' + myRecord.cheque_no + '</span></td>' +
                    '                                <td><span>' + myRecord.payee + '</span></td>' +
                    '                                <td><span>' + myRecord.mode + '</span></td>' +
                    '                                <td><span>' + myRecord.bank + '</span></td>' +
                    '                                <td>' +
                    '                                    <select' +
                    '                                            class="form-control red-text ' + (myRecord.status === "Un Clear" ? "status-unclear" : myRecord.status === "Cleared" ? "status-clear" : myRecord.status === "Bounced" ? "status-bounced" : "status-topay") + '"' +
                    '                                            onchange="updateTrasactionStatus(this, \'' + myRecord.id + '\', $(this).val())">' +
                    '                                        <option class="red-text" value="Un Clear" ' + (myRecord.status === "Un Clear" ? "selected" : "") + '>Un-Clear</option>' +
                    '                                        <option class="orange-text" value="To Pay" ' + (myRecord.status === "To Pay" ? "selected" : "") + '>To Pay</option>' +
                    '                                        <option class="green-text" value="Cleared" ' + (myRecord.status === "Cleared" ? "selected" : "") + '>Cleared</option>' +
                    '                                        <option class="black-text" value="Bounced" ' + (myRecord.status === "Bounced" ? "selected" : "") + '>Bounced</option>' +
                    '                                    </select>' +
                    '                                </td>' +
                    '                                <td class="balance">' + withdrawalSpan + '</td>' +
                    '                                <td><i class="far fa-sticky-note" href="#" '+(myRecord.notes?"":"style=\'opacity:0.2;\'")+' onclick="open_notes_modal(\''+myRecord.id+'\',\''+myRecord.cheque_no+'\');" title="'+(myRecord.notes?myRecord.notes:"No notes added. click to add.")+'"></i></td>' +
                    '                                <td><a href="#" onclick="editRecord(\'' + myRecord.id + '\')"> <i class="fa fa-pen"></i></a><a href="#" style="color:#f46083;" onclick="deleteTrasaction(\'' + myRecord.id + '\')"> <i class="fa fa-trash"></i></a></td>' +
                    '                            </tr>';
            }
            var draggablekey = key.split("/").join("_");
            totalAmount = totalAmount + sumOfAmount;
            var myLi = '<li ' + (trCount == 0 ? "style=\'display:none;\'" : "") + ' class="timelinePart records ' + weekday[new Date(key).getDay()] + '">' +
                '                <p class="timeline-date">' + (new Date(key).getDate() + '/' + (new Date(key).getMonth() + 1) + '/' + new Date(key).getFullYear()) + '</p>' +
                '                <div class="timeline-content">' +
                '                    <h3 style="font-weight: 300;">' + weekday[new Date(key).getDay()] +
                '                      <span id="remainingfromtotal" style="display:none;">' + totalAmount + '</span> &nbsp;<a class="totalBalance" style="float:right;color: #737373;">' +
                '<i class="fas fa-question-circle" data-title="This is the balance that is after deduction and to be carry forward to the next payment day"></i> &nbsp; <u>Balance carry forward :</u>' +
                '                            ' + (totalAmount) + ' &nbsp; <i class="fas fa-level-down-alt" style="position: absolute;color: #9999; line-height: 2; font-size: 16px;"></i> </a>' +
                '                        <a class="alert_notification_tag"  style="display:' + ((totalAmount < 0) ? "block;" : "none;") + '"> <i' +
                '                                class="fas fa-exclamation-circle"></i>' +
                '                            &nbsp;' +
                '                            Alert : Balance Shortage</a>' +
                '                        <a class=" Collection_date" style="display:none;"><i class="fas fa-rupee-sign"></i> &nbsp; Collection Date</a>' +
                '                    </h3>' +
                '                    <div class="responsive-table">' +
                '                        <table class="nowTable" id="draggable-' + draggablekey + '">' +
                '                            <thead>' +
                '                            <tr class="ui-state-default">' +
                '                                <th></th>' +
                '                                <th>Sign</th>' +
                '                                <th></th>' +
                '                                <th>Submitter</th>' +
                '                                <th>Payment mode</th>' +
                '                                <th>Party Name</th>' +
                '                                <th>Transaction Type</th>' +
                '                                <th>Payment Source</th>' +
                '                                <th  style="width: 10%;">Payment Status</th>' +
                '                                <th>Amount</th>' +
                '                                <th></th>' +
                '                                <th style="width: 10%;">Action</th>' +
                '                            </tr>' +
                '                            </thead>' +
                '                            <tbody data-rcddate="' + key + '" id="tbody_' + key + '_' + tbodyindex + '" class="t_sortable">' +
                tblRecordsHtml +
                '                            </tbody>' +
                '                                <tfoot>' +
                '                                <tr class="ui-state-default">' +
                '                                    <th colspan="9" style="text-align: right;">Balance:</th>' +
                '                                    <th>' + sumOfAmount + '</th>' +
                '                                    <th colspan="2"></th>' +
                '                                </tr>' +
                '                            </tfoot>' +
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
            var $tabs = $('#draggable-' + draggablekey + '');
            $("tbody.t_sortable").sortable({
                connectWith: ".t_sortable",
                items: "> tr",
                appendTo: $tabs,
                helper: "clone",
                zIndex: 999990,
                update: function (event, ui) {
                    console.log($(this).find("tr"));
                    var allrows = $(this).find("tr");
                    for (var i = 0; i < allrows.length; i++) {
                        updateTrasactionSorting($(ui.item[0]).attr("id"), 0, ui.item[0]);
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
    tblUsers.where("UserID", "==", userid).get().then(function (resp) {
        $(".collectionDays").val(resp.docs[0].data().collectionDays);
        $(".collectionDays").change();
        filterbyCollectionDay($(".collectionDays").val());
        filterRecordsChecked();
        filterRecords();
    });
}

// REFRESHES CALCULATION : each time the bank values are updated , it refreshes calculation to give a clearer picture.
function refreshAllCalculations() {

    var totalAmount = Number($(".tablinks[data-accid=defaultOpen]").find("input").val());
    $(".timelinePart.records").each(function (ii, vv) {
        var trs = $(vv).find("table>tbody>tr");
        var sumOfAmount = 0;
        $(trs).each(function (iii, vvv) {
            if ($(vvv).find("select").val() != "Bounced") {
                if ($(vvv).find("td:nth-child(5)").find("span").text() == "Buyer") {
                    sumOfAmount = sumOfAmount + Number($(vvv).attr("data-rcdamt"));
                } else {
                    sumOfAmount = sumOfAmount - Number($(vvv).attr("data-rcdamt"));
                }
            }

        });
        $(vv).find("#remainingfromtotal").text(totalAmount - sumOfAmount);
        $(vv).find("table>tfoot>tr>th:nth-child(2)").html(sumOfAmount);
        if (sumOfAmount > 0) {
            totalAmount = totalAmount + sumOfAmount;
        }
        else {
            totalAmount = totalAmount - sumOfAmount;
        }
        var balanceElement = '<i class="far fa-question-circle" data-title="This is the balance that is after deduction and to be carry forward to the next payment day">' +
            '</i> &nbsp; <u>Balance carry forward :</u>' +
            '' + totalAmount + ' &nbsp; ' +
            '<i class="fas fa-level-down-alt" style="position: absolute;color: #9999; line-height: 2; font-size: 16px;"></i>';
        $(vv).find("a.totalBalance").html(balanceElement);
        if (totalAmount < 0) {
            $(vv).find(".alert_notification_tag").show();
        } else {
            $(vv).find(".alert_notification_tag").hide();
        }
    });

}

function addupdatetransaction(isUpdate) {
    if (isApprover) {
        swal("You don't have the permission to update entry");
        return;
    }
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
    if (isApprover) {
        swal("You don't have permission to add a new transaction");
        return;
    }
    tblAccountCheques = db.collection("tbl_account_cheques");
    var bankoftransaction = document.getElementById('account-list').options[document.getElementById('account-list').selectedIndex].text;

    tblAccountCheques.add({
        account_id: document.getElementById('account-list').value,
        bank: document.getElementById('account-list').options[document.getElementById('account-list').selectedIndex].text,
        cheque_no: document.getElementById('cheque_no').value,
        date: document.getElementById('transaction_date').value,
        flag: false,
        groupid:groupid,
        submitter: localStorage.getItem("user"),
        group:localStorage.getItem("group"),
        UserID: userid,
        added_by:current_userid,
        mode: document.getElementById('mode').value,
        order_sequence: 0,
        payee: document.getElementById('payee').value,
        status: document.getElementById('status').value,
        withdrawal: document.getElementById('withdrawal').value,
        is_signed:"Pending"
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
            db.collection('tbl_audit_log').add({
                content: `Transaction ${docRef.id} added to account <b>${bankoftransaction}</b>`,
                now: (new Date()).getTime(),
                party: '',
                user: localStorage.getItem("user"),
                date: '',
                groupid:localStorage.getItem("groupid"),
                amount: '',
                refId: userid,
                collection: 'Transactions'
            });
            GetTransactionGeneral();
        })
        .catch(function (error) {
            console.error("Error adding document: ", error);
        });
}
$("#status").on("change", function () {
    if ($("#status").val() == "Un Clear")
        $("#status").removeClass("status-clear").removeClass("status-topay").removeClass("status-bounce").addClass("status-unclear");
    if ($("#status").val() == "Cleared")
        $("#status").removeClass("status-unclear").removeClass("status-topay").removeClass("status-bounce").addClass("status-clear");
    if ($("#status").val() == "To Pay")
        $("#status").removeClass("status-clear").removeClass("status-unclear").removeClass("status-bounce").addClass("status-topay");
    if ($("#status").val() == "Bounced")
        $("#status").removeClass("status-clear").removeClass("status-unclear").removeClass("status-topay").addClass("status-bounce");
});
function deleteTrasaction(id) {
    if (isApprover) {
        swal("You don't have permission to delete the transaction.");
        return;
    }
    SwalConfirmBox("Are you sure?","ContinueToDelete('"+id+"');");

}
function ContinueToDelete(id){
    tblAccountCheques = db.collection("tbl_account_cheques");
    tblAccountCheques.doc(id)
        .delete().then(function (docRef) {
            db.collection('tbl_audit_log').add({
                content: `Transaction ${id} delete</b>`,
                now: (new Date()).getTime(),
                party: '',
                date: '',
                amount: '',
                groupid:localStorage.getItem("groupid"),
                refId: userid,
                user: localStorage.getItem("user"),
                collection: 'Transactions'
            });
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
    if (isApprover) {
        swal("You don't have permission to update the entry.");
        return;
    }
    tblAccountCheques = db.collection("tbl_account_cheques");
    tblAccountCheques.doc(id).update({
        account_id: document.getElementById('account-list').value,
        bank: document.getElementById('account-list').options[document.getElementById('account-list').selectedIndex].text,
        cheque_no: document.getElementById('cheque_no').value,
        date: document.getElementById('transaction_date').value,
        flag: false,
        UserID: userid,
        mode: document.getElementById('mode').value,
        order_sequence: 0,
        payee: document.getElementById('payee').value,
        status: document.getElementById('status').value,
        withdrawal: document.getElementById('withdrawal').value
    }).then(function (docRef) {
        db.collection('tbl_audit_log').add({
            content: `Transaction ${id} updated</b>`,
            now: (new Date()).getTime(),
            party: '',
            date: '',
            amount: '',
            groupid:localStorage.getItem("groupid"),
            user: localStorage.getItem("user"),
            refId: userid,
            collection: 'Transactions'
        });
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
    var withdrawalSpan = "";
    if (myRecord.mode == "Buyer") {
        withdrawalSpan = "<span " + (myRecord.status === "Bounced" ? "style='text-decoration: line-through;'" : "") + ">" + myRecord.withdrawal + "</span>";
    }
    else{
        withdrawalSpan = "<span " + (myRecord.status === "Bounced" ? "style='text-decoration: line-through;'" : "") + ">(" + myRecord.withdrawal + ")</span>";
    }
    var OverAllStatus = "Status: "+myRecord.is_signed;
    if(myRecord.Approver_First_Name){
        OverAllStatus = OverAllStatus +" 🠪 "  + myRecord.Approver_First_Name;
    } 
    if(myRecord.Approver_Second_Name){
        OverAllStatus = OverAllStatus +" 🠪 "  + myRecord.Approver_Second_Name;
    } 

    if(myRecord.Approver_Third_Name){
        OverAllStatus = OverAllStatus +" 🠪 "  + myRecord.Approver_Third_Name;
    } 
    var tblRecordsHtml = '<tr id="' + id + '">' +
        '                                <td><i class="fa fa-bars"></i></td>' +
        '                                <td  data-title="'+OverAllStatus+'" onclick="sign_approve_transaction(\''+myRecord.id+'\',\''+myRecord.is_signed+'\',this);">'+(myRecord.is_signed=="Approved"?"<i class='fa fa-check-circle' style='font-size:25px;color: #56bea6;opacity: 1;'></i>":myRecord.is_signed=="Denied"?"<i class='fas fa-times-circle' style='font-size: 25px;color: #ff88a4;opacity: 1;'></i>":"---")+'</td>' +
        '                                <td class="active_flag flag ' + (myRecord.flag ? "" : "disable_flag") + '" id="flag-' + myRecord.id + '" onclick="updateTrasactionFlag(this, \'' + myRecord.id + '\', ' + myRecord.flag + ');">🚩</td>' +
        '                                <td data-title="'+(myRecord.submitter?myRecord.submitter+"-"+myRecord.group:"")+'"><a class="submitter_initial">'+(myRecord.submitter?myRecord.submitter.substring(0,1):"-")+'</a></td>' +
        '                                <td>' + (myRecord.cheque_no ? "#" : "") + '<span>' + myRecord.cheque_no + '</span></td>' +
        '                                <td><span>' + myRecord.payee + '</span></td>' +
        '                                <td><span>' + myRecord.mode + '</span></td>' +
        '                                <td><span>' + myRecord.bank + '</span></td>' +
        '                                <td>' +
        '                                    <select' +
        '                                            class="form-control red-text ' + (myRecord.status === "Un Clear" ? "status-unclear" : myRecord.status === "Cleared" ? "status-clear" : myRecord.status === "Bounced" ? "status-bounced" : "status-topay") + '"' +
        '                                            onchange="updateTrasactionStatus(this, \'' + myRecord.id + '\', $(this).val())">' +
        '                                        <option class="red-text" value="Un Clear" ' + (myRecord.status === "Un Clear" ? "selected" : "") + '>Un-Clear</option>' +
        '                                        <option class="orange-text" value="To Pay" ' + (myRecord.status === "To Pay" ? "selected" : "") + '>To Pay</option>' +
        '                                        <option class="green-text" value="Cleared" ' + (myRecord.status === "Cleared" ? "selected" : "") + '>Cleared</option>' +
        '                                        <option class="black-text" value="Bounced" ' + (myRecord.status === "Bounced" ? "selected" : "") + '>Bounced</option>' +
        '                                    </select>' +
        '                                </td>' +
        '                                <td class="balance">' + withdrawalSpan + '</td>' +
        '                                <td><i class="far fa-sticky-note" href="#" '+(myRecord.notes?"":"style=\'opacity:0.2;\'")+' onclick="open_notes_modal(\''+myRecord.id+'\',\''+myRecord.cheque_no+'\');" title="'+(myRecord.notes?myRecord.notes:"No notes added. click to add.")+'"></i></td>' +
        '                                <td><a href="#" onclick="editRecord(\'' + myRecord.id + '\')"> <i class="fa fa-pen"></i></a>&nbsp;<a href="#" onclick="deleteTrasaction(\'' + myRecord.id + '\')"> <i class="fa fa-trash"></i></a></td>' +
        '                            </tr>';

    $(targetTr).replaceWith(tblRecordsHtml);
    var tbody = $("#" + id).parent().find("tr");
    var totalWithdrawl = 0;
    $(tbody).each(function (i, v) {
        totalWithdrawl += Number($(v).find(".balance>span").text());
    });
    $("#" + id).parent().parent().parent().parent().find("a.totalBalance").html("Balance Left: " + totalWithdrawl + "");

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
    refreshAllCalculations();
}

var selected_signUnsign_tid="";
function SetSignedOrDenied(val){
        tblAccountCheques = db.collection("tbl_account_cheques");
        tblAccountCheques.doc(selected_signUnsign_tid).get().then(function(doc){    
    if(localStorage.getItem("access")=="Approver" || isOwner || isGroupAdmin){    
    tblAccountCheques.doc(selected_signUnsign_tid).update({
        is_signed:val,
        ApprovedBy:localStorage.getItem("user")
    }).then(function (docRef) {
        db.collection('tbl_audit_log').add({
            content: `Transaction ${selected_signUnsign_tid} updated as signed</b>`,
            now: (new Date()).getTime(),
            party: '',
            date: '',
            amount: '',
            groupid:localStorage.getItem("groupid"),
            refId: userid,
            user: localStorage.getItem("user"),
            collection: 'Transactions'
        });

        if(val=="Pending"){
        $(selected_sign_approve_ele).replaceWith("<td data-title='click to approve' onclick='sign_approve_transaction(\""+selected_signUnsign_tid+"\",false,this);'>---</td>");
       }else if(val=="Approved"){
        $(selected_sign_approve_ele).replaceWith("<td data-title='click to unapprove' onclick='sign_approve_transaction(\""+selected_signUnsign_tid+"\",true,this);'><i class='fa fa-check-circle' style='font-size:25px;color: #56bea6;opacity: 1;'></i></td>");
       }
       else if(val=="Denied"){
        $(selected_sign_approve_ele).replaceWith("<td data-title='click to unapprove' onclick='sign_approve_transaction(\""+selected_signUnsign_tid+"\",true,this);'><i class='fas fa-times-circle' style='font-size: 25px;color: #ff88a4;opacity: 1;'></i></td>");
       }
       $("#transaction-approve_deny_modal").hide();
    });
}else{
    if(localStorage.getItem("access").indexOf("Approver")>-1){
    
    var approver_First="Pending";
    var approver_Second="Pending";
    var approver_Third="Pending";
    var Object = {
        is_signed:"Pending",
    };
    if(localStorage.getItem("access").indexOf("First")>-1){
        approver_First=val;
        Object = {
            is_signed:"Pending",
            Approver_First:val,
            Approver_First_Name:localStorage.getItem("name")
        };
    }
    if(localStorage.getItem("access").indexOf("Second")>-1){
        approver_Second=val;
        Object = {
            is_signed:"Pending",
            Approver_Second:val,
            Approver_Second_Name:localStorage.getItem("name")
        };
    }
    if(localStorage.getItem("access").indexOf("Third")>-1){
        approver_Third=val;
        Object = {
            is_signed:"Pending",
            Approver_Third:val,
            Approver_Third_Name:localStorage.getItem("name")
        };
    }
    tblAccountCheques.doc(selected_signUnsign_tid).update(Object).then(function (docRef) {
        tblAccountCheques.doc(selected_signUnsign_tid).get().then(function(doc){  
        if(doc.data().approver_First && doc.data().approver_Second && doc.data().approver_Third){
            if(doc.data().approver_First=="Approved" && doc.data().approver_Second=="Approved" && doc.data().approver_Third=="Approved"){
                tblAccountCheques.doc(selected_signUnsign_tid).update({is_signed:"Approved"}).then(function (docRef) {
                });
            } 
            if(doc.data().approver_First=="Denied" || doc.data().approver_Second=="Denied" || doc.data().approver_Third=="Denied"){
                tblAccountCheques.doc(selected_signUnsign_tid).update({is_signed:"Denied"}).then(function (docRef) {
                });
            } 
        }});
        db.collection('tbl_audit_log').add({
            content: `Transaction ${selected_signUnsign_tid} updated as signed</b>`,
            now: (new Date()).getTime(),
            party: '',
            date: '',
            amount: '',
            groupid:localStorage.getItem("groupid"),
            refId: userid,
            user: localStorage.getItem("user"),
            collection: 'Transactions'
        });
    });
}
}
});
}
var selected_sign_approve_ele;
function sign_approve_transaction(transaction_id,is_signed,ele){
    if(isApprover || isOwner){
        selected_sign_approve_ele=ele;
        selected_signUnsign_tid=transaction_id;
        $("#transaction-approve_deny_modal").show();
    }else{
        swal("you don't have permission to approve.");
    }
}

$(document).ready(function () {

    $(window).scroll(function () {
        if ($(window).scrollTop() + $(window).height() >= $(document).height()) {

            if ($("body").find(".tablinks.active").attr("id") == "defaultOpen") {

                getTrasactionsAllPagination();
            } else {
                getTrasactionsByAccountPagination($("body").find(".tablinks.active").attr("data-accid"));
            }
        }
    });



});


//DRAG & DROP TRIGGER UPDATE : this is the function that let the user update the entry based on client side drag and drop function

function updateTrasactionSorting(id, order, ele) {
    if (isApprover) {
        swal("You don't have the permission to edit the entry");
        return;
    }
    $('#loading').show();
    var updatedDate = $(ele).parent().attr("data-rcddate");
    console.log($($(ele).find("td")[2]).find("span").html(), updatedDate);
    tblAccountCheques = db.collection("tbl_account_cheques");
    tblAccountCheques.doc(id).update({
        order_sequence: order,
        date: updatedDate
    }).then(function () {
        db.collection('tbl_audit_log').add({
            content: `Transaction date for ${id} updated</b>`,
            now: (new Date()).getTime(),
            party: '',
            date: '',
            amount: '',
            groupid:localStorage.getItem("groupid"),
            refId: userid,
            user: localStorage.getItem("user"),
            collection: 'Transactions'
        });
        refreshAllCalculations();
        $('#loading').hide();
        console.log("Document sequence updated!");
    }).catch(function (error) {
        console.error("Error updating sequence: ", error);
    });
    // $(evt).toggleClass('disable_flag');

}

// WRITE: this function let the user click flag to write boolean value to true or false
function updateTrasactionFlag(evt, id, flag) {
    if (isApprover) {
        swal("You don't have the permission to update the entry");
        return;
    }

    if ($("#flag-" + id).hasClass("disable_flag")) {
        flag = true;
        $("#flag-" + id).removeClass("disable_flag");
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
        db.collection('tbl_audit_log').add({
            content: `Transaction flag for ${id} updated</b>`,
            now: (new Date()).getTime(),
            party: '',
            date: '',
            amount: '',
            groupid:localStorage.getItem("groupid"),
            refId: userid,
            user: localStorage.getItem("user"),
            collection: 'Transactions'
        });
        // getTrasactionsAll();
        console.log("Document flag updated!");
    }).catch(function (error) {
        console.error("Error updating flag: ", error);
    });
    // $(evt).toggleClass('disable_flag');

}


//Audit log code trigger when triggering update function
function updateTrasactionStatus(evt, id, newValue) {
    if (isApprover) {
        swal("You don't have the permission to update the entry");
        return;
    }
    // console.log(id);
    console.log(newValue);
    if (newValue == "Un Clear")
        $(evt).removeClass("status-clear").removeClass("status-topay").removeClass("status-bounced").addClass("status-unclear");
    if (newValue == "Cleared")
        $(evt).removeClass("status-unclear").removeClass("status-topay").removeClass("status-bounced").addClass("status-clear");
    if (newValue == "To Pay")
        $(evt).removeClass("status-clear").removeClass("status-unclear").removeClass("status-bounced").addClass("status-topay");
    if (newValue == "Bounced")
        $(evt).removeClass("status-clear").removeClass("status-topay").removeClass("status-unclear").addClass("status-bounced");
    console.log($(evt).parent().parent());
    var withdrawalSpan = "";
    if ($(evt).parent().parent().find("td:nth-child(6)").find("span").text() == "Buyer") {

        withdrawalSpan = "<span " + (newValue === "Bounced" ? "style='text-decoration: line-through;'" : "") + ">" + $(evt).parent().parent().attr("data-rcdamt") + "</span>";
    }
    if ($(evt).parent().parent().find("td:nth-child(6)").find("span").text() == "Supplier") {
        withdrawalSpan = "<span " + (newValue === "Bounced" ? "style='text-decoration: line-through;'" : "") + ">(" + $(evt).parent().parent().attr("data-rcdamt") + ")</span>";
    }
    $(evt).parent().parent().find("td:nth-child(9)").html(withdrawalSpan);
    tblAccountCheques = db.collection("tbl_account_cheques");
    tblAccountCheques.doc(id).update({
        status: newValue,
    }).then(function () {
        db.collection('tbl_audit_log').add({
            content: `Transaction status for ${id} updated to ${newValue}</b>`,
            now: (new Date()).getTime(),
            party: '',
            date: '',
            amount: '',
            refId: userid,
            groupid:localStorage.getItem("groupid"),
            user: localStorage.getItem("user"),
            collection: 'Transactions'
        });
        refreshAllCalculations();
        console.log("Document status updated!");
    }).catch(function (error) {
        console.error("Error updating status: ", error);
    });
    // $(evt).toggleClass('disable_flag');

}


//WRITE/UPDATE ENTRY: this function lets the user add new entry or update the "tbl_account_cheques" entry

function editRecord(id) {
    if (isApprover) {
        swal("You don't have the permission to update the entry");
        return;
    }
    tblAccountCheques = db.collection("tbl_account_cheques");
    tblAccountCheques.doc(id).get().then(function(doc){
        var record = doc.data();
    document.getElementById('transaction_id').value = id;
    document.getElementById('account-list').value = record.account_id;
    document.getElementById('cheque_no').value = record.cheque_no;
    document.getElementById('transaction_date').value = record.date;
    document.getElementById('mode').value = record.mode;
    document.getElementById('payee').value = record.payee;
    document.getElementById('status').value = record.status;
    document.getElementById('withdrawal').value = record.withdrawal;
    if (record.status == "Un Clear")
        $("#status").removeClass("status-clear").removeClass("status-topay").removeClass("status-bounced").addClass("status-unclear");
    if (record.status == "Cleared")
        $("#status").removeClass("status-unclear").removeClass("status-topay").removeClass("status-bounced").addClass("status-clear");
    if (record.status == "To Pay")
        $("#status").removeClass("status-clear").removeClass("status-unclear").removeClass("status-bounced").addClass("status-topay");
    if (record.status == "Bounced")
        $("#status").removeClass("status-clear").removeClass("status-unclear").removeClass("status-topay").addClass("status-bounced");

    $('#edit-transaction').show();
    $('#add-transaction').hide();
});
}
function editRecordAccount(id) {
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

function LoadMore() {

    if ($("body").find(".tablinks.active").attr("id") == "defaultOpen") {
        console.log("loading more transactions");
        getTrasactionsAllPagination();
    } else {
        getTrasactionsByAccountPagination($("body").find(".tablinks.active").attr("data-accid"));
    }
}



//EXPORT ~ Populating data within the table to get it ready to export 

function exportToExcel_datapopulate() {
    var trs = $('.timelinePart.records').find("tbody tr:not([style=\'display: none;\'])");
    console.log(trs);
    var allIds = [];
    $(trs).each(function (i, v) {
        console.log($(v).attr("id"));
        allIds.push($(v).attr("id"));
    });
    console.log(allIds);

    $("#tblDatatoexport>tbody").html("");
    var tblAccountChequesNew = db.collection("tbl_account_cheques");
    tblAccountChequesNew.where("UserID", "==", userid).get().then(function (querySnapshot) {
        console.log(querySnapshot);
        var thead = "<tr>"
            + "<th>Date</th>"
            + "<th>Check</th>"
            + "<th>Party Name</th>"
            + "<th>Transaction Type</th>"
            + "<th>Payment Source</th>"
            + "<th>Payment Status</th>"
            + "<th>Amount</th>"
            + "</tr>";
        $("#tblDatatoexport").append(thead);
        querySnapshot.forEach(function (doc) {
            if (allIds.indexOf(doc.id) > -1) {
                var newtr = "<tr>" +
                    "<td>" + doc.data().date + "</td>" +
                    "<td>" + doc.data().cheque_no + "</td>" +
                    "<td>" + doc.data().payee + "</td>" +
                    "<td>" + doc.data().mode + "</td>" +
                    "<td>" + doc.data().bank + "</td>" +
                    "<td>" + doc.data().status + "</td>" +
                    "<td>" + doc.data().withdrawal + "</td>" +
                    "</td>";
                $("#tblDatatoexport").append(newtr);
            }
        });

        exportTableToExcel("tblDatatoexport", 'filtered_transactions');
    });


}

//EXPORT ~ This function exports a xls file for use with all the data

function exportTableToExcel(tableID, filename = '') {
    var downloadLink;
    var dataType = 'application/vnd.ms-excel';
    var tableSelect = document.getElementById(tableID);
    console.log($(tableSelect).find("tr").length);
    var tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');

    // Specify file name
    filename = filename ? filename + '.xls' : 'excel_data.xls';

    // Create download link element
    downloadLink = document.createElement("a");

    document.body.appendChild(downloadLink);

    if (navigator.msSaveOrOpenBlob) {
        var blob = new Blob(['\ufeff', tableHTML], {
            type: dataType
        });
        navigator.msSaveOrOpenBlob(blob, filename);
    } else {
        // Create a link to the file
        downloadLink.href = 'data:' + dataType + ', ' + tableHTML;

        // Setting the file name
        downloadLink.download = filename;

        //triggering the function
        downloadLink.click();
    }
}

var isFileAdded = false;
//NOTES : add notes to each document in collection 'tbl_account_cheques' 

function AddNotesToTransaction() {
    if ($("#notes").val()) {
        let fileUpload = document.getElementById("transaction_attachment");
        var filename = $('#transaction_attachment').val();
        filename = new Date().getTime()+'.'+filename.split('.').pop();
        let storageRef;// = firebase.storage().ref('transactionAttachments/'+fileName)
        if($('#transaction_attachment').val()){
           // filename="";
           isFileAdded = true;
            storageRef = firebase.storage().ref('/transactionAttachments/'+filename);
            let firstFile = $('#transaction_attachment').prop('files')[0];// upload the first file only
           console.log(firstFile);
            storageRef.put(firstFile).then(function (snapshot) {
                console.log('Uploaded a blob or file!');
                console.log(snapshot);
            });
        }
        var transaction_id = $("#notes_transaction_id").val();

       tbl_transaction_notes = db.collection("tbl_account_cheques");
        tbl_transaction_notes.doc(transaction_id).update({attachment:(isFileAdded?filename:''),notes:$("#notes").val()}).then(function(){

            load_transaction_notes();
            $("#notes").val("");
            $('#transaction_attachment').val("");
            db.collection('tbl_audit_log').add({ 
                content: `Transaction notes and attachments added for ${transaction_id}`,
                now: (new Date()).getTime(),
                party: '',
                date: '',
                amount: '',
                groupid:localStorage.getItem("groupid"),
                refId: userid,
                user: localStorage.getItem("user"),
                collection: 'tbl_account_cheques'
            });
        });
    } else {
        alert("please type notes");
    }
}


//READ : this function reads the notes from the collection "tbl_account_cheques" 

	function load_transaction_notes() {
       
    $("#transaction_notes_table_tbody").html("");
    $("#loading_rows_tr").show();
    var transaction_id = $("#notes_transaction_id").val();
    tbl_transaction_notes = db.collection("tbl_account_cheques");
    tbl_transaction_notes.doc(transaction_id)
        .get().then(function (results) {
            var doc = results;
            console.log(results.data());
            if(doc.data().notes){
          var doc = results;
          $("#notes").val(doc.data().notes);
          if(doc.data().attachment){
          $("#attachments").html((doc.data().attachment?doc.data().attachment:""));
          LoadAttachmentInThumbnail(doc.data().attachment);
          $("#attachmentsdiv").show();  
        }else{
            $("#attachmentsdiv").hide(); 
        }
                var tr = "<tr id='" + doc.id + "'>" +
                    "<td style='text-align: left;'>" + doc.data().notes + "</td>"+
                    "<td  style='text-align: left;'><a href='#' onclick='downloadattachment(\""+doc.data().attachment+"\")'>"+(doc.data().attachment?doc.data().attachment:"")+"</a></td>"+
                "<td  style='text-align: left;'><a href='#' onclick='delete_transaction_notes(this);'> delete</a></td></tr>";
                $("#transaction_notes_table_tbody").append(tr);
            }
            $("#loading_rows_tr").hide();
        });
}

function LoadAttachmentInThumbnail(attachmentName){
    var storageRef = firebase.storage().ref('/transactionAttachments/'+attachmentName);
    storageRef.getDownloadURL().then(function(url) {
        var image = document.getElementById('attachment_thumbnail');
        image.src =url;
        $("#attachment_thumbnail").show();
    });
}
//WHAT IS THIS?? USELESS CODE ??
function deleteAttachment() {
    if(confirm("Are you sure you want to Delete these notes?")){
        if(added_from_file_input){
            $('#transaction_attachment').val('');
            $("#attachmentsdiv").hide();
            return;
        }
    //var notes_id = $(ele).parent().parent().attr("id");
    var transaction_id = $("#notes_transaction_id").val();
    tbl_transaction_notes = db.collection("tbl_account_cheques");
    tbl_transaction_notes.doc(transaction_id).get().then(function(resp){
            if(resp.data().attachment){
                var storageRef = firebase.storage().ref('/transactionAttachments/'+resp.data().attachment);
                storageRef.delete().then(function() {
                    // File deleted successfully
                  }).catch(function(error) {
                    // Uh-oh, an error occurred!
                  });
            }
    });
    tbl_transaction_notes.doc(transaction_id).update({attachment:''}).then(function(){
        load_transaction_notes();
        db.collection('tbl_audit_log').add({ 
            content: `Transaction Notes delete for ${notes_id}`,
            now: (new Date()).getTime(),
            party: '',
            date: '',
            amount: '',
            groupid:localStorage.getItem("groupid"),
            user: localStorage.getItem("user"),
            refId: userid,
            collection: 'TransactionsNotes'
        });
    });}
}
var added_from_file_input=false;
$('#transaction_attachment').on("change",function(eve){
    var filename = $('#transaction_attachment').val();
    filename = new Date().getTime()+'.'+filename.split('.').pop();
    $("#attachments").html((filename));
    added_from_file_input=true;
    var image = document.getElementById('attachment_thumbnail');
    image.src = URL.createObjectURL(eve.target.files[0]);
    $("#attachment_thumbnail").show();
    $("#attachmentsdiv").show(); 
});

$("#attachment_thumbnail").on("click",function(ele){
    var url = $(this).attr("src");
    window.open(url,'_blank');

});
//OPEN MODAL : this is the function to open notes modal when clicked
function open_notes_modal(transaction_id,check_no){
    $("#attachment_thumbnail").hide();
    $("#check_no").html(check_no);
    $("#notes_transaction_id").val(transaction_id);
    load_transaction_notes();
    openNotesModal();
}

// what is this for ???
function downloadattachment(fname){
   var storageRef = firebase.storage().ref('/transactionAttachments/'+fname);
    storageRef.getDownloadURL().then(function(url) {
        console.log(url);
            window.open(url,'_blank');
    });
}
