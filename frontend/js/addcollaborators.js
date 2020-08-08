
        var db, UserObject;
        var fireBaseConfigInfo;
        var TotalAllowedUsers=3;
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
                    console.log(fireBaseConfigInfo);

                });
        }
        var secondaryApp;
        function initializeFirebase1() {
            getFirebaseConfig().then(function () {
                var firebaseConfig = fireBaseConfigInfo;
                //initialize firebase
                if (!firebase.apps.length) {
                    firebase.initializeApp(firebaseConfig);

               
                }
                secondaryApp = firebase.initializeApp(firebaseConfig, "Secondary");
                db = firebase.firestore();
                firebase.auth().onAuthStateChanged(function (user) {

                    if (user) {
                        UserObject = user;
	                        if (!UserObject.emailVerified) {
                            location.href = url + "/signin";
                        }
                        $('#username').text((UserObject.displayName ? UserObject.displayName : UserObject.email.split("@")[0]));
                        $("#owner_email").html(UserObject.email);
                        $('#userimage').find('img').attr('src', UserObject.photoURL);
                        $('#username').text(UserObject.displayName);
                       var tblStripeCustomers = db.collection("tbl_stripecustomers");
                        tblStripeCustomers.where("UserID","==",localStorage.getItem("userid")).where("CustomerEmail", "==", localStorage.getItem("owner_email")).get().then(function (querySnapshot) {
                            if (querySnapshot.docs.length > 0) {
                                $('#customerid').val(querySnapshot.docs[0].data().customerid);
                                getCustomerMembersAllowed().then(function(resp){
                                    if(resp.length>0){
                                        resp.forEach(function(val){
                                            if(val.status=="active"){
                                                TotalAllowedUsers+=val.quantity;
                                            }
                                        });
                                    }
                                });
                            }
                            });
                            getGroupsDDL();
                        

                    } else {
                        location.href = url + "/signin";
                    }
                });

            });

        }
        var ViewOnly = false;
        $(document).ready(function () {
            initializeFirebase1();
            if (localStorage.getItem("access") != "Owner") {
                //ViewOnly =true;
                location.href = url + "/index";
            }
        });



        function AddCollaboratorGroup() {
            $("#group_add_message").hide();
            if ($("#group-name").val()) {
                    var tbl_groups = db.collection('tbl_groups').where("UserID", "==", localStorage.getItem("userid"));
                    tbl_groups.where("name", "==", $("#group-name").val()).get().then(function (documentsResponse) {
                        if (documentsResponse.docs.length > 0) {
                            $("#group_add_message").html("Group with same name already exist");
                            $("#group_add_message").show();
                        } else {
                            var gname = $("#group-name").val();
                            db.collection('tbl_groups').add({ name: gname, UserID: localStorage.getItem("userid") }).then(function () {
                                db.collection('tbl_audit_log').add({
                                    content: `User Group Added <b>${gname}</b>`,
                                    now: (new Date()).getTime(),
                                    groupid:localStorage.getItem("groupid"),
                                    party: '',
                                    date: '',
                                    amount: '',
                                   refId: localStorage.getItem("userid"),
                                    user: localStorage.getItem("user"),
                                    collection: 'tbl_groups'
                                });
                                $("#group-name").val("");
                                getGroups();
                            });
                        }
                    });

                
            } else {
                $("#group_add_message").html("Please enter group name");
                $("#group_add_message").show();
            }
        }

        function getGroups() {
            var viewOnly = false;
            // Add_Group_table_tbody
            //             loading_rows_tr_group
            $("#loading_rows_tr_group").show();
            db.collection('tbl_groups').where('UserID', '==', localStorage.getItem("userid")).get()
                .then(querySnapshot => {
                    var tbody = document.getElementById('Add_Group_table_tbody');
                    tbody.innerHTML = '';
                    $("#loading_rows_tr_group").hide();
                    querySnapshot.forEach(val => {
                        var data = val.data();
                        data.id = val.id;
                        var tr = document.createElement('tr');
                        var td1 = document.createElement('td');
                        var td2 = document.createElement('td');
                        td1.innerHTML = data.name;
                        td2.innerHTML = `<button class="settings_delete_button"  title="Delete">
        <i class="far fa-trash-alt"></i></button>`;

                        td2.setAttribute("onclick", `DeleteGroup(${JSON.stringify(data)})`);
                        tr.innerHTML += td1.outerHTML + td2.outerHTML;
                        tbody.appendChild(tr);
                    })
                })
        }


        function getGroupsDDL() {
            db.collection('tbl_users').where('UserID', '==', localStorage.getItem("userid")).get()
            .then(querySnapshot => {
                $("#ddlGroup").html("");
                   $("#ddlGroup").append('<option value="" selected="" disabled="" hidden="">--Select--</option>');
                if(querySnapshot.docs[0].data().GroupsList){
                    querySnapshot.docs[0].data().GroupsList.forEach(val => {
                        if(localStorage.getItem("access")=="Group Admin"){
                            $("#gadmin").remove();
                            if(val==localStorage.getItem("groupid")){
                                $("#ddlGroup").append('<option value="'+val+'">'+val+'</option>');
                                addGroupDiv(val);
                            }
                        }
                        else{
                            addGroupDiv(val);
                        $("#ddlGroup").append('<option value="'+val+'">'+val+'</option>');
                        }
                });
                        
getAccessedUsers();
                }
            });
        }

        function addGroupDiv(val){
        
         var GroupDiv ='<div class="group_div" data-groupname="'+val+'" id="group_'+val+'">   <div class="justify-center" style="margin-top:20px;">'+
           ' <a style="display:flex;"><h4 style="width: 100%; text-align: left; color: #949194; font-weight: 500; font-family: lato;">'+val+'</h4>'+
              '     <h4 style="width: 100%; text-align: right; color: #949194; font-weight: 500; font-family: lato;"><span id="mcount_'+val+'"></span> members</h4></a>'+
              '  <div class="settings_setup_container">'+
                 '   <div><span style="font-weight: bold; color: crimson;" id=""></span></div>'+
                 '   <br>'+
                   ' <table class="saved_table">'+
                      '  <thead>'+
                      '      <tr>'+
                      '          <th>Name</th>'+
                      '          <th>Email</th>'+
                      '          <th>Password</th>'+
                      '          <th>Type</th>'+
                      '          <th>Team</th>'+
                      '          <th colspan="2" style="width: 9%;">Action</th>'+
                      '      </tr>'+
                       ' </thead>'+
                        '<tbody id="tbody_'+val+'">'+
                      '  </tbody>'+
                     '   <tr id="loading_rows_tr" class="loading_rows">'+
                      '      <td colspan="7"><i class="fas fa-spinner"></i> &nbsp; Loading table results...</td>'+
                       ' </tr>'+
                   '</table>'+
                '</div>'+ 
            '</div>';
            $("#AllGroups").append(GroupDiv);
                }


        function DeleteGroup(data){
            if(confirm("Are you sure you want to delete the group?")){
                db.collection('tbl_groups').doc(data.id).delete().then(function(){
                    db.collection('tbl_audit_log').add({
                                    content: `User Group Delete <b>${data.name}</b>`,
                                    now: (new Date()).getTime(),
                                    party: '',
                                    date: '',
                                    groupid:localStorage.getItem("groupid"),
                                    amount: '',
                                    refId: localStorage.getItem("userid"),
                                    user: localStorage.getItem("user"),
                                    collection: 'tbl_groups'
                                });
                                getGroups();
                });
            }
        }


        function AddUserToGiveAccess() {
            if($("#ddlGroup").val()){
            var email = document.getElementById('other-email').value;
            var password = document.getElementById('other-pwd').value;
            var type = document.getElementById('other-type').value;
            var viewOnly = false;
            if (viewOnly) {
                viewAlert()
            } else if (!email.includes('@') && !email.includes('.com')) {
            } else if (!password) {
            } else if (!type) {
            } else if (email === UserObject.email) {
            } else {
                if(UserAddedAlready<TotalAllowedUsers){
                    SwalConfirmBox("Are you sure you want to Add User?","AddUserAccess('"+email+"', '"+password+"', '"+type+"');");
                
            }else{
                swal("You have reached the limit of total team members. Please subscribe for additional Team Members.");
            }
            }
	        }else{
            swal("Please fill all fields to add a team member");
        }
        }
        //npm install --save react-native-swipe-list-view
        async function AddUserAccess(email, password, type) {
            let name = email.slice(0, email.indexOf('@'));
            var credential = firebase.auth.EmailAuthProvider.credential(email, password);
            // firebase.auth().currentUser.linkWithCredential(credential)
            // .then(function (res) {
            // var user = res.user;

            secondaryApp.auth().createUserWithEmailAndPassword(email, password)
                .then(function (res) {
                    var user = res.user;
                    db.collection('tbl_linked_account_access').doc(res.user.uid).set({
                        user: name,GroupID: $("#ddlGroup").val() ,group:$("#ddlGroup>option:selected").text(),email: email,islocked:false, owner_email: UserObject.email, password: password, type: type, UserID: localStorage.getItem("userid")
                    })
                        .then(function () {

                            db.collection('tbl_audit_log').add({
                                content: `User Access Added <b>${name}</b> Email <b>${email}</b>`,
                                now: (new Date()).getTime(),
                                party: '',
                                date: '',
                                groupid:localStorage.getItem("groupid"),
                                amount: '',
                                refId: localStorage.getItem("userid"),
                                user: localStorage.getItem("user"),
                                collection: 'tbl_linked_account_access'
                            });
                            getAccessedUsers();
                            document.getElementById('other-email').value = '';
                            document.getElementById('other-pwd').value = '';
                            document.getElementById('other-type').value = '';
                            secondaryApp.auth().signOut();
                        })
                        .catch((error) => {
                            console.log(error);
                        })
                    //})
                    // .catch(function (error) {
                    //     var errorMessage = error.message;
                    // });
                    console.log("Account linking success", user);
                }).catch(function (error) {
                    $("#acc_linking_message").html(error.message);
                    console.log("Account linking error", error);
                });
        }
        var UserAddedAlready = 0;
        function getAccessedUsers() {
            var viewOnly = false;
            $("#loading_rows_tr").show();
            $(".group_div").hide();
           var query = db.collection('tbl_linked_account_access').where('UserID', '==', localStorage.getItem("userid"));
           if(localStorage.getItem("access")=="Group Admin"){
            query = query.where("GroupID","==",localStorage.getItem("groupid"));
           }
           query.get()
                .then(querySnapshot => {
                    var tbody = document.getElementById('Add_User_table_tbody');
                    tbody.innerHTML = '';
                    $("#AllGroups").find("tbody").html('');
                    $("#loading_rows_tr").hide();
                    UserAddedAlready = querySnapshot.docs.length;
                    console.log(UserAddedAlready,TotalAllowedUsers);
                    querySnapshot.forEach(val => {
                        var data = val.data();
                        data.id = val.id;
                        var tr = document.createElement('tr');
                        var td1 = document.createElement('td');
                        var td2 = document.createElement('td');
                        var td3 = document.createElement('td');
                        var td4 = document.createElement('td');
                        var td5 = document.createElement('td');
                        var td6 = document.createElement('td');
                        var td7 = document.createElement('td');


                        td1.innerHTML = data.user;
                        td2.innerHTML = data.email;
                        td5.innerHTML = `<a class="teams_type"> ${data.group} </a>`;
                        td3.innerHTML = ``;
                        td4.innerHTML = `<a class="collaborator_type"> ${data.type} </a>`;
                        td6.innerHTML = '<button class="settings_delete_button" style="color: #f96f6f; background: none; border: 2px solid #f96f6f; font-weight: 600;"  title="'+(data.islocked?"User Locked":"User Unlocked")+'">'+
                        '<i class="fas fa-'+(data.islocked?"lock":"lock-open")+'"></i> &nbsp; '+(data.islocked==true?"Unlock":"Lock")+'</button>';
                        td7.innerHTML = `<button class="settings_delete_button" style="background: #f96f6f;border: 2px solid #f96f6f;"  title="Delete">
                        <i class="far fa-trash-alt"></i> &nbsp; Delete</button>`;

                        viewOnly ? td5.setAttribute("onclick", `viewAlert();`) :
                            td7.setAttribute("onclick", `ConfirmDeleteUser(${JSON.stringify(data)})`);
                            viewOnly ? td6.setAttribute("onclick", `viewAlert();`) :
                            td6.setAttribute("onclick", `ConfirmLockUnlock(${JSON.stringify(data)})`);
                        tr.innerHTML += td1.outerHTML + td2.outerHTML + td3.outerHTML + td4.outerHTML +  td5.outerHTML + td6.outerHTML + td7.outerHTML;
                        if(data.group){
                            var tbodyGroup = document.getElementById("tbody_"+data.group);
                            tbodyGroup.appendChild(tr);
                            $("#group_"+data.group).show();
                            $("#loading_rows_tr_"+data.group).hide();
                        }else{
                        tbody.appendChild(tr);
                        }

                    });
                    $(".group_div").each(function(i,val){
                        var groupName=$(val).attr("data-groupname");
                        var mCountForGroup = $(val).find("tbody>tr").length;
                        $("#mcount_"+groupName).html(mCountForGroup);
                    });
                })
        }
