<!DOCTYPE html>
<?php
use \PhpPot\Service\StripePayment;

require_once "config.php";
if (!empty($_POST["token"])) {
    require_once 'StripePayment.php';
    $stripePayment = new StripePayment();
    $ExpiryDate = date('Y-m-d');
    $stripeResponse = $stripePayment->chargeAmountFromCard($_POST,$_GET['package']);
    if($_GET['package']==1){
		$ExpiryDate = date_add(date_create($ExpiryDate),date_interval_create_from_date_string("30 days"));
	}
	if($_GET['package']==2){
		$ExpiryDate = date_add(date_create($ExpiryDate),date_interval_create_from_date_string("90 days"));
	}
	if($_GET['package']==3){
		$ExpiryDate = date_add(date_create($ExpiryDate),date_interval_create_from_date_string("365 days"));
	}
    $dateExp = $ExpiryDate->format('Y-m-d');
    $amount = $stripeResponse["amount"] /100;
	/*echo $stripeResponse["amount"];
	echo $stripeResponse["currency"];
    echo $stripeResponse["balance_transaction"];
    echo $stripeResponse["status"];*/
	$htmlscript = '';
	if($stripeResponse["status"]=="succeeded"){
	$successMessage = "Payment Successfull";
	$htmlscript =  '<script id="paymentverifiedScript">function paymentVerified() {
            var tblUsers = db.collection("tbl_users");
            tblUsers.where("UserID", "==", UserObject.uid).get().then(function (querySnapshot) {
                if (querySnapshot.docs.length > 0) {
                    tblUsers.doc(querySnapshot.docs[0].id).update(
                        {
                            PaymentVerified: true,
                            PackageID: '.$_GET["package"].',
                            Email: \''.$_POST["email"].'\',
                            AmountPaid: '.$stripeResponse["amount"].',
                            TransactionDate: \''.strval(date('Y-m-d')).'\',
				ExpiryDate: \''.strval($dateExp).'\',
				TransactionID: \''.$stripeResponse["balance_transaction"].'\'
			}
                    ).then(function () {
					var tblCoupons = db.collection("tbl_coupons");
						tblCoupons.where("coupon_number", "==", "'.$_POST["coupon"].'").get()
						.then(function (res) {
							if(res.docs.length>0){
							tblCoupons.doc(res.docs[0].id).update({IsValid:false});
							}
                        });
                        $("#paymentverifiedScript").remove();
                        location.href = url + "/index.html";
                    });
                }
            });
        }
        var db, UserObject;
        function initializeFirebase1() {
            var firebaseConfig = {
                apiKey: "AIzaSyCtH9KgxZjcSUAXo2Z75LyzRe0WO4mwg7g",
                authDomain: "fiver-1-safeer.firebaseapp.com",
                databaseURL: "https://fiver-1-safeer.firebaseio.com",
                projectId: "fiver-1-safeer",
                storageBucket: "fiver-1-safeer.appspot.com",
                messagingSenderId: "410280896300",
                appId: "1:410280896300:web:91495e0238d6558979ae89"
            };
            //initialize firebase
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);


                db = firebase.firestore();
                tblUsers = db.collection("tbl_users");
            }
            paymentVerified();
        }
        $(document).ready(function () {
            $("body").hide(); firebase.auth().onAuthStateChanged(function (user) {

                if (user) {
                    UserObject = user;
                    initializeFirebase1();
                } else {
                    location.href = url + "/signin.html";
                }
            });
        });
    </script>';
	}else{
		$successMessage = "Payment Failed";
	}
}
?>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">

<head>
    <meta charset="utf-8" />
    <title>Timeline Dragable Table</title>
    <link href="//netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap.min.css" rel="stylesheet" id="bootstrap-css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/normalize/5.0.0/normalize.min.css" rel="stylesheet">
    <link crossorigin="anonymous" href="https://use.fontawesome.com/releases/v5.8.1/css/all.css"
        integrity="sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf" rel="stylesheet">
    <link href="css/style.css" rel="stylesheet">
    <link href="css/select2.css" rel="stylesheet">
    <link href="css/style.css" rel="stylesheet">
    <link href="css/style-stripe-payment.css" rel="stylesheet" type="text/css" />
</head>

