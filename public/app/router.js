define(['app'], function(app) {
  console.log(app);

  Handlebars.registerHelper('dateFormat', function(date) {
    return date && moment(date).format('LLL');
  });
  Handlebars.registerHelper('textFormat', function(text) {
    return text;
  });

  var $main = $('#main');
//  var moreTpl = $('#J_more').html();
  var statusTpl = $('#J_status').html(),
    statusContext = Handlebars.compile(statusTpl);
  var commentTpl = $('#J_comment').html(),
    commentContext = Handlebars.compile(commentTpl);
  var followTpl = $('#J_follow').html(),
    followContext = Handlebars.compile(followTpl);
  var favoritesTpl = $('#J_favorites').html(),
    favoritesContext = Handlebars.compile(favoritesTpl);
  var repeatTpl = $('#J_repeat').html(),
    repeatContext = Handlebars.compile(repeatTpl);
  var $btnMore = $('#J_btn_more');

  var fetch = function(url, options) {
    return $.get(api + url, options);
  };

  var api = '/api/';

  var beforeRender = function(ctx, key, callback) {
    $btnMore.off('click').on('click', function() {
      callback(ctx[key].page++);
    });
    ctx[key] = ctx[key] || {};
    ctx[key].page = 1;
    $btnMore.click();
  };

  var Router = Backbone.Router.extend({
    routes: {
      '': 'index',
      'signin': 'signin',
      'statuses/public_timeline': 'statuses/public_timeline',
      'statuses/home_timeline/:uid': 'statuses/home_timeline',
      'statuses/user_timeline/:uid': 'statuses/user_timeline',
      'statuses/show/:id': 'statuses/show',
      'favorites/:id': 'favorites',
      'comments/by_me': 'comments/by_me',
      'comments/to_me': 'comments/to_me',
      'comments/mentions': 'comments/mentions',
      'statuses/mentions': 'statuses/mentions',
      'friendships/friends/:uid': 'friendships/friends',
      'friendships/followers/:uid': 'friendships/followers',
      'account/end_session': 'account/end_session'
    },
    index: function() {
      fetch('index').done(function(result) {
        $main.html(result);
      });
    },
    signin: function() {
      fetch('signin').done(function(result) {
        location.href = result;
      });
    },
    'statuses/public_timeline': function() {
      fetch('statuses/public_timeline').done(function(result) {
        if (!result.error) $btnMore.show();
        $main.html(statusContext(result));
      });
    },
    'statuses/home_timeline': function(uid) {
      // TODO backbone 自动回收容器资源
      var url = 'statuses/home_timeline/' + uid;
      $main.html('');
      beforeRender(this, url, function(page) {
        fetch(url, {page: page}).done(function(result) {
          $main.append(statusContext(result));
        });
      });
    },
    'statuses/user_timeline': function(uid) {
      var url = 'statuses/user_timeline/' + uid;
      $main.html('');
      beforeRender(this, url, function(page) {
        fetch(url, {page: page}).done(function(result) {
          $main.append(statusContext(result));
        });
      });
    },
    'statuses/show': function(id) {
      fetch('statuses/show/' + id).done(function(result) {
        $main.html(statusContext([result]));
      });
    },
    'favorites': function(id) {
      var url = 'favorites/' + id;
      $main.html('');
      beforeRender(this, url, function(page) {
        fetch(url, {page: page}).done(function(result) {
          $main.html(favoritesContext(result));
        });
      });
    },
    'comments/by_me': function() {
      var url = 'comments/by_me';
      $main.html('');
      beforeRender(this, url, function(page) {
        fetch(url, {page: page}).done(function(result) {
          $main.append(commentContext(result));
        });
      });
    },
    'comments/to_me': function() {
      var url = 'comments/to_me';
      $main.html('');
      beforeRender(this, url, function(page) {
        fetch(url, {page: page}).done(function(result) {
          $main.append(commentContext(result));
        });
      });
    },
    'comments/mentions': function() {
      var url = 'comments/mentions';
      $main.html('');
      beforeRender(this, url, function(page) {
        fetch(url, {page: page}).done(function(result) {
          $main.append(commentContext(result));
        });
      });
    },
    'statuses/mentions': function() {
      var url = 'statuses/mentions';
      $main.html('');
      beforeRender(this, url, function(page) {
        fetch(url, {page: page}).done(function(result) {
          $main.append(statusContext(result));
        });
      });
    },
    'friendships/friends': function(uid) {
      $main.html('');
      var url = 'friendships/friends/' + uid;
      beforeRender(this, url, function(page) {
        fetch(url, {page: page}).done(function(result) {
          $main.append(followContext(result));
        });
      });
    },
    'friendships/followers': function(uid) {
      $main.html('');
      var url = 'friendships/followers/' + uid;
      beforeRender(this, url, function(page) {
        fetch(url, {page: page}).done(function(result) {
          $main.append(followContext(result));
        });
      });
    },
    'account/end_session': function() {
      fetch('account/end_session').done(function(result) {
        if (result) {
          location.replace('/');
        }
      });
    }
  });

  $(document).on("click", "img.bigcursor",function() {
    var $img = $(this),
      $next = $img.next(),
      murl = $img.data('middle');
    $next.show();
    if (murl) {
      var $new = $('<img src="' + murl + '">').load(function() {
        $img.parent().html($new);
      });
    }
  }).on("click", "a[data-action=repeat]",
    function() {
      var $a = $(this);
      fetch('comments/show/' + $a.data('id'), {count: 200}).done(function(result) {
        if (result) {
          $a.closest('.info').after(repeatContext(result));
        }
      });
    }).on("click", "button[data-action=repeat]",
    function() {
      var $btn = $(this),
        $content = $btn.closest('.content'),
        $repeat = $content.find('a[data-action=repeat]'),
        $input = $btn.closest('.input'),
        $main = $btn.closest('.repeat'),
        id = $btn.closest('.feed_list').attr('mid'),
        comment_ori = $input.find('.W_checkbox').prop('checked') ? 1 : 0,
        comment = $input.find('textarea').val();
      fetch('comments/create', {id: id, comment: comment, comment_ori: comment_ori}).done(
        function(result) {
          var err = result.error;
          if (err) {
            alert(err);
          } else {
            $main.remove();
            $repeat.click();
          }
        });
    });

  return Router;
});
