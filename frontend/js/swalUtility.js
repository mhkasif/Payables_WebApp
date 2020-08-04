function SwalConfirmBox(Message,SuccessCallBack) {
    Swal.fire({
        title: '<strong>Confirmation</strong>',
        icon: 'info',
        html: Message,
        showCloseButton: true,
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText:
            '<span style="width:100%" onclick="'+SuccessCallBack+'"><i class="fa fa-check"></i> OK!<span>',
        cancelButtonText:
            '<i class="fa fa-close"></i> Cancel',
    });
}
function SwalAlert(message,icon){
    Swal.fire({
    position: 'top-end',
    icon: icon,
    title: message,
    showConfirmButton: false,
    timer: 1500
  });
}