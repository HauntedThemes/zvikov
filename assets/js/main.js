/**
 * Main JS file for Haihara
 */

jQuery(document).ready(function($) {

    var config = {
        'share-selected-text': true,
    };

    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
        activeSlide;

	$('#content .loop .swiper-slide').addClass('first');

    hoverTitle();

    function hoverTitle(){
	    $('.cloned-content .post-title').on('mouseover', function(event) {
    		$(this).parent().addClass('active');
	    }).on('mouseleave', function(event) {
	    	$(this).parent().removeClass('active');
	    });
    }

    imageInDiv();

    function imageInDiv(){
    	$('.swiper-slide:not(.swiper-slide-active) .article-container .post-content img').each(function(index, el) {
    		if (!$(this).parent().hasClass('img-holder') && !$(this).parent().parent().hasClass('img-holder')) {
    			$(this).parent().addClass('img-holder');
    			$(this).parent().append('<span></span>');
    			$(this).appendTo($(this).parent().find('span'));
    		};
    	});
    }

	$(window).on('load', function(event) {

		var swiperPosts = new Swiper('#content .loop .swiper-container', {
			slidesPerView: 1,
			spaceBetween: 30,
			centeredSlides: true,
			autoHeight: true,
			simulateTouch: false,
			allowTouchMove: false,
			navigation: {
		        nextEl: '#content .loop .next a',
		        prevEl: '#content .loop .prev a',
	      	},
		});

		var checkHistoryOnChange = 0;

		swiperPosts.on('slideChangeTransitionEnd', function(event) {
			$('.swiper-wrapper').height($('.swiper-slide-active').height());

			if (checkHistoryOnChange != 1) {
				var value = $('.swiper-slide-active').attr('data-history');
				var url = window.location.origin + '/' + value + '/';
				history.pushState({ value: value }, null, url);
			};

			checkHistoryOnChange = 0;
		});

		var currentPageNext = 1;
		var currentPagePrev = 1;
		var pathname = window.location.pathname;
		var $result = $('#content .loop .swiper-wrapper');
		var nextPage;
		var prevPage;
		pathname = pathname.replace(/#(.*)$/g, '').replace('/\//g', '/');

		if ($('body').hasClass('paged')) {
			currentPageNext = parseInt(pathname.replace(/[^0-9]/gi, ''));
			currentPagePrev = parseInt(pathname.replace(/[^0-9]/gi, ''));
		};

		if (typeof maxPages === 'undefined' || maxPages === null) {
			var maxPages = 0;
		};

		var countAllPosts;
		var filter = "";
		var firstPostId = $('.article-container .read-later').attr('data-id');
		var firstPostIndex = 0;
		var allPosts;
		if ($('body').hasClass('tag-template')) {
			filter = "tag:" + $('body').attr('data-tag');
		};
		if ($('body').hasClass('author-template')) {
			filter = "author:" + $('body').attr('data-author');
		};
		$.get(ghost.url.api('posts', {limit: "all", filter: filter})).done(function (data){

			allPosts = data.posts;
			countAllPosts = data.posts.length;
			maxPages = countAllPosts;

			$.each(data.posts, function(index, val) {
				if (val.id == firstPostId) {
					firstPostIndex = index+1;
					$('.pagination-number').append('<b>'+ firstPostIndex +'</b>/' + countAllPosts);
				};
			});

			if ($('body').hasClass('post-template')) {
				$.each(allPosts, function(index, val) {
					if (val.id == $('.loop .swiper-slide:last-child .article-container .read-later').attr('data-id')) {
						currentPageNext = index;
						currentPagePrev = index;
					};
				});
			};

			for (var i = 0; i <= 1; i++) {
				loadNextPost(maxPages, nextPage, allPosts);
				loadPrevPost(maxPages, prevPage, allPosts);
			};

			swiperPosts.on('slideChange', function(event) {
				activeSlide = swiperPosts.activeIndex;
				$('.loop .swiper-slide.first').removeClass('first').addClass('loaded');
				if (swiperPosts.activeIndex > (swiperPosts.slides.length - 3)) {
					loadNextPost( maxPages, nextPage, allPosts);
				}else if(swiperPosts.activeIndex == 1){
					setTimeout(function() {
						loadPrevPost( maxPages, prevPage, allPosts);
					}, 300);
				};
			});

		});


		function loadNextPost(maxPages, nextPage, allPosts){
			if (currentPageNext == maxPages) {
				return;
			};

			currentPageNext++;

			if ($('body').hasClass('paged')) {
				pathname = '/';
			};
        	nextPage = pathname + 'page/' + currentPageNext + '/';

			if ($('body').hasClass('post-template')) {
				if (currentPageNext > (allPosts.length - 1)) {
					return;
				};
				$.each(allPosts, function(index, val) {
					if (val.id == $('.loop .swiper-slide:last-child .article-container .read-later').attr('data-id')) {
						nextPage = '/' + allPosts[currentPageNext].slug;
					};
				});
			};

	        $.get(nextPage, function (content) {
	        	var postIndex = parseInt(nextPage.replace(/[^0-9]/gi, ''));
	        	var content = $(content);

	        	var currentIndex = parseInt($('.loop .swiper-slide:last-child .pagination-number:first-child b').text()) + 1;
	        	content.find('.pagination-number').append('<b>'+ currentIndex +'</b>/' + countAllPosts);

	        	content.find('#content .loop .swiper-slide').addClass('loaded').removeClass('first');
	            swiperPosts.appendSlide(content.find('#content .loop .swiper-slide'));
		    	hoverTitle();
		    	imageInDiv();

		    	if (!$('.loop .next a, .loop .prev a').hasClass('active')) {
		    		$('.loop .next a, .loop .prev a').addClass('active');
		    	};

				readLaterPosts = readLater($('.loop .swiper-slide:last-child'), readLaterPosts);

	        });

		}

		function loadPrevPost(maxPages, prevPage, allPosts){
			if (currentPagePrev < 1) {
				return;
			};
			currentPagePrev--;

			if ($('body').hasClass('paged')) {
				pathname = '/';
			}else if($('body').hasClass('home-template')){
				if (currentPagePrev == 0) {
					return;
				};
			};
        	prevPage = pathname + 'page/' + currentPagePrev + '/';

			if ($('body').hasClass('post-template')) {
				$.each(allPosts, function(index, val) {
					if (val.id == $('.loop .swiper-slide:first-child .article-container .read-later').attr('data-id')) {
						prevPage = '/' + allPosts[currentPagePrev].slug;
					};
				});
			};
	        $.get(prevPage, function (content) {
	        	var postIndex = parseInt(prevPage.replace(/[^0-9]/gi, ''));
	        	var content = $(content);

	        	var currentIndex = parseInt($('.loop .swiper-slide:first-child .pagination-number:first-child b').text()) - 1;
	        	content.find('.pagination-number').append('<b>'+ currentIndex +'</b>/' + countAllPosts);

	            content.find('#content .loop .swiper-slide').addClass('loaded').removeClass('first');
	            swiperPosts.prependSlide($(content).find('#content .loop .swiper-slide'));
		    	hoverTitle();
		    	imageInDiv();

		    	if (!$('.loop .next a, .loop .prev a').hasClass('active')) {
		    		$('.loop .next a, .loop .prev a').addClass('active');
		    	};

		    	readLaterPosts = readLater($('.loop .swiper-slide:first-child'), readLaterPosts);

	        });

		}

		if (window.history && window.history.pushState) {
			$(window).on('popstate', function() {
				checkHistoryOnChange = 1;
				var check = 0;
				$.each(swiperPosts.slides, function(index, val) {
					if (window.history.state != null) {
						if (window.history.state.value == val.dataset.history) {
							swiperPosts.slideTo(index);
						}
						if (window.history.state.value == '') {
							check++;
						};
					}else{
						check++;
					};
				});
				if (check > 0) {
					swiperPosts.slideTo(0);
				};
			});
		}

	});

    if (w < 768){
        $(".next, .prev").stick_in_parent({
			offset_top: 100,
		});
    }else{
        $(".next, .prev").stick_in_parent({
			offset_top: 225,
		});
    }

	function prettyDate(date) {
		var d = new Date(date);
		var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
			return d.getDate() + ' ' + monthNames[d.getMonth()] + ' ' + d.getFullYear();
	};

	var readLaterPosts = [];

	function readLater(content, readLaterPosts){

		if (typeof Cookies.get('zvikov-read-later') !== "undefined") {
			$.each(readLaterPosts, function(index, val) {
				$('.read-later[data-id="'+ val +'"]').addClass('active');
			});
			bookmarks(readLaterPosts);
		}
		
		$(content).find('.read-later').each(function(index, el) {
			$(this).on('click', function(event) {
				event.preventDefault();
				var id = $(this).attr('data-id');
				if ($(this).hasClass('active')) {
					removeValue(readLaterPosts, id);
				}else{
					readLaterPosts.push(id);
				};
				$('.read-later[data-id="'+ id +'"]').each(function(index, el) {
					$(this).toggleClass('active');
				});
				Cookies.set('zvikov-read-later', readLaterPosts, { expires: 365 });
				bookmarks(readLaterPosts);
			});
		});

		return readLaterPosts;

	}

	function bookmarks(readLaterPosts){

		$('.bookmark-container').empty();
		if (readLaterPosts.length) {
			$('header .counter').removeClass('d-none').text(readLaterPosts.length);
			var filter = readLaterPosts.toString();
			filter = "id:["+filter+"]";

			$.get(ghost.url.api('posts', {filter:filter, include:"tags"})).done(function (data){
				$('.bookmark-container').empty();
				var tags = [];
	        	$.each(data.posts, function(index, val) {
	        		if (val.tags.length) {
	        			if ($.inArray(val.tags[0].name, tags) === -1) {
	        				tags.push(val.tags[0].name);
	        			};
	        		}else{
	        			if ($.inArray('Other', tags) === -1) {
	        				tags.push('Other');
	        			};
	        		};
	        	});
	        	tags.sort();

	        	$.each(tags, function(index, val) {
	        		$('.bookmark-container').append('<h5>'+ val +'</h5><ul data-tag="'+ val +'" class="list-box"</ul>');
	        	});

	        	$.each(data.posts, function(index, val) {
	        		if (val.tags.length) {
		        		$('.bookmark-container ul[data-tag="'+ val.tags[0].name +'"]').append('<li><time>'+ prettyDate(val.created_at) +'</time><a href="#" class="read-later active" data-id="'+ val.id +'"></a><a href="/'+ val.slug +'">'+ val.title +'</a></li>');
	        		}else{
	        			$('.bookmark-container ul[data-tag="Other"]').append('<li><a href="#" class="read-later active" data-id="'+ val.id +'"></a><time>'+ prettyDate(val.created_at) +'</time><a href="/'+ val.slug +'">'+ val.title +'</a></li>');
	        		};
	        	});

    			$('.bookmark-container').find('.read-later').each(function(index, el) {
					$(this).on('click', function(event) {
						event.preventDefault();
						var id = $(this).attr('data-id');
						if ($(this).hasClass('active')) {
							removeValue(readLaterPosts, id);
						}else{
							readLaterPosts.push(id);
						};
						$('.read-later[data-id="'+ id +'"]').each(function(index, el) {
							$(this).toggleClass('active');
						});
						Cookies.set('zvikov-read-later', readLaterPosts, { expires: 365 });
						bookmarks(readLaterPosts);
					});
				});

			});
		}else{
			$('header .counter').addClass('d-none');
			$('.bookmark-container').append('<p class="no-bookmarks">You haven\'t yet saved any bookmarks. To bookmark a post, just click <i class="circle"></i>.</p>')
		};

	}

	if (typeof Cookies.get('zvikov-read-later') !== "undefined") {
		readLaterPosts = JSON.parse(Cookies.get('zvikov-read-later'));
	}

	readLaterPosts = readLater($('#content .loop .swiper-slide'), readLaterPosts);

	function removeValue(arr) {
	    var what, a = arguments, L = a.length, ax;
	    while (L > 1 && arr.length) {
	        what = a[--L];
	        while ((ax= arr.indexOf(what)) !== -1) {
	            arr.splice(ax, 1);
	        }
	    }
	    return arr;
	}

    // Initialize ghostHunter - A Ghost blog search engine
    var searchField = $("#search-field").ghostHunter({
        results             : "#results",
        onKeyUp             : true,
        zeroResultsInfo     : true,
        displaySearchInfo   : false,
        // info_template       : "<h3 class='title'>Number of posts found: {{amount}}</h3>",
        // result_template     : "<li class='swiper-slide'><article class='post post-card post-card-small'><div class='content'><div class='content-holder'><time class='post-date' datetime='{{pubDate}}'>{{pubDate}}</time><h3 class='post-title'><a href='{{link}}' title='{{title}}'>{{title}}</a></h3></div></div></article></li>",
        onComplete      : function( results ){

        	$('#results').empty();

        	var tags = [];
        	$.each(results, function(index, val) {
        		if (val.tags.length) {
        			if ($.inArray(val.tags[0].name, tags) === -1) {
        				tags.push(val.tags[0].name);
        			};
        		}else{
        			if ($.inArray('Other', tags) === -1) {
        				tags.push('Other');
        			};
        		};
        	});
        	tags.sort();

        	$.each(tags, function(index, val) {
        		$('#results').append('<h5>'+ val +'</h5><ul data-tag="'+ val +'" class="list-box"</ul>');
        	});

        	$.each(results, function(index, val) {
        		if (val.tags.length) {
	        		$('#results ul[data-tag="'+ val.tags[0].name +'"]').append('<li><time>'+ val.pubDate +'</time><a href="#" class="read-later" data-id="'+ val.id +'"></a><a href="'+ val.link +'">'+ val.title +'</a></li>');
        		}else{
        			$('#results ul[data-tag="Other"]').append('<li><a href="#" class="read-later" data-id="'+ val.id +'"></a><time>'+ val.pubDate +'</time><a href="'+ val.link +'">'+ val.title +'</a></li>');
        		};
        	});

        	readLaterPosts = readLater($('#results'), readLaterPosts);

        }
    });

    $(window).on('resize', function(event) {
        w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);


        if (w < 768){
        	$(".next, .prev").trigger("sticky_kit:detach");
            $(".next, .prev").stick_in_parent({
				offset_top: 100,
			});
        }else{
        	$(".next, .prev").trigger("sticky_kit:detach");
            $(".next, .prev").stick_in_parent({
				offset_top: 225,
			});
        }


    });

    // Progress bar for inner post
    // function progressBar(){
    //     var postContentOffsetTop = $('.post-content').offset().top;
    //     var postContentHeight = $('.post-content').height();
    //     if ($(window).scrollTop() > postContentOffsetTop && $(window).scrollTop() < (postContentOffsetTop + postContentHeight)) {
    //         var heightPassed = $(window).scrollTop() - postContentOffsetTop;
    //         var percentage = heightPassed * 100/postContentHeight;
    //         $('.progress').css({
    //             top: (100+heightPassed) + 'px',
    //         });
    //     }else if($(window).scrollTop() < postContentOffsetTop){
    //         $('.progress').css({
    //             top: '100px',
    //         });
    //     }else{
    //         $('.progress').css({
    //             top: '100%',
    //         });
    //     };
    // }

    // $(window).on('scroll', function(event) {
    //     progressBar();
    // });

});