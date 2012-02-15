//
// taken from mimelib
//

/**
 * mime.parseAddresses(addresses) -> Array
 * - addresses (String): string with comma separated e-mail addresses
 * 
 * Parses names and addresses from a from, to, cc or bcc line
 **/
exports.parseAddresses = function(addresses){
    if(!addresses)
        return {};

    addresses = addresses.replace(/\=\?[^?]+\?[QqBb]\?[^?]+\?=/g, (function(a){return this.decodeMimeWord(a);}).bind(this));
    
    // not sure if it's even needed - urlencode escaped \\ and \" and \'
    addresses = addresses.replace(/\\\\/g,function(a){return escape(a.charAt(1));});
    addresses = addresses.replace(/\\["']/g,function(a){return escape(a.charAt(1));});
    
    // find qutoed strings
    
    var parts = addresses.split(','), curStr, 
        curQuote, lastPos, remainder="", str, list = [],
        curAddress, address, addressArr = [], name, email, i, len;
    var rightEnd;

    // separate quoted text from text parts
    for(i=0, len=parts.length; i<len; i++){
        str = "";
    
        curStr = (remainder+parts[i]).trim();
        
        curQuote = curStr.charAt(0);
        if(curQuote == "'" || curQuote == '"'){
            rightEnd= curStr.indexOf("<");
            if(rightEnd == -1)rightEnd= curStr.length-1;
            lastPos = curStr.lastIndexOf(curQuote,rightEnd);
            
            if(!lastPos){
                remainder = remainder+parts[i]+",";
                continue;
            }else{
                remainder = "";
                str = curStr.substring(1, lastPos).trim();
                address = curStr.substr(lastPos+1).trim();
            }
            
        }else{
            address = curStr;
        }
        
        list.push({name: str, address: address, original: curStr});
    }
  
    // find e-mail addresses and user names
    for(i=0, len=list.length; i<len; i++){
        curAddress = list[i];
        
        email = false;
        name = false;
        
        name = curAddress.name;
        
        address = curAddress.address.replace(/<([^>]+)>/, function(original, addr){
            email = addr.indexOf("@")>=0 && addr;
            return email ? "" : original;
        }).trim();
        
        if(!email){
            address = address.replace(/(\S+@\S+)/, function(original, m){
                email = m;
                return email ? "" : original;
            });
        }
        
        if(!name){
            if(email){
                email = email.replace(/\(([^)]+)\)/,function(original, n){
                    name = n;
                    return "";
                });
            }
            if(!name){
                name = address.replace(/"/g,"").trim();
            }
        }
        
        // just in case something got mixed up
        if(!email && name.indexOf("@")>=0){
            email = name;
            name = false;
        }
        
        if(name || email){
            addressArr.push({address:decodeURIComponent(email || ""), name: decodeURIComponent(name || "")});
        }
    }
    return addressArr;
};