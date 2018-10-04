let isProd = process.env.NODE_ENV == 'production';
window.$ = window.jQuery = require('jquery');
import "../styles.sass";

$(document).ready(function () {
    $('[data-tabs]').map((i, tab) => {
        let controlsSelect = $(tab).find('[data-controls-select]');
        let controlsBlock = $(tab).find('[data-controls]');
        let itemsBlock = $(tab).find('[data-items]');
        let controlItems = controlsBlock.find('[data-controls-item]');
        let blockItems = itemsBlock.find('[data-items-item]');
        controlsSelect.on('change', function () {
            let id = parseInt($(this).val());
            blockItems.removeClass('active');
            blockItems.eq(id).addClass('active');
        });
        controlItems.on("click", function () {
            let index = controlItems.index($(this));
            controlItems.removeClass('active');
            blockItems.removeClass('active');
            $(this).addClass('active');
            blockItems.eq(index).addClass('active');
        });
    });
});