'use strict';

let bookmarks = [];
let filter = 1;

function findById(id){
  return this.bookmarks.find(bookmark => bookmark.id === id);
}

function addBookmark(addedBookmark){
  addedBookmark.expanded = false;
  this.bookmarks.push(addedBookmark);
}

function editBookmark(id, stuff){
  let iFoundYou = this.findById(id);
  let getJsoned = JSON.parse(stuff);
  Object.assign(iFoundYou, getJsoned);
}

function deleteBookmark(id){
  return this.bookmarks.filter(bookmark => bookmark.id !== id);
  //is using .splice() better maybe?
  //is a DELETE method required here?
}

//maybe move the top stuff down into the default?
export default {
  bookmarks,
  filter,
  findById,
  addBookmark,
  editBookmark,
  deleteBookmark,
  error: null,
  adding: false,
  editing: null
};