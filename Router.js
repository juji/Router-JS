var Router = {
    routes: [],
    _notfound: function(){},
    mode: null,
    root: '/',

    init: function(options) {
        this.pushstate = typeof history != 'undefined' && typeof history.pushState != 'undefined';
        this.root = typeof options.root!='undefined' ? '/' + this.clearSlashes(options.root) + '/' : '/';
        this.hashbang = typeof options.hashbang!='undefined' ? options.hashbang : true;
        this.prepared = typeof options.prepared!='undefined' ? options.prepared : false;
        this.interval = false;
        return this;
    },
    getFragment: function() {
	    var fragment = '';
	    if(this.pushstate) {
	        fragment = this.clearRoot(decodeURI('/'+this.clearSlashes(location.pathname) + location.search));
	    } else if(this.hashbang){
	        var match = window.location.href.match(/#(.*)$/);
	        fragment = (match ? match[1] : '').replace(/\/\?/,'?');
	    }
	    return this.clearSlashes(fragment);
	},
	isInternal:function(href){
		//doesn't have a protocol
		if(!href.match(/[^:]+:/)) return true;
		// has the same protcol + domain
		if( href.match(new RegExp('^'+(window.location.protocol +'//'+ window.location.host + this.root)
			.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"))) ) return true;
		//is a hashbang
		if( href.match(/^\#/) && this.hashbang ) return true;

		return false;
	},
	clearSlashes: function(path) {
	    return path.toString().replace(/\/+$/, '').replace(/^\/+/, '').replace(/\/+/, '/');
	},
	clearRoot:function(str){
    	var r = new RegExp('^'+(window.location.protocol +'//'+ window.location.host + this.root)
        	.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"));
    	return str.replace(new RegExp('^'+this.root.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1")),'').replace(r,'');
    },
    queryObject: function(str){
    	var q = {};
    	str.replace(
		    new RegExp("([^?=&]+)(=([^&]*))?", "g"),
		    function($0, $1, $2, $3) { q[$1] = $3; }
		);
    	return q;
    },
	add: function(re, handler) {
	    if(typeof re == 'function') {
	        handler = re;
	        re = '';
	    }
	    re = this.clearSlashes(re);
	    var vars = re.match(/(\:[^\/\=\&\?]+)/g) || false;
	    re = '^'+re.replace(/(\:[^\/\=\&\?]+)/g,'<<asdf<<sd<<').replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1")
	   		.replace(/<<asdf<<sd<</g,'([^\?\/\=\&]+)')+'$';
	    this.routes.push({ re: re, vars:vars, handler: handler});
	    return this;
	},
	notfound:function(f){
		this._notfound = f;
		return this;
	},
	check: function(f) {
		if(!this.hashbang&&!this.pushstate)return;
	    var fragment = f ? this.clearRoot('/'+this.clearSlashes(f)+'/') : this.getFragment();
	    fragment = this.clearSlashes(fragment);
	    var path = fragment.replace(/\?(.*)$/,'');
	    var query = this.queryObject(fragment);
	    var m = false;
	    for(var i=0; i<this.routes.length; i++) {
	        var match = fragment.match(new RegExp(this.routes[i].re));
	        if(match) {
	        	match.shift();
	        	m = [match,this.routes[i].vars,this.routes[i].handler];
	        }
	    }

	    if(m){
	        var tobj = {};
	        for(var j=0; j<m[1].length; j++)
	        	tobj[ m[1][j].replace( /\:/,'' ) ] = m[0][j];
	        m[2].apply(tobj,[path,query]);
	    }else{
	    	this._notfound(path,query);
	    }

	    return this;
	},
    listen: function() {
    	var t = this;

    	//add hashchange event
    	
    	if(t.pushstate) {
    		window.onpushstate = window.onpopstate = function(){
    			t.check(t.getFragment());
    		}
    	}else if(typeof window.onhashchange!='undefined'&&t.hashbang){
    		var fn=false, ev = 'hashchange';
    		if(typeof window.addEventListener != 'undefined') fn = window.addEventListener;
    		else if(typeof window.attachEvent != 'undefined') {fn = window.attachEvent; ev='on'+ev;}
    		fn( ev, function(){
    			t.check( t.getFragment() );
    		}, false );
    	}else{
    		t.current = t.getFragment();
    		t.interval = setInterval(function(){
    			if(t.current != t.getFragment()){
    				t.current = t.getFragment();
    				t.check( t.current );
    			}
    		},50);
    	}
        
        //check current url
        if(this.prepared) return;
        var hash = window.location.hash;
        this.navigate(window.location.href);
        setTimeout(function(){
        	if(hash==window.location.hash&&!t.pushstate) 
        		t.check( t.getFragment() );
        },100);
        
        //if(!this.pushstate&&!this.timer) 
    },
    navigate: function(path) {
        path = path ? this.clearRoot(path.replace(/^#/,'').replace(/#(.*)$/,'$1')) : '';
        if(this.pushstate) {
            history.pushState(null, null, this.root + path);
            window.onpushstate();
        } else {
            window.location.href = window.location.protocol + '//' + window.location.host + this.root + '#' + path;
        }
    }
};

if(typeof module != 'undefined' && typeof module.exports != 'undefined')
exports = module.exports = Router;