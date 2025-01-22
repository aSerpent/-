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
        nav.style.background = 'rgba(255, 255, 255, 0.9)';
    } else {
        nav.style.background = 'rgba(255, 255, 255, 0.8)';
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
}); 