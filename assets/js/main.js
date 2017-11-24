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

    var countAllPosts = $('.count-all-posts').text();
    var ccc = 0;

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
	      	history: {
		        key: '',
	      	},
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
			$('.pagination-number b').text(currentPageNext);
		};

        for (var i = 0; i <= 1; i++) {
    		loadNextPost(maxPages, nextPage);
    		loadPrevPost(maxPages, prevPage);
        };

		swiperPosts.on('slideChange', function(event) {
			activeSlide = swiperPosts.activeIndex;
			if (swiperPosts.activeIndex > (swiperPosts.slides.length - 3)) {
				loadNextPost( maxPages, nextPage);
			}else if(swiperPosts.activeIndex < (swiperPosts.slides.length + 3)){
				loadPrevPost( maxPages, prevPage);
			};
		});			

		function loadNextPost(maxPages, nextPage){
			if (currentPageNext == maxPages) {
				return;
			};

			currentPageNext++;

			if ($('body').hasClass('paged')) {
				pathname = '/';
			};
        	nextPage = pathname + 'page/' + currentPageNext + '/';

	        $.get(nextPage, function (content) {
	        	var postIndex = parseInt(nextPage.replace(/[^0-9]/gi, ''));
	        	var content = $(content);
	        	content.find('.pagination-number b').text(postIndex);
	            swiperPosts.appendSlide(content.find('#content .loop .swiper-slide'));
		    	hoverTitle();
	        });

		}

		function loadPrevPost(maxPages, prevPage){
			if (currentPagePrev == 1) {
				return;
			};

			currentPagePrev--;

			if ($('body').hasClass('paged')) {
				pathname = '/';
			};
        	prevPage = pathname + 'page/' + currentPagePrev + '/';

	        $.get(prevPage, function (content) {
	        	var postIndex = parseInt(prevPage.replace(/[^0-9]/gi, ''));
	        	var content = $(content);
	        	content.find('.pagination-number b').text(postIndex);
	            swiperPosts.prependSlide($(content).find('#content .loop .swiper-slide'));
		    	hoverTitle();
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