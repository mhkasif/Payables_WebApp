//SWAL Confirmation box
function SwalConfirmBox(Message,SuccessCallBack) {
    Swal.fire({
        title: '<strong>Confirm</strong>',
        icon: 'info',
        html: Message,
        showCloseButton: true,
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText:
            '<span style="width:100%" onclick="'+SuccessCallBack+'"><i class="fa fa-check"></i>Yes<span>',
        cancelButtonText:
            '<i class="fa fa-close"></i> Cancel',
    });
}
//Swal alert function
function SwalAlert(message,icon){
    Swal.fire({
    position: 'top-end',
    icon: icon,
    title: message,
    showConfirmButton: false,
    timer: 1500
  });
}
//Swal confirmation box to goto dashboard after payment success
function SwalConfirmBoxPaymentSuccess(Message,SuccessCallBack) {
    Swal.fire({
        title: '<strong>Successfully Subscribed</strong>',
        icon: 'success',
        html: Message,
        showCloseButton: true,
        showCancelButton: true,
        focusConfirm: false,
//as its ready redirecting to index, lets just skip the complication by removing the buttons
//        confirmButtonText:
//            '<span style="width:100%" onclick="'+SuccessCallBack+'"><i class="fa fa-check"></i> Go to Dashboard!<span>',
//        cancelButtonText:
//            '<i class="fa fa-close"></i> Cancel',
    });
}
