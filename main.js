'use strict';

/* global $ */

import store from './store.js';
import api from './api.js';
//I couldn't get this to work for so long because I forgot that you need a .js extension when not using npm


// once letsGo is called, it starts up all the listeners and then starts the initial start up.
function letsGo(){
  addBookmarkClickedWhatDo();
  filterMaster();
  biggerSmaller();
  theyClickedEdit();
  deleteClickedWhatDo();
  bookmarkConfirmed();
  weAreNotAdding();
  editConfirmed();
  weAreNotEditting();
  goAway();
  hereWeGo();
}

function hereWeGo(){
  // initial render so that page isn't completely empty
  render();

  // get the items and then go again
  api.getItems()
    .then(bookmarks => {
      bookmarks.forEach(bookmark => store.addBookmark(bookmark));
      render();
    })
    .catch(error => {
      store.error = error;
      render();
    });
}

//this just turns stuff to a usable form
function jsonize(form){
  let unJsoned = new FormData(form);
  let jsonified = {};
  unJsoned.forEach((val, name) => jsonified[name] = val);
  return JSON.stringify(jsonified);
}

// event listener functions.   
function addBookmarkClickedWhatDo(){
  $('main').on('click', '#addBookmark', function(){
    store.adding = true;
    render();
  });
}

function filterMaster(){
  $('main').on('change', '#filter', function(x){
    let filterVal = $(x.currentTarget).val();
    store.filter = parseInt(filterVal);
    render();
  });
}

function biggerSmaller(){
  $('main').on('click', '.header', function(x){
    x.preventDefault();
    let id = $(x.currentTarget).closest('.bookmark').data('id');
    let bookmark = store.findById(id);
    bookmark.expanded = !bookmark.expanded;
    render();
  });
}

function theyClickedEdit(){
  $('main').on('click', '.gooey-insides .edit', function(x){
    x.preventDefault();
    let id = $(x.currentTarget).closest('.bookmark').data('id');
    store.editing = id;
    render();
  });
}

function deleteClickedWhatDo(){
  $('main').on('click', '.gooey-insides .delete', function(x){
    x.preventDefault();
    let id = $(x.currentTarget).closest('.bookmark').data('id');
    api.deleteItem(id)
      .then(() => {
        store.deleteBookmark(id);
        render();
      })
//WHY WON'T YOU RENDER?!?  Why does it require a refresh to show something is deleted?
      .catch(error => {
       store.error = error;
        render();
      });
  });
}

function bookmarkConfirmed(){
  $('main').on('submit', '#addForm', function(x){
    x.preventDefault();

    let form = $('main').find('#addForm')[0];
    let theGoods = jsonize(form);
    api.addItem(theGoods)
      .then(theGoods => {
        store.addBookmark(theGoods);
        store.adding = false;
        render();
      })

      .catch(error => {
        store.error = error;
        render();
      });

  });

  
}
//for cancelling adding a new bookmark
function weAreNotAdding(){
  $('main').on('click', '#cancelAdd', function(x){
    x.preventDefault();
    store.adding = false;
    render();
  });
}
//for when you are done editting
function editConfirmed(){
  $('main').on('submit', '#editForm', function(x){
    x.preventDefault();

    let form = $('main').find('#editForm');
    let id = form.data('id');
    let stuff = jsonize(form[0]);
    
    api.editItem(id, stuff)
      .then(() => {
        store.editBookmark(id, stuff);
        store.editing = null;
        render();
      })
      .catch(error => {
        store.error = error;
        render();
      });
  });
}
//for when you cancel an edit
function weAreNotEditting(){
  $('main').on('click', '#cancelEdit', function(x){
    x.preventDefault();
    store.editing = null;
    render();
  });
}
//gets rid of error message
function goAway(){
  $('main').on('click', '#closeError', function(x){
    x.preventDefault();
    store.error = null;
    render();
  });
}



// render funtion.  
function render(){
  let html = '';
  html += button();
  html += placeBookmarkOnPage(store.bookmarks, store.filter);
  html += buildBookmarkForm();
  html += HtmlForEdit();
  $('main').html(html);
}

// template stuff

function button(){
  return `<section>
      <h2>Lets Add A Bookmark</h2>
    <button id="addBookmark">Add bookmark</button>
  </section>`;
}

function errorMaster(){
  return `<div class="error">
    <h3>ERROR!</h3>
    <p>${store.error.code ? store.error.code + ' - ' : ''} ${store.error.message}</p>
    <a href="#" id="closeError">dismiss</a>
  </div>`;
}

function placeBookmarkOnPage(){
  let main = buildBookmark();
  let filterControl = '';
  if (store.bookmarks.length > 0){
    filterControl = `<div class="group">
      <label for="filter">Showing:</label>
      <select name="filter" id="filter">
        <option ${store.filter === 1 ? 'selected' : ''} value="1">1 or better</option>
        <option ${store.filter === 2 ? 'selected' : ''} value="2">2 or better</option>
        <option ${store.filter === 3 ? 'selected' : ''} value="3">3 or better</option>
        <option ${store.filter === 4 ? 'selected' : ''} value="4">4 or better</option>
        <option ${store.filter === 5 ? 'selected' : ''} value="5">5 or better</option>
      </select>
    </div>`;
  }

  return `<section>
    <header>
      <h2>Bookmarks</h2>
      ${filterControl}
    </header>
    ${store.adding === false && store.editing === null && store.error !== null ? errorMaster() : ''}
    ${main}
  </section>`;
}

