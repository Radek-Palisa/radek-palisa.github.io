$(document).ready(function() {

	$(function() {
	  $('a[href*="#"]:not([href="#"])').click(function() {
	    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
	      var target = $(this.hash);
	      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
	      if (target.length) {
	        $('html, body').animate({
	          scrollTop: target.offset().top
	        }, 800);
	        return false;
	      }
	    }
	  });
	});

	/*
	//
	// --- Responsive Nav ---
	//
	var $menuButton = $('.menu-icon button');
	$menuButton.on('click', function() {
		$(this).toggleClass('menu-icon--activated');
		$('.nav__ul').toggleClass('nav__ul--activated');
	});
	*/

}); // .ready end






