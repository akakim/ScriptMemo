/*******************************************************************************
* Copyright 2017 The MIT Internet Trust Consortium
*
* Portions copyright 2011-2013 The MITRE Corporation
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*******************************************************************************/
var userModel = Backbone.Model.extend({

idAttribute: "id",

initialize: function() {
},
urlRoot: "api/userlist"
});

var UserListCollection = Backbone.Collection.extend({
initialize: function() {
// this.fetch();
},

getByUserName: function(userName) {
var users = this.where({
    userName: userName
    });
    if (users.length == 1) {
        return users[0];
    } else {
        return null;
    }
},

model: UserListModel,
url: "api/userlist"

});

var UserListView = Backbone.View.extend({
tagName: 'span',

initialize: function(options) {
this.options = options;
},

load: function(callback) {
if ( this.model.isFetched ) {
callback();
return;
}

$('#loadingbox').sheet('show');
$('#loading').html('<span class="label" id="loading-userlist">' + $.t('userlist.userlist') + '</span> ');

$.when(this.model.fetchIfNeeded({
success: function(e) {
$('#loading-whitelist').addClass('label-success');
},
error: app.errorHandlerView.handleError()
}), this.options.clientList.fetchIfNeeded({
success: function(e) {
$('#loading-clients').addClass('label-success');
},
error: app.errorHandlerView.handleError()
}), this.options.systemScopeList.fetchIfNeeded({
success: function(e) {
$('#loading-scopes').addClass('label-success');
},



error: app.errorHandlerView.handleError()
})).done(function() {
$('#loadingbox').sheet('hide');
callback();
});
},

events: {
"click .refresh-table": "refreshTable"
},

render: function(eventName) {

    $(this.el).html($('#tmpl-userlist-table').html());

var _self = this;

_.each(this.model.models, function(userList) {

// 특정한 유저를 바라본다.
var client = _self.options.userList.getByUserName(userList.get('clientId'));

// if there's no client ID, this is an error!
if (client != null) {
var view = new UserListView({
model: userList,
client: client,
});
view.parentView = _self;
$('#userlist-table', _self.el).append(view.render().el);
}

}, this);

this.togglePlaceholder();
$(this.el).i18n();
return this;
},

togglePlaceholder: function() {
if (this.model.length > 0) {
$('#userlist-table', this.el).show();
$('#userlist-table-empty', this.el).hide();
} else {
$('#userlist-table', this.el).hide();
$('#userlist-table-empty', this.el).show();
}
},

refreshTable: function(e) {
    e.preventDefault();
    var _self = this;
    $('#loadingbox').sheet('show');
    $('#loading').html('<span class="label" id="loading-userlist">' + $.t('userlist.userlist') + '</span> ');

    $.when(this.model.fetch({
        success: function (e) {
            $('#loading-userlist').addClass('label-success');
        },
        error: app.errorHandlerView.handleError()
    })).done(function () {
        $('#loadingbox').sheet('hide');
        _self.render();
    });
  }
});

var UserListView = Backbone.View.extend({
tagName: 'tr',

initialize: function(options) {
this.options = options;
if (!this.template) {
this.template = _.template($('#tmpl-userlist').html());
}
this.model.bind('change', this.render, this);
},

render: function(eventName) {
<!-- client: this.options.client.toJSON()-->
var json = {
   userList: this.model.toJSON()
};

this.$el.html(this.template(json));
<!--
$('.scope-list', this.el).html(this.scopeTemplate({
scopes: this.model.get('allowedScopes'),
systemScopes: this.options.systemScopeList
}));

$('.client-more-info-block', this.el).html(this.moreInfoTemplate({
client: this.options.client.toJSON()
}));

this.$('.dynamically-registered').tooltip({
title: $.t('common.dynamically-registered')
});
    -->
$(this.el).i18n();
return this;
},

events: {
'click .btn-edit': 'editUserlist',
'click .btn-delete': 'deleteUserlist',
'click .toggleMoreInformation': 'toggleMoreInformation'
},

editUserlist: function(e) {
e.preventDefault();
app.navigate('admin/userlist/' + this.model.get('id'), {
trigger: true
});
},

    deleteUserlist: function(e) {
e.preventDefault();

if (confirm($.t('userlist.confirm'))) {
var _self = this;

this.model.destroy({
dataType: false,
processData: false,
success: function() {
_self.$el.fadeTo("fast", 0.00, function() { // fade
$(this).slideUp("fast", function() { // slide up
$(this).remove(); // then remove from the DOM
// check the placeholder in case it's empty now
_self.parentView.togglePlaceholder();
});
});
},
error: app.errorHandlerView.handleError()
});

_self.parentView.delegateEvents();
}

return false;
},

toggleMoreInformation: function(e) {
e.preventDefault();
if ($('.moreInformation', this.el).is(':visible')) {
// hide it
$('.moreInformation', this.el).hide('fast');
$('.toggleMoreInformation i', this.el).attr('class', 'icon-chevron-right');
$('.moreInformationContainer', this.el).removeClass('alert').removeClass('alert-info').addClass('muted');

} else {
// show it
$('.moreInformation', this.el).show('fast');
$('.toggleMoreInformation i', this.el).attr('class', 'icon-chevron-down');
$('.moreInformationContainer', this.el).addClass('alert').addClass('alert-info').removeClass('muted');
}
},

close: function() {
$(this.el).unbind();
$(this.el).empty();
}
});

