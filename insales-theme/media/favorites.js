"use strict";

// helpers

function declOfNum(number, titles) {  
  cases = [2, 0, 1, 1, 1, 2];  
  return titles[ (number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5] ];  
}

const Request = async ( link , type ) => {
  const response = await fetch( 
    link, { method : type }
  );
  return await response.json();
};

const RequestHTML = async ( link , type ) => {
  const response = await fetch( 
    link, { method : type }
  );
  return $.parseHTML(await response.text());
};

// main

class Favorites {

  constructor(){
    this.init();
  };

  async init() {
    let current = localStorage.favorites
    this.products = current ? JSON.parse( current ) : []
  };

  events( type, data ) { 

    // this disappear

    console.log(type)

    let _data = data
    $(document).trigger( 'always:favorites' , [{ products: _data }] )

    $(document).trigger( type , [{ products: _data }] )

  }

  async render( place , template ){

    await this.getProducts();	

    for ( let product of this.ProductsJSON ) {
      $( place ) 
        .append( template( product, false ) ) 
    }

    this.events( 'rendered:favorites', this.ProductsJSON )

  };

  async add( product ){

    let inFavorites = _.compact( 
      this.products
      .map(id => id == product ? id : null )
    )

    if ( inFavorites.length > 0 ) {

      this.events( 'in:favorites', this.products )

      return false;

    } else {

      this.products.push( product )

      await this.save()

      this.events( 'added:favorites', this.products )

      return true;

    }

  };

  async remove( product ) {

    this.products = _.without(
      this.products, product
    );

    await this.save()

    this.events( "removed:favorites", this.products )

    return true;

  };

  async save() {
    localStorage
      .favorites = JSON.stringify( 
      _.uniq(
        _.compact( this.products ) 
      )
    )
  };

  async getProducts() {

    let promises = []

    this.ProductsJSON = []

    let formRequests = ( products, promises ) => { 
      promises.push( 
        Request(
          `/products_by_id/${products.join(',')}.json`, "GET"
        )
      ) 
    }

    if ( this.products.length > 0 ) {
      if ( this.products.length > 25 ) {
        for ( let pack of _.chunk( this.products , 25 ) ) 
          formRequests( pack , promises )
      } else {
        formRequests( this.products , promises )
      }


      ( await Promise.all( promises ) ) 
        .map(
        pack => pack.products.map( 
          product => this.ProductsJSON.push( product ) 
        )
      )

    };

  };

};

const favorites = { 
  local : new Favorites
};

favorites.markup = () =>{

  $("[data-favorite]")
    .each(function(){

    let id   = $(this).data('favorite');
    let icon = $(this).find('.fa');
    let text = $(this).find('span');

    let inFavorites = _.compact( 
      favorites.local.products
      .map( product => id == product ? product : null )
    )

    if ( inFavorites.length > 0 ) {
      icon.attr('class','favorites-button fa fa-heart')
    } else {
      icon.attr('class','favorites-button fa fa-heart-o')
    }

  })

};

favorites.page = location.href.includes('favorites')



$((async ()=>{

  if ( favorites.page ) {

    await favorites.local.getProducts();

   	if ( favorites.local.products.length > 0 ) {
    	$('.js-favorites-place').empty()
    }
    
    for ( let product of favorites.local.ProductsJSON ) {
      $('.js-favorites-place').append(	
        $('.js-favorites-card', $.parseHTML( await $.get( product.url ) ) ).html()
      )
    } 
    
    $('.js-mask').inputmask("+7(999)-999-99-99");   

  }

  $(document).on( 'always:favorites', (e)=>{

    $('.js-favorites-counter').text(favorites.local.products.length)

    favorites.local.RenderSmallFavotites()

  })

  removeFavoriteCard = function(id){
    if ( favorites.page ) {
      $(`[data-favorite='${id}']`)
        .parents('.product-card-wrapper')
        .fadeOut()
    }
  }

  $('.js-favorites-counter').text(favorites.local.products.length)

  $(document).on('click','[data-favorite]', async function() {

    let self = $(this)
    let id = self.data('favorite');

    let inFavorites = await favorites.local.add( id ) 

    if ( !inFavorites ) {
      await favorites.local.remove( id ) 
    } 

    favorites.markup()

    removeFavoriteCard(id)

  })

  setTimeout( favorites.markup , 1000 )

  favorites.local.RenderSmallFavotites = async function(){

    if ( favorites.local.products.length > 0 ) {
      $('.js-popup-favorites-empty').hide()
      $('.js-popup-favorites').show()
    } else {
      $('.js-popup-favorites-empty').show()
      $('.js-popup-favorites').hide()
    }

    await favorites.local.getProducts();

    $('.js-favorites-counter-drop')
      .text(`${favorites.local.products.length} ${declOfNum(favorites.local.products.length, ['товар', 'товара', 'товаров'])}`);

    setTimeout(function(){

      $('.js-popup-favorites-products').empty()

      for ( let product of favorites.local.ProductsJSON ) {
        $('.js-popup-favorites-products').append(` 
<div class="js-favorite-mini-product">
<div class="favorite-info">
<img src="${product.first_image.compact_url}" class='favorite-image'>
<div class="favorite-text">
<span class="favorite-title">${product.title}</span>
<span class="favorite-price">${ Shop.money.format(product.variants[0].price) }</span>
</div>
</div>
<div onclick="favorites.local.remove(${product.id});removeFavoriteCard(${product.id})" class="favorite-remove">╳</div>
</div>
`)
      }  

    },100)



  }

  favorites.local.RenderSmallFavotites()



})())

