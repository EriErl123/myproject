$(document).ready(function () {
  // Theme Toggle Functionality
  const themeToggle = $("#themeToggle");
  const body = $("body");
  const themeIcon = themeToggle.find("i");
  
  // Check for saved theme preference (default to dark)
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    body.removeClass("dark-theme");
    themeIcon.removeClass("fa-sun").addClass("fa-moon");
  } else {
    body.addClass("dark-theme");
    themeIcon.removeClass("fa-moon").addClass("fa-sun");
  }
  
  themeToggle.click(function () {
    body.toggleClass("dark-theme");
    if (body.hasClass("dark-theme")) {
      themeIcon.removeClass("fa-moon").addClass("fa-sun");
      localStorage.setItem("theme", "dark");
    } else {
      themeIcon.removeClass("fa-sun").addClass("fa-moon");
      localStorage.setItem("theme", "light");
    }
  });

  // Scroll down sticky navbar script start
  function handleScrollEffects() {
    if (window.scrollY > 20) {
      $(".navbar").addClass("sticky");
    } else {
      $(".navbar").removeClass("sticky");
    }
     
    if (window.scrollY > 500) {
      $(".scroll-up-btn").addClass("show");
    } else {
      $(".scroll-up-btn").removeClass("show");
    }
    
    $(".fadein").each(function () {
      var bottom_of_element = $(this).offset().top + $(this).outerHeight();
      var bottom_of_window = $(window).scrollTop() + $(window).height() + 120;

      if (bottom_of_window > bottom_of_element) {
        $(this).addClass("showme");
      }
      if (bottom_of_window < bottom_of_element) {
        $(this).removeClass("showme");
      }
    });

    // Animate skill bars on scroll
    $(".skill-box").each(function() {
      var bottom_of_element = $(this).offset().top + $(this).outerHeight();
      var bottom_of_window = $(window).scrollTop() + $(window).height();
      
      if (bottom_of_window > bottom_of_element && !$(this).hasClass("animated")) {
        $(this).addClass("animated");
        var progress = $(this).find(".skill-progress").data("progress");
        $(this).find(".skill-progress").css("width", progress + "%");
      }
    });
  }

  $(window).scroll(handleScrollEffects);
  handleScrollEffects();

  // Subtle tilt interaction for hero cards
  $(".home-content, .terminal-card").on("mousemove", function (e) {
    const $card = $(this);
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -6;
    const rotateY = ((x / rect.width) - 0.5) * 6;

    $card.css("transform", `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
  });

  $(".home-content, .terminal-card").on("mouseleave", function () {
    $(this).css("transform", "perspective(900px) rotateX(0deg) rotateY(0deg)");
  });

  
  $(".scroll-up-btn").click(function () {
    $("html").animate({ scrollTop: 0 });
  });
  
  var typed = new Typed(".typing", {
    strings: ["Web Developer", "Frontend Engineer", "UI Builder", "IT Student"],
    typeSpeed: 100,
    backSpeed: 60,
    loop: true,
  });

  var typed = new Typed(".typing2", {
    strings: ["Web Developer", "Interface Engineer", "Creative Technologist", "Continuous Learner"],
    typeSpeed: 100,
    backSpeed: 60,
    loop: true,
  });

  // Dynamic footer year
  $("#currentYear").text(new Date().getFullYear());

  // Creative mode switcher
  const modeButtons = $(".mode-btn");
  const modeLabel = $("#modeLabel");

  function applyVisualMode(mode) {
    $("body").removeClass("mode-neon mode-mono");

    if (mode === "neon") {
      $("body").addClass("mode-neon");
      modeLabel.text("Neon Grid");
    } else if (mode === "mono") {
      $("body").addClass("mode-mono");
      modeLabel.text("Mono Elite");
    } else {
      modeLabel.text("Cosmos");
    }

    localStorage.setItem("visualMode", mode);
  }

  const savedVisualMode = localStorage.getItem("visualMode") || "cosmos";
  applyVisualMode(savedVisualMode);
  modeButtons.removeClass("active");
  $(`.mode-btn[data-mode='${savedVisualMode}']`).addClass("active");

  modeButtons.click(function () {
    const mode = $(this).data("mode");
    modeButtons.removeClass("active");
    $(this).addClass("active");
    applyVisualMode(mode);
  });

  // Manifesto generator
  const manifestoLines = [
    "I design web experiences like game levels: intuitive flow, surprising moments, and a rewarding finish.",
    "My code style is cinematic minimalism: less noise, more impact, always responsive.",
    "I treat every interface as a conversation between logic, emotion, and speed.",
    "I build products that feel alive: elegant systems, fast performance, and memorable interaction.",
    "I turn complex requirements into frictionless journeys users can trust instantly."
  ];

  $("#manifestoBtn").click(function () {
    const randomLine = manifestoLines[Math.floor(Math.random() * manifestoLines.length)];
    const manifestoText = $("#manifestoText");
    manifestoText.fadeOut(120, function () {
      manifestoText.text(randomLine).fadeIn(220);
    });
  });

  // Signal pulse behavior
  $("#signalBtn").click(function () {
    const wave = $("#signalWave");
    wave.toggleClass("boosted");
    const button = $(this);
    button.text(wave.hasClass("boosted") ? "Stabilize Signal" : "Shift Creative Mode");
  });

  
  $(".menu-toggle").click(function () {
    $(".navbar .menu").toggleClass("active");
    $(".menu-toggle i").toggleClass("active");
  });

  // Close mobile menu when clicking on a menu item
  $(".navbar .menu li a").click(function() {
    $(".navbar .menu").removeClass("active");
    $(".menu-toggle i").removeClass("active");
  });
  
  $(".carousel").owlCarousel({
    margin: 20,
    loop: true,
    autoplayTimeout: 2500,
    autoplayHoverPause: true,
    responsive: {
      0: {
        items: 1,
        nav: false,
      },
      600: {
        items: 2,
        nav: false,
      },
      1000: {
        items: 3,
        nav: false,
      },
    },
  });

  // Contact Form Submission with EmailJS
  $("#contactForm").submit(function(e) {
    e.preventDefault();
    
    const submitBtn = $("#submitBtn");
    const btnText = submitBtn.find(".btn-text");
    const formMessage = $("#formMessage");
    
    // Get form values
    const userName = $("#userName").val();
    const userEmail = $("#userEmail").val();
    const subject = $("#subject").val();
    const message = $("#message").val();
    
    // Basic validation
    if (!userName || !userEmail || !subject || !message) {
      formMessage.removeClass("success").addClass("error");
      formMessage.text("Please fill in all fields.");
      return;
    }
    
    // Disable button and show loading state
    submitBtn.prop("disabled", true);
    btnText.text("Sending...");
    formMessage.hide().removeClass("success error");
    
    // Simulate form submission (replace with actual EmailJS implementation)
    setTimeout(function() {
      // Success
      formMessage.removeClass("error").addClass("success");
      formMessage.text("Message sent successfully! I'll get back to you soon.");
      
      // Reset form
      $("#contactForm")[0].reset();
      
      // Re-enable button
      submitBtn.prop("disabled", false);
      btnText.text("Send Message");
      
      // Hide message after 5 seconds
      setTimeout(function() {
        formMessage.fadeOut();
      }, 5000);
    }, 2000);
    
    /* 
    // Uncomment and configure this for actual EmailJS integration:
    emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
      from_name: userName,
      from_email: userEmail,
      subject: subject,
      message: message
    }).then(function(response) {
      formMessage.removeClass("error").addClass("success");
      formMessage.text("Message sent successfully! I'll get back to you soon.");
      $("#contactForm")[0].reset();
      submitBtn.prop("disabled", false);
      btnText.text("Send Message");
      setTimeout(function() {
        formMessage.fadeOut();
      }, 5000);
    }, function(error) {
      formMessage.removeClass("success").addClass("error");
      formMessage.text("Failed to send message. Please try again.");
      submitBtn.prop("disabled", false);
      btnText.text("Send Message");
    });
    */
  });
  
});
