Router-JS
=========
Is an HTML 5 Router JavaScript library for Single Page Applications,

or AJAX based page rendering.

###Feature
- history `pushState` and `popState`
- Optional fallback to `#hash` value

###usage
```html
<script src="Router.js"></script>
```

```javascript
//jQuery is optional
//but you should do this on document ready, or similar event
$(function(){
    
    //initialize. these are the default option values
    Router.init({
        root: '/',          //set the root directory of your app
        hashbang: true,     //wether to listen to hashchange event, and check on hash values
        prepared: false     //will not execute first callback on prepared content
    })
    
    .add('',function(path,query){
        console.log('default');
    })
    
    .add('page/:id',function(path,query){
        
        console.log(this);
        console.log(path);
        console.log(query);
    })
    
    .add('page/:id/:context',function(path,query){
        
        console.log(this);
        console.log(path);
        console.log(query);
        
    })
    
    .add('page/:id/:context?query=:value',function(path,query){
        
        console.log(this);
        console.log(path);
        console.log(query);
        
    })
    
    .listen();
    
    //you probably want to do this
    $('a').click(function(e){
		if(
			$(this).attr('href') && !$(this).attr('target') &&
			Router.isInternal($(this).attr('href'))
		){
			e.preventDefault();
			Router.navigate($(this).attr('href'));
			return false;
		}
		return true;
	});
   
});
```


Check these using your console:
```javascript
    
    Router.navigate('/');
    // default
    
    Router.navigate('/page/23');
    // {id:23}
    // /page/23
    // {}
    
    Router.navigate('/page/23/edit');
    // {id:23, context:'edit'}
    // /page/23/edit
    // {}
    
    Router.navigate('http://yourdomain.com/page/23/edit?query=123');
    // {id:23, context:'edit', value:'123'}
    // /page/23/edit
    // {query:'123'}
    
```


<br />
<br />
#:)
<br />
cheers.. [jujiyangasli.com](jujiyangasli.com)