function buildBookmark(){
  let html = '';
  let bookmarks = store.bookmarks.filter(bookmark => bookmark.rating >= store.filter);
//if they don't have any yet
  if (bookmarks.length === 0) {
    html = '<p>Add somethin, will ya!</p>';

  } else {
    bookmarks.forEach(bookmark => {
      if (bookmark.rating < store.filter) return false;

      let insides = '';
      if (bookmark.expanded === true){
        insides = `<div class="gooey-insides">
          <p>${bookmark.desc}</p>
          <div class="links">
            <a href="${bookmark.url}">Go To Bookmarked Website</a>
            <div class="icons">
              <a href="#" title="Edit" class="edit">Make A Change</a>
              <a href="#" title="Delete" class="delete">Begone!(must refresh)</a>
            </div>
          </div>
        </div>`;
      }
//seriously, why does it require a refresh to show that something has been deleted 
      html += `<div data-id="${bookmark.id}" class="bookmark ${bookmark.expanded === true ? 'expanded' : ''}">
        <a href="#" class="header">
          <h2>${bookmark.title}</h2></a>
          <div class="rating">
            Rank ${bookmark.rating}
          </div>
        ${insides}
      </div>`;
    });
  }
  return html;
      
}
//for when you need the html for how to add a bookmark.  It's good to start with Rank 1 checked to stop the user from forgetting to select one.  
//they can always change their selection later

function buildBookmarkForm(){
  let html = '';

  if (store.adding === true){
    html = `<section class="overlay">
        <form id="addForm">
          <header>
            <h3>Add Bookmark</h3>
          </header>
          ${store.error !== null ? errorMaster() : ''}
            <label for="title">Title:</label>
            <input required type="text" id="title" name="title" placeholder="An example website"><br>
            <label for="url">Address:</label>
            <input required type="url" id="url" name="url" placeholder="https://example.com"><br>
            <label for="desc">Description:</label><br>
            <textarea required id="desc" name="desc" placeholder="A domain never up for purchase managed by IANA"></textarea><br>
            <label for="rating">Rating:</label><br>
              <input name="rating" id="Rank 5" type="radio" value="5">
              <label for="Rank 5"><span>5</span></label>
              <input name="rating" id="Rank 4" type="radio" value="4">
              <label for="Rank 4"><span>4</span></label>
              <input name="rating" id="Rank 3" type="radio" value="3">
              <label for="Rank 3"><span>3</span></label>
              <input name="rating" id="Rank 2" type="radio" value="2">
              <label for="Rank 2"><span>2</span></label>
              <input name="rating" id="Rank 1" checked type="radio" value="1">
              <label for="Rank 1"><span>1</span></label>
            <br><button>Done</button>
            <button id="cancelAdd" class="btn-alt">Never Mind</button>  
        </form>
    </section>`;
  }
//eslint was trying to murder me over the indentation on these html elements holy cow
  return html;
}

function HtmlForEdit(){
  let html = '';

  if (store.editing !== null){
    let bookmark = store.findById(store.editing);

    // check rating
    const rating = function(num){
      return bookmark.rating === num;
    };
//here's the actual html for the editting section
    html = 
    `<section class="overlay">
        <form id="editForm" data-id=${bookmark.id}>
          <header>
            <h3>Edit A Bookmark</h3>
          </header>
          ${store.error !== null ? errorMaster() : ''}
            <label for="title">Title:</label>
            <input required type="text" name="title" id="title" placeholder="Wanna change the title?" value="${bookmark.title}"><br>
            <label for="url">Address:</label>
            <input required type="url" name="url" id="url" placeholder="Was there a typo in the url?" value="${bookmark.url}"><br>
            <label for="desc">Website Description:</label>
            <textarea required name="desc" id="desc" placeholder="Akk!  You deleted it all!">${bookmark.desc}</textarea><br>
            <label for="rating">Rating:</label><br>
              <input name="rating" id="rank5" ${rating(5) === true ? 'checked' : ''} type="radio" value="5">
              <label for="rank5"><span>5</span></label>
              <input name="rating" id="rank4" ${rating(4) === true ? 'checked' : ''} type="radio" value="4">
              <label for="rank4"><span>4</span></label>
              <input name="rating" id="rank3" ${rating(3) === true ? 'checked' : ''} type="radio" value="3">
              <label for="rank3"><span>3</span></label>
              <input name="rating" id="rank2" ${rating(2) === true ? 'checked' : ''} type="radio" value="2">
              <label for="rank2"><span>2</span></label>
              <input name="rating" id="rank1" ${rating(1) === true ? 'checked' : ''} type="radio" value="1">
              <label for="rank1"><span>1</span></label>
          <div class="group group-centered">
            <br><button>Make It So</button>
            <button id="cancelEdit">Um, never mind</button>  
          </div>
        </form>
    </section>`;
  }
  return html;
}
//finally, let's run this thing
$(letsGo);