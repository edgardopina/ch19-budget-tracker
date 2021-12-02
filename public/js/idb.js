//! this file will manage the IndexedDB connection

let db; //* db conncection
const dbName = 'budget_traker'; //* db name to connect or to create if it does not exist
const initialVer = 1; //* db version

//* as part of the browser's window object, 'indexedDB ' is a Global Variable
const request = indexedDB.open(dbName, initialVer); //* establish a connection to IndexedDB database

//! db listener to handle the event of a change that needs to be made to the database's structure. IndexedDB
request.onupgradeneeded = function (event) {
   const db = event.target.result; //* create a reference to the db
   db.createObjectStore('new_btTransaction', { autoIncrement: true }); //* creates object store (table) 'new_btTransaction', with an auto increment 'primary key'
};

//! db listener
//* every time we interact with the database, we store the resulting database object to the global variable db we created earlier. 
request.onsuccess = function (event) {
   //* when db is successfully created with this object store (from onupgradedneeded event above) or simply
   //* established a connection, save reference to db in global variable
   db = event.target.result;

   //* send all local db data to api if the app is running online
   if (navigator.onLine) {
      uploadBtTransaction();
   }
};

//! db listener
//*  inform us if anything ever goes wrong with the database interaction
request.onerror = function (event) {
   console.log(event.target.errorCode);
};

//! this function will be submitted EACH TIME we attemp to submit a new transaction AND there is NO CONNECTION TO THE INTERNET network
//* This saveRecord() function will be used in the index.js file's form submission function if the fetch() function's .catch()
//* method is executed. The fetch() function's .catch() method is only executed on network failure!
function saveRecord(record) {
   const transaction = db.transaction(['new_btTransaction'], 'readwrite'); //* open a new transaction with the database with R/W permissions
   const btTransactionObjectStore = transaction.objectStore('new_btTransaction'); //* access the object store for 'new_btTransaction'
   btTransactionObjectStore.add(record); //* add record to btTransaction object store
}

//! this function will collect all the data from the new_btTransaction object store in IndexedDB and will POST it to the server
function uploadBtTransaction() {
   const transaction = db.transaction(['new_btTransaction'], 'readwrite'); //* open a new transaction with the database with R/W permissions
   const btTransactionObjectstore = transaction.objectStore('new_btTransaction'); //* access the object store for 'new_btTransaction'

   const getAll = btTransactionObjectstore.getAll(); //* send call to async method to get all data from IndexedDB store
   
   getAll.onsuccess = function () {
      //! if there is data in indexedDB's store, we send it to the api server
      if (getAll.result.length > 0) {
         fetch('/api/transaction/bulk', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
               Accept: 'application/json, text/plain, *.*',
               'Content-Type': 'application/json',
            },
         })
            .then(response => response.json())
            .then(serverResponse => {
               if (serverResponse.message) {
                  throw new Error(serverResponse);
               }
               const transaction = db.transaction(['new_btTransaction'], 'readwrite'); //* open one transaction
               const btTransactionObjectstore = transaction.objectStore('new_btTransaction'); //* get its Objectsgtore
               btTransactionObjectstore.clear(); //* clear all items in the store
               alert('All saved btTransaction data has been submitted to the server');
            })
            .catch(err => {
               console.log(err);
            });
      }
   };
}

//! eventListener to check if the browser regains internet connection (the browser comes back online)
window.addEventListener('online', uploadBtTransaction);
