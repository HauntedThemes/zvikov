/**
 * Main JS file for Zvikov
 */

jQuery(document).ready(function($) {

    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
        activeSlide,
        currentPageNext = 1,
        currentPagePrev = 1,
        pathname = window.location.pathname,
        $result = $('#content .loop .swiper-wrapper'),
        nextPage,
        prevPage,
        countAllPosts,
        filter = "",
        firstPostId = $('.article-container .read-later').attr('data-id'),
        firstPostIndex = 0,
        allPosts,
        readLaterPosts = [],
        swiperPosts,
        checkHistoryOnChange;

	$('#content .loop .swiper-slide').addClass('first');

    imageInDiv();
    readingTime($('#content .loop .swiper-slide'));

	if (typeof Cookies.get('zvikov-read-later') !== "undefined") {
		readLaterPosts = JSON.parse(Cookies.get('zvikov-read-later'));
	}

	readLaterPosts = readLater($('#content .loop .swiper-slide'), readLaterPosts);

	$(window).on('load', function(event) {

		// Initialize Posts Swiper slider
		swiperPosts = new Swiper('#content .loop .swiper-container', {
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

		checkHistoryOnChange = 0;

		// On slide change add new post to history
		swiperPosts.on('slideChangeTransitionEnd', function(event) {
			$('.swiper-wrapper').height($('.swiper-slide-active').height());

			if (checkHistoryOnChange != 1) {
				var value = $('.swiper-slide-active').attr('data-history');
				var url = window.location.origin + '/' + value + '/';
				history.pushState({ value: value }, null, url);
			};

			checkHistoryOnChange = 0;
		});

		pathname = pathname.replace(/#(.*)$/g, '').replace('/\//g', '/');

		// If body has class paged load next/prev posts based on the current page number
		if ($('body').hasClass('paged')) {
			currentPageNext = parseInt(pathname.replace(/[^0-9]/gi, ''));
			currentPagePrev = parseInt(pathname.replace(/[^0-9]/gi, ''));
		};

		if (typeof maxPages === 'undefined' || maxPages === null) {
			maxPages = 0;
		};

		// If body has class tag-template filter by current tag
		if ($('body').hasClass('tag-template')) {
			filter = "tag:" + $('body').attr('data-tag');
		};

		// If body has class author-template filter by current author
		if ($('body').hasClass('author-template')) {
			filter = "author:" + $('body').attr('data-author');
		};

		// Fetch posts
		$.get(ghost.url.api('posts', {limit: "all", filter: filter})).done(function (data){

			allPosts = data.posts;
			countAllPosts = data.posts.length;
			maxPages = countAllPosts;

			// Create pagination number
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
			}else if($('body').hasClass('subscribe') || $('body').hasClass('page-template') || $('.error-content').length){
				return;
			};

			// Load new posts
			if (firstPostIndex == 1) {
				for (var i = 0; i <= 1; i++) {
					loadNextPost(maxPages, nextPage, allPosts, swiperPosts);
					loadPrevPost(maxPages, prevPage, allPosts, swiperPosts);
				};
			}else{
				loadNextPost(maxPages, nextPage, allPosts, swiperPosts);
				loadPrevPost(maxPages, prevPage, allPosts, swiperPosts);
			};

			// On slide change load new posts
			swiperPosts.on('slideChange', function(event) {
				$('.loop .swiper-slide.first').removeClass('first').addClass('loaded');
				activeSlide = swiperPosts.activeIndex;
				if (activeSlide == 1) {
					setTimeout(function() {
						loadPrevPost(maxPages, prevPage, allPosts, swiperPosts);
					}, 300);
				};

				if (activeSlide >= (swiperPosts.slides.length - 2)) {
					loadNextPost( maxPages, nextPage, allPosts, swiperPosts);
				};
			});

		});

	});

	// Make arrows sticky
    if (w < 768){
        $(".next, .prev").stick_in_parent({
			offset_top: 100,
		}).on("sticky_kit:bottom", function(e) {
	    	$('.next').addClass('bottom');
	  	}).on("sticky_kit:unbottom", function(e) {
	    	$('.next').removeClass('bottom');
	  	});
    }else{
        $(".next, .prev").stick_in_parent({
			offset_top: 225,
		});
    }

    // Initialize ghostHunter - A Ghost blog search engine
    var searchField = $("#search-field").ghostHunter({
        results             : "#results",
        onKeyUp             : true,
        zeroResultsInfo     : true,
        displaySearchInfo   : false,
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

	// Execute on resize
    $(window).on('resize', function(event) {
        w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

        if (w < 768){
        	$(".next, .prev").trigger("sticky_kit:detach");
            $(".next, .prev").stick_in_parent({
				offset_top: 100,
			}).on("sticky_kit:bottom", function(e) {
		    	$('.next').addClass('bottom');
		  	}).on("sticky_kit:unbottom", function(e) {
		    	$('.next').removeClass('bottom');
		  	});
        }else{
        	$(".next, .prev").trigger("sticky_kit:detach");
            $(".next, .prev").stick_in_parent({
				offset_top: 225,
			});
        }

        setTimeout(function() {
			$('.swiper-wrapper').height($('.swiper-slide-active').height());
		}, 300);

    });

    // On back/forward click change slide
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

	// Wrap image in a span element
    function imageInDiv(){
    	$('.swiper-slide:not(.swiper-slide-active) .article-container .post-content img').each(function(index, el) {
    		var parent = $(this).parent();
    		if (!parent.hasClass('img-holder') && !parent.parent().hasClass('img-holder')) {
    			parent.addClass('img-holder');
    			parent.append('<span></span>');
    			$(this).appendTo(parent.find('span'));
    		};
    	});
    }

	function prettyDate(date) {
		var d = new Date(date);
		var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
			return d.getDate() + ' ' + monthNames[d.getMonth()] + ' ' + d.getFullYear();
	};

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
				$('header .btns a .counter').addClass('shake');
				setTimeout(function() {
					$('header .btns a .counter').removeClass('shake');
				}, 300);
				Cookies.set('zvikov-read-later', readLaterPosts, { expires: 365 });
				bookmarks(readLaterPosts);
			});
		});

		return readLaterPosts;

	}

	function bookmarks(readLaterPosts){

		$('.bookmark-container').empty();
		if (readLaterPosts.length) {
			$('header .counter').removeClass('hidden').text(readLaterPosts.length);
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
			$('header .counter').addClass('hidden');
			$('.bookmark-container').append('<p class="no-bookmarks">You haven\'t yet saved any bookmarks. To bookmark a post, just click <i class="circle"></i>.</p>')
		};

	}

	function loadNextPost(maxPages, nextPage, allPosts, swiperPosts){
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
	    	readingTime(content.find('#content .loop .swiper-slide'));

        	content.find('#content .loop .swiper-slide').addClass('loaded').removeClass('first');
            swiperPosts.appendSlide(content.find('#content .loop .swiper-slide'));
	    	imageInDiv();

	    	if (!$('.loop .next a, .loop .prev a').hasClass('active')) {
	    		$('.loop .next a, .loop .prev a').addClass('active');
	    	};

			readLaterPosts = readLater($('.loop .swiper-slide:last-child'), readLaterPosts);

        });

	}

	function loadPrevPost(maxPages, prevPage, allPosts, swiperPosts){
		if (currentPagePrev < 1) {
			return;
		};
		currentPagePrev--;

		if ($('body').hasClass('paged')) {
			pathname = '/';
		}else if($('body').hasClass('home-template') || $('body').hasClass('author-template') || $('body').hasClass('tag-template')){
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
	    	readingTime(content.find('#content .loop .swiper-slide'));

            content.find('#content .loop .swiper-slide').addClass('loaded').removeClass('first');
            swiperPosts.prependSlide($(content).find('#content .loop .swiper-slide'));
	    	imageInDiv();

	    	if (!$('.loop .next a, .loop .prev a').hasClass('active')) {
	    		$('.loop .next a, .loop .prev a').addClass('active');
	    	};

	    	readLaterPosts = readLater($('.loop .swiper-slide:first-child'), readLaterPosts);

        });

	}

	function readingTime(content){
		var readingTime = content.find('.reading-time');
		if (readingTime.length) {
			if (readingTime.text() == '< 1 min read') {
				readingTime.text('<1m');
			}else{
				readingTime.text(parseInt(readingTime.text()) + 'm');
			};
			readingTime.removeClass('d-none');
		};
	}

});