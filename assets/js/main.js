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

    // var countAllPosts = $('.count-all-posts').text();

    hoverTitle();

    function hoverTitle(){
	    $('.cloned-content .post-title').on('mouseover', function(event) {
	    	$(this).parent().addClass('active');
	    }).on('mouseleave', function(event) {
	    	$(this).parent().removeClass('active');
	    });
    }

	$(window).on('load', function(event) {

		var swiperPosts = new Swiper('#content .loop .swiper-container', {
			slidesPerView: 1,
			spaceBetween: 30,
			centeredSlides: true,
			autoHeight: true,
			simulateTouch: false,
			navigation: {
		        nextEl: '#content .loop .next a',
		        prevEl: '#content .loop .prev a',
	      	},
	      	// history: {
		      //   key: '',
	      	// },
		});

		$('#content .loop .swiper-slide').addClass('first');

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
		var firstPostId = $('.article-container').attr('data-id');
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
				if (val.comment_id == firstPostId) {
					firstPostIndex = index+1;
					$('.pagination-number').append('<b>'+ firstPostIndex +'</b>/' + countAllPosts);
				};
			});

			if ($('body').hasClass('post-template')) {
				$.each(allPosts, function(index, val) {
					if (val.comment_id == $('.loop .swiper-slide:last-child .article-container').attr('data-id')) {
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
				if (swiperPosts.activeIndex > (swiperPosts.slides.length - 2)) {
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
				$.each(allPosts, function(index, val) {
					if (val.comment_id == $('.loop .swiper-slide:last-child .article-container').attr('data-id')) {
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
			};
        	prevPage = pathname + 'page/' + currentPagePrev + '/';

			if ($('body').hasClass('post-template')) {
				$.each(allPosts, function(index, val) {
					if (val.comment_id == $('.loop .swiper-slide:first-child .article-container').attr('data-id')) {
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

		    	if (!$('.loop .next a, .loop .prev a').hasClass('active')) {
		    		$('.loop .next a, .loop .prev a').addClass('active');
		    	};

		    	readLaterPosts = readLater($('.loop .swiper-slide:first-child'), readLaterPosts);

	        });

		}

		if (window.history && window.history.pushState) {
			$(window).on('popstate', function() {
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

	$(".next, .prev").stick_in_parent({
		offset_top: 225,
	});

	var readLaterPosts = [];

	function readLater(content, readLaterPosts){

		$(content).find('.read-later').each(function(index, el) {
			$(this).on('click', function(event) {
				event.preventDefault();
				var id = $(this).closest('.article-container').attr('data-id');
				console.log(id);
				if ($(this).hasClass('active')) {
					removeValue(readLaterPosts, id);
				}else{
					readLaterPosts.push(id);
				};
				$(this).toggleClass('active');
				Cookies.set('zvikov-read-later', readLaterPosts);
			});
		});
		
		if (typeof Cookies.get('zvikov-read-later') !== "undefined") {
			readLaterPosts = JSON.parse(Cookies.get('zvikov-read-later'));
			$.each(readLaterPosts, function(index, val) {
				$('.loop .swiper-slide .article-container[data-id="'+ val +'"] .read-later').addClass('active');
			});
		}

		return readLaterPosts;

	}

	readLaterPosts = readLater($('#content .loop .swiper-slide'), readLaterPosts);

	console.log(readLaterPosts);

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