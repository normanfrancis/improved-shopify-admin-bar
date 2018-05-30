function getHandle(url) {
    var urlParts = url.split('/');
    var urlTail = urlParts[urlParts.length - 1].split('?');
    var handle = urlTail[0];
    
    return handle;
}

function makeLinkContainer() {
    var container = $(document.createElement("div"));
    
    container.addClass('isab-bar');
    container.css('display', 'none');

    return container;
}

function makeLink(url, text, cssClass = "") {
    var anchor = $(document.createElement("a"));
    
    anchor.attr('href', url);
    anchor.addClass('isab-bar__item');
    anchor.addClass(cssClass);
    anchor.text(text);

    return anchor;
}

function makeDropdown(text, cssClass = "") {
    var dropdown = $(document.createElement("div"));
    var dropdownCta = $(document.createElement("div"));
    var dropdownContent = $(document.createElement("div"));

    dropdown.addClass('isab-bar__dropdown isab-bar__item isab-bar__item--dropdown');
    dropdown.addClass(cssClass);

    dropdownCta.addClass('isab-bar__dropdown-title');
    dropdownCta.text(text);
    
    dropdownContent.addClass('isab-bar__dropdown-content');
    
    dropdown.append(dropdownCta);
    dropdown.append(dropdownContent);
    
    return dropdown;
}

function addNewLinks(container) {
    var newTypes = getNewTypes();
    var newDropdown = makeDropdown('New', 'isab-bar__item--new');
    
    container.append(newDropdown);

    for (var type of newTypes) {
        newDropdown.find('.isab-bar__dropdown-content').append(makeLink(type.url, type.title, 'isab-bar__item--sub'));
    }
}

function addPreviewLinks(container) {
    var themeEndpoint = baseUrl + '/admin/themes.json';

    $.getJSON(themeEndpoint, function(data) {
        var previewDropdown = makeDropdown('Preview', 'isab-bar__item--preview');
        
        container.append(previewDropdown);

        for (var theme of data.themes ) {
            if (theme.role !== "main" && theme.previewable === true) {
                var previewUrl = fullUrl + '/?preview_theme_id=' + theme.id;
                
                previewDropdown.find('.isab-bar__dropdown-content').append(makeLink(previewUrl, theme.name, 'isab-bar__item--sub'));
            }
        }
    });
}

function addEditLink(container) {
    var contentType = getContentType(fullUrl);

    if (contentType) {
        var slug = contentType.slug;
        var contentEndpoint = baseUrl + '/admin/' + slug + '.json?handle=' + getHandle(fullUrl);

        $.getJSON(contentEndpoint, function(data) { 
            var content_id = data[slug][0].id;
            var adminEditUrl = '/admin/' + slug + '/' + content_id;
            
            container.append(makeLink(adminEditUrl, "Edit " + contentType.title, 'isab-bar__item--edit'));
        });
    }
}

function updateContainerPosition(abvisible) {
    if (abvisible === null) {
        return;
    }

    if (abvisible === '1') {
        container.removeClass('isab-bar--collapsed');
    } else if (abvisible === '0') {
        container.addClass('isab-bar--collapsed');
    }
}

function receiveIABMessage(event) {
    if (event.origin != baseUrl) {
        return;
    }

    updateContainerPosition(event.data);
}


function attachMessageHandler() {
    if (window.addEventListener) {
        addEventListener("message", receiveIABMessage, false);
    } else { 
        window.attachEvent("onmessage", receiveIABMessage);
    }
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');

    for (var i = 0; i < ca.length; i ++) {
        var c = ca[i];

        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }

        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }

    return null;
}

function getContentType(url) {
    if (url.includes('products')) {
        return {
            slug: 'products',
            title: "Product"
        };
    }

    if (url.includes('collections')) {
        return {
            slug: 'collections',
            title: "Collection"
        };
    }

    if (url.includes('pages')) {
        return {
            slug: 'pages',
            title: "Page"
        };
    }

    if (url.includes('blogs')) {
        return {
            slug: 'articles',
            title: "Post"
        };
    }

    return false;
}

function getNewTypes() {
    var newTypes = [
        {
            title: 'Product',
            url: '/admin/products/new'
        },
        {
            title: 'Customer',
            url: '/admin/customers/new'
        },
        {
            title: 'Order',
            url: '/admin/draft_orders/new'
        },
        {
            title: 'Page',
            url: '/admin/pages/new'
        },
        {
            title: 'Article',
            url: '/admin/articles/new'
        },
        {
            title: 'Discount',
            url: '/admin/discounts/new'
        }
    ];

    return newTypes;
}

var adminBar = $('#admin_bar_iframe');
var fullUrl = window.location.href;
var baseUrl = window.location.protocol + '//' + window.location.hostname;

if (adminBar.length) {
    var container = makeLinkContainer();

    adminBar.after(container);
    addNewLinks(container);
    addPreviewLinks(container);
    addEditLink(container);
    
    updateContainerPosition(getCookie('_abv'));
    attachMessageHandler();
}
