//! Service Worker registration portion in the index.html

//* define some needed global constants
const APP_PREFIX = 'BudgetTraker-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

//* define which files we want to cache; USE RELATIVE PATHS AS SHOWN
//* Note that we didn't include the images in assets. This was intentional. Every browser has a cache limit,
const FILES_TO_CACHE = [
   './index.html',
   './css/styles.css',
   './js/index.js',
   './js/idb.js',
   './icons/icon-72x72.png',
   './icons/icon-96x96.png',
   './icons/icon-128x128.png',
   './icons/icon-144x144.png',
   './icons/icon-152x152.png',
   './icons/icon-192x192.png',
   './icons/icon-384x384.png',
   './icons/icon-512x512.png',
];

//! Service Worker - INSTALLATION
//* The context of self here refers to the service worker object.
self.addEventListener('install', function (event) {
   //* BROWSER must wait until the work is completed before the service worker is terminated
   event.waitUntil(
      //* open CACHE_NAME
      caches.open(CACHE_NAME).then(function (cache) {
         console.log('installing cache : ' + CACHE_NAME);
         return cache.addAll(FILES_TO_CACHE); //* return cache with all cached files
      })
   );
});

//! Service Worker - ACTIVATION
self.addEventListener('activate', function (event) {
   event.waitUntil(
      //* .keys() - returns an array of all cache names and we call them keyList
      caches.keys().then(function (keyList) {
         //* keyList is a parameter that contains all cache names under <username>.github.io.
         let cacheKeepList = keyList.filter(function (key) {
            //* filter out caches that have the app prefix
            return key.indexOf(APP_PREFIX);
         });
         //* add the current cache to the keeplist in the activate event listener
         cacheKeepList.push(CACHE_NAME);

         //* returns a Promise that resolves once all old versions of the cache have been deleted
         return Promise.all(
            keyList.map(function (key, i) {
               if (cacheKeepList.indexOf(key) === -1) {
                  console.log('deleting cache : ' + keyList[i]);
                  return caches.delete(keyList[i]);
               }
            })
         );
      })
   );
});

//! Service Worker - WAITING/IDLE (INTERCEPT FETCH REQUESTS)
self.addEventListener('fetch', function (event) {
   console.log('fetch request : ' + event.request.url);
   //* using respondWith to intercept the fetch request
   event.respondWith(
      //* use .match() to determine if the resource already exists in caches. If it does, log the URL to the
      //* console with a message and then return the cached resource
      caches.match(event.request).then(function (request) {
         if (request) {
            console.log('responding with cache : ' + event.request.url);
            return request;
         }
         //* if the resource is not in caches, retrieved resource from the online network as usual
         else {
            console.log('file is not cached, fetching : ' + event.request.url);
            return fetch(event.request);
         }

         //! this one line replaces the if/else code above
         //* return request || fetch(e.request);
      })
   );
});
