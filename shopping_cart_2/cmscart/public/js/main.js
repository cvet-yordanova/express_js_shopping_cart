$(function () {
    if ($('textarea#ta').length) {
        CKEDITOR.replace('#ta');
    }

    $('.confirmDeletion').on('click', function () {
        if (!confirm('Confirm deletion')) {
            return false;
        }
    })
});

