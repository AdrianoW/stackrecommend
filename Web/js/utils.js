var hasOwnProperty = Object.prototype.hasOwnProperty;

function isEmpty(obj) {

    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
}


// from http://michalbe.blogspot.de/2010/04/removing-item-with-given-value-from.html
if(!Array.indexOf){ 
    Array.prototype.indexOf = function(obj){
        for(var i=0; i < this.length; i++){
            if(this[i]==obj){
                return i;
            }
        }
        return -1;
    };
}

Array.prototype.remove = function(value) {
    if (this.indexOf(value)!==-1) {
       this.splice(this.indexOf(value), 1);
       return true;
   } else {
      return false;
   };
} 