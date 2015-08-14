var indexedDB 	  = window.indexedDB
    IDBTransaction  = window.IDBTransaction
const    baseName 	  = "pushbulletBase";
const    baseVersion   = 2;
const    storeName 	  = "pushStore";

function logerr(err){
    console.log(err);
}

function connectDB(f){
    var request = indexedDB.open(baseName, baseVersion);
    request.onerror = logerr;
    request.onsuccess = function(){
        f(request.result);
    }
    request.onupgradeneeded = function(e){
        if (baseVersion < 2 ) {var store = e.currentTarget.transaction.objectStore(storeName);}
           else {var store = e.currentTarget.result.createObjectStore(storeName, { keyPath: "iden" });}
        store.createIndex("created", "created", { unique: false });
    }
}

function getPush(iden, f){
    connectDB(function(db){
        var request = db.transaction([storeName], "readonly").objectStore(storeName).get(iden);
        request.onerror = logerr;
        request.onsuccess = function(){
            f(request.result ? request.result : -1);
        }
    });
}

function setPush(push){
    connectDB(function(db){
        var request = db.transaction([storeName], "readwrite").objectStore(storeName).put(push);
        request.onerror = logerr;
        request.onsuccess = function(){
            //updateView here
            return request.result;
        }
    });
}

function getNotDismissedPushes(f){
    connectDB(function(db){
       var notDissmissedIdens = [];
       var store = db.transaction([storeName], "readonly").objectStore(storeName);
       var request = store.openCursor()
       request.onerror = logerr;
       request.onsuccess = function(e) {
           var cursor = e.target.result;
           if (cursor) {
               if (!cursor.value.dismissed && cursor.value.active) {notDissmissedIdens.push(cursor.value.iden); }
               cursor.continue();
           }
           else {
               console.log("No more entries");
               f(notDissmissedIdens);
           };
       }
    });
}

function ListPushes(newestCTime,maxCount,f){
    connectDB(function(db){
       var notDissmissedIdens = [];
       var store = db.transaction([storeName], "readonly").objectStore(storeName);
       if (newestCTime) {var request = store.index('created').openCursor(IDBKeyRange.upperBound(newestCTime,true),'prev');}
        else {var request = store.index('created').openCursor(null,'prev');}
       var count = 0; 
       request.onerror = logerr;
       request.onsuccess = function(e) {
           var cursor = e.target.result;
           if (cursor) {
               count++;
               f(cursor.value);
               if (count < maxCount) {cursor.continue();}
           }
           else {
               console.log("Listed "+count+", no more entries");
           };
       }
    })    
}

function getFirstCreatedPush(f){
    connectDB(function(db){
        var store = db.transaction([storeName], "readonly").objectStore(storeName);
        var request = store.index('created').openCursor(null,'next');
        request.onerror = logerr;
        request.onsuccess = function(e) {
           var cursor = e.target.result;
           if (cursor) { f(cursor.value); }
           };
    });    
}

function getPrevPush(CTime,f){
    connectDB(function(db){
        var store = db.transaction([storeName], "readonly").objectStore(storeName);
        var request = store.index('created').openCursor(IDBKeyRange.upperBound(CTime,true),'prev');
        request.onerror = logerr;
        request.onsuccess = function(e) {
           var cursor = e.target.result;
            if (cursor) {f(cursor.value);}
               else {f(null);}
           };
    });
}