<body style="display:none;">
    <nav class="navbar navbar-default navbar-fixed-top" role="navigation"
        style="box-shadow: 0px 0px 5px 0px;padding: 0 15px;">
        <!-- Brand and toggle get grouped for better mobile display -->
        <div class="navbar-header">
            <button class="navbar-toggle" data-target="#bs-example-navbar-collapse-1" data-toggle="collapse"
                type="button">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
            <a class="navbar-brand" href="/index.html">Timeline</a>
        </div>

        <!-- Collect the nav links, forms, and other content for toggling -->
        <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
            <ul class="nav navbar-nav">
                <!--            <li class="active"><a href="#">Link</a></li>-->
                <!--            <li><a href="#">Link</a></li>-->
            </ul>
            <ul class="nav navbar-nav navbar-right">
                <li>
                    <a href="/index.html">
                        <span id="signout"
                            style="margin-right: 35px;font-size: 15px;font-weight: bold;">Dashboard</span>
                    </a>
                </li>
                <li>
                    <a href="#">
                        <span id="userimage">
                            <img src="favicon.ico" style="    max-height: 40px;
    border-radius: 50%;
    border: 2px solid white;
    position: absolute;
    left: -35px;
    top: 5px;" />
                        </span>
                        <span id="username">Login Please</span>
                    </a>
                </li>
                <li>
                    <a href="#" onclick="SignOutFirebase();">
                        <span id="signout"><i class="glyphicon glyphicon-lock"></i> Logout</span>
                    </a>
                </li>
            </ul>
        </div><!-- /.navbar-collapse -->
    </nav>
    <div style="margin-top:100px;">
        <center>
            <div style="margin-top: 25px;height:450px;width: 100%;background: #d4d4d3aa;padding: 15px;border-radius: 10px;">

                <?php if(!empty($successMessage)) { ?>
                <div id="success-message"><?php echo $successMessage; ?></div>
                <?php  } ?>
                <div id="error-message"></div>
                <a href="" onclick=""></a>
                <form action="#" method="post" id="payment-form">
                    <div class="form-row">
                        <h4 for="card-element">
                            <b>Credit or debit card<b />
                        </h4>
                        <div class="field-row"> <span id="email-info" class="info"></span><br> <input type="text"
                                placeholder="Email" id="email" name="email" class="demoInputBox">
								<br>
								<span id="err_email_invalid" style="color:red; display:none; margin:5px;">Email is not valid</span>
								<span id="err_email_required" style="color:red; display:none; margin:5px;">Email Required</span>
                        </div>
                        <div class="field-row"> <span id="email-info" class="info"></span><br> <input type="number"
                                placeholder="Phone" id="phone" name="phone" class="demoInputBox">
							<br>
								<span id="err_phone_required" style="color:red;display:none; margin:5px;">Phone Required</span>
                        </div>

                        <div class="field-row"> <span id="email-info" class="info"></span><br> <input type="text"
                                placeholder="Coupon" id="coupon" name="coupon" class="demoInputBox">
							<br>	<span id="err_coupon_expired" style="color:red; display:none; margin:5px;">Phone Required</span>
                        </div>
						 <div class="group">
						      <label>
						        <div id="card-element" class="field"></div>
						      </label>
						    </div>

                        <!-- Used to display form errors. -->
                        <div id="card-errors" role="alert"></div>
                    </div>
                    <input type='hidden' name='amount' value='0.5'> <input type='hidden' name='currency_code'
                        value='USD'> <input type='hidden' name='item_name' value='Test Product'>
                    <input type='hidden' name='item_number' value='PHPPOTEG#1'>
					  <input type='hidden' id="coupon_discount" name='coupon_discount' value="0">
					<button type="button" onclick="validateForm()">Submit Payment</button>
                    <button id="submit_button" style="display:none;">Submit Payment</button>
                </form>
                <div class="test-data" style="display:none">
                    <h3>Test Card Information</h3>
                    <p>Use these test card numbers with valid expiration month
                        / year and CVC code for testing with this demo.</p>
                    <table class="tutorial-table" cellspacing="0" cellpadding="0" width="100%">
                        <tr>
                            <th>CARD NUMBER</th>
                            <th>BRAND</th>
                        </tr>
                        <tr>
                            <td>4242424242424242</td>
                            <td>Visa</td>
                        </tr>
                        <tr>
                            <td>4000056655665556</td>
                            <td>Visa (debit)</td>
                        </tr>

                        <tr>
                            <td>5555555555554444</td>
                            <td>Mastercard</td>
                        </tr>

                        <tr>
                            <td>5200828282828210</td>
                            <td>Mastercard (debit)</td>
                        </tr>

                        <tr>
                            <td>378282246310005</td>
                            <td>American Express</td>
                        </tr>

                        <tr>
                            <td>6011111111111117</td>
                            <td>Discover</td>
                        </tr>

                        <tr>
                            <td>30569309025904</td>
                            <td>Diners Club</td>
                        </tr>

                        <tr>
                            <td>3566002020360505</td>
                            <td>JCB</td>
                        </tr>
                        <tr>
                            <td>6200000000000005</td>
                            <td>UnionPay</td>
                        </tr>

                    </table>
                </div>
                <script src="https://js.stripe.com/v3/"></script>

                <script>

                    // Create a Stripe client.
                    var stripe = Stripe("<?php echo STRIPE_PUBLISHABLE_KEY; ?>");
					var elements = stripe.elements();

					var card = elements.create('card', {
  						hidePostalCode: true,
  						style: {
  						  base: {
  						    iconColor: '#666EE8',
  						    color: '#31325F',
  						    lineHeight: '40px',
  						    fontWeight: 300,
  						    fontFamily: 'Helvetica Neue',
  						    fontSize: '15px',

  						    '::placeholder': {
  						      color: '#CFD7E0',
  						    },
 						   },
 							 }
							});
						card.mount('#card-element');

                    // Handle real-time validation errors from the card Element.
                    card.on('change', function (event) {
                        var displayError = document.getElementById('card-errors');
                        if (event.error) {
                            displayError.textContent = event.error.message;
                        } else {
                            displayError.textContent = '';
                        }
                    });
					//err_email_required  err_email_invalid err_phone_required err_coupon_expired
                    function validateForm() {
                        var error = 0;
							$("#err_email_invalid").hide();
							 $("#err_email_required").hide();
							 $("#err_phone_required").hide();
							 	$("#err_coupon_expired").hide();
                        if ($("#email").val()) {
                        $("#err_email_required").hide();
						    if (isEmail($("#email").val())) {
								$("#err_email_invalid").hide();
                            } else {
								$("#err_email_invalid").show();
                                error++;
                            }
                        } else {
						$("#err_email_required").show();
                            error++;
                        }
                        if ($("#phone").val()) {
						$("#err_phone_required").hide();
                        } else {
							$("#err_phone_required").show();
                            error++;
                        }
						if($("#coupon").val()){
						var tblCoupons = db.collection("tbl_coupons");
						tblCoupons.where("coupon_number", "==", $("#coupon").val()).get().then(function (res) {
                        if (res.docs.lenght>0 && res.docs[0].data().IsValid==true) {
						$("#coupon_discount").val(res.docs[0].data().DiscountPercentage);
                        if (error == 0) {
						$("#submit_button").trigger("click");
                        }
							$("#err_coupon_expired").hide();
                        }else{
							$("#err_coupon_expired").show();
							$("#err_coupon_expired").html("Coupon not valid");
						}
						});}else{
							$("#err_coupon_expired").hide();
						if (error == 0) {
						$("#submit_button").trigger("click");
                        }
					}

                    }
                    // Handle form submission.
                    var form = document.getElementById('payment-form');
                    form.addEventListener('submit', function (event) {
                        event.preventDefault();

                        stripe.createToken(card).then(function (result) {
                            if (result.error) {
                                // Inform the user if there was an error.
                                var errorElement = document.getElementById('card-errors');
                                errorElement.textContent = result.error.message;
                            } else {
                                // Send the token to your server.
                                stripeTokenHandler(result.token);
                            }
                        });
                    });
                    function isEmail(email) {
                        var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                        return regex.test(email);
                    }
                    // Submit the form with the token ID.
                    function stripeTokenHandler(token) {
                        // Insert the token ID into the form so it gets submitted to the server
                        var form = document.getElementById('payment-form');
                        var hiddenInput = document.createElement('input');
                        hiddenInput.setAttribute('type', 'hidden');
                        hiddenInput.setAttribute('name', 'token');
                        hiddenInput.setAttribute('value', token.id);
                        form.appendChild(hiddenInput);

                        // Submit the form
                        form.submit();
                    }
                </script>
            </div>
        </center>
    </div>
    <script src='https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js'></script>
    <script src='https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min.js'></script>
    <script>
        var url = location.origin + location.href.replace(location.origin, '').substr(0, location.href.replace(location.origin, '').lastIndexOf('/'));
       // var url = "https://clever-engelbart-ff8898.netlify.app/";
    </script>
    <!-- The core Firebase JS SDK is always required and must be listed first -->
    <script src="https://www.gstatic.com/firebasejs/7.15.5/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/7.15.5/firebase-auth.js"></script>
    <script src="https://www.gstatic.com/firebasejs/7.15.5/firebase-firestore.js"></script>
    <script src="https://cdn.firebase.com/libs/firebaseui/3.5.2/firebaseui.js"></script>
    <script src="https://js.stripe.com/v3/"></script>
    <link type="text/css" rel="stylesheet" href="https://cdn.firebase.com/libs/firebaseui/3.5.2/firebaseui.css" />

    <script>
        var db;
        var UserObject;
        var tblAccounts/* = db.collection("tbl_accounts")*/;
        var tblAccountCheques/* = db.collection("tbl_account_cheques")*/;
        var tblUsers;
        $(document).ready(function () {

            initializeFirebase();
            firebase.auth().onAuthStateChanged(function (user) {
                if (user) {
                    UserObject = user;

                    $('#userimage').find('img').attr('src', UserObject.photoURL);
                    $('#username').text(UserObject.displayName);
                    tblUsers = db.collection("tbl_users");
                    tblUsers.where("UserID", "==", UserObject.uid).get().then(function (res) {
                        console.log(res);

                        if (res.docs[0].data().PaymentVerified) {
                            location.href = url + "/index.html";
                        } else {
                            $("body").show();
                        }
                    });
                } else {
                    location.href = url + "/signin.html";
                }
            });
        });


        function SignOutFirebase() {
            firebase.auth().signOut().then(function () {
                location.href = "http://localhost/fiver01/signin.html";
            }).catch(function (error) {
                // An error happened.
            });
        }
        function initializeFirebase() {
            var firebaseConfig = {
                apiKey: "AIzaSyCtH9KgxZjcSUAXo2Z75LyzRe0WO4mwg7g",
                authDomain: "fiver-1-safeer.firebaseapp.com",
                databaseURL: "https://fiver-1-safeer.firebaseio.com",
                projectId: "fiver-1-safeer",
                storageBucket: "fiver-1-safeer.appspot.com",
                messagingSenderId: "410280896300",
                appId: "1:410280896300:web:91495e0238d6558979ae89"
            };
            //initialize firebase
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);


                db = firebase.firestore();
                tblUsers = db.collection("tbl_users");


            }
        }
    </script>
    <?php if (isset($_GET['package'])) { ?>
    <?php     $packageID = $_GET['package']; ?>
    <?php } else { ?>
    <?php  echo '<script> location.href = url + "/pricing.html";</script>'?>
    <?php } ?>


    <style>
	[type=submit], [type=reset], button, html [type=button] {
padding:0px !important;
}
     * {
  font-family: "Helvetica Neue", Helvetica;
  font-size: 15px;
  font-variant: normal;
  padding: 0;
  margin: 0;
}

