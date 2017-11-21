/**
 * Main JS file for Haihara
 */

jQuery(document).ready(function($) {

    var config = {
        'share-selected-text': true,
    };

    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

	$(window).on('load', function(event) {
		
		var swiperPosts = new Swiper('#content .loop .swiper-container', {
			slidesPerView: 1,
			spaceBetween: 30,
			centeredSlides: true,
			autoHeight: true,
			// simulateTouch: false
		});

		var currentPage = 1;
		var pathname = window.location.pathname;
		var $result = $('#content .loop .swiper-wrapper');

		pathname = pathname.replace(/#(.*)$/g, '').replace('/\//g', '/');

		var nextPage = pathname + 'page/' + currentPage + '/';

        loadNextPost( maxPages, nextPage);

		swiperPosts.on('slideChange', function(event) {
			console.log(swiperPosts.slides.length);
			if (swiperPosts.activeIndex < (swiperPosts.slides.length-1)) {
				loadNextPost( maxPages, nextPage);
			};
		});			

		function loadNextPost(maxPages, nextPage){
			if (currentPage == maxPages) {
				return;
			};

			currentPage++;

        	nextPage = pathname + 'page/' + currentPage + '/';

	        $.get(nextPage, function (content) {
	            $result.append($(content).find('#content .loop .swiper-slide'));
	            swiperPosts.update(true);
	        });
		}

	});



});