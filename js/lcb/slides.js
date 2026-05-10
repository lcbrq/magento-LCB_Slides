document.observe('dom:loaded', function () {
    var sliderElements = $$('.lcb-slider');

    sliderElements.each(function (sliderElement) {
        initializeSlider(sliderElement);
    });

    function initializeSlider(sliderElement) {
        var slideElements = sliderElement.select('.slide');
        var dotElements = sliderElement.select('.dot');
        var activeSlideIndex = 0;
        var autoplayIntervalId = null;
        var autoplayDelay = parseInt(sliderElement.readAttribute('data-transition-time'), 10) || 4000;

        if (!slideElements.length) {
            return;
        }

        function setActiveSlide(slideIndex) {
            activeSlideIndex = slideIndex;

            slideElements.each(function (slideElement) {
                slideElement.removeClassName('is-active');
            });

            dotElements.each(function (dotElement) {
                dotElement.removeClassName('is-active');
            });

            if (slideElements[activeSlideIndex]) {
                slideElements[activeSlideIndex].addClassName('is-active');
            }

            if (dotElements[activeSlideIndex]) {
                dotElements[activeSlideIndex].addClassName('is-active');
            }
        }

        function showNextSlide() {
            var nextSlideIndex = activeSlideIndex + 1;

            if (nextSlideIndex >= slideElements.length) {
                nextSlideIndex = 0;
            }

            setActiveSlide(nextSlideIndex);
        }

        function stopAutoplay() {
            if (autoplayIntervalId !== null) {
                window.clearInterval(autoplayIntervalId);
                autoplayIntervalId = null;
            }
        }

        function startAutoplay() {
            stopAutoplay();

            if (slideElements.length <= 1) {
                return;
            }

            autoplayIntervalId = window.setInterval(function () {
                showNextSlide();
            }, autoplayDelay);
        }

        dotElements.each(function (dotElement) {
            dotElement.observe('click', function (event) {
                var selectedSlideIndex;

                event.stop();

                selectedSlideIndex = parseInt(dotElement.readAttribute('data-slide-index'), 10);

                if (isNaN(selectedSlideIndex)) {
                    return;
                }

                setActiveSlide(selectedSlideIndex);
                startAutoplay();
            });
        });

        setActiveSlide(0);
        startAutoplay();
    }
});