var publicData=null;
        function ConfirmLockUnlock(data){
            publicData=data;
            SwalConfirmBox("Are you sure?","LockUnlockUser();");
        }

        function ConfirmDeleteUser(data){
            publicData=data;
            SwalConfirmBox("Are you sure?","RevokeUser();");
        }

        function viewAlert() {
            swal("You don't have the permission to remove a user");
        }
        function LockUnlockUser(){
            var data = publicData;
                db.collection('tbl_linked_account_access').doc(data.id).update({islocked:data.islocked?false:true})
                .then(function () {
                    disableUser(data.id,(data.islocked==true?false:true)).then(function(){

                            db.collection('tbl_audit_log').add({
                                content: `User  <b>${data.user}</b> is set to <b>${(data.islocked?"unlock":"lock")}</b>`,
                                now: (new Date()).getTime(),
                                party: '',
                                date: '',
                                groupid:localStorage.getItem("groupid"),
                                amount: '',
                                refId: localStorage.getItem("userid"),
                                user: localStorage.getItem("user"),
                                collection: 'tbl_linked_account_access'
                            });
                            getAccessedUsers();

                        });
                   
                });
            
        }

        function disableUser(uid,disabled) {
            
            return fetch('/disable-user-account', {
              method: 'post',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                uid: uid,
                disabled:disabled
              }),
            })
              .then((response) => {
                return response.json();
              })
              .then((result) => {
                  console.log(result);
                return result;
              });
          }

        function RevokeUser() {
               var data = publicData;
                secondaryApp.auth().signInWithEmailAndPassword(data.email, data.password)
                    .then(async (res) => {
                        Revoke(data);
                    });
            
        }
        function Revoke(del) {

            secondaryApp.auth().currentUser.delete().then(function () {
                console.log("Team member deleted from authentication ")
            }).catch(function (error) {
                console.log("error happens while deleting from authentication", error);
            });
            db.collection('tbl_linked_account_access').doc(del.id).delete()
                .then(function () {
                    db.collection('tbl_audit_log').add({
                        content: `User Access Deleted <b>${del.user}</b> Email <b>${del.email}</b>`,
                        now: (new Date()).getTime(),
                        party: '',
                        date: '',
                        groupid:localStorage.getItem("groupid"),
                        amount: '',
                       refId: localStorage.getItem("userid"),
                        user: localStorage.getItem("user"),
                        collection: 'tbl_linked_account_access'
                    });
                    getAccessedUsers();
                })
                .catch(err => swal(err.message));
        }
        function SignOutFirebase() {
            firebase.auth().signOut().then(function () {
                location.href = url + "/signin";
            }).catch(function (error) {
                // An error happened.
            });
        }


        function getCustomerMembersAllowed() {
            let customerid = document.querySelector('#customerid').value;
            return fetch('/get-cutomer-members-allowed', {
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
                  console.log(response.response);
                return response.response.data;
          
              });
            
        }
