// Пересчет суммы корзины
$(function(){
  
  EventBus.subscribe('add_items:insales:cart', function (e) {

    let AddedItem = Object.keys( e.action.items )[0]

    let AddedItemJSON = null

    Cart.order.order_lines.forEach(
      line => line.id == AddedItem ? AddedItemJSON = line : null 
    )

    $('.js-cart-add-image').attr('src',AddedItemJSON.first_image.medium_url)
    $('.js-cart-add-title').text(AddedItemJSON.title)
    $('.js-cart-add-price').text(`${AddedItemJSON.quantity} × ${Shop.money.format(AddedItemJSON.sale_price)}`)

    $.fancybox.open({
      src  : '#cart-modal',
      type : 'inline',
      touch: false,
      clickSlide : false
    });

  });

  EventBus.subscribe('update_items:insales:cart', function (data) {
    $('.js-shopcart-total-summ').html(Shop.money.format(data.total_price));

    if ( Cart.order.items_count == 0 ) {
      $('.js-popup-cart').hide()
      $('.js-popup-cart-empty').show()
    } else {
      $('.js-popup-cart').show()
      $('.js-popup-cart-empty').hide()
    }


    $('.js-popup-cart-products').empty()

    for ( let product of Cart.order.order_lines ) {
      $('.js-popup-cart-products').append(` 
        <div class="js-favorite-mini-product">
        <div class="favorite-info">
        	<img src="${product.first_image.compact_url}" class='favorite-image'>
            <div class="favorite-text">
                <span class="favorite-title">${product.title}</span>
                <span class="favorite-price">${product.quantity} x ${ Shop.money.format(product.sale_price) }</span>
            </div>
        </div>
        	<div onclick="Cart.delete({items: [${product.variant_id}]})" class="favorite-remove">╳</div>
        </div>
        `)
    }  

    $('.js-cart-counter-drop').text(`${Cart.order.items_count} ${declOfNum(Cart.order.items_count, ['товар', 'товара', 'товаров'])}`);

    $('.js-cart-total-drop').text(Shop.money.format(Cart.order.total_price))




    if (Site.template != 'cart') {
      return false;
    }
    //
    // console.log('cart: ', data);
    //  console.log(data.total_price);


  });

  // пересчет актуальной цены за товар и общей стоимости позиции
  EventBus.subscribe('update_variant:insales:item', function (data) {
    if (Site.template != 'cart') {
      return false;
    }

    var $item = data.action.product;
    var $price = $item.find('.js-item-price');
    var $total = $item.find('.js-item-total-price');
    var total = data.action.price * data.action.quantity.current;

    $price.html(Shop.money.format(data.action.price));
    $total.html(Shop.money.format(total));
  });

  // Удаляем позицию
  EventBus.subscribe('delete_items:insales:cart', function (data) {
    if (Site.template != 'cart') {
      return false;
    }
    
    var $button = $(`[data-item-delete='${data.action.items[0]}']`);
    var $cartItem = $button.parents('.cart-item:first');
    var $emptyMessage = $('.js-cart-empty');
    var $cartForm = $('[data-cart-form]');

    $cartItem
      .slideUp(300, function () {
      $(this).remove();

      if (data.order_lines.length == 0) {
        $cartForm
          .addClass('hidden');
        $emptyMessage
          .removeClass('hidden');
      }
    });
  });

  // Выводим список применившихся скидок
  EventBus.subscribe('update_items:insales:cart', function (data) {
    if (Site.template != 'cart') {
      return false;
    }

    // console.log('>>', data);
    $('.js-discount-comment-list').html(Template.render(data, 'cart-discounts'));
  })

  // widget
  EventBus.subscribe('update_items:insales:cart', function (data) {
    $('.js-shopcart-widget-amount').html(Shop.money.format(data.total_price));
    $('.js-shopcart-widget-count').html(_.round(data.items_count, 3));
  });
});
