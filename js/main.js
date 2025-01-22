// 主题切换
const themeSwitch = document.querySelector('.theme-switch-button');
let isDark = false;

themeSwitch.addEventListener('click', () => {
    isDark = !isDark;
    document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
});

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// 添加滚动时的导航栏效果
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.nav-bar');
    if (window.scrollY > 50) {
        nav.style.background = isDark ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)';
    } else {
        nav.style.background = isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)';
    }
});

// 添加页面加载动画
document.addEventListener('DOMContentLoaded', () => {
    const hero = document.querySelector('.hero-content');
    hero.style.opacity = '0';
    setTimeout(() => {
        hero.style.transition = 'opacity 1s ease-in-out';
        hero.style.opacity = '1';
    }, 100);

    // 初始化技能进度条
    const skills = document.querySelectorAll('.skill-progress');
    skills.forEach(skill => {
        const progress = skill.getAttribute('data-progress');
        setTimeout(() => {
            skill.style.width = `${progress}%`;
        }, 500);
    });
});

// 3D倾斜效果
VanillaTilt.init(document.querySelectorAll("[data-tilt]"), {
    max: 15,
    speed: 400,
    glare: true,
    "max-glare": 0.2,
});

// 粒子效果配置
particlesJS("particles-js", {
    particles: {
        number: {
            value: 80,
            density: {
                enable: true,
                value_area: 800
            }
        },
        color: {
            value: "#0071e3"
        },
        shape: {
            type: "circle"
        },
        opacity: {
            value: 0.5,
            random: false
        },
        size: {
            value: 3,
            random: true
        },
        line_linked: {
            enable: true,
            distance: 150,
            color: "#0071e3",
            opacity: 0.4,
            width: 1
        },
        move: {
            enable: true,
            speed: 6,
            direction: "none",
            random: false,
            straight: false,
            out_mode: "out",
            bounce: false
        }
    },
    interactivity: {
        detect_on: "canvas",
        events: {
            onhover: {
                enable: true,
                mode: "repulse"
            },
            onclick: {
                enable: true,
                mode: "push"
            },
            resize: true
        }
    },
    retina_detect: true
});

// 文字渐显效果
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal-text').forEach(el => observer.observe(el));

// 交互文字效果
document.querySelectorAll('.interactive-text').forEach(text => {
    text.addEventListener('mouseover', () => {
        text.style.transform = 'scale(1.1)';
        text.style.transition = 'transform 0.3s ease';
    });

    text.addEventListener('mouseout', () => {
        text.style.transform = 'scale(1)';
    });
}); 