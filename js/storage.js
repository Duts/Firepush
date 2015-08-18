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

function clearDB(){
    indexedDB.deleteDatabase(baseName);
}

function getPushDB(iden, f){
    connectDB(function(db){
        var request = db.transaction([storeName], "readonly").objectStore(storeName).get(iden);
        request.onerror = logerr;
        request.onsuccess = function(){
            f(request.result ? request.result : -1);
        }
    });
}


function setPushDB(push,f){
    connectDB(function(db){
        var request = db.transaction([storeName], "readwrite").objectStore(storeName).put(push);
        request.onerror = logerr;
        request.onsuccess = function(){
            f(push);
            return request.result;
        }
    });
}

function delPushDB(iden){
    connectDB(function(db){
        var request = db.transaction([storeName], "readwrite").objectStore(storeName).delete(iden);
        request.onerror = logerr;
        request.onsuccess = function(){
            console.log("Push deleted from DB:", iden);
        }
    });
}

function getNotDismissedPushesDB(f){
    connectDB(function(db){
       console.log("Looking for not dismissed pushes...");
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
               console.log("Get "+notDissmissedIdens.length+"not dismissed.");
               f(notDissmissedIdens);
           };
       }
    });
}

function listPushesDB(newestCTime,maxCount,f){
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

function getFirstCreatedPushDB(f){
    connectDB(function(db){
        var store = db.transaction([storeName], "readonly").objectStore(storeName);
        var request = store.index('created').openCursor(null,'next');
        request.onerror = logerr;
        request.onsuccess = function(e) {
           var cursor = e.target.result;
           if (cursor) {
               if (cursor.value.active) {f(cursor.value);}
                  else {cursor.continue()}
                }
           };
    });    
}

function getPrevPushDB(CTime,f){
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


function sequentialSetPushesDB(pushes,eachF,completeF){
        connectDB(function(db){
        var request = db.transaction([storeName], "readwrite").objectStore(storeName);
        var i = 0;
        putNext();
        function putNext(e){
            if (i > 0) { eachF(pushes[i-1],e.target.result ? e.target.result.value : null ) }
            if (i<pushes.length) {
               request.put(pushes[i]).onsuccess = prevNext;
               ++i;
               } else {   // complete
                   console.log('Sequential set complete');
                   completeF();
               }
            }
        
            
        function prevNext(e){
            request.index('created').openCursor(IDBKeyRange.upperBound(pushes[i-1].created,true),'prev').onsuccess = putNext;
           }
        
   });
}