html {
  height: 100%;
}

body {
  background: #E6EBF1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
}

form {
  width: 480px;
  margin: 20px 0;
}

.group {
margin-top: 20px;
    background: white;
    box-shadow: 0 7px 14px 0 rgba(49,49,93,0.10), 0 3px 6px 0 rgba(0,0,0,0.08);
    border-radius: 8px;
    width: 95%;
    margin-bottom: 35px;
}

label {
  position: relative;
  color: #8898AA;
  font-weight: 300;
  height: 40px;
  line-height: 40px;
  margin-left: 20px;
  display: flex;
  flex-direction: row;
}

.group label:not(:last-child) {
  border-bottom: 1px solid #F0F5FA;
}

label > span {
  width: 80px;
  text-align: right;
  margin-right: 30px;
}

.field {
  background: transparent;
  font-weight: 300;
  border: 0;
  color: #31325F;
  outline: none;
  flex: 1;
  padding-right: 10px;
  padding-left: 10px;
  cursor: text;
}

.field::-webkit-input-placeholder { color: #CFD7E0; }
.field::-moz-placeholder { color: #CFD7E0; }

button {
  display: block;
  background: #666EE8;
  color: white;
  box-shadow: 0 7px 14px 0 rgba(49,49,93,0.10),
              0 3px 6px 0 rgba(0,0,0,0.08);
  border-radius: 4px;
  border: 0;
  margin-top: 20px;
  font-size: 15px;
  font-weight: 400;
  width: 95%;
  height: 40px;
  line-height: 38px;
  outline: none;
}

button:focus {
  background: #555ABF;
}

button:active {
  background: #43458B;
}

.outcome {
  float: left;
  width: 100%;
  padding-top: 8px;
  min-height: 24px;
  text-align: center;
}

.success, .error {
  display: none;
  font-size: 13px;
}

.success.visible, .error.visible {
  display: inline;
}

.error {
  color: #E4584C;
}

.success {
  color: #666EE8;
}

.success .token {
  font-weight: 500;
  font-size: 13px;
}

    </style>
    <?php if(!empty($htmlscript)) {echo $htmlscript; }  ?>
</body>

</html>
