EventBus.subscribe('update_items:insales:compares', function (data) {
  $('.js-compares-widget-count').html(data.products.length);
});

EventBus.subscribe('update_items:insales:compares', function (data) {
  var $product = $('.product-form');
  var productId = $product.data('product-id');
  var $compareAdd = $product.find('.js-compare-add');
  var $compareDelete = $product.find('.js-compare-delete');

  var inCompare = _.find(data.products, function(product) {
    return product.id == productId;
  });

  if (inCompare) {
    $compareAdd.hide();
    $compareDelete.show();
  } else {
    $compareAdd.show();
    $compareDelete.hide();
  }
});
EventBus.subscribe('remove_item:insales:compares', function (data) {
  if (Site.template != 'compare') {
    return false;
  }

  $('[data-compared-id="'+ data.action.item +'"]').remove();

  if (data.products.length == 0) {
    $('#js-compare-inner').hide();
    $('.js-compare-empty').removeClass('hidden');
  };
});

$(function () {
  var compareWrapper = '#js-compare-wrapper';
  var compareInner = '#js-compare-inner';
  localforage.setItem('same_row', '0');
  $(document).on('click', '.js-same-toggle', function (event) {
    $(this).find('.link-text')
      .toggleClass('hide')
      .toggleClass('show');
    this.same_row = !this.same_row;
    localforage.setItem('same_row', (this.same_row ? '1' : '0'));
    $('.js-compare-table .same-row')
      .toggle();
  });

  EventBus.subscribe('update_items:insales:compares', function (data) {
    if (Site.template != 'compare') {
      return false;
    }
    if (data.products.length < 1) {
      return false;
    }

    var _now = new Date().getTime();
    var _url = '?' + _now;
    var _getNode = _url + compareWrapper + ' ' + compareInner;

    $(compareWrapper).load(_getNode, function () {

      if ($('.js-compare-table .same-row').length && (data.products.length > 1)){
        $('.compare-toolbar').removeClass('hidden');
        localforage.getItem('same_row')
          .then(function (same_row) {
            console.log('>>', same_row);
            setTimeout(function () {
              if (same_row == '1') {
                $('.js-same-toggle').find('.link-text')
                  .toggleClass('hide')
                  .toggleClass('show');
                $('.js-compare-table .same-row')
                  .hide();
              }
            }, 0)
          })
      }
      else{
        $('.compare-toolbar').addClass('hidden');
      }
    });
  });
});