var UserListFormView = Backbone.View.extend({
tagName: 'span',

initialize: function(options) {
this.options = options;
if (!this.template) {
this.template = _.template($('#tmpl-userlist-form').html());
}


this.listWidgetViews = [];

},

load: function(callback) {

if (this.options.client) {
// we know what client we're dealing with already
if (this.model.isFetched ) {
callback();
return;
}

$('#loadingbox').sheet('show');
$('#loading').html('<span class="label" id="loading-userlist">' + $.t('userlist.userlist') + '</span> ' );

$.when(this.model.fetchIfNeeded({
success: function(e) {
$('#loading-userlist').addClass('label-success');
},
error: app.errorHandlerView.handleError()
}), this.options.client.fetchIfNeeded({
success: function(e) {
$('#loading-clients').addClass('label-success');
},
error: app.errorHandlerView.handleError()
}), this.options.systemScopeList.fetchIfNeeded({
success: function(e) {
$('#loading-scopes').addClass('label-success');
},
error: app.errorHandlerView.handleError()
})).done(function() {
$('#loadingbox').sheet('hide');
callback();
});

} else {
// we need to get the client information from the list

if (this.model.isFetched && this.options.clientList.isFetched && this.options.systemScopeList.isFetched) {

var client = this.options.clientList.getByUserName(this.model.get('clientId'));
this.options.client = client;

callback();
return;
}

$('#loadingbox').sheet('show');
$('#loading').html('<span class="label" id="loading-whitelist">' + $.t('userlist.userlist') + '</span> ');

var _self = this;

$.when(this.model.fetchIfNeeded({
success: function(e) {
$('#loading-userlist').addClass('label-success');
},
error: app.errorHandlerView.handleError()
}), this.options.clientList.fetchIfNeeded({
success: function(e) {
$('#loading-clients').addClass('label-success');
},
error: app.errorHandlerView.handleError()
}), this.options.systemScopeList.fetchIfNeeded({
success: function(e) {
$('#loading-scopes').addClass('label-success');
},
error: app.errorHandlerView.handleError()
})).done(function() {



$('#loadingbox').sheet('hide');
callback();
});

}

},

events: {
'click .btn-save': 'saveUserList',
'click .btn-cancel': 'cancelUserList',

},

saveUserList: function(e) {
e.preventDefault();
$('.control-group').removeClass('error');

// sync any leftover collection items
_.each(this.listWidgetViews, function(v) {
v.addItem($.Event('click'));
});


this.model.set({
clientId: this.options.client.get('clientId')
}, {
silent: true
});


return false;

},

cancelUserList: function(e) {
e.preventDefault();

// if we're editing a whitelist, go back to the whitelists page
app.navigate('admin/userlist', {
trigger: true
});

},

render: function(eventName) {

var json = {
userList: this.model.toJSON()
};

this.$el.html(this.template(json));

this.listWidgetViews = [];

var _self = this;




$(this.el).i18n();
return this;

}

});

ui.routes.push({
path: "admin/userlist",
name: "userList",
callback: function() {

if (!isAdmin()) {
this.root();
return;
}

this.updateSidebar('admin/userlist');

this.breadCrumbView.collection.reset();
this.breadCrumbView.collection.add([{
text: $.t('admin.home'),
href: ""
}, {
text: $.t('whitelist.manage'),
href: "manage/#admin/userlist"
}]);

var view = new UserListView({
model: this.userList,
});

view.load(function() {
$('#content').html(view.render().el);
view.delegateEvents();
setPageTitle($.t('userlist.manage'));
});

}
});

ui.routes.push({
path: "admin/userlist/new/:cid",
name: "newWhitelist",
callback: function(cid) {

if (!isAdmin()) {
this.root();
return;
}

this.breadCrumbView.collection.reset();
this.breadCrumbView.collection.add([{
text: $.t('admin.home'),
href: ""
}, {
text: $.t('userlist.manage'),
href: "manage/#admin/userlist"
}, {
text: $.t('whitelist.new'),
href: "manage/#admin/userlist/new/" + cid
}]);

this.updateSidebar('admin/userList');

var userList = new UserListModel();

var client = this.clientList.get(cid);
if (!client) {
client = new ClientModel({
id: cid
});
}

var view = new UserListFormView({
model: userList,
client: client,
systemScopeList: this.systemScopeList
});

view.load(function() {

// set the scopes on the model now that everything's loaded
userList.set({
allowedScopes: client.get('scope')
}, {
silent: true
});

$('#content').html(view.render().el);
view.delegateEvents();
setPageTitle($.t('userlist.manage'));
});

}
});

ui.routes.push({
path: "admin/whitelist/:id",
name: "editWhitelist",
callback: function(id) {

if (!isAdmin()) {
this.root();
return;
}

this.breadCrumbView.collection.reset();
this.breadCrumbView.collection.add([{
text: $.t('admin.home'),
href: ""
}, {
text: $.t('whitelist.manage'),
href: "manage/#admin/whitelists"
}, {
text: $.t('whitelist.edit'),
href: "manage/#admin/whitelist/" + id
}]);

this.updateSidebar('admin/whitelists');

var userList = this.userList.get(id);
if (!userList) {
    userList = new UserListModel({
id: id
});
}

var view = new UserListFormView({
model: userList,
clientList: this.clientList,
systemScopeList: this.systemScopeList
});

view.load(function() {
$('#content').html(view.render().el);
view.delegateEvents();
setPageTitle($.t('whitelist.manage'));
});

}

});

ui.templates.push('resources/template/users.html');

ui.init.push(function(app) {
app.userList = new UserListCollection();
});
