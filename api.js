'use strict';


const api_link = 'https://thinkful-list-api.herokuapp.com/keithFreitag/bookmarks';

//hoping spread syntax is correct...
//anyway, this uses fetch() to grab items from the api
function fetchDatBoi(...some_param){
  let error;
  return fetch(...some_param)
    .then(res => {
      if (!res.ok) error.code = res.status;
      if (!res.headers.get('content-type').includes('json')) {
        error.message = res.statusText;
        return Promise.reject(error);
      }

      return res.json();
    })
    .then(stuff => {
      if (error) {
        error.message = stuff.message;
      }

      return stuff;
    });
}

function getItems(){
  return fetchDatBoi(api_link);
}

function addItem(newItem){
  return fetchDatBoi(api_link, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: newItem
  });
}

function editItem(id, stuff){
  return fetchDatBoi(api_link + '/' + id, {
    method: 'PATCH',
    headers: {'Content-Type': 'application/json'},
    body: stuff
  });
}

function deleteItem(id){
  return fetchDatBoi(api_link + '/' + id, {
    method: 'DELETE'
  });
}
//I don't know why but you need to refresh the page for the delete to go through.  

export default {
  getItems,
  addItem,
  editItem,
  deleteItem
};